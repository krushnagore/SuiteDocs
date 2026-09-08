# PowerShell script to register and manage the SuiteScript Documentation Updater Task
param(
    [string]$Frequency = "weekly",
    [int]$IntervalDays = 0,
    [string]$DayOfWeek = "Sunday",
    [string]$TimeOfDay = "02:00",
    [switch]$RunNow,
    [switch]$Status,
    [switch]$Unregister
)

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$SyncManager = Join-Path $ScriptDir "sync_manager.py"
$PythonPath = (Get-Command python.exe).Source

if (-not $PythonPath) {
    Write-Error "Python executable was not found in PATH."
    exit 1
}

if ($Unregister) {
    Write-Host "Removing Windows Scheduled Task 'SuiteScriptDocAutoUpdater'..." -ForegroundColor Yellow
    & python.exe "$SyncManager" --remove-task
    exit 0
}

if ($Status) {
    & python.exe "$SyncManager" --status
    exit 0
}

if ($RunNow) {
    Write-Host "Running SuiteScript documentation sync immediately..." -ForegroundColor Cyan
    & python.exe "$SyncManager" --run-now
    exit 0
}

# Update frequency in config if specified
if ($IntervalDays -gt 0) {
    & python.exe "$SyncManager" --set-frequency "$IntervalDays" --time "$TimeOfDay"
} else {
    & python.exe "$SyncManager" --set-frequency "$Frequency" --day "$DayOfWeek" --time "$TimeOfDay"
}

# Register Windows Scheduled Task
Write-Host "Registering Windows Scheduled Task..." -ForegroundColor Cyan
& python.exe "$SyncManager" --setup-task

Write-Host "`nTask setup complete! Current status:" -ForegroundColor Green
& python.exe "$SyncManager" --status
