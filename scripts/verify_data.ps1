
$env:VITE_SUPABASE_URL = (Get-Content c:\disk\AppGrav\.env | Select-String "VITE_SUPABASE_URL").ToString().Split('=')[1].Trim()
$env:VITE_SUPABASE_ANON_KEY = (Get-Content c:\disk\AppGrav\.env | Select-String "VITE_SUPABASE_ANON_KEY").ToString().Split('=')[1].Trim()

$headers = @{
    "apikey" = $env:VITE_SUPABASE_ANON_KEY
    "Authorization" = "Bearer " + $env:VITE_SUPABASE_ANON_KEY
}

Write-Host "--- PRODUCTS ---"
$products = Invoke-RestMethod -Uri "$($env:VITE_SUPABASE_URL)/rest/v1/products?select=id,name&limit=5" -Headers $headers -Method Get
$products | Format-Table -AutoSize

Write-Host "--- RECIPES ---"
$recipes = Invoke-RestMethod -Uri "$($env:VITE_SUPABASE_URL)/rest/v1/recipes?select=*&limit=5" -Headers $headers -Method Get
$recipes | Format-Table -AutoSize
