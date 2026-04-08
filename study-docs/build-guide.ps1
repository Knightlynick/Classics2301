$ErrorActionPreference = "Stop"

$scriptRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$texFile = Join-Path $scriptRoot "final_exam_study_guide.tex"
$buildDir = Join-Path $scriptRoot "latex-build"
$outputPdf = Join-Path $scriptRoot "final_exam_study_guide.pdf"

if (-not (Test-Path $buildDir)) {
  New-Item -ItemType Directory -Path $buildDir | Out-Null
}

$pdflatexArgs = @(
  "-interaction=nonstopmode",
  "-halt-on-error",
  "-output-directory=$buildDir",
  $texFile
)

Push-Location $scriptRoot
try {
  & pdflatex @pdflatexArgs | Out-Host
  & pdflatex @pdflatexArgs | Out-Host

  $builtPdf = Join-Path $buildDir "final_exam_study_guide.pdf"
  if (-not (Test-Path $builtPdf)) {
    throw "Expected PDF was not created: $builtPdf"
  }

  Copy-Item -LiteralPath $builtPdf -Destination $outputPdf -Force
  Write-Host "Built $outputPdf"
}
finally {
  Pop-Location
}
