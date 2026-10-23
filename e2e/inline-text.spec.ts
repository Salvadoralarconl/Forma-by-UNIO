import {test,expect} from '@playwright/test';

test('double click edits canvas text, saves on blur, supports undo and Escape',async({page})=>{
 await page.goto('/');
 await page.getByRole('button',{name:'Elements library',exact:true}).click();
 await page.getByRole('button',{name:'Text',exact:true}).click();
 await page.getByRole('button',{name:'Insert Heading',exact:true}).click();
 const text=page.getByTestId('artboard').locator('[data-kind="text"]');
 await text.dblclick();
 const edit=page.getByRole('textbox',{name:'Edit text',exact:true});
 await expect(edit).toBeFocused();await page.keyboard.type('My new heading');
 await page.getByTestId('artboard').click({position:{x:5,y:5}});
 await expect(text).toHaveText('My new heading');await expect(edit).toHaveCount(0);
 await page.getByRole('button',{name:'Undo',exact:true}).click();await expect(text).toHaveText('Add a heading');
 await text.dblclick();await page.keyboard.type('Discard me');await page.keyboard.press('Escape');
 await expect(text).toHaveText('Add a heading');await expect(edit).toHaveCount(0);
 await text.click();await page.getByRole('button',{name:'Lock selection',exact:true}).click();
 await text.dblclick();await expect(edit).toHaveCount(0);
});
