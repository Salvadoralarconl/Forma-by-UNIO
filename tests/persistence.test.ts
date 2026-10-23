import { describe, it, expect } from 'vitest';
import { strToU8, zipSync, unzipSync } from 'fflate';
import { createProject } from '../src/domain/model';
import { applyCommand } from '../src/domain/commands';
import { encodeProject, decodeProject } from '../src/persistence/archive';
import { RecoveryQueue, shouldOfferRecovery } from '../src/persistence/recovery';

describe('portable archives', () => {
  it('preserves row and column organization through save/reopen and undo/redo', async () => {
    const { createHistory, execute, undo, redo } = await import('../src/domain/history');
    const p = createProject('Layout');
    let h = execute(createHistory(p), { type: 'add', kind: 'container', parentId: p.pages[0].rootId, layout: 'row' });
    const row = h.present.nodes[p.pages[0].rootId].children[0];
    h = execute(h, { type: 'add', kind: 'container', parentId: row, layout: 'column' });
    const column = h.present.nodes[row].children[0];
    h = execute(h, { type: 'update', id: row, patch: {}, style: { gap: 32, padding: 16, align: 'center' } });
    const restored = decodeProject(encodeProject(redo(undo(h)).present));
    expect(restored.nodes[row].style).toMatchObject({ direction: 'row', gap: 32, padding: 16, align: 'center' });
    expect(restored.nodes[column].style).toMatchObject({ direction: 'column', flexGrow: 1 });
  });
  it('round trips Unicode projects and image bytes without filesystem paths', () => {
    let p = createProject('Café — Studio');
    p = applyCommand(p, { type: 'add', kind: 'image', parentId: p.pages[0].rootId,
      asset: { id: 'asset-1', name: 'Niño.png', mime: 'image/png', data: 'iVBORw0KGgo=' } });
    const bytes = encodeProject(p);
    const entries = unzipSync(bytes);
    expect(Object.keys(entries).sort()).toEqual(['assets/asset-1.bin', 'project.json']);
    expect(decodeProject(bytes)).toEqual(p);
  });
  it('rejects traversal paths and missing asset data', () => {
    const p = createProject('Studio');
    const entries = unzipSync(encodeProject(p));
    expect(() => decodeProject(zipSync({ ...entries, '../outside': strToU8('bad') }))).toThrow(/path|entry/i);
    const changed = applyCommand(p, { type: 'add', kind: 'image', parentId: p.pages[0].rootId,
      asset: { id: 'asset-1', name: 'a.png', mime: 'image/png', data: 'iVBORw0KGgo=' } });
    const missing = unzipSync(encodeProject(changed));
    delete missing['assets/asset-1.bin'];
    expect(() => decodeProject(zipSync(missing))).toThrow(/missing/i);
  });
  it('rejects malformed archives, unknown schemas, foreign files and non-raster assets', () => {
    expect(() => decodeProject(new Uint8Array([1, 2, 3]))).toThrow();
    const p = createProject('Studio');
    expect(() => decodeProject(zipSync({ 'project.json': strToU8(JSON.stringify({ ...p, schemaVersion: 999 })) }))).toThrow();
    expect(() => decodeProject(zipSync({ 'project.json': strToU8(JSON.stringify(p)), 'script.js': strToU8('alert(1)') }))).toThrow();
    p.assets['bad'] = { id: 'bad', name: 'bad.png', mime: 'image/png', data: 'PHN2Zz4=' };
    expect(() => encodeProject(p)).toThrow(/image|raster/i);
  });
  it('rejects decompression beyond the per-entry bound before allocation', () => {
    const compressed = zipSync({ 'project.json': new Uint8Array(4 * 1024 * 1024 + 1) });
    expect(() => decodeProject(compressed)).toThrow(/limit|large/i);
  });
});

describe('recovery', () => {
  it('offers dirty recovery newer than disk, but not an identical or older saved document', () => {
    const p = createProject('Studio');
    p.updatedAt = '2026-10-22T15:00:00.000Z';
    const candidate = { project: p, sourcePath: null, capturedAt: '2026-10-22T16:00:00.000Z' };
    expect(shouldOfferRecovery(candidate, null)).toBe(true);
    expect(shouldOfferRecovery(candidate, p)).toBe(false);
    const changed = applyCommand(p, { type: 'renameProject', name: 'Recovered' });
    expect(shouldOfferRecovery({ ...candidate, project: changed }, p)).toBe(true);
    expect(shouldOfferRecovery({ ...candidate, project: changed, capturedAt: '2026-10-22T14:00:00.000Z' }, p)).toBe(false);
  });
  it('drops stale queued snapshots when another document is opened', async () => {
    const values: string[] = [];
    const queue = new RecoveryQueue(async snapshot => { values.push(snapshot.project.name); });
    const p = createProject('Old');
    const write = queue.enqueue({ project: p, sourcePath: null, capturedAt: new Date().toISOString() });
    queue.invalidate();
    await write;
    await queue.enqueue({ project: createProject('New'), sourcePath: null, capturedAt: new Date().toISOString() });
    expect(values).toEqual(['New']);
  });
  it('continues recovery after a failed write and reports the original failure', async () => {
    let fail = true;
    const queue = new RecoveryQueue(async () => { if (fail) throw new Error('Disk full'); });
    const candidate = { project: createProject('Studio'), sourcePath: null, capturedAt: new Date().toISOString() };
    await expect(queue.enqueue(candidate)).rejects.toThrow('Disk full');
    fail = false;
    await expect(queue.enqueue(candidate)).resolves.toBeUndefined();
  });
});
