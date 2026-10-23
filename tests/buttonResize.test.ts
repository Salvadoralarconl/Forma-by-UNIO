import {it,expect} from 'vitest';
import {resizeFreeFrame,snapResizeFrame} from '../src/domain/resize';
it('clamps button edges and ratio resizing to label dimensions and keeps the opposite anchor',()=>{
 const f={x:100,y:100,width:180,height:60},min={width:70,height:24};
 expect(resizeFreeFrame(f,'s',0,-100,false,1000,800,min)).toEqual({...f,height:24});
 expect(resizeFreeFrame(f,'n',0,100,false,1000,800,min)).toEqual({...f,y:136,height:24});
 expect(snapResizeFrame(f,'s',0,-100,false,1000,800,[],6,min).frame.height).toBe(24);
 expect(resizeFreeFrame(f,'se',-200,-100,false,1000,800,min).height).toBeGreaterThanOrEqual(24);
});
