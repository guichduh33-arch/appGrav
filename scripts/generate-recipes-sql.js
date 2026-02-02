/**
 * Script pour générer le SQL d'importation des recettes
 * Usage: node scripts/generate-recipes-sql.js > supabase/migrations/xxx.sql
 */

import XLSX from 'xlsx'
import { createClient } from '@supabase/supabase-js'
import { writeFileSync } from 'fs'

const SUPABASE_URL = 'https://ekkrzngauxqruvhhstjw.supabase.co'
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVra3J6bmdhdXhxcnV2aGhzdGp3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk1OTAyMzcsImV4cCI6MjA4NTE2NjIzN30.pQIsgG0XhAPTLxHg7Hexjsv61oCLT5L-1ZC88-vVX20'

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

async function main() {
  console.log('📦 Récupération des produits...')

  const { data: products, error } = await supabase.from('products').select('id, name')
  if (error) {
    console.error('Erreur:', error)
    return
  }

  const productMap = new Map(products.map(p => [p.name.toLowerCase().trim(), p.id]))
  console.log(`   ${products.length} produits trouvés`)

  // Read Excel
  console.log('📊 Lecture du fichier Excel...')
  const wb = XLSX.readFile('docs/Product Materials-2026-01-01__2026-01-14.xlsx')
  const ws = wb.Sheets[wb.SheetNames[0]]
  const recipes = XLSX.utils.sheet_to_json(ws)
  console.log(`   ${recipes.length} lignes de recettes`)

  // Generate SQL
  const sqlValues = []
  const seen = new Set()
  let notFound = 0

  for (const r of recipes) {
    const productName = r.product?.trim()
    const materialName = r.material?.trim()
    if (!productName || !materialName) continue

    const productId = productMap.get(productName.toLowerCase())
    const materialId = productMap.get(materialName.toLowerCase())

    if (!productId || !materialId) {
      notFound++
      continue
    }

    const key = `${productId}-${materialId}`
    if (seen.has(key)) continue
    seen.add(key)

    const quantity = (r.qty || 0) * (r['uom conversion'] || 1)
    const unit = (r.uom || 'kg').replace(/'/g, "''")

    sqlValues.push(`  ('${productId}', '${materialId}', ${quantity}, '${unit}', true)`)
  }

  console.log(`\n📋 Résultat:`)
  console.log(`   ${sqlValues.length} recettes uniques à importer`)
  console.log(`   ${notFound} lignes ignorées (produit non trouvé)`)

  // Write SQL file
  const sql = `-- Migration: Import recipes from Excel
-- Generated: ${new Date().toISOString()}
-- Total recipes: ${sqlValues.length}

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active) VALUES
${sqlValues.join(',\n')}
ON CONFLICT (product_id, material_id) DO UPDATE SET
  quantity = EXCLUDED.quantity,
  unit = EXCLUDED.unit,
  updated_at = NOW();
`

  const filename = `supabase/migrations/20260203100000_import_recipes.sql`
  writeFileSync(filename, sql)
  console.log(`\n✅ Fichier SQL créé: ${filename}`)
}

main().catch(console.error)
