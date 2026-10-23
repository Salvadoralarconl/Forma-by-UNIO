# 0.2.1 acceptance matrix

Native acceptance is separate from production Chrome verification. Windows palette dragging failed in 0.2.0. Tauri native drop handling was left enabled, conflicting with HTML5 dragging on Windows; 0.2.1 disables it. Config regression passes, but actual native drag remains unverified. Desktop input is stopped following physical Escape; recovery is untouched.

| Requested behavior | Browser/source evidence | Native status / remaining limits |
|---|---|---|
| Palette click/drag, precise free placement | Production insertion/drop coverage; fresh startup now free 1440×780 | Native drag fix pending packaged retest |
| Fixed page during oversized shape resize | Legacy/new fixed clipping; Open/recovery/pointer resize regression passed | Native retest pending; old tree retained, page handle reveals content |
| Eight resize handles, ratio lock, undo | Free placement browser and helper tests | Legacy flow retains original single handle; group scaling deferred |
| Live edge/center/equal-gap guides | Helpers and component tests; pointer browser test passed | Same-row/column peers; native retest pending |
| Appearance | Opacity, fill, solid/long dash/short dash/dot borders, rectangle radius, shadow color/alpha/offset/blur/spread | Complex shape rounding deferred |
| Color and typography | HSV wheel, HEX/RGB/alpha, recent16, local font choices | Desktop/image pixel eyedropper absent; system fonts can fall back |
| Copy/paste, undo/redo | Validated subtree IDs/assets/navigation, history tests | Internal clipboard, not OS clipboard |
| Canvas navigation | Zoom/pan, wheel isolation, Design/Preview behavior | Native input retest pending |
| Pages, docks and menus | Stacked pages, clipping, compact dock tabs, held click menus | Row/column redesign paused |
| Elements and icons | Search/accordions/density, 584 exposed presets, 536 unique icons, safe local SVG import | Local SVG subset, not all Canva assets |
| Working buttons and code export | State/action editing, Preview, offline HTML/CSS/assets and built React parity tests | Fixed coordinates are not responsive; native save-dialog acceptance pending |

Version 0.2.0 artifacts remain immutable in artifacts/live-website-checkpoint. 0.2.1 executable and installer were built at20:34:47UTC (4:34:47PM EDT), preserved in artifacts/fixed-canvas-checkpoint; Windows runtime acceptance is still unverified. No installer was executed.

## 0.2.2 verified authoring follow-up

116unit tests and16production browser workflows passed. Selection frame follows live drag; corner circles/side pills; live HSV/RGB/alpha+Enter with groupedUndo; outlineNone and persistent bordercolor control; four layer-stacking commands; four nearest-neighbor/page-edge spacing boxes with crossing rejection; resizepeeredge/center snapping; cross-axis equalgap matching during movement and resize. Guide colors softblue/charcoal/white. Complex-vector corner rounding, group scaling, full responsive layout and pixel eyedropper remain deferred. Windows package being produced; native acceptance still requires a later supported GUI test.

## 0.2.4 final acceptance

All27current production Chrome workflows passed, including exact supplied logo/favicon loading, stable controls on selection/deselection, fullsearchfocus, Design/Previewmiddlepan fromhandles, no-shift workspace errortoast, ultrawideUndo, contiguouspagestack, page-sideactions/lastDeleteomission, and prior authoringfeatures. Focused lock-destination regression now passes. Finalunitrun/releasebuildfollow; nativeGUIremainsunverified.

Final package available: artifacts/forma-0.2.4/UNIO-Forma-0.2.4.exe and UNIO-Forma-0.2.4-Setup.exe, built2026-10-22 5:39:42PMEDT. Manifest recordsSHA256/size/UTC. Final127unit+27browserpassed; nativeGUI/installerexecutionunverified, recoveryuntouched. SuppliedFormaheaderlogo/favicon/nativeicon included. Earlier versions preserved.
