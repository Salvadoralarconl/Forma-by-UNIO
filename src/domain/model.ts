import { z } from 'zod';
import {iconPaintSchema} from './iconPacks';



const id = z.string().min(1).max(100).regex(/^[\w-]+$/);

const color = z.string().regex(/^(#[\da-fA-F]{3,8}|transparent)$/);

export const styleSchema = z.object({

  opacity:z.number().min(0).max(1).optional(),borderStyle:z.enum(['solid','dashed','short-dashed','dotted']).optional(),
  background: color.optional(), color: color.optional(),

  padding: z.number().min(0).max(500).optional(),

  gap: z.number().min(0).max(500).optional(),

  borderRadius: z.number().min(0).max(500).optional(),
  borderTopLeftRadius:z.number().min(0).max(500).optional(),
  borderTopRightRadius:z.number().min(0).max(500).optional(),
  borderBottomRightRadius:z.number().min(0).max(500).optional(),
  borderBottomLeftRadius:z.number().min(0).max(500).optional(),

  fontSize: z.number().min(8).max(300).optional(),

  fontWeight: z.enum(['400', '500', '600', '700', '800']).optional(),

  fontFamily:z.enum(['system','Arial','Segoe UI','Georgia','Times New Roman','Verdana','Trebuchet MS','Courier New','Consolas']).optional(),

  fontStyle:z.enum(['normal','italic']).optional(),lineHeight:z.number().min(.5).max(4).optional(),letterSpacing:z.number().min(-10).max(40).optional(),

  width: z.union([z.literal('auto'), z.literal('100%'), z.number().min(1).max(5000)]).optional(),

  minHeight: z.number().min(0).max(5000).optional(),

  height: z.number().positive().max(5000).optional(),

  widthMode:z.enum(['fixed','fit','fill']).optional(),heightMode:z.enum(['fixed','fit','fill']).optional(),

  margin:z.number().min(0).max(500).optional(),

  direction: z.enum(['row', 'column']).optional(),

  flexGrow: z.number().min(0).max(10).optional(),

  align: z.enum(['stretch', 'flex-start', 'center', 'flex-end']).optional(),

  justify: z.enum(['flex-start', 'center', 'space-between', 'flex-end']).optional(),

  textAlign: z.enum(['left', 'center', 'right']).optional(),

  objectFit: z.enum(['cover', 'contain']).optional(),

  borderWidth: z.number().min(0).max(20).optional(),

  borderColor: color.optional(),

  lineStyle:z.enum(['solid','dashed','dotted']).optional(),gradient:z.object({from:color,to:color,angle:z.number().min(0).max(360)}).strict().optional(),

  offsetX: z.number().min(-5000).max(5000).optional(),

  offsetY: z.number().min(-5000).max(5000).optional(),

  shadow: z.object({ x: z.number().min(-200).max(200), y: z.number().min(-200).max(200), blur: z.number().min(0).max(200),spread:z.number().min(-100).max(100).optional(), color }).strict().optional(),

}).strict();

export type NodeStyle = z.infer<typeof styleSchema>;

export const assetSchema = z.object({

  id, name: z.string().min(1).max(200),

  mime: z.enum(['image/png', 'image/jpeg', 'image/webp', 'image/gif']),

  data: z.string().max(14_000_000).regex(/^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/),

}).strict();

export type Asset = z.infer<typeof assetSchema>;

export const buttonStateSchema=z.object({background:color.optional(),color:color.optional(),scale:z.number().min(.5).max(1.5).optional(),offsetX:z.number().min(-50).max(50).optional(),offsetY:z.number().min(-50).max(50).optional(),shadow:styleSchema.shape.shadow}).strict();
export const buttonSchema=z.object({textOnly:z.boolean().optional(),states:z.object({hover:buttonStateSchema,pressed:buttonStateSchema,focus:buttonStateSchema}).strict(),duration:z.number().min(0).max(2000),easing:z.enum(['ease','ease-in','ease-out','ease-in-out','linear']),action:z.object({type:z.enum(['none','link','page','section']),target:z.string().max(2048).optional()}).strict()}).strict().superRefine((button,ctx)=>{if(button.action.type==='link'&&button.action.target){try{const url=new URL(button.action.target);if(!['https:','http:'].includes(url.protocol)||url.username||url.password)throw new Error();}catch{ctx.addIssue({code:'custom',message:'Use an http or https link without credentials.'});}}});
export type ButtonBehavior=z.infer<typeof buttonSchema>;
export const defaultButtonBehavior=(outline=false):ButtonBehavior=>({states:{hover:{background:outline?'#e9efff':'#2455be',scale:1.02,offsetY:-1,shadow:{x:0,y:6,blur:16,spread:0,color:'#183d752b'}},pressed:{background:outline?'#dbe6ff':'#183d94',scale:.98,offsetY:0,shadow:{x:0,y:2,blur:4,color:'#183d751a'}},focus:{shadow:{x:0,y:0,blur:0,spread:3,color:'#3769d366'}}},duration:180,easing:'ease-out',action:{type:'none'}});
export const controlSchema=z.discriminatedUnion('type',[
 z.object({type:z.literal('search'),label:z.string().min(1).max(200),placeholder:z.string().max(200)}).strict(),
 z.object({type:z.literal('dropdown'),label:z.string().min(1).max(200),options:z.array(z.string().min(1).max(200)).min(1).max(50),defaultValue:z.string().max(200).optional()}).strict()
]);
export type Control=z.infer<typeof controlSchema>;
const nodeSchema = z.object({

  button:buttonSchema.optional(),control:controlSchema.optional(),
  id, kind: z.enum(['container', 'text', 'image', 'shape','icon']), name: z.string().min(1).max(200),

  children: z.array(id).max(2000), text: z.string().max(100_000).optional(),

  assetId: id.optional(), alt: z.string().max(1000).optional(),

  hidden: z.boolean(), locked: z.boolean(), style: styleSchema,

  geometry: z.object({ type: z.enum(['rectangle','ellipse','union']), width: z.number().positive().max(5000), height: z.number().positive().max(5000),

    polygons: z.array(z.array(z.array(z.tuple([z.number().min(0).max(5000),z.number().min(0).max(5000)])).min(4).max(10000)).min(1).max(100)).max(100).optional() }).strict().optional(),

  iconPaint:z.array(iconPaintSchema).max(40).optional(),
  layoutMode:z.enum(['flow','free']).optional(),
  aspectLocked:z.boolean().optional(),
  frame:z.object({x:z.number().min(0).max(5000),y:z.number().min(0).max(5000),width:z.number().positive().max(5000),height:z.number().positive().max(5000)}).strict().optional(),
  iconFills:z.array(z.boolean()).max(40).optional(),
  iconViewBox:z.tuple([z.number().min(-10000).max(10000),z.number().min(-10000).max(10000),z.number().positive().max(10000),z.number().positive().max(10000)]).optional(),
  iconPaths:z.array(z.string().min(1).max(10000).regex(/^[MmLlHhVvCcSsQqTtAaZz\d.,eE+\s-]+$/)).min(1).max(40).optional(),

  // Stable slots for later domain adapters; not executable behavior in v1.

  overrides: z.record(styleSchema), tokenRefs: z.record(id),

  annotations: z.array(z.object({ id, text: z.string().max(10_000) })).max(100),

}).strict();

export type DesignNode = z.infer<typeof nodeSchema>;
export const pageBackgroundSchema=z.object({color:color.optional(),assetId:id.optional(),opacity:z.number().min(0).max(1).optional(),fit:z.enum(['cover','contain','stretch']).optional(),position:z.enum(['center','top','bottom','left','right','top left','top right','bottom left','bottom right']).optional(),blur:z.number().min(0).max(60).optional(),backdropBlur:z.number().min(0).max(60).optional(),tint:color.optional(),tintOpacity:z.number().min(0).max(1).optional()}).strict();
export type PageBackground=z.infer<typeof pageBackgroundSchema>;

const projectSchema = z.object({

  schemaVersion: z.union([z.literal(1),z.literal(2)]), id, name: z.string().trim().min(1).max(120),

  revision: z.number().int().min(0), createdAt: z.string().datetime(), updatedAt: z.string().datetime(),

  pages: z.array(z.object({ id, name: z.string().min(1).max(120), rootId: id,width:z.number().min(240).max(5000).optional(),height:z.number().min(100).max(5000).optional(),archived:z.boolean().optional(),background:pageBackgroundSchema.optional() })).min(1).max(100),

  nodes: z.record(nodeSchema), assets: z.record(assetSchema),

  breakpoints: z.array(z.object({ id, name: z.string(), width: z.number().positive().max(5000) })).max(20),

  // Empty in foundation; future schema migrations introduce typed definitions.

  tokens: z.array(z.never()), components: z.array(z.never()), interactions: z.array(z.never()),

  animations: z.array(z.never()), bindings: z.array(z.never()),

}).strict();

export type Project = z.infer<typeof projectSchema>;

export const newId = () => crypto.randomUUID();



export function createProject(name = 'Untitled project'): Project {

  const rootId = newId();

  const now = new Date().toISOString();

  return {

    schemaVersion: 1, id: newId(), name, revision: 0, createdAt: now, updatedAt: now,

    pages: [{ id: newId(), name: 'Home', rootId }],

    nodes: { [rootId]: makeNode('container', rootId, 'Page', { padding: 64, gap: 24, minHeight: 780, background: '#ffffff' }) },

    assets: {}, breakpoints: [{ id: 'desktop', name: 'Desktop', width: 1440 }, { id: 'tablet', name: 'Tablet', width: 768 }, { id: 'phone', name: 'Phone', width: 390 }],

    tokens: [], components: [], interactions: [], animations: [], bindings: [],

  };

}



export function makeNode(kind: DesignNode['kind'], nodeId: string = newId(), name?: string, style?: NodeStyle): DesignNode {

  return { id: nodeId, kind, name: name ?? ({ container: 'Container', text: 'Text', image: 'Image', shape: 'Shape',icon:'Icon' }[kind]),

    children: [], text: kind === 'text' ? 'Your text here' : undefined,

    hidden: false, locked: false,

    style: style ?? (kind === 'container' ? { padding: 24, gap: 16, direction: 'column', minHeight: 120, background: '#f3f2ee', borderRadius: 12 } : kind === 'text' ? { fontSize: 24, color: '#242a35', fontWeight: '400' } : { width: '100%', minHeight: 200, objectFit: 'cover', borderRadius: 12 }),

    overrides: {}, tokenRefs: {}, annotations: [],

  };

}



export function validateProject(input: unknown): Project {

  const p = projectSchema.parse(input);

  if (Object.keys(p.nodes).length > 5000 || Object.keys(p.assets).length > 500) throw new Error('Project exceeds the foundation size limit.');

  if(!p.pages.some(page=>!page.archived))throw new Error('Keep at least one active page.');

  const activeNodes=new Set<string>();const collect=(id:string)=>{if(activeNodes.has(id)||!p.nodes[id])return;activeNodes.add(id);p.nodes[id].children.forEach(collect);};p.pages.filter(page=>!page.archived).forEach(page=>collect(page.rootId));
  const seen = new Set<string>();

  const visit = (nodeId: string, depth: number,insideButton=false) => {

    if (depth > 64) throw new Error('Layers may be nested at most 64 levels.');

    if (seen.has(nodeId)) throw new Error('Layer cycle or multiple parents detected.');

    const n = p.nodes[nodeId];

    if (!n || n.id !== nodeId) throw new Error('Missing layer or mismatched layer ID.');

    seen.add(nodeId);

    if (n.kind !== 'container' && n.children.length) throw new Error('Only containers can contain layers.');
    if(n.layoutMode==='free'&&(!n.style.height||n.style.height<100||n.style.minHeight!==n.style.height||n.style.heightMode==='fit'||n.style.heightMode==='fill'))throw new Error('Free page dimensions must stay fixed.');
    if(n.layoutMode==='free'&&p.schemaVersion!==2)throw new Error('Free placement requires project version2.');
    if(n.layoutMode==='free'&&n.children.some(id=>!p.nodes[id]?.frame))throw new Error('Free elements need explicit frames.');

    if (n.kind === 'image' && (!n.assetId || !p.assets[n.assetId])) throw new Error('Image has a missing asset.');

    if (n.kind === 'shape' && (!n.geometry || n.geometry.type === 'union' && !n.geometry.polygons?.length)) throw new Error('Shape geometry is missing.');

    if(n.control&&(n.kind!=='container'||n.children.length||n.button||insideButton))throw new Error('Controls must be standalone container layers.');
    if(n.control?.type==='dropdown'&&n.control.defaultValue&&!n.control.options.includes(n.control.defaultValue))throw new Error('Choose a default dropdown value from its options.');
    if(n.button&&insideButton)throw new Error('Interactive buttons cannot be nested.');
    if(n.button&&n.kind!=='container')throw new Error('Buttons must be container compositions.');
    if(n.button?.action.type==='page'&&n.button.action.target&&!p.pages.some(page=>page.id===n.button!.action.target&&!page.archived))throw new Error('Button page target is missing.');
    if(n.button?.action.type==='section'&&n.button.action.target&&!activeNodes.has(n.button.action.target))throw new Error('Button section target is missing.');
    if(n.kind==='icon'&&!n.iconPaths?.length)throw new Error('Icon paths are missing.');

    if ((n.geometry?.polygons?.flat(2).length ?? 0) > 10000) throw new Error('Shape has too many points.');

    for (const child of n.children) visit(child, depth + 1,insideButton||!!n.button);

  };

  if (new Set(p.pages.map(page => page.id)).size !== p.pages.length) throw new Error('Duplicate page IDs.');

  for (const page of p.pages) {
    if(page.background?.assetId&&!p.assets[page.background.assetId])throw new Error('Page background has a missing image.');

    if (p.nodes[page.rootId]?.kind !== 'container') throw new Error('Page root must be a container.');

    visit(page.rootId, 0);

  }

  if (seen.size !== Object.keys(p.nodes).length) throw new Error('Orphan layers detected.');

  for (const [key, asset] of Object.entries(p.assets)) if (asset.id !== key) throw new Error('Mismatched asset ID.');

  return p;

}



export function parentOf(p: Project, nodeId: string): DesignNode | undefined {

  return Object.values(p.nodes).find(n => n.children.includes(nodeId));

}


export function insertionParent(p:Project,id:string):DesignNode|undefined{let n=p.nodes[id];if(n?.kind==='container'&&!n.button&&!n.control)return n;let parent=n?parentOf(p,n.id):undefined;while(parent?.button||parent?.control)parent=parentOf(p,parent.id);return parent;}
