import {useEffect,useLayoutEffect,useRef,useState} from 'react';
import {createPortal} from 'react-dom';
import {LockKeyhole,UnlockKeyhole,Copy,Trash2,Ellipsis} from 'lucide-react';
import type {Editor} from './useEditor';
import {freeSelection,type Alignment,type Frame} from '../domain/placement';
import {parentOf} from '../domain/model';

export function SelectionToolbar({editor,rootId,zoom,dragBounds}:{editor:Editor;rootId:string;zoom:number;dragBounds?:Frame|null}){
 const [menu,setMenu]=useState(false),[submenu,setSubmenu]=useState<'layer'|'align'|null>(null),[position,setPosition]=useState<{left:number;top:number;maxHeight:number}|null>(null);
 const menuOpen=useRef(menu);menuOpen.current=menu;
 const ref=useRef<HTMLDivElement>(null),node=editor.project.nodes[editor.selected],parent=node?parentOf(editor.project,node.id):undefined;
 const single=editor.selectedIds.length===1,eligible=!!node&&node.id!==rootId&&!!parent&&!node.hidden;
 const mutable=eligible&&single&&!node.locked&&!parent?.locked&&!editor.busy;
 let alignable=false;try{freeSelection(editor.project,editor.selectedIds);alignable=single;}catch{}
 const close=()=>{setMenu(false);setSubmenu(null);};
 useEffect(()=>{close();},[editor.selected,editor.project]);
 useEffect(()=>{const outside=(e:PointerEvent)=>{if(!ref.current?.contains(e.target as Node))close();},escape=(e:KeyboardEvent)=>{if(e.key==='Escape'&&menuOpen.current){close();ref.current?.querySelector<HTMLButtonElement>('[aria-label="More selection actions"]')?.focus();}};document.addEventListener('pointerdown',outside);document.addEventListener('keydown',escape);return()=>{document.removeEventListener('pointerdown',outside);document.removeEventListener('keydown',escape);};},[]);
 useLayoutEffect(()=>{
  if(!eligible){setPosition(null);return;}
  const update=()=>{const target=document.querySelector<HTMLElement>(`[data-node-id="${editor.selected}"]`),board=target?.closest<HTMLElement>('.artboard'),viewport=target?.closest<HTMLElement>('.canvas-viewport');if(!target||!board)return;const r=target.getBoundingClientRect(),b=board.getBoundingClientRect(),v=viewport?.getBoundingClientRect();const width=ref.current?.offsetWidth||238,h=ref.current?.offsetHeight||34,leftEdge=Math.max(8,v?.left??8),rightEdge=Math.min(window.innerWidth-8,v?.right??window.innerWidth-8),topEdge=Math.max(8,v?.top??8),bottomEdge=Math.min(window.innerHeight-8,v?.bottom??window.innerHeight-8);const x=dragBounds?b.left+(dragBounds.x+dragBounds.width/2)*zoom:r.left+r.width/2,y=dragBounds?b.top+dragBounds.y*zoom:r.top;setPosition({left:Math.max(leftEdge,Math.min(rightEdge-width,x-width/2)),top:Math.max(topEdge,Math.min(bottomEdge-h,y-h-10)),maxHeight:Math.max(80,bottomEdge-topEdge)});};
  update();window.addEventListener('resize',update);document.addEventListener('scroll',update,true);const observer=typeof ResizeObserver==='undefined'?null:new ResizeObserver(update);const target=document.querySelector(`[data-node-id="${editor.selected}"]`);if(target)observer?.observe(target);return()=>{window.removeEventListener('resize',update);document.removeEventListener('scroll',update,true);observer?.disconnect();};
 },[eligible,editor.selected,editor.project,zoom,dragBounds,menu,submenu]);
 if(!eligible)return null;
 const action=(fn:()=>void)=>{fn();close();},mutate=(type:'duplicate'|'delete')=>action(()=>editor.run({type,id:node.id}));
 const lock=()=>action(()=>editor.run({type:'update',id:node.id,patch:{locked:!node.locked}}));
 const layer=(index:number)=>action(()=>editor.run({type:'move',id:node.id,parentId:parent!.id,index}));
 const item=(label:string,fn:()=>void,disabled=false)=><button role="menuitem" disabled={disabled} onClick={()=>action(fn)}>{label}</button>;
 const index=parent!.children.indexOf(node.id),last=parent!.children.length-1;
 return createPortal(<div ref={ref} className="floating-selection-toolbar" style={{left:position?.left??0,top:position?.top??0,visibility:position?'visible':'hidden',maxHeight:position?.maxHeight}} onPointerDown={e=>e.stopPropagation()} onKeyDown={e=>{if(!menu||!["ArrowDown","ArrowUp","Home","End"].includes(e.key))return;const items=Array.from(ref.current?.querySelectorAll<HTMLButtonElement>("[role=menuitem]:not(:disabled)")??[]);if(!items.length)return;e.preventDefault();const index=items.indexOf(document.activeElement as HTMLButtonElement);items[e.key==="Home"?0:e.key==="End"?items.length-1:e.key==="ArrowDown"?(index+1)%items.length:(index-1+items.length)%items.length]?.focus();}}>
  <div role="toolbar" aria-label="Selection actions"><button aria-label={node.locked?'Unlock selection':'Lock selection'} disabled={!single||editor.busy||!!parent?.locked} title={node.locked?'Unlock':'Lock'} onClick={lock}>{node.locked?<UnlockKeyhole size={16}/>:<LockKeyhole size={16}/>}</button><button aria-label="Duplicate selection" disabled={!mutable} title="Duplicate" onClick={()=>mutate('duplicate')}><Copy size={16}/></button><button aria-label="Delete selection" disabled={!mutable} title="Delete" onClick={()=>mutate('delete')}><Trash2 size={16}/></button><button aria-label="More selection actions" aria-haspopup="menu" aria-expanded={menu} onClick={()=>{setMenu(!menu);setSubmenu(null);}} title="More"><Ellipsis size={16}/></button>{!single&&<span>{editor.selectedIds.length} selected</span>}</div>
  {menu&&<div role="menu" aria-label="Selection menu" className="selection-action-menu">
   {item('Copy',editor.copy,!single||editor.busy)}{item('Copy style',editor.copyStyle,!single||editor.busy)}{item('Paste',editor.paste,!single||!editor.canPaste||editor.busy||!!node.locked||!!parent?.locked)}{editor.canPasteStyle&&item('Paste style',editor.pasteStyle,!mutable)}{item('Duplicate',()=>mutate('duplicate'),!mutable)}{item('Delete',()=>mutate('delete'),!mutable)}
   <button role="menuitem" aria-haspopup="menu" aria-expanded={submenu==='layer'} disabled={!mutable||parent?.layoutMode!=='free'} aria-label="Layer" onClick={()=>setSubmenu(submenu==='layer'?null:'layer')}>Layer <span>›</span></button>
   {submenu==='layer'&&<div role="menu" aria-label="Layer order" className="selection-action-submenu">{item('Bring to front',()=>layer(last),index===last)}{item('Send to back',()=>layer(0),index===0)}{item('Bring forward',()=>layer(index+1),index===last)}{item('Send backward',()=>layer(index-1),index===0)}</div>}
   <button role="menuitem" aria-haspopup="menu" aria-expanded={submenu==='align'} disabled={!mutable||!alignable} aria-label="Align to page" onClick={()=>setSubmenu(submenu==='align'?null:'align')}>Align to page <span>›</span></button>
   {submenu==='align'&&<div role="menu" aria-label="Page alignment" className="selection-action-submenu">{(['left','center','right','top','middle','bottom'] as Alignment[]).map(mode=><button role="menuitem" key={mode} onClick={()=>action(()=>editor.run({type:'position',ids:[node.id],mode,reference:'page'}))}>{`Align ${mode}`}</button>)}</div>}
   {item(node.locked?'Unlock':'Lock',lock,!single||editor.busy||!!parent?.locked)}
  </div>}
 </div>,document.body);
}
