@echo off

REM Check for help argument
if "%1"=="--help" (
    echo Usage: cmd.bat [-s] <minutes>
    echo   -s: Optional flag to disable and re-enable auto time sync
    echo   <minutes>: Number of minutes to jump
    exit /b 0
)

REM Check if the number of arguments is correct
if "%1"=="" (
    echo Error: No time provided.
    exit /b 1
)

REM Check if first argument is numeric (minutes)
set /A MINUTES=%1 2>NUL
if "%MINUTES%"=="" (
    echo Error: Invalid time format.
    exit /b 1
)

REM Check for -s flag
set SYNC=false
if "%2"=="-s" (
    set SYNC=true
)

REM Disable time sync if -s flag is set
if "%SYNC%"=="true" (
    w32tm /config /manualpeerlist:"",0x8 /syncfromflags:manual /reliable:NO /update
    w32tm /config /syncfromflags:manual /update
)

REM Jump time by minutes
powershell -Command "Set-Date (Get-Date).AddMinutes(%MINUTES%)"

REM Re-enable time sync if -s flag is set
if "%SYNC%"=="true" (
    w32tm /resync
)

exit /b 0
