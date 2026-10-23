import { describe,it,expect } from 'vitest';
import { parseColor,hsvToHex,colorToHsv,rememberColor } from '../src/editor/colors';
describe('offline color selection',()=>{
  it('normalizes valid hex/RGB values and rejects invalid input',()=>{
    expect(parseColor('#f80')).toBe('#ff8800');expect(parseColor('rgb(255, 0, 128)')).toBe('#ff0080');expect(parseColor('#11223380')).toBe('#11223380');expect(parseColor('#12345')).toBeNull();expect(parseColor('url(https://bad)')).toBeNull();
  });
  it('maps HSV wheel values and alpha to expected colors',()=>{
    expect(hsvToHex({h:0,s:1,v:1,a:1})).toBe('#ff0000');expect(hsvToHex({h:120,s:1,v:1,a:.5})).toBe('#00ff0080');expect(colorToHsv('#0000ff').h).toBeCloseTo(240);
  });
  it('deduplicates committed recent colors with a bounded list',()=>{
    const list=rememberColor(['#ff8800','#112233'],'#f80');expect(list).toEqual(['#ff8800','#112233']);expect(rememberColor(Array.from({length:30},(_,i)=>`#${i.toString(16).padStart(6,'0')}`),'#ffffff')).toHaveLength(16);
  });
});
