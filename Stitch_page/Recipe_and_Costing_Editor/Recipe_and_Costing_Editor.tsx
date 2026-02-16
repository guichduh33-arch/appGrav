import React from 'react';

const Recipe_and_Costing_Editor: React.FC = () => {
  return (
    <div dangerouslySetInnerHTML={{ __html: `
      <!-- STITCH_HTML_START -->
      <!DOCTYPE html>

<html class="dark" lang="en"><head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
<title>The Breakery | Recipe &amp; Costing Editor</title>
<script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&amp;family=Playfair+Display:wght@600&amp;family=Material+Icons+Outlined&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<script id="tailwind-config">
        tailwind.config = {
            darkMode: "class",
            theme: {
                extend: {
                    colors: {
                        "primary": "#c8a45b",
                        "background-light": "#f8f7f6",
                        "background-dark": "#0d0d0f", // Deep Onyx
                        "surface-dark": "#1a1a1c",
                        "stone-text": "#e5e7eb",
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
            font-family: 'Inter', sans-serif;
            -webkit-font-smoothing: antialiased;
        }
        .serif-title {
            font-family: 'Playfair Display', serif;
        }
        /* Custom range slider styling */
        input[type=range]::-webkit-slider-thumb {
            -webkit-appearance: none;
            height: 16px;
            width: 16px;
            border-radius: 50%;
            background: #c8a45b;
            cursor: pointer;
            margin-top: -6px;
        }
        input[type=range]::-webkit-slider-runnable-track {
            width: 100%;
            height: 4px;
            cursor: pointer;
            background: rgba(200, 164, 91, 0.2);
            border-radius: 2px;
        }
    </style>
</head>
<body class="bg-background-light dark:bg-background-dark text-stone-text min-h-screen">
<!-- Global Navigation -->
<nav class="border-b border-primary/10 bg-surface-dark/50 backdrop-blur-md sticky top-0 z-50">
<div class="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
<div class="flex items-center gap-8">
<div class="flex items-center gap-2">
<div class="w-8 h-8 bg-primary rounded flex items-center justify-center">
<span class="material-icons-outlined text-background-dark text-sm">bakery_dining</span>
</div>
<span class="font-bold tracking-widest text-primary text-sm uppercase">The Breakery</span>
</div>
<div class="hidden md:flex items-center gap-6 text-xs font-medium uppercase tracking-widest text-stone-text/60">
<a class="hover:text-primary transition-colors" href="#">Dashboard</a>
<a class="text-primary" href="#">Products</a>
<a class="hover:text-primary transition-colors" href="#">Inventory</a>
<a class="hover:text-primary transition-colors" href="#">Suppliers</a>
</div>
</div>
<div class="flex items-center gap-4">
<button class="p-2 hover:bg-white/5 rounded-full transition-colors">
<span class="material-icons-outlined text-stone-text/70">notifications</span>
</button>
<div class="w-8 h-8 rounded-full border border-primary/30 p-0.5">
<img class="w-full h-full rounded-full object-cover" data-alt="Chef profile portrait" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBMbDnSciO_HJ8LsXGORaOsI2aYIc6JvEjn6_zJ9e1pZv-NZpPb0nwc43ws8xf-Vcm5AaaCO2o9a20XOE8m_PPg9yON81fgAvnKrO0OwWWgPKTzAXIx1RAn2hsR40TiCMN6zmwL049Mleh1HwnEYGMobdN7vPU7I0ZlVgoAsT8rnIoxh2HOXfEvK9xx7D79iB9rknSZePDKfNRF2BXrfmO5OmQBiypvN7Dn7eNOEpkSH6y9uRvVwR6e6bGhAVp0GFo9xsFKQlulxNE"/>
</div>
</div>
</div>
</nav>
<main class="max-w-7xl mx-auto px-6 py-8">
<!-- Header Section -->
<header class="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
<div>
<nav class="flex items-center gap-2 text-xs text-primary/60 mb-2 uppercase tracking-widest font-medium">
<a href="#">Products</a>
<span class="material-icons-outlined text-[12px]">chevron_right</span>
<a href="#">Pastries</a>
</nav>
<h1 class="serif-title text-4xl md:text-5xl text-stone-text">Raspberry Mille-feuille</h1>
<p class="text-stone-text/50 text-sm mt-2 flex items-center gap-2 font-display">
<span class="material-icons-outlined text-sm">schedule</span>
                    Last updated: Oct 24, 2023 • SKU: BF-0092
                </p>
</div>
<div class="flex items-center gap-3">
<button class="px-6 py-2.5 rounded-lg border border-primary/20 text-primary font-medium text-sm hover:bg-primary/5 transition-all">
                    Discard Changes
                </button>
<button class="px-8 py-2.5 rounded-lg bg-primary text-background-dark font-semibold text-sm hover:bg-primary/90 transition-all shadow-lg shadow-primary/10">
                    Save Recipe
                </button>
</div>
</header>
<div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
<!-- Left Column: Recipe Builder -->
<section class="lg:col-span-8 space-y-6">
<div class="bg-surface-dark border border-white/5 rounded-xl overflow-hidden shadow-2xl shadow-black/40">
<div class="p-6 border-b border-white/5 flex items-center justify-between">
<h2 class="text-lg font-semibold flex items-center gap-2">
<span class="material-icons-outlined text-primary">format_list_bulleted</span>
                            Recipe Components
                        </h2>
<span class="text-xs text-stone-text/40 bg-white/5 px-2 py-1 rounded">Batch Size: 24 Units</span>
</div>
<div class="overflow-x-auto font-display">
<table class="w-full text-left">
<thead>
<tr class="bg-white/[0.02] text-xs uppercase tracking-wider text-stone-text/40">
<th class="px-6 py-4 font-medium">Ingredient</th>
<th class="px-6 py-4 font-medium">Quantity</th>
<th class="px-6 py-4 font-medium">Unit</th>
<th class="px-6 py-4 font-medium text-right">Unit Cost</th>
<th class="px-6 py-4 font-medium text-right">Total</th>
<th class="px-6 py-4 w-10"></th>
</tr>
</thead>
<tbody class="divide-y divide-white/5">
<tr class="hover:bg-white/[0.02] group transition-colors">
<td class="px-6 py-4">
<div class="font-medium">Organic Flour T55</div>
<div class="text-[10px] text-primary/50 uppercase tracking-tighter">Dry Goods</div>
</td>
<td class="px-6 py-4"><input class="w-20 bg-background-dark/50 border-white/10 rounded-md text-sm focus:border-primary focus:ring-0" type="number" value="500"/></td>
<td class="px-6 py-4 text-sm text-stone-text/60">grams</td>
<td class="px-6 py-4 text-sm text-right">\\$0.002 /g</td>
<td class="px-6 py-4 text-sm text-right font-semibold">\\$1.00</td>
<td class="px-6 py-4 text-right">
<button class="opacity-0 group-hover:opacity-100 text-stone-text/30 hover:text-red-400 transition-all">
<span class="material-icons-outlined text-lg">delete_outline</span>
</button>
</td>
</tr>
<tr class="hover:bg-white/[0.02] group transition-colors">
<td class="px-6 py-4">
<div class="font-medium">AOP Cultured Butter</div>
<div class="text-[10px] text-primary/50 uppercase tracking-tighter text-blue-400">Dairy</div>
</td>
<td class="px-6 py-4"><input class="w-20 bg-background-dark/50 border-white/10 rounded-md text-sm focus:border-primary focus:ring-0" type="number" value="350"/></td>
<td class="px-6 py-4 text-sm text-stone-text/60">grams</td>
<td class="px-6 py-4 text-sm text-right">\\$0.022 /g</td>
<td class="px-6 py-4 text-sm text-right font-semibold">\\$7.70</td>
<td class="px-6 py-4 text-right">
<button class="opacity-0 group-hover:opacity-100 text-stone-text/30 hover:text-red-400 transition-all">
<span class="material-icons-outlined text-lg">delete_outline</span>
</button>
</td>
</tr>
<tr class="hover:bg-white/[0.02] group transition-colors">
<td class="px-6 py-4">
<div class="font-medium">Fresh Heritage Raspberries</div>
<div class="text-[10px] text-primary/50 uppercase tracking-tighter text-red-400">Fruit</div>
</td>
<td class="px-6 py-4"><input class="w-20 bg-background-dark/50 border-white/10 rounded-md text-sm focus:border-primary focus:ring-0" type="number" value="200"/></td>
<td class="px-6 py-4 text-sm text-stone-text/60">grams</td>
<td class="px-6 py-4 text-sm text-right">\\$0.045 /g</td>
<td class="px-6 py-4 text-sm text-right font-semibold">\\$9.00</td>
<td class="px-6 py-4 text-right">
<button class="opacity-0 group-hover:opacity-100 text-stone-text/30 hover:text-red-400 transition-all">
<span class="material-icons-outlined text-lg">delete_outline</span>
</button>
</td>
</tr>
<tr class="hover:bg-white/[0.02] group transition-colors">
<td class="px-6 py-4">
<div class="font-medium">Madagascar Vanilla Bean</div>
<div class="text-[10px] text-primary/50 uppercase tracking-tighter">Dry Goods</div>
</td>
<td class="px-6 py-4"><input class="w-20 bg-background-dark/50 border-white/10 rounded-md text-sm focus:border-primary focus:ring-0" type="number" value="1"/></td>
<td class="px-6 py-4 text-sm text-stone-text/60">unit</td>
<td class="px-6 py-4 text-sm text-right">\\$3.50 /unit</td>
<td class="px-6 py-4 text-sm text-right font-semibold">\\$3.50</td>
<td class="px-6 py-4 text-right">
<button class="opacity-0 group-hover:opacity-100 text-stone-text/30 hover:text-red-400 transition-all">
<span class="material-icons-outlined text-lg">delete_outline</span>
</button>
</td>
</tr>
</tbody>
</table>
</div>
<div class="p-6 bg-white/[0.01]">
<button class="w-full flex items-center justify-center gap-2 py-4 border-2 border-dashed border-white/10 rounded-xl text-stone-text/40 hover:border-primary/40 hover:text-primary transition-all group font-medium">
<span class="material-icons-outlined group-hover:scale-110 transition-transform">add_circle_outline</span>
                            Add Ingredient
                        </button>
</div>
</div>
<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
<div class="bg-surface-dark p-6 rounded-xl border border-white/5 shadow-xl">
<h3 class="text-sm font-semibold mb-4 text-stone-text/60 uppercase tracking-widest">Recipe Instructions</h3>
<div class="space-y-4 text-sm text-stone-text/80 leading-relaxed font-display">
<p>1. Chill pastry dough to 4°C before laminating with tempered butter.</p>
<p>2. Perform 5 single folds with 30-minute rests between each.</p>
<p>3. Bake at 190°C between two trays until deeply caramelized.</p>
</div>
</div>
<div class="bg-surface-dark p-6 rounded-xl border border-white/5 shadow-xl">
<h3 class="text-sm font-semibold mb-4 text-stone-text/60 uppercase tracking-widest">Yield Adjustment</h3>
<div class="flex items-center gap-4 mb-4">
<div class="flex-1">
<label class="text-[10px] uppercase text-stone-text/40 block mb-1">Target Units</label>
<input class="w-full bg-background-dark/50 border-white/10 rounded-md text-lg font-bold text-primary focus:border-primary focus:ring-0" type="number" value="24"/>
</div>
<div class="flex-1">
<label class="text-[10px] uppercase text-stone-text/40 block mb-1">Unit Weight (g)</label>
<div class="text-lg font-bold py-2">185g</div>
</div>
</div>
<div class="p-3 bg-primary/5 rounded border border-primary/20 text-[11px] text-primary/80 italic">
                            Increasing target units will automatically scale ingredient quantities proportionally.
                        </div>
</div>
</div>
</section>
<!-- Right Column: Costing Analytics -->
<aside class="lg:col-span-4 sticky top-24 space-y-6">
<div class="bg-surface-dark border border-white/5 rounded-xl shadow-2xl overflow-hidden">
<div class="bg-primary/10 p-6 border-b border-primary/20">
<h3 class="text-xs font-bold text-primary uppercase tracking-[0.2em] mb-4">Costing Summary</h3>
<div class="flex justify-between items-baseline mb-1">
<span class="text-stone-text/60 text-sm">Total Recipe Cost</span>
<span class="text-2xl font-bold text-stone-text">\\$116.40</span>
</div>
<div class="flex justify-between items-baseline">
<span class="text-stone-text/60 text-sm">Cost Per Unit</span>
<span class="text-3xl font-bold text-stone-text">\\$4.85</span>
</div>
</div>
<div class="p-6 space-y-8">
<!-- Category Breakdown -->
<div>
<div class="flex items-center justify-between mb-4">
<h4 class="text-xs font-semibold text-stone-text/60 uppercase tracking-widest">Category Distribution</h4>
<span class="material-icons-outlined text-stone-text/30 text-sm">pie_chart</span>
</div>
<div class="flex items-center gap-6">
<div class="relative w-24 h-24">
<svg class="w-full h-full transform -rotate-90" viewbox="0 0 36 36">
<circle class="stroke-primary/10" cx="18" cy="18" fill="none" r="16" stroke-width="3"></circle>
<circle class="stroke-primary" cx="18" cy="18" fill="none" r="16" stroke-dasharray="45, 100" stroke-width="3"></circle>
<circle class="stroke-primary/60" cx="18" cy="18" fill="none" r="16" stroke-dasharray="30, 100" stroke-dashoffset="-45" stroke-width="3"></circle>
<circle class="stroke-primary/30" cx="18" cy="18" fill="none" r="16" stroke-dasharray="25, 100" stroke-dashoffset="-75" stroke-width="3"></circle>
</svg>
<div class="absolute inset-0 flex items-center justify-center">
<span class="text-[10px] font-bold text-primary">CATEGORIES</span>
</div>
</div>
<div class="space-y-1.5 flex-1">
<div class="flex items-center justify-between text-xs">
<span class="flex items-center gap-2"><span class="w-2 h-2 rounded-full bg-primary"></span> Fruit</span>
<span class="font-semibold">45%</span>
</div>
<div class="flex items-center justify-between text-xs">
<span class="flex items-center gap-2"><span class="w-2 h-2 rounded-full bg-primary/60"></span> Dairy</span>
<span class="font-semibold">30%</span>
</div>
<div class="flex items-center justify-between text-xs">
<span class="flex items-center gap-2"><span class="w-2 h-2 rounded-full bg-primary/30"></span> Dry Goods</span>
<span class="font-semibold">25%</span>
</div>
</div>
</div>
</div>
<!-- Adjustable Sliders -->
<div class="space-y-6">
<div>
<div class="flex justify-between mb-2">
<label class="text-xs font-semibold text-stone-text/60 uppercase tracking-widest">Labor &amp; Overhead</label>
<span class="text-sm font-bold text-primary">25%</span>
</div>
<input class="w-full accent-primary bg-primary/20 h-1.5 rounded-full appearance-none cursor-pointer" max="100" min="0" type="range" value="25"/>
</div>
<div class="pt-4 border-t border-white/5">
<div class="grid grid-cols-2 gap-4">
<div>
<label class="text-[10px] uppercase text-stone-text/40 block mb-1">Target Margin</label>
<div class="text-lg font-bold">75.0%</div>
</div>
<div>
<label class="text-[10px] uppercase text-stone-text/40 block mb-1">Actual Margin</label>
<div class="text-lg font-bold text-red-400">73.1%</div>
</div>
</div>
<div class="mt-3 w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
<div class="bg-red-400 h-full" style="width: 73.1%"></div>
</div>
</div>
</div>
<!-- Final Pricing -->
<div class="pt-6 border-t border-white/5 space-y-4">
<div class="bg-white/[0.03] p-4 rounded-xl border border-white/5">
<div class="flex items-center justify-between mb-4">
<div>
<div class="text-[10px] uppercase text-stone-text/40 font-bold">Suggested Retail</div>
<div class="text-2xl font-bold text-primary">\\$19.50</div>
</div>
<div class="text-right">
<div class="text-[10px] uppercase text-stone-text/40 font-bold">Current Price</div>
<div class="text-2xl font-bold text-stone-text">\\$18.00</div>
</div>
</div>
<div class="flex items-center gap-2 text-[11px] text-red-400 bg-red-400/10 p-2 rounded-lg">
<span class="material-icons-outlined text-sm">warning</span>
                                    Current price is \\$1.50 below target margin.
                                </div>
</div>
<button class="w-full bg-primary/10 border border-primary/30 text-primary py-3 rounded-lg font-bold text-sm hover:bg-primary hover:text-background-dark transition-all uppercase tracking-widest">
                                Update Store Price
                            </button>
</div>
</div>
</div>
<div class="bg-surface-dark border border-white/5 rounded-xl p-4 flex items-center gap-4">
<img class="w-16 h-16 rounded-lg object-cover" data-alt="Plated Raspberry Mille-feuille pastry" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAG_Y6qICIMU_012VaK-Cnrxw-zMQFLp2lHRF2ccn5GrUnDHqzUU5zMWkHiBg3gJfefdR1PIw0s-sc9fBT1A8v5veA5IHpbMfm2W3gcraCrXuOFdhfxGUlhssyiEMq3vNWYHcTglr8KPAVqK2x0kfUtshKYuXxG8HZn7TWM7SoanYFBzdLRx11-sszQbLfo8ppe2nxUaJIi-MX8dxEM4cKrQLCb1sMnmqt0zmjF1tCTLHdOFz2hbxb0CpGlXDaAS0qT1foPDFLW-yI"/>
<div>
<div class="text-xs font-bold text-stone-text/40 uppercase tracking-tighter">Live Preview</div>
<div class="text-sm font-medium serif-title">The "Grand Framboise"</div>
<div class="text-[10px] text-primary">Catalog: Signature Series</div>
</div>
<button class="ml-auto p-2 bg-white/5 rounded-lg hover:bg-white/10 transition-colors">
<span class="material-icons-outlined text-stone-text/60">open_in_new</span>
</button>
</div>
</aside>
</div>
</main>
<!-- Footer Meta -->
<footer class="max-w-7xl mx-auto px-6 py-12 border-t border-white/5 mt-12">
<div class="flex flex-col md:flex-row justify-between items-center gap-6">
<div class="flex items-center gap-4">
<div class="text-primary text-xs uppercase tracking-[0.3em] font-bold">The Breakery OS v2.4</div>
<div class="h-4 w-px bg-white/10"></div>
<div class="text-stone-text/30 text-[10px] uppercase tracking-widest">Enterprise Culinary Management</div>
</div>
<div class="flex items-center gap-8 text-[10px] uppercase tracking-widest text-stone-text/40 font-medium">
<a class="hover:text-primary transition-colors" href="#">Audit Logs</a>
<a class="hover:text-primary transition-colors" href="#">Permissions</a>
<a class="hover:text-primary transition-colors" href="#">Support</a>
</div>
</div>
</footer>
</body></html>
      <!-- STITCH_HTML_END -->
    ` }} />
  );
};

export default Recipe_and_Costing_Editor;
