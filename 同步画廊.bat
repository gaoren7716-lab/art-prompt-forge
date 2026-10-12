@echo off
chcp 65001 >nul
setlocal
cd /d "%~dp0"

rem Keep this file pure ASCII. cmd parses a .bat line by line using the system
rem code page (GBK on a Chinese Windows), so UTF-8 Chinese inside the file gets
rem torn apart and corrupts the line structure - tested, it breaks the script.
rem Chinese output comes from node instead; the chcp above makes the window
rem interpret it as UTF-8.

rem Locate node: prefer the managed version dir (the version number changes,
rem so scan for it), fall back to whatever node is on PATH.
set "NODE_EXE=node"
for /d %%D in ("%USERPROFILE%\.workbuddy\binaries\node\versions\*") do if exist "%%D\node.exe" set "NODE_EXE=%%D\node.exe"
rem sharp (used to shrink PNGs for the single-file build) lives in the managed
rem workspace, not on PATH. Missing it only makes standalone.html bigger.
for /d %%D in ("%USERPROFILE%\.workbuddy\binaries\node\*") do if exist "%%D\node_modules\sharp\package.json" set "NODE_PATH=%%D\node_modules"

echo.
echo   [gallery sync]  gallery/  to  standalone.html
echo.
rem Normalise file names first: anything named after the on-page number
rem (G-26.png) becomes the real card code (VAR-01.png). Two naming schemes
rem coexisting is how "I put the image in and nothing happened" happens -
rem the page showed one name, the manifest only knew the other.
"%NODE_EXE%" tools\gallery_sync.js --rename
set "RC1=%ERRORLEVEL%"
"%NODE_EXE%" tools\build_standalone.js
set "RC=%ERRORLEVEL%"
echo.
if "%RC%"=="0" (
  if not "%RC1%"=="0" (
    echo   [WARN] sync reported a problem - read the lines above.
  )
  echo   [OK] sync done. Refresh index.html; standalone.html has been rebuilt.
) else (
  echo   [FAIL] see the reason above ^(bad image name / missing file / etc^).
)
echo.
pause
