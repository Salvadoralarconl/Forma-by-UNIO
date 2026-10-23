import {useState,type HTMLAttributes} from 'react';

import type {DesignNode} from '../domain/model';
import {runPageSearch} from './controlSearch';
import './FunctionalControl.css';
import {EditableText} from './EditableText';
export function FunctionalControl({node,preview,props,editable=false,onCommitText}:{node:DesignNode;preview:boolean;props:HTMLAttributes<HTMLDivElement>;editable?:boolean;onCommitText?:(text:string)=>void}){
 const [status,setStatus]=useState(''),control=node.control!;const size=control.type==='search'?control.iconSize??18:18;const glyph=<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">{control.type==='search'?<><circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5"/></>:<path d="m6 9 6 6 6-6"/>}</svg>;
 return <div {...props} data-control={control.type} className={`${props.className??''} functional-control`} onDoubleClick={!preview?event=>{event.stopPropagation();event.currentTarget.querySelector('.control-edit-label')?.dispatchEvent(new MouseEvent('dblclick',{bubbles:true,cancelable:true}));}:undefined}>
 {!preview?<div className="control-design-face"><EditableText text={control.type==='search'?control.placeholder:control.defaultValue??control.label} editable={editable} onCommit={text=>onCommitText?.(text)} props={{className:'control-edit-label',style:{flex:1,minWidth:0,margin:0,padding:'8px 10px',whiteSpace:'pre',overflow:'hidden'}}}/><span className="control-icon" aria-hidden="true">{glyph}</span></div>:control.type==='search'?<form data-page-search="true" role="search" onSubmit={e=>{e.preventDefault();setStatus(runPageSearch(e.currentTarget));}}>
  <input type="search" name="query" aria-label={control.label} placeholder={control.placeholder} readOnly={!preview} tabIndex={preview?0:-1}/><button type="submit" aria-label="Search page" tabIndex={preview?0:-1}>{glyph}</button><output role="status" aria-live="polite">{status}</output>
 </form>:<select key={control.options.join('\n')+control.defaultValue} aria-label={control.label} defaultValue={control.defaultValue??''} tabIndex={preview?0:-1} style={!preview?{pointerEvents:'none'}:undefined}>
  <option value="" disabled>{control.label}</option>{control.options.map((option,index)=><option value={option} key={index}>{option}</option>)}
 </select>}
 </div>;
}
