import type {CSSProperties} from 'react';
import type {DesignNode} from '../domain/model';
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




