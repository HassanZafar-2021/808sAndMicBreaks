@echo off
echo Starting 808s & Mic Breaks...
echo.

echo Starting Backend...
start cmd /k "cd /d backend && python app.py"

echo Waiting 3 seconds for backend to start...
timeout /t 3 > nul

echo Starting Frontend...
start cmd /k "cd /d frontend && npm run dev"

echo.
echo Both servers should be starting in separate windows!
echo Backend: http://localhost:5000
echo Frontend: Will be shown in the frontend terminal
pause
