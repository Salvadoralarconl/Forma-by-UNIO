import type {NodeStyle} from './model';
// Appearance only: never transfer geometry, placement, layout or semantic actions.
const keys=['background','color','gradient','borderRadius','borderTopLeftRadius','borderTopRightRadius','borderBottomRightRadius','borderBottomLeftRadius','borderWidth','borderColor','borderStyle','opacity','shadow','fontSize','fontWeight','fontFamily','fontStyle','lineHeight','letterSpacing','textAlign','lineStyle'] as const;
export function copyAppearance(style:NodeStyle):Partial<NodeStyle>{
 return structuredClone(Object.fromEntries(keys.map(key=>[key,style[key]])));
}
