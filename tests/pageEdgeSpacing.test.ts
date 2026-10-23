import {it,expect} from 'vitest';
import {snapFrame} from '../src/domain/placement';
import {snapResizeFrame} from '../src/domain/resize';
it('centers objects between a page boundary and the closest peer with equal spacing',()=>{
 const f={x:53,y:100,width:100,height:100},peer={x:200,y:100,width:100,height:100};
 const left=snapFrame(f,[peer],500,500,6);expect(left.dx).toBe(-3);expect(left.gaps.filter(g=>g.axis==='x').map(g=>g.value)).toEqual([50,50]);
 const right=snapFrame({...f,x:347},[peer],500,500,6);expect(right.dx).toBe(3);expect(right.gaps.filter(g=>g.axis==='x').map(g=>g.value)).toEqual([50,50]);
 const top=snapFrame({...f,x:100,y:53},[{...peer,x:100,y:200}],500,500,6);expect(top.dy).toBe(-3);
 const blocked=snapFrame(f,[peer,{x:180,y:100,width:10,height:100}],500,500,6);expect(blocked.gaps.filter(g=>g.axis==='x')).toEqual([]);
});
it('snaps a resize edge so the gap to a peer equals the gap to the page boundary',()=>{
 const f={x:30,y:100,width:130,height:100},peer={x:200,y:100,width:100,height:100};
 const result=snapResizeFrame(f,'e',7,0,false,500,500,[peer],6);expect(result.frame.width).toBe(140);expect(result.guides.gaps.map(g=>g.value)).toEqual([30,30]);
});
