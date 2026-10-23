import type {Project, DesignNode} from '../domain/model';
import {ShapeVector} from '../editor/ShapeVector';
import {nodeStyle} from './nodeStyle';
import {fixedPageHeight} from '../domain/pageBounds';

export function assetPath(id:string,mime:string){return `public/assets/${id}.${mime.split('/')[1]}`;}
export function buttonCss(project:Project){
 return Object.values(project.nodes).filter(n=>n.button).map(n=>{
  const b=n.button!;
  const rules=(['focus','hover','pressed'] as const).map(state=>{const s=b.states[state];
   const shadow=s.shadow??n.style.shadow;
   const background=s.background??(n.style.gradient?`linear-gradient(${n.style.gradient.angle}deg, ${n.style.gradient.from}, ${n.style.gradient.to})`:n.style.background??'transparent');
   return `#node-${n.id}:${state==='pressed'?'active':state==='focus'?'focus':'hover'}{background:${background}!important;color:${s.color??n.style.color??'#ffffff'}!important;transform:translate(${s.offsetX??0}px,${s.offsetY??0}px) scale(${s.scale??1});box-shadow:${shadow?`${shadow.x}px ${shadow.y}px ${shadow.blur}px ${shadow.spread??0}px ${shadow.color}`:'none'}!important;}`;
  }).join('\n');
  return `#node-${n.id}{transition:background ${b.duration}ms ${b.easing},color ${b.duration}ms ${b.easing},transform ${b.duration}ms ${b.easing},box-shadow ${b.duration}ms ${b.easing};}\n${rules}`;
 }).join('\n');
}
export function Site({project}:{project:Project}){
 const pageForNode=(target:string)=>project.pages.find(page=>{const visit=(id:string):boolean=>id===target||project.nodes[id].children.some(visit);return visit(page.rootId);});
 const render=(id:string,parent?:DesignNode):React.ReactNode=>{
  const n=project.nodes[id];
  const props={id:`node-${id}`,'data-node-id':id,'data-kind':n.kind,style:{...nodeStyle(n,parent),...(n.layoutMode==='free'?{overflow:'hidden'}:{} )},className:n.button?'design-node semantic-button':'design-node'};
  if(n.kind==='shape')return <ShapeVector key={id} node={n} props={props}/>;
  if(n.kind==='icon')return <svg key={id} {...props} style={{...props.style,border:undefined}} role="img" aria-label={n.name} viewBox={(n.iconViewBox??[0,0,24,24]).join(' ')}>{n.iconPaths?.map((d,i)=>{const p=n.iconPaint?.[i];return <path key={i} d={d} fill={n.iconFills?.[i]?n.style.background??'#242a35':'none'} stroke={n.iconFills?.[i]?'none':n.style.background??'#242a35'} strokeWidth={n.style.borderWidth??p?.width??2} strokeDasharray={n.style.lineStyle==='dashed'?'3 2':n.style.lineStyle==='dotted'?'.1 2':undefined} strokeLinecap={p?.cap??'round'} strokeLinejoin={p?.join??'round'} fillRule={p?.rule??'evenodd'}/>;})}</svg>;
  if(n.kind==='image'){const a=project.assets[n.assetId!];return <img key={id} {...props} src={assetPath(a.id,a.mime)} alt={n.alt??''}/>;}
  if(n.kind==='text')return <p key={id} {...props}>{n.text}</p>;
  const children=n.children.map(child=>render(child,n));
  if(n.button){const a=n.button.action;let href:string|undefined;
   if(a.type==='link'&&a.target){try{const u=new URL(a.target);if(['https:','http:'].includes(u.protocol)&&!u.username&&!u.password)href=u.href;}catch{/* invalid action stays inert */}}
   if(a.type==='page'&&a.target)href=`#page-${a.target}`;
   if(a.type==='section'&&a.target){const page=pageForNode(a.target);if(page&&!page.archived)href=`#node-${a.target}`;}
   return href?<a key={id} {...props} href={href} target={a.type==='link'?'_blank':undefined} rel={a.type==='link'?'noopener noreferrer':undefined}>{children}</a>:<button key={id} {...props} type="button">{children}</button>;
  }
  return <div key={id} {...props}>{children}</div>;
 };
 return <main>{project.pages.filter(p=>!p.archived).map(p=><section id={`page-${p.id}`} key={p.id} aria-label={p.name} style={{width:p.width??1440,height:fixedPageHeight(project,p.rootId),overflow:'hidden'}}>{render(p.rootId)}</section>)}</main>;
}


