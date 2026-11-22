@echo off
cd /d "%~dp0"
powershell.exe -NoProfile -File "%~dp0Create-Korean-Copy.ps1"
if errorlevel 1 echo Failed. See the message above.
pause
