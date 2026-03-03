# RepoSync_Fixed_PS5_Compatible.ps1
# Kisa aciklama (~15 kelime): PS5 uyumlu, UI + konsol fallback, zip yedek, sync + GHONDER/GHCEK.

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

# ---------------- SAFE PATH RESOLVE (PS5 compatible) ----------------
if ($PSCommandPath) {
    $ScriptPath = $PSCommandPath
} else {
    $ScriptPath = $MyInvocation.MyCommand.Path
}

if (-not $ScriptPath) {
    $ScriptPath = Join-Path (Get-Location) "RepoSync.ps1"
}

$Root = Split-Path -Parent $ScriptPath

# ---------------- CONFIG ----------------
$BaseUrl     = "https://github.com/salihcelebi"
$DefaultRepo = "XX"   # <-- REVIZE: Default repo adi XX, UI/konsolda degistirilebilir.
$BackupDir   = Join-Path $Root "backups"
if (-not (Test-Path $BackupDir)) {
    New-Item -ItemType Directory -Path $BackupDir | Out-Null
}

# ---------------- LOG ----------------
$script:LogToUI = $null
function Log([string]$m) {
    $line = "[{0}] {1}" -f (Get-Date -Format "HH:mm:ss"), $m
    if ($script:LogToUI) {
        $script:LogToUI.Invoke($line)
    } else {
        Write-Host $line
    }
}

# ---------------- GIT FIND ----------------
function Get-GitCmd {
    $git = Get-Command git -ErrorAction SilentlyContinue
    if ($git) { return $git.Source }

    $candidates = @(
        "$env:ProgramFiles\Git\cmd\git.exe",
        "$env:ProgramFiles\Git\bin\git.exe",
        "$env:LocalAppData\Programs\Git\cmd\git.exe",
        "$env:LocalAppData\Programs\Git\bin\git.exe"
    )
    foreach ($c in $candidates) {
        if (Test-Path $c) { return $c }
    }
    return $null
}

# ---------------- ZIP BACKUP ----------------
function Backup-Zip([string]$Folder, [string]$Name) {
    if (-not (Test-Path $Folder)) { return }

    $ts  = Get-Date -Format "yyyyMMdd_HHmmss"
    $zip = Join-Path $BackupDir "${Name}_${ts}.zip"
    Log "YEDEK -> $zip"

    try {
        Add-Type -AssemblyName System.IO.Compression.FileSystem | Out-Null
        if (Test-Path $zip) { Remove-Item $zip -Force }
        [IO.Compression.ZipFile]::CreateFromDirectory($Folder, $zip, [IO.Compression.CompressionLevel]::NoCompression, $false)
        Log "YEDEK OK"
    } catch {
        throw "ZIP hatasi: $($_.Exception.Message)"
    }
}

# ---------------- DEFAULT BRANCH ----------------
function Get-DefaultBranch($gitExe) {
    try {
        $ref = (& $gitExe symbolic-ref --quiet --short refs/remotes/origin/HEAD 2>$null)
        if ($ref) { return ($ref -replace '^origin/','') }
    } catch {}
    return "main"
}

# ---------------- SYNC ----------------
function Sync-Repo([string]$Repo) {
    $gitExe = Get-GitCmd
    if (-not $gitExe) { throw "Git bulunamadi." }

    if (-not ($Repo -match '^[A-Za-z0-9._-]+$')) {
        throw "Repo adi gecersiz."
    }

    $url  = "$BaseUrl/$Repo"
    $dest = Join-Path $Root $Repo

    Log "Repo : $url"
    Log "Hedef: $dest"

    if (Test-Path $dest) {
        Backup-Zip $dest $Repo
    }

    if (Test-Path (Join-Path $dest ".git")) {
        Push-Location $dest
        try {
            & $gitExe remote set-url origin $url 2>$null
            & $gitExe fetch --all --prune
            $br = Get-DefaultBranch $gitExe
            & $gitExe reset --hard "origin/$br"
            & $gitExe clean -fd
            Log "OK: Uzerine yazildi."
        } finally { Pop-Location }
    } else {
        if (Test-Path $dest) {
            Remove-Item $dest -Recurse -Force
        }
        & $gitExe clone --depth 1 --single-branch $url $dest
        Log "OK: Klonlandi."
    }

    return $dest
}

# ---------------- GHONDER / GHCEK HELPERS ----------------
function Get-WorkDir {
    return (Get-Location).Path
}

function Get-Counts([string]$Folder) {
    $dirs  = @(Get-ChildItem -Path $Folder -Recurse -Force -Directory -ErrorAction SilentlyContinue | Where-Object { $_.FullName -notmatch '\\\.git($|\\)' }).Count
    $files = @(Get-ChildItem -Path $Folder -Recurse -Force -File      -ErrorAction SilentlyContinue | Where-Object { $_.FullName -notmatch '\\\.git($|\\)' }).Count
    return @{ Dirs = $dirs; Files = $files }
}

function Get-FileHashSafe([string]$Path) {
    try {
        if (Test-Path $Path) { return (Get-FileHash -Algorithm SHA256 -Path $Path -ErrorAction Stop).Hash }
    } catch {}
    return $null
}

function Get-OverwriteCount([string]$Source, [string]$Dest) {
    $over = 0
    $srcFiles = Get-ChildItem -Path $Source -Recurse -Force -File -ErrorAction SilentlyContinue | Where-Object { $_.FullName -notmatch '\\\.git($|\\)' }
    foreach ($f in $srcFiles) {
        $rel = $f.FullName.Substring($Source.Length).TrimStart('\','/')
        $d   = Join-Path $Dest $rel
        if (Test-Path $d) {
            $h1 = Get-FileHashSafe $f.FullName
            $h2 = Get-FileHashSafe $d
            if ($h1 -and $h2 -and ($h1 -ne $h2)) { $over++ }
        }
    }
    return $over
}

function Robocopy-Mirror([string]$From, [string]$To) {
    $robo = Get-Command robocopy -ErrorAction SilentlyContinue
    if (-not $robo) { throw "robocopy bulunamadi." }

    # /MIR: ayna, /R:0 /W:0 hizli, /NFL /NDL daha az gurultu, /NP yuzde yok
    & $robo.Source $From $To /MIR /R:0 /W:0 /NFL /NDL /NP /XD ".git" 1>$null
}

function GHONDER([string]$Repo) {
    $gitExe = Get-GitCmd
    if (-not $gitExe) { throw "Git bulunamadi." }
    if (-not ($Repo -match '^[A-Za-z0-9._-]+$')) { throw "Repo adi gecersiz." }

    $src = Get-WorkDir
    $url = "$BaseUrl/$Repo"
    Log "GHONDER -> Kaynak klasor: $src"
    Log "GHONDER -> Repo         : $url"

    $counts = Get-Counts $src

    $tmp = Join-Path $Root ("_tmp_push_{0}_{1}" -f $Repo, (Get-Date -Format "yyyyMMdd_HHmmss"))
    if (Test-Path $tmp) { Remove-Item $tmp -Recurse -Force }

    try {
        & $gitExe clone $url $tmp 1>$null
        Push-Location $tmp
        try {
            & $gitExe fetch --all --prune 1>$null
            $br = Get-DefaultBranch $gitExe
            & $gitExe checkout $br 1>$null

            $overwrite = Get-OverwriteCount $src $tmp

            Robocopy-Mirror $src $tmp

            & $gitExe add -A 1>$null
            $status = (& $gitExe status --porcelain)
            if ($status) {
                $msg = "GHONDER sync $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
                & $gitExe commit -m $msg 1>$null
                & $gitExe push origin $br 1>$null
                Log ("GHONDER OK: {0} klasor, {1} dosya repoya gonderildi; {2} dosyanin ustune yazildi." -f $counts.Dirs, $counts.Files, $overwrite)
            } else {
                Log ("GHONDER OK: Degisiklik yok. {0} klasor, {1} dosya kontrol edildi." -f $counts.Dirs, $counts.Files)
            }
        } finally { Pop-Location }
    } finally {
        if (Test-Path $tmp) { Remove-Item $tmp -Recurse -Force }
    }
}

function GHCEK([string]$Repo) {
    $gitExe = Get-GitCmd
    if (-not $gitExe) { throw "Git bulunamadi." }
    if (-not ($Repo -match '^[A-Za-z0-9._-]+$')) { throw "Repo adi gecersiz." }

    $dest = Get-WorkDir
    $url  = "$BaseUrl/$Repo"
    Log "GHCEK -> Hedef klasor: $dest"
    Log "GHCEK -> Repo         : $url"

    if (Test-Path $dest) {
        Backup-Zip $dest ("WORKDIR_" + $Repo)
    }

    $tmp = Join-Path $Root ("_tmp_pull_{0}_{1}" -f $Repo, (Get-Date -Format "yyyyMMdd_HHmmss"))
    if (Test-Path $tmp) { Remove-Item $tmp -Recurse -Force }

    try {
        & $gitExe clone $url $tmp 1>$null
        Push-Location $tmp
        try {
            & $gitExe fetch --all --prune 1>$null
            $br = Get-DefaultBranch $gitExe
            & $gitExe checkout $br 1>$null
        } finally { Pop-Location }

        $counts   = Get-Counts $tmp
        $overwrite = Get-OverwriteCount $tmp $dest

        Robocopy-Mirror $tmp $dest

        Log ("GHCEK OK: Repodan {0} klasor, {1} dosya cekildi; {2} dosyanin ustune yazildi." -f $counts.Dirs, $counts.Files, $overwrite)
    } finally {
        if (Test-Path $tmp) { Remove-Item $tmp -Recurse -Force }
    }
}

# ---------------- UI ----------------
try {
    Add-Type -AssemblyName System.Windows.Forms
    Add-Type -AssemblyName System.Drawing

    $form = New-Object System.Windows.Forms.Form
    $form.Text = "Repo Sync"
    $form.Size = New-Object System.Drawing.Size(800, 520)
    $form.StartPosition = "CenterScreen"

    # REVIZE: Form asla kapanmasin.
    $form.ControlBox = $false
    $form.Add_FormClosing({
        $_.Cancel = $true
        Log "KAPATMA ENGELLENDI: Bu pencere asla kapanmayacak sekilde ayarlandi."
    })

    $txtRepo = New-Object System.Windows.Forms.TextBox
    $txtRepo.Location = New-Object System.Drawing.Point(20, 20)
    $txtRepo.Size = New-Object System.Drawing.Size(500, 25)
    $txtRepo.Text = $DefaultRepo   # <-- REVIZE: default repo XX
    $form.Controls.Add($txtRepo)

    $btnRun = New-Object System.Windows.Forms.Button
    $btnRun.Text = "Yedekle + Sync"
    $btnRun.Location = New-Object System.Drawing.Point(540, 18)
    $btnRun.Size = New-Object System.Drawing.Size(120, 28)
    $form.Controls.Add($btnRun)

    # REVIZE: 2 buton ekle (isimler bilerek bu sekilde)
    $btnGHONDER = New-Object System.Windows.Forms.Button
    $btnGHONDER.Text = "GHONDER"
    $btnGHONDER.Location = New-Object System.Drawing.Point(540, 50)
    $btnGHONDER.Size = New-Object System.Drawing.Size(120, 28)
    $form.Controls.Add($btnGHONDER)

    $btnGHCEK = New-Object System.Windows.Forms.Button
    $btnGHCEK.Text = "GHCEK"
    $btnGHCEK.Location = New-Object System.Drawing.Point(640, 50)
    $btnGHCEK.Size = New-Object System.Drawing.Size(120, 28)
    $form.Controls.Add($btnGHCEK)

    $txtLog = New-Object System.Windows.Forms.TextBox
    $txtLog.Location = New-Object System.Drawing.Point(20, 90)   # <-- REVIZE: butonlar icin asagi alindi
    $txtLog.Size = New-Object System.Drawing.Size(740, 360)      # <-- REVIZE: boy ayari
    $txtLog.Multiline = $true
    $txtLog.ScrollBars = "Vertical"
    $txtLog.ReadOnly = $true
    $form.Controls.Add($txtLog)

    $script:LogToUI = {
        param($line)
        $txtLog.AppendText($line + "`r`n")
        $txtLog.ScrollToCaret()
    }

    $btnRun.Add_Click({
        try {
            $repo = $txtRepo.Text.Trim()
            if (-not $repo) { throw "Repo adi girin." }
            Log "----------------"
            Sync-Repo $repo | Out-Null
        } catch {
            Log "HATA: $($_.Exception.Message)"
        }
    })

    $btnGHONDER.Add_Click({
        try {
            $repo = $txtRepo.Text.Trim()
            if (-not $repo) { throw "Repo adi girin." }
            Log "----------------"
            GHONDER $repo
        } catch {
            Log "HATA: $($_.Exception.Message)"
        }
    })

    $btnGHCEK.Add_Click({
        try {
            $repo = $txtRepo.Text.Trim()
            if (-not $repo) { throw "Repo adi girin." }
            Log "----------------"
            GHCEK $repo
        } catch {
            Log "HATA: $($_.Exception.Message)"
        }
    })

    [void]$form.ShowDialog()
}
catch {
    # UI acilmazsa konsol fallback
    Log "UI acilamadi, konsol moduna gecildi."
    try {
        $repo = Read-Host ("Repo adi (varsayilan: {0})" -f $DefaultRepo)
        if (-not $repo) { $repo = $DefaultRepo }

        Log "1=Yedekle+Sync  2=GHONDER  3=GHCEK"
        $sec = Read-Host "Secim"
        if ($sec -eq "2") {
            GHONDER $repo
        } elseif ($sec -eq "3") {
            GHCEK $repo
        } else {
            Sync-Repo $repo | Out-Null
            Log "Bitti."
        }
    } catch {
        Log "HATA: $($_.Exception.Message)"
    }
    Read-Host "Cikmak icin Enter"
}