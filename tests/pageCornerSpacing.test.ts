import {it,expect} from 'vitest';
import {snapFrame,validateGapGuides} from '../src/domain/placement';
import {pageCornerGapCandidates} from '../src/domain/pageCornerSpacing';
it('snaps the bottom inset to the right inset near the lower right corner with one-axis correction',()=>{
 const frame={x:880,y:677,width:100,height:100};
 const c=pageCornerGapCandidates(frame,1000,800,6,64);expect(c[0].axis).toBe('y');expect(c[0].delta).toBe(3);
 const snap=snapFrame(frame,[],1000,800,6);expect(snap.dx).toBe(0);expect(snap.dy).toBe(3);expect(snap.gaps.map(g=>g.value)).toEqual([20,20]);
});
it('supports all four corners, exact matches and stable normalized proximity',()=>{
 for(const x of [20,880])for(const y of [23,677]){const f={x,y,width:100,height:100},c=pageCornerGapCandidates(f,1000,800,6,64)[0];expect(c.axis).toBe('y');expect(Math.abs(c.delta)).toBe(3);}
 expect(pageCornerGapCandidates({x:100,y:97,width:100,height:100},1000,800,6,64)).toHaveLength(0);
 expect(pageCornerGapCandidates({x:100,y:97,width:100,height:100},1000,800,12,128).length).toBeGreaterThan(0);
 expect(pageCornerGapCandidates({x:20,y:20,width:100,height:100},1000,800,6,64)[0].delta).toBe(0);
});
it('does not offer equal-inset guides in the middle, outside the page or beyond snap tolerance',()=>{
 for(const f of [{x:400,y:397,width:100,height:100},{x:-2,y:0,width:100,height:100},{x:20,y:30,width:100,height:100}])expect(pageCornerGapCandidates(f,1000,800,6,64)).toHaveLength(0);
});
it('revalidates both page gaps and recomputes page-edge measurements after resizing',()=>{
 const c=pageCornerGapCandidates({x:880,y:677,width:100,height:100},1000,800,6,64)[0];
 expect(validateGapGuides(c.guides,{x:880,y:680,width:100,height:100}).map(g=>g.value)).toEqual([20,20]);
 expect(validateGapGuides(c.guides,{x:879,y:680,width:100,height:100})).toHaveLength(0);
});
