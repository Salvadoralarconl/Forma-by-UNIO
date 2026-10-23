$ErrorActionPreference = 'Stop'
$formaCargoDir = Join-Path $env:USERPROFILE '.cargo/bin'
if (Test-Path -LiteralPath $formaCargoDir) { $env:Path = $formaCargoDir + ';' + $env:Path }
foreach ($formaTool in @('rustc', 'cargo')) {
    if (-not (Get-Command $formaTool -ErrorAction SilentlyContinue)) { throw "$formaTool is missing. Install the official Rust MSVC toolchain." }
    & $formaTool --version
}
$formaVswhere = Join-Path ${env:ProgramFiles(x86)} 'Microsoft Visual Studio/Installer/vswhere.exe'
if (-not (Test-Path -LiteralPath $formaVswhere)) { throw 'Microsoft Visual Studio Build Tools are missing. Install Desktop development with C++, MSVC x64/x86 and the Windows SDK.' }
$formaVs = & $formaVswhere -latest -products '*' -requires Microsoft.VisualStudio.Component.VC.Tools.x86.x64 -property installationPath
if (-not $formaVs) { throw 'No Visual Studio instance contains the required MSVC C++ tools.' }
Write-Host "Visual Studio C++ tools: $formaVs"
Get-ChildItem -LiteralPath (Join-Path $formaVs 'VC/Tools/MSVC') -Directory | ForEach-Object {
    $formaLinker = Join-Path $_.FullName 'bin/Hostx64/x64/link.exe'
    if (Test-Path -LiteralPath $formaLinker) { Write-Host "Linker: $formaLinker" }
}
$formaSdk = Join-Path ${env:ProgramFiles(x86)} 'Windows Kits/10/Lib'
if (-not (Test-Path -LiteralPath $formaSdk)) { throw 'Windows SDK libraries are missing.' }
Write-Host "Windows SDK: $formaSdk"
