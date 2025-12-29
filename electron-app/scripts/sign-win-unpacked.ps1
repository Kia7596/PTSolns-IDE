param (
  [string]$AppOutDir
)

Write-Host "Signing binaries under $AppOutDir"

$targets = Get-ChildItem $AppOutDir -Recurse -Include *.exe,*.dll -File

Write-Host "Found $($targets.Count) binaries to sign"

foreach ($f in $targets) {
  Write-Host "Signing $($f.FullName)"
  signtool sign `
    /fd SHA256 `
    /tr http://timestamp.digicert.com `
    /td SHA256 `
    "$($f.FullName)"
}
