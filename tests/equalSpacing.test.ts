import {describe,it,expect} from 'vitest';
import {snapFrame,constrainSnappedTranslation} from '../src/domain/placement';
const f=(x:number,y=100,width=80,height=60)=>({x,y,width,height});
describe('live equal spacing',()=>{
 it('centers between two peers and reports the two actual gaps',()=>{const s=snapFrame(f(199),[f(50),f(350)],1000,800,6);expect(s.dx).toBe(1);expect(s.gaps?.filter(g=>g.axis==='x').map(g=>g.value)).toEqual([70,70]);});
 it('repeats a neighboring gap at either end horizontally and vertically',()=>{expect(snapFrame(f(347),[f(50),f(200)],1000,800,6).dx).toBe(3);const s=snapFrame(f(100,347,60,80),[f(100,50,60,80),f(100,200,60,80)],1000,1000,6);expect(s.dy).toBe(3);expect(s.gaps?.filter(g=>g.axis==='y').map(g=>g.value)).toEqual([70,70]);expect(snapFrame(f(53),[f(200),f(350)],1000,800,6).dx).toBe(-3);});
 it('does not attract distant rows, overlapping peers or points beyond tolerance',()=>{expect(snapFrame(f(190),[f(50),f(350)],1000,800,6).dx).toBe(0);expect(snapFrame(f(199,500),[f(50),f(350)],1000,800,6).gaps??[]).toEqual([]);expect(snapFrame(f(300),[f(50,100,200),f(200,100,200)],1000,800,6).gaps??[]).toEqual([]);});
 it('obeys zoom-normalized tolerance without accumulating a snap offset',()=>{expect(snapFrame(f(196),[f(50),f(350)],1000,800,3).dx).toBe(0);expect(snapFrame(f(196),[f(50),f(350)],1000,800,12).dx).toBe(4);expect(snapFrame(f(194),[f(50),f(350)],1000,800,3).dx).toBe(0);});
});

it('suppresses gap indicators if a page boundary prevents the snap, and releases cleanly',()=>{
 const bounds=f(50),snap=snapFrame(f(199),[f(50),f(350)],1000,800,6);
 const blocked=constrainSnappedTranslation(bounds,149,0,snap,200,800);
 expect(blocked.dx).toBe(70);
 expect(blocked.guides.gaps?.some(g=>g.axis==='x')).toBe(false);
 const valid=constrainSnappedTranslation(bounds,149,0,snap,1000,800);
 expect(valid.dx).toBe(150);expect(valid.guides.gaps?.filter(g=>g.axis==='x')).toHaveLength(2);
});
it('suppresses horizontal gap guides when a simultaneous vertical snap removes row overlap',()=>{
 const snap=snapFrame(f(199,159),[f(50),f(350)],1000,800,6);
 expect(snap.dx).toBe(1);expect(snap.dy).toBe(1);
 expect(snap.gaps.filter(g=>g.axis==='x')).toHaveLength(0);
});
it('repositions gap cross coordinates inside the final shared row after perpendicular snapping',()=>{
 const snap=snapFrame(f(199,101),[f(50),f(350)],1000,800,6);
 expect(snap.dy).toBe(-1);expect(snap.gaps.filter(g=>g.axis==='x').map(g=>g.cross)).toEqual([130,130]);
});
