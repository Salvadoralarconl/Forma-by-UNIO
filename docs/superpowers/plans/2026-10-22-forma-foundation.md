# UNIO Forma Foundation Implementation Plan

> **For agentic workers:** Use superpowers:executing-plans to implement this plan task-by-task. Execution in this session is authorized by the user.

**Goal:** Deliver an offline visual editor foundation with recoverable portable projects and a Tauri Windows shell.
**Architecture:** One validated domain model feeds the editor and preview. Pure document commands and history are separate from session state; an archive codec and platform adapter isolate disk access.
**Tech Stack:** React, TypeScript, Vite, Zod, fflate, Vitest, Tauri 2/Rust, Tauri dialog plugin.
**Spec:** docs/superpowers/specs/2026-10-22-forma-foundation-design.md

## Global Constraints
- Windows first, offline, no account or API key.
- Stable IDs; editor chrome and session state never enter portable projects.
- Local .forma archives with project.json and relative assets; validate before use.
- Atomic native saves, separate recovery snapshots, actionable errors.
- Do not claim a native executable or installer without producing one.
- Later responsive, token, generator, interaction, motion and handoff modules consume the same domain model.

## Review Focus
- Duplicate IDs, cycles, orphan children and missing image assets must fail validation (Task 1/2).
- Paths with spaces and Unicode remain portable; traversal archives fail (Task 2).
- An interrupted or failed save must preserve the last valid file and keep the editor dirty (Task 2/4).
- Undo after image insertion must not produce broken asset references (Task 1/2).
- Pending autosave or open operations must not overwrite a newly opened document (Task 3/4).

### Task 1: Domain and command history
Files: package.json, tsconfig.json, vite.config.ts, src/domain/{model,commands,history}.ts, tests/domain.test.ts.
Interfaces: createProject(name): Project; validateProject(input): Project; applyCommand(project, command): Project; History holds past/present/future and execute/undo/redo.
- [x] Write tests for nested insertion, cycle prevention, subtree deletion, reorder, immutable history and image undo.
- [x] Run tests and observe missing behavior failures.
- [x] Implement schema v1 with pages/nodes/assets, extensible metadata for later stages, safe styles and bounded project size.
- [x] Run all domain tests and TypeScript check.

### Task 2: Portable archives and recovery
Files: src/persistence/{archive,platform,recovery}.ts, tests/persistence.test.ts.
Interfaces: encodeProject(Project): Uint8Array; decodeProject(bytes): Project; Platform open/save/readRecovery/writeRecovery; recovery candidate contains project, source path and capture time.
- [x] Test image byte round trip, Unicode names, invalid JSON/schema, missing assets, unsafe paths and size limits.
- [x] Observe failures, implement bounded ZIP codec with fflate and schema validation.
- [x] Test recovery timestamp selection and stale write exclusion; implement recovery coordinator.
- [x] Run complete test suite and TypeScript check.

### Task 3: Working visual workspace
Files: src/editor/{App,Canvas,Layers,Inspector,dialogs}.tsx, src/editor/useEditor.ts, src/styles.css, src/main.tsx, index.html, tests/editor.test.tsx.
Interfaces: editor commands consume Task 1; canvas and preview consume Project and asset URL map; session selection and zoom stay external.
- [x] Write UI tests for canvas/layer selection, text editing, nested insertion, undo/redo and preview without editor overlays.
- [x] Observe failures and implement workspace, project actions, properties, page controls, zoom and keyboard shortcuts.
- [x] Add explicit save/dirty state, recovery prompt, unsaved operation guards, visible errors and local workspace preferences.
- [x] Run UI/domain/persistence suite and production frontend build; exercise browser flows.

### Task 4: Desktop persistence and verification
Files: src-tauri/{Cargo.toml,build.rs,tauri.conf.json,capabilities/default.json,src/{main,lib,storage}.rs}, scripts/*, README.md, docs/verification.md.
Interfaces: native commands choose paths through dialogs and return archive bytes; writes use a same-directory temporary file, sync and atomic Windows replacement. Recovery resides in application data; desktop close is guarded in the frontend.
- [x] Write Rust tests for replacement and failed-write preservation using real temporary directories.
- [x] Implement native storage commands with bounded file sizes and authorized dialog-selected paths.
- [x] Attempt native tests/build and record precise blockers. Initial build failed without Cargo; after Rust installation tests stopped at missing link.exe. Native check/build/acceptance remain pending MSVC/SDK.
- [x] Run browser end-to-end create/edit/save/reopen/recover/preview checks and inspect screenshots.
- [x] Review full change, fix material findings, rerun relevant checks and document actual artifact status.

## Execution notes
The user explicitly requested plan then build, so execution proceeds without another approval round. The repository is empty with an unborn master branch; use a codex/foundation branch in the current user-provided workspace. No separate checkout is needed. Do not install system-wide compilers or alter machine configuration implicitly. Native build availability is a verification result, not a reason to replace the desktop architecture.

## Actual execution status
Tasks 1–3 verified. Task 4 source, Rust test definitions, packaging configuration, frontend acceptance and documentation provided; native compilation and acceptance remain blocked. Git ref writes were denied, so no branch or commits were created. The user approved official prerequisites later; Rust installed successfully, Microsoft tools await administrator installation. The user chose source/browser verification for now.

