
import os
from supabase import create_client, Client
from dotenv import load_dotenv

# Load env variables
load_dotenv('c:\\disk\\AppGrav\\.env')

url: str = os.environ.get("VITE_SUPABASE_URL")
key: str = os.environ.get("VITE_SUPABASE_ANON_KEY")

if not url or not key:
    print("Error: Supabase credentials not found in .env")
    exit(1)

supabase: Client = create_client(url, key)

print("--- DATA VERIFICATION ---")

# 1. Check Products
try:
    res = supabase.table('products').select('*', count='exact').limit(5).execute()
    print(f"Products Count: {res.count}")
    if res.data:
        print("Sample Products (ID, SKU, Name):")
        for p in res.data:
            print(f" - {p['id']} | {p['sku']} | {p['name']}")
    else:
        print("No products found.")
except Exception as e:
    print(f"Error fetching products: {e}")

# 2. Check Recipes
try:
    res = supabase.table('recipes').select('*', count='exact').limit(5).execute()
    print(f"\nRecipes Count: {res.count}")
    if res.data:
        print("Sample Recipes:")
        for r in res.data:
            print(f" - Prod: {r['product_id']} | Mat: {r['material_id']} | Qty: {r['quantity']}")
            
            # Verify if this product exists
            p_check = supabase.table('products').select('name').eq('id', r['product_id']).execute()
            p_name = p_check.data[0]['name'] if p_check.data else "UNKNOWN"
            print(f"   -> For Product: {p_name}")
    else:
        print("No recipes found.")

except Exception as e:
    print(f"Error fetching recipes: {e}")
