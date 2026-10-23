export interface HSV{h:number;s:number;v:number;a:number}
const byte=(n:number)=>Math.max(0,Math.min(255,Math.round(n))).toString(16).padStart(2,'0');
export function parseColor(input:string):string|null{
 const text=input.trim().toLowerCase();if(text==='transparent')return'#00000000';
 if(/^#[\da-f]{3,4}$/.test(text))return'#'+text.slice(1).split('').map(c=>c+c).join('');if(/^#([\da-f]{6}|[\da-f]{8})$/.test(text))return text;
 const m=text.match(/^rgba?\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})(?:\s*,\s*(0(?:\.\d+)?|1(?:\.0+)?))?\s*\)$/);
 if(m&&m.slice(1,4).every(x=>Number(x)<=255)){const alpha=m[4]===undefined?1:Number(m[4]);return'#'+m.slice(1,4).map(x=>byte(Number(x))).join('')+(alpha===1?'':byte(alpha*255));}return null;
}
export function colorToHsv(input:string):HSV{const c=parseColor(input)??'#000000',r=parseInt(c.slice(1,3),16)/255,g=parseInt(c.slice(3,5),16)/255,b=parseInt(c.slice(5,7),16)/255,max=Math.max(r,g,b),min=Math.min(r,g,b),d=max-min;let h=0;if(d)h=max===r?60*((g-b)/d%6):max===g?60*((b-r)/d+2):60*((r-g)/d+4);return{h:(h+360)%360,s:max?d/max:0,v:max,a:c.length===9?parseInt(c.slice(7,9),16)/255:1};}
export function hsvToHex({h,s,v,a}:HSV):string{const c=v*s,x=c*(1-Math.abs((h/60)%2-1)),m=v-c;const rgb=h<60?[c,x,0]:h<120?[x,c,0]:h<180?[0,c,x]:h<240?[0,x,c]:h<300?[x,0,c]:[c,0,x];return'#'+rgb.map(n=>byte((n+m)*255)).join('')+(a>=.999?'':byte(a*255));}
export function rememberColor(values:string[],input:string):string[]{const color=parseColor(input);return color?[color,...values.map(parseColor).filter((c):c is string=>!!c&&c!==color)].filter((c,i,a)=>a.indexOf(c)===i).slice(0,16):values.slice(0,16);}
