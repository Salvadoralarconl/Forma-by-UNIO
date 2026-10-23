import type {Control,NodeStyle} from '../domain/model';
import type {Editor} from './useEditor';
import {Field} from './Inspector';
export function ControlInspector({editor}:{editor:Editor}){
 const node=editor.project.nodes[editor.selected],control=node?.control;if(!control)return null;
 const change=(patch:Partial<Control>)=>editor.run({type:'update',id:node.id,patch:{control:{...control,...patch} as Control}});
 const style=(patch:Partial<NodeStyle>)=>editor.run({type:'update',id:node.id,patch:{},style:patch});
 return <fieldset className="property-section" disabled={editor.busy||node.locked}><h3>{control.type==='search'?'Page search':'Dropdown'}</h3>
 <Field label="Control label" value={control.label} onCommit={label=>change({label})}/>
 {control.type==='search'?<><Field label="Search placeholder" value={control.placeholder} onCommit={placeholder=>change({placeholder})}/><p className="element-hint">In Preview and exported websites, searches visible text on this page and highlights matching objects.</p></>:<><Field label="Dropdown options" multiline value={control.options.join('\n')} onCommit={value=>{const options=[...new Set(value.split('\n').map(v=>v.trim()).filter(Boolean))];change({options,defaultValue:control.defaultValue&&options.includes(control.defaultValue)?control.defaultValue:undefined});}}/><label className="field"><span>Default selection</span><select aria-label="Dropdown default selection" value={control.defaultValue??''} onChange={e=>change({defaultValue:e.target.value||undefined})}><option value="">Show label</option>{control.options.map(v=><option key={v}>{v}</option>)}</select></label></>}
 <Field label="Control font size" type="number" min={8} max={300} value={node.style.fontSize??14} onCommit={v=>style({fontSize:Number(v)})}/>
 <label className="field"><span>Font family</span><select aria-label="Control font family" value={node.style.fontFamily??'system'} onChange={e=>style({fontFamily:e.target.value as NodeStyle['fontFamily']})}>{['system','Arial','Segoe UI','Georgia','Times New Roman','Verdana','Trebuchet MS','Courier New','Consolas'].map(v=><option key={v}>{v}</option>)}</select></label>
 </fieldset>;
}
