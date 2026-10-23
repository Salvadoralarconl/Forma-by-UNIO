import {test,expect} from '@playwright/test';
test('copy style transfers appearance without changing target content, geometry or placement',async({page})=>{
 await page.goto('/');await page.getByRole('button',{name:'Elements library',exact:true}).click();await page.getByRole('button',{name:'Insert Rectangle',exact:true}).click();
 const set=async(label:string,value:string)=>{await page.getByLabel(label,{exact:true}).fill(value);await page.getByLabel(label,{exact:true}).press('Enter');};
 await set('Fill color','#ff0000');await set('Radius','10');await set('Border','3');await set('Opacity %','40');
 const more=()=>page.getByRole('button',{name:'More selection actions',exact:true});await more().click();await page.getByRole('menuitem',{name:'Copy style',exact:true}).click();
 await page.getByRole('button',{name:'Insert Rectangle',exact:true}).click();await set('Layer name','Target');await set('Position X','400');await set('Position Y','200');await set('Position WIDTH','200');await set('Position HEIGHT','150');
 await more().click();await page.getByRole('menuitem',{name:'Paste style',exact:true}).click();
 await expect(page.getByLabel('Fill color',{exact:true})).toHaveValue('#ff0000');await expect(page.getByLabel('Border',{exact:true})).toHaveValue('3');await expect(page.getByLabel('Opacity %',{exact:true})).toHaveValue('40');
 for(const [label,value]of [['Layer name','Target'],['Position X','400'],['Position Y','200'],['Position WIDTH','200'],['Position HEIGHT','150']])await expect(page.getByLabel(label,{exact:true})).toHaveValue(value);
 await page.getByRole('button',{name:'Undo',exact:true}).click();await expect(page.getByLabel('Fill color',{exact:true})).toHaveValue('#5b88d5');
});
