import type {Frame,GapGuide} from './placement';
import type {CrossAxisCandidate} from './crossAxisSpacing';
export function pageEdgeGapCandidates(frame:Frame,peers:Frame[],width:number,height:number,tolerance:number):CrossAxisCandidate[]{
 const result:CrossAxisCandidate[]=[];
 for(const axis of ['x','y'] as const){
  const size=axis==='x'?'width':'height',cross=axis==='x'?'y':'x',crossSize=axis==='x'?'height':'width',limit=axis==='x'?width:height;
  const row=peers.filter(p=>Math.min(frame[cross]+frame[crossSize],p[cross]+p[crossSize])>Math.max(frame[cross],p[cross]));
  const before=row.filter(p=>p[axis]+p[size]<=frame[axis]).sort((a,b)=>(b[axis]+b[size])-(a[axis]+a[size]))[0];
  const after=row.filter(p=>p[axis]>=frame[axis]+frame[size]).sort((a,b)=>a[axis]-b[axis])[0];
  if(!!before===!!after)continue;
  const start=before?before[axis]+before[size]:0,end=after?after[axis]:limit,peer=(before??after)!;
  for(const edge of ['start','end'] as const){
   const coordinate=edge==='end'?end-(frame[axis]-start):start+(end-frame[axis]-frame[size]);
   const delta=coordinate-(frame[axis]+(edge==='end'?frame[size]:0));if(Math.abs(delta)>tolerance)continue;
   const a=edge==='start'?coordinate:frame[axis],b=edge==='end'?coordinate:frame[axis]+frame[size],gap=a-start;if(gap<0||b<=a)continue;
   const referenceCross:[number,number]=[peer[cross],peer[cross]+peer[crossSize]],crossAt=(Math.max(frame[cross],referenceCross[0])+Math.min(frame[cross]+frame[crossSize],referenceCross[1]))/2;
   const shared={axis,cross:crossAt,value:gap,referenceCross,snapAxis:axis,movingEdge:edge,movingCoordinate:coordinate,matchId:`page-edge-${axis}-${edge}`};
   const guides:GapGuide[]=[{...shared,start,end:a},{...shared,start:b,end}];result.push({axis,edge,coordinate,delta,guides});
  }
 }
 return result;
}
