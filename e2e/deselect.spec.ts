import {test,expect} from '@playwright/test';
test('empty page/workspace deselects while properties and another shape keep usable selection',async({page})=>{
 await page.goto('/');await page.getByRole('button',{name:'Elements library',exact:true}).click();await page.getByRole('button',{name:'Insert Rectangle',exact:true}).click();
 const board=page.getByTestId('artboard'),shape=board.locator('[data-kind="shape"]');await expect(page.getByRole('toolbar',{name:'Selection actions'})).toBeVisible();
 await page.getByLabel('Position WIDTH',{exact:true}).click();await expect(page.getByRole('toolbar',{name:'Selection actions'})).toBeVisible();
 await board.click({position:{x:5,y:5}});await expect(page.getByRole('toolbar',{name:'Selection actions'})).toHaveCount(0);await expect(board.locator('.is-selected')).toHaveCount(0);await expect(board.locator('.selection-resize-overlay')).toHaveCount(0);
 await shape.click();await expect(page.getByRole('toolbar',{name:'Selection actions'})).toBeVisible();await page.locator('.canvas-viewport').click({position:{x:10,y:10}});await expect(page.getByRole('toolbar',{name:'Selection actions'})).toHaveCount(0);await expect(board.locator('.is-selected')).toHaveCount(0);
 await shape.click();await page.getByRole('button',{name:'Insert Circle',exact:true}).click();await expect(board.getByRole('img',{name:'Circle',exact:true})).toHaveClass(/is-selected/);
});
test('the entire Elements search wrapper receives one focus outline',async({page})=>{
 await page.goto('/');await page.getByRole('button',{name:'Elements library',exact:true}).click();const search=page.getByLabel('Search elements',{exact:true});await search.focus();await search.fill('home');
 await expect(page.locator('.element-search')).toHaveCSS('outline-style','solid');await expect(search).toHaveCSS('outline-style','none');
});
test('holding the wheel pans Design from a resize handle and also pans Preview without changing shapes',async({page})=>{
 await page.goto('/');await page.getByRole('button',{name:'Elements library',exact:true}).click();await page.getByRole('button',{name:'Insert Rectangle',exact:true}).click();const viewport=page.locator('.canvas-viewport');
 const pan=async(x:number,y:number)=>{const before=await viewport.evaluate(el=>({left:el.scrollLeft,top:el.scrollTop}));await page.mouse.move(x,y);await page.mouse.down({button:'middle'});await expect(viewport).toHaveClass(/is-panning/);await page.mouse.move(x-40,y-25);await page.mouse.up({button:'middle'});const after=await viewport.evaluate(el=>({left:el.scrollLeft,top:el.scrollTop,maxLeft:el.scrollWidth-el.clientWidth,maxTop:el.scrollHeight-el.clientHeight}));expect(after.left).toBeCloseTo(Math.min(before.left+40,after.maxLeft),0);expect(after.top).toBeCloseTo(Math.min(before.top+25,after.maxTop),0);await expect(viewport).not.toHaveClass(/is-panning/);};
 const handle=(await page.getByRole('button',{name:'Resize e',exact:true}).boundingBox())!;await pan(handle.x+handle.width/2,handle.y+handle.height/2);await expect(page.getByLabel('Position WIDTH',{exact:true})).toHaveValue('120');await expect(page.getByLabel('Position X',{exact:true})).toHaveValue('24');
 await page.getByRole('button',{name:'Preview',exact:true}).click();const rect=(await viewport.boundingBox())!,zoom=await page.getByRole('button',{name:'Fit canvas',exact:true}).innerText();await pan(rect.x+rect.width/2,rect.y+rect.height/2);await expect(page.getByRole('button',{name:'Fit canvas',exact:true})).toHaveText(zoom);
});
test('page controls stay fixed on selection changes and errors overlay only the workspace',async({page})=>{
 await page.goto('/');await page.getByRole('button',{name:'Elements library',exact:true}).click();await page.getByRole('button',{name:'Insert Rectangle',exact:true}).click();
 const metrics=async()=>({add:await page.getByRole('button',{name:'Add page below Home',exact:true}).boundingBox(),height:await page.getByRole('button',{name:'Resize page height from toolbar',exact:true}).boundingBox(),workspace:await page.locator('main.workspace').boundingBox()});const selected=await metrics();
 await page.getByTestId('artboard').click({position:{x:5,y:5}});expect(await metrics()).toEqual(selected);await page.keyboard.press('Delete');await expect(page.getByRole('alert')).toHaveCount(0);
 await page.getByTestId('artboard').getByRole('img',{name:'Rectangle',exact:true}).click();expect(await metrics()).toEqual(selected);await page.getByLabel('Position X',{exact:true}).fill('-20');await page.getByLabel('Position X',{exact:true}).press('Enter');
 const alert=page.getByRole('alert');await expect(alert).toBeVisible();await expect(alert).toHaveCSS('position','absolute');expect(await metrics()).toEqual(selected);await expect(page.getByRole('region',{name:'Design workspace'}).getByRole('alert')).toBeVisible();await page.getByRole('button',{name:'Dismiss error'}).click();await expect(alert).toHaveCount(0);
});
test('ultrawide changes the active design page to 2560 and supports undo',async({page})=>{
 await page.goto('/');await page.getByRole('button',{name:'Ultrawide viewport',exact:true}).click();await expect(page.getByLabel('Preview width',{exact:true})).toHaveValue('2560');await expect(page.getByTestId('artboard')).toHaveCSS('width','2560px');
 await page.getByRole('button',{name:'Undo',exact:true}).click();await expect(page.getByTestId('artboard')).toHaveCSS('width','1440px');await expect(page.getByLabel('Preview width',{exact:true})).toHaveValue('1440');
});
