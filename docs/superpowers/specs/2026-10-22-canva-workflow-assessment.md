# Canva-style editing workflow: staged design assessment

User direction, October22,2026: freely drag shapes onto the page, use multiselection and alignment tools, retain offline Windows shell, wheel zoom and middle-button pan. Row/column placement-space redesign remains paused. Native capture is awaiting a changed/maximized window; a separate recovery snapshot must remain untouched.

## Current architecture and migration

The portable model is a tree of containers/text/images/shapes/icons. Container children currently render through CSS flex flow. Offsets are visual displacements after layout; inserting/reordering siblings can move other elements. They cannot reliably represent Canva-style independent page coordinates. Selection currently stores one node ID; resize/drag overlays query rendered bounds. Undo already wraps one immutable command, and the shared renderer drives both editor and preview.

Introduce additive `layoutMode: free | flow` on container nodes and explicit local frames for children in a free parent. Absent layoutMode remains flow, so existing .forma projects render unchanged. New blank design pages can use free placement. Nested flow cards/sections remain supported as movable compositions. Never silently flatten or reposition old documents. Offer explicit conversion later only after measuring a page and showing a reviewable result. New frame fields need bounded validation, archive roundtrip coverage and shared rendering; no runtime scripts.

## First useful increment

1. Free-page shape insertion: drag a searched/expanded tile onto the intended page; show its final outline and a clear valid target. Store page-local coordinates calculated from that page's actual bounding rectangle and known zoom. Pan/scroll are already represented by the rectangle. Reject drops outside all pages. Preserve fresh IDs, style and selection and commit insertion as one undo action. Pointer anchoring is visible in the preview; define and test it consistently rather than substituting flow offsets. Existing flow pages retain legacy insertion until a user chooses a new free page.
2. Selection: shift-click toggles and drag on empty page draws a selection box. Keep selection within one page; exclude locked/hidden nodes and avoid selecting both ancestor and descendant for transforms. Clicking a group selects the composition; explicit drill-in can follow. An editor-session Set of IDs is separate from portable document state.
3. Position panel: align left/center/right and top/middle/bottom against selection bounds or page bounds; distribute horizontal/vertical spacing for3+ independent eligible siblings. Disable with a useful reason for incompatible nested flow selections rather than changing their structure. Apply all frame changes in one history command. Page placement/preview share the same bounded frames.
4. Guides: compare candidate edges/centers with page and eligible visible peers using a screen-pixel tolerance divided by zoom. Draw editor-only guides. Snap on drag, cancel cleanly, and produce one command on release. Locked nodes may be reference guides but cannot move. Native wheel/pan gestures stay separate.

Grouping, rotation and responsive/code-generation mapping follow after these foundations. Frames are a design surface abstraction; future responsive generation must deliberately translate them into semantic layout rather than claiming that absolute positions are responsive web output.

## Acceptance evidence required

Exercise exact drop preview/final coordinates at multiple zooms and pan offsets, on second stacked page, from search and after accordion toggles. Reject outside-page drop without history mutation. Check multiselection/locked nodes/selection rectangle; all6alignments against page/selection and both distributions; snap behavior, cancellation, one-step undo/redo; save/reopen and preview parity. Old flow archives must retain their rendered layout. Use headless workflows first; native GUI acceptance remains separate and requires usable capture.

No free-placement rewrite has been implemented as part of this assessment. Menu fix and icon-source/import work are separable checkpoints.
