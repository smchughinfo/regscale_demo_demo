@echo off
echo Activating Python virtual environment...
call ..\venv\Scripts\activate.bat

echo Checking RegScale installation...

if not exist "..\PersistentData" (
    echo PersistentData directory not found. Running setup...
    mkdir ..\PersistentData
    python ..\standalone_regscale.py setup ..\PersistentData
    echo Modifying docker-compose.yml to use port 5000...
    powershell -Command "(Get-Content ..\PersistentData\docker-compose.yml) -replace '\"80:8080\"', '\"5000:8080\"' | Set-Content ..\PersistentData\docker-compose.yml"
)

echo Starting RegScale...
python ..\standalone_regscale.py start ..\PersistentData


echo.
echo RegScale should be available at: http://localhost:5000
pause