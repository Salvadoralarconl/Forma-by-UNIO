import {it,expect} from 'vitest';
import {createProject} from '../src/domain/model';
import {applyCommand,type Command} from '../src/domain/commands';
import {execute,createHistory,undo} from '../src/domain/history';
import {decodeProject,encodeProject} from '../src/persistence/archive';
it('adds, repositions, resizes and removes an embedded button icon without losing the label or action',()=>{
 let p=createProject();const root=p.pages[0].rootId;p=applyCommand(p,{type:'add',kind:'container',parentId:root,preset:'solidButton'});const id=p.nodes[root].children[0],label=p.nodes[id].children[0];
 const icon={id:'test',name:'Test icon',pack:'Test',style:'outline',paths:['M0 0L24 24'],tags:[]};
 const h=execute(createHistory(p),{type:'buttonIcon',id,icon,position:'left',size:20} as unknown as Command);const added=h.present.nodes[id].children[0];expect(h.present.nodes[added].kind).toBe('icon');expect(h.present.nodes[id].children[1]).toBe(label);expect(undo(h).present).toEqual(p);
 p=applyCommand(h.present,{type:'buttonIcon',id,position:'right',size:28} as unknown as Command);expect(p.nodes[id].children).toEqual([label,added]);expect(p.nodes[added].style.width).toBe(28);expect(decodeProject(encodeProject(p)).nodes[added].iconPaths).toEqual(icon.paths);
 p=applyCommand(p,{type:'buttonIcon',id,remove:true} as unknown as Command);expect(p.nodes[id].children).toEqual([label]);expect(p.nodes[added]).toBeUndefined();expect(p.nodes[id].button).toEqual(h.present.nodes[id].button);
});
