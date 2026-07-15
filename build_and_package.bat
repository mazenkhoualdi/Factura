@echo off
REM ============================================================
REM  build_and_package.bat
REM  A lancer depuis le dossier racine "factura" (celui qui
REM  contient les dossiers backend, frontend et launcher).
REM
REM  Ce script :
REM    1. Build le backend (jar)      -> backend\target\*.jar
REM    2. Build le frontend (statique) -> frontend\dist\
REM    3. Build le launcher (exe)      -> launcher\dist\Factura.exe
REM    4. Assemble tout dans un dossier "package_final\"
REM       pret a etre zippe et distribue.
REM
REM  Resultat : chez l'utilisateur final, le tout premier
REM  lancement de Factura.exe est aussi rapide que les suivants,
REM  car le jar et le build frontend sont deja presents.
REM ============================================================

setlocal enabledelayedexpansion
set ROOT=%~dp0
cd /d "%ROOT%"

echo.
echo [1/4] Build du backend (mvn clean package)...
echo ------------------------------------------------------------
cd backend
call mvn clean package -DskipTests
if errorlevel 1 (
    echo.
    echo ERREUR : le build Maven a echoue. Arret du script.
    pause
    exit /b 1
)
cd ..

echo.
echo [2/4] Build du frontend (npm run build)...
echo ------------------------------------------------------------
cd frontend
call npm run build
if errorlevel 1 (
    echo.
    echo ERREUR : le build npm a echoue. Arret du script.
    pause
    exit /b 1
)
cd ..

echo.
echo [3/4] Build de l'executable (PyInstaller)...
echo ------------------------------------------------------------
cd launcher
REM Nettoyage des anciens artefacts PyInstaller pour un build propre
if exist build rmdir /s /q build
if exist dist rmdir /s /q dist
if exist __pycache__ rmdir /s /q __pycache__

C:\PySchool\3.10-32-bit\python.exe -m PyInstaller --onefile --noconsole --name Factura launcher.py
if errorlevel 1 (
    echo.
    echo ERREUR : le build PyInstaller a echoue. Arret du script.
    pause
    exit /b 1
)
cd ..

echo.
echo [4/4] Assemblage du package final...
echo ------------------------------------------------------------
if exist package_final rmdir /s /q package_final
mkdir package_final
mkdir package_final\backend\target
mkdir package_final\frontend
mkdir package_final\launcher

REM Copie du jar backend (le seul jar utile, on ignore .original et sources)
for %%F in (backend\target\*.jar) do (
    echo %%~nxF | findstr /i "sources" >nul
    if errorlevel 1 (
        copy "%%F" "package_final\backend\target\" >nul
    )
)

REM Copie du build frontend
xcopy /s /e /i /y frontend\dist package_final\frontend\dist >nul

REM Copie de l'executable
copy launcher\dist\Factura.exe package_final\launcher\ >nul

echo.
echo ============================================================
echo   Package pret dans : %ROOT%package_final
echo.
echo   Structure :
echo     package_final\backend\target\*.jar
echo     package_final\frontend\dist\...
echo     package_final\launcher\Factura.exe
echo.
echo   Il ne reste plus qu'a zipper le dossier "package_final"
echo   et le distribuer. Chez l'utilisateur final, garder cette
echo   meme structure de dossiers (backend / frontend / launcher
echo   au meme niveau) pour que Factura.exe retrouve bien le jar
echo   et le build frontend automatiquement.
echo ============================================================
echo.
pause