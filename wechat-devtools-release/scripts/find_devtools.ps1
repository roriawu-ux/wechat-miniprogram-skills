$ErrorActionPreference = 'Stop'

$candidates = @(
  "$env:ProgramFiles\Tencent\微信开发者工具\cli.bat",
  "${env:ProgramFiles(x86)}\Tencent\微信开发者工具\cli.bat",
  "$env:LOCALAPPDATA\微信开发者工具\cli.bat",
  "D:\微信web开发者工具\cli.bat"
) | Where-Object { $_ -and (Test-Path -LiteralPath $_) } | Select-Object -Unique

if ($candidates.Count -eq 0) {
  Write-Output 'No DevTools CLI found in common locations. Locate cli.bat from the installed WeChat DevTools.'
} else {
  Write-Output 'DevTools CLI candidates:'
  $candidates | ForEach-Object { Write-Output "  $_" }
}

$processes = Get-CimInstance Win32_Process -ErrorAction SilentlyContinue |
  Where-Object { $_.Name -match 'wechatdevtools|微信开发者工具' }
if ($processes) {
  Write-Output 'Running DevTools processes:'
  $processes | Select-Object ProcessId, Name, ExecutablePath | Format-Table -AutoSize
  $ids = @($processes.ProcessId)
  $listeners = Get-NetTCPConnection -State Listen -ErrorAction SilentlyContinue |
    Where-Object { $ids -contains $_.OwningProcess } |
    Sort-Object LocalPort
  if ($listeners) {
    Write-Output 'Listening ports owned by DevTools:'
    $listeners | Select-Object OwningProcess, LocalAddress, LocalPort | Format-Table -AutoSize
  }
}
