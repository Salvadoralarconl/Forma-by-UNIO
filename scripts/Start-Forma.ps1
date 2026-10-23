$ErrorActionPreference = 'Stop'
$formaRoot = Split-Path -Parent $PSScriptRoot
Set-Location -LiteralPath $formaRoot
$formaNodeCommand = Get-Command node -ErrorAction SilentlyContinue
if ($formaNodeCommand) { $formaNode = $formaNodeCommand.Source }
else {
    $formaNode = Join-Path $env:USERPROFILE '.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe'
    if (-not (Test-Path -LiteralPath $formaNode)) { throw 'Install Node.js 24, then run pnpm install and pnpm dev.' }
}
if (-not (Test-Path -LiteralPath (Join-Path $formaRoot 'dist/index.html'))) {
    throw 'Build the frontend first with pnpm build. See README.md.'
}
Write-Host 'UNIO Forma browser preview: http://127.0.0.1:1420'
Write-Host 'Keep this terminal open. Press Ctrl+C to stop.'
& $formaNode 'node_modules/vite/bin/vite.js' preview --host 127.0.0.1 --port 1420 --strictPort
exit $LASTEXITCODE
