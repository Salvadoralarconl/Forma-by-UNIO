use std::fs::{self, File};
use std::io::{self, Read, Write};
use std::path::Path;

pub const MAX_ARCHIVE: usize = 64 * 1024 * 1024;
pub const MAX_RECOVERY: usize = 100 * 1024 * 1024;

pub fn read_bounded(path: &Path, limit: usize) -> io::Result<Vec<u8>> {
    let file = File::open(path)?;
    if file.metadata()?.len() > limit as u64 {
        return Err(io::Error::new(io::ErrorKind::InvalidData, "File exceeds the supported size limit"));
    }
    let mut data = Vec::new();
    file.take(limit as u64 + 1).read_to_end(&mut data)?;
    if data.len() > limit { return Err(io::Error::new(io::ErrorKind::InvalidData, "File grew past the supported size limit")); }
    Ok(data)
}

/// NamedTempFile::persist atomically replaces an existing file on Windows and Unix.
/// Failure to create, write, flush, sync, or persist never truncates the destination.
pub fn atomic_write(path: &Path, bytes: &[u8], limit: usize) -> io::Result<()> {
    if bytes.len() > limit { return Err(io::Error::new(io::ErrorKind::InvalidData, "Save exceeds the supported size limit")); }
    let parent = path.parent().ok_or_else(|| io::Error::new(io::ErrorKind::InvalidInput, "Missing save directory"))?;
    let mut temporary = tempfile::NamedTempFile::new_in(parent)?;
    temporary.write_all(bytes)?;
    temporary.flush()?;
    temporary.as_file().sync_all()?;
    temporary.persist(path).map_err(|error| error.error)?;
    Ok(())
}

pub fn recovery_path(app_data: &Path) -> io::Result<std::path::PathBuf> {
    fs::create_dir_all(app_data)?;
    Ok(app_data.join("recovery-v1.json"))
}

#[cfg(test)]
mod tests {
    use super::*;
    #[test]
    fn replaces_existing_project_in_unicode_directory() {
        let root = tempfile::tempdir().unwrap();
        let dir = root.path().join("Café studio"); fs::create_dir(&dir).unwrap();
        let path = dir.join("Niño.forma");
        atomic_write(&path, b"first project", 100).unwrap();
        atomic_write(&path, b"replacement", 100).unwrap();
        assert_eq!(read_bounded(&path, 100).unwrap(), b"replacement");
        assert_eq!(fs::read_dir(&dir).unwrap().count(), 1);
    }
    #[test]
    fn failed_save_preserves_previous_valid_bytes() {
        let dir = tempfile::tempdir().unwrap(); let path = dir.path().join("valid.forma");
        fs::write(&path, b"last valid project").unwrap();
        assert!(atomic_write(&path, b"too large", 2).is_err());
        assert_eq!(fs::read(&path).unwrap(), b"last valid project");
        assert!(atomic_write(&dir.path().join("missing/valid.forma"), b"x", 100).is_err());
        assert_eq!(fs::read(&path).unwrap(), b"last valid project");
    }
    #[test]
    fn refuses_oversized_reads() {
        let dir = tempfile::tempdir().unwrap(); let path = dir.path().join("large.forma");
        fs::write(&path, [0; 16]).unwrap();
        assert_eq!(read_bounded(&path, 10).unwrap_err().kind(), io::ErrorKind::InvalidData);
    }
    #[cfg(windows)]
    #[test]
    fn replacement_failure_preserves_existing_destination_and_cleans_temporary_file() {
        use std::os::windows::fs::OpenOptionsExt;
        let dir = tempfile::tempdir().unwrap();
        let path = dir.path().join("locked destination.forma");
        fs::write(&path, b"last valid project").unwrap();
        // Allow reads but deny deletion/replacement while this handle remains open.
        let held = std::fs::OpenOptions::new().read(true).share_mode(1).open(&path).unwrap();
        let result = atomic_write(&path, b"replacement must not truncate original", 100);
        assert!(result.is_err(), "Replacement of a destination without delete sharing must fail");
        assert_eq!(fs::read(&path).unwrap(), b"last valid project");
        assert_eq!(fs::read_dir(dir.path()).unwrap().count(), 1, "Failed replacement must clean its temporary file");
        drop(held);
        atomic_write(&path, b"successful replacement after unlock", 100).unwrap();
        assert_eq!(fs::read(&path).unwrap(), b"successful replacement after unlock");
    }
}
