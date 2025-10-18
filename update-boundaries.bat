@echo off
REM Windows Batch File for Local Boundary Updater
REM 
REM This script runs on Windows to download and update conservation site boundaries
REM 
REM Usage:
REM   update-boundaries.bat              - Download and process only
REM   update-boundaries.bat commit       - Also commit changes
REM   update-boundaries.bat commit push  - Commit and push to GitHub

echo.
echo =========================================================
echo   Conservation Connector - Boundary Updater
echo =========================================================
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo ERROR: Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

REM Build the command
set CMD=node scripts/local-boundary-updater.cjs

REM Check for commit flag
if "%1"=="commit" (
    set CMD=%CMD% --commit
    echo Mode: Will commit changes after download
)

REM Check for push flag
if "%2"=="push" (
    set CMD=%CMD% --push
    echo Mode: Will also push to GitHub
)

echo.
echo Running: %CMD%
echo.

REM Run the script
%CMD%

echo.
echo =========================================================
echo Done!
echo =========================================================
pause
