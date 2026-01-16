#!/bin/bash
echo "🚀 Démarrage AppGrav Stack (Vite + Supabase)"

# Start Supabase
npx supabase start

# Update keys (simple grep approach or manual)
# ...

# Start Frontend
npm run dev
