import {describe,it,expect} from 'vitest';
import {parseSvgIcon} from '../src/domain/iconPacks';
import {BUNDLED_ICONS,iconMatches} from '../src/domain/iconCatalog';
import {createProject} from '../src/domain/model';
import {applyCommand} from '../src/domain/commands';
import {encodeProject,decodeProject} from '../src/persistence/archive';
const wrap=(body:string)=>`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">${body}</svg>`;
describe('local icon packs',()=>{
 it('accepts whitespace surrounding SVG path data',()=>{expect(parseSvgIcon(wrap('<path d="  M2 2L20 20  "/>'),'spaced.svg','Pack').paths).toEqual(['M2 2L20 20']);});
 it('bundles512 distinct Lucide geometries and42 new UNIO designs, with semantic variants',()=>{expect(BUNDLED_ICONS).toHaveLength(554);const homes=BUNDLED_ICONS.filter(i=>iconMatches(i,'home'));expect(homes.length).toBeGreaterThanOrEqual(4);expect(new Set(homes.map(i=>JSON.stringify([i.paths,i.style]))).size).toBe(homes.length);expect(BUNDLED_ICONS.filter(i=>iconMatches(i,'home','UNIO','filled')).length).toBeGreaterThan(0);expect(BUNDLED_ICONS.filter(i=>i.pack==='Lucide')).toHaveLength(512);});
 it('imports safe shapes and embeds used geometry in portable project history',()=>{const icon=parseSvgIcon(wrap('<path d="M2 16L16 2L30 16V30H2Z"/>'),'home solid.svg','My pack');expect(icon.name).toBe('home solid');expect(icon.viewBox).toEqual([0,0,32,32]);expect(iconMatches(icon,'home solid','My pack','filled')).toBe(true);let p=createProject();const root=p.pages[0].rootId;p=applyCommand(p,{type:'addIcon',parentId:root,icon});const n=p.nodes[p.nodes[root].children[0]];expect(decodeProject(encodeProject(p)).nodes[n.id]).toMatchObject({iconPaths:icon.paths,iconFills:[true],iconViewBox:[0,0,32,32]});expect(parseSvgIcon(wrap('<rect x="1" y="2" width="20" height="16" rx="3"/>'),'rounded.svg','Pack').paths[0]).toContain('3');});
 it.each(['<script>alert(1)</script>','<path onload="alert(1)" d="M0 0L1 1"/>','<image href="https://example.com/a.svg"/>','<foreignObject/>','<path d="M0 0L1 1" fill="url(#gradient)"/>','<use href="#x"/>','<g transform="scale(2)"><path d="M0 0L1 1"/></g>'])('rejects unsafe or unsupported content: %s',body=>{expect(()=>parseSvgIcon(wrap(body),'bad.svg','Pack')).toThrow();});
 it('preserves accepted fill and stroke paint semantics',()=>{const icon=parseSvgIcon(wrap('<path fill="none" stroke="currentColor" stroke-width="6" stroke-linecap="square" stroke-linejoin="bevel" d="M2 2L20 20"/>'),'stroke.svg','Pack');expect(icon.paint?.[0]).toEqual({rule:'nonzero',width:6,cap:'square',join:'bevel'});});
 it('rejects XML entities and oversized vectors',()=>{expect(()=>parseSvgIcon('<!DOCTYPE svg [<!ENTITY e SYSTEM "file:///secret">]>'+wrap('<path d="M0 0"/>'),'bad.svg','Pack')).toThrow();expect(()=>parseSvgIcon(wrap(' '.repeat(33000)),'big.svg','Pack')).toThrow();});
});

it('offers ten distinct rounded folder variants with embedded portable geometry',()=>{const folders=BUNDLED_ICONS.filter(i=>i.id.startsWith('unio-folder-'));expect(folders).toHaveLength(10);expect(new Set(folders.map(i=>JSON.stringify([i.paths,i.fills]))).size).toBe(10);for(const icon of folders){expect(iconMatches(icon,'folder rounded','UNIO','rounded')).toBe(true);expect(icon.paths[0]).toContain('Q');}});

it('offers eight searchable rounded filter variants',()=>{const filters=BUNDLED_ICONS.filter(i=>i.id.startsWith('unio-filter-'));expect(filters).toHaveLength(8);for(const icon of filters)expect(iconMatches(icon,'filter rounded','UNIO','rounded')).toBe(true);});
