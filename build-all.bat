@echo off
REM ==========================================================
REM  build-all.bat
REM  A executer sur la machine de developpement (Windows),
REM  PAS chez le client. Prerequis sur cette machine :
REM    - JDK 17+ (avec jlink, inclus dans le JDK)
REM    - Node.js 18+
REM    - Maven (ou le mvnw fourni)
REM ==========================================================

setlocal
set ROOT=%~dp0
set FRONTEND=%ROOT%factura\frontend
set BACKEND=%ROOT%factura\backend
set SHELL=%ROOT%electron-shell

echo.
echo === 1/5 : Build du frontend (Vite) ===
cd /d "%FRONTEND%"
call npm install
call npm run build
if errorlevel 1 goto :error

echo.
echo === 2/5 : Copie du frontend build dans le backend Spring Boot ===
if exist "%BACKEND%\src\main\resources\static" rmdir /s /q "%BACKEND%\src\main\resources\static"
mkdir "%BACKEND%\src\main\resources\static"
xcopy /e /i /y "%FRONTEND%\dist\*" "%BACKEND%\src\main\resources\static\"

echo.
echo === 3/5 : Build du backend (jar Spring Boot autonome) ===
cd /d "%BACKEND%"
call mvnw.cmd clean package -DskipTests
if errorlevel 1 goto :error
copy /y "%BACKEND%\target\backend-0.0.1-SNAPSHOT.jar" "%SHELL%\resources\backend.jar"

echo.
echo === 4/5 : Generation d'une JRE minimale avec jlink ===
if exist "%SHELL%\resources\jre" rmdir /s /q "%SHELL%\resources\jre"
REM On inclut TOUS les modules standards du JDK (ALL-MODULE-PATH) plutot
REM qu'une liste manuelle : Spring Boot + Tomcat embarque + JPA/Hibernate +
REM driver PostgreSQL utilisent en interne des modules faciles a oublier
REM (ex: java.security.jgss pour Tomcat, meme sans Kerberos). Le resultat
REM est un peu plus lourd (~100 Mo) mais fiable, sans dependre d'une liste
REM de modules a maintenir a la main.
jlink --module-path "%JAVA_HOME%\jmods" ^
      --add-modules ALL-MODULE-PATH ^
      --strip-debug --no-man-pages --no-header-files --compress=2 ^
      --output "%SHELL%\resources\jre"
if errorlevel 1 goto :error

echo.
echo === 5/5 : Build de l'installeur Windows (electron-builder) ===
cd /d "%SHELL%"
call npm install
REM On ne construit que pour Windows : on desactive la detection auto de
REM signature de code, sinon electron-builder telecharge inutilement
REM "winCodeSign" (outils macOS) dont l'extraction echoue sous Windows
REM (liens symboliques .dylib non autorises sans droits speciaux).
set CSC_IDENTITY_AUTO_DISCOVERY=false
call npm run dist
if errorlevel 1 goto :error

echo.
echo ===================================================
echo   TERMINE : installeur disponible dans
echo   %SHELL%\dist_installer\
echo ===================================================
goto :eof

:error
echo.
echo *** ECHEC du build. Voir le message d'erreur ci-dessus. ***
exit /b 1
