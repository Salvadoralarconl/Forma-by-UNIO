import type {Page} from '@playwright/test';
import {createProject} from '../src/domain/model';
import {encodeProject} from '../src/persistence/archive';
/** Exercise the genuine version-1 archive path rather than depending on startup defaults. */
export async function openLegacyProject(page:Page){
 const project=createProject('Legacy flow fixture');
 const chooser=page.waitForEvent('filechooser');
 await page.getByRole('button',{name:'Open project',exact:true}).click();
 if(await page.getByRole('button',{name:'Discard and continue',exact:true}).isVisible())await page.getByRole('button',{name:'Discard and continue',exact:true}).click();
 await (await chooser).setFiles({name:'Legacy.forma',mimeType:'application/octet-stream',buffer:Buffer.from(encodeProject(project))});
 return project;
}
