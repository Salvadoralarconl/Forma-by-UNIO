import { useEffect,useRef,useState } from 'react';
import type { Editor } from './useEditor';
export function SelectionOverlay({editor,zoom}:{editor:Editor;zoom:number}){
  const [box,setBox]=useState<{x:number;y:number;width:number;height:number}|null>(null);
  const gesture=useRef<{x:number;y:number;width:number;height:number;target:HTMLElement;styles:{width:string;height:string;minHeight:string}}|null>(null);
  const selected=editor.project.nodes[editor.selected];
  useEffect(()=>{
    let live=true;
    const update=()=>{if(!live||gesture.current)return;const target=document.querySelector<HTMLElement>(`[data-node-id="${editor.selected}"]`);const root=target?.closest<HTMLElement>('.artboard');if(!target||!root){setBox(null);return;}const rect=target.getBoundingClientRect(),board=root.getBoundingClientRect();setBox(rect.width&&rect.height?{x:(rect.left-board.left)/zoom,y:(rect.top-board.top)/zoom,width:rect.width/zoom,height:rect.height/zoom}:null);};
    update();const target=document.querySelector(`[data-node-id="${editor.selected}"]`);const observer=typeof ResizeObserver!=='undefined'?new ResizeObserver(update):null;if(target)observer?.observe(target);window.addEventListener('resize',update);
    return()=>{live=false;observer?.disconnect();window.removeEventListener('resize',update);};
  },[editor.selected,editor.project,zoom]);
  const cancel=()=>{const g=gesture.current;if(g){Object.assign(g.target.style,g.styles);gesture.current=null;}};
  useEffect(()=>{const escape=(event:KeyboardEvent)=>{if(event.key==='Escape')cancel();};window.addEventListener('keydown',escape);window.addEventListener('blur',cancel);return()=>{window.removeEventListener('keydown',escape);cancel();window.removeEventListener('blur',cancel);};},[]);
  if(!box||!selected||selected.locked||editor.project.pages.some(p=>p.rootId===selected.id))return null;
  return <div className="selection-resize-overlay" style={{left:box.x,top:box.y,width:box.width,height:box.height}}>
    <button className="resize-handle" aria-label="Resize selected layer" title="Drag to resize" onKeyDown={e=>{if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.key)){e.preventDefault();const step=e.shiftKey?10:1;editor.run({type:'update',id:editor.selected,patch:{},style:{widthMode:'fixed',heightMode:'fixed',width:Math.max(12,Math.min(5000,box.width+(e.key==='ArrowRight'?step:e.key==='ArrowLeft'?-step:0))),minHeight:Math.max(12,Math.min(5000,box.height+(e.key==='ArrowDown'?step:e.key==='ArrowUp'?-step:0))),height:Math.max(12,Math.min(5000,box.height+(e.key==='ArrowDown'?step:e.key==='ArrowUp'?-step:0)))}});}}}
      onPointerDown={e=>{e.stopPropagation();e.preventDefault();const target=document.querySelector<HTMLElement>(`[data-node-id="${editor.selected}"]`);if(!target)return;gesture.current={x:e.clientX,y:e.clientY,width:box.width,height:box.height,target,styles:{width:target.style.width,height:target.style.height,minHeight:target.style.minHeight}};e.currentTarget.setPointerCapture(e.pointerId);}}
      onPointerMove={e=>{const g=gesture.current;if(!g)return;const width=Math.max(12,Math.min(5000,g.width+(e.clientX-g.x)/zoom)),height=Math.max(12,Math.min(5000,g.height+(e.clientY-g.y)/zoom));g.target.style.width=`${width}px`;g.target.style.height=`${height}px`;g.target.style.minHeight=`${height}px`;setBox(b=>b?{...b,width,height}:b);}}
      onPointerUp={e=>{const g=gesture.current;if(!g)return;const width=Math.max(12,Math.min(5000,g.width+(e.clientX-g.x)/zoom)),height=Math.max(12,Math.min(5000,g.height+(e.clientY-g.y)/zoom));cancel();e.currentTarget.releasePointerCapture(e.pointerId);editor.run({type:'update',id:editor.selected,patch:{},style:{width,height,minHeight:height,widthMode:'fixed',heightMode:'fixed'}});}} onPointerCancel={cancel} onLostPointerCapture={cancel}/>
  </div>;
}


