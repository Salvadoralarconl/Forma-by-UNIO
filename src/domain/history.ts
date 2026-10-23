import { type Project } from './model';
import { applyCommand, type Command } from './commands';
export interface History { past: Project[]; present: Project; future: Project[] }
export const createHistory = (project: Project): History => ({ past: [], present: project, future: [] });
export function execute(h: History, command: Command): History {
  return { past: [...h.past, h.present].slice(-80), present: applyCommand(h.present, command), future: [] };
}
export function undo(h: History): History {
  if (!h.past.length) return h;
  return { past: h.past.slice(0, -1), present: h.past[h.past.length - 1], future: [h.present, ...h.future] };
}
export function redo(h: History): History {
  if (!h.future.length) return h;
  return { past: [...h.past, h.present], present: h.future[0], future: h.future.slice(1) };
}
