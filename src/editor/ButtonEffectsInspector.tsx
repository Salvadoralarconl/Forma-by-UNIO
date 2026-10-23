import type {Editor} from './useEditor';
import {buttonEffect} from '../domain/buttonEffects';
import type {ButtonBehavior} from '../domain/model';
import {Field} from './Inspector';
import {ColorField} from './ColorField';
export function ButtonEffectsInspector({editor}:{editor:Editor}){
const n=editor.project.nodes[editor.selected],b=n.button!,state=editor.buttonState,v=state==='default'?undefined:b.states[state];
const commit=(patch:Partial<ButtonBehavior>)=>editor.run({type:'update',id:n.id,patch:{button:{...b,...patch}}});
const visual=(patch:Partial<ButtonBehavior['states']['hover']>,group?:string)=>editor.run({type:'update',id:n.id,patch:{button:{...b,states:{...b.states,[state]:{...v,...patch,effect:'custom'}}}}},group);
return <><label className="field"><span>Effect</span><select aria-label="Button effect" value={state==='default'?b.normalEffect??'custom':v?.effect??'custom'} onChange={e=>{const effect=e.target.value as Parameters<typeof buttonEffect>[0];if(effect==='custom'){if(state==='default')commit({normalEffect:'custom'});else commit({states:{...b.states,[state]:{...v,effect:'custom'}}});return;}const next=buttonEffect(effect,n.style.background==='transparent'?'#3769d3':n.style.background??'#3769d3');if(state==='default'){editor.run({type:'update',id:n.id,patch:{button:{...b,normalEffect:effect}},style:{...(next.background?{background:next.background,color:next.color}:{}),borderWidth:next.outlineWidth??0,borderColor:next.outlineColor??n.style.borderColor,shadow:next.shadow,offsetY:next.offsetY}});}else commit({states:{...b.states,[state]:next}});}}>{[['custom','Custom'],['none','No effect'],['color','Color change'],['outline','Outline'],['shadow','Shadow'],...(state==='default'?[]:[['grow','Grow'],['shrink','Shrink'],['lift','Lift']])].map(([value,label])=><option value={value} key={value}>{label}</option>)}</select></label>
{state!=='default'&&<><Field label="Button outline width" type="number" min={0} max={20} value={v?.outlineWidth??0} onCommit={value=>visual({outlineWidth:Number(value)})}/><ColorField label="Button outline color" value={v?.outlineColor??'#3769d3'} project={editor.project} onCommit={(outlineColor,group)=>visual({outlineColor},group)}/></>}
<label className="field"><span>Selected after click</span><select aria-label="Button selection behavior" value={b.selectionMode??'none'} onChange={e=>commit({selectionMode:e.target.value as ButtonBehavior['selectionMode'],states:{...b.states,selected:b.states.selected??buttonEffect('outline',n.style.background??'#3769d3')}})}><option value="none">Off · momentary click only</option><option value="toggle">Toggle on / off</option><option value="select">Stay selected</option></select></label>
</>;
}
