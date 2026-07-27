param([switch]$NoOpen)

$ErrorActionPreference = "Stop"

$projectDirectory = Split-Path -Parent $MyInvocation.MyCommand.Path
$siteUrl = "http://127.0.0.1:3000/"
$npmPath = "C:\Program Files\nodejs\npm.cmd"
$logDirectory = Join-Path $projectDirectory ".logs"
$stdoutLog = Join-Path $logDirectory "portfolio-server.log"
$stderrLog = Join-Path $logDirectory "portfolio-server-error.log"

function Test-PortfolioServer {
  try {
    $response = Invoke-WebRequest -UseBasicParsing -Uri $siteUrl -TimeoutSec 2
    return $response.StatusCode -ge 200 -and $response.StatusCode -lt 500
  } catch {
    return $false
  }
}

if (-not (Test-PortfolioServer)) {
  New-Item -ItemType Directory -Force -Path $logDirectory | Out-Null

  if (-not (Test-Path -LiteralPath $npmPath)) {
    Add-Type -AssemblyName PresentationFramework
    [System.Windows.MessageBox]::Show(
      "Node.js was not found. Please reinstall Node.js before starting the portfolio.",
      "Portfolio startup failed",
      "OK",
      "Error"
    ) | Out-Null
    exit 1
  }

  Start-Process `
    -FilePath $npmPath `
    -ArgumentList @("run", "dev") `
    -WorkingDirectory $projectDirectory `
    -WindowStyle Hidden `
    -RedirectStandardOutput $stdoutLog `
    -RedirectStandardError $stderrLog

  $deadline = (Get-Date).AddSeconds(60)
  while ((Get-Date) -lt $deadline) {
    Start-Sleep -Milliseconds 700
    if (Test-PortfolioServer) { break }
  }
}

if (Test-PortfolioServer) {
  if (-not $NoOpen) { Start-Process $siteUrl }
  exit 0
}

Add-Type -AssemblyName PresentationFramework
[System.Windows.MessageBox]::Show(
  "The website did not start within 60 seconds. Check the .logs folder in the project directory.",
  "Portfolio startup failed",
  "OK",
  "Error"
) | Out-Null
exit 1
