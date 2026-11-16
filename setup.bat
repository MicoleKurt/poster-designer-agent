@echo off
rem Double-click this on Windows after copying the folder. It installs what is
rem needed, confirms a browser works, and runs the self-test.
cd /d "%~dp0"
where py >nul 2>nul
if %errorlevel%==0 (set PY=py -3) else (set PY=python)
%PY% --version >nul 2>nul
if errorlevel 1 (
  echo Python 3.10 or newer is needed. Install it from https://www.python.org/downloads/ and run this again.
  pause
  exit /b 1
)
%PY% poster.py setup
if errorlevel 1 ( pause & exit /b 1 )
echo.
%PY% poster.py test
echo.
pause
