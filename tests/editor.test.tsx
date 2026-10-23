import React from 'react';
import { afterEach, describe, expect, it } from 'vitest';
import { act, cleanup, render, renderHook, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { App } from '../src/editor/App';
import { createProject, type Project } from '../src/domain/model';
import type { Platform } from '../src/persistence/platform';
import type { RecoverySnapshot } from '../src/persistence/recovery';
import { useEditor } from '../src/editor/useEditor';
afterEach(()=>{cleanup();localStorage.clear();});
function memoryPlatform(): Platform & { disk: Project | null; recovery: RecoverySnapshot | null; failSave: boolean } {
  return {
    native: false, disk: null, recovery: null, failSave: false,
    async open() { return this.disk ? { project: structuredClone(this.disk), path: 'studio.forma' } : null; },
    async save(project) { if (this.failSave) throw new Error('Disk full'); this.disk = structuredClone(project); return 'studio.forma'; },
    async readRecovery() { return this.recovery; },
    async readSavedForRecovery() { return this.disk; },
    async writeRecovery(snapshot) { this.recovery = structuredClone(snapshot); },
    async clearRecovery() { this.recovery = null; },
  };
}

describe('editor foundation', () => {
  it('returns active page and selection to Home when undo removes the current page',async()=>{
    const p=createProject('Studio'),platform=memoryPlatform();const {result}=renderHook(()=>useEditor(platform,p));
    act(()=>result.current.run({type:'addPage',name:'Second'}));expect(result.current.pageId).toBe(result.current.project.pages[1].id);
    act(()=>result.current.undo());await waitFor(()=>expect(result.current.pageId).toBe(p.pages[0].id));expect(result.current.selected).toBe(p.pages[0].rootId);
  });
  it('selects inserted text in both layers and canvas, edits and undoes it', async () => {
    const user = userEvent.setup();
    render(<App platform={memoryPlatform()} initialProject={createProject('Studio')} />);
    await user.click(screen.getByRole('button', { name: 'Add text' }));
    const content = screen.getByLabelText('Text content');
    await user.clear(content);
    await user.type(content, 'Hello Forma');
    await user.tab();
    expect(within(screen.getByTestId('artboard')).getByText('Hello Forma')).toBeTruthy();
    await user.click(screen.getByRole('tab',{name:'Layers & Pages'}));
    expect(screen.getByRole('treeitem', { name: /Text/ }).getAttribute('aria-selected')).toBe('true');
    await user.click(screen.getByRole('tab',{name:'Properties'}));
    await user.click(screen.getByRole('button', { name: 'Undo' }));
    expect(within(screen.getByTestId('artboard')).getByText('Your text here')).toBeTruthy();
    await user.click(screen.getByRole('button', { name: 'Redo' }));
    expect(within(screen.getByTestId('artboard')).getByText('Hello Forma')).toBeTruthy();
  });
  it('inserts into a selected container and previews without selection controls', async () => {
    const user = userEvent.setup();
    render(<App platform={memoryPlatform()} initialProject={createProject('Studio')} />);
    await user.click(screen.getByRole('button', { name: 'Add container' }));
    await user.click(screen.getByRole('button', { name: 'Add text' }));
    await user.click(screen.getByRole('tab',{name:'Layers & Pages'}));
    const tree = screen.getByRole('tree');
    expect(within(tree).getAllByRole('treeitem')).toHaveLength(3);
    await user.click(screen.getByRole('button', { name: 'Preview' }));
    expect(screen.queryAllByTestId('selection-label')).toHaveLength(0);
    expect(within(screen.getByTestId('artboard')).getByText('Your text here')).toBeTruthy();
  });
  it('saves and reopens actual edited data and keeps failed saves dirty', async () => {
    const user = userEvent.setup();
    const platform = memoryPlatform();
    render(<App platform={platform} initialProject={createProject('Studio')} />);
    await user.click(screen.getByRole('button', { name: 'Add text' }));
    platform.failSave = true;
    await user.click(screen.getByRole('button', { name: 'Save project' }));
    expect(await screen.findByRole('alert')).toHaveProperty('textContent', expect.stringContaining('Disk full'));
    expect(screen.getByTestId('save-status').textContent).toContain('Unsaved');
    platform.failSave = false;
    await user.click(screen.getByRole('button', { name: 'Save project' }));
    await waitFor(() => expect(platform.disk?.nodes[platform.disk.pages[0].rootId].children).toHaveLength(1));
    expect(screen.getByTestId('save-status').textContent).toContain('Saved');
    await user.click(screen.getByRole('button', { name: 'Open project' }));
    await user.click(screen.getByRole('tab',{name:'Layers & Pages'}));
    await waitFor(() => expect(screen.getByRole('treeitem', { name: /Text/ })).toBeTruthy());
  });
  it('offers recovery before replacing the current document', async () => {
    const user = userEvent.setup();
    const platform = memoryPlatform();
    platform.recovery = { project: createProject('Recovered studio'), sourcePath: null, capturedAt: new Date().toISOString() };
    render(<App platform={platform} initialProject={createProject('Studio')} />);
    await user.click(await screen.findByRole('button', { name: 'Recover project' }));
    expect(await screen.findByDisplayValue('Recovered studio')).toBeTruthy();
  });
  it('suppresses identical and stale recovery snapshots after comparing with the saved project', async () => {
    const platform = memoryPlatform();
    const p = createProject('Saved studio');
    p.updatedAt = '2026-10-22T16:00:00.000Z';
    platform.disk = p;
    platform.recovery = { project: { ...p, name: 'Obsolete name' }, sourcePath: 'studio.forma', capturedAt: '2026-10-22T15:00:00.000Z' };
    render(<App platform={platform} initialProject={createProject('Studio')} />);
    await waitFor(() => expect(screen.queryByRole('button', { name: 'Recover project' })).toBeNull());
    // Wait until the asynchronous recovery check has had an observable result.
    await screen.findByText('Saved project is current; recovery snapshot skipped', { exact: false });
    expect(screen.queryByRole('button', { name: 'Recover project' })).toBeNull();
  });
  it('still offers valid recovery when the saved original is corrupt', async () => {
    const platform = memoryPlatform();
    platform.recovery = { project: createProject('Recover me'), sourcePath: 'studio.forma', capturedAt: new Date().toISOString() };
    platform.readSavedForRecovery = async () => { throw new Error('Invalid ZIP'); };
    render(<App platform={platform} initialProject={createProject('Studio')} />);
    expect(await screen.findByRole('button', { name: 'Recover project' })).toBeTruthy();
  });
  it('does not clear pending recovery when Ctrl+S is pressed in its dialog', async () => {
    const user = userEvent.setup();
    const platform = memoryPlatform();
    platform.recovery = { project: createProject('Valuable work'), sourcePath: null, capturedAt: new Date().toISOString() };
    render(<App platform={platform} initialProject={createProject('Studio')} />);
    await screen.findByRole('button', { name: 'Recover project' });
    await user.keyboard('{Control>}s{/Control}');
    expect(platform.disk).toBeNull();
    expect(platform.recovery?.project.name).toBe('Valuable work');
  });
  it('commits the focused text field before saving through Ctrl+S', async () => {
    const user = userEvent.setup();
    const platform = memoryPlatform();
    render(<App platform={platform} initialProject={createProject('Studio')} />);
    await user.click(screen.getByRole('button', { name: 'Add text' }));
    await user.clear(screen.getByLabelText('Text content'));
    await user.type(screen.getByLabelText('Text content'), 'Latest unsaved text');
    await user.keyboard('{Control>}s{/Control}');
    await waitFor(() => expect(platform.disk).not.toBeNull());
    const text = Object.values(platform.disk!.nodes).find(n => n.kind === 'text');
    expect(text?.text).toBe('Latest unsaved text');
  });
  it('rejects invalid image metadata without crashing or losing existing edits', async () => {
    const user = userEvent.setup();
    render(<App platform={memoryPlatform()} initialProject={createProject('Studio')} />);
    await user.click(screen.getByRole('button', { name: 'Add text' }));
    const file = new File(['image'], 'a'.repeat(201) + '.png', { type: 'image/png' });
    Object.defineProperty(file, 'arrayBuffer', { value: async () => Uint8Array.from([137,80,78,71,13,10,26,10]).buffer });
    await user.upload(screen.getByLabelText('Import image file'), file);
    expect(await screen.findByRole('alert')).toBeTruthy();
    expect(within(screen.getByTestId('artboard')).getByText('Your text here')).toBeTruthy();
  });
  it('inserts an editable element and preserves panel content while switching tabs', async()=>{
    const user=userEvent.setup();render(<App platform={memoryPlatform()} initialProject={createProject('Studio')}/>);
    await user.click(screen.getByRole('button',{name:'Elements library'}));
    await user.click(screen.getByRole('button',{name:'Text'}));
    await user.click(screen.getByRole('button',{name:'Insert Heading'}));
    expect(within(screen.getByTestId('artboard')).getByText('Add a heading')).toBeTruthy();
    await user.click(screen.getByRole('tab',{name:'Layers & Pages'}));
    expect(screen.getByRole('treeitem',{name:'Heading'})).toBeTruthy();
    await user.click(screen.getByRole('tab',{name:'Properties'}));
    expect(screen.getByLabelText('Text content')).toHaveProperty('value','Add a heading');
  });
  it('deletes nested content with Backspace and undoes while protecting text inputs',async()=>{
    const user=userEvent.setup();render(<App platform={memoryPlatform()} initialProject={createProject('Studio')}/>);
    await user.click(screen.getByRole('button',{name:'Add container'}));
    await user.click(screen.getByRole('button',{name:'Add text'}));
    const field=screen.getByLabelText('Text content');await user.click(field);await user.keyboard('{Backspace}');
    expect(within(screen.getByTestId('artboard')).getByText('Your text here')).toBeTruthy();
    await user.tab();await user.click(screen.getByRole('button',{name:'Select tool'}));await user.keyboard('{Backspace}');
    expect(screen.getByTestId('artboard').textContent).not.toContain('Your text here');
    await user.click(screen.getByRole('button',{name:'Undo'}));
    expect(within(screen.getByTestId('artboard')).getByText('Your text her')).toBeTruthy();
  });
});
