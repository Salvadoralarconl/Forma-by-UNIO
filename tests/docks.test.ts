import { describe, it, expect } from 'vitest';
import { defaultWorkspace, movePanel, togglePanel, normalizeWorkspace, resizeDock, fitWorkspace } from '../src/editor/workspace';
describe('workspace docks', () => {
  it('moves panels into one shared dock and switches active tabs without losing membership', () => {
    const p = movePanel(defaultWorkspace(), 'elements', 'right');
    expect(p.panels.elements.side).toBe('right');
    expect(p.active.right).toBe('elements');
    expect(p.panels.layers.side).toBe('right');
    expect(p.panels.properties.side).toBe('right');
    const hidden = togglePanel(p, 'elements');
    expect(hidden.panels.elements.visible).toBe(false);
    expect(hidden.active.right).not.toBe('elements');
    expect(normalizeWorkspace(JSON.parse(JSON.stringify(p)))).toEqual(p);
  });
  it('repairs invalid preferences and constrains widths so the canvas remains usable', () => {
    expect(normalizeWorkspace({ version: 999 })).toEqual(defaultWorkspace());
    expect(resizeDock(defaultWorkspace(), 'left', 9999, 1060).widths.left).toBeLessThanOrEqual(298);
    expect(resizeDock(defaultWorkspace(), 'right', -99, 1060).widths.right).toBe(180);
  });
  it('reserves canvas space after loading two wide visible docks',()=>{
    const p=movePanel(defaultWorkspace(),'elements','left');p.widths={left:380,right:380};
    const fitted=fitWorkspace(p,1060);expect(1060-42-fitted.widths.left-fitted.widths.right).toBeGreaterThanOrEqual(460);
  });
});
