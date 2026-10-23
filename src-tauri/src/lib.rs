mod storage;
use serde::Serialize;
use std::collections::HashSet;
use std::path::PathBuf;
use std::sync::Mutex;
use tauri::{AppHandle, Manager, State};
use tauri_plugin_dialog::DialogExt;

#[derive(Default)]
struct AuthorizedPaths(Mutex<HashSet<PathBuf>>);
#[derive(Serialize)]
struct OpenedProject { path: String, data: Vec<u8> }

fn authorize(app: &AppHandle, path: PathBuf) -> Result<(), String> {
    app.state::<AuthorizedPaths>().0.lock().map_err(|_| "Project authorization lock failed")?.insert(path);
    Ok(())
}
fn require_forma(path: &std::path::Path) -> Result<(), String> {
    if path.extension().and_then(|s| s.to_str()).map(|s| s.eq_ignore_ascii_case("forma")) != Some(true) {
        return Err("Choose a .forma project file.".into());
    }
    Ok(())
}

#[tauri::command]
async fn open_forma(app: AppHandle) -> Result<Option<OpenedProject>, String> {
    tauri::async_runtime::spawn_blocking(move || {
        let chosen = app.dialog().file().add_filter("Forma project", &["forma"]).blocking_pick_file();
        let Some(chosen) = chosen else { return Ok(None); };
        let path = chosen.into_path().map_err(|e| e.to_string())?;
        require_forma(&path)?;
        let data = storage::read_bounded(&path, storage::MAX_ARCHIVE).map_err(|e| format!("Could not open project: {e}"))?;
        authorize(&app, path.clone())?;
        Ok(Some(OpenedProject { path: path.to_string_lossy().into_owned(), data }))
    }).await.map_err(|e| e.to_string())?
}

#[tauri::command]
async fn save_forma(app: AppHandle, state: State<'_, AuthorizedPaths>, data: Vec<u8>, path: Option<String>, save_as: bool) -> Result<Option<String>, String> {
    if data.len() > storage::MAX_ARCHIVE || !data.starts_with(b"PK\x03\x04") { return Err("Invalid or oversized Forma archive".into()); }
    let requested = path.map(PathBuf::from);
    let authorized = requested.as_ref().map(|p| state.0.lock().map(|s| s.contains(p)).unwrap_or(false)).unwrap_or(false);
    tauri::async_runtime::spawn_blocking(move || {
        let target = if !save_as && authorized { requested.unwrap() } else {
            let chosen = app.dialog().file().add_filter("Forma project", &["forma"]).set_file_name("Untitled.forma").blocking_save_file();
            let Some(chosen) = chosen else { return Ok(None); };
            let mut path = chosen.into_path().map_err(|e| e.to_string())?;
            if path.extension().is_none() { path.set_extension("forma"); }
            path
        };
        require_forma(&target)?;
        storage::atomic_write(&target, &data, storage::MAX_ARCHIVE).map_err(|e| format!("Save failed; previous file was preserved: {e}"))?;
        authorize(&app, target.clone())?;
        Ok(Some(target.to_string_lossy().into_owned()))
    }).await.map_err(|e| e.to_string())?
}

#[tauri::command]
async fn save_website(app:AppHandle,data:Vec<u8>)->Result<Option<String>,String>{
    if data.len()>storage::MAX_ARCHIVE||!data.starts_with(b"PK\x03\x04"){return Err("Invalid or oversized website ZIP".into());}
    tauri::async_runtime::spawn_blocking(move||{
        let chosen=app.dialog().file().add_filter("Website ZIP", &["zip"]).set_file_name("Website.zip").blocking_save_file();
        let Some(chosen)=chosen else{return Ok(None);};
        let mut target=chosen.into_path().map_err(|e|e.to_string())?;
        if target.extension().is_none(){target.set_extension("zip");}
        if !target.is_absolute()||!target.extension().and_then(|s|s.to_str()).map(|s|s.eq_ignore_ascii_case("zip")).unwrap_or(false){return Err("Choose a ZIP file destination".into());}
        storage::atomic_write(&target,&data,storage::MAX_ARCHIVE).map_err(|e|format!("Export failed; previous file was preserved: {e}"))?;
        Ok(Some(target.to_string_lossy().into_owned()))
    }).await.map_err(|e|e.to_string())?
}

#[tauri::command]
async fn read_recovery(app: AppHandle) -> Result<Option<String>, String> {
    tauri::async_runtime::spawn_blocking(move || {
        let dir = app.path().app_local_data_dir().map_err(|e| e.to_string())?;
        let path = storage::recovery_path(&dir).map_err(|e| e.to_string())?;
        match storage::read_bounded(&path, storage::MAX_RECOVERY) {
            Ok(data) => String::from_utf8(data).map(Some).map_err(|e| e.to_string()),
            Err(error) if error.kind() == std::io::ErrorKind::NotFound => Ok(None),
            Err(error) => Err(error.to_string()),
        }
    }).await.map_err(|e| e.to_string())?
}
#[tauri::command]
async fn write_recovery(app: AppHandle, data: String) -> Result<(), String> {
    tauri::async_runtime::spawn_blocking(move || {
        let dir = app.path().app_local_data_dir().map_err(|e| e.to_string())?;
        let path = storage::recovery_path(&dir).map_err(|e| e.to_string())?;
        storage::atomic_write(&path, data.as_bytes(), storage::MAX_RECOVERY).map_err(|e| e.to_string())
    }).await.map_err(|e| e.to_string())?
}
#[tauri::command]
async fn clear_recovery(app: AppHandle) -> Result<(), String> {
    let dir = app.path().app_local_data_dir().map_err(|e| e.to_string())?;
    let path = storage::recovery_path(&dir).map_err(|e| e.to_string())?;
    match std::fs::remove_file(path) {
        Ok(()) => Ok(()),
        Err(error) if error.kind() == std::io::ErrorKind::NotFound => Ok(()),
        Err(error) => Err(error.to_string()),
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .manage(AuthorizedPaths::default())
        .invoke_handler(tauri::generate_handler![open_forma, save_forma,save_website, read_recovery, read_recovery_saved, write_recovery, clear_recovery])
        .run(tauri::generate_context!())
        .expect("UNIO Forma could not start");
}

// Read only the saved project identified by Forma's own local recovery metadata.
// This does not grant write authorization: recovered projects use Save As on first save.
#[tauri::command]
async fn read_recovery_saved(app: AppHandle) -> Result<Option<Vec<u8>>, String> {
    tauri::async_runtime::spawn_blocking(move || {
        let dir = app.path().app_local_data_dir().map_err(|e| e.to_string())?;
        let recovery = storage::recovery_path(&dir).map_err(|e| e.to_string())?;
        let metadata = match storage::read_bounded(&recovery, storage::MAX_RECOVERY) {
            Ok(data) => data,
            Err(error) if error.kind() == std::io::ErrorKind::NotFound => return Ok(None),
            Err(error) => return Err(error.to_string()),
        };
        let value: serde_json::Value = serde_json::from_slice(&metadata).map_err(|e| e.to_string())?;
        let Some(source) = value.get("sourcePath").and_then(|v| v.as_str()) else { return Ok(None); };
        let path = PathBuf::from(source);
        if !path.is_absolute() || require_forma(&path).is_err() { return Ok(None); }
        match storage::read_bounded(&path, storage::MAX_ARCHIVE) {
            Ok(data) => Ok(Some(data)),
            Err(_) => Ok(None), // A missing/unavailable original must never hide recoverable work.
        }
    }).await.map_err(|e| e.to_string())?
}

