@echo off
REM Upload hydration-backup.json to Azure Hydrator App Service

echo ========================================
echo  Upload Hydration Data
echo ========================================
echo.

if not exist hydration-backup.json (
    echo ERROR: hydration-backup.json not found in current directory
    pause
    exit /b 1
)

echo Uploading hydration-backup.json to production...
curl -X PUT https://hydrator-ggctbab8exhcgtgw.westcentralus-01.azurewebsites.net/api/hydration ^
  -H "Content-Type: application/json" ^
  --data-binary "@hydration-backup.json"

if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Failed to upload hydration-backup.json
    pause
    exit /b 1
)

echo.
echo ========================================
echo  Upload Complete!
echo ========================================
echo.
echo hydration-backup.json has been uploaded to production
echo.
pause
