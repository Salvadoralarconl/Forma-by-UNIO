import { unzipSync, zipSync, strFromU8, strToU8 } from 'fflate';
import { type Asset, type Project, assetSchema, validateProject } from '../domain/model';

export const MAX_ARCHIVE = 64 * 1024 * 1024;
export const MAX_ASSET = 10 * 1024 * 1024;
const MAX_JSON = 4 * 1024 * 1024;

export function bytesToBase64(bytes: Uint8Array): string {
  let result = '';
  for (let i = 0; i < bytes.length; i += 8192) result += String.fromCharCode(...bytes.subarray(i, i + 8192));
  return btoa(result);
}
export function base64ToBytes(data: string): Uint8Array {
  return Uint8Array.from(atob(data), c => c.charCodeAt(0));
}
export function verifyRaster(bytes: Uint8Array, mime: Asset['mime']) {
  const hex = Array.from(bytes.subarray(0, 12), b => b.toString(16).padStart(2, '0')).join('');
  const valid = mime === 'image/png' ? hex.startsWith('89504e470d0a1a0a')
    : mime === 'image/jpeg' ? hex.startsWith('ffd8ff')
    : mime === 'image/gif' ? hex.startsWith('474946383761') || hex.startsWith('474946383961')
    : hex.startsWith('52494646') && hex.slice(16, 24) === '57454250';
  if (!valid) throw new Error('Image content is not a supported raster image. Use PNG, JPEG, WebP or GIF.');
  if (bytes.length > MAX_ASSET) throw new Error('Each image must be 10 MB or smaller.');
}

export function encodeProject(input: Project): Uint8Array {
  const p = validateProject(input);
  const files: Record<string, Uint8Array> = {};
  const manifest: Record<string, Omit<Asset, 'data'> & { path: string }> = {};
  let total = 0;
  for (const asset of Object.values(p.assets)) {
    const bytes = base64ToBytes(asset.data); verifyRaster(bytes, asset.mime);
    const { data: _, ...meta } = asset;
    const path = `assets/${asset.id}.bin`;
    files[path] = bytes; manifest[asset.id] = { ...meta, path };
    total += bytes.length;
  }
  const json = strToU8(JSON.stringify({ ...p, assets: manifest }));
  if (json.length > MAX_JSON || total + json.length > MAX_ARCHIVE) throw new Error('Project exceeds the archive size limit.');
  files['project.json'] = json;
  const archive = zipSync(files, { level: 6 });
  if (archive.length > MAX_ARCHIVE) throw new Error('Project archive is too large.');
  return archive;
}

export function decodeProject(bytes: Uint8Array): Project {
  if (bytes.length > MAX_ARCHIVE) throw new Error('Archive exceeds the 64 MB limit.');
  let total = 0;
  const names = new Set<string>();
  const files = unzipSync(bytes, { filter: entry => {
    if (names.has(entry.name)) throw new Error('Duplicate archive entry.');
    names.add(entry.name);
    if (names.size > 501 || !/^(project\.json|assets\/[\w-]+\.bin)$/.test(entry.name)) throw new Error('Unsafe or unsupported archive entry path.');
    const sizeLimit = entry.name === 'project.json' ? MAX_JSON : MAX_ASSET;
    total += entry.originalSize;
    if (entry.originalSize > sizeLimit || total > MAX_ARCHIVE) throw new Error('Uncompressed data exceeds the size limit.');
    return true;
  } });
  if (!files['project.json']) throw new Error('Missing project.json.');
  const input = JSON.parse(strFromU8(files['project.json']));
  if (!input || typeof input !== 'object' || !input.assets || typeof input.assets !== 'object') throw new Error('Invalid project manifest.');
  const assets: Record<string, Asset> = {};
  const referenced = new Set(['project.json']);
  for (const [key, value] of Object.entries(input.assets)) {
    if (!value || typeof value !== 'object') throw new Error('Invalid asset entry.');
    const { path, ...meta } = value as Record<string, unknown>;
    if (path !== `assets/${key}.bin`) throw new Error('Unsafe asset path.');
    const data = files[path as string];
    if (!data) throw new Error(`Missing image asset: ${key}`);
    const asset = assetSchema.parse({ ...meta, data: bytesToBase64(data) });
    verifyRaster(data, asset.mime); assets[key] = asset; referenced.add(path as string);
  }
  if (Object.keys(files).some(path => !referenced.has(path))) throw new Error('Unreferenced archive entry.');
  return validateProject({ ...input, assets });
}
