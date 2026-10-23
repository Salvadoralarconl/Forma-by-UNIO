import {it,expect} from 'vitest';
import {createProject} from '../src/domain/model';
import {applyCommand,type Command} from '../src/domain/commands';
import {createHistory,execute,undo} from '../src/domain/history';
it('resizes text and font together as one undoable edit without changing other text',()=>{
 let p=applyCommand(createProject(),{type:'addPage',name:'Free',mode:'free'});const root=p.pages[1].rootId;
 p=applyCommand(p,{type:'add',kind:'text',parentId:root,preset:'heading'});
 const id=p.nodes[root].children[0],frame=p.nodes[id].frame!,original=p.nodes[id].style.fontSize!;
 const command={type:'frames',updates:[{id,frame:{...frame,width:frame.width/2,height:frame.height/2},fontSize:original/2}]} as Command;
 const h=execute(createHistory(p),command);expect(h.present.nodes[id].style.fontSize).toBe(original/2);expect(undo(h).present).toEqual(p);
 expect(()=>applyCommand(p,{type:'frames',updates:[{id,frame,fontSize:NaN}]} as Command)).toThrow();
});
