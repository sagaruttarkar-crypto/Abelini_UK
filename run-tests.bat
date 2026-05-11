@echo off
cls

echo =====================================
echo     SELECT TEST ENVIRONMENT
echo =====================================
echo 1. DEV
echo 2. STAGING
echo 3. PROD
echo =====================================

set /p choice=Enter your choice (1/2/3): 

if "%choice%"=="1" set TEST_ENV=dev
if "%choice%"=="2" set TEST_ENV=staging
if "%choice%"=="3" set TEST_ENV=prod

:: Handle invalid input
if "%TEST_ENV%"=="" (
    echo.
    echo ❌ Invalid selection
    pause
    exit /b 1
)

echo.
echo Running tests on %TEST_ENV%
echo =====================================

:: 🔥 IMPORTANT: show commands + stop on error
echo on

:: Set env and run
set TEST_ENV=%TEST_ENV%
call npx playwright test --headed --reporter=line

:: Capture error code
set EXIT_CODE=%ERRORLEVEL%

echo.
echo =====================================
echo Finished with exit code: %EXIT_CODE%
echo =====================================

pause
// This batch script allows the user to select a test environment (DEV, STAGING, PROD) and then runs Playwright tests accordingly. It also handles invalid input and captures the exit code of the test run for reporting.