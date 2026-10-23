import {it,expect} from 'vitest';
import {snapFrame,constrainSnappedTranslation} from '../src/domain/placement';
import {crossAxisGapCandidates} from '../src/domain/crossAxisSpacing';
const lower=[{x:100,y:200,width:100,height:100},{x:220,y:200,width:100,height:100}];
it('matches the vertical gap below a wide bar to the horizontal gap between lower squares',()=>{
 const bar={x:100,y:78,width:220,height:100},snap=snapFrame(bar,lower,1000,800,6);
 expect(snap.dy).toBe(2);expect(snap.gaps.map(g=>[g.axis,g.value])).toEqual([['x',20],['y',20]]);
});
it('supplies exact edge target for anchored resizing and supports reversed axes',()=>{
 const bar={x:100,y:78,width:220,height:100},c=crossAxisGapCandidates(bar,lower,6).find(c=>c.axis==='y'&&c.edge==='end');
 expect(c?.coordinate).toBe(180);expect(c?.guides.map(g=>g.value)).toEqual([20,20]);
 const rotated=crossAxisGapCandidates({x:78,y:100,width:100,height:220},lower.map(f=>({x:f.y,y:f.x,width:f.height,height:f.width})),6);
 expect(rotated.some(c=>c.axis==='x'&&c.coordinate===180)).toBe(true);
});
it('does not match overlapping reference shapes, distant rows, or gaps beyond tolerance',()=>{
 expect(crossAxisGapCandidates({x:100,y:60,width:220,height:100},lower,6)).toHaveLength(0);
 expect(crossAxisGapCandidates({x:100,y:78,width:220,height:100},[lower[0],{...lower[1],x:180}],6)).toHaveLength(0);
 expect(crossAxisGapCandidates({x:100,y:78,width:220,height:100},lower.map(f=>({...f,x:f.x+2000})),6)).toHaveLength(0);
});
it('suppresses both labels if clamp prevents cross-axis matching',()=>{
 const bar={x:100,y:78,width:220,height:100},snap=snapFrame(bar,lower,1000,800,6);
 expect(constrainSnappedTranslation(bar,0,0,snap,1000,178).guides.gaps).toHaveLength(0);
});
it('rejects a reference gap interrupted by another shape',()=>{
 const bar={x:100,y:78,width:220,height:100};
 const candidates=crossAxisGapCandidates(bar,[...lower,{x:205,y:200,width:10,height:100}],6);
 expect(candidates.some(c=>c.guides.some(g=>g.value===20))).toBe(false);
});
it('rejects an occupied actual vertical gap',()=>{
 const candidates=crossAxisGapCandidates({x:100,y:78,width:220,height:100},[...lower,{x:100,y:185,width:220,height:10}],6);
 expect(candidates.some(c=>c.axis==='y'&&c.coordinate===180)).toBe(false);
});
