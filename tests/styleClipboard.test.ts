import {it,expect} from 'vitest';
import {copyAppearance} from '../src/domain/styleClipboard';
it('copies appearance without size, position or layout and clears absent source appearance',()=>{
 const source={background:'#ff0000',opacity:.5,shadow:{x:1,y:2,blur:3,color:'#000000'},width:500,height:200,padding:20,offsetX:50};
 const copied=copyAppearance(source);expect(copied.background).toBe('#ff0000');expect(copied).not.toHaveProperty('width');expect(copied).not.toHaveProperty('padding');expect(copied).not.toHaveProperty('offsetX');expect(copied.borderWidth).toBeUndefined();
 copied.shadow!.x=100;expect(source.shadow.x).toBe(1);
});
