@echo off
setlocal
set SCRIPT_DIR=%~dp0
cd /d "%SCRIPT_DIR%"

if "%1"=="" goto show_help
if "%1"=="--help" goto show_help
if "%1"=="-h" goto show_help

if "%1"=="--status" (
    python sync_manager.py --status
    goto end
)
if "%1"=="status" (
    python sync_manager.py --status
    goto end
)
if "%1"=="--run-now" (
    python sync_manager.py --run-now
    goto end
)
if "%1"=="run" (
    python sync_manager.py --run-now
    goto end
)

python sync_manager.py --set-frequency %1
python sync_manager.py --setup-task
goto end

:show_help
python sync_manager.py --status
echo.
echo ============================================================
echo  HOW TO CHANGE THE UPDATE FREQUENCY:
echo ============================================================
echo   update_frequency.bat weekly         (Sets update to weekly)
echo   update_frequency.bat daily          (Sets update to daily)
echo   update_frequency.bat biweekly       (Sets update to every 14 days)
echo   update_frequency.bat monthly        (Sets update to every 30 days)
echo   update_frequency.bat 3              (Sets update to every 3 days)
echo   update_frequency.bat --run-now      (Run sync right now)
echo   update_frequency.bat --status       (View current schedule)
echo ============================================================
echo.

:end
endlocal
