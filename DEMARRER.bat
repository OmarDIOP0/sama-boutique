@echo off
REM ════════════════════════════════════════════════════════════
REM  SamaBoutique - Demarrage / Reparation (double-clic)
REM  A lancer si tu vois l'erreur 502 / Bad Gateway
REM ════════════════════════════════════════════════════════════
title SamaBoutique - Demarrage backend
echo.
echo  === 1. Demarrage de LocalDB ===
SqlLocalDB start MSSQLLocalDB 2>nul

REM Verifier si LocalDB tourne ; sinon le reparer (delete + recreate)
SqlLocalDB info MSSQLLocalDB | findstr /C:"Running" >nul
if errorlevel 1 (
    echo  LocalDB casse - reparation en cours...
    taskkill /F /IM sqlservr.exe >nul 2>&1
    timeout /t 2 /nobreak >nul
    SqlLocalDB stop MSSQLLocalDB >nul 2>&1
    SqlLocalDB delete MSSQLLocalDB >nul 2>&1
    SqlLocalDB create MSSQLLocalDB >nul 2>&1
    SqlLocalDB start MSSQLLocalDB >nul 2>&1
    echo  Rattachement de la base...
    sqlcmd -S "(localdb)\MSSQLLocalDB" -Q "IF DB_ID('SamaBoutiqueDb') IS NULL CREATE DATABASE [SamaBoutiqueDb] ON (FILENAME='C:\Users\itdevstg1\SamaBoutiqueDb.mdf'), (FILENAME='C:\Users\itdevstg1\SamaBoutiqueDb_log.ldf') FOR ATTACH;" >nul 2>&1
)

echo  LocalDB OK.
echo.
echo  === 2. Demarrage du backend (port 5011) ===
echo  Laisse cette fenetre OUVERTE. Ferme-la pour arreter le serveur.
echo.
cd /d "C:\Users\itdevstg1\source\repos\SamaBoutique\SamaBoutique.Server"
dotnet run
pause
