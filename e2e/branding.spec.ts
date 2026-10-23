import {test,expect} from '@playwright/test';
test('provided Forma emblem and rounded-square browser icon load locally',async({page})=>{
 await page.goto('/');const logo=page.getByRole('img',{name:'Forma',exact:true});await expect(logo).toHaveAttribute('src','/forma-logo.png');await expect.poll(()=>logo.evaluate(el=>(el as HTMLImageElement).naturalWidth)).toBeGreaterThan(0);
 await expect(page.locator('link[rel="icon"]')).toHaveAttribute('href','/forma-app-icon.png');const icon=await page.request.get('/forma-app-icon.png');expect(icon.ok()).toBe(true);expect(icon.headers()['content-type']).toContain('image/png');
});
