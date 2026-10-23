import {PropertySearch} from './PropertySearch';
import {useRef} from 'react';
import {newId,type PageBackground} from '../domain/model';
import type {Editor} from './useEditor';
import {Field} from './Inspector';
import {ColorField} from './ColorField';
export function PageBackgroundInspector({editor,pageId}:{editor:Editor;pageId:string}){
 const input=useRef<HTMLInputElement>(null),group=useRef<string|undefined>(undefined),page=editor.project.pages.find(p=>p.id===pageId)!;
 const root=editor.project.nodes[page.rootId],background=page.background??{},asset=background.assetId?editor.project.assets[background.assetId]:undefined;
 const update=(patch:Partial<PageBackground>,historyGroup?:string)=>editor.run({type:'pageBackground',id:pageId,background:patch},historyGroup);
 return <aside className="inspector"><PropertySearch kind="Page"/>
 {root.locked&&<div className="property-section"><button onClick={()=>editor.run({type:'update',id:root.id,patch:{locked:false}})}>Unlock page background</button></div>}
 <fieldset disabled={editor.busy||root.locked}>
 <div className="property-section"><Field label="Page name" value={page.name} onCommit={name=>editor.run({type:'renamePage',id:pageId,name})}/><Field label="Layer name" value={root.name} onCommit={name=>editor.run({type:'update',id:root.id,patch:{name}})}/>
 <ColorField label="Page background color" value={background.color??root.style.background??'#ffffff'} project={editor.project} onCommit={(color,g)=>update({color},g)}/>
 <label className="field"><span>Background opacity · {Math.round((background.opacity??1)*100)}%</span><input type="range" aria-label="Page background opacity" min={0} max={100} value={(background.opacity??1)*100} onPointerDown={()=>{group.current=newId();}} onPointerUp={()=>{group.current=undefined;}} onBlur={()=>{group.current=undefined;}} onChange={e=>update({opacity:Number(e.target.value)/100},group.current)}/></label>
 <Field label="Background opacity %" type="number" min={0} max={100} value={(background.opacity??1)*100} onCommit={v=>update({opacity:Number(v)/100})}/>
 <button onClick={()=>update({color:'transparent',opacity:0})}>Make background transparent</button></div>
 <div className="property-section"><h3>Background image</h3><input ref={input} className="visually-hidden" aria-label="Page background image file" type="file" accept="image/png,image/jpeg,image/webp,image/gif" onChange={e=>{const file=e.target.files?.[0];if(file)void editor.addPageBackground(file,pageId);e.target.value='';}}/>
 <button className="element-import" onClick={()=>input.current?.click()}>{asset?'Replace background image':'Choose background image'}</button>
 {asset&&<><p className="element-hint">{asset.name}</p><button onClick={()=>update({assetId:undefined})}>Remove background image</button></>}
 <label className="field"><span>Image fit</span><select aria-label="Page background image fit" value={background.fit??'cover'} onChange={e=>update({fit:e.target.value as PageBackground['fit']})}><option value="cover">Fill page</option><option value="contain">Fit whole image</option><option value="stretch">Stretch</option></select></label>
 <label className="field"><span>Image position</span><select aria-label="Page background image position" value={background.position??'center'} onChange={e=>update({position:e.target.value as PageBackground['position']})}>{['center','top','bottom','left','right','top left','top right','bottom left','bottom right'].map(v=><option key={v}>{v}</option>)}</select></label></div>
 <div className="property-section"><h3>Background effects</h3><Field label="Background image blur" type="number" min={0} max={60} value={background.blur??0} onCommit={v=>update({blur:Number(v)})}/><Field label="Frosted glass blur" type="number" min={0} max={60} value={background.backdropBlur??0} onCommit={v=>update({backdropBlur:Number(v)})}/>
 <ColorField label="Background tint" value={background.tint??'#ffffff'} project={editor.project} onCommit={(tint,g)=>update({tint},g)}/><Field label="Background tint opacity %" type="number" min={0} max={100} value={(background.tintOpacity??0)*100} onCommit={v=>update({tint:background.tint??'#ffffff',tintOpacity:Number(v)/100})}/>
 <p className="element-hint">Transparency reveals what is behind the page. Glass blur softens that backdrop; image blur softens only the picture. Page content stays sharp.</p>
 <button onClick={()=>update({opacity:1,blur:0,backdropBlur:0,tint:undefined,tintOpacity:0})}>Reset background effects</button></div></fieldset></aside>;
}
