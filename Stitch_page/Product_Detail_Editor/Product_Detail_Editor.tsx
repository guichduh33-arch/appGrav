import React from 'react';

const Product_Detail_Editor: React.FC = () => {
  return (
    <div dangerouslySetInnerHTML={{ __html: `
      <!-- STITCH_HTML_START -->
      <!DOCTYPE html>
<html lang="en"><head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
<title>The Breakery - Product Detail Editor</title>
<script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
<link href="https://fonts.googleapis.com" rel="preconnect"/>
<link crossorigin="" href="https://fonts.gstatic.com" rel="preconnect"/>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&amp;family=Playfair+Display:ital,wght@0,700;1,700&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<style type="text/tailwindcss">
        :root {
            --deep-onyx: #0D0D0F;
            --aged-gold: #C9A55C;
            --card-onyx: #141417;
            --input-border: #262629;
            --stone-text: #E5E7EB;
        }
        body {
            font-family: 'Inter', sans-serif;
            background-color: var(--deep-onyx);
            color: var(--stone-text);
        }
        .font-display {
            font-family: 'Playfair Display', serif;
        }
        .custom-scrollbar::-webkit-scrollbar {
            width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
            background: var(--deep-onyx);
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
            background: #262629;
            border-radius: 10px;
        }
        input, select, textarea {
            background-color: #0D0D0F !important;
            border-color: var(--input-border) !important;
            color: #FFFFFF !important;
        }
        input:focus, select:focus, textarea:focus {
            border-color: var(--aged-gold) !important;
            outline: none !important;
            box-shadow: 0 0 0 1px var(--aged-gold) !important;
        }
        .material-symbols-outlined {
            font-variation-settings: 'FILL' 0, 'wght' 300, 'GRAD' 0, 'opsz' 24;
            font-size: 20px;
        }
    </style>
</head>
<body class="min-h-screen flex selection:bg-[var(--aged-gold)] selection:text-black">
<aside class="w-64 border-r border-[#1F1F23] bg-[var(--deep-onyx)] hidden lg:flex flex-col sticky top-0 h-screen">
<div class="p-8 border-b border-[#1F1F23]">
<div class="flex items-center gap-3">
<div class="w-10 h-10 border border-[var(--aged-gold)] flex items-center justify-center text-[var(--aged-gold)] font-display text-xl italic">B</div>
<div>
<h1 class="font-display text-lg tracking-tight leading-none text-white">The Breakery</h1>
<span class="text-[9px] uppercase tracking-[0.2em] text-[var(--aged-gold)] font-semibold">Maison de Qualité</span>
</div>
</div>
</div>
<nav class="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-8">
<div>
<p class="text-[10px] uppercase font-bold text-zinc-600 mb-4 px-2 tracking-[0.1em]">Operations</p>
<ul class="space-y-1">
<li><a class="flex items-center gap-3 px-3 py-2.5 rounded text-zinc-400 hover:text-white hover:bg-white/5 transition-all" href="#"><span class="material-symbols-outlined">dashboard</span> <span class="text-sm font-medium">Dashboard</span></a></li>
<li><a class="flex items-center gap-3 px-3 py-2.5 rounded text-zinc-400 hover:text-white hover:bg-white/5 transition-all" href="#"><span class="material-symbols-outlined">point_of_sale</span> <span class="text-sm font-medium">POS Terminal</span></a></li>
<li><a class="flex items-center gap-3 px-3 py-2.5 rounded text-zinc-400 hover:text-white hover:bg-white/5 transition-all" href="#"><span class="material-symbols-outlined">restaurant</span> <span class="text-sm font-medium">Kitchen</span></a></li>
</ul>
</div>
<div>
<p class="text-[10px] uppercase font-bold text-zinc-600 mb-4 px-2 tracking-[0.1em]">Management</p>
<ul class="space-y-1">
<li><a class="flex items-center gap-3 px-3 py-2.5 rounded bg-[var(--aged-gold)]/5 text-[var(--aged-gold)] border border-[var(--aged-gold)]/10" href="#"><span class="material-symbols-outlined">inventory_2</span> <span class="text-sm font-medium">Products</span></a></li>
<li><a class="flex items-center gap-3 px-3 py-2.5 rounded text-zinc-400 hover:text-white hover:bg-white/5 transition-all" href="#"><span class="material-symbols-outlined">warehouse</span> <span class="text-sm font-medium">Stock Control</span></a></li>
<li><a class="flex items-center gap-3 px-3 py-2.5 rounded text-zinc-400 hover:text-white hover:bg-white/5 transition-all" href="#"><span class="material-symbols-outlined">analytics</span> <span class="text-sm font-medium">Reports</span></a></li>
</ul>
</div>
</nav>
<div class="p-6 border-t border-[#1F1F23]">
<div class="flex items-center gap-3 p-2 bg-white/5 rounded-lg border border-white/5">
<div class="w-8 h-8 bg-zinc-800 rounded flex items-center justify-center text-xs font-bold text-[var(--aged-gold)]">AD</div>
<div class="flex-1">
<p class="text-xs font-semibold text-white">Administrator</p>
<p class="text-[10px] text-zinc-500 uppercase">Main Branch</p>
</div>
<button class="text-zinc-600 hover:text-white"><span class="material-symbols-outlined">logout</span></button>
</div>
</div>
</aside>
<main class="flex-1 flex flex-col min-w-0 bg-[var(--deep-onyx)]">
<header class="border-b border-[#1F1F23] px-10 py-6 sticky top-0 z-20 bg-[var(--deep-onyx)]/90 backdrop-blur-md">
<div class="max-w-6xl mx-auto flex items-center justify-between">
<div class="flex items-center gap-6">
<button class="w-10 h-10 rounded border border-[#1F1F23] flex items-center justify-center text-zinc-400 hover:text-white hover:border-zinc-700 transition-colors">
<span class="material-symbols-outlined">arrow_back</span>
</button>
<div>
<h2 class="text-3xl font-display text-white tracking-tight">Affogato</h2>
<div class="flex items-center gap-3 mt-1.5">
<span class="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">SKU Identity:</span>
<span class="text-[10px] font-mono text-[var(--aged-gold)] bg-[var(--aged-gold)]/10 px-2 py-0.5 border border-[var(--aged-gold)]/20 rounded">COF_12</span>
</div>
</div>
</div>
<button class="bg-[var(--aged-gold)] hover:bg-[#B89650] text-black font-bold px-10 py-3 rounded-sm flex items-center gap-2 transition-all uppercase tracking-widest text-xs">
                    Save Changes
                </button>
</div>
</header>
<div class="border-b border-[#1F1F23] px-10">
<div class="max-w-6xl mx-auto flex gap-10">
<button class="py-5 text-xs font-bold uppercase tracking-widest border-b-2 border-[var(--aged-gold)] text-[var(--aged-gold)]">General</button>
<button class="py-5 text-xs font-bold uppercase tracking-widest border-b-2 border-transparent text-zinc-500 hover:text-zinc-300">Units</button>
<button class="py-5 text-xs font-bold uppercase tracking-widest border-b-2 border-transparent text-zinc-500 hover:text-zinc-300">Recipe</button>
<button class="py-5 text-xs font-bold uppercase tracking-widest border-b-2 border-transparent text-zinc-500 hover:text-zinc-300">Variants</button>
<button class="py-5 text-xs font-bold uppercase tracking-widest border-b-2 border-transparent text-zinc-500 hover:text-zinc-300">Costing</button>
<button class="py-5 text-xs font-bold uppercase tracking-widest border-b-2 border-transparent text-zinc-500 hover:text-zinc-300">Prices</button>
</div>
</div>
<div class="p-10 space-y-8 max-w-6xl mx-auto w-full pb-24">
<div class="grid grid-cols-1 lg:grid-cols-5 gap-8">
<section class="lg:col-span-3 bg-[var(--card-onyx)] border border-[#1F1F23] rounded-sm shadow-2xl">
<div class="p-8 border-b border-[#1F1F23]">
<h3 class="font-display text-xl text-white">Product Identity</h3>
</div>
<div class="p-8 space-y-8">
<div>
<label class="block text-[10px] font-bold text-zinc-500 uppercase tracking-[0.15em] mb-3">Product Name</label>
<input class="w-full rounded-sm px-4 py-3 text-sm transition-all focus:ring-0" type="text" value="Affogato"/>
</div>
<div class="grid grid-cols-2 gap-6">
<div>
<label class="block text-[10px] font-bold text-zinc-500 uppercase tracking-[0.15em] mb-3">SKU Code</label>
<input class="w-full rounded-sm px-4 py-3 text-sm transition-all focus:ring-0" type="text" value="COF_12"/>
</div>
<div>
<label class="block text-[10px] font-bold text-zinc-500 uppercase tracking-[0.15em] mb-3">Category</label>
<select class="w-full rounded-sm px-4 py-3 text-sm transition-all focus:ring-0">
<option>Coffee / Espresso Based</option>
<option>Viennoiserie</option>
<option>Sourdough</option>
<option>Dessert</option>
</select>
</div>
</div>
<div>
<label class="block text-[10px] font-bold text-zinc-500 uppercase tracking-[0.15em] mb-3">Product Description</label>
<textarea class="w-full rounded-sm px-4 py-3 text-sm transition-all focus:ring-0 resize-none" rows="4">A classic Italian dessert-style coffee, featuring a double shot of house-blend espresso poured over a scoop of artisanal vanilla bean gelato.</textarea>
</div>
</div>
</section>
<section class="lg:col-span-2 flex flex-col gap-8">
<div class="bg-[var(--card-onyx)] border border-[#1F1F23] rounded-sm shadow-2xl h-full flex flex-col">
<div class="p-8 border-b border-[#1F1F23]">
<h3 class="font-display text-xl text-white">Finance &amp; POS</h3>
</div>
<div class="p-8 flex-1 space-y-8">
<div class="grid grid-cols-1 gap-6">
<div>
<label class="block text-[10px] font-bold text-zinc-500 uppercase tracking-[0.15em] mb-3">Retail Price (IDR)</label>
<div class="relative">
<span class="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 text-xs font-mono">Rp</span>
<input class="w-full rounded-sm pl-12 pr-4 py-3 text-sm font-semibold transition-all focus:ring-0" type="number" value="45000"/>
</div>
</div>
<div>
<label class="block text-[10px] font-bold text-zinc-500 uppercase tracking-[0.15em] mb-3">Fixed Production Cost</label>
<div class="relative">
<span class="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 text-xs font-mono">Rp</span>
<input class="w-full rounded-sm pl-12 pr-4 py-3 text-sm font-semibold transition-all focus:ring-0" type="number" value="12500"/>
</div>
</div>
</div>
<div class="space-y-4 pt-4 border-t border-[#1F1F23]">
<label class="flex items-center justify-between p-4 bg-black/40 border border-[#1F1F23] rounded-sm cursor-pointer group hover:border-[var(--aged-gold)] transition-colors">
<div>
<p class="text-xs font-bold text-white uppercase tracking-wider">Visible on POS</p>
<p class="text-[9px] text-zinc-500 mt-1">Include this item in active sales menu</p>
</div>
<div class="relative inline-flex items-center cursor-pointer">
<input checked="" class="sr-only peer" type="checkbox" value=""/>
<div class="w-9 h-5 bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-zinc-400 after:border-zinc-400 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[var(--aged-gold)] peer-checked:after:bg-black peer-checked:after:border-black"></div>
</div>
</label>
<label class="flex items-center justify-between p-4 bg-black/40 border border-[#1F1F23] rounded-sm cursor-pointer group hover:border-[var(--aged-gold)] transition-colors">
<div>
<p class="text-xs font-bold text-white uppercase tracking-wider">Deduct Ingredients</p>
<p class="text-[9px] text-zinc-500 mt-1">Real-time inventory subtraction on sale</p>
</div>
<div class="relative inline-flex items-center cursor-pointer">
<input checked="" class="sr-only peer" type="checkbox" value=""/>
<div class="w-9 h-5 bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-zinc-400 after:border-zinc-400 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[var(--aged-gold)] peer-checked:after:bg-black peer-checked:after:border-black"></div>
</div>
</label>
</div>
</div>
</div>
</section>
</div>
<section class="bg-[var(--card-onyx)] border border-[#1F1F23] rounded-sm shadow-2xl">
<div class="p-8 border-b border-[#1F1F23] flex items-center justify-between">
<div>
<h3 class="font-display text-xl text-white">Usage Sections</h3>
<p class="text-[10px] text-zinc-500 mt-1 uppercase tracking-widest italic">Departmental availability for production and inventory</p>
</div>
</div>
<div class="p-8">
<div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
<div class="relative cursor-pointer border border-[#1F1F23] rounded-sm p-6 bg-black/20 hover:border-zinc-700 transition-all flex flex-col items-center text-center group">
<span class="material-symbols-outlined text-zinc-500 group-hover:text-zinc-300 mb-4 scale-125">warehouse</span>
<span class="text-xs font-bold text-zinc-400 uppercase tracking-widest">Warehouse</span>
<span class="text-[8px] uppercase font-bold text-zinc-600 mt-1">Storage</span>
</div>
<div class="relative cursor-pointer border border-[#1F1F23] rounded-sm p-6 bg-black/20 hover:border-zinc-700 transition-all flex flex-col items-center text-center group">
<span class="material-symbols-outlined text-zinc-500 group-hover:text-zinc-300 mb-4 scale-125">bakery_dining</span>
<span class="text-xs font-bold text-zinc-400 uppercase tracking-widest">Viennoiserie</span>
<span class="text-[8px] uppercase font-bold text-zinc-600 mt-1">Bakery</span>
</div>
<div class="relative cursor-pointer border border-[#1F1F23] rounded-sm p-6 bg-black/20 hover:border-zinc-700 transition-all flex flex-col items-center text-center group">
<span class="material-symbols-outlined text-zinc-500 group-hover:text-zinc-300 mb-4 scale-125">cake</span>
<span class="text-xs font-bold text-zinc-400 uppercase tracking-widest">Pastry</span>
<span class="text-[8px] uppercase font-bold text-zinc-600 mt-1">Atelier</span>
</div>
<div class="relative cursor-pointer border border-[#1F1F23] rounded-sm p-6 bg-black/20 hover:border-zinc-700 transition-all flex flex-col items-center text-center group">
<span class="material-symbols-outlined text-zinc-500 group-hover:text-zinc-300 mb-4 scale-125">breakfast_dining</span>
<span class="text-xs font-bold text-zinc-400 uppercase tracking-widest">Bakery</span>
<span class="text-[8px] uppercase font-bold text-zinc-600 mt-1">Bread</span>
</div>
<div class="relative cursor-pointer border border-[#1F1F23] rounded-sm p-6 bg-black/20 hover:border-zinc-700 transition-all flex flex-col items-center text-center group">
<span class="material-symbols-outlined text-zinc-500 group-hover:text-zinc-300 mb-4 scale-125">soup_kitchen</span>
<span class="text-xs font-bold text-zinc-400 uppercase tracking-widest">Kitchen</span>
<span class="text-[8px] uppercase font-bold text-zinc-600 mt-1">Cuisine</span>
</div>
<div class="relative cursor-pointer border-2 border-[var(--aged-gold)] rounded-sm p-6 bg-[var(--aged-gold)]/5 flex flex-col items-center text-center shadow-[0_0_20px_rgba(201,165,92,0.1)]">
<span class="material-symbols-outlined text-[var(--aged-gold)] mb-4 scale-125">local_cafe</span>
<span class="text-xs font-black text-white uppercase tracking-[0.1em]">Cafe</span>
<span class="text-[8px] uppercase font-bold text-[var(--aged-gold)] mt-1">Sales</span>
<div class="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-[var(--aged-gold)] text-black px-3 py-1 rounded-sm flex items-center gap-1.5 whitespace-nowrap shadow-lg">
<span class="material-symbols-outlined text-[10px] font-bold">star</span>
<span class="text-[8px] font-black uppercase tracking-tighter">Primary Section</span>
</div>
<div class="absolute top-2 right-2">
<div class="w-4 h-4 bg-[var(--aged-gold)] rounded-full flex items-center justify-center">
<span class="material-symbols-outlined text-[10px] text-black font-black">check</span>
</div>
</div>
</div>
</div>
</div>
</section>
</div>
</main>
<div class="fixed bottom-8 left-[calc(16rem+2.5rem)] flex items-center gap-4 z-30">
<div class="bg-[#1A1A1E] text-white px-5 py-2.5 rounded-sm shadow-2xl flex items-center gap-3 border border-[#262629]">
<div class="w-1.5 h-1.5 rounded-full bg-[var(--aged-gold)]"></div>
<span class="text-[10px] font-bold uppercase tracking-[0.2em]">Live Draft: COF_12</span>
</div>
</div>

</body></html>
      <!-- STITCH_HTML_END -->
    ` }} />
  );
};

export default Product_Detail_Editor;
