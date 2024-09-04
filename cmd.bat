@echo off
setlocal

set SYNC=false
set MINUTES=

:parse_args
if "%1"=="-s" set SYNC=true && shift && goto :parse_args
if "%1"=="" goto :done_parse
if not defined MINUTES set MINUTES=%1 && shift && goto :done_parse
goto :usage

:usage
echo Usage: %0 [-s] <minutes>
exit /b 1

:done_parse
if not defined MINUTES goto :usage

rem Disable time sync if requested
if "%SYNC%"=="true" (
    w32tm /config /manualpeerlist:127.0.0.1 /syncfromflags:manual /reliable:YES /update
    net stop w32time
)

rem Get current time
for /f "tokens=1-4 delims=:." %%a in ("%time%") do (
    set /a hh=%%a, mm=%%b, ss=%%c
)

rem Add minutes
set /a new_mm=mm + MINUTES
if %new_mm% geq 60 (
    set /a hh+=new_mm/60, new_mm=new_mm%%60
)

rem Set new time
time %hh%:%new_mm%

rem Wait 1 second and set back original time
timeout /t 1 >nul
time %time%

rem Re-enable time sync if requested
if "%SYNC%"=="true" (
    net start w32time
    w32tm /resync
)

endlocal
