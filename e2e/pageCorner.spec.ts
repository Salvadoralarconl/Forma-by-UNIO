import {test,expect} from '@playwright/test';
test('equal page corner inset guides appear near edges during move and resize, not in the middle',async({page})=>{
 await page.goto('/');await page.getByRole('button',{name:'Elements library',exact:true}).click();await page.getByRole('button',{name:'Insert Rectangle',exact:true}).click();
 const set=async(label:string,value:number)=>{await page.getByLabel(label,{exact:true}).fill(String(value));await page.getByLabel(label,{exact:true}).press('Enter');};
 await set('Position X',1300);await set('Position Y',640);await set('Position HEIGHT',100);
 const board=page.getByTestId('artboard'),shape=board.locator('[data-kind="shape"]'),zoom=await board.evaluate(el=>parseFloat((el as HTMLElement).style.zoom));
 const handle=(await page.getByRole('button',{name:'Resize s',exact:true}).boundingBox())!;await page.mouse.move(handle.x+handle.width/2,handle.y+handle.height/2);await page.mouse.down();await page.mouse.move(handle.x+handle.width/2,handle.y+handle.height/2+17*zoom);
 await expect(shape).toHaveCSS('height','120px');for(const axis of ['x','y'])await expect(board.locator(`[data-gap-axis="${axis}"]`).first()).toHaveAttribute('data-gap-value','20');await page.mouse.up();await page.getByRole('button',{name:'Undo',exact:true}).click();
 let box=(await shape.boundingBox())!;await page.mouse.move(box.x+box.width/2,box.y+box.height/2);await page.mouse.down();await page.mouse.move(box.x+box.width/2,box.y+box.height/2+17*zoom);await expect(shape).toHaveCSS('top','660px');await expect(board.locator('[data-gap-value="20"]')).toHaveCount(2);await page.mouse.up();
 await set('Position X',600);await set('Position Y',300);box=(await shape.boundingBox())!;await page.mouse.move(box.x+box.width/2,box.y+box.height/2);await page.mouse.down();await page.mouse.move(box.x+box.width/2+3*zoom,box.y+box.height/2+4*zoom);await expect(board.locator('[data-gap-value]')).toHaveCount(0);await page.mouse.up();
});
