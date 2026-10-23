import { describe, it, expect } from 'vitest';
import { createProject, validateProject } from '../src/domain/model';
import { applyCommand } from '../src/domain/commands';
import { createHistory, execute, undo, redo } from '../src/domain/history';

describe('document commands', () => {
  it('requires a constrained parent before filling available height',()=>{
    let p=createProject('Sizing');const root=p.pages[0].rootId;p=applyCommand(p,{type:'add',kind:'container',parentId:root});const child=p.nodes[root].children[0];
    expect(()=>applyCommand(p,{type:'update',id:child,patch:{},style:{heightMode:'fill'}})).toThrow(/fixed height/i);
    p=applyCommand(p,{type:'update',id:root,patch:{},style:{height:500,heightMode:'fixed'}});
    p=applyCommand(p,{type:'update',id:child,patch:{},style:{heightMode:'fill'}});expect(p.nodes[child].style.heightMode).toBe('fill');
  });
  it('builds nested rows and columns in the same persisted flow model', () => {
    let p = createProject('Layout');
    const root = p.pages[0].rootId;
    p = applyCommand(p, { type: 'add', kind: 'container', parentId: root, layout: 'row' });
    const row = p.nodes[root].children[0];
    p = applyCommand(p, { type: 'add', kind: 'container', parentId: row, layout: 'column' });
    const column = p.nodes[row].children[0];
    p = applyCommand(p, { type: 'add', kind: 'text', parentId: column });
    expect(p.nodes[row].style.direction).toBe('row');
    expect(p.nodes[column].style.direction).toBe('column');
    expect(p.nodes[column].style.flexGrow).toBe(1);
    expect(p.nodes[column].children).toHaveLength(1);
  });
  it('inserts nested content without changing the previous document', () => {
    const p = createProject('Studio');
    const next = applyCommand(p, { type: 'add', kind: 'container', parentId: p.pages[0].rootId });
    const container = next.nodes[next.nodes[p.pages[0].rootId].children[0]];
    const nested = applyCommand(next, { type: 'add', kind: 'text', parentId: container.id });
    expect(Object.keys(p.nodes)).toHaveLength(1);
    expect(nested.nodes[container.id].children).toHaveLength(1);
    expect(nested.nodes[nested.nodes[container.id].children[0]].text).toBe('Your text here');
  });
  it('rejects moving a container into its descendant', () => {
    let p = createProject('Studio');
    p = applyCommand(p, { type: 'add', kind: 'container', parentId: p.pages[0].rootId });
    const a = p.nodes[p.pages[0].rootId].children[0];
    p = applyCommand(p, { type: 'add', kind: 'container', parentId: a });
    const b = p.nodes[a].children[0];
    expect(() => applyCommand(p, { type: 'move', id: a, parentId: b, index: 0 })).toThrow(/descendant/i);
  });
  it('deletes a whole subtree and keeps reorder deterministic', () => {
    let p = createProject('Studio');
    const root = p.pages[0].rootId;
    p = applyCommand(p, { type: 'add', kind: 'container', parentId: root });
    const a = p.nodes[root].children[0];
    p = applyCommand(p, { type: 'add', kind: 'text', parentId: a });
    const child = p.nodes[a].children[0];
    p = applyCommand(p, { type: 'add', kind: 'text', parentId: root });
    const b = p.nodes[root].children[1];
    p = applyCommand(p, { type: 'move', id: b, parentId: root, index: 0 });
    expect(p.nodes[root].children).toEqual([b, a]);
    p = applyCommand(p, { type: 'delete', id: a });
    expect(p.nodes[a]).toBeUndefined();
    expect(p.nodes[child]).toBeUndefined();
    expect(p.nodes[root].children).toEqual([b]);
  });
  it('undoes image insertion and redoes without losing embedded assets', () => {
    const p = createProject('Studio');
    let h = createHistory(p);
    h = execute(h, { type: 'add', kind: 'image', parentId: p.pages[0].rootId,
      asset: { id: 'asset-1', name: 'Café.png', mime: 'image/png', data: 'iVBORw0KGgo=' } });
    const id = h.present.nodes[p.pages[0].rootId].children[0];
    h = undo(h);
    expect(h.present.nodes[id]).toBeUndefined();
    h = redo(h);
    expect(h.present.assets['asset-1'].data).toBe('iVBORw0KGgo=');
    expect(h.present.nodes[id].assetId).toBe('asset-1');
  });
  it('clears redo when another command branches history', () => {
    const p = createProject('Studio');
    let h = execute(createHistory(p), { type: 'renameProject', name: 'One' });
    h = undo(h);
    h = execute(h, { type: 'renameProject', name: 'Two' });
    expect(redo(h).present.name).toBe('Two');
    expect(p.name).toBe('Studio');
  });
  it('reclaims deleted image data without breaking undo or shared image duplicates', () => {
    const p = createProject('Studio');
    let h = execute(createHistory(p), { type: 'add', kind: 'image', parentId: p.pages[0].rootId,
      asset: { id: 'asset-1', name: 'a.png', mime: 'image/png', data: 'iVBORw0KGgo=' } });
    const first = h.present.nodes[p.pages[0].rootId].children[0];
    h = execute(h, { type: 'duplicate', id: first });
    const second = h.present.nodes[p.pages[0].rootId].children[1];
    h = execute(h, { type: 'delete', id: first });
    expect(h.present.assets['asset-1']).toBeTruthy();
    h = execute(h, { type: 'delete', id: second });
    expect(h.present.assets).toEqual({});
    h = undo(h);
    expect(h.present.assets['asset-1'].data).toBe('iVBORw0KGgo=');
  });
});

describe('validation boundary', () => {
  it('rejects orphaned children, duplicate page IDs, cyclic graphs and unsupported schemas', () => {
    const p = createProject('Studio');
    const root = p.pages[0].rootId;
    expect(() => validateProject({ ...p, schemaVersion: 999 })).toThrow();
    expect(() => validateProject({ ...p, pages: [p.pages[0], p.pages[0]] })).toThrow();
    expect(() => validateProject({ ...p, nodes: { ...p.nodes, [root]: { ...p.nodes[root], children: ['missing'] } } })).toThrow();
    expect(() => validateProject({ ...p, nodes: { ...p.nodes, [root]: { ...p.nodes[root], children: [root] } } })).toThrow();
  });
  it('rejects executable CSS and image protocols', () => {
    const p = createProject('Studio');
    const root = p.pages[0].rootId;
    expect(() => validateProject({ ...p, nodes: { [root]: { ...p.nodes[root], style: { background: 'url(https://tracker.test/a)' } } } })).toThrow();
  });
});
