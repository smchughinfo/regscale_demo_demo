@echo off
echo Activating Python virtual environment...
call .venv\Scripts\activate.bat

echo Checking RegScale installation...

if not exist "persistent_data" (
    echo persistent_data directory not found. Running setup...
    mkdir persistent_data
    python standalone_regscale.py setup persistent_data
    echo Modifying docker-compose.yml to use port 5000...
    powershell -Command "(Get-Content persistent_data\docker-compose.yml) -replace '\"80:8080\"', '\"5000:8080\"' | Set-Content persistent_data\docker-compose.yml"
)

echo Starting RegScale...
python standalone_regscale.py start persistent_data


echo.
echo RegScale should be available at: http://localhost:5000
pause