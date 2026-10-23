import {useState,type ReactNode,type CSSProperties} from 'react';
import type {DesignNode} from '../domain/model';
export function SemanticButton({node,preview,editingState='default',props,children,onNavigate}:{node:DesignNode;preview:boolean;editingState?:string;props:React.HTMLAttributes<HTMLElement>;children:ReactNode;onNavigate:(type:'page'|'section',target:string)=>void}){
 const [hover,setHover]=useState(false),[pressed,setPressed]=useState(false),[focus,setFocus]=useState(false),b=node.button!;
 const state=preview?pressed?'pressed':hover?'hover':focus?'focus':'default':editingState;
 const visual=state==='default'?{}:b.states[state as keyof typeof b.states]??{};
 const shadow=visual.shadow??node.style.shadow;
 const style={...props.style,...(visual.background?{background:visual.background}:{}),color:visual.color??node.style.color,'--button-color':visual.color??node.style.color??'#ffffff',transform:`translate(${visual.offsetX??0}px, ${visual.offsetY??0}px) scale(${visual.scale??1})`,transition:preview?`background-color ${b.duration}ms ${b.easing}, color ${b.duration}ms ${b.easing}, box-shadow ${b.duration}ms ${b.easing}, transform ${b.duration}ms ${b.easing}`:undefined,boxShadow:shadow?`${shadow.x}px ${shadow.y}px ${shadow.blur}px ${shadow.spread??0}px ${shadow.color}`:undefined,cursor:preview?'pointer':undefined} as CSSProperties;
 const common={...props,style,className:`${props.className??''} semantic-button`, 'data-button-state':state};
 if(!preview)return <div {...common}>{children}</div>;
 const events={onPointerEnter:()=>setHover(true),onPointerLeave:()=>{setHover(false);setPressed(false);},onPointerDown:()=>setPressed(true),onPointerUp:()=>setPressed(false),onPointerCancel:()=>setPressed(false),onFocus:()=>setFocus(true),onBlur:()=>{setFocus(false);setPressed(false);},onKeyDown:(e:React.KeyboardEvent)=>{if(e.key===' '||e.key==='Enter')setPressed(true);},onKeyUp:()=>setPressed(false)};
 if(b.action.type==='link'&&b.action.target)return <a {...common as React.AnchorHTMLAttributes<HTMLAnchorElement>} {...events} href={b.action.target} target="_blank" rel="noopener noreferrer">{children}</a>;
 if((b.action.type==='page'||b.action.type==='section')&&b.action.target){const type=b.action.type,target=b.action.target;return <a {...common as React.AnchorHTMLAttributes<HTMLAnchorElement>} {...events} href={`#${type==='page'?'page':'node'}-${target}`} onClick={e=>{e.preventDefault();onNavigate(type,target);}}>{children}</a>;}
 return <button {...common as React.ButtonHTMLAttributes<HTMLButtonElement>} {...events} type="button" onClick={()=>{if((b.action.type==='page'||b.action.type==='section')&&b.action.target)onNavigate(b.action.type,b.action.target);}}>{children}</button>;
}
