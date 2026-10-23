import {useLayoutEffect,useRef,useState} from 'react';
import {Search,X} from 'lucide-react';
export function PropertySearch({kind}:{kind:string}){
const [query,setQuery]=useState(''),[empty,setEmpty]=useState(false),ref=useRef<HTMLDivElement>(null);
useLayoutEffect(()=>{
 const panel=ref.current?.closest('.inspector');if(!panel)return;
 panel.querySelectorAll('[data-property-filter-hidden]').forEach(el=>el.removeAttribute('data-property-filter-hidden'));
 const words=query.trim().toLowerCase().split(/\s+/).filter(Boolean),matches=(text:string)=>words.every(w=>text.toLowerCase().includes(w));
 if(!words.length){setEmpty(false);return;}
 const hide=(el:Element)=>el.setAttribute('data-property-filter-hidden','true');
 const filter=(el:Element,context=''):boolean=>{
 if(el.matches('h3'))return false;
 const heading=el.querySelector(':scope > h3')?.textContent??'';
 const text=[context,heading,el.getAttribute('aria-label')??'',el.matches('label')?el.querySelector('span')?.textContent??el.textContent:el.matches('button')?el.textContent:''].join(' ');
 if(el.matches('label,.color-control,button,input,textarea,select')){const label=el.matches('.color-control')?el.querySelector('label span')?.textContent??'':text;const yes=matches(label);if(!yes)hide(el);return yes;}
 if(el.matches('p,small')){hide(el);return false;}
 if(heading&&matches(heading))return true;
 let found=false,currentHeading:Element|undefined;for(const child of el.children){if(child.matches('h3')){currentHeading=child;hide(child);continue;}if(filter(child,context+' '+heading)){found=true;currentHeading?.removeAttribute('data-property-filter-hidden');}} 
 if(!found)hide(el);return found;
 };
 let found=false;panel.querySelectorAll('.property-section').forEach(section=>{if(!section.parentElement?.closest('.property-section')&&filter(section))found=true;});
 setEmpty(!found);
});
return <><div className="inspector-title property-search" ref={ref}><Search size={13}/><input type="search" aria-label="Search properties" placeholder="Search properties…" value={query} onChange={e=>setQuery(e.target.value)} onKeyDown={e=>{if(e.key==='Escape'){e.stopPropagation();setQuery('');}}}/>{query?<button aria-label="Clear property search" onClick={()=>setQuery('')}><X size={12}/></button>:<span className="tag">{kind}</span>}</div>{empty&&<p className="inspector-note" role="status">No matching settings for this selection.</p>}</>;
}
