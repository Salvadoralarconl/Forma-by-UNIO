# UNIO Forma — Foundation design

Date: 2026-10-22
Source: UNIO_Forma_Application_Specification.docx supplied by the user.

## Intended outcome
Build a Windows-first, offline desktop studio for manually designing responsive websites and eventually exporting maintainable React and AI handoff packages. No account, cloud service, or AI key is required. This document scopes the first implementation stage; the remaining source milestones remain the product roadmap.

## Foundation scope
A React and TypeScript editor inside a Tauri desktop shell. The workspace uses warm off-white surfaces, blue accents, a top toolbar, left tools and layers, central canvas, and right properties. The first stage implements controls only where working behavior exists.

Users can create a project, add nested containers, text and local images, select layers through the tree or canvas, edit content and basic styles, move/reorder elements, delete, and undo/redo meaningful commands. Containers use document-flow layout. Image files are copied into project assets. A basic preview renders the same project model without selection overlays.

## Architecture
Separate serializable domain data, editor session state, command history, shared rendering, and platform persistence. Stable IDs identify project, pages, nodes, and assets. The project model is the authoritative source for later responsive rules, tokens, code generation, interactions, motion, and bindings. Temporary selection and gesture state never enter portable project data.

Use platform interfaces for native dialogs, filesystem access, and window lifecycle. Keep browser-compatible domain and rendering modules independent of Tauri. Validate data at the persistence boundary and reject unknown schema versions with an actionable error.

## Persistence and recovery
Use a versioned .forma archive containing project.json and relative assets. Save through a temporary file and replace the destination only after a complete successful write. Preserve the last valid file on failure. Maintain debounced recovery snapshots in application-local storage, separate from explicit saves. On launch offer recovery when a newer valid snapshot exists. Confirm unsaved exits. Opening projects never executes scripts. Validate archive paths, entry sizes, and asset references.

## Verification
Test command undo/redo, nested node operations, schema validation, persistence round trips including image bytes, invalid and traversal archives, failed saves, and recovery selection. Exercise the native app to create, edit, save, close, reopen, recover, and preview a project. Run TypeScript checks, domain tests, frontend build, Rust checks, and desktop build where installed prerequisites permit. Report separately whether a native executable or installer was actually produced.

## Later stages
2. Responsive layout, tokens, components, live generated code, independent runnable React export.
3. Accessible interactive components and visual behavior editing.
4. Motion presets and editable keyframe timelines, then advanced motion incrementally.
5. Dynamic sample data, annotations, and full AI handoff.
6. Authorized read-only connector and verified Windows release packaging.

## Assumptions and limits
The supplied visual direction and proposed desktop stack are acceptable defaults. The first stage targets this Windows machine for native verification; minimum supported Windows version and release installer choices will be established from current official framework requirements before packaging. Advanced panels and connector controls will not be represented as functional before their stages are implemented. No publishing, signing, remote sharing, or credential setup is included in foundation work.
