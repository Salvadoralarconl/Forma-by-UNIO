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

test('vertical page toolbar resizes page height with one undo',async({page})=>{
 await page.goto('/');
 const toolbar=page.getByRole('toolbar',{name:'Page actions for Home',exact:true});
 await expect(toolbar).toHaveAttribute('aria-orientation','vertical');
 expect(await toolbar.evaluate(el=>getComputedStyle(el).flexDirection)).toBe('column');
 const board=page.getByTestId('artboard').first(),before=(await board.boundingBox())!;
 await expect(page.getByRole('button',{name:'Resize page height',exact:true})).toHaveCount(0);
 await toolbar.getByRole('button',{name:'Resize page height from toolbar',exact:true}).click();
 const resize=page.getByRole('button',{name:'Resize page height',exact:true}),box=(await resize.boundingBox())!;
 await page.mouse.move(box.x+box.width/2,box.y+box.height/2);await page.mouse.down();await page.mouse.move(box.x+box.width/2,box.y+box.height/2+60);await page.mouse.up();
 await expect.poll(async()=>Math.round((await board.boundingBox())!.height-before.height)).toBe(60);
 await page.getByRole('button',{name:'Undo',exact:true}).click();
 await expect.poll(async()=>Math.round((await board.boundingBox())!.height)).toBe(Math.round(before.height));
 await board.click({position:{x:20,y:20}});
 await expect(resize).toHaveCount(0);
});