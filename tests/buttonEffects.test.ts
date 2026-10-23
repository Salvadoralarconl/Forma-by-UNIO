import {it,expect} from 'vitest';
import {createProject} from '../src/domain/model';
import {applyCommand} from '../src/domain/commands';
import {buttonEffect} from '../src/domain/buttonEffects';
import {decodeProject,encodeProject} from '../src/persistence/archive';
import {websiteExportFiles} from '../src/persistence/websiteExport';
import {strFromU8} from 'fflate';
it('preserves selected effects and exports a local selection runtime',()=>{let p=createProject();const root=p.pages[0].rootId;p=applyCommand(p,{type:'add',kind:'container',parentId:root,preset:'solidButton'});const id=p.nodes[root].children[0],b=p.nodes[id].button!;p=applyCommand(p,{type:'update',id,patch:{button:{...b,selectionMode:'toggle',states:{...b.states,selected:buttonEffect('outline','#ff0000')}}}});expect(decodeProject(encodeProject(p)).nodes[id].button).toEqual(p.nodes[id].button);const files=websiteExportFiles(p);expect(strFromU8(files['site.css'])).toContain('[data-button-selected=true]');expect(strFromU8(files['site.css'])).toContain('outline:2px solid #ff0000');expect(strFromU8(files['controls.js'])).toContain('aria-pressed');expect(strFromU8(files['Open-preview.html'])).toContain('data-button-selection="toggle"');});
