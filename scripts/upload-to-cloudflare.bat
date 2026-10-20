@echo off
rem Upload the built HeardYet site to Cloudflare Pages from a Windows computer,
rem for when GitHub can't be used (docs/SETUP.md, section 7). Put this file in
rem Downloads next to heardyet-site.zip and double-click it.
setlocal
title Upload HeardYet to Cloudflare
cd /d "%~dp0"
echo.
echo  Upload the new HeardYet site to Cloudflare
echo  ==========================================
echo.

rem Node.js is installed in Program Files; make sure this window can find it.
where npx >nul 2>nul
if errorlevel 1 set "PATH=%ProgramFiles%\nodejs;%PATH%"
where npx >nul 2>nul
if errorlevel 1 (
  echo  Node.js was not found. Install it from https://nodejs.org and run this file again.
  echo.
  pause
  exit /b 1
)

rem Unpack the newest site from heardyet-site.zip, replacing the old copy.
if exist "heardyet-site.zip" (
  echo  Unpacking heardyet-site.zip...
  if exist "heardyet-site" rmdir /s /q "heardyet-site"
  powershell -NoProfile -Command "Expand-Archive -LiteralPath 'heardyet-site.zip' -DestinationPath 'heardyet-site' -Force"
  echo.
)
if not exist "heardyet-site\index.html" (
  echo  The site is missing. Put heardyet-site.zip in Downloads next to this file and run it again.
  echo.
  pause
  exit /b 1
)

echo  Step 1 of 2: signing in to Cloudflare.
echo  (The first time, it also downloads Cloudflare's upload tool. Please wait.)
echo.
call npx --yes wrangler@4 whoami 2>&1 | findstr /i /c:"not authenticated" >nul
if errorlevel 1 (
  echo  Already signed in.
) else (
  echo  Your web browser will open. Sign in if it asks, then click "Allow".
  echo.
  call npx --yes wrangler@4 login
  if errorlevel 1 (
    echo.
    echo  Signing in didn't finish. Close this window and double-click the file again.
    echo.
    pause
    exit /b 1
  )
)

echo.
echo  Step 2 of 2: uploading the site. This takes a minute or two.
echo.
call npx --yes wrangler@4 pages deploy heardyet-site --project-name=grad-platform --branch=main --commit-dirty=true --commit-message="Uploaded by hand while GitHub is unavailable" > "heardyet-upload-log.txt" 2>&1
set "RESULT=%errorlevel%"
type "heardyet-upload-log.txt"
echo.
if not "%RESULT%"=="0" (
  echo  The upload did not finish. Tell Claude in the chat; it can read heardyet-upload-log.txt.
  echo.
  pause
  exit /b 1
)

echo  Done! The new site is live. Opening it now...
start "" "https://grad-platform.pages.dev/programs/"
echo.
pause
