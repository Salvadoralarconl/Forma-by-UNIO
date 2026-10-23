import {test,expect,type Page} from '@playwright/test';
async function dragTab(page:Page,x:number,y:number,cancel=false){const tab=page.getByRole('tab',{name:'Elements',exact:true}),box=(await tab.boundingBox())!;await page.mouse.move(box.x+box.width/2,box.y+box.height/2);await page.mouse.down();await page.mouse.move(x,y,{steps:8});if(cancel)await page.keyboard.press('Escape');await page.mouse.up();}
test('panel tabs drag to either dock or float, cancel safely and remember placement',async({page})=>{
 await page.goto('/');await page.getByRole('button',{name:'Elements library',exact:true}).click();
 await expect(page.locator('.dock-panel-actions')).toHaveCount(0);
 await dragTab(page,650,230);const floating=page.getByLabel('Floating Elements panel',{exact:true});await expect(floating).toBeVisible();await expect(floating.getByRole('button',{name:'Insert Rectangle',exact:true})).toBeVisible();
 const before=await floating.boundingBox();await dragTab(page,850,300,true);expect(await floating.boundingBox()).toEqual(before);
 await page.reload();await expect(floating).toBeVisible();
 await dragTab(page,1380,220);await expect(floating).toHaveCount(0);await expect(page.getByLabel('right panel dock',{exact:true}).getByRole('tab',{name:'Elements',exact:true})).toBeVisible();
 await dragTab(page,90,200);await expect(page.getByLabel('left panel dock',{exact:true}).getByRole('tab',{name:'Elements',exact:true})).toBeVisible();
 await page.getByRole('button',{name:'Insert Rectangle',exact:true}).click();await expect(page.getByTestId('artboard').locator('[data-kind="shape"]')).toHaveCount(1);
});
