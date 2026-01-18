"""
BackendAgent - Génère des Supabase Edge Functions
"""

from pathlib import Path
import os

class BackendAgent:
    """
    Agent spécialisé dans le backend Supabase (Edge Functions).
    Target: supabase/functions/
    """
    
    def __init__(self, project_path: str = "."):
        self.project_path = Path(project_path)
        self.functions_path = self.project_path / "supabase" / "functions"
        self.functions_path.mkdir(parents=True, exist_ok=True)
    
    def create_edge_function(self, name: str, context: dict = None) -> str:
        """
        Crée une nouvelle Edge Function Deno
        """
        print(f"⚡ Création Edge Function '{name}'...")
        
        recs = ""
        if context and "recommendations" in context:
            recs = "\n// Design Recommendations:\n"
            for rec in context["recommendations"]:
                recs += f"// - {rec}\n"
        
        func_dir = self.functions_path / name
        func_dir.mkdir(parents=True, exist_ok=True)
        
        file_path = func_dir / "index.ts"
        
        content = recs + '''import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    )

    const { name } = await req.json()
    const data = { message: `Hello ${name}!` }

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
'''
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)
            
        print(f"✅ Fonction créée : {file_path}")
        return str(file_path)

if __name__ == "__main__":
    agent = BackendAgent(".")
    agent.create_edge_function("example-function")
