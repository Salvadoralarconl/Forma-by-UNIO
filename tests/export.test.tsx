import {createPreset} from '../src/domain/presets';
// @vitest-environment node
import {describe,it,expect} from 'vitest';
import {unzipSync,strFromU8} from 'fflate';
import {mkdtempSync,mkdirSync,writeFileSync,symlinkSync,readFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join,resolve,dirname} from 'node:path';
import {execFileSync} from 'node:child_process';
import {chromium} from '@playwright/test';
import {createProject,makeNode,defaultButtonBehavior} from '../src/domain/model';
import {encodeWebsite,websiteExportFiles} from '../src/persistence/websiteExport';

function fixture(){const p=createProject('Export <safe>');p.schemaVersion=2;const root=p.nodes[p.pages[0].rootId];root.layoutMode='free';root.style={height:500,minHeight:500,width:800,background:'#ffffff'};p.pages[0].width=800;
 const text=makeNode('text','text' as ReturnType<typeof crypto.randomUUID>,'Copy',{fontSize:20,color:'#112233'});text.text='<script>alert(1)</script> & welcome';text.frame={x:40,y:60,width:300,height:50};
 const button=makeNode('container','button' as ReturnType<typeof crypto.randomUUID>,'Button',{background:'#336699',color:'#ffffff'});button.button=defaultButtonBehavior();button.button.states.pressed.background='#336699';button.button.action={type:'section',target:'text'};button.frame={x:40,y:150,width:180,height:50};
 const label=makeNode('text','label' as ReturnType<typeof crypto.randomUUID>,'Label',{fontSize:16});label.text='Go to copy';button.children=[label.id];
 const shape=makeNode('shape',crypto.randomUUID(),'Shape',{background:'#cc7755',borderWidth:2,borderStyle:'dashed',borderColor:'#000000',shadow:{x:2,y:3,blur:5,spread:1,color:'#00000033'}});shape.geometry={type:'rectangle',width:100,height:50};shape.frame={x:300,y:200,width:100,height:50};
 const icon=makeNode('icon',crypto.randomUUID(),'Icon',{background:'#445566'});icon.iconPaths=['M0 0L24 24'];icon.iconFills=[false];icon.iconPaint=[{width:3,cap:'round',join:'round',rule:'evenodd'}];icon.frame={x:450,y:200,width:50,height:50};
 const image=makeNode('image',crypto.randomUUID(),'Image');image.assetId='pixel';image.alt='Local pixel';image.frame={x:550,y:200,width:50,height:50};p.assets.pixel={id:'pixel',name:'pixel.png',mime:'image/png',data:'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jr1cAAAAASUVORK5CYII='};
 p.pages[0].background={color:'#336699',assetId:'pixel',opacity:.4,blur:3,backdropBlur:6};root.children=[text.id,button.id,shape.id,icon.id,image.id];for(const n of [text,button,label,shape,icon,image])p.nodes[n.id]=n;for(const [preset,x] of [['searchBar',40],['dropdown',350]] as const){const built=createPreset(preset);built.root.frame={x,y:320,width:280,height:44};Object.assign(p.nodes,built.nodes);root.children.push(built.root.id);}return p;}

describe('website export',()=>{
 it('packages safe standalone markup, declarative interactions and attribution',()=>{const files=unzipSync(encodeWebsite(fixture()));const html=strFromU8(files['Open-preview.html']);expect(html).toContain('&lt;script&gt;');expect(html).not.toContain('<script>');expect(html).toContain('href="#node-text"');expect(html).toContain('left:40px');expect(strFromU8(files['site.css'])).toContain(':active');expect(files['LICENSES/icon-sources.json']).toBeDefined();expect(Object.keys(files).every(path=>!path.includes('..'))).toBe(true);});
 it('rejects invalid projects before packaging',()=>{const p=fixture();p.nodes.text.text='ok';p.nodes.button.button!.action={type:'link',target:'javascript:alert(1)'};expect(()=>encodeWebsite(p)).toThrow();});
 it('builds independent React source offline and matches the standalone browser geometry',async()=>{
  const dir=mkdtempSync(join(tmpdir(),'forma-export-'));for(const [path,bytes]of Object.entries(websiteExportFiles(fixture()))){mkdirSync(dirname(join(dir,path)),{recursive:true});writeFileSync(join(dir,path),bytes);}
  symlinkSync(resolve('node_modules'),join(dir,'node_modules'),'junction');
  execFileSync(process.execPath,[resolve('node_modules/vite/bin/vite.js'),'build',dir],{cwd:dir,stdio:'pipe'});
  const built=readFileSync(join(dir,'dist/index.html'),'utf8');expect(built).toContain('/assets/');
  const browser=await chromium.launch({channel:'chrome',headless:true});try{const page=await browser.newPage();let dialogs=0;page.on('dialog',()=>{dialogs++;});await page.goto('file:///'+join(dir,'Open-preview.html').replaceAll('\\','/'));expect(await page.locator('[data-page-background]').evaluate(el=>getComputedStyle(el).opacity)).toBe('0.4');expect(await page.locator('[data-background-image]').evaluate(el=>getComputedStyle(el).filter)).toBe('blur(3px)');const text=page.locator('#node-text');expect(await text.textContent()).toContain('<script>');const rect=await text.boundingBox();expect(rect?.x).toBe(40);expect(rect?.y).toBe(60);await page.locator('#node-button').click();expect(page.url()).toContain('#node-text');expect(dialogs).toBe(0);await page.getByRole('searchbox',{name:'Search this page',exact:true}).fill('welcome');await page.getByRole('button',{name:'Search page',exact:true}).click();expect(await page.locator('.forma-search-match').count()).toBe(1);await page.getByRole('combobox',{name:'Choose an option',exact:true}).selectOption('Option 2');expect(await page.getByRole('combobox',{name:'Choose an option',exact:true}).inputValue()).toBe('Option 2');
   // Serve the separately built source, then compare its rendering to standalone.
   const {createServer}=await import('node:http');const server=createServer((req,res)=>{const path=(req.url??'/').split('?')[0];try{const file=join(dir,'dist',path==='/'?'index.html':path);res.setHeader('content-type',path.endsWith('.js')?'text/javascript':path.endsWith('.css')?'text/css':'text/html');res.end(readFileSync(file));}catch{res.statusCode=404;res.end();}});await new Promise<void>(r=>server.listen(0,'127.0.0.1',r));try{const address=server.address() as {port:number};await page.goto(`http://127.0.0.1:${address.port}`);await page.locator('#node-text').waitFor();await page.getByRole('searchbox',{name:'Search this page',exact:true}).fill('welcome');await page.getByRole('button',{name:'Search page',exact:true}).click();expect(await page.locator('.forma-search-match').count()).toBe(1);expect(await page.locator('[data-page-background]').evaluate(el=>getComputedStyle(el).backdropFilter)).toBe('blur(6px)');expect(await page.locator('#node-text').boundingBox()).toEqual(rect);await page.locator('#node-button').hover();await page.waitForTimeout(220);expect(await page.locator('#node-button').evaluate(el=>getComputedStyle(el).backgroundColor)).toBe('rgb(36, 85, 190)');await page.mouse.down();await page.waitForTimeout(220);expect(await page.locator('#node-button').evaluate(el=>getComputedStyle(el).backgroundColor)).toBe('rgb(51, 102, 153)');await page.mouse.up();await page.mouse.move(700,400);await page.locator('#node-button').focus();await page.waitForTimeout(220);expect(await page.locator('#node-button').evaluate(el=>getComputedStyle(el).boxShadow)).toContain('3px');}finally{await new Promise<void>(r=>server.close(()=>r()));}
  }finally{await browser.close();}
 },30000);
});


