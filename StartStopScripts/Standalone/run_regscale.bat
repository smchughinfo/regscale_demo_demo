if not exist "PersistentData" (
    echo Stopping all containers...
    docker compose -f PersistentData\docker-compose.yml down 2>nul

    echo Finding and removing ALL RegScale volumes...
    docker volume ls
    for /f "tokens=2" %%i in ('docker volume ls ^| findstr "sqlvolume"') do (
        echo Removing: %%i
        docker volume rm %%i
    )
    for /f "tokens=2" %%i in ('docker volume ls ^| findstr "atlasvolume"') do (
        echo Removing: %%i
        docker volume rm %%i
    )

    echo Running Setup
    mkdir PersistentData
    .venv\Scripts\python.exe standalone_regscale.py setup PersistentData

    echo Modifying port to 5000...
    .venv\Scripts\python.exe -c "p = open('PersistentData/docker-compose.yml', 'r+'); content = p.read(); p.seek(0); p.write(content.replace('\"80:8080\"', '\"5000:8080\"')); p.truncate(); p.close()"
)
echo Starting RegScale...
.venv\Scripts\python.exe standalone_regscale.py start PersistentData
echo.
echo If page doesn't load wait 30 second and refresh

pause