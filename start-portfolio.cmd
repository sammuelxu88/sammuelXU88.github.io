@echo off
setlocal
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0start-portfolio.ps1" %*
exit /b %errorlevel%
