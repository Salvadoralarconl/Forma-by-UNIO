import {useEffect,useId,useRef,useState} from 'react';

import {colorToHsv,hsvToHex,parseColor,rememberColor} from './colors';

import type {Project} from '../domain/model';

export function ColorField({label,value,onCommit,project}:{label:string;value:string;onCommit:(v:string,historyGroup?:string)=>void;project:Project}){
 const groupId=useId(),groupSequence=useRef(0);

 const [open,setOpen]=useState(false),[draft,setDraft]=useState(value),[error,setError]=useState('');

 const [recent,setRecent]=useState<string[]>(()=>{try{const v=JSON.parse(localStorage.getItem('forma.recentColors')??'[]');return Array.isArray(v)?v.filter(x=>typeof x==='string'&&parseColor(x)).slice(0,16):[];}catch{return[];}});

 const [hsv,setHsv]=useState(()=>colorToHsv(value)),lastEmitted=useRef<string|null>(null);
 useEffect(()=>{if(value===lastEmitted.current){lastEmitted.current=null;return;}groupSequence.current++;setDraft(value);setHsv(colorToHsv(value));},[value]);

 const hex=parseColor(draft)??'#000000';

 const commit=(input=draft,preserveHsv=false,remember=true)=>{const color=parseColor(input);if(!color){setError('Enter HEX or RGB color.');return;}setError('');setDraft(color);if(!preserveHsv)setHsv(colorToHsv(color));if(color!==parseColor(value)){lastEmitted.current=color;onCommit(color,groupId+":"+groupSequence.current);}if(!remember)return;groupSequence.current++;const next=rememberColor(recent,color);setRecent(next);try{localStorage.setItem('forma.recentColors',JSON.stringify(next));}catch{}};

 const component=(key:'h'|'s'|'v'|'a',v:number)=>{const next={...hsv,[key]:v};setHsv(next);commit(hsvToHex(next),true,false);};

 const samples=Array.from(new Set(Object.values(project.nodes).filter(n=>!n.hidden).flatMap(n=>[n.style.background,n.style.color,n.style.borderColor]).filter((v):v is string=>!!v&&!!parseColor(v)))).slice(0,32);

 return <div className="color-control" onKeyDown={e=>{if(e.key==="Enter"&&(e.target as HTMLElement).getAttribute("aria-label")!==label){e.preventDefault();commit();}}}><div className="color-field"><button className="swatch" aria-label={`Open ${label} picker`} style={{background:value}} onClick={()=>{try{const v=JSON.parse(localStorage.getItem('forma.recentColors')??'[]');setRecent(Array.isArray(v)?v.filter(x=>typeof x==='string'&&parseColor(x)).slice(0,16):[]);}catch{}if(open)commit(draft,true);else groupSequence.current++;setOpen(!open);}}/><label className="field"><span>{label}</span><input aria-label={label} value={draft} onChange={e=>{setDraft(e.target.value);if(parseColor(e.target.value))setHsv(colorToHsv(e.target.value));}} onBlur={()=>commit()} onKeyDown={e=>{if(e.key==='Enter')e.currentTarget.blur();if(e.key==='Escape'){setDraft(value);setOpen(false);}}}/></label></div>{error&&<small role="alert">{error}</small>}

 {open&&<div className="color-picker" aria-label={`${label} color picker`}><div className="hue-wheel" role="slider" tabIndex={0} aria-label={`${label} color wheel`} aria-valuemin={0} aria-valuemax={360} aria-valuenow={Math.round(hsv.h)} onKeyDown={e=>{if(e.key==='ArrowRight'||e.key==='ArrowLeft'){e.preventDefault();component('h',(hsv.h+(e.key==='ArrowRight'?1:359))%360);}}} onPointerDown={e=>{e.currentTarget.setPointerCapture(e.pointerId);const r=e.currentTarget.getBoundingClientRect();component('h',(Math.atan2(e.clientX-r.left-r.width/2,-(e.clientY-r.top-r.height/2))*180/Math.PI+360)%360);}} onPointerMove={e=>{if(!e.currentTarget.hasPointerCapture(e.pointerId))return;const r=e.currentTarget.getBoundingClientRect();component('h',(Math.atan2(e.clientX-r.left-r.width/2,-(e.clientY-r.top-r.height/2))*180/Math.PI+360)%360);}} onPointerUp={e=>e.currentTarget.releasePointerCapture(e.pointerId)} style={{background:'conic-gradient(red,yellow,lime,cyan,blue,magenta,red)'}}><span style={{background:hex}}/></div>{(['h','s','v','a'] as const).map((key,i)=><label className="field" key={key}><span>{['Hue','Saturation','Brightness','Alpha'][i]}</span><input aria-label={`${label} ${['Hue','Saturation','Brightness','Alpha'][i]}`} type="range" min="0" max={key==='h'?360:100} value={key==='h'?hsv.h:Math.round(hsv[key]*100)} onChange={e=>component(key,Number(e.target.value)/(key==='h'?1:100))}/></label>)}

 <div className="rgb-fields">{['R','G','B'].map((name,i)=><label className="field" key={name}><span>{name}</span><input aria-label={`${label} ${name}`} type="number" min="0" max="255" value={parseInt(hex.slice(1+i*2,3+i*2),16)} onChange={e=>{const rgb=[0,1,2].map(j=>parseInt(hex.slice(1+j*2,3+j*2),16));rgb[i]=Math.max(0,Math.min(255,Math.round(Number(e.target.value))));const next='#'+rgb.map(v=>v.toString(16).padStart(2,'0')).join('')+(hex.length===9?hex.slice(7):'');commit(next,false,false);}}/></label>)}</div><button onClick={()=>commit()}>Apply color</button>

 <p className="element-hint">Recent colors</p><div className="color-swatches">{recent.map(c=><button key={c} aria-label={`Recent ${c}`} style={{background:c}} onClick={()=>commit(c)}/>)}</div>

 <details><summary>Pick a layer color</summary><p className="element-hint">Offline layer colors. Image pixels and desktop colors are unavailable.</p><div className="color-swatches">{samples.map(c=><button key={c} aria-label={`Sample ${c}`} style={{background:c}} onClick={()=>commit(c)}/>)}</div></details></div>}</div>;

}

