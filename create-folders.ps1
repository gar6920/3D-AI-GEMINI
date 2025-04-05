$folders = @(
    "client\assets",
    "client\scenes",
    "client\scripts\player",
    "client\scripts\ai",
    "client\scripts\building",
    "client\scripts\network",
    "client\scripts\systems",
    "client\scripts\ui",
    "client\styles",
    "client\templates",
    "server\src\rooms\schemas",
    "server\src\ai",
    "server\src\game",
    "server\src\db",
    "desktop\icons",
    "docs"
)

foreach ($folder in $folders) {
    $path = Join-Path -Path $PSScriptRoot -ChildPath $folder
    if (-not (Test-Path -Path $path)) {
        Write-Host "Creating folder: $folder"
        New-Item -Path $path -ItemType Directory -Force | Out-Null
    } else {
        Write-Host "Folder already exists: $folder"
    }
}
