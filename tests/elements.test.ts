import { describe, expect, it } from 'vitest';
import { createProject } from '../src/domain/model';
import { applyCommand } from '../src/domain/commands';
import { encodeProject, decodeProject } from '../src/persistence/archive';
describe('Canva-style elements', () => {
  it('inserts editable text presets and shapes as canonical layers', () => {
    let p = createProject('Elements');
    const root = p.pages[0].rootId;
    p = applyCommand(p, { type: 'add', kind: 'text', parentId: root, preset: 'heading' });
    p = applyCommand(p, { type: 'add', kind: 'shape', parentId: root, preset: 'ellipse' });
    const result = decodeProject(encodeProject(p));
    const [heading, circle] = result.nodes[root].children.map(id => result.nodes[id]);
    expect(heading.text).toBe('Add a heading');
    expect(heading.style.fontSize).toBe(48);
    expect(circle.name).toBe('Circle');
    expect(circle.style).toMatchObject({ width: 120, minHeight: 120, borderRadius: 500 });
  });
});
