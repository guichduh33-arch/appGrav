/**
 * Script pour importer les URLs des photos des produits
 * Usage: node scripts/import-product-photos.js
 */

import XLSX from 'xlsx'
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://ekkrzngauxqruvhhstjw.supabase.co'
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVra3J6bmdhdXhxcnV2aGhzdGp3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk1OTAyMzcsImV4cCI6MjA4NTE2NjIzN30.pQIsgG0XhAPTLxHg7Hexjsv61oCLT5L-1ZC88-vVX20'

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

async function main() {
  console.log('🖼️  Importation des photos de produits...\n')

  // 1. Lire le fichier Excel
  const wb = XLSX.readFile('docs/product-1_1000-2026-02-03__.xlsx')
  const ws = wb.Sheets[wb.SheetNames[0]]
  const products = XLSX.utils.sheet_to_json(ws)

  // 2. Filtrer les produits avec photos
  const withPhotos = products.filter(p => p.photo_1)
  console.log(`📊 ${withPhotos.length} produits avec photos dans le fichier\n`)

  // 3. Récupérer les produits existants
  console.log('📦 Récupération des produits en base...')
  const { data: existingProducts, error } = await supabase
    .from('products')
    .select('id, name, image_url')

  if (error) {
    console.error('❌ Erreur:', error)
    return
  }

  // Créer un map nom -> produit
  const productMap = new Map()
  for (const p of existingProducts) {
    productMap.set(p.name.toLowerCase().trim(), p)
  }
  console.log(`   ${existingProducts.length} produits en base\n`)

  // 4. Mettre à jour les photos
  let updated = 0
  let notFound = 0
  let alreadyHasPhoto = 0

  console.log('⏳ Mise à jour des photos...')

  for (const p of withPhotos) {
    const existing = productMap.get(p.name?.toLowerCase().trim())

    if (!existing) {
      notFound++
      continue
    }

    // Si le produit a déjà une photo, on ne la remplace pas
    if (existing.image_url) {
      alreadyHasPhoto++
      continue
    }

    const { error: updateError } = await supabase
      .from('products')
      .update({ image_url: p.photo_1 })
      .eq('id', existing.id)

    if (updateError) {
      console.error(`   ❌ Erreur pour "${p.name}":`, updateError.message)
    } else {
      updated++
      process.stdout.write(`\r   ✅ ${updated} photos mises à jour...`)
    }
  }

  console.log('\n')
  console.log('═══════════════════════════════════════')
  console.log('📊 RÉSULTATS')
  console.log('═══════════════════════════════════════')
  console.log(`   ✅ Photos ajoutées: ${updated}`)
  console.log(`   ⏭️  Déjà avec photo: ${alreadyHasPhoto}`)
  console.log(`   ⚠️  Produits non trouvés: ${notFound}`)
  console.log('═══════════════════════════════════════\n')
}

main().catch(console.error)
