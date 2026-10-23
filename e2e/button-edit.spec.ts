import {test,expect} from '@playwright/test';
test('button label edits on double click and corners can be set independently',async({page})=>{
 await page.goto('/');await page.getByRole('button',{name:'Elements library',exact:true}).click();await page.getByRole('button',{name:'Buttons',exact:true}).click();await page.getByRole('button',{name:'Insert Solid button',exact:true}).click();
 const button=page.getByTestId('artboard').locator('.semantic-button');await button.dblclick();
 const edit=page.getByRole('textbox',{name:'Edit text',exact:true});await expect(edit).toBeFocused();await page.keyboard.type('Buy now');await page.getByTestId('artboard').click({position:{x:5,y:5}});await expect(button).toHaveText('Buy now');
 await button.click();
 await page.getByLabel('Button font size',{exact:true}).fill('22');await page.getByLabel('Button font size',{exact:true}).press('Enter');
 await page.getByLabel('Button font family',{exact:true}).selectOption('Georgia');await page.getByLabel('Button font weight',{exact:true}).selectOption('700');await page.getByLabel('Button italic',{exact:true}).check();
 await page.getByLabel('Button letter spacing',{exact:true}).fill('2');await page.getByLabel('Button letter spacing',{exact:true}).press('Enter');
 await page.getByLabel('Button text color',{exact:true}).fill('#ee4488');await page.getByLabel('Button text color',{exact:true}).press('Enter');
 const label=button.locator('[data-kind="text"]');await expect(label).toHaveCSS('font-size','22px');await expect(label).toHaveCSS('font-family','Georgia');await expect(label).toHaveCSS('font-weight','700');await expect(label).toHaveCSS('font-style','italic');await expect(label).toHaveCSS('letter-spacing','2px');await expect(label).toHaveCSS('color','rgb(238, 68, 136)');
 for(const [label,value] of [['Top-left radius','0'],['Top-right radius','8'],['Bottom-right radius','16'],['Bottom-left radius','24']] as const){await page.getByLabel(label,{exact:true}).fill(value);await page.getByLabel(label,{exact:true}).press('Enter');}
 await expect(button).toHaveCSS('border-top-left-radius','0px');await expect(button).toHaveCSS('border-top-right-radius','8px');await expect(button).toHaveCSS('border-bottom-right-radius','16px');await expect(button).toHaveCSS('border-bottom-left-radius','24px');
 await page.getByRole('button',{name:'Preview',exact:true}).click();await expect(button).toHaveCSS('border-bottom-left-radius','24px');await button.dblclick();await expect(edit).toHaveCount(0);
});
