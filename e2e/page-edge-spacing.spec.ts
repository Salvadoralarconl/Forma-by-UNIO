import {test,expect} from '@playwright/test';
test('move and resize snaps can balance the page margin against a neighboring object',async({page})=>{
 await page.goto('/');await page.getByRole('button',{name:'Elements library',exact:true}).click();
 const set=async(label:string,value:string)=>{await page.getByLabel(label,{exact:true}).fill(value);await page.getByLabel(label,{exact:true}).press('Enter');};
 await page.getByRole('button',{name:'Insert Rectangle',exact:true}).click();await set('Position X','200');await set('Position Y','100');await set('Position WIDTH','100');await set('Position HEIGHT','100');
 await page.getByRole('button',{name:'Insert Rectangle',exact:true}).click();await set('Position X','70');await set('Position Y','100');await set('Position WIDTH','100');await set('Position HEIGHT','100');
 const board=page.getByTestId('artboard'),shape=board.locator('[data-kind="shape"]').last(),z=await board.evaluate(el=>parseFloat((el as HTMLElement).style.zoom)),r=(await shape.boundingBox())!;
 await page.mouse.move(r.x+r.width/2,r.y+r.height/2);await page.mouse.down();await page.mouse.move(r.x+r.width/2-17*z,r.y+r.height/2);await expect(board.locator('[data-gap-axis="x"][data-gap-value="50"]')).toHaveCount(2);await page.mouse.up();await expect(page.getByLabel('Position X',{exact:true})).toHaveValue('50');
 await set('Position X','30');await set('Position WIDTH','130');const handle=(await page.getByRole('button',{name:'Resize e',exact:true}).boundingBox())!;
 await page.mouse.move(handle.x+handle.width/2,handle.y+handle.height/2);await page.mouse.down();await page.mouse.move(handle.x+handle.width/2+7*z,handle.y+handle.height/2);await expect(board.locator('[data-gap-axis="x"][data-gap-value="30"]')).toHaveCount(2);await page.mouse.up();await expect(page.getByLabel('Position WIDTH',{exact:true})).toHaveValue('140');
});
