import {it,expect} from 'vitest';
import {defaultWorkspace,movePanel,floatPanel,normalizeWorkspace,panelDropSide} from '../src/editor/workspace';
it('floats a panel, persists its position and redocks without losing other panels',()=>{
 const initial=movePanel(defaultWorkspace(),'elements','left'),floating=floatPanel(initial,'elements',{x:500,y:180});
 expect(floating.panels.elements).toMatchObject({side:'floating',visible:true,x:500,y:180});expect(floating.active.left).toBeNull();
 expect(normalizeWorkspace(JSON.parse(JSON.stringify(floating)))).toEqual(floating);
 const docked=movePanel(floating,'elements','right');expect(docked.active.right).toBe('elements');expect(docked.panels.properties.visible).toBe(true);
 expect(panelDropSide(80,1440)).toBe('left');expect(panelDropSide(1350,1440)).toBe('right');expect(panelDropSide(600,1440)).toBe('floating');
});
