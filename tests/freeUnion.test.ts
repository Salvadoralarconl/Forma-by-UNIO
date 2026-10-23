import {it,expect} from 'vitest';
import {createProject} from '../src/domain/model';
import {applyCommand} from '../src/domain/commands';
import {createHistory,execute,undo} from '../src/domain/history';
import {encodeProject,decodeProject} from '../src/persistence/archive';
it('unions free shapes using their actual frames with one undo and persistence',()=>{
 let p=applyCommand(createProject(),{type:'addPage',name:'Free',mode:'free'});const root=p.pages[1].rootId;
 for(let i=0;i<2;i++)p=applyCommand(p,{type:'add',kind:'shape',parentId:root,preset:'rectangle'});
 const [a,b]=p.nodes[root].children;
 p=applyCommand(p,{type:'frames',updates:[{id:a,frame:{x:100,y:100,width:120,height:120}},{id:b,frame:{x:160,y:100,width:120,height:120}}]});
 const h=execute(createHistory(p),{type:'mergeShapes',id:b,otherId:a,offset:{x:999,y:999}});
 expect(h.present.nodes[root].children).toEqual([b]);expect(h.present.nodes[b].frame).toEqual({x:100,y:100,width:180,height:120});
 expect(h.present.nodes[b].geometry?.type).toBe('union');expect(decodeProject(encodeProject(h.present))).toEqual(h.present);expect(undo(h).present).toEqual(p);
 const locked=structuredClone(p);locked.nodes[a].locked=true;expect(()=>applyCommand(locked,{type:'mergeShapes',id:b,otherId:a,offset:{x:0,y:0}})).toThrow();
});
it('preserves rounded exterior corners when merging rectangles',()=>{
 let p=applyCommand(createProject(),{type:'addPage',name:'Free',mode:'free'});const root=p.pages[1].rootId;
 for(let i=0;i<2;i++)p=applyCommand(p,{type:'add',kind:'shape',parentId:root,preset:'rectangle'});
 const [a,b]=p.nodes[root].children;
 p=applyCommand(p,{type:'frames',updates:[{id:a,frame:{x:100,y:100,width:120,height:120}},{id:b,frame:{x:160,y:100,width:120,height:120}}]});
 p=applyCommand(p,{type:'update',id:a,patch:{},style:{borderRadius:20}});p=applyCommand(p,{type:'update',id:b,patch:{},style:{borderRadius:30}});
 const result=applyCommand(p,{type:'mergeShapes',id:a,otherId:b,offset:{x:0,y:0}}),points=result.nodes[a].geometry!.polygons!.flat(2);
 expect(points.some(([x,y])=>x===0&&y===0)).toBe(false);
 expect(Math.min(...points.filter(([,y])=>Math.abs(y)<.001).map(([x])=>x))).toBeCloseTo(20);
 expect(Math.max(...points.filter(([,y])=>Math.abs(y)<.001).map(([x])=>x))).toBeCloseTo(150);
});
