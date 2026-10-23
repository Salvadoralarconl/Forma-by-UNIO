import {type Project,type DesignNode,type Asset,newId,makeNode,createProject,validateProject,buttonSchema} from './model';
export interface Fragment{version:1;rootId:string;nodes:Record<string,DesignNode>;assets:Record<string,Asset>}
export function validateFragment(value:unknown):Fragment{
  const f=value as Fragment;if(!f||f.version!==1||typeof f.rootId!=='string'||!f.nodes||!f.assets)throw new Error('Invalid element clipboard.');
  const p=createProject('Clipboard'),wrapper=makeNode('container');wrapper.children=[f.rootId];p.pages[0].rootId=wrapper.id;p.nodes=structuredClone({...f.nodes,[wrapper.id]:wrapper});for(const n of Object.values(p.nodes)){if(n.button){n.button=buttonSchema.parse(n.button);if(['page','section'].includes(n.button.action.type))n.button.action={type:'none'};}}p.assets=f.assets;
  const valid=validateProject(p);delete valid.nodes[wrapper.id];for(const n of Object.values(valid.nodes))if(f.nodes[n.id]?.button)n.button=buttonSchema.parse(f.nodes[n.id].button);return{version:1,rootId:f.rootId,nodes:valid.nodes,assets:valid.assets};
}
export function copyFragment(p:Project,rootId:string):Fragment{
  if(p.pages.some(page=>page.rootId===rootId))throw new Error('Select an element inside the page to copy.');if(!p.nodes[rootId])throw new Error('Select an element to copy.');const nodes:Record<string,DesignNode>={},assets:Record<string,Asset>={};
  const visit=(id:string)=>{const n=p.nodes[id];nodes[id]=structuredClone(n);if(n.assetId)assets[n.assetId]=structuredClone(p.assets[n.assetId]);n.children.forEach(visit);};visit(rootId);return validateFragment({version:1,rootId,nodes,assets});
}
export function pasteFragment(p:Project,parentId:string,input:unknown):string{
  const f=validateFragment(input),parent=p.nodes[parentId];if(!parent||parent.kind!=='container'||parent.locked||(parent.button||parent.control))throw new Error('Choose an unlocked container for paste.');
  const ids=new Map(Object.keys(f.nodes).map(id=>[id,newId()])),assetIds=new Map<string,string>();
  for(const asset of Object.values(f.assets)){const existing=p.assets[asset.id];const id=!existing||JSON.stringify(existing)===JSON.stringify(asset)?asset.id:newId();p.assets[id]={...asset,id};assetIds.set(asset.id,id);}
  for(const n of Object.values(f.nodes)){const id=ids.get(n.id)!;p.nodes[id]={...structuredClone(n),id,children:n.children.map(child=>ids.get(child)!),assetId:n.assetId?assetIds.get(n.assetId):undefined,annotations:n.annotations.map(a=>({...a,id:newId()}))};}
  for(const id of ids.values()){const n=p.nodes[id];if(n.button?.action.type==='section'&&n.button.action.target){const mapped=ids.get(n.button.action.target);if(mapped)n.button.action.target=mapped;else if(!p.nodes[n.button.action.target])n.button.action={type:'none'};}if(n.button?.action.type==='page'&&!p.pages.some(page=>page.id===n.button!.action.target&&!page.archived))n.button.action={type:'none'};}
  const root=ids.get(f.rootId)!;p.nodes[root].name+=' copy';p.nodes[root].style={...p.nodes[root].style,offsetX:(p.nodes[root].style.offsetX??0)+12,offsetY:(p.nodes[root].style.offsetY??0)+12};if(p.nodes[root].frame){p.nodes[root].frame!.x=Math.min(5000,p.nodes[root].frame!.x+12);p.nodes[root].frame!.y=Math.min(5000,p.nodes[root].frame!.y+12);}parent.children.push(root);return root;
}
