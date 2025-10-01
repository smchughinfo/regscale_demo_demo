@echo off
REM Update Hydrator Azure App Service
REM This script rebuilds the Docker image and deploys to Azure

echo ========================================
echo  Hydrator Deployment Update Script
echo ========================================
echo.

REM Change to Hydrator directory
cd /d "%~dp0\..\Hydrator"

echo [1/6] Backing up production hydration.json...
curl -s https://hydrator-ggctbab8exhcgtgw.westcentralus-01.azurewebsites.net/api/hydration -o hydration-backup.json
if %ERRORLEVEL% NEQ 0 (
    echo WARNING: Failed to download hydration.json backup. Continuing anyway...
) else (
    echo     Backup saved to hydration-backup.json
)
echo.

echo [2/6] Building Docker image...
docker build -t hydrator:latest .
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Docker build failed!
    pause
    exit /b 1
)
echo     Build successful!
echo.

echo [3/6] Tagging image for Azure Container Registry...
docker tag hydrator:latest regscaleacr.azurecr.io/hydrator:latest
echo     Tagged successfully!
echo.

echo [4/6] Logging into Azure Container Registry (via WSL)...
wsl az acr login --name regscaleacr
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: ACR login failed!
    pause
    exit /b 1
)
echo.

echo [5/6] Pushing image to Azure Container Registry...
docker push regscaleacr.azurecr.io/hydrator:latest
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Docker push failed!
    pause
    exit /b 1
)
echo     Push successful!
echo.

echo [6/6] Restarting Azure App Service (via WSL)...
wsl az webapp restart --resource-group regscale-demo-demo-2 --name hydrator
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: App Service restart failed!
    pause
    exit /b 1
)
echo.

echo [7/7] Waiting for app to start and restoring hydration.json...
echo     Waiting 30 seconds for container to start...
timeout /t 30 /nobreak >nul
curl -X PUT https://hydrator-ggctbab8exhcgtgw.westcentralus-01.azurewebsites.net/api/hydration ^
  -H "Content-Type: application/json" ^
  --data-binary "@hydration-backup.json"
if %ERRORLEVEL% NEQ 0 (
    echo WARNING: Failed to restore hydration.json. You may need to restore it manually.
) else (
    echo     hydration.json restored successfully!
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
