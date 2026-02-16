# scripts/repair-migrations.ps1
# Repair Supabase migration history alignment
# Run from project root: .\scripts\repair-migrations.ps1

Set-Location $PSScriptRoot\..

Write-Host "=== Phase 1: Marking orphan migrations as REVERTED ===" -ForegroundColor Yellow
Write-Host "These migrations exist in remote but not locally" -ForegroundColor Gray

# 71 migrations to revert (exist in remote but not locally)
$revertMigrations = @(
    "20260210113534", "20260210113544", "20260210113610", "20260210113620",
    "20260210113636", "20260210113813", "20260210131118", "20260210131200",
    "20260210131242", "20260210131309", "20260210131334", "20260210131344",
    "20260210131452", "20260210135917", "20260210193456", "20260210193505",
    "20260210193531", "20260210193543", "20260210193559", "20260210193731",
    "20260210193741", "20260211160233", "20260211170810", "20260211170853",
    "20260211170952", "20260211180630", "20260211235237", "20260211235239",
    "20260211235356", "20260211235403", "20260211235414", "20260211235429",
    "20260211235456", "20260212125635", "20260212125648", "20260212125655",
    "20260212125713", "20260212125727", "20260212125737", "20260212125749",
    "20260212125940", "20260212130021", "20260212131632", "20260212131936",
    "20260212131953", "20260212133454", "20260212172739", "20260213004856",
    "20260213185714", "20260215025652", "20260215025703", "20260215025720",
    "20260215025737", "20260215025743", "20260215025758", "20260215025926",
    "20260215025959", "20260215030039", "20260215030101", "20260215030119",
    "20260215030138", "20260215030207", "20260215094650", "20260215105505",
    "20260215112713", "20260215113051", "20260215114828", "20260215123421",
    "20260215130518", "20260215221118"
)

$revertCount = 0
foreach ($m in $revertMigrations) {
    $revertCount++
    Write-Host "[$revertCount/$($revertMigrations.Count)] Reverting $m..." -ForegroundColor DarkGray
    supabase migration repair --status reverted $m 2>$null
}

Write-Host "`n=== Phase 2: Marking local migrations as APPLIED ===" -ForegroundColor Green
Write-Host "These migrations exist locally and should be marked as applied" -ForegroundColor Gray

# 35 migrations to mark as applied
$applyMigrations = @(
    "20260210100000", "20260210100001", "20260210100002", "20260210100003",
    "20260210100004", "20260210100005", "20260210110000", "20260210110001",
    "20260210110002", "20260210110003", "20260210110004", "20260210110005",
    "20260210110006", "20260210120000", "20260211100000", "20260212100000",
    "20260212110000", "20260212110001", "20260212110002", "20260212110003",
    "20260212110004", "20260212120000", "20260212130000", "20260212140000",
    "20260212150000", "20260212160000", "20260212170000", "20260212170001",
    "20260212180000", "20260212190000", "20260216100000", "20260216100100",
    "20260216100200", "20260216100300", "20260216100400", "20260216100500"
)

$applyCount = 0
foreach ($m in $applyMigrations) {
    $applyCount++
    Write-Host "[$applyCount/$($applyMigrations.Count)] Applying $m..." -ForegroundColor DarkGray
    supabase migration repair --status applied $m 2>$null
}

Write-Host "`n=== Phase 3: Verifying synchronization ===" -ForegroundColor Cyan
Write-Host "Running 'supabase db pull' to verify..." -ForegroundColor Gray

$result = supabase db pull 2>&1

if ($LASTEXITCODE -eq 0) {
    Write-Host "`n✅ Migration repair complete! History is now synchronized." -ForegroundColor Green
} else {
    Write-Host "`n⚠️ Some issues remain. Output:" -ForegroundColor Yellow
    Write-Host $result
}
