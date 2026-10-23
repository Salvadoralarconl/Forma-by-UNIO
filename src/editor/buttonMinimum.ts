/** Intrinsic label/icon size in design pixels, independent of the current button frame. */
export function buttonMinimum(element:HTMLElement,zoom:number){
 const style=getComputedStyle(element),context=document.createElement('canvas').getContext('2d');
 const parts=Array.from(element.querySelectorAll<HTMLElement>('[data-kind="text"],[data-kind="icon"]')).map(child=>{
  if(child.dataset.kind==='icon'){const r=child.getBoundingClientRect();return {width:r.width/zoom,height:r.height/zoom};}
  const s=getComputedStyle(child),size=parseFloat(s.fontSize)||14,lines=(child.textContent??'').split('\n');
  if(context)context.font=`${s.fontStyle} ${s.fontWeight} ${s.fontSize} ${s.fontFamily}`;
  return {width:Math.max(...lines.map(line=>(context?.measureText(line).width??line.length*size*.6)+Math.max(0,Array.from(line).length-1)*(parseFloat(s.letterSpacing)||0))),height:lines.length*(parseFloat(s.lineHeight)||size*1.4)};
 });
 const horizontal=style.flexDirection!=='column',gap=parseFloat(style.gap)||0;
 return {width:Math.ceil((horizontal?parts.reduce((sum,p)=>sum+p.width,0)+Math.max(0,parts.length-1)*gap:Math.max(0,...parts.map(p=>p.width)))+(parseFloat(style.borderLeftWidth)||0)+(parseFloat(style.borderRightWidth)||0)),height:Math.ceil((horizontal?Math.max(0,...parts.map(p=>p.height)):parts.reduce((sum,p)=>sum+p.height,0)+Math.max(0,parts.length-1)*gap)+(parseFloat(style.borderTopWidth)||0)+(parseFloat(style.borderBottomWidth)||0))};
}
