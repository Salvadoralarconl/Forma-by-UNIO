import {test,expect} from '@playwright/test';
test('row siblings share horizontal space while standalone columns keep natural height',async({page})=>{
  await page.goto('/');await page.getByRole('button',{name:'Add row',exact:true}).click();await page.getByRole('button',{name:'Add column',exact:true}).click();await page.getByRole('button',{name:'Add text',exact:true}).click();
  await page.getByRole('tab',{name:'Layers & Pages',exact:true}).click();await page.getByRole('treeitem',{name:'Row',exact:true}).getByRole('button',{name:'Row',exact:true}).click();await page.getByRole('tab',{name:'Properties',exact:true}).click();
  await page.getByRole('button',{name:'Add column',exact:true}).click();await page.getByRole('button',{name:'Add text',exact:true}).click();
  const containers=page.getByTestId('artboard').locator('[data-kind="container"]');const row=containers.nth(1);const columns=row.locator(':scope > [data-kind="container"]');await expect(columns).toHaveCount(2);
  const a=(await columns.nth(0).boundingBox())!,b=(await columns.nth(1).boundingBox())!;expect(b.x).toBeGreaterThan(a.x+a.width);expect(Math.abs(a.y-b.y)).toBeLessThan(1);expect(Math.abs(a.width-b.width)).toBeLessThan(2);
  await page.getByRole('tab',{name:'Layers & Pages',exact:true}).click();await page.getByRole('button',{name:'Add page',exact:true}).click();await page.getByRole('tab',{name:'Properties',exact:true}).click();await page.getByRole('button',{name:'Add column',exact:true}).click();await page.getByRole('button',{name:'Add text',exact:true}).click();
  const standalone=page.getByTestId('artboard').locator('[data-kind="container"]').nth(1);const box=(await standalone.boundingBox())!;const zoom=await page.getByTestId('artboard').evaluate(el=>parseFloat((el as HTMLElement).style.zoom));expect(box.height/zoom).toBeCloseTo(120,0);
});
test('fixed parent supports remaining-height fill with margins padding and gaps; fit restores content height',async({page})=>{
  await page.goto('/');await page.getByLabel('Height',{exact:true}).fill('500');await page.getByLabel('Height',{exact:true}).press('Tab');
  await page.getByLabel('Padding',{exact:true}).fill('20');await page.getByLabel('Padding',{exact:true}).press('Tab');
  await page.getByRole('button',{name:'Add column',exact:true}).click();await page.getByLabel('Height mode',{exact:true}).selectOption('fill');await page.getByLabel('Width mode',{exact:true}).selectOption('fill');
  await page.getByLabel('Margin',{exact:true}).fill('10');await page.getByLabel('Margin',{exact:true}).press('Tab');
  const child=page.getByTestId('artboard').locator('[data-kind="container"]').nth(1),zoom=await page.getByTestId('artboard').evaluate(el=>parseFloat((el as HTMLElement).style.zoom));
  let box=(await child.boundingBox())!;expect(box.height/zoom).toBeCloseTo(440,0);expect(box.width/zoom).toBeCloseTo(1380,0);
  await page.getByLabel('Height mode',{exact:true}).selectOption('fit');box=(await child.boundingBox())!;expect(box.height/zoom).toBeLessThan(200);
  await page.getByRole('button',{name:'Undo',exact:true}).click();box=(await child.boundingBox())!;expect(box.height/zoom).toBeCloseTo(440,0);
});
