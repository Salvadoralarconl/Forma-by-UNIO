import type {Project,DesignNode} from './model';
import {crossAxisGapCandidates} from './crossAxisSpacing';
import {pageCornerGapCandidates,pageCornerGapGuides,type PageCornerReference} from './pageCornerSpacing';
export type Frame=NonNullable<DesignNode['frame']>;
export type Alignment='left'|'center'|'right'|'top'|'middle'|'bottom'|'horizontal'|'vertical';
// Keep a normal selection on the page, while allowing oversized/off-page content
// to move back into view after the page has intentionally been shortened.
export function constrainTranslation(bounds:Frame,dx:number,dy:number,width:number,height:number){
 return{dx:Math.max(-bounds.x,Math.min(Math.max(0,width-bounds.x-bounds.width),dx)),dy:Math.max(-bounds.y,Math.min(Math.max(0,height-bounds.y-bounds.height),dy))};
}
export function unionBounds(frames:Frame[]):Frame{const x=Math.min(...frames.map(f=>f.x)),y=Math.min(...frames.map(f=>f.y));return{x,y,width:Math.max(...frames.map(f=>f.x+f.width))-x,height:Math.max(...frames.map(f=>f.y+f.height))-y};}
export function alignedFrames(nodes:DesignNode[],bounds:Frame,mode:Alignment):{id:string;frame:Frame}[]{
 if(!nodes.length||nodes.some(n=>!n.frame))throw new Error('Choose freely placed elements.');
 if(mode==='horizontal'||mode==='vertical'){if(nodes.length<3)throw new Error('Select at least three elements to distribute.');const horizontal=mode==='horizontal',key=horizontal?'x':'y',size=horizontal?'width':'height';const sorted=[...nodes].sort((a,b)=>a.frame![key]-b.frame![key]),outer=unionBounds(sorted.map(n=>n.frame!));const gap=(outer[size]-sorted.reduce((sum,n)=>sum+n.frame![size],0))/(nodes.length-1);if(gap<0)throw new Error('Separate overlapping elements before distributing spacing.');let cursor=outer[key];return sorted.map(n=>{const frame={...n.frame!,[key]:cursor};cursor+=n.frame![size]+gap;return{id:n.id,frame};});}
 return nodes.map(n=>{const frame={...n.frame!};if(mode==='left')frame.x=bounds.x;if(mode==='center')frame.x=bounds.x+(bounds.width-frame.width)/2;if(mode==='right')frame.x=bounds.x+bounds.width-frame.width;if(mode==='top')frame.y=bounds.y;if(mode==='middle')frame.y=bounds.y+(bounds.height-frame.height)/2;if(mode==='bottom')frame.y=bounds.y+bounds.height-frame.height;return{id:n.id,frame};});
}
export function freeSelection(p:Project,ids:string[]){const nodes=[...new Set(ids)].map(id=>p.nodes[id]);if(!nodes.length||nodes.some(n=>!n||n.locked||n.hidden||!n.frame))throw new Error('Select unlocked visible free elements.');const parent=Object.values(p.nodes).find(n=>n.children.includes(nodes[0].id));if(!parent||parent.layoutMode!=='free'||parent.locked||nodes.some(n=>!parent.children.includes(n.id)))throw new Error('Position tools require elements on the same free page.');const page=p.pages.find(page=>page.rootId===parent.id);if(!page)throw new Error('Position tools currently support direct page elements.');return{nodes,parent,width:page.width??1440,height:parent.style.height??page.height??780};}
export type GapGuide={axis:'x'|'y';start:number;end:number;cross:number;value:number;referenceCross?:[number,number];snapAxis?:'x'|'y';matchId?:string;movingEdge?:'start'|'end';movingCoordinate?:number;pageCorner?:PageCornerReference};
export type PlacementGuides={x?:number;y?:number;gaps?:GapGuide[]};
// Compare only peers sharing a row/column with the selection. Use consecutive
// peers so an intervening object cannot produce a misleading empty-space guide.
function spacingCandidate(frame:Frame,others:Frame[],axis:'x'|'y',tolerance:number){
 const size=axis==='x'?'width':'height',cross=axis==='x'?'y':'x',crossSize=axis==='x'?'height':'width';
 const peers=others.filter(p=>Math.min(p[cross]+p[crossSize],frame[cross]+frame[crossSize])-Math.max(p[cross],frame[cross])>0).sort((a,b)=>a[axis]-b[axis]);
 let best:{delta:number;gaps:GapGuide[]}|undefined;
 const consider=(position:number,a:Frame,b:Frame,mode:'between'|'before'|'after')=>{
  const delta=position-frame[axis];if(Math.abs(delta)>tolerance||best&&Math.abs(delta)>=Math.abs(best.delta))return;
  const moved={...frame,[axis]:position};const ordered=mode==='between'?[a,moved,b]:mode==='before'?[moved,a,b]:[a,b,moved];
  const commonStart=Math.max(...ordered.map(p=>p[cross])),commonEnd=Math.min(...ordered.map(p=>p[cross]+p[crossSize]));if(commonEnd<=commonStart)return;
  const gaps=ordered.slice(0,2).map((p,i)=>({axis,start:p[axis]+p[size],end:ordered[i+1][axis],cross:(commonStart+commonEnd)/2,value:ordered[i+1][axis]-p[axis]-p[size],referenceCross:[Math.max(a[cross],b[cross]),Math.min(a[cross]+a[crossSize],b[cross]+b[crossSize])] as [number,number]}));
  if(gaps.some(g=>g.value<0))return;best={delta,gaps};
 };
 for(let i=0;i<peers.length-1;i++){const a=peers[i],b=peers[i+1],gap=b[axis]-a[axis]-a[size];if(gap<0)continue;
  if(gap>=frame[size])consider(a[axis]+a[size]+(gap-frame[size])/2,a,b,'between');
  if(i===0)consider(a[axis]-gap-frame[size],a,b,'before');
  if(i===peers.length-2)consider(b[axis]+b[size]+gap,a,b,'after');
 }
 return best;
}
export function validateGapGuides(gaps:GapGuide[],frame:Frame){
 const invalid=new Set<string>();
 const checked=gaps.flatMap(g=>{
  if(g.pageCorner){const updated=pageCornerGapGuides(frame,g.pageCorner,g.snapAxis??g.axis,g.matchId??'page-corner').find(item=>item.axis===g.axis);if(!updated&&g.matchId)invalid.add(g.matchId);return updated?[updated]:[];}
  const axis=g.snapAxis??g.axis,axisSize=axis==='x'?'width':'height';
  const edge=frame[axis]+(g.movingEdge==='end'?frame[axisSize]:0);
  if(g.movingEdge&&g.movingCoordinate!==undefined&&Math.abs(edge-g.movingCoordinate)>.01){if(g.matchId)invalid.add(g.matchId);return[];}
  if(!g.referenceCross)return[g];const key=g.axis==='x'?'y':'x',size=g.axis==='x'?'height':'width';
  const start=Math.max(g.referenceCross[0],frame[key]),end=Math.min(g.referenceCross[1],frame[key]+frame[size]);
  if(end<=start){if(g.matchId)invalid.add(g.matchId);return[];}return[{...g,cross:(start+end)/2}];
 });
 return checked.filter(g=>!g.matchId||!invalid.has(g.matchId));
}
export function snapFrame(frame:Frame,others:Frame[],width:number,height:number,tolerance:number){
 const xs=[0,width/2,width,...others.flatMap(f=>[f.x,f.x+f.width/2,f.x+f.width])],ys=[0,height/2,height,...others.flatMap(f=>[f.y,f.y+f.height/2,f.y+f.height])];
 const nearest=(starts:number[],targets:number[])=>{let best:{delta:number;line:number}|null=null;for(const from of starts)for(const line of targets){const delta=line-from;if(Math.abs(delta)<=tolerance&&(!best||Math.abs(delta)<Math.abs(best.delta)))best={delta,line};}return best;};
 const x=nearest([frame.x,frame.x+frame.width/2,frame.x+frame.width],xs),y=nearest([frame.y,frame.y+frame.height/2,frame.y+frame.height],ys);
 const pageCorner=pageCornerGapCandidates(frame,width,height,tolerance,tolerance*64/6)[0];
 const cross=[...crossAxisGapCandidates(frame,others,tolerance),...(pageCorner?[pageCorner]:[])].sort((a,b)=>Math.abs(a.delta)-Math.abs(b.delta));
 const closest=(axis:'x'|'y')=>{const same=spacingCandidate(frame,others,axis,tolerance),other=cross.find(c=>c.axis===axis);return other&&(!same||Math.abs(other.delta)<Math.abs(same.delta))?{delta:other.delta,gaps:other.guides}:same;};
 const gx=closest('x'),gy=closest('y');
 const useX=gx&&(!x||Math.abs(gx.delta)<Math.abs(x.delta)),useY=gy&&(!y||Math.abs(gy.delta)<Math.abs(y.delta));
 const dx=useX?gx.delta:x?.delta??0,dy=useY?gy.delta:y?.delta??0;
 return{dx,dy,x:useX?undefined:x?.line,y:useY?undefined:y?.line,gaps:validateGapGuides([...(useX?gx.gaps:[]),...(useY?gy.gaps:[])],{...frame,x:frame.x+dx,y:frame.y+dy})};
}

// Suppress annotations when page bounds prevent the advertised snap.
export function constrainSnappedTranslation(bounds:Frame,dx:number,dy:number,snap:ReturnType<typeof snapFrame>,width:number,height:number){
 const final=constrainTranslation(bounds,dx+snap.dx,dy+snap.dy,width,height);
 const validX=Math.abs(final.dx-dx-snap.dx)<.01,validY=Math.abs(final.dy-dy-snap.dy)<.01;
 return{...final,guides:{x:validX?snap.x:undefined,y:validY?snap.y:undefined,gaps:validateGapGuides(snap.gaps.filter(g=>(g.snapAxis??g.axis)==='x'?validX:validY),{...bounds,x:bounds.x+final.dx,y:bounds.y+final.dy})} satisfies PlacementGuides};
}

export function initialFrameSize(n:DesignNode){return{width:typeof n.style.width==='number'?n.style.width:n.geometry?.width??(n.button?176:n.kind==='container'?400:320),height:n.style.height??(n.button?48:n.kind==='text'?Math.max(40,(n.style.fontSize??24)*1.5):n.style.minHeight||240)};}

