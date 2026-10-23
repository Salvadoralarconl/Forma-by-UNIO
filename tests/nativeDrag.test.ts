import {it,expect} from 'vitest';
import {readFileSync} from 'node:fs';

it('lets Windows WebView2 deliver HTML5 palette drags to the editor',()=>{
 const config=JSON.parse(readFileSync('src-tauri/tauri.conf.json','utf8'));
 expect(config.app.windows.find((w:{label:string})=>w.label==='main').dragDropEnabled).toBe(false);
});
