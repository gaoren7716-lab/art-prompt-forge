@echo off
chcp 65001 >nul
setlocal
cd /d "%~dp0"

rem Keep this file pure ASCII - see the note in 同步画廊.bat.
rem Chinese output comes from node, displayed as UTF-8 thanks to chcp above.

set "NODE_EXE=node"
for /d %%D in ("%USERPROFILE%\.workbuddy\binaries\node\versions\*") do if exist "%%D\node.exe" set "NODE_EXE=%%D\node.exe"
for /d %%D in ("%USERPROFILE%\.workbuddy\binaries\node\*") do if exist "%%D\node_modules\sharp\package.json" set "NODE_PATH=%%D\node_modules"

echo.
echo   [gallery watcher] keeps an eye on gallery/ and syncs within ~2s.
echo   KEEP THIS WINDOW OPEN - closing it stops the auto sync.
echo   Want a one-off sync instead? Double-click the sync .bat in this folder.
echo.
"%NODE_EXE%" tools\gallery_watch.js
echo.
echo   [watcher exited] window closed or an error occurred.
pause
