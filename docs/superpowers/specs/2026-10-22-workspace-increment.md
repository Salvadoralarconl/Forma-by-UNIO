# Workspace creation increment — October 22, 2026

This extends the approved foundation in response to the user's subsequent direct requests, relayed by the overseeing chat. It remains a native Windows desktop application.

## Separate acceptance tracks
- Foundation: local project/archive/recovery/history model and Rust disk safety tests.
- Native release: executable and NSIS installer compilation; installed/native workflow acceptance is separate.
- Compact shell: dark Photoshop-style chrome, tools left, canvas central, native title-bar controls matching the app; top-left Forma/BY UNIO toolbar logo removed per user.
- Layout/navigation: explicit nested rows/columns; Backspace outside typing/modal contexts; wheel zoom without modifiers over canvas; middle-button pan with capture/cancel/focus-loss cleanup. Side-panel scrolling remains normal.
- Elements/shapes: searchable click/drag palette, text presets, raster import, rectangles/ellipses, editable fill/outline/shadow, per-container visual offsets and resize. Flow structure remains authoritative; visual offsets preserve a layer's flow slot. This is a bounded addition, not arbitrary absolute-position layouts replacing web structure.
- True union: polygon-clipping (MIT) produces one normalized editable vector outline, retaining disjoint pieces as one compound shape; ellipse outlines use 96 segment approximations. Exactly two unlocked, visible sibling shape nodes are supported. The selected shape keeps its stable ID and styles; the other is removed; undo restores both. The result occupies the earlier source flow slot and preserves the visual union origin. Other element kinds and cross-parent unions fail without changing the project.
- Workspace docking: Elements, Properties and Layers & Pages can be hidden, shown, moved left/right and resized. Multiple panels occupy the same dock with keyboard-operable tabs; switching retains panel state. Dock arrangement, widths and active tabs live in local workspace preferences, excluded from .forma. Reset Workspace restores defaults. No floating OS windows or fake future panels.

## Validation
Domain, archive, UI and headless browser tests cover the extension. All source changes require a refreshed standalone release and installer; earlier 0.1.0 checkpoint artifacts do not prove these additions are included. Native screenshot/input testing was stopped via Escape, then later explicitly authorized, and is now held again at the user's request while they close Forma. Do not relaunch, focus or control the live app until the user is ready. Continue noninteractive tests/builds; preserve all user projects/recovery.
