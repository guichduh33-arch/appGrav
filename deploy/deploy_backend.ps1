# Deploy Supabase Backend
Write-Host "🚀 Deploying Supabase Migrations..."
npx supabase db push

Write-Host "⚡ Deploying Edge Functions..."
npx supabase functions deploy

Write-Host "✅ Backend Deployed Successfully"
