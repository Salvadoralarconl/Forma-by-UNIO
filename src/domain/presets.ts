import {makeNode,newId,defaultButtonBehavior,type DesignNode,type NodeStyle} from './model';
import iconData from './icons.json' with {type:'json'};
import {BUNDLED_ICONS} from './iconCatalog';
import type {Point} from './shapes';
export interface Preset{ id:string;name:string;category:string;tags:string[];kind:DesignNode['kind'] }
const shapeNames:Record<string,string>={rectangle:'Rectangle',roundedRectangle:'Rounded rectangle',ellipse:'Circle',triangle:'Triangle',rightTriangle:'Right triangle',diamond:'Diamond',pentagon:'Pentagon',hexagon:'Hexagon',octagon:'Octagon',star:'Star',star4:'Four-point star',heart:'Heart',chevron:'Chevron',trapezoid:'Trapezoid',parallelogram:'Parallelogram',cross:'Cross',arrowShape:'Block arrow',line:'Solid line',dashedLine:'Dashed line',dottedLine:'Dotted line'};
const buttonNames:Record<string,string>={solidButton:'Solid button',outlineButton:'Outlined button',roundedButton:'Rounded button',pillButton:'Pill button',arrowButton:'Arrow button',iconButton:'Icon button',shadowButton:'Shadow button',compactButton:'Compact button',gradientButton:'Gradient button',circleButton:'Circle icon button',iconOutlineButton:'Icon outline button',linkButton:'Link-style button'};
const textNames:Record<string,string>={heading:'Heading',subheading:'Subheading',paragraph:'Paragraph',caption:'Caption',quote:'Quote',label:'Text label'};
const layoutNames:Record<string,string>={row:'Row',column:'Column',section:'Section',twoColumns:'Two columns',threeColumns:'Three columns'};
const cardNames:Record<string,string>={contentCard:'Content card',imageCard:'Image card',statCard:'Statistic card',profileCard:'Profile card'};
const sectionNames:Record<string,string>={hero:'Hero section',features:'Feature section',pricing:'Pricing section',testimonial:'Testimonial',callToAction:'Call to action',footer:'Footer'};
const list=(names:Record<string,string>,category:string,kind:DesignNode['kind']):Preset[]=>Object.entries(names).map(([id,name])=>({id,name,category,kind,tags:[id.toLowerCase(),name.toLowerCase(),category.toLowerCase()]}));
export const PRESETS:Preset[]=[...list(shapeNames,'Shapes','shape'),...list(buttonNames,'Buttons','container'),...BUNDLED_ICONS.map(icon=>({id:`icon-${icon.id}`,name:icon.name,category:'Icons',kind:'icon' as const,tags:[...icon.tags,icon.pack,icon.style]})),...list(textNames,'Text','text'),...list(layoutNames,'Layout','container'),...list(cardNames,'Cards','container'),...list(sectionNames,'Sections','container')];
export const PRESET_IDS=PRESETS.map(p=>p.id);
function polygon(id:string):Point[]{
 const regular=(n:number,star=false):Point[]=>Array.from({length:star?n*2:n},(_,i)=>{const a=-Math.PI/2+i*Math.PI*2/(star?n*2:n),r=star&&i%2?24:60;return[60+Math.cos(a)*r,60+Math.sin(a)*r];});
 if(id==='triangle')return[[60,0],[120,120],[0,120]];if(id==='rightTriangle')return[[0,0],[120,120],[0,120]];if(id==='diamond')return[[60,0],[120,60],[60,120],[0,60]];
 if(id==='pentagon')return regular(5);if(id==='hexagon')return regular(6);if(id==='octagon')return regular(8);if(id==='star')return regular(5,true);if(id==='star4')return regular(4,true);
 if(id==='heart')return Array.from({length:96},(_,i)=>{const t=i/96*Math.PI*2;return[60+3.5*16*Math.sin(t)**3,60-3.5*(13*Math.cos(t)-5*Math.cos(2*t)-2*Math.cos(3*t)-Math.cos(4*t))];});
 if(id==='chevron')return[[0,0],[60,0],[120,60],[60,120],[0,120],[60,60]];if(id==='trapezoid')return[[30,0],[90,0],[120,120],[0,120]];if(id==='parallelogram')return[[30,0],[120,0],[90,120],[0,120]];
 if(id==='cross')return[[40,0],[80,0],[80,40],[120,40],[120,80],[80,80],[80,120],[40,120],[40,80],[0,80],[0,40],[40,40]];
 if(id==='arrowShape')return[[0,40],[72,40],[72,0],[120,60],[72,120],[72,80],[0,80]];
 if(id==='roundedRectangle'){const ring:Point[]=[];for(const[cx,cy,start]of [[102,18,-Math.PI/2],[102,102,0],[18,102,Math.PI/2],[18,18,Math.PI]])for(let i=0;i<=8;i++){const a=start+i*Math.PI/16;ring.push([cx+18*Math.cos(a),cy+18*Math.sin(a)]);}return ring;}
 return[[0,0],[120,0],[120,120],[0,120]];
}
export function createPreset(id:string):{root:DesignNode;nodes:Record<string,DesignNode>}{
 const preset=PRESETS.find(p=>p.id===id);if(!preset)throw new Error('Unknown local element preset.');const nodes:Record<string,DesignNode>={};
 const add=(kind:DesignNode['kind'],name:string,style:NodeStyle={},text?:string)=>{const n=makeNode(kind,newId(),name);n.style={...n.style,...style};if(text!==undefined)n.text=text;nodes[n.id]=n;return n;};
 const text=(value:string,size=18,color='#242a35',weight:NodeStyle['fontWeight']='400')=>add('text',value.slice(0,35),{fontSize:size,color,fontWeight:weight,lineHeight:1.4},value);
 const container=(name:string,direction:'row'|'column'='column')=>add('container',name,{direction,padding:24,gap:16,minHeight:0,widthMode:'fill',heightMode:'fit',borderRadius:10,background:'#f3f2ee'});
 const attach=(parent:DesignNode,...children:DesignNode[])=>{parent.children.push(...children.map(n=>n.id));return parent;};
 const icon=(key:keyof typeof iconData,color='#242a35',size=24)=>{const n=add('icon',key,{width:size,height:size,minHeight:0,background:color,borderRadius:0});n.iconPaths=iconData[key];return n;};
 const button=(name:string,outline=false)=>{const n=container(name,'row');n.button=defaultButtonBehavior(outline);n.style={...n.style,widthMode:'fit',padding:12,minHeight:40,gap:8,align:'center',justify:'center',background:outline?'transparent':'#3769d3',color:outline?'#3769d3':'#ffffff',borderWidth:outline?1:0,borderColor:'#3769d3',borderRadius:6};return attach(n,text('Continue',14,outline?'#3769d3':'#ffffff','600'));};
 let root:DesignNode;
 if(preset.category==='Icons'){const data=BUNDLED_ICONS.find(i=>i.id===id.slice(5))!;root=add('icon',data.id,{width:24,height:24,minHeight:0,background:'#242a35',borderRadius:0});root.iconPaths=data.paths;root.iconFills=data.fills??data.paths.map(()=>data.style==='filled');root.iconViewBox=data.viewBox;}
 else if(preset.category==='Shapes'){
  if(['line','dashedLine','dottedLine'].includes(id)){root=add('icon',preset.name,{width:160,height:12,minHeight:0,background:'#3769d3',borderWidth:2,lineStyle:id==='dashedLine'?'dashed':id==='dottedLine'?'dotted':'solid'});root.iconPaths=['M0 12H24'];}
  else{root=add('shape',preset.name,{width:120,minHeight:120,background:'#5b88d5',borderRadius:id==='ellipse'?500:0});if(id==='rectangle'||id==='ellipse')root.geometry={type:id==='ellipse'?'ellipse':'rectangle',width:120,height:120};else{const ring=polygon(id);ring.push([...ring[0]]);root.geometry={type:'union',width:120,height:120,polygons:[[ring]]};}}
 }else if(preset.category==='Text'){
  const sizes:Record<string,number>={heading:48,subheading:30,paragraph:18,caption:13,quote:26,label:12};const words:Record<string,string>={heading:'Add a heading',subheading:'A little more context',paragraph:'Add your paragraph text here.',caption:'A thoughtful caption',quote:'“Good ideas deserve a little room.”',label:'NEW COLLECTION'};
  root=text(words[id],sizes[id],id==='caption'?'#6c7480':'#242a35',id==='heading'?'700':id==='subheading'?'600':'400');root.name=preset.name;if(id==='quote')root.style={...root.style,fontFamily:'Georgia',fontStyle:'italic'};if(id==='label')root.style.letterSpacing=2;
 }else if(preset.category==='Buttons'){
  const outline=['outlineButton','iconOutlineButton','linkButton'].includes(id);root=button(preset.name,outline);root.button=defaultButtonBehavior(outline);root.style.color=outline?'#3769d3':'#ffffff';root.annotations=[{id:newId(),text:'Interactive button with editable hover, pressed and focus states. Configure an optional action in Properties.'}];
  if(['pillButton','circleButton'].includes(id))root.style.borderRadius=500;if(id==='roundedButton')root.style.borderRadius=18;
  if(id==='shadowButton')root.style.shadow={x:0,y:5,blur:12,color:'#00000040'};if(id==='gradientButton')root.style.gradient={from:'#3769d3',to:'#9063d1',angle:110};
  if(id==='compactButton'){root.style.padding=7;root.style.minHeight=28;}if(id==='linkButton'){root.style.background='transparent';root.style.borderWidth=0;root.style.padding=0;}
  if(['arrowButton','iconOutlineButton'].includes(id))root.children.push(icon('arrow-right',outline?'#3769d3':'#ffffff',18).id);
  if(['iconButton','circleButton'].includes(id)){root.children=[icon('plus','#ffffff',20).id];root.style={...root.style,width:44,height:44,widthMode:'fixed',heightMode:'fixed',padding:10};}
 }else if(preset.category==='Layout'){
  root=container(preset.name,id==='row'||id==='twoColumns'||id==='threeColumns'?'row':'column');
  if(id==='column')root.style.flexGrow=1;if(id==='section')root.style={...root.style,padding:48,gap:24,background:'#ffffff'};
  if(id==='twoColumns'||id==='threeColumns')for(let i=0;i<(id==='twoColumns'?2:3);i++)attach(root,attach(container(`Column ${i+1}`),text(`Column ${i+1}`,24,'#242a35','600'),text('Add your content here.')));
 }else if(preset.category==='Cards'){
  root=container(preset.name);root.style={...root.style,width:300,widthMode:'fixed',borderWidth:1,borderColor:'#e1e5eb',background:'#ffffff'};
  if(id==='imageCard')attach(root,add('container','Image placeholder',{widthMode:'fill',minHeight:140,background:'#dbe4ef',borderRadius:8},undefined));
  if(id==='statCard')attach(root,text('42%',48,'#3769d3','700'),text('Your key metric',16));else if(id==='profileCard')attach(root,icon('user','#3769d3',42),text('Your name',24,'#242a35','600'),text('Role or short description',16));else attach(root,text('A thoughtful title',24,'#242a35','600'),text('Tell a little more about what makes this special.'));
 }else{
  root=container(preset.name);root.style={...root.style,padding:48,gap:24,background:id==='footer'?'#242a35':'#edf2e8'};
  if(id==='footer')attach(root,text('Your brand',26,'#ffffff','700'),text('About · Work · Contact',16,'#dce2ec'));
  else if(id==='testimonial')attach(root,text('“A wonderful experience, from the first idea to the final detail.”',30),text('Your customer · Your company',14));
  else if(id==='features'||id==='pricing'){
   attach(root,text(id==='features'?'Thoughtfully designed features':'A plan for every idea',36,'#242a35','700'));const row=container('Cards','row');row.style.padding=0;attach(root,row);
   for(let i=0;i<3;i++){const card=container(id==='pricing'?`Plan ${i+1}`:`Feature ${i+1}`);card.style.background='#ffffff';attach(row,attach(card,text(id==='pricing'?`$${19+i*20}`:`Feature ${i+1}`,28,'#242a35','700'),text('Describe what is included.',16)));}
  }else attach(root,text(id==='hero'?'Ideas deserve a little room.':'Make your next idea happen.',48,'#242a35','700'),text('A short, clear introduction to what you do and why it matters.',20),button('Call to action'));
 }
 // Factories may replace a child (icon-only button); prune their unreachable drafts.
 const reachable=new Set<string>();const visit=(n:DesignNode)=>{reachable.add(n.id);n.children.forEach(id=>visit(nodes[id]));};visit(root);for(const key of Object.keys(nodes))if(!reachable.has(key))delete nodes[key];
 return{root,nodes};
}

