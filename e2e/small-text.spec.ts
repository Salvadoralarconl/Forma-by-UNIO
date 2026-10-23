import {test,expect} from '@playwright/test';
test('small text keeps compact corners without overlapping side handles',async({page})=>{
 await page.goto('/');await page.getByRole('button',{name:'Elements library',exact:true}).click();
 await page.getByRole('button',{name:'Text',exact:true}).click();await page.getByRole('button',{name:'Insert Heading',exact:true}).click();
 for(const [label,value] of [['Position WIDTH','30'],['Position HEIGHT','28']] as const){await page.getByLabel(label,{exact:true}).fill(value);await page.getByLabel(label,{exact:true}).press('Enter');}
 const overlay=page.locator('.text-resize-overlay');await expect(overlay.locator('button')).toHaveCount(4);
 const corners=await overlay.locator('button').evaluateAll(els=>els.map(el=>{const r=el.getBoundingClientRect();return {x:r.x,y:r.y,width:r.width,height:r.height};}));
 for(const c of corners){expect(c.width).toBeCloseTo(6,0);expect(c.height).toBeCloseTo(6,0);}
 for(let i=0;i<corners.length;i++)for(let j=i+1;j<corners.length;j++){const a=corners[i],b=corners[j];expect(a.x+a.width<=b.x||b.x+b.width<=a.x||a.y+a.height<=b.y||b.y+b.height<=a.y).toBeTruthy();}
 await page.getByTestId('artboard').locator('[data-kind="text"]').dblclick();await expect(page.getByRole('textbox',{name:'Edit text',exact:true})).toBeFocused();
});
