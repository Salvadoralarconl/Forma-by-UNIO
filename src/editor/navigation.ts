import { useEffect, useRef, type RefObject } from 'react';
export const wheelZoom = (current:number,delta:number) => Math.max(0.2,Math.min(2,current*Math.exp(-Math.max(-300,Math.min(300,delta))*0.002)));
export const canDeleteSelection=(key:string,typing:boolean,modal:boolean)=>!typing&&!modal&&(key==='Delete'||key==='Backspace');
export function useCanvasNavigation(ref:RefObject<HTMLDivElement|null>,zoom:number,setZoom:(zoom:number)=>void,enabled:boolean,wheelEnabled=true){
  const latest=useRef(zoom);const target=useRef(zoom);const wheelFrame=useRef(0);const correctionFrame=useRef(0);
  latest.current=zoom;if(!wheelFrame.current&&!correctionFrame.current)target.current=zoom;
  useEffect(()=>{
    const viewport=ref.current;if(!viewport||!enabled)return;
    let gesture:{id:number;x:number;y:number;left:number;top:number}|null=null;
    let anchor:{x:number;y:number;clientX:number;clientY:number;artboard:HTMLElement}|null=null;
    const stop=()=>{const old=gesture;gesture=null;if(old){try{viewport.releasePointerCapture(old.id);}catch{}}viewport.classList.remove('is-panning');};
    const cancelWheel=()=>{cancelAnimationFrame(wheelFrame.current);cancelAnimationFrame(correctionFrame.current);wheelFrame.current=0;correctionFrame.current=0;anchor=null;target.current=latest.current;};
    const wheel=(event:WheelEvent)=>{
      event.preventDefault();if(gesture)return;
      const delta=event.deltaY*(event.deltaMode===1?16:event.deltaMode===2?viewport.clientHeight:1);
      const next=wheelZoom(target.current,delta);if(next===target.current)return;
      const artboard=viewport.querySelector<HTMLElement>('.artboard');
      if(artboard){const rect=artboard.getBoundingClientRect(),actual=parseFloat(artboard.style.zoom)||latest.current;anchor={x:(event.clientX-rect.left)/actual,y:(event.clientY-rect.top)/actual,clientX:event.clientX,clientY:event.clientY,artboard};}
      target.current=next;
      if(!wheelFrame.current)wheelFrame.current=requestAnimationFrame(()=>{
        wheelFrame.current=0;cancelAnimationFrame(correctionFrame.current);setZoom(target.current);
        correctionFrame.current=requestAnimationFrame(()=>{correctionFrame.current=0;const point=anchor;anchor=null;if(point){const rect=point.artboard.getBoundingClientRect(),actual=parseFloat(point.artboard.style.zoom)||target.current;viewport.scrollLeft+=rect.left+point.x*actual-point.clientX;viewport.scrollTop+=rect.top+point.y*actual-point.clientY;}});
      });
    };
    const down=(event:PointerEvent)=>{if(event.button!==1)return;event.preventDefault();event.stopPropagation();cancelWheel();gesture={id:event.pointerId,x:event.clientX,y:event.clientY,left:viewport.scrollLeft,top:viewport.scrollTop};viewport.setPointerCapture(event.pointerId);viewport.classList.add('is-panning');};
    const move=(event:PointerEvent)=>{if(!gesture)return;event.preventDefault();viewport.scrollLeft=gesture.left-(event.clientX-gesture.x);viewport.scrollTop=gesture.top-(event.clientY-gesture.y);};
    const auxiliary=(event:MouseEvent)=>{if(event.button===1)event.preventDefault();};
    const blur=()=>{stop();cancelWheel();};const visibility=()=>{if(document.hidden)blur();};
    if(wheelEnabled)viewport.addEventListener('wheel',wheel,{passive:false});viewport.addEventListener('pointerdown',down,true);viewport.addEventListener('pointermove',move);viewport.addEventListener('pointerup',stop);viewport.addEventListener('pointercancel',stop);viewport.addEventListener('lostpointercapture',stop);viewport.addEventListener('auxclick',auxiliary);window.addEventListener('blur',blur);document.addEventListener('visibilitychange',visibility);
    return()=>{blur();viewport.removeEventListener('wheel',wheel);viewport.removeEventListener('pointerdown',down,true);viewport.removeEventListener('pointermove',move);viewport.removeEventListener('pointerup',stop);viewport.removeEventListener('pointercancel',stop);viewport.removeEventListener('lostpointercapture',stop);viewport.removeEventListener('auxclick',auxiliary);window.removeEventListener('blur',blur);document.removeEventListener('visibilitychange',visibility);};
  },[ref,setZoom,enabled,wheelEnabled]);
}
