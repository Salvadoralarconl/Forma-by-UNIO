import type {PageBackground as Background} from '../domain/model';
/** Shared by the editor and exported website; effects never touch page content. */
export function PageBackground({background,imageUrl,fallbackColor}:{background:Background;imageUrl?:string;fallbackColor?:string}){
 const blur=background.blur??0;
 return <div data-page-background="true" aria-hidden="true" style={{position:'absolute',inset:0,pointerEvents:'none',overflow:'hidden',opacity:background.opacity??1,background:background.color??fallbackColor??'transparent',backdropFilter:background.backdropBlur?`blur(${background.backdropBlur}px)`:undefined,WebkitBackdropFilter:background.backdropBlur?`blur(${background.backdropBlur}px)`:undefined}}>
  {imageUrl&&<img data-background-image="true" src={imageUrl} alt="" draggable={false} style={{position:'absolute',inset:blur?-blur*2:0,width:blur?`calc(100% + ${blur*4}px)`:'100%',height:blur?`calc(100% + ${blur*4}px)`:'100%',objectFit:background.fit==='stretch'?'fill':background.fit??'cover',objectPosition:background.position??'center',filter:blur?`blur(${blur}px)`:undefined}}/>}
  {background.tint&&<div style={{position:'absolute',inset:0,background:background.tint,opacity:background.tintOpacity??0}}/>}
 </div>;
}
