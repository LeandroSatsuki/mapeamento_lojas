param(
    [string]$ConfigPath = ".\\scripts\\ftp-deploy.config.json",
    [switch]$DryRun
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

function Get-DeployConfig {
    param([string]$Path)

    if (-not (Test-Path -LiteralPath $Path)) {
        throw "Arquivo de configuracao nao encontrado: $Path`nCopie scripts/ftp-deploy.config.example.json para scripts/ftp-deploy.config.json e preencha os acessos."
    }

    $config = Get-Content -LiteralPath $Path -Raw | ConvertFrom-Json

    foreach ($required in @("server", "username", "password", "remotePath", "publishPaths")) {
        if (-not $config.$required) {
            throw "Campo obrigatorio ausente no config: $required"
        }
    }

    return $config
}

function Join-FtpPath {
    param(
        [string]$Base,
        [string]$Child
    )

    $normalizedBase = $Base.TrimEnd("/")
    $normalizedChild = $Child.TrimStart("/")

    if ([string]::IsNullOrWhiteSpace($normalizedChild)) {
        return $normalizedBase
    }

    return "$normalizedBase/$normalizedChild"
}

function New-FtpRequest {
    param(
        [string]$Uri,
        [string]$Method,
        [object]$Config
    )

    $request = [System.Net.FtpWebRequest]::Create($Uri)
    $request.Method = $Method
    $request.Credentials = New-Object System.Net.NetworkCredential($Config.username, $Config.password)
    $request.UseBinary = $true
    $request.UsePassive = [bool]$Config.passiveMode
    $request.EnableSsl = [bool]$Config.useSsl
    $request.KeepAlive = $false
    return $request
}

function Invoke-FtpVoid {
    param(
        [string]$Uri,
        [string]$Method,
        [object]$Config
    )

    $request = New-FtpRequest -Uri $Uri -Method $Method -Config $Config
    try {
        $response = $request.GetResponse()
        $response.Close()
    } catch [System.Net.WebException] {
        throw $_
    }
}

function Test-FtpPathExists {
    param(
        [string]$Uri,
        [object]$Config
    )

    try {
        Invoke-FtpVoid -Uri $Uri -Method ([System.Net.WebRequestMethods+Ftp]::GetDateTimestamp) -Config $Config
        return $true
    } catch [System.Net.WebException] {
        $response = $_.Exception.Response
        if ($response -and $response.StatusCode -eq [System.Net.FtpStatusCode]::ActionNotTakenFileUnavailable) {
            return $false
        }
        return $false
    }
}

function Ensure-FtpDirectory {
    param(
        [string]$Uri,
        [object]$Config,
        [switch]$DryRunMode
    )

    $parts = ([System.Uri]$Uri).AbsolutePath.Trim("/").Split("/", [System.StringSplitOptions]::RemoveEmptyEntries)
    $root = "{0}://{1}" -f ([System.Uri]$Uri).Scheme, ([System.Uri]$Uri).Host
    if (([System.Uri]$Uri).IsDefaultPort -eq $false) {
        $root = "{0}:{1}" -f $root, ([System.Uri]$Uri).Port
    }

    $current = $root
    foreach ($part in $parts) {
        $current = Join-FtpPath -Base $current -Child $part
        if (Test-FtpPathExists -Uri $current -Config $Config) {
            continue
        }

        if ($DryRunMode) {
            Write-Host "[dry-run] mkdir $current"
            continue
        }

        try {
            Invoke-FtpVoid -Uri $current -Method ([System.Net.WebRequestMethods+Ftp]::MakeDirectory) -Config $Config
            Write-Host "Criado diretorio remoto: $current"
        } catch [System.Net.WebException] {
            $response = $_.Exception.Response
            if (-not ($response -and $response.StatusCode -eq [System.Net.FtpStatusCode]::ActionNotTakenFileUnavailable)) {
                throw
            }
        }
    }
}

function Get-PublishFiles {
    param(
        [string]$RepoRoot,
        [object]$Config
    )

    $files = New-Object System.Collections.Generic.List[object]

    foreach ($path in $Config.publishPaths) {
        $fullPath = Join-Path $RepoRoot $path
        if (-not (Test-Path -LiteralPath $fullPath)) {
            throw "Caminho para publicacao nao encontrado: $path"
        }

        $item = Get-Item -LiteralPath $fullPath
        if ($item.PSIsContainer) {
            Get-ChildItem -LiteralPath $fullPath -File -Recurse | ForEach-Object {
                $relative = Get-RelativeRepoPath -RepoRoot $RepoRoot -FullPath $_.FullName
                $files.Add([pscustomobject]@{
                    FullName = $_.FullName
                    RelativePath = $relative
                })
            }
        } else {
            $relative = Get-RelativeRepoPath -RepoRoot $RepoRoot -FullPath $item.FullName
            $files.Add([pscustomobject]@{
                FullName = $item.FullName
                RelativePath = $relative
            })
        }
    }

    return $files
}

function Get-RelativeRepoPath {
    param(
        [string]$RepoRoot,
        [string]$FullPath
    )

    $rootPath = [System.IO.Path]::GetFullPath($RepoRoot).TrimEnd('\', '/')
    $absolutePath = [System.IO.Path]::GetFullPath($FullPath)

    if ($absolutePath.StartsWith($rootPath, [System.StringComparison]::OrdinalIgnoreCase)) {
        return $absolutePath.Substring($rootPath.Length).TrimStart('\', '/').Replace('\', '/')
    }

    throw "Nao foi possivel calcular o caminho relativo para: $FullPath"
}

function Send-FtpFile {
    param(
        [string]$LocalPath,
        [string]$RemoteUri,
        [object]$Config,
        [switch]$DryRunMode
    )

    if ($DryRunMode) {
        Write-Host "[dry-run] upload $LocalPath -> $RemoteUri"
        return
    }

    $request = New-FtpRequest -Uri $RemoteUri -Method ([System.Net.WebRequestMethods+Ftp]::UploadFile) -Config $Config
    $bytes = [System.IO.File]::ReadAllBytes($LocalPath)
    $request.ContentLength = $bytes.Length

    $requestStream = $request.GetRequestStream()
    try {
        $requestStream.Write($bytes, 0, $bytes.Length)
    } finally {
        $requestStream.Dispose()
    }

    $response = $request.GetResponse()
    try {
        Write-Host ("Upload concluido: {0} ({1})" -f $LocalPath, $response.StatusDescription.Trim())
    } finally {
        $response.Close()
    }
}

function Remove-FtpFile {
    param(
        [string]$RemoteUri,
        [object]$Config,
        [switch]$DryRunMode
    )

    if ($DryRunMode) {
        Write-Host "[dry-run] delete $RemoteUri"
        return
    }

    Invoke-FtpVoid -Uri $RemoteUri -Method ([System.Net.WebRequestMethods+Ftp]::DeleteFile) -Config $Config
    Write-Host "Arquivo remoto removido: $RemoteUri"
}

$repoRoot = Split-Path -Parent $PSScriptRoot
$configFullPath = if ([System.IO.Path]::IsPathRooted($ConfigPath)) { $ConfigPath } else { Join-Path $repoRoot $ConfigPath }
$config = Get-DeployConfig -Path $configFullPath
$server = $config.server.Trim()
if ($server -notmatch '^[a-z]+://') {
    $server = "ftp://$server"
}
$server = $server.TrimEnd("/")
$remoteBase = Join-FtpPath -Base $server -Child $config.remotePath
$files = Get-PublishFiles -RepoRoot $repoRoot -Config $config

Write-Host "Total de arquivos para publicar: $($files.Count)"
Write-Host "Destino remoto: $remoteBase"

if ($config.cleanRemote) {
    Write-Warning "cleanRemote=true remove apenas os arquivos do conjunto atual antes do upload."
    foreach ($file in $files) {
        $remoteUri = Join-FtpPath -Base $remoteBase -Child $file.RelativePath
        try {
            Remove-FtpFile -RemoteUri $remoteUri -Config $config -DryRunMode:$DryRun
        } catch {
            Write-Host "Ignorado ao limpar (provavelmente inexistente): $remoteUri"
        }
    }
}

foreach ($file in $files) {
    $remoteUri = Join-FtpPath -Base $remoteBase -Child $file.RelativePath
    $lastSlashIndex = $remoteUri.LastIndexOf("/")
    if ($lastSlashIndex -lt 0) {
        throw "Nao foi possivel determinar o diretorio remoto de: $remoteUri"
    }
    $remoteDir = $remoteUri.Substring(0, $lastSlashIndex)
    Ensure-FtpDirectory -Uri $remoteDir -Config $config -DryRunMode:$DryRun
    Send-FtpFile -LocalPath $file.FullName -RemoteUri $remoteUri -Config $config -DryRunMode:$DryRun
}

Write-Host "Deploy finalizado."
