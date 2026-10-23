import React from 'react';
import {afterEach,expect,it} from 'vitest';
import {cleanup,fireEvent,render,screen} from '@testing-library/react';
import {App} from '../src/editor/App';
import {createProject,makeNode} from '../src/domain/model';
import type {Platform} from '../src/persistence/platform';
import {createHistory,execute,undo,redo} from '../src/domain/history';
import {encodeProject,decodeProject} from '../src/persistence/archive';
import {fixedPageHeight} from '../src/domain/pageBounds';
import {Site} from '../src/export/Site';
const platform:Platform={native:false,open:async()=>null,save:async()=>null,readRecovery:async()=>null,readSavedForRecovery:async()=>null,writeRecovery:async()=>{},clearRecovery:async()=>{}};
afterEach(()=>{cleanup();localStorage.clear();});
it('keeps zero-minimum legacy pages visible in editor and exported website',()=>{
 const p=createProject('Zero minimum'),root=p.nodes[p.pages[0].rootId];root.style.minHeight=0;
 expect(fixedPageHeight(p,root.id)).toBe(100);
 const {container}=render(<Site project={p}/>);
 expect(container.querySelector('section')!.style.height).toBe('100px');
});
it('keeps a legacy page fixed and retains oversized flow content in Design and Preview',()=>{
 const p=createProject('Legacy');const root=p.nodes[p.pages[0].rootId];root.style.minHeight=1100;
 const child=makeNode('shape','large','Large',{height:4000,width:4000});root.children.push(child.id);p.nodes[child.id]=child;
 render(<App platform={platform} initialProject={p}/>);
 expect(screen.getByTestId('artboard').style.height).toBe('1100px');
 expect(screen.getByTestId('artboard').style.overflow).toBe('hidden');
 fireEvent.click(screen.getByRole('button',{name:'Resize page height from toolbar'}));
 expect(screen.getByRole('button',{name:'Resize page height'})).toBeTruthy();
 expect(p.nodes.large.style.height).toBe(4000);expect(root.children).toContain('large');
 fireEvent.click(screen.getByRole('button',{name:'Preview'}));
 expect(screen.getByTestId('artboard').style.height).toBe('1100px');
 expect(screen.getByTestId('artboard').style.overflow).toBe('hidden');
});
it('starts an unspecified project on a fixed free-placement page',()=>{
 render(<App platform={platform}/>);
 expect(screen.getByTestId('artboard').style.height).toBe('780px');
 expect(screen.queryByRole('button',{name:'New free design page'})).toBeNull();
});
it('persists explicit legacy viewport height with undo and export parity without converting or losing nodes',()=>{
 const p=createProject('Legacy'),page=p.pages[0],root=p.nodes[page.rootId];root.style.minHeight=1100;
 const h=execute(createHistory(p),{type:'resizePage',id:page.id,height:2400});
 expect(h.present.nodes).toEqual(p.nodes);expect(h.present.schemaVersion).toBe(1);
 expect(fixedPageHeight(undo(h).present,page.rootId)).toBe(1100);
 const reopened=decodeProject(encodeProject(redo(undo(h)).present));
 expect(fixedPageHeight(reopened,page.rootId)).toBe(2400);expect(reopened.nodes).toEqual(p.nodes);
 const {container}=render(<Site project={reopened}/>);
 expect(container.querySelector('section')!.style.height).toBe('2400px');
 expect(container.querySelector('section')!.style.overflow).toBe('hidden');
});
