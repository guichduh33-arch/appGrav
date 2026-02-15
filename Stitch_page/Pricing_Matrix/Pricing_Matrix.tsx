import React from 'react';

const Pricing_Matrix: React.FC = () => {
  return (
    <div dangerouslySetInnerHTML={{ __html: \
      <!-- STITCH_HTML_START -->
      <!DOCTYPE html>

<html class="dark" lang="en"><head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
<title>The Breakery Pricing Matrix</title>
<script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
<link href="https://fonts.googleapis.com/css2?family=Work+Sans:wght@300;400;500;600;700&amp;family=Playfair+Display:wght@700&amp;family=JetBrains+Mono:wght@400;700&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<script id="tailwind-config">
        tailwind.config = {
            darkMode: "class",
            theme: {
                extend: {
                    colors: {
                        "primary": "#f9a806",
                        "background-light": "#f8f7f5",
                        "background-dark": "#0D0D0F",
                        "surface-dark": "#1A1A1D",
                        "neutral-gold": "#C5A059",
                        "taupe": "#8E8377",
                    },
                    fontFamily: {
                        "display": ["Work Sans", "sans-serif"],
                        "serif": ["Playfair Display", "serif"],
                        "mono": ["JetBrains Mono", "monospace"]
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
            font-family: 'Work Sans', sans-serif;
        }
        .custom-scrollbar::-webkit-scrollbar {
            width: 8px;
            height: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
            background: #1A1A1D;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
            background: #332d24;
            border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background: #f9a806;
        }
        .pricing-grid {
            grid-template-columns: 280px repeat(4, 1fr);
        }
        .sticky-col {
            position: sticky;
            left: 0;
            z-index: 10;
        }
    </style>
</head>
<body class="bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 min-h-screen flex flex-col font-display">
<!-- Header Section -->
<header class="border-b border-primary/10 bg-background-light dark:bg-background-dark px-8 py-6 sticky top-0 z-30">
<div class="max-w-[1600px] mx-auto flex justify-between items-end">
<div>
<h1 class="font-serif text-3xl text-primary dark:text-primary mb-1">Category Pricing</h1>
<p class="text-taupe text-sm">Define and override product-specific pricing across your customer segments.</p>
</div>
<div class="flex items-center gap-4">
<div class="flex items-center bg-surface-dark border border-primary/20 rounded px-3 py-1.5">
<span class="material-icons text-primary text-sm mr-2">search</span>
<input class="bg-transparent border-none focus:ring-0 text-sm w-48 text-slate-100 placeholder-taupe" placeholder="Search products..." type="text"/>
</div>
<button class="flex items-center gap-2 bg-surface-dark border border-primary/20 hover:border-primary/50 px-4 py-2 rounded transition-all text-sm font-medium">
<span class="material-icons text-sm">filter_list</span>
<span>Filters</span>
</button>
</div>
</div>
</header>
<!-- Main Content -->
<main class="flex-grow px-8 py-6 max-w-[1600px] mx-auto w-full">
<!-- Bulk Actions Bar -->
<div class="bg-surface-dark border border-primary/20 rounded-lg p-4 mb-6 flex items-center justify-between shadow-xl">
<div class="flex items-center gap-4">
<span class="text-xs font-semibold uppercase tracking-wider text-taupe">Bulk Actions:</span>
<div class="h-8 w-[1px] bg-primary/20 mx-2"></div>
<div class="flex items-center gap-2">
<span class="text-sm">Apply</span>
<input class="w-16 bg-background-dark border border-primary/30 rounded px-2 py-1 text-sm text-primary font-mono focus:ring-primary focus:border-primary" type="number" value="10"/>
<span class="text-sm">% discount to selected items</span>
</div>
<button class="bg-primary/20 hover:bg-primary text-primary hover:text-background-dark px-4 py-1.5 rounded text-xs font-bold uppercase transition-all">
                    Apply Changes
                </button>
</div>
<div class="flex items-center gap-6 text-xs text-taupe">
<div class="flex items-center gap-2">
<div class="w-2 h-2 rounded-full bg-primary"></div>
<span>Manual Override</span>
</div>
<div class="flex items-center gap-2">
<div class="w-2 h-2 rounded-full bg-taupe/40"></div>
<span>Auto-calculated</span>
</div>
</div>
</div>
<!-- Pricing Matrix Card -->
<div class="bg-surface-dark border border-primary/10 rounded-xl shadow-2xl overflow-hidden flex flex-col h-[calc(100vh-280px)]">
<div class="overflow-auto custom-scrollbar">
<table class="w-full border-collapse text-left">
<thead class="sticky top-0 z-20 bg-surface-dark">
<tr class="pricing-grid border-b border-primary/10">
<th class="sticky-col bg-surface-dark p-6 text-sm font-semibold uppercase tracking-widest text-primary border-r border-primary/10">Product Name</th>
<th class="p-6 text-sm font-semibold uppercase tracking-widest text-slate-400">Retail (Standard)</th>
<th class="p-6 text-sm font-semibold uppercase tracking-widest text-slate-400">Wholesale (B2B)</th>
<th class="p-6 text-sm font-semibold uppercase tracking-widest text-slate-400">Discount 10%</th>
<th class="p-6 text-sm font-semibold uppercase tracking-widest text-slate-400">Hotel Partners</th>
</tr>
</thead>
<tbody class="divide-y divide-primary/5">
<!-- Category: Pastries -->
<tr class="bg-primary/5">
<td class="p-4 px-6 text-xs font-bold uppercase tracking-[0.2em] text-primary/80" colspan="5">
<div class="flex items-center gap-2">
<span class="material-icons text-sm">expand_more</span>
                                    Pastries
                                </div>
</td>
</tr>
<tr class="group hover:bg-primary/5 transition-colors">
<td class="sticky-col bg-surface-dark group-hover:bg-background-dark/80 p-6 font-medium border-r border-primary/10">
<div class="flex flex-col">
<span>Butter Croissant</span>
<span class="text-[10px] text-taupe font-mono">SKU: BKY-001</span>
</div>
</td>
<td class="p-0 border-r border-primary/5">
<div class="p-6 font-mono text-primary font-bold relative flex items-center justify-between">
                                    $4.50
                                    <div class="w-1.5 h-1.5 rounded-full bg-primary"></div>
</div>
</td>
<td class="p-0 border-r border-primary/5">
<div class="p-6 font-mono text-taupe">
                                    $3.15
                                </div>
</td>
<td class="p-0 border-r border-primary/5">
<div class="p-6 font-mono text-taupe">
                                    $4.05
                                </div>
</td>
<td class="p-0 border-r border-primary/5">
<div class="p-6 font-mono text-primary font-bold relative flex items-center justify-between">
                                    $2.80
                                    <div class="w-1.5 h-1.5 rounded-full bg-primary"></div>
</div>
</td>
</tr>
<tr class="group hover:bg-primary/5 transition-colors">
<td class="sticky-col bg-surface-dark group-hover:bg-background-dark/80 p-6 font-medium border-r border-primary/10">
<div class="flex flex-col">
<span>Pain au Chocolat</span>
<span class="text-[10px] text-taupe font-mono">SKU: BKY-002</span>
</div>
</td>
<td class="p-0 border-r border-primary/5">
<div class="p-6 font-mono text-primary font-bold relative flex items-center justify-between">
                                    $5.25
                                    <div class="w-1.5 h-1.5 rounded-full bg-primary"></div>
</div>
</td>
<td class="p-0 border-r border-primary/5">
<div class="p-6 font-mono text-taupe">
                                    $3.68
                                </div>
</td>
<td class="p-0 border-r border-primary/5 border-2 border-primary">
<div class="p-6 font-mono text-primary font-bold bg-primary/10 h-full flex items-center justify-between">
                                    $4.75
                                    <div class="w-1.5 h-1.5 rounded-full bg-primary"></div>
</div>
</td>
<td class="p-0 border-r border-primary/5">
<div class="p-6 font-mono text-taupe">
                                    $3.50
                                </div>
</td>
</tr>
<!-- Category: Breads -->
<tr class="bg-primary/5">
<td class="p-4 px-6 text-xs font-bold uppercase tracking-[0.2em] text-primary/80" colspan="5">
<div class="flex items-center gap-2">
<span class="material-icons text-sm">expand_more</span>
                                    Artisanal Breads
                                </div>
</td>
</tr>
<tr class="group hover:bg-primary/5 transition-colors">
<td class="sticky-col bg-surface-dark group-hover:bg-background-dark/80 p-6 font-medium border-r border-primary/10">
<div class="flex flex-col">
<span>Sourdough Batard</span>
<span class="text-[10px] text-taupe font-mono">SKU: BKY-014</span>
</div>
</td>
<td class="p-0 border-r border-primary/5">
<div class="p-6 font-mono text-primary font-bold relative flex items-center justify-between">
                                    $8.00
                                    <div class="w-1.5 h-1.5 rounded-full bg-primary"></div>
</div>
</td>
<td class="p-0 border-r border-primary/5">
<div class="p-6 font-mono text-taupe">
                                    $5.60
                                </div>
</td>
<td class="p-0 border-r border-primary/5">
<div class="p-6 font-mono text-taupe">
                                    $7.20
                                </div>
</td>
<td class="p-0 border-r border-primary/5">
<div class="p-6 font-mono text-taupe">
                                    $5.00
                                </div>
</td>
</tr>
<tr class="group hover:bg-primary/5 transition-colors">
<td class="sticky-col bg-surface-dark group-hover:bg-background-dark/80 p-6 font-medium border-r border-primary/10">
<div class="flex flex-col">
<span>Multigrain Loaf</span>
<span class="text-[10px] text-taupe font-mono">SKU: BKY-015</span>
</div>
</td>
<td class="p-0 border-r border-primary/5">
<div class="p-6 font-mono text-primary font-bold relative flex items-center justify-between">
                                    $7.50
                                    <div class="w-1.5 h-1.5 rounded-full bg-primary"></div>
</div>
</td>
<td class="p-0 border-r border-primary/5">
<div class="p-6 font-mono text-primary font-bold flex items-center justify-between">
                                    $4.80
                                    <div class="w-1.5 h-1.5 rounded-full bg-primary"></div>
</div>
</td>
<td class="p-0 border-r border-primary/5">
<div class="p-6 font-mono text-taupe">
                                    $6.75
                                </div>
</td>
<td class="p-0 border-r border-primary/5">
<div class="p-6 font-mono text-taupe">
                                    $4.70
                                </div>
</td>
</tr>
<!-- Category: Cakes -->
<tr class="bg-primary/5">
<td class="p-4 px-6 text-xs font-bold uppercase tracking-[0.2em] text-primary/80" colspan="5">
<div class="flex items-center gap-2">
<span class="material-icons text-sm">expand_more</span>
                                    Specialty Cakes
                                </div>
</td>
</tr>
<tr class="group hover:bg-primary/5 transition-colors">
<td class="sticky-col bg-surface-dark group-hover:bg-background-dark/80 p-6 font-medium border-r border-primary/10">
<div class="flex flex-col">
<span>Opera Cake (Whole)</span>
<span class="text-[10px] text-taupe font-mono">SKU: BKY-088</span>
</div>
</td>
<td class="p-0 border-r border-primary/5">
<div class="p-6 font-mono text-primary font-bold relative flex items-center justify-between">
                                    $65.00
                                    <div class="w-1.5 h-1.5 rounded-full bg-primary"></div>
</div>
</td>
<td class="p-0 border-r border-primary/5">
<div class="p-6 font-mono text-taupe">
                                    $45.50
                                </div>
</td>
<td class="p-0 border-r border-primary/5">
<div class="p-6 font-mono text-taupe">
                                    $58.50
                                </div>
</td>
<td class="p-0 border-r border-primary/5">
<div class="p-6 font-mono text-primary font-bold flex items-center justify-between">
                                    $40.00
                                    <div class="w-1.5 h-1.5 rounded-full bg-primary"></div>
</div>
</td>
</tr>
</tbody>
</table>
</div>
</div>
</main>
<!-- Sticky Footer -->
<footer class="bg-background-dark border-t border-primary/20 p-6 sticky bottom-0 z-30">
<div class="max-w-[1600px] mx-auto flex items-center justify-between">
<div class="flex items-center gap-4">
<div class="bg-primary/10 border border-primary/30 rounded px-3 py-1.5 flex items-center gap-2">
<span class="material-icons text-primary text-sm">info</span>
<span class="text-xs text-slate-300">5 pending overrides in this session.</span>
</div>
<button class="text-taupe hover:text-slate-100 text-sm font-medium transition-colors">Discard all changes</button>
</div>
<div class="flex items-center gap-4">
<button class="bg-transparent border border-primary/30 text-primary hover:bg-primary/10 px-6 py-2.5 rounded-lg text-sm font-bold uppercase transition-all">
                    Export CSV
                </button>
<button class="bg-primary hover:bg-primary/80 text-background-dark px-10 py-2.5 rounded-lg text-sm font-bold uppercase shadow-lg shadow-primary/20 transition-all">
                    Save All Changes
                </button>
</div>
</div>
</footer>
</body></html>
      <!-- STITCH_HTML_END -->
    \ }} />
  );
};

export default Pricing_Matrix;
