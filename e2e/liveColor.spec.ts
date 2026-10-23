import {test,expect} from '@playwright/test';
test('color changes reach the shape live, Enter applies typed color, and Undo restores it',async({page})=>{
 await page.goto('/');await page.getByRole('button',{name:'Elements library',exact:true}).click();await page.getByRole('button',{name:'Insert Rectangle',exact:true}).click();
 const fill=page.getByLabel('Fill color',{exact:true});await fill.fill('#ffffff');await fill.press('Enter');
 await page.getByRole('button',{name:'Open Fill color picker',exact:true}).click();
 await page.getByLabel('Fill color Hue',{exact:true}).fill('240');await page.getByLabel('Fill color Saturation',{exact:true}).fill('100');
 const path=page.getByTestId('artboard').locator('[data-kind="shape"]>path').first();await expect(path).toHaveAttribute('fill','#0000ff');
 await page.getByLabel('Fill color Alpha',{exact:true}).fill('50');await expect(path).toHaveAttribute('fill','#0000ff80');
 await page.getByLabel('Fill color R',{exact:true}).fill('128');await page.getByLabel('Fill color R',{exact:true}).press('Enter');await expect(path).toHaveAttribute('fill','#8000ff80');
 await fill.fill('#123456');await fill.press('Enter');await expect(path).toHaveAttribute('fill','#123456');
 await page.getByRole('button',{name:'Undo',exact:true}).click();await expect(path).toHaveAttribute('fill','#8000ff80');
});
test('shape position changes stacking without moving the shapes',async({page})=>{
 await page.goto('/');await page.getByRole('button',{name:'Elements library',exact:true}).click();
 await page.getByRole('button',{name:'Insert Rectangle',exact:true}).click();await page.getByLabel('Layer name',{exact:true}).fill('Back shape');await page.getByLabel('Layer name',{exact:true}).press('Enter');
 await page.getByRole('button',{name:'Insert Rectangle',exact:true}).click();await page.getByLabel('Layer name',{exact:true}).fill('Front shape');await page.getByLabel('Layer name',{exact:true}).press('Enter');
 const shapes=page.getByTestId('artboard').locator('[data-kind="shape"]'),before=await shapes.evaluateAll(els=>els.map(el=>({id:el.getAttribute('data-node-id'),left:(el as HTMLElement).style.left,top:(el as HTMLElement).style.top})));
 await page.getByRole('button',{name:'Send to back',exact:true}).click();expect(await shapes.evaluateAll(els=>els.map(el=>el.getAttribute('data-node-id')))).toEqual([before[1].id,before[0].id]);
 await page.getByRole('button',{name:'Bring to front',exact:true}).click();expect(await shapes.evaluateAll(els=>els.map(el=>({id:el.getAttribute('data-node-id'),left:(el as HTMLElement).style.left,top:(el as HTMLElement).style.top})))).toEqual(before);
 await page.getByRole('button',{name:'Send backward',exact:true}).click();await page.getByRole('button',{name:'Bring forward',exact:true}).click();expect(await shapes.evaluateAll(els=>els.map(el=>el.getAttribute('data-node-id')))).toEqual(before.map(n=>n.id));
});
test('four spacing boxes move only the selected object and support Enter and Undo',async({page})=>{
 await page.goto('/');await page.getByRole('button',{name:'Elements library',exact:true}).click();
 const set=async(label:string,value:number)=>{await page.getByLabel(label,{exact:true}).fill(String(value));await page.getByLabel(label,{exact:true}).press('Enter');};
 for(const x of [50,250,450]){await page.getByRole('button',{name:'Insert Rectangle',exact:true}).click();await set('Position X',x);await set('Position Y',100);}
 const shapes=page.getByTestId('artboard').locator('[data-kind="shape"]');await shapes.nth(1).click();
 await expect(page.getByLabel('Spacing Left',{exact:true})).toHaveValue('80');await set('Spacing Left',30);await expect(page.getByLabel('Position X',{exact:true})).toHaveValue('200');
 await expect(shapes.nth(0)).toHaveCSS('left','50px');await expect(shapes.nth(2)).toHaveCSS('left','450px');
 await page.getByRole('button',{name:'Undo',exact:true}).click();await expect(page.getByLabel('Position X',{exact:true})).toHaveValue('250');
 await set('Spacing Right',25);await expect(page.getByLabel('Position X',{exact:true})).toHaveValue('305');
 await set('Spacing Top',50);await expect(page.getByLabel('Position Y',{exact:true})).toHaveValue('50');
 await set('Spacing Bottom',100);await expect(page.getByLabel('Position Y',{exact:true})).toHaveValue('560');
});
