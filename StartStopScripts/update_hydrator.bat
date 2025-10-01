@echo off
REM Update Hydrator Azure App Service
REM This script rebuilds the Docker image and deploys to Azure

echo ========================================
echo  Hydrator Deployment Update Script
echo ========================================
echo.

REM Change to Hydrator directory
cd /d "%~dp0\..\Hydrator"

echo [1/4] Building Docker image...
docker build -t hydrator:latest .
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Docker build failed!
    pause
    exit /b 1
)
echo     Build successful!
echo.

echo [2/4] Tagging image for Azure Container Registry...
docker tag hydrator:latest regscaleacr.azurecr.io/hydrator:latest
echo     Tagged successfully!
echo.

echo [3/4] Logging into Azure Container Registry (via WSL)...
wsl az acr login --name regscaleacr
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: ACR login failed!
    pause
    exit /b 1
)
echo.

echo [4/4] Pushing image to Azure Container Registry...
docker push regscaleacr.azurecr.io/hydrator:latest
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Docker push failed!
    pause
    exit /b 1
)
echo     Push successful!
echo.

echo [5/5] Restarting Azure App Service (via WSL)...
wsl az webapp restart --resource-group regscale-demo-demo-2 --name hydrator
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: App Service restart failed!
    pause
    exit /b 1
)
echo.

echo ========================================
echo  Deployment Complete!
echo ========================================
echo.
echo Hydrator URL: https://hydrator-ggctbab8exhcgtgw.westcentralus-01.azurewebsites.net
echo.
echo The app service is restarting and will pull the new image.
echo Wait 30-60 seconds before testing.
echo.
pause
