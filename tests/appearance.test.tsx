import React from 'react';
import {describe,it,expect} from 'vitest';
import {render,cleanup} from '@testing-library/react';
import {createProject} from '../src/domain/model';
import {applyCommand} from '../src/domain/commands';
import {createHistory,execute,undo} from '../src/domain/history';
import {encodeProject,decodeProject} from '../src/persistence/archive';
import {ShapeVector} from '../src/editor/ShapeVector';
describe('shape appearance',()=>{
 it('renders opacity, rounded rectangle, shadow spread and all border dash styles from persistent data',()=>{let p=createProject();const root=p.pages[0].rootId;p=applyCommand(p,{type:'add',kind:'shape',parentId:root,preset:'rectangle'});const id=p.nodes[root].children[0];for(const [borderStyle,pattern] of [['solid',null],['dashed','20 12'],['short-dashed','8 8'],['dotted','0 10']] as const){const h=execute(createHistory(p),{type:'update',id,patch:{},style:{opacity:.4,borderRadius:18,borderWidth:4,borderColor:'#ef6c3b',borderStyle,shadow:{x:5,y:8,blur:12,spread:3,color:'#00000080'}}});const n=decodeProject(encodeProject(h.present)).nodes[id];expect(n.style.opacity).toBe(.4);const {container}=render(<ShapeVector node={n} props={{style:{opacity:n.style.opacity}}}/>);expect(container.querySelector('path')?.getAttribute('d')).toContain('A18 18');expect(container.querySelector('path')?.getAttribute('stroke-dasharray')).toBe(pattern);expect(container.querySelector('feMorphology')?.getAttribute('radius')).toBe('3 3');expect(undo(h).present).toEqual(p);cleanup();}expect(()=>applyCommand(p,{type:'update',id,patch:{},style:{opacity:NaN}})).toThrow();});
});
