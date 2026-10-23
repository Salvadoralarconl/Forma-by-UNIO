import {test,expect} from '@playwright/test';
test('two selected shapes merge into one shape and undo restores both',async({page})=>{
 await page.goto('/');await page.getByRole('button',{name:'Elements library',exact:true}).click();
 await page.getByRole('button',{name:'Insert Rectangle',exact:true}).click();
 await page.getByRole('button',{name:'Insert Circle',exact:true}).click();
 await page.getByLabel('Position X',{exact:true}).fill('100');await page.getByLabel('Position X',{exact:true}).press('Enter');
 const shapes=page.getByTestId('artboard').locator('[data-kind="shape"]');
 await shapes.first().click({modifiers:['Shift'],position:{x:5,y:5}});
 const merge=page.getByRole('button',{name:'Merge shapes',exact:true});await expect(merge).toBeVisible();await merge.click();
 await expect(shapes).toHaveCount(1);await expect(shapes.first()).toHaveAttribute('aria-label','Merged shape');
 await page.getByRole('button',{name:'Undo',exact:true}).click();await expect(shapes).toHaveCount(2);
});
test('invisible small-text side targets still resize and scale the font with one undo',async({page})=>{
 await page.goto('/');await page.getByRole('button',{name:'Elements library',exact:true}).click();await page.getByRole('button',{name:'Text',exact:true}).click();await page.getByRole('button',{name:'Insert Heading',exact:true}).click();
 for(const [label,value] of [['Position WIDTH','60'],['Position HEIGHT','28']] as const){await page.getByLabel(label,{exact:true}).fill(value);await page.getByLabel(label,{exact:true}).press('Enter');}
 const text=page.getByTestId('artboard').locator('[data-kind="text"]'),before=await text.boundingBox(),font=await text.evaluate(el=>parseFloat(getComputedStyle(el).fontSize));
 const side=page.getByRole('button',{name:'Resize e',exact:true});await expect(side).toHaveCSS('opacity','0');const b=(await side.boundingBox())!;
 await page.mouse.move(b.x+b.width/2,b.y+b.height/2);await page.mouse.down();await page.mouse.move(b.x+b.width/2+30,b.y+b.height/2);await page.mouse.up();
 const after=(await text.boundingBox())!,scaled=await text.evaluate(el=>parseFloat(getComputedStyle(el).fontSize));expect(after.width).toBeGreaterThan(before!.width);expect(scaled/font).toBeCloseTo(after.width/before!.width,2);
 await page.getByRole('button',{name:'Undo',exact:true}).click();await expect.poll(()=>text.evaluate(el=>parseFloat(getComputedStyle(el).fontSize))).toBe(font);
});
