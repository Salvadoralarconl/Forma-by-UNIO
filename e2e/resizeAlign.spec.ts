import {test,expect} from '@playwright/test';
test('resizing snaps to other shapes with live guides and one undo',async({page})=>{
 await page.goto('/');await page.getByRole('button',{name:'Elements library',exact:true}).click();
 const set=async(label:string,value:number)=>{await page.getByLabel(label,{exact:true}).fill(String(value));await page.getByLabel(label,{exact:true}).press('Enter');};
 for(const position of [100,300]){await page.getByRole('button',{name:'Insert Rectangle',exact:true}).click();await set('Position X',position);await set('Position Y',position);}
 const board=page.getByTestId('artboard'),shape=board.locator('[data-kind="shape"]').first();await shape.click();const zoom=await board.evaluate(el=>parseFloat((el as HTMLElement).style.zoom));
 for(const handle of ['Resize e','Resize selected layer']){
  const control=page.getByRole('button',{name:handle,exact:true}),box=(await control.boundingBox())!;await page.mouse.move(box.x+box.width/2,box.y+box.height/2);await page.mouse.down();await page.mouse.move(box.x+box.width/2+77*zoom,box.y+box.height/2+(handle==='Resize e'?0:77*zoom));
  await expect(shape).toHaveCSS('width','200px');await expect(board.getByTestId('resize-snap-guide-x')).toHaveCSS('left','300px');
  if(handle!=='Resize e'){await expect(shape).toHaveCSS('height','200px');await expect(board.getByTestId('resize-snap-guide-y')).toHaveCSS('top','300px');}
  await page.mouse.up();await expect(page.getByLabel('Position WIDTH',{exact:true})).toHaveValue('200');await expect(board.getByTestId('resize-snap-guide-x')).toHaveCount(0);
  await page.getByRole('button',{name:'Undo',exact:true}).click();await expect(page.getByLabel('Position WIDTH',{exact:true})).toHaveValue('120');
 }
});
test('top shape matches the horizontal gap both while resizing and moving',async({page})=>{
 await page.goto('/');await page.getByRole('button',{name:'Elements library',exact:true}).click();
 const set=async(label:string,value:number)=>{await page.getByLabel(label,{exact:true}).fill(String(value));await page.getByLabel(label,{exact:true}).press('Enter');};
 for(const x of [100,240]){await page.getByRole('button',{name:'Insert Rectangle',exact:true}).click();await set('Position X',x);await set('Position Y',200);await set('Position HEIGHT',100);}
 await page.getByRole('button',{name:'Insert Rectangle',exact:true}).click();await set('Position X',100);await set('Position Y',50);await set('Position WIDTH',260);await set('Position HEIGHT',100);
 const board=page.getByTestId('artboard'),shape=board.locator('[data-kind="shape"]').last(),zoom=await board.evaluate(el=>parseFloat((el as HTMLElement).style.zoom));
 const handle=(await page.getByRole('button',{name:'Resize s',exact:true}).boundingBox())!;await page.mouse.move(handle.x+handle.width/2,handle.y+handle.height/2);await page.mouse.down();await page.mouse.move(handle.x+handle.width/2,handle.y+handle.height/2+27*zoom);
 await expect(shape).toHaveCSS('height','130px');for(const axis of ['x','y'])await expect(board.locator(`[data-gap-axis="${axis}"]`).first()).toHaveAttribute('data-gap-value','20');
 await expect(board.locator('[data-gap-axis="y"] rect').first()).toHaveAttribute('fill','#242a32');await expect(board.locator('[data-gap-axis="y"] text').first()).toHaveCSS('user-select','none');await page.mouse.up();await page.getByRole('button',{name:'Undo',exact:true}).click();await expect(shape).toHaveCSS('height','100px');
 const box=(await shape.boundingBox())!;await page.mouse.move(box.x+box.width/2,box.y+box.height/2);await page.mouse.down();await page.mouse.move(box.x+box.width/2,box.y+box.height/2+27*zoom);await expect(shape).toHaveCSS('top','80px');
 for(const axis of ['x','y'])await expect(board.locator(`[data-gap-axis="${axis}"]`).first()).toHaveAttribute('data-gap-value','20');await page.mouse.up();await expect(page.getByLabel('Position Y',{exact:true})).toHaveValue('80');
});
