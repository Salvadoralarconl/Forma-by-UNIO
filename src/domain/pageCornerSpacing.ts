import type {Frame,GapGuide} from './placement';
import type {CrossAxisCandidate} from './crossAxisSpacing';
export type PageCornerReference={width:number;height:number;horizontal:'start'|'end';vertical:'start'|'end';proximity:number};
export function pageCornerGapGuides(frame:Frame,corner:PageCornerReference,snapAxis:'x'|'y',matchId:string):GapGuide[]{
 const x=corner.horizontal==='start'?frame.x:corner.width-frame.x-frame.width,y=corner.vertical==='start'?frame.y:corner.height-frame.y-frame.height;
 if(x<0||y<0||x>corner.proximity||y>corner.proximity||Math.abs(x-y)>.01)return[];
 const shared={pageCorner:corner,snapAxis,matchId};
 return[
  {axis:'x',start:corner.horizontal==='start'?0:frame.x+frame.width,end:corner.horizontal==='start'?frame.x:corner.width,cross:frame.y+frame.height/2,value:x,...shared},
  {axis:'y',start:corner.vertical==='start'?0:frame.y+frame.height,end:corner.vertical==='start'?frame.y:corner.height,cross:frame.x+frame.width/2,value:y,...shared}
 ];
}
/** Only corner-local margins are options; callers choose one correction globally. */
export function pageCornerGapCandidates(frame:Frame,width:number,height:number,tolerance:number,proximity:number):CrossAxisCandidate[]{
 const result:CrossAxisCandidate[]=[];
 for(const horizontal of ['start','end'] as const)for(const vertical of ['start','end'] as const){
  const gx=horizontal==='start'?frame.x:width-frame.x-frame.width,gy=vertical==='start'?frame.y:height-frame.y-frame.height;
  if(gx<0||gy<0||gx>proximity||gy>proximity||Math.abs(gx-gy)>tolerance)continue;
  const corner={width,height,horizontal,vertical,proximity};
  for(const axis of ['y','x'] as const){
   const edge=axis==='x'?horizontal:vertical,size=axis==='x'?'width':'height',gap=axis==='x'?gy:gx,extent=axis==='x'?width:height;
   const coordinate=edge==='start'?gap:extent-gap,current=frame[axis]+(edge==='end'?frame[size]:0),delta=coordinate-current;
   const moved={...frame,[axis]:frame[axis]+delta},matchId=`page-${horizontal}-${vertical}-${axis}`;
   result.push({axis,edge,coordinate,delta,guides:pageCornerGapGuides(moved,corner,axis,matchId)});
  }
 }
 return result.sort((a,b)=>Math.abs(a.delta)-Math.abs(b.delta)||(a.axis===b.axis?0:a.axis==='y'?-1:1));
}
