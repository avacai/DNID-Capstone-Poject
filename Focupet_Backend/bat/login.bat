@echo off
echo ======================================
echo   FocuPet Backend Login (ASCII Only)
echo ======================================

cd /d "D:\DNID\Capstone\DNID-Capstone-Poject\Focupet_Backend"

echo Sending login request...
echo.

curl -X POST "http://localhost:5000/api/login" ^
  -H "Content-Type: application/json" ^
  -d "{\"email\":\"alice@example.com\",\"password\":\"password123\"}"

echo.
echo --------------------------------------
echo Copy the token from the JSON response.
echo Paste it into run_tests.bat (set TOKEN=)
echo --------------------------------------
pause
