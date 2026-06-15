Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

$root = $PSScriptRoot
$outputPath = Join-Path $root 'acgs-bluebridge-api-doc.html'
$sourcePath = Join-Path $root 'acgs-bluebridge-api-doc.source.html'

if (-not (Test-Path $outputPath)) {
    throw "Output file not found: $outputPath"
}

if (-not (Test-Path $sourcePath)) {
    Copy-Item -Path $outputPath -Destination $sourcePath -Force
    Write-Host "Created source snapshot: $sourcePath"
}

$html = Get-Content -Raw -Path $sourcePath

$styleRefs = @'
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
  <link href="css/styles.css" rel="stylesheet">
'@

$scriptRefs = @'
<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
<script src="js/data-integration-spec-bluebridge-safe.js"></script>
<script src="js/data-proposed-additions-bluebridge-safe.js"></script>
<script src="js/data-payload-examples-bluebridge-safe.js"></script>
<script src="js/renderer.js"></script>
<script src="js/data-contract-classification.js"></script>
<script src="js/app.js"></script>
'@

$bootstrapCss = (Invoke-WebRequest -UseBasicParsing -Uri 'https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css').Content
$bootstrapJs = (Invoke-WebRequest -UseBasicParsing -Uri 'https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js').Content
$styles = Get-Content -Raw -Path (Join-Path $root 'css\styles.css')
$integrationSpec = Get-Content -Raw -Path (Join-Path $root 'js\data-integration-spec-bluebridge-safe.js')
$proposedAdditions = Get-Content -Raw -Path (Join-Path $root 'js\data-proposed-additions-bluebridge-safe.js')
$payloadExamples = Get-Content -Raw -Path (Join-Path $root 'js\data-payload-examples-bluebridge-safe.js')
$renderer = Get-Content -Raw -Path (Join-Path $root 'js\renderer.js')
$contractClassification = Get-Content -Raw -Path (Join-Path $root 'js\data-contract-classification.js')
$app = Get-Content -Raw -Path (Join-Path $root 'js\app.js')

$inlineStyles = @"
<style>
$bootstrapCss

$styles
</style>
"@

$inlineScripts = @"
<script>
$bootstrapJs
</script>
<script>
$integrationSpec
</script>
<script>
$proposedAdditions
</script>
<script>
$payloadExamples
</script>
<script>
$renderer
</script>
<script>
$contractClassification
</script>
<script>
$app
</script>
"@

if (-not $html.Contains($styleRefs)) {
    throw 'Expected stylesheet reference block was not found in the source HTML.'
}

if (-not $html.Contains($scriptRefs)) {
    throw 'Expected script reference block was not found in the source HTML.'
}

$standaloneHtml = $html.Replace($styleRefs, $inlineStyles).Replace($scriptRefs, $inlineScripts)
Set-Content -Path $outputPath -Value $standaloneHtml -Encoding UTF8

Write-Host "Standalone file written: $outputPath"
Write-Host "Source template preserved at: $sourcePath"