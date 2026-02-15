param (
    [string]$screenJsonPath,
    [string]$targetDir
)

if (-not (Test-Path $screenJsonPath)) {
    Write-Error "JSON file not found at $screenJsonPath"
    exit 1
}

$screensData = Get-Content $screenJsonPath | ConvertFrom-Json
$screens = $screensData.screens

foreach ($screen in $screens) {
    # Clean up name for directory
    $cleanName = $screen.title -replace 'The Breakery ', ''
    $cleanName = $cleanName -replace '[^a-zA-Z0-9]', '_'
    $screenDir = Join-Path $targetDir $cleanName
    
    Write-Host "Processing: $cleanName..."
    
    if (-not (Test-Path $screenDir)) {
        New-Item -ItemType Directory -Path $screenDir -Force | Out-Null
    }

    # Download HTML
    $htmlPath = Join-Path $screenDir "index.html"
    if ($screen.htmlCode -and $screen.htmlCode.downloadUrl) {
        curl.exe -L -o $htmlPath $screen.htmlCode.downloadUrl
    }

    # Create TSX Wrapper
    $tsxPath = Join-Path $screenDir "$($cleanName).tsx"
    $htmlContent = Get-Content $htmlPath -Raw
    # Escape backticks for JS template literal
    $escapedHtml = $htmlContent -replace '`', '\`'
    
    $tsxContent = @"
import React from 'react';

const ${cleanName}: React.FC = () => {
  return (
    <div dangerouslySetInnerHTML={{ __html: \`
      <!-- STITCH_HTML_START -->
      ${escapedHtml}
      <!-- STITCH_HTML_END -->
    \` }} />
  );
};

export default ${cleanName};
"@
    $tsxContent | Set-Content $tsxPath
}

Write-Host "Import Complete for $($screens.Count) screens."
