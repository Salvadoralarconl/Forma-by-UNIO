import {test,expect} from '@playwright/test';
test('side page actions reorder, hide, lock, duplicate and delete without introducing page gaps',async({page})=>{
 await page.goto('/');await expect(page.getByRole('button',{name:'Hide Home',exact:true})).toBeDisabled();await expect(page.getByRole('button',{name:'Delete Home',exact:true})).toHaveCount(0);await page.getByRole('button',{name:'Add page below Home',exact:true}).click();
 const boards=page.getByTestId('artboard'),order=()=>boards.evaluateAll(els=>els.map(e=>e.getAttribute('data-page-id'))),initial=await order();await expect(page.getByRole('toolbar',{name:/^Page actions for /})).toHaveCount(2);
 await page.getByRole('button',{name:'Move Page 2 up',exact:true}).click();expect(await order()).toEqual([...initial].reverse());await page.getByRole('button',{name:'Move Page 2 down',exact:true}).click();expect(await order()).toEqual(initial);
 await page.getByRole('button',{name:'Lock Home',exact:true}).click();await expect(page.getByRole('button',{name:'Unlock Home',exact:true})).toHaveAttribute('aria-pressed','true');await page.getByRole('button',{name:'Unlock Home',exact:true}).click();await expect(page.getByRole('button',{name:'Lock Home',exact:true})).toHaveAttribute('aria-pressed','false');
 await page.getByRole('button',{name:'Duplicate Home',exact:true}).click();await expect(boards).toHaveCount(3);await page.getByRole('button',{name:'Undo',exact:true}).click();await expect(boards).toHaveCount(2);
 await page.getByRole('button',{name:'Hide Page 2',exact:true}).click();await expect(boards).toHaveCount(1);await expect(page.getByRole('button',{name:'Hide Home',exact:true})).toBeDisabled();await page.getByRole('button',{name:'Undo',exact:true}).click();await expect(boards).toHaveCount(2);
 await page.getByRole('button',{name:'Delete Page 2',exact:true}).click();await expect(boards).toHaveCount(1);await page.getByRole('button',{name:'Undo',exact:true}).click();await expect(boards).toHaveCount(2);
 const rects=await boards.evaluateAll(els=>els.map(e=>{const r=e.getBoundingClientRect();return{top:r.top,bottom:r.bottom};}));expect(Math.abs(rects[1].top-rects[0].bottom)).toBeLessThan(.5);
});
