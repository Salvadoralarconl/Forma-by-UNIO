import { describe, expect, it } from 'vitest';
import { wheelZoom, canDeleteSelection } from '../src/editor/navigation';
describe('workspace navigation', () => {
  it('zooms in/out within bounds without changing document dimensions', () => {
    expect(wheelZoom(1, -100)).toBeGreaterThan(1);
    expect(wheelZoom(1, 100)).toBeLessThan(1);
    expect(wheelZoom(2, -1000)).toBe(2);
    expect(wheelZoom(0.2, 1000)).toBe(0.2);
  });
  it('allows Backspace deletion only outside typing and modal contexts', () => {
    expect(canDeleteSelection('Backspace', false, false)).toBe(true);
    expect(canDeleteSelection('Backspace', true, false)).toBe(false);
    expect(canDeleteSelection('Backspace', false, true)).toBe(false);
  });
});
