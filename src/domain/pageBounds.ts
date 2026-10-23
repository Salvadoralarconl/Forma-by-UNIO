import {createProject,type Project} from './model';

/** Legacy pages keep their flow tree; their visible boundary never follows content. */
export function fixedPageHeight(project:Project,rootId:string){
 const page=project.pages.find(page=>page.rootId===rootId),root=project.nodes[rootId];
 return Math.max(100,page?.height??root.style.height??root.style.minHeight??780);
}

export function createCanvasProject(name:string){
 const project=createProject(name),page=project.pages[0],root=project.nodes[page.rootId];
 project.schemaVersion=2;page.width=1440;page.height=780;root.layoutMode='free';
 root.style={height:780,minHeight:780,padding:0,background:'#ffffff'};
 return project;
}
