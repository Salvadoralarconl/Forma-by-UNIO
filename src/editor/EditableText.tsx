import {useEffect,useRef,useState,type HTMLAttributes} from 'react';

export function EditableText({text,editable,props,onCommit,autoStart=false,onStarted}:{autoStart?:boolean;onStarted?:()=>void;text:string;editable:boolean;props:HTMLAttributes<HTMLParagraphElement>;onCommit:(text:string)=>void}){
 const [editing,setEditing]=useState(false),ref=useRef<HTMLParagraphElement>(null),original=useRef(text);
 useEffect(()=>{if(autoStart&&editable){original.current=text;setEditing(true);onStarted?.();}},[autoStart,editable]);
 useEffect(()=>{if(!editable)setEditing(false);},[editable]);
 useEffect(()=>{if(!editing||!ref.current)return;ref.current.focus();const range=document.createRange();range.selectNodeContents(ref.current);const selection=window.getSelection();selection?.removeAllRanges();selection?.addRange(range);},[editing]);
 const finish=(save:boolean)=>{if(!editing)return;const next=(ref.current?.innerText??ref.current?.textContent??original.current).replace(/\r\n/g,'\n');setEditing(false);if(ref.current)ref.current.textContent=save?next:original.current;if(save&&next!==original.current)onCommit(next);};
 return <p {...props} ref={ref} contentEditable={editing} suppressContentEditableWarning role={editing?'textbox':undefined} aria-label={editing?'Edit text':undefined} aria-multiline={editing?true:undefined}
 style={{...props.style,...(editing?{userSelect:'text',cursor:'text',pointerEvents:'auto',outline:props.className?.includes('control-edit-label')?'none':'1px solid #6c96d4'}:{})}}
 onDoubleClick={event=>{event.stopPropagation();if(!editable)return;event.preventDefault();original.current=text;setEditing(true);}}
 onPointerDown={event=>{if(editing){event.stopPropagation();return;}props.onPointerDown?.(event);}}
 onPointerMove={event=>{if(!editing)props.onPointerMove?.(event);}}
 onPointerUp={event=>{if(!editing)props.onPointerUp?.(event);}}
 onClick={event=>{if(editing)event.stopPropagation();else props.onClick?.(event);}}
 onKeyDown={event=>{if(!editing)return;event.stopPropagation();if(event.key==='Escape'){event.preventDefault();finish(false);event.currentTarget.blur();}else if(event.key==='Enter'&&(event.ctrlKey||event.metaKey)){event.preventDefault();event.currentTarget.blur();}}}
 onPaste={event=>{if(!editing)return;event.preventDefault();const value=event.clipboardData.getData('text/plain');document.execCommand('insertText',false,value);}}
 onBlur={()=>finish(true)}>{text}</p>;
}
