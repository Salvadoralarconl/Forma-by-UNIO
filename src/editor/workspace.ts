import { useEffect, useState } from 'react';
import { z } from 'zod';
export const PANEL_IDS=['elements','properties','layers'] as const;
export type PanelId=typeof PANEL_IDS[number];
export type DockSide='left'|'right';
export const PANEL_NAMES:Record<PanelId,string>={elements:'Elements',properties:'Properties',layers:'Layers & Pages'};
const panel=z.object({side:z.enum(['left','right','floating']),visible:z.boolean(),x:z.number().finite().optional(),y:z.number().finite().optional()});
const schema=z.object({version:z.literal(1),panels:z.object({elements:panel,properties:panel,layers:panel}),widths:z.object({left:z.number().min(180).max(380),right:z.number().min(180).max(380)}),active:z.object({left:z.enum(PANEL_IDS).nullable(),right:z.enum(PANEL_IDS).nullable()})});
export type Workspace=z.infer<typeof schema>;
export function defaultWorkspace():Workspace{return {version:1,panels:{elements:{side:'left',visible:false},properties:{side:'right',visible:true},layers:{side:'right',visible:true}},widths:{left:220,right:260},active:{left:null,right:'properties'}};}
export function normalizeWorkspace(value:unknown):Workspace{
  const parsed=schema.safeParse(value);if(!parsed.success)return defaultWorkspace();
  const result=parsed.data;
  for(const side of ['left','right'] as const){const active=result.active[side];if(!active||!result.panels[active].visible||result.panels[active].side!==side)result.active[side]=PANEL_IDS.find(id=>result.panels[id].visible&&result.panels[id].side===side)??null;}
  return result;
}
export function movePanel(p:Workspace,id:PanelId,side:DockSide):Workspace{const next=structuredClone(p);next.panels[id]={visible:true,side};next.active[side]=id;return normalizeWorkspace(next);}
export function floatPanel(p:Workspace,id:PanelId,point:{x:number;y:number}):Workspace{const next=structuredClone(p);next.panels[id]={visible:true,side:'floating',...point};return normalizeWorkspace(next);}
export function panelDropSide(x:number,width:number):DockSide|'floating'{return x<160?'left':x>width-160?'right':'floating';}
export function togglePanel(p:Workspace,id:PanelId):Workspace{const next=structuredClone(p);next.panels[id].visible=!next.panels[id].visible;const side=next.panels[id].side;if(next.panels[id].visible&&side!=='floating')next.active[side]=id;return normalizeWorkspace(next);}
export function resizeDock(p:Workspace,side:DockSide,value:number,windowWidth:number):Workspace{
  const other=side==='left'?'right':'left';
  const otherVisible=PANEL_IDS.some(id=>p.panels[id].visible&&p.panels[id].side===other);
  const max=Math.max(180,Math.min(380,windowWidth-42-460-(otherVisible?p.widths[other]:0)));
  return {...p,widths:{...p.widths,[side]:Math.max(180,Math.min(max,value))}};
}
export function fitWorkspace(p:Workspace,windowWidth:number):Workspace{const next=resizeDock(resizeDock(p,'left',p.widths.left,windowWidth),'right',p.widths.right,windowWidth);for(const id of PANEL_IDS){const panel=next.panels[id];if(panel.side==='floating')next.panels={...next.panels,[id]:{...panel,x:Math.max(8,Math.min(windowWidth-280,panel.x??300)),y:Math.max(68,Math.min(window.innerHeight-100,panel.y??120))}};}return next;}
export function useWorkspace(){
  const [workspace,setWorkspace]=useState<Workspace>(()=>{try{return normalizeWorkspace(JSON.parse(localStorage.getItem('forma.workspace.v1')??'null'));}catch{return defaultWorkspace();}});
  useEffect(()=>{try{localStorage.setItem('forma.workspace.v1',JSON.stringify(workspace));}catch{}},[workspace]);
  useEffect(()=>{const fit=()=>setWorkspace(p=>{const next=fitWorkspace(p,Math.max(1020,window.innerWidth));return JSON.stringify(next)===JSON.stringify(p)?p:next;});fit();window.addEventListener('resize',fit);return()=>window.removeEventListener('resize',fit);},[workspace.panels.elements.visible,workspace.panels.elements.side,workspace.panels.properties.visible,workspace.panels.properties.side,workspace.panels.layers.visible,workspace.panels.layers.side]);
  return {workspace,setWorkspace,reset:()=>setWorkspace(defaultWorkspace()),show:(id:PanelId)=>setWorkspace(p=>p.panels[id].side==='floating'?normalizeWorkspace({...p,panels:{...p.panels,[id]:{...p.panels[id],visible:true}}}):movePanel(p,id,p.panels[id].side as DockSide)),toggle:(id:PanelId)=>setWorkspace(p=>togglePanel(p,id)),move:(id:PanelId,side:DockSide)=>setWorkspace(p=>movePanel(p,id,side)),float:(id:PanelId,point:{x:number;y:number})=>setWorkspace(p=>floatPanel(p,id,point)),activate:(side:DockSide,id:PanelId)=>setWorkspace(p=>({...p,active:{...p.active,[side]:id}}))};
}
export type WorkspaceController=ReturnType<typeof useWorkspace>;
