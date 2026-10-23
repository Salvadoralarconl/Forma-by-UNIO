import type {Frame} from './placement';
export type SpacingSide='top'|'bottom'|'left'|'right';
export function surroundingGaps(frame:Frame,peers:Frame[],width:number,height:number){
 const overlap=(a:number,size:number,b:number,otherSize:number)=>Math.min(a+size,b+otherSize)>Math.max(a,b);
 const rows=peers.filter(p=>overlap(frame.y,frame.height,p.y,p.height)),columns=peers.filter(p=>overlap(frame.x,frame.width,p.x,p.width));
 const edges={left:Math.max(0,...rows.filter(p=>p.x+p.width<=frame.x).map(p=>p.x+p.width)),right:Math.min(width,...rows.filter(p=>p.x>=frame.x+frame.width).map(p=>p.x)),top:Math.max(0,...columns.filter(p=>p.y+p.height<=frame.y).map(p=>p.y+p.height)),bottom:Math.min(height,...columns.filter(p=>p.y>=frame.y+frame.height).map(p=>p.y))};
 return{left:{edge:edges.left,gap:frame.x-edges.left},right:{edge:edges.right,gap:edges.right-frame.x-frame.width},top:{edge:edges.top,gap:frame.y-edges.top},bottom:{edge:edges.bottom,gap:edges.bottom-frame.y-frame.height}};
}
export function setSurroundingGap(frame:Frame,peers:Frame[],width:number,height:number,side:SpacingSide,gap:number):Frame{
 if(!Number.isFinite(gap)||gap<0||gap>5000)throw new Error('Spacing must be between 0 and 5000 px.');
 const edge=surroundingGaps(frame,peers,width,height)[side].edge,next={...frame};
 if(side==='left')next.x=edge+gap;if(side==='right')next.x=edge-gap-frame.width;if(side==='top')next.y=edge+gap;if(side==='bottom')next.y=edge-gap-frame.height;
 if(next.x<0||next.y<0||next.x+next.width>width||next.y+next.height>height)throw new Error('That spacing would place the object outside the page.');
 if(Math.abs(surroundingGaps(next,peers,width,height)[side].gap-gap)>.01)throw new Error('That spacing would cross another object. Use a smaller gap.');
 return next;
}
