@echo off
echo.
echo ========================================
echo   EsportsNeo Backend - Vercel Deploy
echo ========================================
echo.

REM Check if Vercel CLI is installed
where vercel >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Vercel CLI not found!
    echo [INFO] Installing Vercel CLI...
    call npm install -g vercel
    echo [SUCCESS] Vercel CLI installed!
    echo.
)

REM Check if node_modules exists
if not exist "node_modules" (
    echo [INFO] Installing dependencies...
    call npm install
    echo [SUCCESS] Dependencies installed!
    echo.
)

REM Check if .env file exists
if not exist ".env" (
    echo [WARNING] .env file not found!
    echo [INFO] Creating .env from .env.example...
    copy .env.example .env
    echo.
    echo [IMPORTANT] Please edit .env file with your credentials!
    echo.
    echo Required variables:
    echo   - DATABASE_URL
    echo   - JWT_SECRET
    echo   - CLOUDINARY_CLOUD_NAME
    echo   - CLOUDINARY_API_KEY
    echo   - CLOUDINARY_API_SECRET
    echo.
    pause
)

REM Generate Prisma Client
echo [INFO] Generating Prisma Client...
call npx prisma generate
echo [SUCCESS] Prisma Client generated!
echo.

REM Deploy to Vercel
echo [INFO] Deploying to Vercel...
echo.
call vercel

echo.
echo ========================================
echo   Deployment Complete!
echo ========================================
echo.
echo Next steps:
echo 1. Set environment variables in Vercel Dashboard
echo 2. Run: npx prisma db push
echo 3. Test your API endpoints
echo.
echo For detailed instructions, see VERCEL_DEPLOYMENT.md
echo.
pause
