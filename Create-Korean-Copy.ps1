[CmdletBinding()]
param(
    [string]$Destination = (Join-Path $PSScriptRoot 'GitHubDesktop-Korean-3.7.0-v0.4'),
    [switch]$ValidateOnly
)
$ErrorActionPreference = 'Stop'
$manifest = Get-Content -LiteralPath (Join-Path $PSScriptRoot 'manifest.json') -Raw -Encoding UTF8 | ConvertFrom-Json
$protectedRoot = [IO.Path]::GetFullPath([Environment]::ExpandEnvironmentVariables($manifest.installationRoot)).TrimEnd('\')
$source = Join-Path $protectedRoot 'app-3.7.0'
$destinationFull = [IO.Path]::GetFullPath($Destination).TrimEnd('\')
if ($destinationFull.Equals($protectedRoot,[StringComparison]::OrdinalIgnoreCase) -or $destinationFull.StartsWith($protectedRoot + '\',[StringComparison]::OrdinalIgnoreCase)) {
    throw '설치된 GitHubDesktop 폴더에는 적용할 수 없습니다.'
}
if (-not (Test-Path -LiteralPath $source -PathType Container)) { throw "원본 3.7.0을 찾지 못했습니다: $source" }
if (Test-Path -LiteralPath $destinationFull) { throw '대상 폴더가 이미 있습니다. 덮어쓰지 않습니다. 다른 경로를 지정하세요.' }
$node = (Get-Command node -ErrorAction Stop).Source
$sourceResources = Join-Path $source 'resources\app'
function Assert-OriginalHashes {
    foreach ($property in $manifest.sourceHashes.PSObject.Properties) {
        $actual = (Get-FileHash -LiteralPath (Join-Path $sourceResources $property.Name) -Algorithm SHA256).Hash.ToLowerInvariant()
        if ($actual -ne $property.Value) { throw "원본 버전 또는 파일이 다릅니다: $($property.Name)" }
    }
}
Assert-OriginalHashes
if ($ValidateOnly) {
    $resources = Join-Path $destinationFull 'resources\app'
    New-Item -ItemType Directory -Path $resources -Force | Out-Null
    foreach ($name in @('main.js','renderer.js','index.html','package.json')) {
        Copy-Item -LiteralPath (Join-Path $sourceResources $name) -Destination (Join-Path $resources $name)
    }
} else {
    Write-Host '원본을 읽어 별도 실행본을 복사합니다. 약 641MB의 공간이 필요합니다.'
    Copy-Item -LiteralPath $source -Destination $destinationFull -Recurse
}
& $node (Join-Path $PSScriptRoot 'patch-copy.cjs') $destinationFull
if ($LASTEXITCODE -ne 0) { throw '검증 또는 패치에 실패했습니다. 원본은 수정되지 않았습니다.' }
Assert-OriginalHashes
Copy-Item -LiteralPath (Join-Path $PSScriptRoot 'Restore-Copy.ps1') -Destination (Join-Path $destinationFull 'Restore-Copy.ps1')
Copy-Item -LiteralPath (Join-Path $PSScriptRoot 'manifest.json') -Destination (Join-Path $destinationFull 'korean-source-manifest.json')
if (-not $ValidateOnly) {
    $previousProfile = Join-Path (Split-Path $destinationFull -Parent) 'GitHubDesktop-Korean-3.7.0-v0.4\korean-user-data'
    if (Test-Path -LiteralPath $previousProfile -PathType Container) {
        $profileJson = @{userDataPath=$previousProfile} | ConvertTo-Json
        [IO.File]::WriteAllText((Join-Path $destinationFull 'korean-profile.json'),$profileJson,(New-Object Text.UTF8Encoding($false)))
        Write-Host '이전 v0.3 한국어판 설정을 재사용합니다. v0.3을 종료한 뒤 새 실행본을 여세요.'
    }
    $launcher = "@echo off`r`ncd /d `"%~dp0`"`r`nstart `"GitHub Desktop Korean`" `"%~dp0GitHubDesktop.exe`"`r`n"
    [IO.File]::WriteAllText((Join-Path $destinationFull 'Start-Korean.cmd'),$launcher,[Text.Encoding]::ASCII)
    Write-Host "완료: $destinationFull"
    Write-Host 'Start-Korean.cmd를 실행하세요. 원본 설치와 설정은 변경하지 않았습니다.'
} else {
    Write-Host '복사본 정적 검증 완료. 앱을 실행하거나 설치된 원본을 변경하지 않았습니다.'
}
