# UNIO Forma0.2.4

A local Windows visual website creator. Build pages with drag-and-drop elements, edit their appearance and button behavior, preview interactions, and export a runnable website with React/CSS source. No account, API key, hosted service or deployment is required.

## A complete first workflow

1. Choose New and create a blank project. New projects use free-placement pages. Existing flow projects remain unchanged; new blank projects use free placement.
2. Open Elements. Expand a category or search. Drag a shape, text, or button onto the page; the drop outline shows its position. Click to insert at the default location.
3. Shift-click or draw a selection box on empty page to select several. Position aligns left/center/right/top/middle/bottom against the selection or page;3+elements can distribute spacing. Move a selection together and snap to page/peer guides.
4. Resize through all4sides and4corners. Corners keep proportions; sides stretch unless aspect lock is on. Position fields edit the active element. Page height stays fixed until its bottom handle is dragged or keyboard-resized. Off-page content is clipped, preserved and accessible through Layers/Position or by enlarging the page.
5. Insert a Button preset. Change its label and choose Default/Hover/Pressed/Focus to edit color, shadow, scale, offset, duration and easing. Effects are supplied by default. Add an HTTP(S), page, or section action. Design edits; Preview interacts and scrolls like a website.
6. Save a portable .forma project. Export website downloads/saves a ZIP containing offline Open-preview.html, CSS/local assets, attribution and independently buildable React source. Unzip and open the HTML with no build. The source README explains npm/Vite commands for further development.

## Page backgrounds and movable panels

Click the paint-bucket control beside a page, or click empty page space, to open page background Properties. Choose a color or local raster image, adjust image fit/position, background opacity, image blur, frosted-glass blur and tint. These effects affect the background layer; page objects remain sharp and opaque. Transparent backgrounds show a checkerboard in Design. Glass blur softens what is behind the page. Background assets and effects travel with the .forma project and website export.

Drag an Elements, Properties or Layers tab to either panel column to dock it, or into the workspace to float it. Blue docking targets match each column's current width. Escape cancels a drag; placement is remembered on this device. Alt+Left/Right docks the focused tab and Alt+F floats it.

Double-click text or a button label to edit it in place. Click outside to save or Escape to cancel. Button Properties include font controls and individual corner radii. Free text resize handles scale the font and box together; button resizing stops at its label/icon dimensions.

## Included tools

Compact dark native shell; click-held menus with keyboard arrows/Escape; resizable tabbed Elements/Properties/Layers docks; canvas wheel zoom and middle-button pan in Design. Every category adapts to dock width: small tiles on wider docks and thumbnail/label lists on narrow docks. Search reveals matches across closed groups and clearing restores expansion state.

584 exposed presets:20Shapes,12Buttons,536uniqueIcons,6Text,4Cards,6Sections. Five Layout factories remain withheld pending the user’s row/column placement-space clarification. The icons comprise512distinct Lucide designs plus24new UNIO designs. UNIO filter57 includes33shared Lucide designs already referenced by Folio/UNIO; those are not counted twice. Help includes ISC attribution and the exact reference manifest.

Local SVG pack import supports individual/multiple monochrome SVG files, not ZIP/font/plugin packs. Strict path/basic-shape subset; no scripts, entities, handlers, external resources, foreignObject, transforms, gradients or text.32KiB/file,100files/512KiB per import,1–40paths/icon,400imported icons/2MB local library. Supported fill rules and stroke paint are preserved. Used geometry is embedded in .forma and exports, so projects do not require the installed library.

Appearance includes fill, overall opacity, borders (solid/long dash/short dash/dots), supported rectangle rounding, and shadow color/alpha/offset/blur/spread. Complex-shape rounding is disabled explicitly. HSV wheel supports pointer/keyboard, HEX/RGB, alpha and16recent colors. Layer-color swatches are an offline fallback, not a desktop/image-pixel eyedropper. Curated local font names may fall back when unavailable.

Internal Ctrl+C/Ctrl+V validates subtrees, creates fresh IDs, preserves/remaps navigation references and image assets. Undo/redo is bounded; gestures produce one command. Standard typing shortcuts remain with text fields. Local save/recovery uses bounded archives and native atomic replacement. Portable projects exclude local paths, workspace preferences and credentials.

## Compatibility and limits

New free/interactive projects use format2. Earlier strict readers reject unsupported fields/versions; they do not silently render them as flow. Existing format1 flow projects remain readable without automatic conversion. Keep an older file copy when retaining compatibility with old builds. All visible pages are fixed and clipped; resizing content cannot grow the page, editor or docks. Legacy flow trees remain intact. Initial legacy height uses saved page height, root height, root minimum height, then780px, with a100px minimum. Use the bottom page-height handle to reveal retained content. New projects and fresh startup use free placement.

Free coordinates and exported fixed page widths are **not responsive**. Breakpoint overrides, reusable design systems, arbitrary interaction timelines/data bindings and AI handoff are not yet implemented. Group resizing/grouping and alignment within nested flow compositions are deferred. Select two unlocked sibling shapes on a free page to merge them into one outline. Exterior rounded corners are preserved. Compatible flow shapes retain the existing union tool. No native GUI or installer acceptance is claimed from browser tests.

## Build and evidence

`pnpm test`, `pnpm build`, selected Playwright suites and `cargo test --locked --manifest-path src-tauri/Cargo.toml` verify the implementation. `pnpm desktop:build` produces the native executable and unsigned NSIS installer. Use the versioned checkpoint links and hashes in docs/verification.md. No installer is executed by the build.

examples/UNIO-Landing-Page.forma is an editable180-layer,9-section sample; its actual renderer screenshots are under docs/screenshots. examples/UNIO-Landing-Page-Website.zip is exported through the UI test. See docs/icon-sources.json for source attribution and docs/superpowers/specs/2026-10-22-canva-workflow-assessment.md for migration reasoning.

## Shape authoring in 0.2.2

Selection frames follow objects during drag. Corner resize handles are circles and side handles are slim bars. Pointer resize snaps to nearby peer edges/centers and shows live guides, preserving anchors and ratio rules. Matching gap guides can compare nearby horizontal and vertical spacing (for example20px between lower cards and20px below a top bar), during movement and resize. Reference search is local: up to32nearby peers within256design pixels. Guides use soft blue with charcoal/white labels.

Fill, text, border, shadow and button color controls update live from HSV/RGB/alpha. Enter commits typed values. Related live color changes form one Undo session until Apply/Enter/closing the picker or another edit. Shape outline options include None; border color can be prepared before enabling an outline. Rectangle rounding, opacity and shadow controls remain available. Complex vector rounding is still unsupported.

On free pages, Position layer order offers Bring to front, Send to back, Bring forward and Send backward. This changes stacking, not coordinates. Spacing Top/Bottom/Left/Right edits the selected object's gap to the nearest visible same-row/column neighbor or page edge. Invalid/offpage or peer-crossing gaps are rejected rather than silently producing a different nearest gap.

## Workspace and pages in 0.2.4

Click empty page/workspace space to deselect. Hold the middle mouse button and drag to pan in Design or Preview. The Elements search focus ring surrounds the whole field, and selection toolbar icons remain centered with More open. Errors appear as dismissible translucent workspace popups without shifting layout.

Pages stack directly with a thin boundary. Only the last page displays Add page; page-height handles stay anchored independently of selection. Side controls move, hide, lock, duplicate and delete pages. The final visible page has no Delete button. Restore hidden pages through Layers & Pages. Locks protect descendant edits; whole-page duplication preserves geometry and remaps internal links. Ultrawide2560joins Desktop/Tablet/Phone: presets resize the active Design page with Undo, while Previewwidthisviewonly.
