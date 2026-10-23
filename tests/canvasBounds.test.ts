import {describe,it,expect} from 'vitest';
import {constrainTranslation} from '../src/domain/placement';
import {resizeFreeFrame,type Handle} from '../src/domain/resize';

describe('fixed page canvas bounds',()=>{
 it('recovers oversized content without jumping or changing its dimensions',()=>{
  const bounds={x:200,y:300,width:700,height:900};
  expect(constrainTranslation(bounds,0,0,600,100)).toEqual({dx:0,dy:0});
  expect(constrainTranslation(bounds,-30,-40,600,100)).toEqual({dx:-30,dy:-40});
  expect(constrainTranslation(bounds,-1000,-1000,600,100)).toEqual({dx:-200,dy:-300});
  expect(constrainTranslation(bounds,50,50,600,100)).toEqual({dx:0,dy:0});
 });
 it('keeps ordinary multi-selection bounds on the page',()=>{
  expect(constrainTranslation({x:20,y:30,width:100,height:80},1000,-1000,600,400)).toEqual({dx:480,dy:-30});
 });
 it.each(['nw','n','ne','e','se','s','sw','w'] as Handle[])('%s keeps opposite anchors and minimum sizes under extreme drags',handle=>{
  const f={x:200,y:200,width:120,height:80};
  for(const delta of [-10000,10000])for(const locked of [false,true]){
   const result=resizeFreeFrame(f,handle,delta,delta,locked,600,400);
   expect(result.width).toBeGreaterThanOrEqual(12);expect(result.height).toBeGreaterThanOrEqual(12);
   expect(result.x).toBeGreaterThanOrEqual(0);expect(result.y).toBeGreaterThanOrEqual(0);
   expect(result.x+result.width).toBeLessThanOrEqual(600.00001);expect(result.y+result.height).toBeLessThanOrEqual(400.00001);
   if(handle.includes('w'))expect(result.x+result.width).toBeCloseTo(f.x+f.width);
   if(handle.includes('n'))expect(result.y+result.height).toBeCloseTo(f.y+f.height);
   if(handle.includes('e'))expect(result.x).toBeCloseTo(f.x);
   if(handle.includes('s'))expect(result.y).toBeCloseTo(f.y);
   if(locked||handle.length===2)expect(result.width/result.height).toBeCloseTo(f.width/f.height);
  }
 });
});
