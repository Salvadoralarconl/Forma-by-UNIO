import {it,expect} from 'vitest';
import {dockDropSide} from '../src/editor/dockTargets';
it('uses full resized column bounds, excludes the tool strip and areas above/below the workspace',()=>{
 const targets={left:{left:42,top:60,width:340,height:800},right:{left:1150,top:60,width:290,height:800}};
 expect(dockDropSide(370,400,targets)).toBe('left');expect(dockDropSide(1160,400,targets)).toBe('right');
 expect(dockDropSide(20,400,targets)).toBe('floating');expect(dockDropSide(100,30,targets)).toBe('floating');expect(dockDropSide(1200,900,targets)).toBe('floating');expect(dockDropSide(700,400,targets)).toBe('floating');
});
