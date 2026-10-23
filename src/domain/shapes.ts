import polygonClipping from 'polygon-clipping';
export type Point = [number, number];
export type MultiPolygon = Point[][][];
export interface ShapeGeometry { type: 'rectangle' | 'ellipse' | 'union'; width: number; height: number; polygons?: MultiPolygon }
export function polygonsFor(shape: ShapeGeometry): MultiPolygon {
  if (shape.type === 'union') return shape.polygons ?? [];
  const w = shape.width, h = shape.height;
  if (shape.type === 'rectangle') return [[[[0,0],[w,0],[w,h],[0,h],[0,0]]]];
  const ring: Point[] = Array.from({ length: 96 }, (_, i) => {
    const angle = i / 96 * Math.PI * 2; return [w/2 + Math.cos(angle)*w/2, h/2 + Math.sin(angle)*h/2];
  });
  ring.push([...ring[0]]); return [[ring]];
}
function roundedPolygons(shape:ShapeGeometry,radius:number):MultiPolygon{
  const r=Math.min(Math.max(0,radius),shape.width/2,shape.height/2);
  if(shape.type!=='rectangle'||!r)return polygonsFor(shape);
  const ring:Point[]=[];
  for(const [cx,cy,start] of [[shape.width-r,r,-90],[shape.width-r,shape.height-r,0],[r,shape.height-r,90],[r,r,180]]){
    for(let i=0;i<=32;i++){const angle=(start+i*90/32)*Math.PI/180;ring.push([cx+r*Math.cos(angle),cy+r*Math.sin(angle)]);}
  }
  ring.push([...ring[0]]);return [[ring]];
}
export function mergeShapeGeometry(a: ShapeGeometry, b: ShapeGeometry, offset: { x: number; y: number },radiusA=0,radiusB=0): ShapeGeometry {
  if (![a.width,a.height,b.width,b.height,offset.x,offset.y].every(Number.isFinite) || Math.abs(offset.x)>5000 || Math.abs(offset.y)>5000) throw new Error('Invalid shape dimensions or merge offset.');
  const translated = roundedPolygons(b,radiusB).map(polygon => polygon.map(ring => ring.map(([x,y]): Point => [x+offset.x,y+offset.y])));
  const result = polygonClipping.union(roundedPolygons(a,radiusA), translated) as MultiPolygon;
  const points = result.flat(2);
  if (!points.length || points.length > 10000) throw new Error('Shape union is empty or too complex.');
  const minX = Math.min(...points.map(p=>p[0])), minY=Math.min(...points.map(p=>p[1]));
  const width=Math.max(...points.map(p=>p[0]))-minX, height=Math.max(...points.map(p=>p[1]))-minY;
  if (width>5000 || height>5000 || width<=0 || height<=0) throw new Error('Merged shape must fit within 5000 × 5000 pixels.');
  return { type:'union', width, height, polygons: result.map(polygon=>polygon.map(ring=>ring.map(([x,y]): Point=>[x-minX,y-minY]))) };
}
export function shapePath(shape: ShapeGeometry): string {
  return polygonsFor(shape).map(polygon=>polygon.map(ring=>ring.map(([x,y],i)=>`${i?'L':'M'}${x.toFixed(4)},${y.toFixed(4)}`).join(' ')+'Z').join(' ')).join(' ');
}
