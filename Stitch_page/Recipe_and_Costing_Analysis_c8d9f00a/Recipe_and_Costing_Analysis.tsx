import React from 'react';

const Recipe_and_Costing_Analysis: React.FC = () => {
  return (
    <div dangerouslySetInnerHTML={{ __html: `
      <!-- STITCH_HTML_START -->
      <!DOCTYPE html>

<html class="dark" lang="en"><head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
<title>The Breakery | Recipe &amp; Costing Analysis</title>
<script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&amp;family=Playfair+Display:ital,wght@0,400;0,700;1,400&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<script id="tailwind-config">
        tailwind.config = {
            darkMode: "class",
            theme: {
                extend: {
                    colors: {
                        "primary": "#c6a15d",
                        "background-light": "#f8f7f6",
                        "background-dark": "#0D0D0F",
                        "onyx-lighter": "#1A1A1C",
                        "stone-text": "#E5E7EB",
                        "stone-muted": "#9CA3AF",
                    },
                    fontFamily: {
                        "display": ["Inter", "sans-serif"],
                        "serif": ["Playfair Display", "serif"]
                    },
                    borderRadius: {
                        "DEFAULT": "0.25rem",
                        "lg": "0.5rem",
                        "xl": "0.75rem",
                        "full": "9999px"
                    },
                },
            },
        }
    </script>
<style>
        body {
            background-color: #0D0D0F;
            color: #E5E7EB;
        }
        .recipe-table th {
            font-weight: 500;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            font-size: 0.75rem;
            color: #9CA3AF;
            border-bottom: 1px solid rgba(198, 161, 93, 0.2);
        }
        .recipe-table td {
            border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        }
        .custom-ring {
            box-shadow: 0 0 0 1px rgba(198, 161, 93, 0.3);
        }
    </style>
</head>
<body class="font-display bg-background-light dark:bg-background-dark min-h-screen">
<!-- Navigation Bar -->
<nav class="border-b border-primary/10 bg-background-dark/80 backdrop-blur-md sticky top-0 z-50">
<div class="max-w-[1600px] mx-auto px-8 h-20 flex items-center justify-between">
<div class="flex items-center gap-8">
<span class="font-serif text-2xl tracking-tight text-primary">The Breakery</span>
<div class="hidden md:flex items-center gap-6 text-sm font-medium text-stone-muted">
<a class="hover:text-primary transition-colors" href="#">Inventory</a>
<a class="text-primary border-b border-primary pt-1" href="#">Recipes</a>
<a class="hover:text-primary transition-colors" href="#">Production</a>
<a class="hover:text-primary transition-colors" href="#">Analytics</a>
</div>
</div>
<div class="flex items-center gap-4">
<button class="p-2 text-stone-muted hover:text-primary transition-colors">
<span class="material-icons text-xl">search</span>
</button>
<button class="p-2 text-stone-muted hover:text-primary transition-colors">
<span class="material-icons text-xl">notifications</span>
</button>
<div class="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20">
<span class="material-icons text-primary">account_circle</span>
</div>
</div>
</div>
</nav>
<main class="max-w-[1600px] mx-auto px-8 py-10">
<!-- Breadcrumbs & Header -->
<header class="mb-10">
<div class="flex items-center gap-2 text-xs uppercase tracking-widest text-stone-muted mb-4">
<span>Catalogue</span>
<span class="material-icons text-[10px]">chevron_right</span>
<span>Pastries</span>
<span class="material-icons text-[10px]">chevron_right</span>
<span class="text-primary/80">Recipe Analysis</span>
</div>
<div class="flex flex-col md:flex-row md:items-end justify-between gap-6">
<div>
<h1 class="font-serif text-5xl text-stone-text mb-2">Valrhona Eclair</h1>
<p class="text-stone-muted font-light max-w-2xl">Premium dark chocolate choux pastry with Guanaja 70% ganache, fleur de sel caramel, and gold leaf finish.</p>
</div>
<div class="flex gap-3">
<button class="px-5 py-2.5 rounded border border-primary/30 text-stone-text text-sm hover:bg-primary/10 transition-all flex items-center gap-2">
<span class="material-icons text-sm">file_download</span> Export PDF
                    </button>
<button class="px-5 py-2.5 rounded bg-primary text-background-dark font-semibold text-sm hover:bg-primary/90 transition-all flex items-center gap-2">
<span class="material-icons text-sm">save</span> Save Revision
                    </button>
</div>
</div>
</header>
<div class="grid grid-cols-1 lg:grid-cols-12 gap-8">
<!-- Left Column: Recipe Composition -->
<div class="lg:col-span-8 space-y-6">
<div class="bg-onyx-lighter border border-white/5 rounded-xl overflow-hidden shadow-2xl">
<div class="p-6 border-b border-white/5 flex items-center justify-between">
<h2 class="text-lg font-medium text-stone-text flex items-center gap-2">
<span class="material-icons text-primary">restaurant_menu</span>
                            Recipe Composition
                        </h2>
<span class="text-xs text-stone-muted">Batch Size: 24 Units</span>
</div>
<div class="overflow-x-auto">
<table class="w-full text-left recipe-table">
<thead>
<tr>
<th class="px-6 py-4">Ingredient Name</th>
<th class="px-6 py-4">Quantity</th>
<th class="px-6 py-4 text-center">Unit</th>
<th class="px-6 py-4 text-center">Yield %</th>
<th class="px-6 py-4 text-right">Cost/Unit</th>
<th class="px-6 py-4 text-right">Subtotal</th>
</tr>
</thead>
<tbody class="text-sm">
<tr class="hover:bg-white/5 transition-colors group">
<td class="px-6 py-4 text-stone-text">Valrhona Guanaja 70%</td>
<td class="px-6 py-4"><input class="bg-transparent border-none p-0 w-16 focus:ring-0 text-stone-text" type="number" value="450"/></td>
<td class="px-6 py-4 text-center text-stone-muted font-light">g</td>
<td class="px-6 py-4 text-center text-stone-muted font-light">100%</td>
<td class="px-6 py-4 text-right text-stone-muted font-light">€34.50</td>
<td class="px-6 py-4 text-right font-medium text-primary">€15.53</td>
</tr>
<tr class="hover:bg-white/5 transition-colors group">
<td class="px-6 py-4 text-stone-text">Normandy Unsalted Butter</td>
<td class="px-6 py-4"><input class="bg-transparent border-none p-0 w-16 focus:ring-0 text-stone-text" type="number" value="250"/></td>
<td class="px-6 py-4 text-center text-stone-muted font-light">g</td>
<td class="px-6 py-4 text-center text-stone-muted font-light">98%</td>
<td class="px-6 py-4 text-right text-stone-muted font-light">€12.20</td>
<td class="px-6 py-4 text-right font-medium text-primary">€3.05</td>
</tr>
<tr class="hover:bg-white/5 transition-colors group">
<td class="px-6 py-4 text-stone-text">Madagascar Bourbon Vanilla</td>
<td class="px-6 py-4"><input class="bg-transparent border-none p-0 w-16 focus:ring-0 text-stone-text" type="number" value="2"/></td>
<td class="px-6 py-4 text-center text-stone-muted font-light">pcs</td>
<td class="px-6 py-4 text-center text-stone-muted font-light">100%</td>
<td class="px-6 py-4 text-right text-stone-muted font-light">€4.50</td>
<td class="px-6 py-4 text-right font-medium text-primary">€9.00</td>
</tr>
<tr class="hover:bg-white/5 transition-colors group">
<td class="px-6 py-4 text-stone-text">Label Rouge Flour T55</td>
<td class="px-6 py-4"><input class="bg-transparent border-none p-0 w-16 focus:ring-0 text-stone-text" type="number" value="500"/></td>
<td class="px-6 py-4 text-center text-stone-muted font-light">g</td>
<td class="px-6 py-4 text-center text-stone-muted font-light">95%</td>
<td class="px-6 py-4 text-right text-stone-muted font-light">€2.80</td>
<td class="px-6 py-4 text-right font-medium text-primary">€1.40</td>
</tr>
<tr class="hover:bg-white/5 transition-colors group">
<td class="px-6 py-4 text-stone-text">Fleur de Sel de Guérande</td>
<td class="px-6 py-4"><input class="bg-transparent border-none p-0 w-16 focus:ring-0 text-stone-text" type="number" value="5"/></td>
<td class="px-6 py-4 text-center text-stone-muted font-light">g</td>
<td class="px-6 py-4 text-center text-stone-muted font-light">100%</td>
<td class="px-6 py-4 text-right text-stone-muted font-light">€18.00</td>
<td class="px-6 py-4 text-right font-medium text-primary">€0.09</td>
</tr>
</tbody>
</table>
</div>
<div class="p-6 bg-white/5 flex items-center justify-between">
<button class="text-primary text-sm font-medium flex items-center gap-2 hover:opacity-80 transition-opacity">
<span class="material-icons text-lg">add_circle_outline</span>
                            Add Ingredient
                        </button>
<div class="text-right">
<span class="text-stone-muted text-xs uppercase block tracking-wider">Base Material Cost</span>
<span class="text-2xl font-semibold text-stone-text">€29.07</span>
</div>
</div>
</div>
<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
<div class="bg-onyx-lighter border border-white/5 rounded-xl p-6">
<h3 class="text-sm font-medium text-stone-text mb-4">Method Summary</h3>
<div class="space-y-3">
<div class="flex items-start gap-3">
<span class="h-6 w-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs shrink-0">1</span>
<p class="text-xs text-stone-muted">Prepare choux pastry using Normandy butter and T55 flour. Bake at 180°C for 25 minutes.</p>
</div>
<div class="flex items-start gap-3">
<span class="h-6 w-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs shrink-0">2</span>
<p class="text-xs text-stone-muted">Infuse cream with Madagascar vanilla and melt Valrhona Guanaja. Emulsify until glossy.</p>
</div>
</div>
</div>
<div class="bg-onyx-lighter border border-white/5 rounded-xl p-6">
<h3 class="text-sm font-medium text-stone-text mb-4">Storage &amp; Shelf Life</h3>
<div class="flex gap-4">
<div class="flex-1 border border-white/5 rounded p-3 bg-black/20">
<span class="text-[10px] uppercase text-stone-muted block mb-1">Temperature</span>
<span class="text-sm text-stone-text">4°C - 6°C</span>
</div>
<div class="flex-1 border border-white/5 rounded p-3 bg-black/20">
<span class="text-[10px] uppercase text-stone-muted block mb-1">Duration</span>
<span class="text-sm text-stone-text">48 Hours</span>
</div>
</div>
</div>
</div>
</div>
<!-- Right Column: Financial Analysis -->
<div class="lg:col-span-4 space-y-6">
<!-- Main Costing Card -->
<div class="bg-onyx-lighter border border-primary/20 rounded-xl overflow-hidden shadow-2xl relative">
<div class="absolute top-0 right-0 p-4">
<span class="material-icons text-primary/30">analytics</span>
</div>
<div class="p-8">
<h2 class="text-xl font-medium text-stone-text mb-8">Financial Analysis</h2>
<div class="space-y-6">
<!-- Production Breakdown -->
<div class="space-y-3">
<div class="flex justify-between items-center text-sm">
<span class="text-stone-muted">Raw Material Cost</span>
<span class="text-stone-text font-medium">€29.07</span>
</div>
<div class="flex justify-between items-center text-sm">
<span class="text-stone-muted">Labor Cost (25%)</span>
<span class="text-stone-text font-medium">€7.27</span>
</div>
<div class="flex justify-between items-center text-sm">
<span class="text-stone-muted">Wastage (5%)</span>
<span class="text-stone-text font-medium">€1.45</span>
</div>
<div class="pt-3 border-t border-white/10 flex justify-between items-center">
<span class="text-stone-text font-semibold">Total Production Cost</span>
<span class="text-xl font-bold text-primary">€37.79</span>
</div>
<div class="text-right">
<span class="text-[10px] text-stone-muted uppercase italic">Per unit: €1.57</span>
</div>
</div>
<div class="h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent my-8"></div>
<!-- Pricing Strategy -->
<div class="space-y-4">
<div class="bg-black/40 rounded-lg p-4 space-y-3">
<div class="flex justify-between items-center text-sm">
<span class="text-stone-muted">Current Retail Price</span>
<span class="text-stone-text font-medium">€7.50</span>
</div>
<div class="flex justify-between items-center text-sm">
<span class="text-stone-muted">Target Margin (75%)</span>
<span class="text-stone-text font-medium">€5.62</span>
</div>
<div class="flex justify-between items-center text-sm border-t border-white/5 pt-3">
<span class="text-primary font-medium">Suggested Retail Price</span>
<span class="text-2xl font-serif text-primary">€6.28</span>
</div>
</div>
<p class="text-[11px] text-stone-muted text-center italic">Pricing exceeds target margin by 19.4% based on current retail.</p>
</div>
</div>
</div>
</div>
<!-- Contribution Chart -->
<div class="bg-onyx-lighter border border-white/5 rounded-xl p-8">
<h3 class="text-sm font-medium text-stone-text mb-8">Cost Contribution</h3>
<div class="relative flex justify-center mb-8">
<!-- Custom CSS SVG Doughnut Chart -->
<div class="w-48 h-48 relative">
<svg class="w-full h-full transform -rotate-90" viewbox="0 0 100 100">
<!-- Background circle -->
<circle cx="50" cy="50" fill="transparent" r="40" stroke="rgba(255,255,255,0.05)" stroke-width="12"></circle>
<!-- Segment 1: Chocolate (53%) -->
<circle cx="50" cy="50" fill="transparent" r="40" stroke="#c6a15d" stroke-dasharray="166.5 251.3" stroke-width="12"></circle>
<!-- Segment 2: Dairy (31%) -->
<circle cx="50" cy="50" fill="transparent" r="40" stroke="rgba(198, 161, 93, 0.6)" stroke-dasharray="77.9 251.3" stroke-dashoffset="-166.5" stroke-width="12"></circle>
<!-- Segment 3: Vanilla/Spices (10%) -->
<circle cx="50" cy="50" fill="transparent" r="40" stroke="rgba(198, 161, 93, 0.4)" stroke-dasharray="25.1 251.3" stroke-dashoffset="-244.4" stroke-width="12"></circle>
<!-- Segment 4: Flour (6%) -->
<circle cx="50" cy="50" fill="transparent" r="40" stroke="rgba(198, 161, 93, 0.2)" stroke-dasharray="15.1 251.3" stroke-dashoffset="-269.5" stroke-width="12"></circle>
</svg>
<div class="absolute inset-0 flex flex-col items-center justify-center">
<span class="text-2xl font-bold text-stone-text">100%</span>
<span class="text-[10px] text-stone-muted uppercase tracking-tighter font-light">Total Base</span>
</div>
</div>
</div>
<div class="grid grid-cols-2 gap-y-4 text-xs">
<div class="flex items-center gap-2">
<div class="w-2.5 h-2.5 rounded-full bg-primary"></div>
<span class="text-stone-muted">Chocolate (53%)</span>
</div>
<div class="flex items-center gap-2">
<div class="w-2.5 h-2.5 rounded-full bg-primary/60"></div>
<span class="text-stone-muted">Dairy (31%)</span>
</div>
<div class="flex items-center gap-2">
<div class="w-2.5 h-2.5 rounded-full bg-primary/40"></div>
<span class="text-stone-muted">Spices (10%)</span>
</div>
<div class="flex items-center gap-2">
<div class="w-2.5 h-2.5 rounded-full bg-primary/20"></div>
<span class="text-stone-muted">Dry Goods (6%)</span>
</div>
</div>
</div>
<!-- Product Preview Card -->
<div class="bg-onyx-lighter border border-white/5 rounded-xl overflow-hidden p-2 group">
<div class="relative aspect-[4/3] rounded-lg overflow-hidden grayscale hover:grayscale-0 transition-all duration-700">
<img alt="Luxury Chocolate Eclair" class="w-full h-full object-cover" data-alt="Close up shot of artisan chocolate eclair with gold leaf" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDy-Oel6YY5t7ad0fkeixGxclkTPW1vpunxRJzA1NSc-gy080C-WjJ4xqhEYhAcgkiZTxVnnvMa-HHeAEzqjb7E1h6Xv_mFVC57_XYZBUcfxEuZOCGSyM6mUcdTkdT-NHZJ4-HM4qzFFBmIHX3N-5nKr7yqLRtB5XUtpDFoORuT9kUTZd9BsYP_0gJCKYuX2a-9yTODREPGACKw7F57jO1warA63mrw7HzkOTqd58nX6MjbL3z3X1XjmkzVDmjrOT4nNA555jKpCKM"/>
<div class="absolute inset-0 bg-gradient-to-t from-background-dark/80 to-transparent flex flex-col justify-end p-6">
<span class="text-white text-lg font-serif italic">Presentation Standards</span>
<span class="text-stone-muted text-xs">Aged Gold Leaf + Maldon Garnish</span>
</div>
</div>
</div>
</div>
</div>
<!-- Footer Note -->
<footer class="mt-20 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center text-[11px] text-stone-muted uppercase tracking-widest gap-4">
<div class="flex items-center gap-6">
<span>© 2024 The Breakery Management</span>
<span>System Version 2.4.1</span>
</div>
<div class="flex items-center gap-6">
<span class="flex items-center gap-1"><span class="w-2 h-2 rounded-full bg-green-500/50"></span> Production Sync Active</span>
<span>Last Updated: 24 Oct 09:12 AM</span>
</div>
</footer>
</main>
</body></html>
      <!-- STITCH_HTML_END -->
    ` }} />
  );
};

export default Recipe_and_Costing_Analysis;
