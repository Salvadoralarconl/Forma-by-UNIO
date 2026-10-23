import { ChevronDown, ChevronRight, Eye, EyeOff, Frame, ImageIcon, LockKeyhole, Plus, Type } from 'lucide-react';

import { useState } from 'react';

import type { Editor } from './useEditor';



export function Layers({ editor }: { editor: Editor }) {

  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());

  const { project, selected, run } = editor;

  const root = (project.pages.find(p => p.id === editor.pageId) ?? project.pages[0]).rootId;

  const draw = (id: string, depth: number): React.ReactNode => {

    const n = project.nodes[id]; const Icon = n.kind === 'text' ? Type : n.kind === 'image' ? ImageIcon : Frame;

    return <div key={id} role="none">

      <div role="treeitem" aria-selected={selected === id} aria-label={`${n.name}${n.locked ? ' locked' : ''}${n.hidden ? ' hidden' : ''}`}

        aria-level={depth + 1} aria-expanded={n.children.length ? !collapsed.has(id) : undefined}

        className={`layer-row ${selected === id ? 'selected' : ''}`} style={{ paddingLeft: 10 + depth * 15 }}>

        <button className="disclosure" title={collapsed.has(id) ? 'Expand layer' : 'Collapse layer'} disabled={!n.children.length} onClick={() => setCollapsed(set => {

          const next = new Set(set); next.has(id) ? next.delete(id) : next.add(id); return next;

        })}>{n.children.length ? collapsed.has(id) ? <ChevronRight size={12} /> : <ChevronDown size={12} /> : <span />}</button>

        <button className="layer-select" onClick={() => editor.setSelected(id)}><Icon size={14} /><span>{n.name}</span>{n.locked && <LockKeyhole size={11} />}</button>

        <button className="layer-visibility" aria-label={`${n.hidden ? 'Show' : 'Hide'} ${n.name}`} disabled={n.locked || editor.busy}

          onClick={() => run({ type: 'update', id, patch: { hidden: !n.hidden } })}>{n.hidden ? <EyeOff size={12} /> : <Eye size={12} />}</button>

      </div>

      {!collapsed.has(id) && n.children.map(child => draw(child, depth + 1))}

    </div>;

  };

  return <aside className="layers-panel">

    <div className="panel-eyebrow">PROJECT</div>

    <div className="panel-heading"><h2>Pages</h2><button className="icon-button" aria-label="Add page" disabled={editor.busy} onClick={() => run({ type: 'addPage', name: `Page ${project.pages.length + 1}`,afterId:editor.pageId })}><Plus size={15} /></button></div>

    <div className="page-list">{project.pages.filter(page=>!page.archived).map(page => <button key={page.id} className={`page-button ${page.id === editor.pageId ? 'active' : ''}`} onClick={() => { editor.setPageId(page.id); editor.setSelected(page.rootId);document.querySelector(`[data-page-id="${page.id}"]`)?.scrollIntoView({block:'center',inline:'center'}); }}><span className="page-dot" />{page.name}<span className="page-count">{page.id === editor.pageId ? '●' : ''}</span></button>)}</div>

    <div className="action-row"><button aria-label="Move page up" disabled={project.pages[0].id===editor.pageId} onClick={()=>run({type:'movePage',id:editor.pageId,index:project.pages.findIndex(p=>p.id===editor.pageId)-1})}>↑</button><button aria-label="Move page down" disabled={project.pages.at(-1)?.id===editor.pageId} onClick={()=>run({type:'movePage',id:editor.pageId,index:project.pages.findIndex(p=>p.id===editor.pageId)+1})}>↓</button><button aria-label="Archive page" onClick={()=>run({type:'archivePage',id:editor.pageId})}>Archive</button><button aria-label="Delete page" onClick={()=>run({type:'deletePage',id:editor.pageId})}>Delete</button></div>

    {project.pages.filter(p=>p.archived).map(p=><button key={p.id} onClick={()=>run({type:'archivePage',id:p.id})}>Restore {p.name}</button>)}

    <div className="panel-divider" />

    <div className="panel-heading"><h2>Layers</h2><span className="count">{Object.keys(project.nodes).length}</span></div>

    <div role="tree" aria-label="Page layers" className="layer-tree">{draw(root, 0)}</div>

    <div className="layer-help"><Frame size={20} strokeWidth={1.3} /><strong>Built with structure.</strong><span>Containers keep your content in the flow of the web.</span></div>

    <div className="local-card"><span className="status-dot" /><div><strong>Local workspace</strong><small>Your ideas stay on this device.</small></div></div>

  </aside>;

}

