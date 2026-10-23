import { type Asset, type DesignNode, type NodeStyle, type Project,type PageBackground, makeNode, newId, parentOf, validateProject } from './model';

import { mergeShapeGeometry, type ShapeGeometry } from './shapes';

import {createPreset} from './presets';

import {pasteFragment,type Fragment} from './clipboard';

export type ElementPreset = string;



import {localIconSchema,type LocalIcon} from './iconPacks';
import {setSurroundingGap,type SpacingSide} from './spacing';
import {alignedFrames,freeSelection,unionBounds,initialFrameSize,type Frame,type Alignment} from './placement';
export type Command =
 | {type:'buttonIcon';id:string;icon?:LocalIcon;position?:'left'|'right';size?:number;remove?:boolean}
 | {type:'pageBackground';id:string;background:Partial<PageBackground>;asset?:Asset}
 | {type:'resizePageWidth';id:string;width:number}
 | {type:'spacing';id:string;side:SpacingSide;gap:number}
 | {type:'resizePage';id:string;height:number}
 | {type:'position';ids:string[];mode:Alignment;reference:'page'|'selection'}
 | {type:'frames';updates:{id:string;frame:Frame;fontSize?:number}[]}
  | {type:'addIcon';parentId:string;icon:LocalIcon;point?:{x:number;y:number}}

  | {type:'paste';parentId:string;fragment:Fragment}

  | { type: 'add'; kind: DesignNode['kind']; parentId: string; asset?: Asset; layout?: 'row' | 'column'; preset?: ElementPreset;point?:{x:number;y:number} }

  | { type: 'mergeShapes'; id: string; otherId: string; offset: { x: number; y: number }; placement?:{x:number;y:number}; measurements?:{first:{width:number;height:number};second:{width:number;height:number}};availableWidth?:number }

  | { type: 'update'; id: string; patch: Partial<Pick<DesignNode, 'name' | 'text' | 'alt' | 'hidden' | 'locked' | 'aspectLocked' | 'button' | 'control'>>; style?: Partial<NodeStyle> }

  | { type: 'delete' | 'duplicate'; id: string }

  | { type: 'move'; id: string; parentId: string; index: number }

  | { type: 'renameProject'; name: string }

  | { type: 'addPage'; name: string;afterId?:string;width?:number;mode?:'flow'|'free' }

  | {type:'deletePage'|'archivePage'|'duplicatePage';id:string}

  | {type:'movePage';id:string;index:number}

  | { type: 'renamePage'; id: string; name: string };



export function applyCommand(project: Project, command: Command): Project {

  const p = structuredClone(project);

  const roots = p.pages.map(page => page.rootId);

  const node = 'id' in command ? p.nodes[command.id] : undefined;

  if ('id' in command && !['pageBackground','renamePage','deletePage','archivePage','movePage','resizePage','duplicatePage','resizePageWidth'].includes(command.type) && !node) throw new Error('Layer no longer exists.');
  const targets=[node,...('parentId' in command?[p.nodes[command.parentId]]:[])];
  for(const target of targets){if(target){let ancestor=parentOf(p,target.id);while(ancestor){if(ancestor.locked)throw new Error('Unlock the page or parent before editing its contents.');ancestor=parentOf(p,ancestor.id);}}}

  if (node?.locked && command.type !== 'update') throw new Error('Unlock this layer before editing it.');

  switch (command.type) {
    case 'pageBackground': {const page=p.pages.find(page=>page.id===command.id);if(!page||p.nodes[page.rootId].locked)throw new Error('Choose an unlocked page.');if(command.asset)p.assets[command.asset.id]=command.asset;page.background={...page.background,...command.background};p.schemaVersion=2;break;}
    case 'resizePageWidth': {const page=p.pages.find(page=>page.id===command.id);if(!page||p.nodes[page.rootId].locked||!Number.isFinite(command.width)||command.width<240||command.width>5000)throw new Error('Choose an unlocked page and width 240–5000.');page.width=command.width;break;}
    case 'duplicatePage': {
      const index=p.pages.findIndex(page=>page.id===command.id),source=p.pages[index];if(!source)throw new Error('Page no longer exists.');
      const ids=new Map<string,string>();const collect=(id:string)=>{ids.set(id,newId());p.nodes[id].children.forEach(collect);};collect(source.rootId);
      const pageId=newId();for(const [oldId,id] of ids){const n=structuredClone(p.nodes[oldId]);n.id=id;n.children=n.children.map(child=>ids.get(child)!);if(n.button){const action=n.button.action;if(action.type==='section'&&action.target&&ids.has(action.target))action.target=ids.get(action.target);if(action.type==='page'&&action.target===source.id)action.target=pageId;}p.nodes[id]=n;}
      p.pages.splice(index+1,0,{...source,id:pageId,rootId:ids.get(source.rootId)!,name:(source.name+' copy').slice(0,120),archived:false});break;
    }

    case 'resizePage': {const page=p.pages.find(page=>page.id===command.id),root=page?p.nodes[page.rootId]:undefined;if(!page||!root||root.locked||!Number.isFinite(command.height)||command.height<100||command.height>5000)throw new Error('Choose an unlocked page and height100-5000.');page.height=command.height;if(root.layoutMode==='free'){root.style.height=command.height;root.style.minHeight=command.height;}break;}
    case 'frames': {const selection=freeSelection(p,command.updates.map(u=>u.id));for(const update of command.updates){const f=update.frame;if(!Object.values(f).every(Number.isFinite)||f.x<0||f.y<0||f.width<=0||f.height<=0||f.width>5000||f.height>5000||f.x>5000||f.y>5000)throw new Error('Keep the element inside the page.');}for(const update of command.updates){const n=p.nodes[update.id];if(update.fontSize!==undefined){if(n.kind!=='text'||!Number.isFinite(update.fontSize)||update.fontSize<8||update.fontSize>300)throw new Error('Text size must be 8–300.');n.style.fontSize=update.fontSize;}n.frame=update.frame;}break;}
    case 'spacing': {const selection=freeSelection(p,[command.id]),peers=selection.parent.children.filter(id=>id!==command.id).map(id=>p.nodes[id]).filter(n=>!n.hidden&&n.frame).map(n=>n.frame!);p.nodes[command.id].frame=setSurroundingGap(selection.nodes[0].frame!,peers,selection.width,selection.height,command.side,command.gap);break;}
    case 'position': {const selected=freeSelection(p,command.ids),bounds=command.reference==='page'?{x:0,y:0,width:selected.width,height:selected.height}:unionBounds(selected.nodes.map(n=>n.frame!));for(const update of alignedFrames(selected.nodes,bounds,command.mode)){if(update.frame.x<0||update.frame.y<0)throw new Error('Elements exceed the alignment area.');p.nodes[update.id].frame=update.frame;}break;}
    case 'renameProject': p.name = command.name.trim(); break;

    case 'renamePage': {

      const page = p.pages.find(x => x.id === command.id);

      if (!page) throw new Error('Page no longer exists.');

      page.name = command.name.trim(); break;

    }

    case 'addPage': {

      const previous=p.pages.find(page=>page.id===command.afterId)??p.pages.at(-1)!;

      const width=previous.width??command.width??1440,height=p.nodes[previous.rootId].style.height??p.nodes[previous.rootId].style.minHeight??previous.height??780;

      const root=makeNode('container',newId(),'Page',{padding:64,gap:24,minHeight:height,background:'#ffffff'});p.nodes[root.id]=root;
      if(command.mode==='free'){root.layoutMode='free';root.style={height,minHeight:height,padding:0,background:'#ffffff'};p.schemaVersion=2;}
      p.pages.splice(p.pages.indexOf(previous)+1,0,{id:newId(),name:command.name,rootId:root.id,width,height});break;

    }

    case 'archivePage': {

      const page=p.pages.find(page=>page.id===command.id);if(!page)throw new Error('Page no longer exists.');

      if(!page.archived&&p.pages.filter(page=>!page.archived).length<=1)throw new Error('Keep at least one active page.');page.archived=!page.archived;break;

    }

    case 'movePage': {

      const index=p.pages.findIndex(page=>page.id===command.id);if(index<0)throw new Error('Page no longer exists.');const [page]=p.pages.splice(index,1);p.pages.splice(Math.max(0,Math.min(p.pages.length,command.index)),0,page);break;

    }

    case 'deletePage': {

      const page=p.pages.find(page=>page.id===command.id);if(!page)throw new Error('Page no longer exists.');if(!page.archived&&p.pages.filter(page=>!page.archived).length<=1)throw new Error('Keep at least one active page.');
      if(p.nodes[page.rootId].locked)throw new Error('Unlock the page before deleting it.');

      const remove=(id:string)=>{p.nodes[id].children.forEach(remove);delete p.nodes[id];};remove(page.rootId);p.pages=p.pages.filter(item=>item.id!==page.id);break;

    }

    case 'buttonIcon': {
const parent=p.nodes[command.id];if(!parent?.button)throw new Error('Choose a button.');let icon=parent.children.map(id=>p.nodes[id]).find(n=>n.kind==='icon');if(icon?.locked)throw new Error('Unlock the icon first.');
if(command.remove){if(icon){parent.children=parent.children.filter(id=>id!==icon!.id);delete p.nodes[icon.id];}break;}
if(command.size!==undefined&&(!Number.isFinite(command.size)||command.size<8||command.size>96))throw new Error('Icon size must be between 8 and 96.');
if(command.icon){const data=localIconSchema.parse(command.icon);if(!icon){icon=makeNode('icon',newId(),data.name,{width:20,height:20,minHeight:0,background:parent.style.color??'#ffffff'});p.nodes[icon.id]=icon;parent.children.push(icon.id);}icon.name=data.name;icon.iconPaths=data.paths;icon.iconPaint=data.paint;icon.iconFills=data.fills??data.paths.map(()=>data.style==='filled');icon.iconViewBox=data.viewBox;}
if(!icon)break;if(command.size!==undefined){icon.style.width=command.size;icon.style.height=command.size;}if(command.position){parent.children=parent.children.filter(id=>id!==icon!.id);if(command.position==='left')parent.children.unshift(icon.id);else parent.children.push(icon.id);}break;
}
    case 'addIcon': {const data=localIconSchema.parse(command.icon),parent=p.nodes[command.parentId];if(!parent||parent.kind!=='container'||parent.locked||(parent.button||parent.control))throw new Error('Choose an unlocked container.');const n=makeNode('icon',newId(),data.name,{width:32,height:32,minHeight:0,background:'#242a35',borderRadius:0});n.iconPaths=data.paths;n.iconPaint=data.paint;n.iconFills=data.fills??data.paths.map(()=>data.style==='filled');n.iconViewBox=data.viewBox;n.annotations=[{id:newId(),text:`Icon pack: ${data.pack}. Imported geometry embedded in project.`}];p.nodes[n.id]=n;parent.children.push(n.id);break;}
    case 'paste': {pasteFragment(p,command.parentId,command.fragment);break;}

    case 'add': {

      const parent = p.nodes[command.parentId];

      if (!parent || parent.kind !== 'container' || parent.locked||(parent.button||parent.control)) throw new Error('Choose an unlocked container.');

      if(command.preset){const built=createPreset(command.preset);Object.assign(p.nodes,built.nodes);parent.children.push(built.root.id);break;}

      const n = makeNode(command.kind);

      if (n.kind === 'text' && command.preset) {

        n.text = command.preset === 'heading' ? 'Add a heading' : 'Add your paragraph text here.';

        n.name = command.preset === 'heading' ? 'Heading' : 'Paragraph';

        n.style = { ...n.style, fontSize: command.preset === 'heading' ? 48 : 18, fontWeight: command.preset === 'heading' ? '700' : '400' };

      }

      if (n.kind === 'shape') {

        const ellipse=command.preset==='ellipse'; n.name=ellipse?'Circle':'Rectangle';

        n.geometry={type:ellipse?'ellipse':'rectangle',width:120,height:120};

        n.style={width:120,minHeight:120,background:'#5b88d5',borderRadius:ellipse?500:0};

      }

      if (n.kind === 'container' && command.layout) {

        n.name = command.layout === 'row' ? 'Row' : 'Column';

        n.style = { ...n.style, direction: command.layout, padding: 16, gap: 16, borderRadius: 6,

          ...(command.layout === 'column' ? { flexGrow: 1 } : {}) };

      }

      if (n.kind === 'image') {

        if (!command.asset) throw new Error('Choose an image first.');

        p.assets[command.asset.id] = command.asset; n.assetId = command.asset.id; n.alt = command.asset.name;

      }

      p.nodes[n.id] = n; parent.children.push(n.id); break;

    }

    case 'update': {
      if(node!.layoutMode==='free'&&command.style&&['height','minHeight','heightMode','width','widthMode','padding'].some(key=>key in command.style!))throw new Error('Free page dimensions stay fixed. Use the page-bottom height handle.');

      if (node!.locked && !(Object.keys(command.patch).length === 1 && command.patch.locked === false && !command.style)) throw new Error('Unlock this layer before editing it.');

      if(command.style?.heightMode==='fill'){const parent=parentOf(p,command.id);if(!parent?.style.height||parent.style.heightMode==='fit'||parent.style.heightMode==='fill')throw new Error('Set a fixed height on the parent before using Fill available height.');}

      Object.assign(node!, command.patch);

      if (command.style) Object.assign(node!.style, command.style);

      if(node!.style.heightMode==='fixed'&&node!.style.height&&node!.style.minHeight&&node!.style.minHeight>node!.style.height)node!.style.minHeight=node!.style.height;

      break;

    }

    case 'mergeShapes': {

      const other=p.nodes[command.otherId];

      if (node?.kind!=='shape'||other?.kind!=='shape'||!node.geometry||!other.geometry||node.id===other.id) throw new Error('Choose two different shape layers.');

      if(node.frame||other.frame){
        if(!node.frame||!other.frame)throw new Error('Shapes must share a free page.');
        freeSelection(p,[node.id,other.id]);
        const parent=parentOf(p,node.id)!,a=node.frame,b=other.frame;
        const scale=(n:DesignNode)=>{const g=n.geometry!,f=n.frame!,sx=f.width/g.width,sy=f.height/g.height;return {...g,width:f.width,height:f.height,polygons:g.polygons?.map(poly=>poly.map(ring=>ring.map(([x,y])=>[x*sx,y*sy] as [number,number])))};};
        const geometry=mergeShapeGeometry(scale(node),scale(other),{x:b.x-a.x,y:b.y-a.y},node.style.borderRadius,other.style.borderRadius);
        node.frame={x:Math.min(a.x,b.x),y:Math.min(a.y,b.y),width:geometry.width,height:geometry.height};
        node.geometry=geometry;node.name='Merged shape';node.style={...node.style,borderRadius:0};
        const insertion=Math.min(parent.children.indexOf(node.id),parent.children.indexOf(other.id));
        parent.children=parent.children.filter(id=>id!==node.id&&id!==other.id);parent.children.splice(insertion,0,node.id);delete p.nodes[other.id];break;
      }
      const parent=parentOf(p,node.id), otherParent=parentOf(p,other.id);

      if(!parent||parent.id!==otherParent?.id) throw new Error('Shapes must share the same parent container.');

      if(other.locked||parent.locked||node.hidden||other.hidden) throw new Error('Unlock and show both shapes before merging.');

      let ancestor:DesignNode|undefined=parent;

      while(ancestor){if(ancestor.style.justify&&ancestor.style.justify!=='flex-start'||ancestor.style.align&&ancestor.style.align!=='stretch'&&ancestor.style.align!=='flex-start')throw new Error('Union currently requires start-aligned flow. Set parent/ancestor alignment and distribution to Start or Stretch first.');ancestor=parentOf(p,ancestor.id);}

      if(node.style.flexGrow||other.style.flexGrow)throw new Error('Remove flexible share from shapes before union.');

      const scale=(n: DesignNode,measured?:{width:number;height:number}): ShapeGeometry => {

        const g=n.geometry!;

        const width=measured?.width??(typeof n.style.width==='number'?n.style.width:g.width), height=measured?.height??(n.style.height??(n.style.minHeight || g.height));

        if(!Number.isFinite(width)||!Number.isFinite(height)||width<=0||height<=0||width>5000||height>5000)throw new Error('Invalid measured shape size.');

        const sx=width/g.width, sy=height/g.height;

        return {...g,width,height,polygons:g.polygons?.map(poly=>poly.map(ring=>ring.map(([x,y])=>[x*sx,y*sy] as [number,number])))};

      };

      const geometry=mergeShapeGeometry(scale(node,command.measurements?.first),scale(other,command.measurements?.second),command.offset,node.style.borderRadius,other.style.borderRadius);

      if(command.availableWidth!==undefined&&geometry.width>command.availableWidth+.01)throw new Error('Merged shape exceeds the available width. Enlarge the container or overlap the shapes further.');

      node.geometry=geometry; node.name='Merged shape';

      node.style={...node.style,width:geometry.width,height:geometry.height,minHeight:geometry.height,borderRadius:0,

        offsetX:command.placement?.x??((node.style.offsetX??0)+Math.min(0,command.offset.x)),offsetY:command.placement?.y??((node.style.offsetY??0)+Math.min(0,command.offset.y))};

      const insertion=Math.min(parent.children.indexOf(node.id),parent.children.indexOf(other.id));

      parent.children=parent.children.filter(id=>id!==other.id&&id!==node.id); parent.children.splice(insertion,0,node.id);delete p.nodes[other.id];

      break;

    }

    case 'delete': {

      if (roots.includes(command.id)) throw new Error('Page roots cannot be deleted.');

      const parent = parentOf(p, command.id)!;

      if (parent.locked) throw new Error('Unlock the parent first.');

      parent.children = parent.children.filter(x => x !== command.id);

      const remove = (id: string) => { for (const child of p.nodes[id].children) remove(child); delete p.nodes[id]; };

      remove(command.id); break;

    }

    case 'duplicate': {

      if (roots.includes(command.id)) throw new Error('Choose a layer inside the page.');

      const copy = (id: string): string => {

        const n = structuredClone(p.nodes[id]); n.id = newId();

        n.children = n.children.map(copy); p.nodes[n.id] = n; return n.id;

      };

      const parent = parentOf(p, command.id)!;

      if (parent.locked) throw new Error('Unlock the parent first.');

      const copied = copy(command.id); p.nodes[copied].name += ' copy';

      parent.children.splice(parent.children.indexOf(command.id) + 1, 0, copied); break;

    }

    case 'move': {

      if (roots.includes(command.id)) throw new Error('Page roots cannot be moved.');

      const target = p.nodes[command.parentId];

      if (!target || target.kind !== 'container' || target.locked||(target.button||target.control)) throw new Error('Choose an unlocked container.');

      const contains = (id: string): boolean => id === command.parentId || p.nodes[id].children.some(contains);

      if (contains(command.id)) throw new Error('Cannot move a layer into its descendant.');

      const previous = parentOf(p, command.id)!;

      if (previous.locked) throw new Error('Unlock the parent first.');

      previous.children = previous.children.filter(x => x !== command.id);

      target.children.splice(Math.max(0, Math.min(command.index, target.children.length)), 0, command.id); break;

    }

  }

  const referencedAssets = new Set(Object.values(p.nodes).filter(n => n.kind === 'image').map(n => n.assetId));
  for(const page of p.pages)if(page.background?.assetId)referencedAssets.add(page.background.assetId);

  for (const assetId of Object.keys(p.assets)) if (!referencedAssets.has(assetId)) delete p.assets[assetId];

  for(const parent of Object.values(p.nodes))if(parent.layoutMode==='free')for(const id of parent.children){const n=p.nodes[id];if(n.frame)continue;const page=p.pages.find(page=>page.rootId===parent.id),w=page?.width??1440,h=parent.style.height??780;const size=initialFrameSize(n),width=Math.min(w,size.width),height=Math.min(h,size.height);const point=(command.type==='add'||command.type==='addIcon')&&command.parentId===parent.id?command.point:undefined;n.frame={x:Math.max(0,Math.min(w-width,point?.x??24)),y:Math.max(0,Math.min(h-height,point?.y??24)),width,height};p.schemaVersion=2;}
  const activeNodes=new Set<string>();const collectActive=(id:string)=>{activeNodes.add(id);p.nodes[id].children.forEach(collectActive);};p.pages.filter(page=>!page.archived).forEach(page=>collectActive(page.rootId));
  for(const n of Object.values(p.nodes)){if(n.control)p.schemaVersion=2;if(n.button){p.schemaVersion=2;const action=n.button.action;if(action.type==='page'&&action.target&&!p.pages.some(page=>page.id===action.target&&!page.archived)||action.type==='section'&&action.target&&!activeNodes.has(action.target))n.button.action={type:'none'};}}
  p.revision++; p.updatedAt = new Date().toISOString();

  return validateProject(p);

}

