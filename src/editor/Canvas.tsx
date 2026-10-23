import { type CSSProperties, useCallback, useEffect, useRef, useState } from 'react';

import { type DesignNode, type Project } from '../domain/model';
import {fixedPageHeight} from '../domain/pageBounds';

import { base64ToBytes } from '../persistence/archive';

import type { Editor } from './useEditor';

import {SemanticButton} from './SemanticButton';
import {ShapeVector} from './ShapeVector';
import { shapePath } from '../domain/shapes';

import {readImportedIcons} from '../domain/iconPacks';
import { ELEMENT_KEYS, type ElementKey } from './Elements';

import {useFreePlacement} from './freePlacement';
import {EqualGapGuides} from './EqualGapGuides';
import {PageHeightHandle} from './PageHeightHandle';
import {FreeSelectionOverlay} from './FreeSelectionOverlay';
import { SelectionOverlay } from './SelectionOverlay';
import {SelectionToolbar} from './SelectionToolbar';
import './SelectionToolbar.css';
import './CanvasPages.css';
import {PageControls} from './PageControls';



export function nodeStyle(node: DesignNode,parent?:DesignNode): CSSProperties {

  const s = node.style;

  const direction=parent?.style.direction??'column';

  const heightConstrained=!!parent?.style.height&&parent.style.heightMode!=='fit'&&parent.style.heightMode!=='fill';

  const heightFill=s.heightMode==='fill'&&heightConstrained;

  const fillMain=direction==='row'&&s.widthMode==='fill'||direction==='column'&&heightFill;

  const mainMode=direction==='row'?s.widthMode:s.heightMode;

  const legacyGrow=!mainMode&&!!s.flexGrow&&(node.kind!=='container'||s.direction!=='column'||direction==='row');

  const grow=fillMain?1:legacyGrow?s.flexGrow:undefined;

  const free=parent?.layoutMode==='free'&&node.frame;
  return { opacity:s.opacity,background: node.kind==='shape'||node.kind==='icon'?undefined:s.gradient?`linear-gradient(${s.gradient.angle}deg, ${s.gradient.from}, ${s.gradient.to})`:s.background, color: s.color, padding: s.padding, gap: s.gap, borderRadius: s.borderRadius,

    fontSize: s.fontSize, fontWeight: s.fontWeight,fontFamily:s.fontFamily==='system'?undefined:s.fontFamily,fontStyle:s.fontStyle,lineHeight:s.lineHeight,letterSpacing:s.letterSpacing,

    width:s.widthMode==='fit'?'fit-content':s.widthMode==='fill'?'auto':s.width,

    minHeight:s.heightMode==='fill'?0:s.minHeight,

    height:s.heightMode==='fit'||s.heightMode==='fill'?'auto':s.height,

    alignSelf:direction==='column'&&s.widthMode==='fill'||direction==='row'&&heightFill?'stretch':undefined,

    display: node.hidden ? 'none' : node.kind === 'container' ? 'flex' : 'block',

    flexDirection: s.direction ?? 'column', alignItems: s.align, justifyContent: s.justify,

    textAlign: s.textAlign, objectFit: s.objectFit, border: s.borderWidth ? `${s.borderWidth}px solid ${s.borderColor ?? '#dddddd'}` : undefined,

    flexGrow: grow, flexBasis: grow ? 0 : undefined,

    flexShrink: fillMain||node.kind==='container'?1:0, minWidth:0,maxWidth:'100%',boxSizing:'border-box',position:'relative',margin:s.margin??0,

    overflowWrap: 'anywhere', whiteSpace: node.kind === 'text' ? 'pre-wrap' : undefined,

    left:s.offsetX,top:s.offsetY,

    boxShadow:s.shadow&&node.kind!=='shape'?`${s.shadow.x}px ${s.shadow.y}px ${s.shadow.blur}px ${s.shadow.spread??0}px ${s.shadow.color}`:undefined,

    ...(free?{position:'absolute',left:free.x,top:free.y,width:free.width,height:free.height,minHeight:0,margin:0,maxWidth:'none',flexGrow:0}:{}),
    filter:s.shadow&&node.kind==='shape'?`drop-shadow(${s.shadow.x}px ${s.shadow.y}px ${s.shadow.blur}px ${s.shadow.color})`:undefined,

  };

}



function useAssetUrls(project: Project) {

  const [urls, setUrls] = useState<Record<string, string>>({});

  useEffect(() => {

    const next: Record<string, string> = {};

    for (const asset of Object.values(project.assets)) next[asset.id] = URL.createObjectURL(new Blob([new Uint8Array(base64ToBytes(asset.data))], { type: asset.mime }));

    setUrls(next);

    return () => { Object.values(next).forEach(url => URL.revokeObjectURL(url)); };

  }, [project.assets]);

  return urls;

}



export function Canvas({ editor, preview, width, zoom,pageId }: { editor: Editor; preview: boolean; width: number; zoom: number;pageId?:string }) {

  const { project, selected, setSelected } = editor;

  const rootId = (project.pages.find(p => p.id === (pageId??editor.pageId)) ?? project.pages[0]).rootId;
  const visiblePages=project.pages.filter(p=>!p.archived),isFirstPage=visiblePages[0]?.rootId===rootId,isLastPage=visiblePages.at(-1)?.rootId===rootId;

  const urls = useAssetUrls(project);
  const freePage=project.nodes[rootId].layoutMode==='free',pageHeight=fixedPageHeight(project,rootId);
  const free=useFreePlacement(editor,rootId,pageId??editor.pageId,width,pageHeight,zoom);
  const [dropPreview,setDropPreview]=useState<{x:number;y:number;width:number;height:number}|null>(null);
  useEffect(()=>{if(preview)free.cancel();},[preview]);

  const gesture=useRef<{id:string;x:number;y:number;offsetX:number;offsetY:number;target:HTMLElement;left:string;top:string;project:Project}|null>(null);

  const cancelDrag=useCallback(()=>{const g=gesture.current;gesture.current=null;if(g){g.target.style.left=g.left;g.target.style.top=g.top;}},[]);

  useEffect(()=>{window.addEventListener('blur',cancelDrag);return()=>{cancelDrag();window.removeEventListener('blur',cancelDrag);};},[cancelDrag]);

  useEffect(()=>{const g=gesture.current;if(g&&(g.id!==selected||g.project!==project||preview))cancelDrag();},[project,selected,preview,cancelDrag]);

  const renderNode = (id: string,parent?:DesignNode) => {

    const n = project.nodes[id];

    const selectedHere = !preview && editor.selectedIds.includes(id);

    const props = {

      'data-node-id': id, 'data-kind': n.kind,

      className: `design-node ${!preview ? 'editable-node' : ''} ${selectedHere ? 'is-selected' : ''}`,

      style: {...nodeStyle(n,parent),...(n.layoutMode==='free'?{overflow:'hidden' as const}:{})},

      onClick: !preview ? (event: React.MouseEvent) => { event.stopPropagation(); editor.setPageId(pageId??editor.pageId);if(id===rootId)editor.clearSelection(rootId);else setSelected(id); } : undefined,

      onPointerDown:!preview&&id!==rootId&&!n.locked&&!project.nodes[rootId].locked?(event:React.PointerEvent<HTMLElement>)=>{

        if(event.button!==0)return; event.stopPropagation();editor.setPageId(pageId??editor.pageId);setSelected(id);

        gesture.current={id,x:event.clientX,y:event.clientY,offsetX:n.style.offsetX??0,offsetY:n.style.offsetY??0,target:event.currentTarget,left:event.currentTarget.style.left,top:event.currentTarget.style.top,project};event.currentTarget.setPointerCapture(event.pointerId);

      }:undefined,

      onPointerMove:!preview?(event:React.PointerEvent<HTMLElement>)=>{const g=gesture.current;if(!g||g.id!==id)return;g.target.style.left=`${g.offsetX+(event.clientX-g.x)/zoom}px`;g.target.style.top=`${g.offsetY+(event.clientY-g.y)/zoom}px`;}:undefined,

      onPointerUp:!preview?(event:React.PointerEvent<HTMLElement>)=>{const g=gesture.current;if(!g||g.id!==id)return;const dx=(event.clientX-g.x)/zoom,dy=(event.clientY-g.y)/zoom;cancelDrag();event.currentTarget.releasePointerCapture(event.pointerId);if(Math.abs(dx)+Math.abs(dy)>2)editor.run({type:'update',id,patch:{},style:{offsetX:Math.max(-5000,Math.min(5000,g.offsetX+dx)),offsetY:Math.max(-5000,Math.min(5000,g.offsetY+dy))}});}:undefined,

      onPointerCancel:cancelDrag,onLostPointerCapture:cancelDrag,
      ...(!preview&&freePage&&(id===rootId||parent?.layoutMode==='free')?{onClick:(event:React.MouseEvent)=>event.stopPropagation(),onPointerDown:(event:React.PointerEvent<HTMLElement>)=>free.down(event,id),onPointerMove:free.move,onPointerUp:free.up,onPointerCancel:free.cancel,onLostPointerCapture:free.cancel}:{}),

    };

    if(n.kind==='icon')return <svg key={id} {...props as unknown as React.SVGProps<SVGSVGElement>} role="img" aria-label={n.name} viewBox={(n.iconViewBox??[0,0,24,24]).join(' ')} preserveAspectRatio="xMidYMid meet" style={{...props.style,border:undefined}}>{n.iconPaths?.map((d,i)=><path key={i} d={d} fillRule={n.iconPaint?.[i]?.rule??'evenodd'} strokeLinecap={n.iconPaint?.[i]?.cap??'round'} strokeLinejoin={n.iconPaint?.[i]?.join??'round'} fill={n.iconFills?.[i]?n.style.background??'#242a35':'none'} stroke={n.iconFills?.[i]?'none':n.style.background??'#242a35'} strokeWidth={n.style.borderWidth??n.iconPaint?.[i]?.width??2} strokeDasharray={n.style.lineStyle==='dashed'?'3 2':n.style.lineStyle==='dotted'?'.1 2':undefined}/>)}</svg>;

    if(n.kind==='shape'&&n.geometry)return <ShapeVector key={id} node={n} props={props as unknown as React.SVGProps<SVGSVGElement>}/>;

    if(n.button)return <SemanticButton key={id} node={n} preview={preview} editingState={selected===id?editor.buttonState:'default'} props={props} onNavigate={(type,target)=>{const page=project.pages.find(p=>p.id===target);const nodeId=type==='page'?page?.rootId:target;if(page){editor.setPageId(page.id);editor.setSelected(page.rootId);}if(nodeId)document.querySelector(`[data-node-id="${nodeId}"]`)?.scrollIntoView({block:'start',behavior:window.matchMedia?.('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'});}}>{n.children.map(child=>renderNode(child,n))}</SemanticButton>;
    if (n.kind === 'image') return <img key={id} {...props} src={n.assetId ? urls[n.assetId] : undefined} alt={n.alt ?? ''} draggable={false} />;

    if (n.kind === 'text') return <p key={id} {...props}>{n.text}</p>;

    return <div key={id} {...props}>

      {n.children.map(child=>renderNode(child,n))}

      {!preview && !n.children.length && !n.hidden && <div className="empty-container" style={{ pointerEvents: 'none' }}>

        <span>{id === rootId ? 'Your next idea starts here.' : 'Empty container'}</span>

        {id === rootId && <small>Add a container, text, or image to begin.</small>}

      </div>}

    </div>;

  };

  const dropBox=(event:React.DragEvent)=>{const board=event.currentTarget.querySelector<HTMLElement>('.artboard');if(!board)return null;const r=board.getBoundingClientRect(),x=(event.clientX-r.left)/zoom,y=(event.clientY-r.top)/zoom;if(x<0||y<0||x>width||y>pageHeight)return null;const size=event.dataTransfer.types.map(t=>t.match(/^application\/x-forma-size-(\d+)-(\d+)$/)).find(Boolean);const w=Math.min(width,size?Number(size[1]):120),h=Math.min(pageHeight,size?Number(size[2]):120);return{x:Math.max(0,Math.min(width-w,x)),y:Math.max(0,Math.min(pageHeight-h,y)),width:w,height:h};};
  return <div className={`canvas-stage stacked-page-stage ${isFirstPage?'first-page-stage':''} ${isLastPage?'last-page-stage':''} ${preview ? 'preview-stage' : ''}`} onDragLeave={event=>{if(!event.currentTarget.contains(event.relatedTarget as Node))setDropPreview(null);}} onDragOver={event=>{if(preview||!event.dataTransfer.types.includes('application/x-forma-element'))return;if(freePage){const box=dropBox(event);setDropPreview(box);if(box){event.preventDefault();event.dataTransfer.dropEffect='copy';}}else event.preventDefault();}} onDrop={event=>{
    setDropPreview(null);if(preview)return;const key=event.dataTransfer.getData('application/x-forma-element');if(!ELEMENT_KEYS.includes(key as ElementKey)&&!readImportedIcons().some(i=>`local-${i.id}`===key))return;event.preventDefault();
    if(freePage){const box=dropBox(event);if(!box)return;editor.setPageId(pageId??editor.pageId);editor.insertElement(key,rootId,{x:box.x,y:box.y});return;}
    editor.setPageId(pageId??editor.pageId);const target=(event.target as HTMLElement).closest('[data-node-id]')?.getAttribute('data-node-id')??rootId;editor.insertElement(key as ElementKey,target);
  }}>
    <div className="artboard-wrap" style={{ width: width * zoom, height:pageHeight*zoom,minHeight: pageHeight * zoom }}>

      <div className="artboard-heading"><span>{project.pages.find(p => p.id === (pageId??editor.pageId))?.name}</span><span>{width} px</span></div>
      {!preview&&<PageControls editor={editor} pageId={pageId??editor.pageId} zoom={zoom} height={pageHeight}/>}

      <div data-page-id={pageId??editor.pageId} data-testid="artboard" className="artboard" style={{ width, zoom,height:pageHeight,overflow:'hidden' }}>

        {renderNode(rootId)}
        {!preview&&freePage&&<div className="free-canvas-guides"><EqualGapGuides gaps={free.guides.gaps}/>{free.guides.x!==undefined&&<div className="snap-guide vertical" style={{left:free.guides.x,height:pageHeight}}/>}{free.guides.y!==undefined&&<div className="snap-guide horizontal" style={{top:free.guides.y,width}}/>}{free.marquee&&<div className="marquee" style={{left:free.marquee.x,top:free.marquee.y,width:free.marquee.width,height:free.marquee.height}}/>}{dropPreview&&<div className="drop-preview" style={{left:dropPreview.x,top:dropPreview.y,width:dropPreview.width,height:dropPreview.height}}/>}</div>}

        {!preview&&!project.nodes[rootId].locked&&(!pageId||pageId===editor.pageId)&&(freePage?<FreeSelectionOverlay editor={editor} zoom={zoom} width={width} height={pageHeight} dragBounds={free.dragBounds}/>:<SelectionOverlay editor={editor} zoom={zoom}/>)}

      </div>

      {!preview&&(!pageId||pageId===editor.pageId)&&<SelectionToolbar editor={editor} rootId={rootId} zoom={zoom} dragBounds={freePage?free.dragBounds:null}/>}
      {!preview&&<PageHeightHandle editor={editor} pageId={pageId??editor.pageId} zoom={zoom} height={pageHeight}/>}
      {!preview && (!pageId||pageId===editor.pageId) && editor.selectedIds.length>0 && project.nodes[selected] && <div data-testid="selection-label" className="selection-caption">{project.nodes[selected].name} <span>· {project.nodes[selected].kind}</span></div>}

    </div>

    {!preview&&isLastPage&&!freePage&&<button className="add-page-below" onClick={()=>editor.run({type:'addPage',name:`Design ${project.pages.length+1}`,afterId:pageId??editor.pageId,width,mode:'free'})}>+ New free design page</button>}
    {!preview&&isLastPage&&<button className="add-page-below" style={{width:width*zoom}} aria-label={`Add page below ${project.pages.find(p=>p.rootId===rootId)?.name}`} onClick={()=>editor.run({type:'addPage',name:`Page ${project.pages.length+1}`,afterId:pageId??editor.pageId,width,mode:freePage?'free':'flow'})}>+ Add page</button>}

  </div>;

}



