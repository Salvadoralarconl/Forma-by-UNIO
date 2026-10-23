import React from 'react';
import {it,expect} from 'vitest';
import {renderToStaticMarkup} from 'react-dom/server';
import {createProject,type Asset} from '../src/domain/model';
import {applyCommand,type Command} from '../src/domain/commands';
import {execute,createHistory,undo} from '../src/domain/history';
import {encodeProject,decodeProject} from '../src/persistence/archive';
import {Site} from '../src/export/Site';
it('persists image backgrounds and effects without changing page content; undo restores the original',()=>{
 const p=createProject(),id=p.pages[0].id,root=p.pages[0].rootId;
 const asset:Asset={id:'background',name:'bg.png',mime:'image/png',data:'iVBORw0KGgo='};
 const command={type:'pageBackground',id,asset,background:{color:'#336699',assetId:asset.id,opacity:.5,blur:8,backdropBlur:4,fit:'cover',position:'center'}} as unknown as Command;
 const h=execute(createHistory(p),command),saved=decodeProject(encodeProject(h.present));
 expect(saved.pages[0]).toMatchObject({background:{assetId:'background',opacity:.5,blur:8}});expect(saved.nodes[root]).toEqual(p.nodes[root]);expect(undo(h).present).toEqual(p);
 const html=renderToStaticMarkup(<Site project={saved}/>);expect(html).toContain('public/assets/background.png');expect(html).toContain('blur(8px)');expect(html).toContain('opacity:0.5');
 expect(()=>applyCommand(p,{type:'pageBackground',id,background:{assetId:'missing'}} as unknown as Command)).toThrow();
 const locked=structuredClone(p);locked.nodes[root].locked=true;expect(()=>applyCommand(locked,command)).toThrow();
});
