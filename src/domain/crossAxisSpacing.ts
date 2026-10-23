import type {Frame,GapGuide} from './placement';
export type CrossAxisCandidate={axis:'x'|'y';edge:'start'|'end';coordinate:number;delta:number;guides:GapGuide[]};
const distance=(a:Frame,b:Frame)=>Math.hypot(Math.max(0,a.x-b.x-b.width,b.x-a.x-a.width),Math.max(0,a.y-b.y-b.height,b.y-a.y-a.height));
/** A bounded local reference set keeps pointer work independent of total peer pairs. */
export function crossAxisGapCandidates(frame:Frame,all:Frame[],tolerance:number):CrossAxisCandidate[]{
 const peers=all.map(p=>({p,d:distance(frame,p)})).filter(v=>v.d<=256).sort((a,b)=>a.d-b.d).slice(0,32).map(v=>v.p),result:CrossAxisCandidate[]=[];
 for(const referenceAxis of ['x','y'] as const){
  const size=referenceAxis==='x'?'width':'height',axis=referenceAxis==='x'?'y':'x',otherSize=referenceAxis==='x'?'height':'width';
  const sorted=[...peers].sort((a,b)=>a[referenceAxis]-b[referenceAxis]);
  for(let i=0;i<sorted.length;i++)for(let j=i+1;j<sorted.length;j++){
   const a=sorted[i],b=sorted[j],gap=b[referenceAxis]-a[referenceAxis]-a[size],lo=Math.max(a[axis],b[axis]),hi=Math.min(a[axis]+a[otherSize],b[axis]+b[otherSize]);
   if(gap<=0||gap>256||hi<=lo)continue;
   // A reference must measure empty space between actual neighboring objects.
   for(const neighbor of peers){
    const crossLo=Math.max(frame[referenceAxis],neighbor[referenceAxis]),crossHi=Math.min(frame[referenceAxis]+frame[size],neighbor[referenceAxis]+neighbor[size]);if(crossHi<=crossLo)continue;
    for(const edge of ['start','end'] as const){
     const coordinate=edge==='end'?neighbor[axis]-gap:neighbor[axis]+neighbor[otherSize]+gap,current=frame[axis]+(edge==='end'?frame[otherSize]:0),delta=coordinate-current;
     if(Math.abs(delta)>tolerance)continue;
     if(all.some(p=>p!==a&&p!==b&&p[referenceAxis]<b[referenceAxis]&&p[referenceAxis]+p[size]>a[referenceAxis]+a[size]&&p[axis]<hi&&p[axis]+p[otherSize]>lo))continue;
     const start=edge==='end'?coordinate:neighbor[axis]+neighbor[otherSize],end=start+gap;
     if(all.some(p=>p!==neighbor&&p[axis]<end&&p[axis]+p[otherSize]>start&&p[referenceAxis]<crossHi&&p[referenceAxis]+p[size]>crossLo))continue;
     const matchId=`cross-${referenceAxis}-${i}-${j}-${neighbor.x}-${neighbor.y}-${edge}`;
     const shared={snapAxis:axis as 'x'|'y',matchId};
     result.push({axis,edge,coordinate,delta,guides:[
      {axis:referenceAxis,start:a[referenceAxis]+a[size],end:b[referenceAxis],cross:(lo+hi)/2,value:gap,...shared},
      {axis,start,end,cross:(crossLo+crossHi)/2,value:gap,referenceCross:[neighbor[referenceAxis],neighbor[referenceAxis]+neighbor[size]],movingEdge:edge,movingCoordinate:coordinate,...shared}
     ]});
    }
   }
  }
 }
 return result.sort((a,b)=>Math.abs(a.delta)-Math.abs(b.delta));
}

