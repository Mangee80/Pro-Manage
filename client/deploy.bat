@echo off
echo ========================================
echo   Pro Manage - Vercel Deployment
echo ========================================
echo.

REM Check if Vercel CLI is installed
where vercel >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo Vercel CLI not found. Installing...
    npm install -g vercel
    if %ERRORLEVEL% NEQ 0 (
        echo Failed to install Vercel CLI.
        echo Please install manually: npm install -g vercel
        pause
        exit /b 1
    )
)

echo.
echo Logging in to Vercel...
vercel login

if %ERRORLEVEL% NEQ 0 (
    echo Login failed. Please try again.
    pause
    exit /b 1
)

echo.
echo Deploying to production...
vercel --prod

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ========================================
    echo   Deployment Successful! 🎉
    echo ========================================
) else (
    echo.
    echo ========================================
    echo   Deployment Failed! ❌
    echo ========================================
)

pause
