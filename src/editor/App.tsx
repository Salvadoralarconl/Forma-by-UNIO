import { useEffect, useMemo, useRef, useState } from 'react';

import { ArrowLeft, Check, ChevronDown, CircleHelp, Columns3, Rows3, Command, Download, FolderOpen, Frame, Hand, ImagePlus, LayoutTemplate, Maximize, Minus, Monitor, MousePointer2, Plus, Redo2, Save, Smartphone, Tablet, Type, Undo2, X } from 'lucide-react';

import { type Project } from '../domain/model';
import {createCanvasProject} from '../domain/pageBounds';

import { createPlatform, type Platform } from '../persistence/platform';

import { Canvas } from './Canvas';

import { Inspector } from './Inspector';

import { Layers } from './Layers';

import { useEditor } from './useEditor';

import { WindowControls } from './WindowControls';

import {ApplicationMenus} from './ApplicationMenus';
import { Elements } from './Elements';

import { Dock } from './Dock';
import {FloatingPanels} from './FloatingPanels';

import { PANEL_IDS,PANEL_NAMES,useWorkspace } from './workspace';

import { canDeleteSelection,useCanvasNavigation } from './navigation';

import iconSources from '../../docs/icon-sources.json?raw';
import iconLicense from '../domain/icon-license.txt?raw';

import { Grid2X2 } from 'lucide-react';



const defaultPlatform = createPlatform();

export function App({ platform = defaultPlatform, initialProject }: { platform?: Platform; initialProject?: Project }) {

  const initial = useMemo(() => initialProject ?? createCanvasProject('Untitled studio'), [initialProject]);

  const editor = useEditor(platform, initial);

  const [preview, setPreview] = useState(false);

  const [width, setWidth] = useState(1440);
  const activePage=editor.project.pages.find(page=>page.id===editor.pageId)??editor.project.pages[0];
  useEffect(()=>{if(!preview)setWidth(activePage?.width??1440);},[preview,editor.pageId,activePage?.width]);
  const changeViewportWidth=(value:number)=>{if(!preview&&activePage&&editor.project.nodes[activePage.rootId].locked){editor.setError('Unlock the page before changing its width.');return;}setWidth(value);if(!preview)editor.run({type:'resizePageWidth',id:editor.pageId,width:value});};

  const [zoom, setZoom] = useState(() => {

    try { return Number(localStorage.getItem('forma.zoom')) || 0.5; } catch { return 0.5; }

  });

  const [newOpen, setNewOpen] = useState(false);

  const [newName, setNewName] = useState('Untitled studio');

  const [help, setHelp] = useState(false);

  const workspaceController=useWorkspace();

  const imageInput = useRef<HTMLInputElement>(null);

  const canvasViewport = useRef<HTMLDivElement>(null);

  const clampZoom = (value: number) => Math.min(2, Math.max(0.2, value));

  const centerCanvas=()=>{const v=canvasViewport.current;if(v){v.scrollLeft=(v.scrollWidth-v.clientWidth)/2;v.scrollTop=300;}};

  const fit = () => { const rect = canvasViewport.current?.getBoundingClientRect(); if (rect) {setZoom(clampZoom((rect.width - 100) / width));requestAnimationFrame(centerCanvas);} };

  useEffect(()=>{const frame=requestAnimationFrame(centerCanvas);return()=>cancelAnimationFrame(frame);},[]);

  useCanvasNavigation(canvasViewport,zoom,setZoom,!editor.confirm&&!editor.recovery&&!newOpen&&!help,!preview);

  useEffect(() => { try { localStorage.setItem('forma.zoom', String(zoom)); } catch { /* preference storage is optional */ } }, [zoom]);

  useEffect(() => {

    const listener = (e: KeyboardEvent) => {

      const input = e.target as HTMLElement;

      const typing = ['INPUT', 'TEXTAREA', 'SELECT'].includes(input.tagName) || input.isContentEditable;

      const mod = e.ctrlKey || e.metaKey;
      if(document.querySelector('.application-menu[role=menu]'))return;

      if (mod && e.key.toLowerCase() === 's') { e.preventDefault(); if (editor.confirm || editor.recovery || help || newOpen || editor.busy) return; if (typing) input.blur(); void editor.save(e.shiftKey); return; }

      if (typing || editor.confirm || editor.recovery || help || newOpen || editor.busy) return;

      if (mod && e.key.toLowerCase() === 'z') { e.preventDefault(); e.shiftKey ? editor.redo() : editor.undo(); }

      if (mod && e.key.toLowerCase() === 'y') { e.preventDefault(); editor.redo(); }

      if(mod&&!preview&&e.key.toLowerCase()==='c'){e.preventDefault();if(e.altKey)editor.copyStyle();else editor.copy();}

      if(mod&&!preview&&e.key.toLowerCase()==='v'){e.preventDefault();if(e.altKey)editor.pasteStyle();else editor.paste();}

      if (mod && e.key.toLowerCase() === 'd') { e.preventDefault(); editor.run({ type: 'duplicate', id: editor.selected }); }

      if (canDeleteSelection(e.key,typing,false) && !preview && editor.selectedIds.length>0 && !editor.project.pages.some(page=>page.rootId===editor.selected)) { e.preventDefault(); editor.run({ type: 'delete', id: editor.selected }); }

      if(mod&&e.key.toLowerCase()==='n'){e.preventDefault();setNewOpen(true);}

      if(mod&&e.key.toLowerCase()==='o'){e.preventDefault();editor.open();}

      if (!mod && !preview && e.key.toLowerCase() === 't') editor.add('text');

      if (!mod && !preview && e.key.toLowerCase() === 'f') editor.add('container');

      if (e.key === 'Escape') setPreview(false);

    };

    window.addEventListener('keydown', listener); return () => window.removeEventListener('keydown', listener);

  }, [editor, preview, help, newOpen]);





  const node = editor.project.nodes[editor.selected];

  const dockContent={elements:<Elements editor={editor} importImage={()=>imageInput.current?.click()}/>,properties:<Inspector key={editor.selected} editor={editor}/>,layers:<Layers editor={editor}/>};

  return <div className="app-shell">

    <div className="application-menubar"><img className="application-mark-logo" src="/forma-logo.png" alt="Forma" title="Forma by UNIO" draggable={false}/><ApplicationMenus onHelp={()=>setHelp(true)} sections={[
{label:'File',content:<><button onClick={() => setNewOpen(true)}>New project…<kbd>Ctrl+N</kbd></button><button onClick={editor.open}>Open…<kbd>Ctrl+O</kbd></button><hr /><button onClick={() => void editor.save()}>Save<kbd>Ctrl+S</kbd></button><button onClick={() => void editor.save(true)}>Save as…<kbd>Ctrl+Shift+S</kbd></button></>},
{label:'Edit',content:<><button disabled={!editor.history.past.length} onClick={editor.undo}>Undo edit<kbd>Ctrl+Z</kbd></button><button disabled={!editor.history.future.length} onClick={editor.redo}>Redo edit<kbd>Ctrl+Shift+Z</kbd></button><hr/><button onClick={editor.copy}>Copy element<kbd>Ctrl+C</kbd></button><button disabled={!editor.canPaste} onClick={editor.paste}>Paste element<kbd>Ctrl+V</kbd></button></>},
{label:'Layer',content:<><button onClick={() => editor.add('container')}>New container</button><button disabled title="Placement spaces pending clarification" onClick={() => editor.add('container', 'row')}>New row</button><button disabled title="Placement spaces pending clarification" onClick={() => editor.add('container', 'column')}>New column</button><button onClick={() => editor.add('text')}>New text layer</button><button onClick={() => imageInput.current?.click()}>Place image…</button><hr /><button onClick={() => editor.run({ type: 'duplicate', id: editor.selected })}>Duplicate selected layer</button></>},
{label:'View',content:<><button onClick={fit}>Fit canvas to workspace</button><button onClick={() => setZoom(1)}>Actual pixels (100%)</button></>},
{label:'Window',content:<>{PANEL_IDS.map(id=><button key={id} onClick={()=>workspaceController.toggle(id)}>{workspaceController.workspace.panels[id].visible?'✓ ':''}{PANEL_NAMES[id]}</button>)}<hr/><button onClick={()=>{workspaceController.reset();setZoom(0.5);}}>Reset Workspace</button></>}
]}/><span className="application-title" data-tauri-drag-region></span>
      <WindowControls native={platform.native} onError={editor.setError} />

    </div>

    <header className="topbar">

      <div className="project-identity"><input aria-label="Project name" value={editor.project.name} disabled={editor.busy} maxLength={120} onChange={e => { if (e.target.value.trim()) editor.run({ type: 'renameProject', name: e.target.value }); }} /><span data-testid="save-status" className={editor.dirty ? 'dirty-status' : ''}>{editor.busy ? 'Working…' : editor.dirty ? 'Unsaved changes' : platform.native ? 'Saved locally' : 'Saved · download requested'}</span></div>

    <div className="workspace-toolbar">

      <div className="history-tools"><button className="icon-button" title="Undo · Ctrl+Z" aria-label="Undo" disabled={editor.busy || !editor.history.past.length} onClick={editor.undo}><Undo2 size={16} /></button><button className="icon-button" title="Redo · Ctrl+Shift+Z" aria-label="Redo" disabled={editor.busy || !editor.history.future.length} onClick={editor.redo}><Redo2 size={16} /></button><span className="toolbar-rule" /><span className="breadcrumb">Pages <span>/</span> <b>{activePage.name}</b></span></div>

      <div className="mode-switch"><button className={!preview ? 'active' : ''} onClick={() => setPreview(false)}><MousePointer2 size={13} />Design</button><button aria-label="Preview" className={preview ? 'active' : ''} onClick={() => setPreview(true)}><Monitor size={13} />Preview</button></div>

      <div className="toolbar-end"><span className="offline-label"><span className="status-dot" />Offline ready</span><button className="icon-button" aria-label="Help and shortcuts" onClick={() => setHelp(true)}><CircleHelp size={17} /></button></div>

    </div>

        <div className="canvas-toolbar"><div className="viewport-controls"><button className={width===2560?"active":""} aria-label="Ultrawide viewport" title="Ultrawide · 2560 px" onClick={()=>changeViewportWidth(2560)}><Monitor size={18} style={{width:23,height:15}}/></button><button className={width === 1440 ? 'active' : ''} aria-label="Desktop viewport" title="1440 px preview width" onClick={() => changeViewportWidth(1440)}><Monitor size={15} /></button><button className={width === 768 ? 'active' : ''} aria-label="Tablet viewport" title="768 px preview width" onClick={() => changeViewportWidth(768)}><Tablet size={15} /></button><button className={width === 390 ? 'active' : ''} aria-label="Phone viewport" title="390 px preview width" onClick={() => changeViewportWidth(390)}><Smartphone size={15} /></button><span className="toolbar-rule" /><label><input aria-label="Preview width" type="number" min={240} max={2560} value={width} onChange={e => { const value = Number(e.target.value); if (value >= 240 && value <= 2560) changeViewportWidth(value); }} /><span>px</span></label></div><span className="canvas-mode-label">{preview ? 'PREVIEW · SAMPLE CONTENT' : 'CANVAS'}</span><div className="zoom-controls"><button aria-label="Zoom out" onClick={() => setZoom(clampZoom(zoom - 0.1))}><Minus size={13} /></button><button aria-label="Fit canvas" onClick={fit}>{Math.round(zoom * 100)}% <ChevronDown size={12} /></button><button aria-label="Zoom in" onClick={() => setZoom(clampZoom(zoom + 0.1))}><Plus size={13} /></button></div></div>

      <div className="topbar-actions"><button className="icon-button" aria-label="Export website" title="Export runnable website and React source" disabled={editor.busy} onClick={()=>void editor.exportWebsite()}><Command size={15}/></button>

        <span className="foundation-badge">FOUNDATION <i>01</i></span>

        <button className="text-button" aria-label="New project" disabled={editor.busy} onClick={() => setNewOpen(true)}><Plus size={15} />New</button>

        <button className="text-button" aria-label="Open project" disabled={editor.busy} onClick={editor.open}><FolderOpen size={16} />Open</button>

        <button className="save-as icon-button" aria-label="Save project as" title="Save as · Ctrl+Shift+S" disabled={editor.busy} onClick={() => void editor.save(true)}><Download size={16} /></button>

        <button className="primary-button" aria-label="Save project" disabled={editor.busy} onClick={() => void editor.save()}><Save size={15} />Save project</button>

      </div>

    </header>

    

    <main className="workspace">

      <nav className="tool-strip" aria-label="Canvas tools"><button className="active" aria-label="Select tool" title="Select layers on the canvas" onClick={() => setPreview(false)}><MousePointer2 size={19} /></button><button aria-label="Elements library" title="Elements" onClick={()=>workspaceController.show('elements')}><Grid2X2 size={19}/></button><div className="tool-divider" /><button aria-label="Add container" title="Container · F" disabled={editor.busy || preview} onClick={() => editor.add('container')}><Frame size={19} /></button><button aria-label="Add text" title="Text · T" disabled={editor.busy || preview} onClick={() => editor.add('text')}><Type size={20} /></button><button aria-label="Add image" title="Import image" disabled={editor.busy || preview} onClick={() => imageInput.current?.click()}><ImagePlus size={19} /></button><button aria-label="Add row" title="Placement spaces pending clarification" disabled onClick={() => editor.add('container', 'row')}><Rows3 size={18} /></button><button aria-label="Add column" title="Placement spaces pending clarification" disabled onClick={() => editor.add('container', 'column')}><Columns3 size={18} /></button><div className="tool-bottom"><button aria-label="Fit page" title="Fit page width" onClick={fit}><Maximize size={18} /></button></div></nav>

      <input ref={imageInput} className="visually-hidden" type="file" accept="image/png,image/jpeg,image/webp,image/gif" aria-label="Import image file" onChange={e => { const file = e.target.files?.[0]; if (file) void editor.addImage(file); e.target.value = ''; }} />

      {!preview&&<Dock side="left" controller={workspaceController}>{dockContent}</Dock>}

      <section className="canvas-column" aria-label="Design workspace">{editor.error && <div className="error-banner workspace-error-toast" role="alert"><span>{editor.error}</span><button aria-label="Dismiss error" onClick={() => editor.setError('')}><X size={14} /></button></div>}

        {preview && <div className="preview-info"><button onClick={() => setPreview(false)}><ArrowLeft size={13} />Back to design</button><span>Preview widths share the same layout. Breakpoint overrides are planned for milestone 2.</span></div>}

        <div className="canvas-viewport" ref={canvasViewport} onPointerDown={e=>{if(!preview&&e.button===0&&!(e.target as HTMLElement).closest("[data-node-id],button,input,select,textarea,a"))editor.clearSelection();}}>{editor.project.pages.filter(p=>!p.archived).map(p=><Canvas key={p.id} editor={editor} pageId={p.id} preview={preview} width={preview?width:p.width??width} zoom={zoom}/>)}</div>

        <div className="canvas-bottom"><span><MousePointer2 size={12} />{preview ? 'Preview mode' : editor.selectedIds.length&&node ? `${node.name} selected` : 'Select a layer'}</span><span>{Object.keys(editor.project.nodes).length} layers <span>·</span> {editor.project.pages.length} {editor.project.pages.length === 1 ? 'page' : 'pages'}</span></div>

      </section>

      {!preview&&<Dock side="right" controller={workspaceController}>{dockContent}</Dock>}
      {!preview&&<FloatingPanels controller={workspaceController}>{dockContent}</FloatingPanels>}

    </main>

    <footer className="statusbar"><span><span className="status-dot" />{platform.native ? 'On your device' : 'Browser preview'}<span className="footer-separator">/</span>{editor.notice || 'Design something that feels like you.'}</span><span>UNIO Forma <span className="footer-separator">/</span> v0.2.4</span></footer>

    {newOpen && <Modal title="A space for your next idea." onClose={() => setNewOpen(false)}><p>Create a local project. No account, no cloud, just your canvas.</p><form onSubmit={e => { e.preventDefault(); if (newName.trim()) { setNewOpen(false); editor.newProject(newName.trim()); } }}><label className="field"><span>Project name</span><input autoFocus value={newName} maxLength={120} onChange={e => setNewName(e.target.value)} /></label><div className="new-project-card"><LayoutTemplate size={28} /><div><strong>Blank canvas</strong><span>One page. Endless possibilities.</span></div><Check size={18} /></div><div className="modal-actions"><button type="button" onClick={() => setNewOpen(false)}>Cancel</button><button className="primary-button" disabled={!newName.trim()}>Create project</button></div></form></Modal>}

    {editor.confirm && <Modal title={editor.confirm.title} onClose={editor.cancelConfirm}><p>{editor.confirm.body}</p><div className="modal-actions"><button onClick={editor.cancelConfirm}>Cancel</button><button className="primary-button" onClick={editor.acceptConfirm}>{editor.confirm.title.startsWith('Close') ? 'Close with recovery' : 'Discard and continue'}</button></div></Modal>}

    {editor.recovery && <Modal title="Pick up where you left off." onClose={editor.discardRecovery}><p>A local recovery snapshot is available for <strong>{editor.recovery.project.name}</strong>. Recover it to continue editing, or discard the snapshot.</p><div className="modal-actions"><button disabled={editor.busy} onClick={editor.discardRecovery}>Discard snapshot</button><button className="primary-button" disabled={editor.busy} onClick={editor.recover}>Recover project</button></div></Modal>}

    {help && <Modal title="Make yourself at home." onClose={() => setHelp(false)}><p><strong>UNIO Forma 0.2.4</strong> · Shape editing and selection toolbar</p><p>Drag shapes, text, buttons and icons from Elements onto a new page. Select an element to edit its position, appearance or button states. Existing flow projects keep their layout; use the page-height handle to reveal content below the visible page.</p><div className="shortcut-list">{[['Save / Save as','Ctrl+S / Ctrl+Shift+S'],['Undo / Redo','Ctrl+Z / Ctrl+Shift+Z'],['Add text / container','T / F'],['Duplicate / delete','Ctrl+D / Delete'],['Copy / paste element','Ctrl+C / Ctrl+V'],['Return to Design','Escape']].map(([label,key]) => <div key={label}><span>{label}</span><kbd>{key}</kbd></div>)}</div><p className="help-note">Local projects, free placement, button states and offline HTML/React export are available. Responsive breakpoints, shared design systems, advanced motion and AI handoff are future milestones.</p><details><summary>Icon license</summary><pre className="license-text">{iconLicense}</pre></details><details><summary>Icon sources and UNIO designs</summary><pre className="license-text">{iconSources}</pre></details></Modal>}

  </div>;

}



function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {

  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => { const dialog = ref.current; if (dialog && !dialog.open) dialog.showModal?.(); return () => { dialog?.close?.(); }; }, []);

  return <dialog ref={ref} open={typeof HTMLDialogElement.prototype.showModal !== 'function'} className="modal" onCancel={e => { e.preventDefault(); onClose(); }} aria-label={title}><button className="modal-close icon-button" aria-label="Close dialog" onClick={onClose}><X size={18} /></button><div className="modal-mark"><img src="/forma-logo.png" alt="" aria-hidden="true"/></div><h2>{title}</h2>{children}</dialog>;

}









