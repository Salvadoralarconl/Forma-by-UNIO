import {it,expect} from 'vitest';
import {snapResizeFrame} from '../src/domain/resize';
const f={x:100,y:100,width:120,height:120};
it('snaps a moving side to a peer edge while preserving the opposite anchor',()=>{
 const result=snapResizeFrame(f,'e',77,0,false,1000,800,[{x:300,y:300,width:100,height:100}],6);
 expect(result.frame).toEqual({...f,width:200});expect(result.guides.x).toBe(300);
});
it('preserves corner proportions and ignores targets outside the screen-normalized threshold',()=>{
 const peer={x:300,y:300,width:100,height:100};
 const result=snapResizeFrame(f,'se',77,77,false,1000,800,[peer],6);
 expect(result.frame.width).toBe(200);expect(result.frame.height).toBe(200);expect(result.guides.x).toBe(300);expect(result.guides.y).toBe(300);
 expect(snapResizeFrame(f,'e',70,0,false,1000,800,[peer],3).frame.width).toBe(190);
});
it('keeps west/north opposite anchors and ratio-locked side centers fixed',()=>{
 const peers=[{x:50,y:50,width:20,height:20}];
 const west=snapResizeFrame(f,'w',-27,0,false,1000,800,peers,6).frame;
 expect(west.x).toBe(70);expect(west.x+west.width).toBe(220);
 const north=snapResizeFrame(f,'n',0,-27,false,1000,800,peers,6).frame;
 expect(north.y).toBe(70);expect(north.y+north.height).toBe(220);
 const locked=snapResizeFrame(f,'e',77,0,true,1000,800,[{x:300,y:400,width:50,height:50}],6).frame;
 expect(locked.width).toBe(200);expect(locked.height).toBe(200);expect(locked.y+locked.height/2).toBe(160);
});
it('snaps the bottom of a top bar to the same gap as the lower objects have between them',()=>{
 const bar={x:100,y:50,width:260,height:100},peers=[{x:100,y:200,width:120,height:100},{x:240,y:200,width:120,height:100}];
 const result=snapResizeFrame(bar,'s',0,27,false,1000,800,peers,6);
 expect(result.frame.height).toBe(130);expect(result.guides.gaps.map(g=>[g.axis,g.value])).toEqual([['x',20],['y',20]]);
});
it('shows equal page insets only near page sides during side resize',()=>{
 const near={x:360,y:360,width:120,height:100};
 const result=snapResizeFrame(near,'s',0,17,false,500,500,[],6);
 expect(result.frame.height).toBe(120);expect(result.guides.gaps.map(g=>g.value)).toEqual([20,20]);
 expect(snapResizeFrame({x:100,y:100,width:120,height:100},'s',0,17,false,500,500,[],6).guides.gaps).toHaveLength(0);
});
