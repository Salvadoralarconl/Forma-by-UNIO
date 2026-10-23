import {test,expect} from '@playwright/test';
test('page backgrounds customize independently from objects, persist and support undo',async({page},info)=>{
 await page.goto('/');await page.getByRole('button',{name:'Elements library',exact:true}).click();await page.getByRole('button',{name:'Insert Rectangle',exact:true}).click();
 const shape=page.getByTestId('artboard').locator('[data-kind="shape"]');
 await page.getByRole('button',{name:'Edit Home background',exact:true}).click();await expect(page.getByRole('heading',{name:'Page background',exact:true})).toBeVisible();
 await page.getByLabel('Page background color',{exact:true}).fill('#336699');await page.getByLabel('Page background color',{exact:true}).press('Enter');
 await page.getByLabel('Page background image file',{exact:true}).setInputFiles('e2e/fixtures/local-art.png');
 const layer=page.locator('[data-page-background]');await expect(layer.locator('img')).toBeVisible();
 await page.getByLabel('Background opacity %',{exact:true}).fill('40');await page.getByLabel('Background opacity %',{exact:true}).press('Enter');
 await expect(layer).toHaveCSS('opacity','0.4');await expect(shape).toHaveCSS('opacity','1');
 await page.getByLabel('Background image blur',{exact:true}).fill('8');await page.getByLabel('Background image blur',{exact:true}).press('Enter');
 await page.getByLabel('Frosted glass blur',{exact:true}).fill('6');await page.getByLabel('Frosted glass blur',{exact:true}).press('Enter');await expect(layer).toHaveCSS('backdrop-filter','blur(6px)');await expect(layer.locator('img')).toHaveCSS('filter','blur(8px)');
 await page.getByLabel('Page background image fit',{exact:true}).selectOption('contain');await expect(layer.locator('img')).toHaveCSS('object-fit','contain');
 await page.getByRole('button',{name:'Make background transparent',exact:true}).click();await expect(layer).toHaveCSS('opacity','0');await page.getByRole('button',{name:'Undo',exact:true}).click();await expect(layer).toHaveCSS('opacity','0.4');
 const download=page.waitForEvent('download');await page.getByRole('button',{name:'Save project',exact:true}).click();const file=info.outputPath('Background.forma');await(await download).saveAs(file);
 const chooser=page.waitForEvent('filechooser');await page.getByRole('button',{name:'Open project',exact:true}).click();await(await chooser).setFiles(file);await expect(layer).toHaveCSS('opacity','0.4');await expect(layer.locator('img')).toHaveCSS('filter','blur(8px)');await expect(shape).toHaveCount(1);
 await page.getByRole('button',{name:'Preview',exact:true}).click();await expect(layer).toHaveCSS('backdrop-filter','blur(6px)');await expect(shape).toHaveCSS('opacity','1');
});
