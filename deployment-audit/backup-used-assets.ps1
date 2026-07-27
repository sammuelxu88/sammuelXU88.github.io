param(
  [string]$Destination = (Join-Path $PSScriptRoot ("used-assets-backup-" + (Get-Date -Format "yyyyMMdd-HHmmss")))
)

$projectRoot = Split-Path $PSScriptRoot -Parent
$publicRoot = Join-Path $projectRoot "public"
$manifest = Import-Csv (Join-Path $PSScriptRoot "used-assets-manifest.csv")

New-Item -ItemType Directory -Force -Path $Destination | Out-Null
foreach ($item in $manifest) {
  $relative = $item.path.TrimStart("/").Replace("/", "\")
  $source = Join-Path $publicRoot $relative
  $target = Join-Path $Destination $relative
  New-Item -ItemType Directory -Force -Path (Split-Path $target -Parent) | Out-Null
  Copy-Item -LiteralPath $source -Destination $target -Force
}

Copy-Item -LiteralPath (Join-Path $projectRoot "content\projects.json") -Destination (Join-Path $Destination "projects.json") -Force
Copy-Item -LiteralPath (Join-Path $PSScriptRoot "used-assets-manifest.csv") -Destination $Destination -Force
Write-Output "Backup saved to: $Destination"
