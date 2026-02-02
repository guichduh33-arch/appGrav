/**
 * Génère le SQL pour mettre à jour les photos des produits
 */

import XLSX from 'xlsx'
import { createClient } from '@supabase/supabase-js'
import { writeFileSync } from 'fs'

const SUPABASE_URL = 'https://ekkrzngauxqruvhhstjw.supabase.co'
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVra3J6bmdhdXhxcnV2aGhzdGp3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk1OTAyMzcsImV4cCI6MjA4NTE2NjIzN30.pQIsgG0XhAPTLxHg7Hexjsv61oCLT5L-1ZC88-vVX20'

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

async function main() {
  console.log('📦 Récupération des produits...')
  const { data: products } = await supabase.from('products').select('id, name')
  const productMap = new Map(products.map(p => [p.name.toLowerCase().trim(), p.id]))
  console.log(`   ${products.length} produits`)

  console.log('📊 Lecture du fichier Excel...')
  const wb = XLSX.readFile('docs/product-1_1000-2026-02-03__.xlsx')
  const ws = wb.Sheets[wb.SheetNames[0]]
  const data = XLSX.utils.sheet_to_json(ws)

  const withPhotos = data.filter(p => p.photo_1)
  console.log(`   ${withPhotos.length} produits avec photos`)

  const sqlStatements = []
  const seen = new Set()
  let matched = 0

  for (const p of withPhotos) {
    const productId = productMap.get(p.name?.toLowerCase().trim())
    if (!productId || seen.has(productId)) continue
    seen.add(productId)

    const imageUrl = p.photo_1.replace(/'/g, "''")
    sqlStatements.push(`  UPDATE products SET image_url = '${imageUrl}' WHERE id = '${productId}';`)
    matched++
  }

  console.log(`   ${matched} produits trouvés en base`)

  const sql = `-- Migration: Update product images
-- Generated: ${new Date().toISOString()}
-- Total updates: ${sqlStatements.length}

${sqlStatements.join('\n')}
`

  const filename = 'supabase/migrations/20260203100001_update_product_images.sql'
  writeFileSync(filename, sql)
  console.log(`\n✅ Fichier créé: ${filename}`)
}

main().catch(console.error)
