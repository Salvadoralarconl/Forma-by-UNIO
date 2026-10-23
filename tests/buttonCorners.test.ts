import {it,expect} from 'vitest';
import {createProject} from '../src/domain/model';
import {applyCommand} from '../src/domain/commands';
import {createHistory,execute,undo} from '../src/domain/history';
import {encodeProject,decodeProject} from '../src/persistence/archive';
import {nodeStyle as editorStyle} from '../src/editor/Canvas';
import {nodeStyle as exportStyle} from '../src/export/nodeStyle';
it('preserves individual button corners in editor, export, archive, and undo',()=>{
 let p=createProject();const root=p.pages[0].rootId;p=applyCommand(p,{type:'add',kind:'container',parentId:root,preset:'solidButton'});const id=p.nodes[root].children[0];
 const style={borderRadius:12,borderTopLeftRadius:0,borderTopRightRadius:20,borderBottomRightRadius:30,borderBottomLeftRadius:40};
 const h=execute(createHistory(p),{type:'update',id,patch:{},style});const n=decodeProject(encodeProject(h.present)).nodes[id];
 for(const render of [editorStyle,exportStyle]){const css=render(n,p.nodes[root]);expect(css.borderTopLeftRadius).toBe(0);expect(css.borderTopRightRadius).toBe(20);expect(css.borderBottomRightRadius).toBe(30);expect(css.borderBottomLeftRadius).toBe(40);}
 expect(undo(h).present).toEqual(p);
});
