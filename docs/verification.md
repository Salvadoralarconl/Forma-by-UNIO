# Forma0.2 verification — October22,2026

## Current evidence

- Production TypeScript/Vite build passed. Build emits a chunk-size advisory; this is an offline bundled editor, not a runtime fetch.
-90tests in19Vitest files passed. Includes real add-command insertion for every589registry preset (584exposed), aggregate archive roundtrip, geometry/import/paint security, gestures/selection/resize, menus, recovery, semantic actions and source export.
-24production Chrome workflows passed across buttons/website/placement/density/menus/icons/creation/workspace/foundation/demo. Explicitly excluded e2e/layout.spec.ts while row/column semantics remain paused.
-4Rust filesystem tests passed on Windows: bounded reads, atomic replacement, failure preserving previous bytes, and temporary-file cleanup. ZIP export uses the same atomic writer after a scoped save dialog; its GUI flow remains unverified.
-Independent exported React/Vite source built without downloading dependencies, using the existing local dependency installation. Headless Chrome checked standalone and built-source geometry, hover/pressed/focus styling, anchor action, escaped text, shapes/icon paints and a local raster. A UI workflow created a blank free page, customized a button, previewed it, exported ZIP and opened its actual offline HTML.

## Workspace and data behavior

Browser tests verify oversized free objects do not expand page/workspace/dock bounds; legacy flow content may grow while shell/docks remain stable. Free pages have explicit dimensions and clipping. Shrinking a page preserves object frames; its bottom handle intentionally changes height and supports undo. All8object resize handles, opposite anchors, corner proportions/side stretching/ratio lock, drop coordinates on stacked pages, selection/align, gesture undo/cancel and compact list/grid insertion have targeted coverage. Multi-selection group scaling/grouping and nested flow alignment remain deferred.

Review findings fixed: mutually overlapping/hover menus; stale gesture DOM after undo; populated free-page root switched to fit; imported icon drop coordinates; icon paint loss; nested interactive insertion; clipboard navigation references; archived targets; exported state CSS precedence and icon color.

## Native status

The user later explicitly resumed desktop permission. The existing19:11accordion executable launched and exposed a native window, but capture failed with FrameArrived timed out. Fresh selection/activation and the one allowed retry failed with window capture timed out. No editing input followed. A photo relayed by the parent showed an unresolved recovery dialog; it remains untouched. Await a changed/maximized state before further capture. The generated180-layer demo was created/tested through code and headless UI, not visibly hand-built in native Forma.

Native titlebar controls, dialogs, current interactive behavior, installed-app close/reopen/recovery, external link opening and installer execution are not accepted by these browser tests. Prior compact/creation/accordion checkpoint copies remain preserved. No current release was launched or installed as part of packaging.

## Artifacts

Current0.2release packaging is in progress; final paths/timestamps/SHA256 follow after exit0. The previous stable accordion copy is artifacts/accordion-checkpoint (built19:11:38UTC/3:11:38PM ET) and does not contain later free-placement, semantic buttons, icon packs or export.

## Completed 0.2.0 package

Tauri release and NSIS packaging exited 0. Built 2026-10-22 20:12:11 UTC (4:12:11 PM EDT). Preserved artifacts/live-website-checkpoint/UNIO-Forma.exe (9780736 bytes, SHA256 D3D15061DB2F28550B81BC3867FE225523A3801B2B0AAF4B81E29B8E21E9100E) and UNIO-Forma-Setup.exe (2247900 bytes, SHA256 8053FD68E9A6077BE7936D5BEDCD534F0391A20E0AAEBF0A1F547CAAA01C45BE). Full manifest beside them. Used installed Tauri CLI with .superpowers/release-direct-build.json, whose beforeBuildCommand runs installed TypeScript and Vite directly. The pnpm wrapper had attempted dependency reinstall and stopped on no-TTY; no dependency purge or policy bypass occurred.

After the user reported Forma visible, fresh Windows inventory exposed only Chrome Forma, no native Forma window. Capture of that returned Chrome window reported minimized. No editing input or recovery action followed; no permission request is pending. New binaries remain unlaunched/uninstalled.

Follow-up in progress: bound legacy flow artboards and default fresh startup to free placement, preserving old content and 0.2.0 package. Earlier legacy-flow autoheight evidence above describes 0.2.0, not a verified follow-up fix.

## 0.2.1 follow-up, verification in progress

Windows HTML5 dragging: explicit main-window dragDropEnabled=false corrects Tauri/WebView2 interception. Installed CLI schema and official Tauri configuration documentation confirm this is required. Targeted test reproduced missing setting then passed. This is configuration evidence, not native drag acceptance.

Fresh startup now uses the same free1440×780 format2 canvas as New. Every editor/Preview/export visible page is bounded and clipped. Legacy layoutMode/tree/styles/content are preserved; resizePage changes only page.height for legacy flow, with undo/archive roundtrip. Initial legacy viewport uses page.height, root height, root minHeight,780 fallback; minimum100. Layers retain offpage content, bottom page handle reveals it. The supplied legacy landing page initially clips to its1100px root minHeight; its full content remains in the original archive. No automatic free conversion or deletion.

Live equal-gap snapping/labels join existing edge/center guides for perpendicular-overlapping neighbors. Uses6/zoom tolerance, start-relative movement, final-overlap recomputation after simultaneous snaps, and suppression after page clamp. Group scaling, complex radius, full responsive generation remain deferred.

Actual production-browser legacy Open fixture, pointer bottom-right handle resize, numeric stress, isolated IndexedDB recovery, save/reopen and intentional page height checks passed in14 targeted tests. Export React source independently built again after shared height-helper inclusion. Final unit/browser runs and native package timestamp follow. Desktop input remains stopped by physical Escape. No newly built binary or installer launched.

## Completed 0.2.1 Windows package

Release+NSIS build exited0 at2026-10-22 20:34:47UTC (4:34:47PM EDT). Preserved separate artifacts/fixed-canvas-checkpoint/UNIO-Forma-0.2.1.exe:9781760bytes, SHA256352A39443C064BCD669E5E1D6E522A1360B479B0CDF19B7520C334354AC5700D. Installer UNIO-Forma-0.2.1-Setup.exe:2249917bytes, SHA2569F2988332204B5820233C141B4872DF167B6ED1E194389B6BB55CBF710533456. manifest.json beside them.0.2.0 files preserved unchanged.

25 current production Chrome workflows passed across combined run24passing and a successful isolated equal-gap retry. Its first navigation failed during the release beforeBuildCommand briefly rewriting dist, before any app action. Real Open/recovery legacy resizing, explicit page bounds,8free handles, live gap indicators/commit/cleanup/Undo and HTML export passed. No native launch/install or GUI acceptance. Final unit run is serialized after build idle because the previous run passed102tests but independent export compilation timed out at30s under concurrent build load; final rerun result follows.

Final serialized unit verification:103tests in23files passed, including independent React/Vite export compilation and browser parity (29.36s total). TypeScript and production Vite passed. Browser25passed as described above. Native HTML5 drag remains pending actual GUI retest; config test does not establish native acceptance.

Current0.2.1 locked Windows Cargo test rerun:4storage tests passed,0failed. No GUI launched by these tests.

## 0.2.2 authoring changes (source complete; package pending)

- Moving free selections now receive live union bounds in their selection overlay, so no old square remains during a drag. Regression reproduced shape250px/overlay240px before fix, then checks live frame match plus Escape restoration.
- Circular corner handles, slim centered side handles, enlarged invisible hit areas. Legacy single handle circular too.
- HSV wheel/sliders, alpha and RGB changes update model/render live. Enter applies valid typed colors/numeric input. Live edits use explicit per-field history groups, guarded by node/command/history identity; Undo restores pre-session color. External value/Undo changes restart groups; button state fields remount by state. Invalid text remains draft until validated.
- Shape outline None/Solid/Long dashed/Short dashed/Dotted; border color stays configurable even with outline disabled. Existing thickness, rectangle radius, opacity, shadow settings retained. Four free-layer stacking buttons use sibling order, preserving positions and exported paint order.
- Top/Bottom/Left/Right spacing boxes reference nearest non-overlapping same-row/column visible neighbor, otherwise page edge. Changes move only selected object, reject impossible/offpage spacing, persist frames and undo. No automatic flow conversion.
- Guide palette changed from neon pink/purple to soft blue with charcoal/white measurement labels.
- Pointer resize snaps moving sides/corners/centers to peer/page references through existing anchor/proportion/bounds rules,6screen-pixel tolerance. Guides validate actual snapped geometry and clear on commit/cancel.

Desktop control remains stopped after physicalEscape. No native launch/input in this follow-up. Prior0.2.1 packages preserved. Native runtime remains unverified; production-browser pointer/Inspector regression results follow after completion.

Cross-axis gap follow-up integrated into movement and anchored resize: nearby horizontal20px reference -> vertical20px actual gap, linked pair annotations. Final geometry, perpendicular overlap, occupied reference/actual gap and page-clamp validation suppress misleading labels. Bounded32nearby references within256design pixels. Targeted resize/spacing/cross-axis tests passed; production pointer verification and package follow.

Final0.2.2 source verification:116unit tests in27files passed, including generated React build/browser parity.16production Chrome workflows passed covering cross-axis movement+resize matching gaps, resize edges/anchors/corners, live selection bounds/Escape, new handles, live color/Enter/groupedUndo, stacking order, spacingboxes/Enter/Undo, legacy bounds/recovery and existing creation workflows. TypeScript/Vite passed. Release+NSIS build in progress. Prior0.2.1four Windows storage tests remain green; no Rust storage implementation changed in0.2.2. No current native GUI or installer acceptance claimed.

## 0.2.2 archived package

Built21:09:20UTC/5:09:20PMEDT, preserved artifacts/shape-editing-checkpoint/UNIO-Forma-0.2.2.exe (9784320bytes SHA C7DF767ED55E85B22805AEC101B29808516087B520700D5D74F7A8D7FA50C488) and setup (2256190bytes SHA FCC7A2A8B9FD973BF45B6F9800CAEC16299445C03B6D7CA4CC5FC12F73990EB1). Not launched/installed. User continued with toolbar, nonselectable labels and pagecorner insets; these later changes are version0.2.3, pending final package.

## 0.2.3 selection and edge refinements

Portal toolbar follows active selection at screen scale within canvas viewport, with icon Lock/Unlock, Duplicate, Delete and More. Requested More actions plus Paste style use existing commands and appearance-only clipboard. Copy style excludes geometry/layout/content/actions and deepclones nested style data. CtrlAltC/V shortcuts available; typing fields retain native shortcuts. Locked/multiselection unsupported mutations disabled; root pages omit toolbar. Menu click-held, keyboard arrows/Home/End/Escape, outside dismissal. Theme matched existing compact shell: flat#353535,3pxcorners,subtleborder/shadow,compactspacing.

Equalpagecornerinsets show only within64screenpxbothsides, snapwithin6px. Actual final pagegap geometry is rebuilt and compared after move/resizeconstraints; middlepage no guides. Allfourcorners supported; incompatible proportionalresize suppresses impossible guides. Measurement labels user-select:none and Webkit variant; pointerevents:none.

Initial19productionbrowser run18passed; toolbar test failed only because unscoped Layer locator matched both application Layer and selection Layer. Scoped to Selection menu; final rerun follows. Focused source review found no blocking defect; earlier spacingcrossing issue has been fixed by rejecting a changed nearest-gap result.

## 0.2.4 workspace and page controls

Empty page/darkworkspace left clicks clear selectedIds and hide object handles/toolbar; property/toolbar clicks preserve selection. Delete ignores empty or page-root selection. Elements focus outlines full search wrapper; icons centered in More toolbar. Middle-buttoncapture pans both Design and Preview, including from a resize handle, preserving selection/geometry. Preview normal wheel scroll remains available.

All visible pages join directly at a1pxoverlayseparator with fixed scaled wrapper height. Headings/captions/height handles/page-sidecontrols do not contribute flow height. Onlyfinalvisiblepage hasAddpage. Userapprovedbottomcontrolsposition retained; selection/deselection regression compares exactbounds.

Page-side moveup/down,Hide,Lock/Unlock,Duplicate,Delete. Deleteomittedwithonevisiblepage; Hidedisabled. Hideusesarchive andRestoreinLayers. Duplicatecloneswholepage/tree withfreshIDs, remapsinternalselfpage/sectiontargets, keepssize/frames/assets andactivatescopy; Undo/restoredarchive tested. Lockedpageguardschildmutations,gestures/resize/style,widthchanges anddeletion. Existinghistorykeepsundos.

Errormessage nowabsoluteinsideDesignworkspace, translucentbrownrgba(.82)andblur, dismissible; cannotpushworkspace/docks/pagecontrols. NegativeXfailure browsercheckcomparEsexactgeometry. Ultrawide2560option added. Design widthpresets updatecanonicalactivepagewidth withUndo; Previewwidthchangesareviewonlyandnotpersisted. Resizingwidthclipsretainedcontentratherthanrescalingframes; noresponsivegenerationclaim.

26productionChrome workflows passed on integrated0.2.4source. Fullunitsrunning; releasepackaging follows. Prior0.2.3package21:19:47UTC preservedinartifacts/selection-toolbar-checkpoint withmanifest. No nativeGUI/installeracceptance.

Branding follow-up: user's supplied white emblem copied unchanged to public/forma-logo.png for header/dialogs; rounded-square PNG copied unchanged to public/forma-app-icon.png for browser favicon. Installed Tauri icon generator converted the rounded-square source to native icon.ico/PNG sizes with contain fit (transparency padding, no artwork redesign). Generated128px native icon visually inspected. Native resource package pending rebuild.

Reviewed locked-destination nesting defect fixed: common command ancestry guard now checks both source node and destination parent ancestry, preventing cross-page moves into unlocked nested containers on a locked page. New regression failed before fix and passed after. No original project modified by failed commands.

Final0.2.4 unit verification:127tests in30files passed, including independent generated React/Vite build and rendering parity.27productionChrome workflows passed. TypeScript/Vite passed. Native release+NSIS build now running with suppliediconresources. No native GUI/input/installer execution; desktopcontrol remains stopped byphysicalEscape. Recovery untouched. Earlier4WindowsRuststorage tests were green; storageimplementation unchanged.

## Completed 0.2.4 package — October22,2026

Tauri release+NSIS exited0. Built21:39:42UTC /5:39:42PMEDT. Preserved artifacts/forma-0.2.4/UNIO-Forma-0.2.4.exe (10845696bytes, SHA25668984EF47AE35D05DBC023E21C46EA42685D561396702635828772565BF3BD82) and UNIO-Forma-0.2.4-Setup.exe (3331941bytes, SHA256C12947666D77A64B1A2D581B76B9026D29D4BF711CCA7F7F3C1C91E32D143C31). manifest.json beside them. All earlier checkpoint copies retained.

Final evidence:127unit tests30files,27productionChrome workflows, TypeScript/Vite and native release/installer packaging passed. GeneratedReactsource independently builds and matchesstandalone render. No newer source changes afterverification. EarlierWindowsstorage4tests passed; storagecodeunchanged. Newbrandresourcesconvertedfromusersuppliedimages andvisuallychecked128pxicon. No executablelaunch, installerexecution, nativeGUIretake or recoveryaction. Browserverification is not nativeGUIacceptance.
