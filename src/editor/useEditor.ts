import { useCallback, useEffect, useRef, useState } from 'react';

import { type Asset, type Project, createProject, newId, parentOf,insertionParent } from '../domain/model';

import { type Command } from '../domain/commands';

import { createHistory, execute, undo, redo } from '../domain/history';

import {encodeWebsite} from '../persistence/websiteExport';
import {saveWebsiteArchive} from '../persistence/platform';
import { type Platform } from '../persistence/platform';

import { type RecoverySnapshot, RecoveryQueue, shouldOfferRecovery } from '../persistence/recovery';

import { MAX_ASSET, bytesToBase64, verifyRaster } from '../persistence/archive';

import type { ElementKey } from './Elements';

import {copyFragment,type Fragment} from '../domain/clipboard';
import {copyAppearance} from '../domain/styleClipboard';
import type {NodeStyle} from '../domain/model';

import {readImportedIcons} from '../domain/iconPacks';
import {PRESETS} from '../domain/presets';



export type ConfirmRequest = { title: string; body: string; action: () => Promise<void> };

export function useEditor(platform: Platform, initialProject: Project) {

  const [history, setHistory] = useState(() => createHistory(initialProject));

  const historyRef = useRef(history);
  const groupedRun=useRef<{key:string;history:typeof history}|null>(null);

  const project = history.present;

  const [pageId, setPageId] = useState(project.pages[0].id);

  const [selected,setPrimary]=useState(project.pages[0].rootId);
  const [selectedIds,setSelectedIds]=useState<string[]>([project.pages[0].rootId]);
  const setSelected=useCallback((id:string)=>{setPrimary(id);setSelectedIds([id]);},[]);
  const selectMany=(ids:string[],fallback:string)=>{setSelectedIds(ids);setPrimary(ids.at(-1)??fallback);};
  const clearSelection=(rootId?:string)=>{setSelectedIds([]);setPrimary(rootId??project.pages.find(p=>p.id===pageId)?.rootId??project.pages[0].rootId);};
  const selectNode=(id:string,additive=false)=>{if(!additive){setSelected(id);return;}const ids=selectedIds.includes(id)?selectedIds.filter(x=>x!==id):[...selectedIds.filter(x=>!project.pages.some(p=>p.rootId===x)),id];selectMany(ids,project.pages.find(p=>p.id===pageId)?.rootId??project.pages[0].rootId);};

  const [path, setPath] = useState<string | null>(null);

  const [saved, setSaved] = useState<string | null>(null);

  const [busy, setBusy] = useState(false);

  const [buttonState,setButtonState]=useState<'default'|'hover'|'pressed'|'focus'>('default');
  useEffect(()=>{setButtonState('default');},[selected]);
  const [error, setError] = useState('');

  const [notice, setNotice] = useState('');

  const [recovery, setRecovery] = useState<RecoverySnapshot | null>(null);

  const [recoveryChecked, setRecoveryChecked] = useState(false);

  const [confirm, setConfirm] = useState<ConfirmRequest | null>(null);

  const fingerprint = JSON.stringify(project);

  const dirty = fingerprint !== saved;

  const current = useRef({ project, path, dirty, fingerprint, busy });

  current.current = { project, path, dirty, fingerprint, busy };

  const queue = useRef(new RecoveryQueue(snapshot => platform.writeRecovery(snapshot)));

  const operationLock = useRef(false);

  const clipboard=useRef<Fragment|null>(null);
  const styleClipboard=useRef<Partial<NodeStyle>|null>(null);
  const [canPasteStyle,setCanPasteStyle]=useState(false);

  const [canPaste,setCanPaste]=useState(false);

  const epoch = useRef(0);

  const startupPending = useRef(true);

  const recoveryRef = useRef<RecoverySnapshot | null>(null);

  const preserveUnreadRecovery = useRef(false);



  const commitHistory = useCallback((next: typeof history) => {

    historyRef.current = next;

    const fingerprint = JSON.stringify(next.present);

    current.current = { ...current.current, project: next.present, fingerprint, dirty: true };

    setHistory(next);

  }, []);



  useEffect(() => {

    let live = true;

    platform.readRecovery().then(async candidate => {

      // A corrupt/unavailable original must not hide an already validated snapshot.

      const disk = candidate ? await platform.readSavedForRecovery().catch(() => null) : null;

      if (!live) return;

      if (candidate && shouldOfferRecovery(candidate, disk)) { recoveryRef.current = candidate; setRecovery(candidate); }

      else if (candidate) setNotice('Saved project is current; recovery snapshot skipped');

      startupPending.current = false;

      setRecoveryChecked(true);

    }).catch(e => { if (live) {

      preserveUnreadRecovery.current = true; startupPending.current = false; setRecoveryChecked(true);

      setError(`Recovery could not be read. Its original snapshot was preserved; save manually. ${String(e)}`);

    } });

    return () => { live = false; };

  }, [platform]);



  useEffect(() => {

    if (!dirty || !recoveryChecked || recovery || busy || preserveUnreadRecovery.current) return;

    const snapshot = { project, sourcePath: path, capturedAt: new Date().toISOString() };

    const timeout = setTimeout(() => {

      queue.current.enqueue(snapshot).then(() => setNotice('Recovery snapshot updated'))

        .catch(e => setError(`Recovery failed. Save your project manually. ${String(e)}`));

    }, 900);

    return () => clearTimeout(timeout);

  }, [project, path, dirty, recoveryChecked, recovery, busy]);



  useEffect(() => {

    if(!project.pages.some(p=>p.id===pageId&&!p.archived)){const home=project.pages.find(p=>!p.archived)??project.pages[0];setPageId(home.id);setSelected(home.rootId);return;}

    if(selectedIds.some(id=>!project.nodes[id])){const remaining=selectedIds.filter(id=>project.nodes[id]);setSelectedIds(remaining.length?remaining:[project.pages.find(p=>p.id===pageId)?.rootId??project.pages[0].rootId]);}
    if (!project.nodes[selected]) setSelected(project.pages.find(p => p.id === pageId)?.rootId ?? project.pages[0].rootId);

  }, [project, selected, pageId,selectedIds]);



  const run = useCallback((command: Command,historyGroup?:string) => {

    if (operationLock.current) return;

    try {

      const before=historyRef.current,next = execute(before, command);
      const groupKey=historyGroup?`${historyGroup}:${command.type}:${'id' in command?command.id:''}`:undefined;
      if(groupKey&&groupedRun.current?.key===groupKey&&groupedRun.current.history===before)next.past=before.past;
      commitHistory(next);groupedRun.current=groupKey?{key:groupKey,history:next}:null;setError('');

      if (command.type === 'add'||command.type==='paste'||command.type==='addIcon') {

        const added = next.present.nodes[command.parentId].children.at(-1); if (added) setSelected(added);

      }
      if(command.type==='duplicatePage'){const at=next.present.pages.findIndex(page=>page.id===command.id),copy=next.present.pages[at+1];setPageId(copy.id);setSelected(copy.rootId);}

      if (command.type === 'addPage') {
        if(command.mode==='free')setNotice('Free pages use project format2. Earlier builds cannot open them; keep an older copy if needed.');

        const page = next.present.pages.find(p=>!historyRef.current.past.at(-1)?.pages.some(old=>old.id===p.id))??next.present.pages.at(-1)!; setPageId(page.id); setSelected(page.rootId);

      }

    } catch (e) { setError(e instanceof Error ? e.message : String(e)); }

  }, [commitHistory]);



  const undoCommand = useCallback(() => { if (!operationLock.current) commitHistory(undo(historyRef.current)); }, [commitHistory]);

  const redoCommand = useCallback(() => { if (!operationLock.current) commitHistory(redo(historyRef.current)); }, [commitHistory]);



  const guarded = async (action: () => Promise<void>) => {

    if (operationLock.current) return;

    operationLock.current = true; setBusy(true); setError('');

    try { await action(); } catch (e) { setError(e instanceof Error ? e.message : String(e)); }

    finally { operationLock.current = false; setBusy(false); }

  };



  const clearRecovery = async () => {

    queue.current.invalidate(); await queue.current.settled();

    if (!preserveUnreadRecovery.current) await platform.clearRecovery();

  };

  const replace = async (p: Project, nextPath: string | null, isSaved: boolean) => {

    await clearRecovery(); epoch.current++;

    commitHistory(createHistory(p)); setPageId(p.pages[0].id); setSelected(p.pages[0].rootId);

    setPath(nextPath); setSaved(isSaved ? JSON.stringify(p) : null); setNotice(''); setRecovery(null);

    recoveryRef.current = null;

  };

  const save = useCallback(async (saveAs = false) => {

    if (startupPending.current || recoveryRef.current) return;

    await guarded(async () => {

      const snapshot = current.current;

      const nextPath = await platform.save(snapshot.project, snapshot.path, saveAs);

      if (nextPath === null) return;

      setPath(nextPath); setSaved(snapshot.fingerprint);

      await clearRecovery();

      setNotice(platform.native ? 'Project saved to disk' : 'Project download requested — keep the .forma file');

    });

  }, [platform]);

  const exportWebsite=async()=>{if(startupPending.current||recoveryRef.current)return;await guarded(async()=>{const p=current.current.project;const path=await saveWebsiteArchive(platform.native,encodeWebsite(p),p.name);if(path)setNotice(platform.native?'Website ZIP exported':'Website ZIP download requested');});};
  const requestReplace = (title: string, action: () => Promise<void>) => {

    if (operationLock.current) return;

    if (current.current.dirty) setConfirm({ title, body: 'This project has unsaved changes. Save it first, or discard changes to continue.', action });

    else void guarded(action);

  };

  const open = () => requestReplace('Open another project?', async () => {

    const opened = await platform.open(); if (opened) await replace(opened.project, opened.path, true);

  });

  const newProject = (name: string) => requestReplace('Create a new project?', async () => { const p=createProject(name);p.schemaVersion=2;const root=p.nodes[p.pages[0].rootId];root.layoutMode='free';root.style={height:780,minHeight:780,padding:0,background:'#ffffff'};p.pages[0].width=1440;p.pages[0].height=780;await replace(p, null, false); });

  const acceptConfirm = () => { const action = confirm?.action; setConfirm(null); if (action) void guarded(action); };

  const recover = () => void guarded(async () => {

    if (recovery) await replace(recovery.project, recovery.sourcePath, false);

  });

  const discardRecovery = () => void guarded(async () => { await clearRecovery(); recoveryRef.current = null; setRecovery(null); });

  const add = (kind: 'container' | 'text', layout?: 'row' | 'column') => {

    const n = project.nodes[selected];

    const parent=insertionParent(project,selected);

    if (parent) run({ type: 'add', kind, parentId: parent.id, layout });

  };

  const addImage = async (file: File) => {

    const atEpoch = epoch.current;

    const node = current.current.project.nodes[selected];

    const parentId=insertionParent(current.current.project,selected)?.id;

    try {

      if (file.size > MAX_ASSET) throw new Error('Each image must be 10 MB or smaller.');

      const bytes = new Uint8Array(await file.arrayBuffer());

      const asset = { id: newId(), name: file.name, mime: file.type, data: bytesToBase64(bytes) } as Asset;

      verifyRaster(bytes, asset.mime);

      if (atEpoch !== epoch.current || operationLock.current || !parentId) return;

      // Validate outside React's rendering/updater phase so failed imports are recoverable errors.

      const next = execute(historyRef.current, { type: 'add', kind: 'image', parentId, asset });

      commitHistory(next); setSelected(next.present.nodes[parentId].children.at(-1)!);

    } catch (e) { setError(e instanceof Error ? e.message : String(e)); }

  };

  const insertElement = (key: ElementKey, targetId?: string,point?:{x:number;y:number}) => {

    const p=historyRef.current.present;

    const target=p.nodes[targetId??selected];

    const parent=target?insertionParent(p,target.id):undefined;

    if(!parent)return;

    const imported=readImportedIcons().find(icon=>`local-${icon.id}`===key);if(imported){run({type:'addIcon',parentId:parent.id,icon:imported,point});return;}
    const preset=PRESETS.find(p=>p.id===key);if(!preset)return;

    if(preset.category==='Layout'){setError('Layout presets are paused while placement spaces are clarified.');return;}

    run({type:'add',kind:preset.kind,parentId:parent.id,preset:key,point});

  };

  const copy=()=>{try{clipboard.current=copyFragment(historyRef.current.present,selected);setCanPaste(true);setNotice('Element copied inside Forma');}catch(e){setError(String(e));}};

  const paste=()=>{if(!clipboard.current)return;const p=historyRef.current.present,n=p.nodes[selected];const parent=n?insertionParent(p,n.id):undefined;if(parent)run({type:'paste',parentId:parent.id,fragment:clipboard.current});};
  const copyStyle=()=>{const n=historyRef.current.present.nodes[selected];if(!n)return;styleClipboard.current=copyAppearance(n.style);setCanPasteStyle(true);setNotice('Style copied. Select another object and choose Paste style.');};
  const pasteStyle=()=>{if(!styleClipboard.current)return;const n=historyRef.current.present.nodes[selected];if(!n)return;const style=structuredClone(styleClipboard.current);if(n.kind==='shape'&&n.geometry?.type!=='rectangle')delete style.borderRadius;run({type:'update',id:selected,patch:{},style});};

  const mergeShapes = (otherId:string) => {

    const p=historyRef.current.present,n=p.nodes[selected];

    const a=document.querySelector<HTMLElement>(`[data-node-id="${selected}"]`)?.getBoundingClientRect();

    const b=document.querySelector<HTMLElement>(`[data-node-id="${otherId}"]`)?.getBoundingClientRect();

    if(!a||!b||!n.geometry||a.width<=0){setError('Show both shapes on the canvas before merging.');return;}

    const artboard=document.querySelector<HTMLElement>('[data-testid="artboard"]');

    const scale=parseFloat(artboard?.style.zoom??'1')||1;

    const parent=parentOf(p,selected),other=p.nodes[otherId];

    if(!parent||!other)return;

    const earlier=parent.children.indexOf(selected)<parent.children.indexOf(otherId)?n:other;

    const earlierBox=earlier===n?a:b;

    const flowX=earlierBox.left-(earlier.style.offsetX??0)*scale,flowY=earlierBox.top-(earlier.style.offsetY??0)*scale;

    const parentElement=document.querySelector<HTMLElement>(`[data-node-id="${parent.id}"]`);

    const parentStyle=parentElement?getComputedStyle(parentElement):null;

    const availableWidth=parentElement&&parentStyle?parentElement.clientWidth-parseFloat(parentStyle.paddingLeft||'0')-parseFloat(parentStyle.paddingRight||'0'):undefined;

    run({type:'mergeShapes',id:selected,otherId,offset:{x:(b.left-a.left)/scale,y:(b.top-a.top)/scale},placement:{x:(Math.min(a.left,b.left)-flowX)/scale,y:(Math.min(a.top,b.top)-flowY)/scale},measurements:{first:{width:a.width/scale,height:a.height/scale},second:{width:b.width/scale,height:b.height/scale}},availableWidth});

  };



  const flushRecovery = useCallback(async () => {

    if (startupPending.current || recoveryRef.current || preserveUnreadRecovery.current) return;

    const snapshot = current.current;

    if (snapshot.dirty) await queue.current.enqueue({ project: snapshot.project, sourcePath: snapshot.path, capturedAt: new Date().toISOString() });

    await queue.current.settled();

  }, []);



  useEffect(() => {

    const beforeUnload = (event: BeforeUnloadEvent) => {

      if (current.current.dirty) { event.preventDefault(); event.returnValue = ''; }

    };

    window.addEventListener('beforeunload', beforeUnload);

    let unlisten: (() => void) | undefined;

    let disposed = false;

    if (platform.native) {

      import('@tauri-apps/api/window').then(async ({ getCurrentWindow }) => {

        const appWindow = getCurrentWindow();

        const off = await appWindow.onCloseRequested(event => {

          if (operationLock.current) { event.preventDefault(); return; }

          if (startupPending.current || recoveryRef.current) return; // Keep the existing snapshot intact.

          if (!current.current.dirty) return;

          event.preventDefault();

          setConfirm({ title: 'Close unsaved project?', body: 'Save before closing, or close and keep a recovery snapshot.', action: async () => {

            await flushRecovery(); await appWindow.destroy();

          } });

        });

        if (disposed) off(); else unlisten = off;

      }).catch(e => setError(`Window close protection failed: ${String(e)}`));

    }

    return () => { disposed = true; unlisten?.(); window.removeEventListener('beforeunload', beforeUnload); };

  }, [platform, flushRecovery]);



  return { project, history, pageId, setPageId, selected, setSelected,selectedIds,selectNode,selectMany,clearSelection,buttonState,setButtonState, path, dirty, busy, error, setError, notice,

    run, undo: undoCommand, redo: redoCommand, save,exportWebsite, open, newProject, add, addImage, insertElement, mergeShapes, recovery, recover, discardRecovery,

    copy,paste,canPaste,copyStyle,pasteStyle,canPasteStyle,confirm, cancelConfirm: () => setConfirm(null), acceptConfirm, flushRecovery };

}

export type Editor = ReturnType<typeof useEditor>;

