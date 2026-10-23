import { invoke, isTauri } from '@tauri-apps/api/core';
import { type Project, validateProject } from '../domain/model';
import { bytesToBase64, base64ToBytes, encodeProject, decodeProject, MAX_ARCHIVE } from './archive';
import type { RecoverySnapshot } from './recovery';

export interface Platform {
  native: boolean;
  open(): Promise<{ project: Project; path: string } | null>;
  save(project: Project, path: string | null, saveAs?: boolean): Promise<string | null>;
  readRecovery(): Promise<RecoverySnapshot | null>;
  readSavedForRecovery(): Promise<Project | null>;
  writeRecovery(snapshot: RecoverySnapshot): Promise<void>;
  clearRecovery(): Promise<void>;
}

function serializeRecovery(snapshot: RecoverySnapshot): string {
  return JSON.stringify({ version: 1, capturedAt: snapshot.capturedAt, sourcePath: snapshot.sourcePath,
    archive: bytesToBase64(encodeProject(snapshot.project)) });
}
function parseRecovery(raw: string): RecoverySnapshot {
  if (raw.length > 100 * 1024 * 1024) throw new Error('Recovery snapshot is too large.');
  const value = JSON.parse(raw);
  if (value.version !== 1 || typeof value.archive !== 'string' || typeof value.capturedAt !== 'string' || !Number.isFinite(Date.parse(value.capturedAt)) ||
    !(value.sourcePath === null || typeof value.sourcePath === 'string' && value.sourcePath.length < 4096)) throw new Error('Invalid recovery metadata.');
  return { project: decodeProject(base64ToBytes(value.archive)), capturedAt: value.capturedAt, sourcePath: value.sourcePath };
}

async function dbRequest<T>(mode: IDBTransactionMode, action: (store: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  const db = await new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open('unio-forma', 1);
    request.onupgradeneeded = () => request.result.createObjectStore('workspace');
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
  return new Promise((resolve, reject) => {
    const tx = db.transaction('workspace', mode);
    const request = action(tx.objectStore('workspace'));
    tx.oncomplete = () => { db.close(); resolve(request.result); };
    tx.onerror = tx.onabort = () => { db.close(); reject(tx.error ?? new Error('Local recovery storage failed.')); };
  });
}

export function createPlatform(): Platform {
  if (isTauri()) return {
    native: true,
    async open() {
      const result = await invoke<{ path: string; data: number[] } | null>('open_forma');
      return result ? { path: result.path, project: decodeProject(new Uint8Array(result.data)) } : null;
    },
    async save(project, path, saveAs = false) {
      return invoke<string | null>('save_forma', { data: Array.from(encodeProject(project)), path, saveAs });
    },
    async readRecovery() {
      const raw = await invoke<string | null>('read_recovery');
      return raw ? parseRecovery(raw) : null;
    },
    async readSavedForRecovery() {
      const data = await invoke<number[] | null>('read_recovery_saved');
      return data ? decodeProject(new Uint8Array(data)) : null;
    },
    async writeRecovery(snapshot) { await invoke('write_recovery', { data: serializeRecovery(snapshot) }); },
    async clearRecovery() { await invoke('clear_recovery'); },
  };
  return {
    native: false,
    async open() {
      const file = await new Promise<File | null>(resolve => {
        const input = document.createElement('input'); input.type = 'file'; input.accept = '.forma';
        input.onchange = () => resolve(input.files?.[0] ?? null);
        input.oncancel = () => resolve(null); input.click();
      });
      if (!file) return null;
      if (file.size > MAX_ARCHIVE) throw new Error('Archive exceeds the 64 MB limit.');
      return { project: decodeProject(new Uint8Array(await file.arrayBuffer())), path: file.name };
    },
    async save(project) {
      const data = encodeProject(project);
      const filename = `${project.name.replace(/[<>:"/\\|?*\u0000-\u001f]/g, '_')}.forma`;
      const url = URL.createObjectURL(new Blob([new Uint8Array(data)], { type: 'application/zip' }));
      const link = document.createElement('a'); link.href = url; link.download = filename; link.click();
      setTimeout(() => URL.revokeObjectURL(url), 60_000);
      return filename;
    },
    async readRecovery() {
      const raw = await dbRequest<string | undefined>('readonly', s => s.get('recovery'));
      return raw ? parseRecovery(raw) : null;
    },
    async readSavedForRecovery() { return null; },
    async writeRecovery(snapshot) { validateProject(snapshot.project); await dbRequest('readwrite', s => s.put(serializeRecovery(snapshot), 'recovery')); },
    async clearRecovery() { await dbRequest('readwrite', s => s.delete('recovery')); },
  };
}

export async function saveWebsiteArchive(native:boolean,data:Uint8Array,name:string):Promise<string|null>{
 if(native)return invoke<string|null>('save_website',{data:Array.from(data)});
 const filename=`${name.replace(/[<>:"/\\|?*\u0000-\u001f]/g,'_')}-website.zip`,url=URL.createObjectURL(new Blob([new Uint8Array(data)],{type:'application/zip'}));const link=document.createElement('a');link.href=url;link.download=filename;link.click();setTimeout(()=>URL.revokeObjectURL(url),60000);return filename;
}
