import { useRef } from 'react';
import { ArrowLeftToLine, ArrowRightToLine, X } from 'lucide-react';
import { PANEL_IDS,PANEL_NAMES,resizeDock,type DockSide,type PanelId,type WorkspaceController } from './workspace';
export function Dock({side,controller,children}:{side:DockSide;controller:WorkspaceController;children:Record<PanelId,React.ReactNode>}){
  const {workspace,activate,move,toggle,setWorkspace}=controller;
  const ids=PANEL_IDS.filter(id=>workspace.panels[id].visible&&workspace.panels[id].side===side);
  const active=workspace.active[side]??ids[0];
  const gesture=useRef<{x:number;width:number}|null>(null);
  if(!ids.length)return null;
  return <aside className={`workspace-dock dock-${side}`} style={{width:workspace.widths[side]}} aria-label={`${side} panel dock`}>
    <div className="dock-tabs" role="tablist" aria-label={`${side} panels`}>{ids.map(id=><button key={id} role="tab" id={`tab-${id}`} aria-controls={`panel-${id}`} aria-selected={active===id} tabIndex={active===id?0:-1} onClick={()=>activate(side,id)} onKeyDown={event=>{
      const index=ids.indexOf(id);let target:PanelId|undefined;
      if(event.key==='ArrowRight')target=ids[(index+1)%ids.length];if(event.key==='ArrowLeft')target=ids[(index+ids.length-1)%ids.length];if(event.key==='Home')target=ids[0];if(event.key==='End')target=ids.at(-1);
      if(target){event.preventDefault();activate(side,target);document.getElementById(`tab-${target}`)?.focus();}
    }}>{PANEL_NAMES[id]}</button>)}</div>
    <div className="dock-panel-actions"><span>{PANEL_NAMES[active]}</span><button aria-label={`Move ${PANEL_NAMES[active]} ${side==='left'?'right':'left'}`} title="Move to other dock" onClick={()=>move(active,side==='left'?'right':'left')}>{side==='left'?<ArrowRightToLine size={12}/>:<ArrowLeftToLine size={12}/>}</button><button aria-label={`Hide ${PANEL_NAMES[active]}`} title="Hide panel" onClick={()=>toggle(active)}><X size={12}/></button></div>
    <div className="dock-panel-content">{PANEL_IDS.filter(id=>workspace.panels[id].side===side).map(id=><div key={id} role="tabpanel" id={`panel-${id}`} aria-labelledby={`tab-${id}`} hidden={active!==id||!ids.includes(id)}>{children[id]}</div>)}</div>
    <div className="dock-resizer" role="separator" aria-label={`Resize ${side} dock`} aria-orientation="vertical" aria-valuenow={workspace.widths[side]} aria-valuemin={180} aria-valuemax={380} tabIndex={0}
      onKeyDown={e=>{if(e.key==='ArrowLeft'||e.key==='ArrowRight'){e.preventDefault();const direction=(e.key==='ArrowRight'?1:-1)*(side==='left'?1:-1);setWorkspace(p=>resizeDock(p,side,p.widths[side]+direction*16,window.innerWidth));}}}
      onPointerDown={e=>{gesture.current={x:e.clientX,width:workspace.widths[side]};e.currentTarget.setPointerCapture(e.pointerId);e.preventDefault();}}
      onPointerMove={e=>{if(gesture.current){const value=gesture.current.width+(e.clientX-gesture.current.x)*(side==='left'?1:-1);setWorkspace(p=>resizeDock(p,side,value,window.innerWidth));}}}
      onPointerUp={e=>{gesture.current=null;e.currentTarget.releasePointerCapture(e.pointerId);}} onPointerCancel={()=>{gesture.current=null;}} onLostPointerCapture={()=>{gesture.current=null;}}/>
  </aside>;
}
