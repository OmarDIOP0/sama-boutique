# ════════════════════════════════════════════════════════════════════
#  SamaBoutique — Réparation LocalDB + démarrage backend
#  Lance ce script si tu vois l'erreur 502 / "Bad Gateway"
#  Clic droit → "Exécuter avec PowerShell"  (ou: powershell -File fix-and-start.ps1)
# ════════════════════════════════════════════════════════════════════

$ErrorActionPreference = "Continue"
$mdf = "C:\Users\itdevstg1\SamaBoutiqueDb.mdf"
$ldf = "C:\Users\itdevstg1\SamaBoutiqueDb_log.ldf"
$serverDir = "C:\Users\itdevstg1\source\repos\SamaBoutique\SamaBoutique.Server"

Write-Host "`n=== 1. Vérification de LocalDB MSSQLLocalDB ===" -ForegroundColor Cyan
$state = (SqlLocalDB info MSSQLLocalDB 2>&1 | Select-String "State:").ToString()
Write-Host $state

# Tenter de démarrer ; si échec → réparer
SqlLocalDB start MSSQLLocalDB 2>&1 | Out-Null
$running = (SqlLocalDB info MSSQLLocalDB 2>&1 | Select-String "State:\s*Running")

if (-not $running) {
    Write-Host "LocalDB cassé → réparation en cours..." -ForegroundColor Yellow

    # Nettoyer les clés registre corrompues (DataDirectory manquant)
    $regPath = "HKCU:\SOFTWARE\Microsoft\Microsoft SQL Server\UserInstances"
    if (Test-Path $regPath) {
        Get-ChildItem $regPath -ErrorAction SilentlyContinue | ForEach-Object {
            $dd = Get-ItemProperty -Path $_.PSPath -Name "DataDirectory" -ErrorAction SilentlyContinue
            if ($null -eq $dd) { Remove-Item $_.PSPath -Recurse -Force -ErrorAction SilentlyContinue }
        }
    }

    # Arrêter sqlservr résiduels PROPREMENT (pas de Kill brutal récurrent)
    Get-Process -Name "sqlservr" -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
    Start-Sleep -Seconds 2

    # Recréer l'instance fraîche
    SqlLocalDB stop MSSQLLocalDB 2>&1 | Out-Null
    SqlLocalDB delete MSSQLLocalDB 2>&1 | Out-Null
    SqlLocalDB create MSSQLLocalDB 2>&1 | Out-Null
    SqlLocalDB start MSSQLLocalDB 2>&1 | Out-Null
    Write-Host "Instance recréée." -ForegroundColor Green
}

Write-Host "`n=== 2. Vérification de la base SamaBoutiqueDb ===" -ForegroundColor Cyan
$dbExists = sqlcmd -S "(localdb)\MSSQLLocalDB" -h -1 -Q "SET NOCOUNT ON; SELECT CASE WHEN DB_ID('SamaBoutiqueDb') IS NULL THEN 0 ELSE 1 END" 2>&1
if ($dbExists -match "0") {
    if ((Test-Path $mdf) -and (Test-Path $ldf)) {
        Write-Host "Rattachement de la base existante..." -ForegroundColor Yellow
        sqlcmd -S "(localdb)\MSSQLLocalDB" -Q "CREATE DATABASE [SamaBoutiqueDb] ON (FILENAME='$mdf'), (FILENAME='$ldf') FOR ATTACH;" 2>&1 | Out-Null
        Write-Host "Base rattachée (données conservées)." -ForegroundColor Green
    } else {
        Write-Host "Pas de fichiers existants → le backend créera la base au démarrage." -ForegroundColor Yellow
    }
} else {
    Write-Host "Base déjà présente et accessible." -ForegroundColor Green
}

Write-Host "`n=== 3. Démarrage du backend (port 5011) ===" -ForegroundColor Cyan
Set-Location $serverDir
dotnet run
