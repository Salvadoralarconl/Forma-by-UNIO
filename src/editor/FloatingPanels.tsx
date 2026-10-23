import {createPortal} from 'react-dom';
import {X} from 'lucide-react';
import {PANEL_IDS,PANEL_NAMES,type PanelId,type WorkspaceController} from './workspace';
import {PanelTab} from './PanelTab';
import './FloatingPanels.css';
export function FloatingPanels({controller,children}:{controller:WorkspaceController;children:Record<PanelId,React.ReactNode>}){
 return createPortal(<>{PANEL_IDS.filter(id=>controller.workspace.panels[id].visible&&controller.workspace.panels[id].side==='floating').map(id=>{const p=controller.workspace.panels[id];return <aside key={id} className="workspace-dock floating-workspace-panel" aria-label={`Floating ${PANEL_NAMES[id]} panel`} style={{left:p.x??320,top:p.y??120}}>
 <div className="dock-tabs" role="tablist" aria-label={`${PANEL_NAMES[id]} floating panel`}><PanelTab id={id} controller={controller} active/><button className="panel-close" aria-label={`Hide ${PANEL_NAMES[id]}`} onClick={()=>controller.toggle(id)}><X size={12}/></button></div>
 <div className="dock-panel-content"><div role="tabpanel" id={`panel-${id}`} aria-labelledby={`tab-${id}`}>{children[id]}</div></div>
 </aside>;})}</>,document.body);
}
