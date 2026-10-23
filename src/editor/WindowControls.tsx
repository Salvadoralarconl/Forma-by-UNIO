import { useEffect, useState } from 'react';
import { Copy, Minus, Square, X } from 'lucide-react';

export function WindowControls({ native, onError }: { native: boolean; onError: (message: string) => void }) {
  const [maximized, setMaximized] = useState(false);
  useEffect(() => {
    if (!native) return;
    let disposed = false;
    let off: (() => void) | undefined;
    import('@tauri-apps/api/window').then(async ({ getCurrentWindow }) => {
      const w = getCurrentWindow();
      setMaximized(await w.isMaximized());
      const unlisten = await w.onResized(async () => { if (!disposed) setMaximized(await w.isMaximized()); });
      if (disposed) unlisten(); else off = unlisten;
    }).catch(e => onError(String(e)));
    return () => { disposed = true; off?.(); };
  }, [native, onError]);
  const act = async (action: 'minimize' | 'toggleMaximize' | 'close') => {
    try { const { getCurrentWindow } = await import('@tauri-apps/api/window'); await getCurrentWindow()[action](); }
    catch (e) { onError(`Window action failed: ${String(e)}`); }
  };
  if (!native) return null;
  return <div className="window-controls" aria-label="Window controls">
    <button aria-label="Minimize window" title="Minimize" onClick={() => void act('minimize')}><Minus size={13} /></button>
    <button aria-label={maximized ? 'Restore window' : 'Maximize window'} title={maximized ? 'Restore' : 'Maximize'} onClick={() => void act('toggleMaximize')}>{maximized ? <Copy size={11} /> : <Square size={11} />}</button>
    <button className="window-close" aria-label="Close window" title="Close" onClick={() => void act('close')}><X size={15} /></button>
  </div>;
}
