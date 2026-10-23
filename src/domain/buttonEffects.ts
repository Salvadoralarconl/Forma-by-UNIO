import type {ButtonBehavior} from './model';
type Visual=ButtonBehavior['states']['hover'];
export function buttonEffect(effect:NonNullable<Visual['effect']>,color='#3769d3'):Visual{
 const base:Visual={effect,scale:1,offsetX:0,offsetY:0,outlineWidth:0,shadow:{x:0,y:0,blur:0,color:'#00000000'}};
 switch(effect){case 'color':return {...base,background:'#2455be',color:'#ffffff'};case 'outline':return {...base,outlineWidth:2,outlineColor:color};case 'shadow':return {...base,shadow:{x:0,y:4,blur:12,color:'#00000040'}};case 'grow':return {...base,scale:1.05};case 'shrink':return {...base,scale:.95};case 'lift':return {...base,offsetY:-3};default:return base;}
}
