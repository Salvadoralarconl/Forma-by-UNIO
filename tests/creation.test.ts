import { describe,it,expect } from 'vitest';
import { createProject,validateProject } from '../src/domain/model';
import { applyCommand } from '../src/domain/commands';
import { PRESETS,createPreset } from '../src/domain/presets';
import { copyFragment } from '../src/domain/clipboard';
import { execute,createHistory,undo } from '../src/domain/history';
import { encodeProject,decodeProject } from '../src/persistence/archive';
describe('expanded creation library',()=>{
  it('round trips all 591 local presets without dangling children',()=>{
    expect(PRESETS).toHaveLength(591);let p=createProject('Library');const root=p.pages[0].rootId;
    for(const preset of PRESETS){const built=createPreset(preset.id);expect(built.nodes[built.root.id]).toBeTruthy();Object.assign(p.nodes,built.nodes);p.nodes[root].children.push(built.root.id);}
    p=applyCommand(p,{type:'update',id:root,patch:{name:'Catalog'}});const restored=decodeProject(encodeProject(p));expect(restored.nodes[root].children).toHaveLength(591);expect(validateProject(restored).name).toBe('Library');
  });
  it('inserts every preset through the real command on a fresh small project',()=>{for(const preset of PRESETS){const p=createProject('Insertion'),root=p.pages[0].rootId;const next=applyCommand(p,{type:'add',kind:preset.kind,parentId:root,preset:preset.id});expect(next.nodes[root].children).toHaveLength(1);expect(validateProject(next).nodes[next.nodes[root].children[0]]).toBeTruthy();}});
  it('copies nested image content with fresh node IDs, preserves assets and undoes paste as one command',()=>{
    let p=createProject('Clipboard');const root=p.pages[0].rootId;p=applyCommand(p,{type:'add',kind:'container',parentId:root});const container=p.nodes[root].children[0];
    p=applyCommand(p,{type:'add',kind:'image',parentId:container,asset:{id:'asset-1',name:'a.png',mime:'image/png',data:'iVBORw0KGgo='}});
    const fragment=copyFragment(p,container);const h=execute(createHistory(p),{type:'paste',parentId:root,fragment});const pasted=h.present.nodes[root].children[1];
    expect(pasted).not.toBe(container);expect(h.present.nodes[pasted].children[0]).not.toBe(p.nodes[container].children[0]);expect(Object.keys(h.present.assets)).toHaveLength(1);
    expect(decodeProject(encodeProject(h.present)).nodes[pasted].children).toHaveLength(1);expect(undo(h).present.nodes[root].children).toEqual([container]);
    expect(()=>applyCommand(p,{type:'paste',parentId:root,fragment:{...fragment,rootId:'missing'}})).toThrow();
  });
  it('stores offline typography controls without accepting executable font styles',()=>{
    let p=createProject('Fonts');const root=p.pages[0].rootId;p=applyCommand(p,{type:'add',kind:'text',parentId:root});const text=p.nodes[root].children[0];
    p=applyCommand(p,{type:'update',id:text,patch:{},style:{fontFamily:'Georgia',fontStyle:'italic',lineHeight:1.6,letterSpacing:2}});
    expect(decodeProject(encodeProject(p)).nodes[text].style).toMatchObject({fontFamily:'Georgia',fontStyle:'italic',lineHeight:1.6,letterSpacing:2});
  });
});
