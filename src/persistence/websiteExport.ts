import {renderToStaticMarkup} from 'react-dom/server';
import {createElement} from 'react';
import {strToU8,zipSync} from 'fflate';
import {validateProject,type Project} from '../domain/model';
import {base64ToBytes,verifyRaster,MAX_ARCHIVE} from './archive';
import {Site,buttonCss,assetPath} from '../export/Site';
import siteSource from '../export/Site.tsx?raw';
import styleSource from '../export/nodeStyle.ts?raw';
import {siteCss as css} from '../export/styles';
import shapeSource from '../editor/ShapeVector.tsx?raw';
import shapesSource from '../domain/shapes.ts?raw';
import modelSource from '../domain/model.ts?raw';
import pageBoundsSource from '../domain/pageBounds.ts?raw';
import pageBackgroundSource from '../editor/PageBackground.tsx?raw';
import iconSource from '../domain/iconPacks.ts?raw';
import license from '../domain/icon-license.txt?raw';
import attribution from '../../docs/icon-sources.json?raw';

/** Fixed, local paths only. Validates model and raster signatures before writing. */
export function websiteExportFiles(input:Project):Record<string,Uint8Array>{
 const project=validateProject(input),files:Record<string,Uint8Array>={};let total=0;
 const add=(path:string,value:string|Uint8Array)=>{const bytes=typeof value==='string'?strToU8(value):value;total+=bytes.length;if(total>MAX_ARCHIVE)throw new Error('Website export exceeds 64 MB.');files[path]=bytes;};
 for(const a of Object.values(project.assets)){const bytes=base64ToBytes(a.data);verifyRaster(bytes,a.mime);add(assetPath(a.id,a.mime),bytes);}
 const data={...project,assets:Object.fromEntries(Object.entries(project.assets).map(([id,a])=>[id,{...a,data:''}]))};
 const styles=css+'\n'+buttonCss(project);
 const markup=renderToStaticMarkup(createElement(Site,{project}));
 add('Open-preview.html','<!doctype html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Website preview</title><link rel="stylesheet" href="site.css"></head><body>'+markup+'</body></html>');
 add('site.css',styles);
 // Public files are served at / in Vite, but the standalone preview uses public/assets.
 add('src/export/Site.tsx',siteSource.replace('`public/assets/','`assets/'));
 add('src/export/nodeStyle.ts',styleSource);add('src/editor/ShapeVector.tsx',shapeSource);add('src/editor/PageBackground.tsx',pageBackgroundSource);add('src/domain/shapes.ts',shapesSource);add('src/domain/model.ts',modelSource);add('src/domain/pageBounds.ts',pageBoundsSource);add('src/domain/iconPacks.ts',iconSource);
 add('src/site.css',styles);add('src/project.json',JSON.stringify(data,null,2));
 add('src/main.tsx',"import React from 'react';\nimport {createRoot} from 'react-dom/client';\nimport {Site} from './export/Site';\nimport project from './project.json';\nimport type {Project} from './domain/model';\nimport './site.css';\ncreateRoot(document.getElementById('root')!).render(<Site project={project as Project}/>);\n");
 add('index.html','<!doctype html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Website</title></head><body><div id="root"></div><script type="module" src="/src/main.tsx"></script></body></html>');
 add('package.json',JSON.stringify({name:'forma-website',version:'1.0.0',private:true,type:'module',scripts:{dev:'vite --host 127.0.0.1',build:'vite build --base=./',preview:'vite preview --host 127.0.0.1'},dependencies:{react:'^19.0.0','react-dom':'^19.0.0',zod:'^3.24.0','polygon-clipping':'^0.15.7'},devDependencies:{vite:'^6.1.0',typescript:'^5.7.0','@types/react':'^19.0.0','@types/react-dom':'^19.0.0'}},null,2));
 add('tsconfig.json',JSON.stringify({compilerOptions:{target:'ES2022',lib:['ES2022','DOM'],module:'ESNext',moduleResolution:'Bundler',jsx:'react-jsx',strict:true,esModuleInterop:true,skipLibCheck:true,resolveJsonModule:true},include:['src']}));
 add('README.md',`# ${project.name}\n\nExported with Forma by UNIO.\n\nOpen **Open-preview.html** directly for an offline preview, with no installation or build. Keep site.css and public/assets beside it. All active pages are stacked in their design order; internal links scroll to page or section anchors. Archived pages are omitted.\n\nEditable React source is in src/. Install Node.js, run npm install once, then npm run dev. Run npm run build for a deployable dist directory. React source and standalone preview share the same renderer and styles. No account, API or publishing service is required.\n\n## Limits\n\nFree placement preserves fixed pixel coordinates and page dimensions; it is **not responsive**. Flow layouts retain their flex rules within the exported page width. Breakpoint overrides, tokens, components, annotations, editor state and custom scripts are not website behavior. Only declared http/https links and internal page/section anchors are exported. Imported icon vectors contain validated paths only. Local system font availability can affect text wrapping. This export includes raster assets, not remote dependencies for its standalone preview. npm installation may need internet or a populated local cache.\n\nReview your rights to imported images and icon packs before distributing. See LICENSES/.\n`);
 add('LICENSES/icon-license.txt',license);add('LICENSES/icon-sources.json',attribution);
 add('forma-export.json',JSON.stringify({generator:'Forma by UNIO',version:1,projectId:project.id,revision:project.revision,pages:project.pages.filter(p=>!p.archived).map(p=>({id:p.id,name:p.name})),layout:'fixed page widths; free coordinates are not responsive'},null,2));
 return files;
}
export function encodeWebsite(input:Project):Uint8Array{const bytes=zipSync(websiteExportFiles(input),{level:6});if(bytes.length>MAX_ARCHIVE)throw new Error('Website export exceeds 64 MB.');return bytes;}


