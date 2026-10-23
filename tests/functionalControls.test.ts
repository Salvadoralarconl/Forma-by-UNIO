import {it,expect} from 'vitest';
import {createProject} from '../src/domain/model';
import {applyCommand} from '../src/domain/commands';
import {createPreset} from '../src/domain/presets';
import {decodeProject,encodeProject} from '../src/persistence/archive';
import {websiteExportFiles} from '../src/persistence/websiteExport';
import {strFromU8} from 'fflate';
it('persists search and dropdown controls and includes working standalone search support',()=>{
 let p=createProject();const root=p.pages[0].rootId;
 for(const preset of ['searchBar','dropdown']){const built=createPreset(preset);expect(built.root.button).toBeUndefined();p=applyCommand(p,{type:'add',kind:'container',parentId:root,preset});}
 const saved=decodeProject(encodeProject(p));expect(saved.nodes[saved.nodes[root].children[0]]).toHaveProperty('control.type','search');
 const files=websiteExportFiles(saved);expect(strFromU8(files['Open-preview.html'])).toContain('data-page-search');expect(strFromU8(files['Open-preview.html'])).toContain('<select');expect(files['controls.js']).toBeDefined();
});
