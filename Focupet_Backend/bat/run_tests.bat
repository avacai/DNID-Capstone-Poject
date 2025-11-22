@echo off
echo ======================================
echo   FocuPet Backend API Tester (ASCII)
echo ======================================

rem ====== Paste your token here after login ======
set TOKEN=PASTE_YOUR_TOKEN_HERE

echo Using TOKEN: %TOKEN%
echo.

echo --- /api/health ---
curl http://localhost:5000/api/health
echo.

echo --- /api/game/state ---
curl -H "Authorization: Bearer %TOKEN%" http://localhost:5000/api/game/state
echo.

echo --- /api/pet/status ---
curl -H "Authorization: Bearer %TOKEN%" http://localhost:5000/api/pet/status
echo.

echo --- /api/store/list ---
curl -H "Authorization: Bearer %TOKEN%" http://localhost:5000/api/store/list
echo.

echo --- /api/inventory ---
curl -H "Authorization: Bearer %TOKEN%" http://localhost:5000/api/inventory
echo.

echo --- /api/tasks/suggest ---
curl -H "Authorization: Bearer %TOKEN%" http://localhost:5000/api/tasks/suggest
echo.

echo --- /api/tasks/me ---
curl -H "Authorization: Bearer %TOKEN%" http://localhost:5000/api/tasks/me
echo.

echo All tests finished.
pause
