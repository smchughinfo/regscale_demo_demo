@echo off
REM Upload hydration.json to Azure Hydrator App Service

echo ========================================
echo  Upload Hydration Data
echo ========================================
echo.

if not exist hydration.json (
    echo ERROR: hydration.json not found in current directory
    pause
    exit /b 1
)

echo Uploading hydration.json to production...
curl -X PUT https://hydrator-ggctbab8exhcgtgw.westcentralus-01.azurewebsites.net/api/hydration ^
  -H "Content-Type: application/json" ^
  --data-binary "@hydration.json"

if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Failed to upload hydration.json
    pause
    exit /b 1
)

echo.
echo ========================================
echo  Upload Complete!
echo ========================================
echo.
echo hydration.json has been uploaded to production
echo.
pause
