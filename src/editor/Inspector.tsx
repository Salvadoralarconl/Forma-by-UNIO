import { ArrowDown, ArrowUp, Copy, LockKeyhole, Trash2, UnlockKeyhole } from 'lucide-react';

import { useEffect, useState } from 'react';

import { type NodeStyle, parentOf } from '../domain/model';

import {ButtonInspector} from './ButtonInspector';
import {PositionPanel} from './PositionPanel';
import {ColorField} from './ColorField';

import type { Editor } from './useEditor';



export function Field({ label, value, onCommit, multiline = false, type = 'text', min, max }: {

  label: string; value: string | number; onCommit: (value: string) => void; multiline?: boolean; type?: string; min?: number; max?: number;

}) {

  const displayed=typeof value==='number'?(Number.isFinite(value)?String(Number(value.toFixed(2))):''):String(value);

  const [draft, setDraft] = useState(displayed);

  useEffect(() => setDraft(displayed), [displayed]);

  const commit = () => {

    if (draft !== displayed) onCommit(draft);

  };

  return <label className="field"><span>{label}</span>{multiline ?

    <textarea aria-label={label} value={draft} onChange={e => setDraft(e.target.value)} onBlur={commit} rows={4} /> :

    <input aria-label={label} type={type} min={min} max={max} value={draft} onChange={e => setDraft(e.target.value)} onBlur={commit} onKeyDown={e => {

      if (e.key === 'Enter') e.currentTarget.blur(); if (e.key === 'Escape') { setDraft(displayed); e.currentTarget.blur(); }

    }} />}</label>;

}



export function Inspector({ editor }: { editor: Editor }) {

  const { project, selected, run } = editor;

  const n = project.nodes[selected];

  const [mergeTarget,setMergeTarget]=useState('');

  if (!n) return <aside className="inspector" />;

  const parent = parentOf(project, selected);
  let ancestor=parent;while(ancestor){if(ancestor.locked)return <aside className="inspector"><div className="property-section"><h3>Page or parent locked</h3><p>Unlock it using its controls to edit this object.</p></div></aside>;ancestor=parentOf(project,ancestor.id);}

  const measured=()=>{const element=document.querySelector<HTMLElement>(`[data-node-id="${selected}"]`),rect=element?.getBoundingClientRect();const zoom=parseFloat(element?.closest<HTMLElement>('.artboard')?.style.zoom??'1')||1;return{width:rect?rect.width/zoom:120,height:rect?rect.height/zoom:120};};

  const style = (patch: Partial<NodeStyle>,historyGroup?:string) => run({ type: 'update', id: selected, patch: {}, style: n.button&&patch.borderRadius!==undefined?{...patch,borderTopLeftRadius:undefined,borderTopRightRadius:undefined,borderBottomRightRadius:undefined,borderBottomLeftRadius:undefined}:patch },historyGroup);

  const number = (key: keyof NodeStyle, fallback: number, label: string, max = 5000) => <Field label={label} value={typeof n.style[key] === 'number' ? n.style[key] as number : fallback} type="number" min={0} max={max}

    onCommit={value => { const num = Number(value); if (value.trim() && Number.isFinite(num)) style({ [key]: num }); }} />;

  return <aside className="inspector">

    <div className="inspector-title"><h2>Properties</h2><span className="tag">{n.kind}</span></div>

    <ButtonInspector editor={editor}/><PositionPanel editor={editor}/>
    <fieldset disabled={editor.busy} className="properties-fields">

      <div className="property-section"><Field label="Layer name" value={n.name} onCommit={name => run({ type: 'update', id: selected, patch: { name } })} />

        <div className="action-row">

          <button title={n.locked ? 'Unlock layer' : 'Lock layer'} aria-label={n.locked ? 'Unlock layer' : 'Lock layer'} onClick={() => run({ type: 'update', id: selected, patch: { locked: !n.locked } })}>{n.locked ? <UnlockKeyhole size={14} /> : <LockKeyhole size={14} />}</button>

          <button title="Duplicate layer" aria-label="Duplicate layer" disabled={!parent || n.locked} onClick={() => run({ type: 'duplicate', id: selected })}><Copy size={14} /></button>

          <button title="Move layer up" aria-label="Move layer up" disabled={!parent || n.locked || parent.children.indexOf(selected) === 0} onClick={() => parent && run({ type: 'move', id: selected, parentId: parent.id, index: parent.children.indexOf(selected) - 1 })}><ArrowUp size={14} /></button>

          <button title="Move layer down" aria-label="Move layer down" disabled={!parent || n.locked || parent.children.indexOf(selected) === parent.children.length - 1} onClick={() => parent && run({ type: 'move', id: selected, parentId: parent.id, index: parent.children.indexOf(selected) + 1 })}><ArrowDown size={14} /></button>

          <button title="Delete layer" aria-label="Delete layer" disabled={!parent || n.locked} onClick={() => run({ type: 'delete', id: selected })}><Trash2 size={14} /></button>

        </div>

      </div>

      <fieldset disabled={n.locked}>
      {parent?.layoutMode==='free'&&<div className="property-section"><h3>Position · layer order</h3><div className="position-tools">
       <button disabled={parent.children.indexOf(selected)===parent.children.length-1} onClick={()=>run({type:'move',id:selected,parentId:parent.id,index:parent.children.length-1})}>Bring to front</button>
       <button disabled={parent.children.indexOf(selected)===0} onClick={()=>run({type:'move',id:selected,parentId:parent.id,index:0})}>Send to back</button>
       <button disabled={parent.children.indexOf(selected)===parent.children.length-1} onClick={()=>run({type:'move',id:selected,parentId:parent.id,index:parent.children.indexOf(selected)+1})}>Bring forward</button>
       <button disabled={parent.children.indexOf(selected)===0} onClick={()=>run({type:'move',id:selected,parentId:parent.id,index:parent.children.indexOf(selected)-1})}>Send backward</button>
      </div></div>}

      {n.kind === 'text' && <div className="property-section"><h3>Content</h3><Field label="Text content" value={n.text ?? ''} multiline onCommit={text => run({ type: 'update', id: selected, patch: { text } })} /></div>}

      {n.kind === 'image' && <div className="property-section"><h3>Image</h3><Field label="Alt text" value={n.alt ?? ''} onCommit={alt => run({ type: 'update', id: selected, patch: { alt } })} /><label className="field"><span>Image fit</span><select aria-label="Image fit" value={n.style.objectFit ?? 'cover'} onChange={e => style({ objectFit: e.target.value as 'cover' | 'contain' })}><option>cover</option><option>contain</option></select></label></div>}

      {!n.frame&&n.layoutMode!=='free'&&<>
      <div className="property-section"><h3>Layout <span>FLOW</span></h3>

        <div className="field-grid"><label className="field"><span>Width sizing</span><select aria-label="Width mode" value={n.style.widthMode??(typeof n.style.width==='number'?'fixed':'fill')} onChange={e=>{const mode=e.target.value as NodeStyle['widthMode'];style({widthMode:mode,...(mode==='fixed'?{width:typeof n.style.width==='number'?n.style.width:measured().width}:{})});}}><option value="fixed">Fixed</option><option value="fit">Fit content</option><option value="fill">Fill available</option></select></label><label className="field"><span>Height sizing</span><select aria-label="Height mode" value={n.style.heightMode??(n.style.height?'fixed':'fit')} onChange={e=>{const mode=e.target.value as NodeStyle['heightMode'];style({heightMode:mode,...(mode==='fixed'?{height:n.style.height??measured().height}:mode==='fit'?{height:undefined,minHeight:0}:{})});}}><option value="fixed">Fixed</option><option value="fit">Fit content</option><option value="fill" disabled={!parent?.style.height||parent.style.heightMode==='fit'||parent.style.heightMode==='fill'}>Fill available</option></select></label></div>

        {n.kind === 'container' && <><label className="field"><span>Direction</span><div className="segmented"><button className={n.style.direction !== 'row' ? 'active' : ''} onClick={() => style({ direction: 'column' })}>↓ Column</button><button className={n.style.direction === 'row' ? 'active' : ''} onClick={() => style({ direction: 'row' })}>→ Row</button></div></label>

          <div className="field-grid">{number('padding', 0, 'Padding', 500)}{number('gap', 0, 'Gap', 500)}</div>

          <label className="field"><span>Align items</span><select aria-label="Align items" value={n.style.align ?? 'stretch'} onChange={e => style({ align: e.target.value as NodeStyle['align'] })}><option value="stretch">Stretch</option><option value="flex-start">Start</option><option value="center">Center</option><option value="flex-end">End</option></select></label>

          <label className="field"><span>Distribute</span><select aria-label="Distribute" value={n.style.justify ?? 'flex-start'} onChange={e => style({ justify: e.target.value as NodeStyle['justify'] })}><option value="flex-start">Start</option><option value="center">Center</option><option value="space-between">Space between</option><option value="flex-end">End</option></select></label></>}

        <div className="field-grid"><Field label="Width" value={n.style.width ?? 'auto'} onCommit={value => style({width:value==='auto'||value==='100%'?value:Number(value),widthMode:value==='auto'?'fit':value==='100%'?'fill':'fixed'})}/>{number('minHeight', 0, 'Min height')}</div>

        <Field label="Height" value={n.style.height??'auto'} onCommit={value=>style({height:value==='auto'?undefined:Number(value),heightMode:value==='auto'?'fit':'fixed'})}/>

        {parent&&number('margin',0,'Margin',500)}

        {parent&&<div className="field-grid">{number('offsetX',0,'Offset X')}{number('offsetY',0,'Offset Y')}</div>}

        {n.kind === 'container' && number('flexGrow', 0, 'Flexible share', 10)}

        {parent && <label className="field"><span>Parent container</span><select aria-label="Parent container" value={parent.id} onChange={e => run({ type: 'move', id: selected, parentId: e.target.value, index: project.nodes[e.target.value].children.length })}>{Object.values(project.nodes).filter(node => node.kind === 'container' && node.id !== selected).map(node => <option value={node.id} key={node.id}>{node.name}</option>)}</select></label>}

      </div>

      </>}
      {n.kind === 'text' && <div className="property-section"><h3>Typography</h3><label className="field"><span>Font family</span><select aria-label="Font family" style={{fontFamily:n.style.fontFamily==='system'?undefined:n.style.fontFamily}} value={n.style.fontFamily??'system'} onChange={e=>style({fontFamily:e.target.value as NodeStyle['fontFamily']})}>{['system','Arial','Segoe UI','Georgia','Times New Roman','Verdana','Trebuchet MS','Courier New','Consolas'].map(f=><option key={f} style={{fontFamily:f}} value={f}>{f==='system'?'System sans-serif':f}</option>)}</select></label><p className="element-hint" style={{fontFamily:n.style.fontFamily,fontStyle:n.style.fontStyle}}>Aa — The quick brown fox</p><label className="check-field"><input aria-label="Italic" type="checkbox" checked={n.style.fontStyle==='italic'} onChange={e=>style({fontStyle:e.target.checked?'italic':'normal'})}/>Italic</label><div className="field-grid">{number('lineHeight',1.4,'Line height',4)}{number('letterSpacing',0,'Letter spacing',40)}</div><div className="field-grid">{number('fontSize', 24, 'Font size', 300)}<label className="field"><span>Weight</span><select aria-label="Weight" value={n.style.fontWeight ?? '400'} onChange={e => style({ fontWeight: e.target.value as NodeStyle['fontWeight'] })}>{['400','500','600','700','800'].map(v => <option key={v}>{v}</option>)}</select></label></div><label className="field"><span>Text alignment</span><select aria-label="Text alignment" value={n.style.textAlign ?? 'left'} onChange={e => style({ textAlign: e.target.value as NodeStyle['textAlign'] })}><option>left</option><option>center</option><option>right</option></select></label></div>}

      <div className="property-section"><h3>Appearance</h3>

        <ColorField label="Background" value={n.style.background??'transparent'} project={project} onCommit={(value,group)=>style({background:value},group)}/>

        {n.kind === 'text' && <ColorField label="Text color" value={n.style.color??'#242a35'} project={project} onCommit={(value,group)=>style({color:value},group)}/>}

        <Field label="Opacity %" type="number" value={(n.style.opacity??1)*100} min={0} max={100} onCommit={value=>style({opacity:Number(value)/100})}/><div className="field-grid"><fieldset disabled={n.kind==='shape'&&n.geometry?.type!=='rectangle'}>{number('borderRadius', 0, 'Radius', 500)}</fieldset>{number('borderWidth', 0, 'Border', 20)}</div>{n.kind==='shape'&&n.geometry?.type!=='rectangle'&&<small className="element-hint">Adjustable corner rounding currently supports rectangles. Other shapes keep their own geometry.</small>}{n.button&&<div className="field-grid">{number('borderTopLeftRadius',n.style.borderRadius??0,'Top-left radius',500)}{number('borderTopRightRadius',n.style.borderRadius??0,'Top-right radius',500)}{number('borderBottomRightRadius',n.style.borderRadius??0,'Bottom-right radius',500)}{number('borderBottomLeftRadius',n.style.borderRadius??0,'Bottom-left radius',500)}</div>}<label className="field"><span>Border style</span><select aria-label="Border style" value={n.style.borderWidth?n.style.borderStyle??'solid':'none'} onChange={e=>style(e.target.value==='none'?{borderWidth:0}:{borderStyle:e.target.value as NodeStyle['borderStyle'],borderWidth:n.style.borderWidth||2})}><option value="none">None</option><option value="solid">Solid</option><option value="dashed">Long dashed</option><option value="short-dashed">Short dashed</option><option value="dotted">Dotted</option></select></label>

        <ColorField label="Border color" value={n.style.borderColor??'#dddddd'} project={project} onCommit={(value,group)=>style({borderColor:value},group)}/>

      </div>

      <div className="property-section"><h3>Shadow</h3><label className="check-field"><input type="checkbox" aria-label="Enable shadow" checked={!!n.style.shadow} onChange={e=>style({shadow:e.target.checked?{x:0,y:6,blur:16,color:'#00000055'}:undefined})}/>Drop shadow</label>{n.style.shadow&&<><div className="field-grid"><Field label="Shadow X" type="number" value={n.style.shadow.x} onCommit={v=>style({shadow:{...n.style.shadow!,x:Number(v)}})}/><Field label="Shadow Y" type="number" value={n.style.shadow.y} onCommit={v=>style({shadow:{...n.style.shadow!,y:Number(v)}})}/><Field label="Shadow blur" type="number" value={n.style.shadow.blur} onCommit={v=>style({shadow:{...n.style.shadow!,blur:Number(v)}})}/><Field label="Shadow spread" type="number" value={n.style.shadow.spread??0} onCommit={v=>style({shadow:{...n.style.shadow!,spread:Number(v)}})}/><ColorField label="Shadow color" value={n.style.shadow.color} project={project} onCommit={(v,group)=>style({shadow:{...n.style.shadow!,color:v}},group)}/></div></>}</div>

      {n.kind==='shape'&&parent&&!n.frame&&<div className="property-section"><h3>Combine shapes</h3><label className="field"><span>Merge with</span><select aria-label="Merge with shape" value={mergeTarget} onChange={e=>setMergeTarget(e.target.value)}><option value="">Choose a sibling shape</option>{parent.children.filter(id=>id!==selected&&project.nodes[id].kind==='shape').map(id=><option value={id} key={id}>{project.nodes[id].name}</option>)}</select></label><button className="primary-button" disabled={!mergeTarget||!project.nodes[mergeTarget]} onClick={()=>{editor.mergeShapes(mergeTarget);setMergeTarget('');}}>Union shapes</button><small className="element-hint">Creates one outline using this shape’s fill. Separate parts remain a single compound shape. Drag shapes to overlap first.</small></div>}

      </fieldset>

    </fieldset>

    <div className="inspector-note">Styles are local values. Shared tokens and breakpoint overrides arrive in the next milestone.</div>

  </aside>;

}

