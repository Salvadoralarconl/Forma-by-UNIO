import {applyButtonSelection} from '../editor/buttonSelection';
import {FunctionalControl} from '../editor/FunctionalControl';
import type {Project, DesignNode} from '../domain/model';
import {ShapeVector} from '../editor/ShapeVector';
import {nodeStyle} from './nodeStyle';
import {fixedPageHeight} from '../domain/pageBounds';
import {PageBackground} from '../editor/PageBackground';

export function assetPath(id:string,mime:string){return `public/assets/${id}.${mime.split('/')[1]}`;}
export function buttonCss(project:Project){
 return Object.values(project.nodes).filter(n=>n.button).map(n=>{
  const b=n.button!;
  const rules=(['focus','hover','selected','pressed'] as const).map(state=>{const s=b.states[state];if(!s)return '';
   const shadow=b.textOnly?undefined:s.shadow??n.style.shadow;
   const background=b.textOnly?'transparent':s.background??(n.style.gradient?`linear-gradient(${n.style.gradient.angle}deg, ${n.style.gradient.from}, ${n.style.gradient.to})`:n.style.background??'transparent');
   return `#node-${n.id}${state==='selected'?'[data-button-selected=true]':':'+(state==='pressed'?'active':state==='focus'?'focus':'hover')}{background:${background}!important;color:${s.color??n.style.color??'#ffffff'}!important;${s.outlineWidth!==undefined?`outline:${s.outlineWidth}px solid ${s.outlineColor??n.style.color??'#3769d3'}!important;outline-offset:2px;`:''}transform:translate(${s.offsetX??0}px,${s.offsetY??0}px) scale(${s.scale??1});box-shadow:${shadow?`${shadow.x}px ${shadow.y}px ${shadow.blur}px ${shadow.spread??0}px ${shadow.color}`:'none'}!important;}`;
  }).join('\n');
  return `#node-${n.id}{transition:background ${b.duration}ms ${b.easing},color ${b.duration}ms ${b.easing},transform ${b.duration}ms ${b.easing},box-shadow ${b.duration}ms ${b.easing};}\n${rules}`;
 }).join('\n');
}
export function Site({project}:{project:Project}){
 const pageForNode=(target:string)=>project.pages.find(page=>{const visit=(id:string):boolean=>id===target||project.nodes[id].children.some(visit);return visit(page.rootId);});
 const render=(id:string,parent?:DesignNode):React.ReactNode=>{
  const n=project.nodes[id];
  const pageBackground=project.pages.find(p=>p.rootId===id)?.background;
  const props={...(n.button?.selectionMode&&n.button.selectionMode!=='none'?{'data-button-selection':n.button.selectionMode,'aria-pressed':false}:{}),id:`node-${id}`,'data-node-id':id,'data-kind':n.kind,style:{...nodeStyle(n,parent),...(pageBackground?{background:'transparent'}:{}),...(n.layoutMode==='free'?{overflow:'hidden'}:{} )},className:n.button?'design-node semantic-button':'design-node'};
  if(n.control)return <FunctionalControl key={id} node={n} preview props={props}/>;
  if(n.kind==='shape')return <ShapeVector key={id} node={n} props={props}/>;
  if(n.kind==='icon')return <svg key={id} {...props} preserveAspectRatio={n.style.lineStyle?'none':'xMidYMid meet'} style={{...props.style,border:undefined}} role="img" aria-label={n.name} viewBox={(n.iconViewBox??[0,0,24,24]).join(' ')}>{n.iconPaths?.map((d,i)=>{const p=n.iconPaint?.[i];return <path key={i} d={d} fill={n.iconFills?.[i]?n.style.background??'#242a35':'none'} stroke={n.iconFills?.[i]?'none':n.style.background??'#242a35'} vectorEffect={n.style.lineStyle?'non-scaling-stroke':undefined} strokeWidth={n.style.borderWidth??p?.width??2} strokeDasharray={n.style.lineStyle==='dashed'?'3 2':n.style.lineStyle==='dotted'?'.1 2':undefined} strokeLinecap={n.style.lineStyle&&n.style.lineStyle!=='dotted'?'butt':p?.cap??'round'} strokeLinejoin={p?.join??'round'} fillRule={p?.rule??'evenodd'}/>;})}</svg>;
  if(n.kind==='image'){const a=project.assets[n.assetId!];return <img key={id} {...props} src={assetPath(a.id,a.mime)} alt={n.alt??''}/>;}
  if(n.kind==='text')return <p key={id} {...props}>{n.text}</p>;
  const children=n.children.map(child=>render(child,n));
  if(n.button){const a=n.button.action;let href:string|undefined;
   if(a.type==='link'&&a.target){try{const u=new URL(a.target);if(['https:','http:'].includes(u.protocol)&&!u.username&&!u.password)href=u.href;}catch{/* invalid action stays inert */}}
   if(a.type==='page'&&a.target)href=`#page-${a.target}`;
   if(a.type==='section'&&a.target){const page=pageForNode(a.target);if(page&&!page.archived)href=`#node-${a.target}`;}
   const selection={onClick:(e:React.MouseEvent<HTMLElement>)=>applyButtonSelection(e.currentTarget)};
   return href?<a key={id} {...props} {...selection} href={href} target={a.type==='link'?'_blank':undefined} rel={a.type==='link'?'noopener noreferrer':undefined}>{children}</a>:<button key={id} {...props} {...selection} type="button">{children}</button>;
  }
  return <div key={id} {...props}>{children}</div>;
 };
 return <main>{project.pages.filter(p=>!p.archived).map(p=><section id={`page-${p.id}`} key={p.id} aria-label={p.name} data-page-id={p.id} style={{position:'relative',width:p.width??1440,height:fixedPageHeight(project,p.rootId),overflow:'hidden'}}>{p.background&&<PageBackground background={p.background} imageUrl={p.background.assetId?assetPath(p.background.assetId,project.assets[p.background.assetId].mime):undefined} fallbackColor={project.nodes[p.rootId].style.background}/>}{render(p.rootId)}</section>)}</main>;
}


