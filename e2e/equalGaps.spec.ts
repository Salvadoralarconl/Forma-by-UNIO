import {test,expect} from '@playwright/test';
test('pointer drag displays equal-gap measurements, snaps and commits one undoable move',async({page})=>{
 await page.goto('/');await page.getByRole('button',{name:'Elements library',exact:true}).click();
 const field=async(name:string,value:number)=>{const input=page.getByLabel(`Position ${name}`,{exact:true});await input.fill(String(value));await input.press('Tab');};
 for(const x of [50,450,240]){await page.getByRole('button',{name:'Insert Rectangle',exact:true}).click();await field('X',x);await field('Y',100);}
 const board=page.getByTestId('artboard'),shape=board.getByRole('img',{name:'Rectangle',exact:true}).last(),r=(await shape.boundingBox())!,z=await board.evaluate(e=>parseFloat((e as HTMLElement).style.zoom));
 await page.mouse.move(r.x+r.width/2,r.y+r.height/2);await page.mouse.down();await page.mouse.move(r.x+r.width/2+7*z,r.y+r.height/2);
 await expect(board.locator('[data-gap-axis="x"]')).toHaveCount(2);await expect(board.locator('[data-gap-axis="x"]').first()).toHaveAttribute('data-gap-value','80');await expect(shape).toHaveCSS('left','250px');
 // Selection must follow the live shape, rather than leave its old square behind.
 await expect(board.locator('.selection-resize-overlay')).toHaveCSS('left','250px');
 await page.mouse.up();await expect(page.getByLabel('Position X',{exact:true})).toHaveValue('250');await expect(board.locator('[data-gap-axis="x"]')).toHaveCount(0);
 await page.getByRole('button',{name:'Undo',exact:true}).click();await expect(page.getByLabel('Position X',{exact:true})).toHaveValue('240');
 await expect(board.locator('.free-resize-handle.handle-nw')).toHaveCSS('border-radius','50%');
 await expect(board.locator('.free-resize-handle.handle-e')).toHaveCSS('width','5px');
 await expect(board.locator('.free-resize-handle.handle-e')).toHaveCSS('height','20px');
 const before=(await shape.boundingBox())!;await page.mouse.move(before.x+before.width/2,before.y+before.height/2);await page.mouse.down();await page.mouse.move(before.x+before.width/2+40,before.y+before.height/2+20);await page.keyboard.press('Escape');await page.mouse.up();
 await expect(shape).toHaveCSS('left','240px');await expect(board.locator('.selection-resize-overlay')).toHaveCSS('left','240px');
});
