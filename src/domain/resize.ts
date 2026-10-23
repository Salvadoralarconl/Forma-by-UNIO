import {validateGapGuides,type Frame,type GapGuide} from './placement';
import {crossAxisGapCandidates} from './crossAxisSpacing';
import {pageCornerGapCandidates} from './pageCornerSpacing';
export type Handle='nw'|'n'|'ne'|'e'|'se'|'s'|'sw'|'w';
export function resizeFreeFrame(f:Frame,handle:Handle,dx:number,dy:number,locked:boolean,pageWidth:number,pageHeight:number):Frame{
 const west=handle.includes('w'),east=handle.includes('e'),north=handle.includes('n'),south=handle.includes('s'),corner=(west||east)&&(north||south),right=Math.max(pageWidth,f.x+f.width),bottom=Math.max(pageHeight,f.y+f.height);
 let w=Math.max(12,f.width+(east?dx:west?-dx:0)),h=Math.max(12,f.height+(south?dy:north?-dy:0));
 const maxW=west?f.x+f.width:east?right-f.x:2*Math.min(f.x+f.width/2,right-f.x-f.width/2),maxH=north?f.y+f.height:south?bottom-f.y:2*Math.min(f.y+f.height/2,bottom-f.y-f.height/2);
 if(corner||locked){const sx=w/f.width,sy=h/f.height,requested=corner?(Math.abs(sx-1)>=Math.abs(sy-1)?sx:sy):(west||east?sx:sy),min=Math.max(12/f.width,12/f.height),max=Math.min(maxW/f.width,maxH/f.height),scale=Math.max(min,Math.min(Math.max(min,max),requested));w=f.width*scale;h=f.height*scale;}else{w=Math.min(Math.max(12,maxW),w);h=Math.min(Math.max(12,maxH),h);}
 const x=west?f.x+f.width-w:!east&&locked?f.x+(f.width-w)/2:f.x,y=north?f.y+f.height-h:!south&&locked?f.y+(f.height-h)/2:f.y;
 return{x:Math.max(0,x),y:Math.max(0,y),width:w,height:h};
}

/** Resize only through the existing anchor/ratio constraints; never snap by translating. */
export function snapResizeFrame(f:Frame,handle:Handle,dx:number,dy:number,locked:boolean,width:number,height:number,peers:Frame[],tolerance:number){
 const base=resizeFreeFrame(f,handle,dx,dy,locked,width,height),horizontal=handle.includes('w')||handle.includes('e'),vertical=handle.includes('n')||handle.includes('s'),ratio=horizontal&&vertical||locked;
 const targets={x:[0,width/2,width,...peers.flatMap(p=>[p.x,p.x+p.width/2,p.x+p.width])],y:[0,height/2,height,...peers.flatMap(p=>[p.y,p.y+p.height/2,p.y+p.height])]};
 const coordinates=(frame:Frame,axis:'x'|'y')=>axis==='x'?[handle.includes('w')?frame.x:frame.x+frame.width,frame.x+frame.width/2]:[handle.includes('n')?frame.y:frame.y+frame.height,frame.y+frame.height/2];
 let frame=base,best=Infinity,gaps:GapGuide[]=[];
 for(const axis of ['x','y'] as const){if(axis==='x'?!horizontal:!vertical)continue;const negative=axis==='x'?handle.includes('w'):handle.includes('n'),start=axis==='x'?f.x:f.y,size=axis==='x'?f.width:f.height,anchor=negative?start+size:start;
  for(const target of targets[axis])for(const center of [false,true]){
   const requested=(negative?anchor-target:target-anchor)*(center?2:1);if(requested<12)continue;
   const w=axis==='x'?requested:ratio?f.width*requested/f.height:base.width,h=axis==='y'?requested:ratio?f.height*requested/f.width:base.height;
   const candidate=resizeFreeFrame(f,handle,(handle.includes('w')?-1:1)*(w-f.width),(handle.includes('n')?-1:1)*(h-f.height),locked,width,height);
   const shift=Math.max(horizontal?Math.abs(coordinates(candidate,'x')[0]-coordinates(base,'x')[0]):0,vertical?Math.abs(coordinates(candidate,'y')[0]-coordinates(base,'y')[0]):0);
   if(Math.abs(coordinates(candidate,axis)[center?1:0]-target)<.01&&shift<=tolerance&&shift<best){frame=candidate;best=shift;}
  }
 }
 for(const candidate of [...crossAxisGapCandidates(base,peers,tolerance),...pageCornerGapCandidates(base,width,height,tolerance,tolerance*64/6)]){
  const axis=candidate.axis,active=axis==='x'?horizontal:vertical,negative=axis==='x'?handle.includes('w'):handle.includes('n');if(!active||candidate.edge!==(negative?'start':'end'))continue;
  const anchor=axis==='x'?(negative?f.x+f.width:f.x):(negative?f.y+f.height:f.y),requested=negative?anchor-candidate.coordinate:candidate.coordinate-anchor;
  if(requested<12)continue;
  const w=axis==='x'?requested:ratio?f.width*requested/f.height:base.width,h=axis==='y'?requested:ratio?f.height*requested/f.width:base.height;
  const next=resizeFreeFrame(f,handle,(handle.includes('w')?-1:1)*(w-f.width),(handle.includes('n')?-1:1)*(h-f.height),locked,width,height);
  const shift=Math.max(horizontal?Math.abs(coordinates(next,'x')[0]-coordinates(base,'x')[0]):0,vertical?Math.abs(coordinates(next,'y')[0]-coordinates(base,'y')[0]):0),valid=validateGapGuides(candidate.guides,next);
  if(valid.length===candidate.guides.length&&shift<=tolerance&&shift<best){frame=next;best=shift;gaps=valid;}
 }
 const guide=(axis:'x'|'y')=>(axis==='x'?horizontal:vertical)?targets[axis].find(target=>coordinates(frame,axis).some(value=>Math.abs(value-target)<.01)):undefined;
 return{frame,guides:{x:guide('x'),y:guide('y'),gaps}};
}
