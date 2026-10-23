# Continue developing Forma

## Clone and run the browser editor

Install Node.js 24 and the pnpm version listed in `package.json` (11.25.0).

```powershell
git clone https://github.com/Salvadoralarconl/Forma-by-UNIO.git
cd Forma-by-UNIO
pnpm install --frozen-lockfile
pnpm dev
```

Open the localhost address printed by Vite. The editor and its local project files work without an account or API key.

## Windows desktop development

Install the Rust MSVC toolchain (the minimum Rust version is in `src-tauri/Cargo.toml`) and Visual Studio Build Tools with **Desktop development with C++**, the MSVC x64/x86 tools, and Windows SDK. Then run:

```powershell
./scripts/Test-NativePrerequisites.ps1
pnpm desktop:dev
```

To build the executable and NSIS installer:

```powershell
pnpm desktop:build
```

Outputs are `src-tauri/target/release/unio-forma.exe` and `src-tauri/target/release/bundle/nsis/`. These generated files are intentionally not committed.

If the pnpm script wrapper tries to reinstall an already installed dependency tree, the equivalent direct build is:

```powershell
node node_modules/typescript/bin/tsc --noEmit
node node_modules/vite/bin/vite.js build
node node_modules/@tauri-apps/cli/tauri.js build --config '{"build":{"beforeBuildCommand":"node node_modules/typescript/bin/tsc --noEmit && node node_modules/vite/bin/vite.js build"}}'
```

## Checks

```powershell
pnpm test
pnpm build
cargo test --locked --manifest-path src-tauri/Cargo.toml
```

Browser tests require Google Chrome. Build first, then run selected Playwright suites. `e2e/layout.spec.ts` covers the paused row/column redesign and is not part of current acceptance. The demo suite writes example artifacts; run it deliberately.

## What is included

- React/TypeScript editor, Rust/Tauri desktop shell, lockfiles, tests and documentation.
- Forma logos and native icon resources.
- Editable `.forma` examples and an exported sample website in `examples/`.

Dependency caches, local recovery snapshots, build tools, test output and installers stay outside Git. Save your own designs as `.forma` files and transfer those separately; automatic recovery is local to each computer.

The latest source checkpoint is 0.2.4. See `docs/acceptance-matrix.md` and `docs/verification.md` for tested behavior and remaining limits. Browser tests and successful packaging do not establish native GUI or installer acceptance.
