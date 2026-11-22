[CmdletBinding()]
param()
$ErrorActionPreference = 'Stop'
$copyRoot = [IO.Path]::GetFullPath($PSScriptRoot).TrimEnd('\')
$manifestPath = Join-Path $copyRoot 'korean-source-manifest.json'
if (-not (Test-Path -LiteralPath $manifestPath)) { throw '한국어 실행본 폴더의 복원 스크립트를 사용하세요.' }
$manifest = Get-Content -LiteralPath $manifestPath -Raw -Encoding UTF8 | ConvertFrom-Json
$protectedRoot = [IO.Path]::GetFullPath([Environment]::ExpandEnvironmentVariables($manifest.installationRoot)).TrimEnd('\')
if ($copyRoot.Equals($protectedRoot,[StringComparison]::OrdinalIgnoreCase) -or $copyRoot.StartsWith($protectedRoot + '\',[StringComparison]::OrdinalIgnoreCase)) { throw '설치된 원본 경로에서 실행할 수 없습니다.' }
$resources = Join-Path $copyRoot 'resources\app'
$backup = Join-Path $copyRoot 'korean-original-files'
if (-not (Test-Path -LiteralPath $backup -PathType Container)) { throw '한국어 실행본 폴더에 있는 복원 스크립트를 실행하세요.' }
$active = @(Get-Process -Name GitHubDesktop -ErrorAction SilentlyContinue | Where-Object { $_.Path -and $_.Path.StartsWith($copyRoot + '\',[StringComparison]::OrdinalIgnoreCase) })
if ($active.Count -gt 0) { throw '한국어 실행본을 종료한 후 다시 실행하세요.' }
foreach ($name in @('main.js','index.html','package.json')) {
    $actual = (Get-FileHash -LiteralPath (Join-Path $backup $name) -Algorithm SHA256).Hash.ToLowerInvariant()
    if ($actual -ne $manifest.sourceHashes.$name) { throw "복원 백업 검증 실패: $name" }
}
foreach ($name in @('main.js','index.html','package.json')) { Copy-Item -LiteralPath (Join-Path $backup $name) -Destination (Join-Path $resources $name) -Force }
Write-Host '복사본의 한국어 패치만 해제했습니다. 설치된 원본은 변경하지 않았습니다.'
