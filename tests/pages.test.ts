import {describe,it,expect} from 'vitest';
import {createProject,makeNode,defaultButtonBehavior} from '../src/domain/model';
import {createCanvasProject} from '../src/domain/pageBounds';
import {applyCommand} from '../src/domain/commands';
import {createHistory,execute,undo} from '../src/domain/history';
import {encodeProject,decodeProject} from '../src/persistence/archive';
describe('distinct stacked pages',()=>{
 it('inserts below selected page, inherits its dimensions, and roundtrips ordering/archive',()=>{
 let p=createProject('Pages');const first=p.pages[0];p.nodes[first.rootId].style.height=900;
 p=applyCommand(p,{type:'addPage',name:'Second',afterId:first.id,width:768});const second=p.pages[1];expect(second).toMatchObject({width:768,height:900});
 p=applyCommand(p,{type:'addPage',name:'Inserted',afterId:first.id,width:768});expect(p.pages.map(p=>p.name)).toEqual(['Home','Inserted','Second']);expect(new Set(p.pages.map(p=>p.rootId)).size).toBe(3);
 p=applyCommand(p,{type:'movePage',id:second.id,index:0});p=applyCommand(p,{type:'archivePage',id:first.id});const restored=decodeProject(encodeProject(p));expect(restored.pages[0].id).toBe(second.id);expect(restored.pages.find(p=>p.id===first.id)?.archived).toBe(true);
 const h=execute(createHistory(p),{type:'deletePage',id:second.id});expect(h.present.nodes[second.rootId]).toBeUndefined();expect(undo(h).present).toEqual(p);
 });
 it('protects the final active page from delete or archive',()=>{const p=createProject();for(const type of ['deletePage','archivePage'] as const)expect(()=>applyCommand(p,{type,id:p.pages[0].id})).toThrow('at least one active');});
 it('duplicates a complete page with fresh IDs and remaps its internal links',()=>{
  const p=createCanvasProject('Copy'),page=p.pages[0],root=p.nodes[page.rootId],button=makeNode('container','button','Button',{});button.frame={x:20,y:20,width:100,height:40};button.button=defaultButtonBehavior();button.button.action={type:'page',target:page.id};p.nodes[button.id]=button;root.children.push(button.id);
  const h=execute(createHistory(p),{type:'duplicatePage',id:page.id}),copy=h.present.pages[1],copied=h.present.nodes[h.present.nodes[copy.rootId].children[0]];
  expect(copy.name).toBe('Home copy');expect(copy.rootId).not.toBe(page.rootId);expect(copied.id).not.toBe(button.id);expect(copied.button!.action.target).toBe(copy.id);expect(copied.frame).toEqual(button.frame);expect(undo(h).present).toEqual(p);expect(decodeProject(encodeProject(h.present))).toEqual(h.present);
 });
 it('resizes to ultrawide without moving content and protects locked page descendants',()=>{
  let p=createCanvasProject('Wide');const page=p.pages[0];p=applyCommand(p,{type:'add',parentId:page.rootId,kind:'shape',preset:'rectangle'});const child=p.nodes[page.rootId].children[0],before=p.nodes[child].frame;
  const wide=applyCommand(p,{type:'resizePageWidth',id:page.id,width:2560});expect(wide.pages[0].width).toBe(2560);expect(wide.nodes[child].frame).toEqual(before);
  const locked=applyCommand(wide,{type:'update',id:page.rootId,patch:{locked:true}});expect(()=>applyCommand(locked,{type:'update',id:child,patch:{},style:{background:'#ff0000'}})).toThrow('Unlock');expect(()=>applyCommand(locked,{type:'resizePageWidth',id:page.id,width:1440})).toThrow('unlocked');
 });
 it('does not move content into a nested container on a locked destination page',()=>{
  let p=createCanvasProject('Locks');const first=p.pages[0];p=applyCommand(p,{type:'add',kind:'shape',parentId:first.rootId,preset:'rectangle'});const shape=p.nodes[first.rootId].children[0];p=applyCommand(p,{type:'addPage',name:'Destination',mode:'free'});const destination=p.pages[1];p=applyCommand(p,{type:'add',kind:'container',parentId:destination.rootId});const nested=p.nodes[destination.rootId].children[0];p=applyCommand(p,{type:'update',id:destination.rootId,patch:{locked:true}});
  expect(()=>applyCommand(p,{type:'move',id:shape,parentId:nested,index:0})).toThrow('Unlock');
 });
});
