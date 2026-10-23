import type {GapGuide} from '../domain/placement';
/** Canvas-space annotations; the overlay parent supplies pointer-events:none. */
export function EqualGapGuides({gaps=[]}:{gaps?:GapGuide[]}){
 return <svg className="equal-gap-guides" aria-hidden="true" data-testid="equal-gap-guides" style={{position:'absolute',left:0,top:0,width:'100%',height:'100%',overflow:'visible',pointerEvents:'none'}}>
  {gaps.map((g,i)=>{const horizontal=g.axis==='x',middle=(g.start+g.end)/2,label=Number(g.value.toFixed(1)).toString(),x=horizontal?middle:g.cross,y=horizontal?g.cross:middle;return <g key={`${g.axis}-${i}`} data-gap-axis={g.axis} data-gap-value={g.value} stroke="#76a4ed" fill="none" strokeWidth={1}>
   <path d={horizontal?`M${g.start} ${g.cross-5}v10m0 -5H${g.end}m0 -5v10`:`M${g.cross-5} ${g.start}h10m-5 0V${g.end}m-5 0h10`}/>
   <rect x={x-19} y={y-9} width={38} height={18} rx={4} fill="#242a32" stroke="none"/>
   <text x={x} y={y+4} textAnchor="middle" fill="#f4f7fb" stroke="none" fontSize={11} fontFamily="Arial, sans-serif">{label}</text>
  </g>;})}
 </svg>;
}
