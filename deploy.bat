@echo off
echo.
echo Nath's Job Matcher - Deployment Script
echo.
echo Step 1: Make sure you created the GitHub repo at https://github.com/new
echo   - Repository name: naths-job-matcher-web
echo   - Make it PUBLIC
echo.
echo Step 2: Running git push...
echo.
powershell -ExecutionPolicy Bypass -File push-to-github.ps1
echo.
pause
