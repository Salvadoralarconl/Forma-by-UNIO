import {z} from 'zod';
export const iconPaintSchema=z.object({rule:z.enum(['nonzero','evenodd']),width:z.number().min(0).max(20),cap:z.enum(['butt','round','square']),join:z.enum(['miter','round','bevel'])}).strict();
export const localIconSchema=z.object({id:z.string().min(1).max(100).regex(/^[\w-]+$/),name:z.string().min(1).max(100),pack:z.string().min(1).max(60),style:z.enum(['outline','filled','rounded','minimal','mixed']),paths:z.array(z.string().min(1).max(10000).regex(/^[MmLlHhVvCcSsQqTtAaZz\d.,eE+\s-]+$/)).min(1).max(40),fills:z.array(z.boolean()).max(40).optional(),paint:z.array(iconPaintSchema).max(40).optional(),viewBox:z.tuple([z.number().min(-10000).max(10000),z.number().min(-10000).max(10000),z.number().positive().max(10000),z.number().positive().max(10000)]).optional(),tags:z.array(z.string().max(100)).max(20)}).strict();
export type LocalIcon=z.infer<typeof localIconSchema>;
const NS='http://www.w3.org/2000/svg';
export function parseSvgIcon(source:string,name:string,pack:string):LocalIcon{
 if(new TextEncoder().encode(source).length>32768||/<!DOCTYPE|<!ENTITY|<\?/i.test(source))throw new Error('SVG must be plain XML under 32 KB, without entities or processing instructions.');
 const doc=new DOMParser().parseFromString(source,'image/svg+xml'),root=doc.documentElement;
 if(doc.querySelector('parsererror')||root.localName!=='svg'||root.namespaceURI!==NS)throw new Error('Choose a valid SVG document.');
 const vb=(root.getAttribute('viewBox')??'0 0 24 24').trim().split(/[\s,]+/).map(Number);if(vb.length!==4||!vb.every(Number.isFinite)||vb[2]<=0||vb[3]<=0||vb.some(n=>Math.abs(n)>10000))throw new Error('Invalid bounded SVG viewBox.');
 const paths:string[]=[],fills:boolean[]=[],paint:z.infer<typeof iconPaintSchema>[]=[];let count=0;
 const allowed=new Set(['svg','g','path','rect','circle','ellipse','line','polyline','polygon','title','desc']);
 const attrs=new Set(['xmlns','viewBox','width','height','d','x','y','x1','y1','x2','y2','cx','cy','r','rx','ry','points','fill','stroke','stroke-width','stroke-linecap','stroke-linejoin','fill-rule']);
 const num=(el:Element,key:string,fallback=0)=>{const raw=el.getAttribute(key),n=raw===null?fallback:Number(raw);if(!Number.isFinite(n)||Math.abs(n)>10000)throw new Error('Invalid vector coordinate.');return n;};
 const visit=(el:Element,inheritedFill='black',inheritedStroke='none',inheritedPaint:z.infer<typeof iconPaintSchema>={rule:'nonzero',width:1,cap:'butt',join:'miter'})=>{
 if(++count>150||!allowed.has(el.localName)||el.namespaceURI!==NS||el!==root&&el.localName==='svg')throw new Error('Unsupported SVG element. Use simple monochrome paths/shapes.');
 for(const a of Array.from(el.attributes)){if(!attrs.has(a.name)||a.namespaceURI&&a.name!=='xmlns')throw new Error(`Unsupported SVG attribute: ${a.name}`);if(/url\(|https?:|data:|javascript:|[<>]/i.test(a.value)&&a.name!=='xmlns')throw new Error('External resources and executable content are not supported.');}
 const fill=el.getAttribute('fill')??inheritedFill,stroke=el.getAttribute('stroke')??inheritedStroke;
 if(!/^(none|currentColor|black|white|#[\da-fA-F]{3,8})$/.test(fill)||!/^(none|currentColor|black|white|#[\da-fA-F]{3,8})$/.test(stroke))throw new Error('Only simple monochrome fills and strokes are supported.');
 const currentPaint=iconPaintSchema.parse({rule:el.getAttribute('fill-rule')??inheritedPaint.rule,width:el.hasAttribute('stroke-width')?Number(el.getAttribute('stroke-width')):inheritedPaint.width,cap:el.getAttribute('stroke-linecap')??inheritedPaint.cap,join:el.getAttribute('stroke-linejoin')??inheritedPaint.join});
 let d='';const tag=el.localName;
 if(tag==='path')d=(el.getAttribute('d')??'').trim();
 if(tag==='line')d=`M${num(el,'x1')} ${num(el,'y1')} L${num(el,'x2')} ${num(el,'y2')}`;
 if(tag==='circle'||tag==='ellipse'){const x=num(el,'cx'),y=num(el,'cy'),rx=num(el,tag==='circle'?'r':'rx'),ry=num(el,tag==='circle'?'r':'ry');if(rx<=0||ry<=0)throw new Error('Positive radii required.');d=`M${x-rx} ${y}a${rx} ${ry} 0 1 0 ${2*rx} 0a${rx} ${ry} 0 1 0 ${-2*rx} 0`;}
 if(tag==='rect'){const x=num(el,'x'),y=num(el,'y'),w=num(el,'width'),h=num(el,'height'),rx=Math.min(num(el,'rx',num(el,'ry')),w/2),ry=Math.min(num(el,'ry',rx),h/2);if(w<=0||h<=0||rx<0||ry<0)throw new Error('Invalid rectangle.');d=`M${x+rx} ${y}H${x+w-rx}A${rx} ${ry} 0 0 1 ${x+w} ${y+ry}V${y+h-ry}A${rx} ${ry} 0 0 1 ${x+w-rx} ${y+h}H${x+rx}A${rx} ${ry} 0 0 1 ${x} ${y+h-ry}V${y+ry}A${rx} ${ry} 0 0 1 ${x+rx} ${y}Z`;}
 if(tag==='polyline'||tag==='polygon'){const nums=(el.getAttribute('points')??'').trim().split(/[\s,]+/).map(Number);if(nums.length<4||nums.length%2||nums.length>2000||!nums.every(n=>Number.isFinite(n)&&Math.abs(n)<=10000))throw new Error('Invalid polygon.');d='M'+Array.from({length:nums.length/2},(_,i)=>`${nums[i*2]} ${nums[i*2+1]}`).join('L')+(tag==='polygon'?'Z':'');}
 if(d){if((d.match(/[+-]?(?:\d*\.)?\d+(?:e[+-]?\d+)?/gi)??[]).some(v=>!Number.isFinite(Number(v))||Math.abs(Number(v))>10000))throw new Error('Path coordinates exceed limits.');if(!/^[Mm]/.test(d)||!localIconSchema.shape.paths.element.safeParse(d).success)throw new Error('Unsupported path data.');if(fill!=='none'&&stroke!=='none')throw new Error('Use fill-only or stroke-only shapes, not both on a shape.');if(fill!=='none'||stroke!=='none'){paths.push(d);fills.push(fill!=='none');paint.push(currentPaint);}}
 for(const child of Array.from(el.children))visit(child,fill,stroke,currentPaint);
 };visit(root);
 if(paths.length===0||paths.length>40)throw new Error('Icons need 1–40 visible vector paths.');
 return localIconSchema.parse({id:crypto.randomUUID(),name:name.replace(/\.svg$/i,'').slice(0,100),pack:pack.trim(),style:fills.every(Boolean)?'filled':fills.every(f=>!f)?'outline':'mixed',paths,fills,paint,viewBox:vb,tags:name.toLowerCase().replace(/\.svg$/i,'').split(/[\s_-]+/).slice(0,20)});
}
export const PACK_STORAGE='forma.iconPacks.v1';
export function readImportedIcons():LocalIcon[]{try{const raw=localStorage.getItem(PACK_STORAGE)??'[]';if(raw.length>2000000)return[];return z.array(localIconSchema).max(400).parse(JSON.parse(raw));}catch{return[];}}
export function saveImportedIcons(icons:LocalIcon[]){const valid=z.array(localIconSchema).max(400).parse(icons),raw=JSON.stringify(valid);if(raw.length>2000000)throw new Error('Local icon library exceeds 2 MB.');localStorage.setItem(PACK_STORAGE,raw);}
