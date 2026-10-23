
import {PaintBucket,ArrowUpDown,ArrowUp,ArrowDown,EyeOff,LockKeyhole,UnlockKeyhole,Copy,Trash2} from 'lucide-react';
import type {Editor} from './useEditor';
export function PageControls({editor,pageId,resizing,onResize,onBackground}:{onBackground?:()=>void;editor:Editor;pageId:string;resizing:boolean;onResize:()=>void}){
 const {project}=editor,page=project.pages.find(p=>p.id===pageId);if(!page)return null;
 const visible=project.pages.filter(p=>!p.archived),index=visible.findIndex(p=>p.id===page.id),root=project.nodes[page.rootId],last=visible.length<=1;
 const move=(direction:-1|1)=>{const adjacent=visible[index+direction];if(adjacent)editor.run({type:'movePage',id:page.id,index:project.pages.findIndex(p=>p.id===adjacent.id)});};
 return <div className="page-side-controls" role="toolbar" aria-orientation="vertical" aria-label={`Page actions for ${page.name}`} onPointerDown={e=>e.stopPropagation()}>
  <button aria-label={`Move ${page.name} up`} title="Move page up" disabled={editor.busy||index<=0} onClick={()=>move(-1)}><ArrowUp size={15}/></button>
  <button aria-label={`Move ${page.name} down`} title="Move page down" disabled={editor.busy||index===visible.length-1} onClick={()=>move(1)}><ArrowDown size={15}/></button>
  <button aria-label={`Hide ${page.name}`} title="Hide page · restore from Layers" disabled={editor.busy||last} onClick={()=>editor.run({type:'archivePage',id:page.id})}><EyeOff size={15}/></button>
  <button aria-label={`${root.locked?'Unlock':'Lock'} ${page.name}`} title={root.locked?'Unlock page':'Lock page'} aria-pressed={!!root.locked} disabled={editor.busy} onClick={()=>editor.run({type:'update',id:root.id,patch:{locked:!root.locked}})}>{root.locked?<UnlockKeyhole size={15}/>:<LockKeyhole size={15}/>}</button>
  <button className="page-height-icon" aria-label="Resize page height from toolbar" title="Show page height handle" aria-pressed={resizing} disabled={editor.busy||!!root.locked} onClick={onResize}><ArrowUpDown size={15}/></button>
  <button aria-label={`Edit ${page.name} background`} title="Customize page background" onClick={()=>{editor.setPageId(page.id);editor.setSelected(root.id);onBackground?.();}}><PaintBucket size={15}/></button>
  <button aria-label={`Duplicate ${page.name}`} title="Duplicate page" disabled={editor.busy} onClick={()=>editor.run({type:'duplicatePage',id:page.id})}><Copy size={15}/></button>
  {!last&&<button aria-label={`Delete ${page.name}`} title="Delete page" disabled={editor.busy||last||!!root.locked} onClick={()=>editor.run({type:'deletePage',id:page.id})}><Trash2 size={15}/></button>}
 </div>;
}
