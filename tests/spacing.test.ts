import {it,expect} from 'vitest';
import {surroundingGaps,setSurroundingGap} from '../src/domain/spacing';
const frame={x:200,y:200,width:100,height:100},peers=[{x:50,y:200,width:100,height:100},{x:400,y:200,width:100,height:100},{x:200,y:50,width:100,height:100},{x:200,y:400,width:100,height:100}];
it('measures nearest same-row/column neighbors and edits each gap without resizing',()=>{
 expect(Object.fromEntries(Object.entries(surroundingGaps(frame,peers,800,800)).map(([k,v])=>[k,v.gap]))).toEqual({left:50,right:100,top:50,bottom:100});
 for(const side of ['left','right','top','bottom'] as const){const next=setSurroundingGap(frame,peers,800,800,side,25);expect(surroundingGaps(next,peers,800,800)[side].gap).toBe(25);expect(next.width).toBe(100);expect(next.height).toBe(100);}
});
it('uses page edges when no neighbor exists and rejects impossible gaps',()=>{
 expect(setSurroundingGap(frame,[],800,800,'right',30).x).toBe(670);
 expect(setSurroundingGap(frame,[],800,800,'bottom',30).y).toBe(670);
 expect(()=>setSurroundingGap(frame,peers,800,800,'right',500)).toThrow();
 expect(()=>setSurroundingGap(frame,[],800,800,'left',NaN)).toThrow();
 expect(surroundingGaps(frame,[{x:50,y:600,width:100,height:50}],800,800).left.edge).toBe(0);
 expect(()=>setSurroundingGap({x:250,y:200,width:100,height:100},[{x:100,y:200,width:100,height:100},{x:450,y:200,width:50,height:100}],800,800,'left',300)).toThrow('cross another object');
});
