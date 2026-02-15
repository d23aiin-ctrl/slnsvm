$ErrorActionPreference = "Stop"

$root = "D:\SMBH\slnsvm"
$backendWd = Join-Path $root "backend"
$frontendWd = Join-Path $root "frontend"
$backendOut = Join-Path $backendWd "backend.out.log"
$backendErr = Join-Path $backendWd "backend.err.log"
$frontendOut = Join-Path $frontendWd "frontend.out.log"
$frontendErr = Join-Path $frontendWd "frontend.err.log"
$pythonExe = "C:\Users\krish\miniconda3\envs\SM\python.exe"

# Stop stale dev servers
$procs = Get-CimInstance Win32_Process | Where-Object {
  ($_.Name -match "python|node|npm") -and (
    $_.CommandLine -like "*uvicorn app.main:app*" -or
    $_.CommandLine -like "*next dev -p 9000*" -or
    $_.CommandLine -like "*npm.cmd run dev*"
  )
}
foreach ($p in $procs) {
  Stop-Process -Id $p.ProcessId -Force -ErrorAction SilentlyContinue
}

# Fresh logs
foreach ($f in @($backendOut, $backendErr, $frontendOut, $frontendErr)) {
  if (Test-Path $f) {
    Remove-Item $f -Force
  }
}

# Start backend
Start-Process -FilePath $pythonExe `
  -ArgumentList "-m uvicorn app.main:app --host 0.0.0.0 --port 8000" `
  -WorkingDirectory $backendWd `
  -RedirectStandardOutput $backendOut `
  -RedirectStandardError $backendErr | Out-Null

# Start frontend
Start-Process -FilePath "npm.cmd" `
  -ArgumentList "run dev" `
  -WorkingDirectory $frontendWd `
  -RedirectStandardOutput $frontendOut `
  -RedirectStandardError $frontendErr | Out-Null

Start-Sleep -Seconds 10

$backendOk = $false
$frontendOk = $false

try {
  $health = Invoke-WebRequest -UseBasicParsing "http://127.0.0.1:8000/health" -TimeoutSec 10
  if ($health.StatusCode -eq 200) { $backendOk = $true }
} catch {}

try {
  $home = Invoke-WebRequest -UseBasicParsing "http://127.0.0.1:9000" -TimeoutSec 10
  if ($home.StatusCode -ge 200 -and $home.StatusCode -lt 400) { $frontendOk = $true }
} catch {}

Write-Output "BACKEND_OK=$backendOk"
Write-Output "FRONTEND_OK=$frontendOk"
