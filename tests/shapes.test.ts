import { describe, it, expect } from 'vitest';
import { createProject } from '../src/domain/model';
import { applyCommand } from '../src/domain/commands';
import { createHistory, execute, undo, redo } from '../src/domain/history';
import { encodeProject, decodeProject } from '../src/persistence/archive';
import { mergeShapeGeometry } from '../src/domain/shapes';
describe('true shape union', () => {
  it('unions overlapping rectangles into one outline with shared area counted once', () => {
    const shape = { type: 'rectangle' as const, width: 100, height: 100 };
    const merged = mergeShapeGeometry(shape, shape, { x: 50, y: 0 });
    expect(merged.width).toBe(150);
    expect(merged.height).toBe(100);
    expect(merged.polygons).toHaveLength(1);
    const ring = merged.polygons![0][0];
    const area = Math.abs(ring.slice(0, -1).reduce((sum, p, i) => sum + p[0]*ring[i+1][1]-ring[i+1][0]*p[1],0))/2;
    expect(area).toBe(15000);
  });
  it('keeps disjoint parts as one editable compound shape and rejects invalid offsets', () => {
    const shape = { type: 'rectangle' as const, width: 100, height: 100 };
    expect(mergeShapeGeometry(shape, shape, { x: 200, y: 0 }).polygons).toHaveLength(2);
    expect(() => mergeShapeGeometry(shape, shape, { x: Infinity, y: 0 })).toThrow();
  });
  it('merges two sibling shapes as one undoable operation and round trips geometry and shadow', () => {
    let p = createProject('Shapes'); const root = p.pages[0].rootId;
    p = applyCommand(p, { type: 'add', kind: 'shape', parentId: root, preset: 'rectangle' });
    p = applyCommand(p, { type: 'add', kind: 'shape', parentId: root, preset: 'ellipse' });
    const [a,b] = p.nodes[root].children;
    let h = execute(createHistory(p), { type: 'mergeShapes', id: a, otherId: b, offset: { x: 60, y: 0 } });
    expect(h.present.nodes[root].children).toEqual([a]);
    expect(h.present.nodes[a].geometry?.type).toBe('union');
    expect(undo(h).present.nodes[root].children).toEqual([a,b]);
    h = redo(undo(h));
    h = execute(h, { type: 'update', id: a, patch: {}, style: { background: '#ff8800', shadow: { x: 3, y: 6, blur: 12, color: '#00000066' } } });
    const result = decodeProject(encodeProject(h.present));
    expect(result.nodes[a].geometry?.polygons?.length).toBeGreaterThan(0);
    expect(result.nodes[a].style.shadow?.blur).toBe(12);
    expect(() => applyCommand(result, { type: 'mergeShapes', id: a, otherId: root, offset: { x: 0, y: 0 } })).toThrow(/shape/i);
  });
  it('keeps the earlier flow slot and supplied visual offset when merging the later shape',()=>{
    let p=createProject('Shapes');const root=p.pages[0].rootId;
    p=applyCommand(p,{type:'add',kind:'shape',parentId:root,preset:'rectangle'});
    p=applyCommand(p,{type:'add',kind:'text',parentId:root});
    p=applyCommand(p,{type:'add',kind:'shape',parentId:root,preset:'ellipse'});
    const [first,text,last]=p.nodes[root].children;
    p=applyCommand(p,{type:'mergeShapes',id:last,otherId:first,offset:{x:0,y:-80},placement:{x:5,y:0}});
    expect(p.nodes[root].children).toEqual([last,text]);
    expect(p.nodes[last].style.offsetY).toBe(0);expect(p.nodes[last].style.offsetX).toBe(5);
  });
  it('rejects centered/distributed ancestor flow before changing either source shape',()=>{
    let p=createProject('Shapes');const root=p.pages[0].rootId;
    p=applyCommand(p,{type:'add',kind:'shape',parentId:root});p=applyCommand(p,{type:'add',kind:'shape',parentId:root});
    p=applyCommand(p,{type:'update',id:root,patch:{},style:{justify:'center'}});const[a,b]=p.nodes[root].children;
    expect(()=>applyCommand(p,{type:'mergeShapes',id:a,otherId:b,offset:{x:0,y:0}})).toThrow(/start.aligned/i);
    expect(p.nodes[root].children).toEqual([a,b]);
  });
  it('uses measured display dimensions for fluid shapes and rejects an overflowing result',()=>{
    let p=createProject('Shapes');const root=p.pages[0].rootId;
    p=applyCommand(p,{type:'add',kind:'shape',parentId:root});p=applyCommand(p,{type:'add',kind:'shape',parentId:root});const[a,b]=p.nodes[root].children;
    const command={type:'mergeShapes' as const,id:a,otherId:b,offset:{x:0,y:120},measurements:{first:{width:300,height:100},second:{width:300,height:100}},availableWidth:300};
    const merged=applyCommand(p,command);expect(merged.nodes[a].geometry).toMatchObject({width:300,height:220});
    expect(()=>applyCommand(p,{...command,offset:{x:100,y:0}})).toThrow(/available width/i);
  });
});
