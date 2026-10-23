import type {DockSide} from './workspace';
type Target={left:number;top:number;width:number;height:number};
export type DockTargets=Record<DockSide,Target>;
export function dockDropSide(x:number,y:number,targets:DockTargets):DockSide|'floating'{
 for(const side of ['left','right'] as const){const r=targets[side];if(x>=r.left&&x<=r.left+r.width&&y>=r.top&&y<=r.top+r.height)return side;}
 return 'floating';
}
export function readDockTargets(widths:Record<DockSide,number>):DockTargets{
 const workspace=document.querySelector('main.workspace')!.getBoundingClientRect(),tools=document.querySelector('.tool-strip')?.getBoundingClientRect();
 const target=(side:DockSide):Target=>{
  const dock=document.querySelector(`.workspace-dock.dock-${side}`)?.getBoundingClientRect();
  if(dock)return {left:dock.left,top:dock.top,width:dock.width,height:dock.height};
  return {left:side==='left'?(tools?.right??workspace.left):workspace.right-widths.right,top:workspace.top,width:widths[side],height:workspace.height};
 };
 return {left:target('left'),right:target('right')};
}
