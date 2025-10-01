@echo off
REM Download hydration.json from Azure Hydrator App Service

echo ========================================
echo  Download Hydration Data
echo ========================================
echo.

echo Downloading hydration.json from production...
curl -s https://hydrator-ggctbab8exhcgtgw.westcentralus-01.azurewebsites.net/api/hydration -o hydration-backup.json

if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Failed to download hydration-backup.json
    pause
    exit /b 1
)

echo.
echo ========================================
echo  Download Complete!
echo ========================================
echo.
echo File saved to: hydration.json
echo.
pause
