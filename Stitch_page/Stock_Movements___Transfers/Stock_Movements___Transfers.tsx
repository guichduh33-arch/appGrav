import React from 'react';

const Stock_Movements___Transfers: React.FC = () => {
  return (
    <div dangerouslySetInnerHTML={{ __html: \
      <!-- STITCH_HTML_START -->
      <!DOCTYPE html>

<html class="dark" lang="en"><head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
<title>The Breakery - Stock Movements &amp; Transfers</title>
<script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
<link href="https://fonts.googleapis.com/css2?family=Newsreader:ital,opsz,wght@0,6..72,200..800;1,6..72,200..800&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/icon?family=Material+Icons+Outlined" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<script id="tailwind-config">
        tailwind.config = {
            darkMode: "class",
            theme: {
                extend: {
                    colors: {
                        "primary": "#cda956",
                        "background-light": "#f8f7f6",
                        "background-dark": "#0D0D0F",
                        "charcoal": "#1A1A1D",
                    },
                    fontFamily: {
                        "display": ["Newsreader", "serif"]
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
</head>
<body class="bg-background-light dark:bg-background-dark font-display text-slate-200 min-h-screen">
<!-- Top Navigation -->
<nav class="border-b border-primary/20 bg-background-light dark:bg-background-dark sticky top-0 z-50">
<div class="max-w-7xl mx-auto px-6">
<div class="flex items-center justify-between h-16">
<div class="flex items-center gap-8">
<div class="flex items-center gap-2">
<span class="material-icons-outlined text-primary text-3xl">bakery_dining</span>
<span class="text-xl font-bold tracking-tight text-primary uppercase">The Breakery</span>
</div>
<div class="flex h-16">
<a class="border-b-2 border-primary text-primary px-4 inline-flex items-center text-sm font-medium" href="#">Movements</a>
<a class="border-b-2 border-transparent text-slate-400 hover:text-primary px-4 inline-flex items-center text-sm font-medium" href="#">Transfers</a>
<a class="border-b-2 border-transparent text-slate-400 hover:text-primary px-4 inline-flex items-center text-sm font-medium" href="#">By Location</a>
</div>
</div>
<div class="flex items-center gap-4">
<button class="p-2 text-slate-400 hover:text-primary">
<span class="material-icons-outlined">notifications</span>
</button>
<div class="w-8 h-8 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center">
<span class="text-xs font-bold text-primary">JD</span>
</div>
</div>
</div>
</div>
</nav>
<main class="max-w-7xl mx-auto px-6 py-8 space-y-8">
<!-- Header Section -->
<header class="flex flex-col md:flex-row md:items-center justify-between gap-6">
<div class="flex items-center gap-4">
<div class="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
<span class="material-icons-outlined text-primary">swap_horiz</span>
</div>
<div>
<h1 class="text-3xl font-semibold text-white">Stock Movements</h1>
<p class="text-slate-400 text-sm">Track inventory flow across all bakery departments</p>
</div>
</div>
<div class="flex items-center gap-3">
<div class="bg-charcoal border border-primary/20 rounded-lg px-4 py-2 flex items-center gap-3">
<span class="material-icons-outlined text-primary text-sm">calendar_today</span>
<span class="text-sm font-medium">Oct 12, 2023 - Oct 19, 2023</span>
<span class="material-icons-outlined text-slate-500 text-sm">expand_more</span>
</div>
<button class="bg-primary hover:bg-primary/90 text-background-dark font-bold px-4 py-2 rounded-lg flex items-center gap-2 text-sm transition-colors">
<span class="material-icons-outlined text-sm">download</span>
                    Export Report
                </button>
</div>
</header>
<!-- Filters -->
<section class="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-charcoal rounded-xl border border-primary/10">
<div class="relative">
<span class="material-icons-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm">search</span>
<input class="w-full bg-background-dark border-primary/20 rounded-lg pl-10 pr-4 py-2 text-sm focus:ring-primary focus:border-primary text-slate-200" placeholder="Search products or SKUs..." type="text"/>
</div>
<select class="bg-background-dark border-primary/20 rounded-lg px-4 py-2 text-sm focus:ring-primary focus:border-primary text-slate-200">
<option>All Movement Types</option>
<option>Sale</option>
<option>Purchase</option>
<option>Production</option>
<option>Waste</option>
</select>
<select class="bg-background-dark border-primary/20 rounded-lg px-4 py-2 text-sm focus:ring-primary focus:border-primary text-slate-200">
<option>Direction: All</option>
<option>In (↗)</option>
<option>Out (↘)</option>
</select>
<button class="flex items-center justify-center gap-2 text-primary hover:bg-primary/10 border border-primary/30 rounded-lg py-2 transition-all text-sm font-medium">
<span class="material-icons-outlined text-sm">filter_list</span>
                More Filters
            </button>
</section>
<!-- Movements Table -->
<section class="bg-charcoal rounded-xl border border-primary/10 overflow-hidden">
<div class="overflow-x-auto">
<table class="w-full text-left border-collapse">
<thead>
<tr class="bg-background-dark/50 border-b border-primary/10">
<th class="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-400">Date/Time</th>
<th class="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-400">Product</th>
<th class="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-400">Type</th>
<th class="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-400">Direction</th>
<th class="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-400">Qty</th>
<th class="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-400">Reference</th>
<th class="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-400">Staff</th>
</tr>
</thead>
<tbody class="divide-y divide-primary/5">
<tr class="hover:bg-primary/5 transition-colors">
<td class="px-6 py-4 whitespace-nowrap text-sm">Oct 19, 09:42 AM</td>
<td class="px-6 py-4 whitespace-nowrap">
<div class="flex items-center gap-3">
<div class="w-8 h-8 rounded bg-background-dark flex items-center justify-center">
<img class="w-full h-full object-cover rounded" data-alt="Close up of a freshly baked sourdough loaf" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCB0Ty_W3rf2DzMbKwJkAmJyIT09eWHPJ7UyjqyI-vLdoXk6qoRE91z14QL9lshmvEdzOOAg4ZSUIJidnUVjO2mXGPLzX6-DC25yHBRbr1MIPvpUdpRPclMk-HVksDLfbE_I7p1J3RdZCKwvTvsEbGOrE8JGHPoEQWYhdsCHNnj1LLkRCnL7kpoitSruFrDSMwElj0aEZ_ugc-1yEhL7eS606Mjhz4xHaTBw-_6EasdL25P5JSwJcGU2ZKP1yqirEnROuirZby4OQjh"/>
</div>
<span class="font-medium">Artisan Sourdough</span>
</div>
</td>
<td class="px-6 py-4 whitespace-nowrap">
<span class="px-2 py-1 rounded text-[10px] font-bold uppercase bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">Production</span>
</td>
<td class="px-6 py-4 whitespace-nowrap text-emerald-500">
<div class="flex items-center gap-1">
<span class="material-icons-outlined text-sm">north_east</span>
<span class="text-xs font-bold uppercase">In</span>
</div>
</td>
<td class="px-6 py-4 whitespace-nowrap text-sm font-semibold text-white">24 Units</td>
<td class="px-6 py-4 whitespace-nowrap text-sm"><a class="text-primary hover:underline underline-offset-4" href="#">#PRD-9821</a></td>
<td class="px-6 py-4 whitespace-nowrap text-sm text-slate-400">Marcus V.</td>
</tr>
<tr class="hover:bg-primary/5 transition-colors">
<td class="px-6 py-4 whitespace-nowrap text-sm">Oct 19, 08:15 AM</td>
<td class="px-6 py-4 whitespace-nowrap">
<div class="flex items-center gap-3">
<div class="w-8 h-8 rounded bg-background-dark flex items-center justify-center">
<img class="w-full h-full object-cover rounded" data-alt="A tray of flaky butter croissants" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBPKvfR4x1lZ8ofuFkwE6lE9VmaDU2YdVnIw2Nk4EINXyn0FKGq7jwZXG4ufcqE0FMH3xBB78HjRvJ-mormkUxPAeMgpmoFP1Ab-OHSf77EQ36JWpIyVsYYWkk3f6I8eL2Js4be5cqjV_16STZ1kFDXc1Z1oZZGQn7e-pNI1E2PPwi1qTNKCgJNVzN0hLFsbmpL466axDetVuGNIU7hhsfpQgM5zwhOp72D1qE6Xb_wqa5VOjH_ejtRJrRPTDPnO43NQjdFwqzmQcIz"/>
</div>
<span class="font-medium">Butter Croissant</span>
</div>
</td>
<td class="px-6 py-4 whitespace-nowrap">
<span class="px-2 py-1 rounded text-[10px] font-bold uppercase bg-amber-500/10 text-amber-500 border border-amber-500/20">Sale</span>
</td>
<td class="px-6 py-4 whitespace-nowrap text-rose-500">
<div class="flex items-center gap-1">
<span class="material-icons-outlined text-sm">south_east</span>
<span class="text-xs font-bold uppercase">Out</span>
</div>
</td>
<td class="px-6 py-4 whitespace-nowrap text-sm font-semibold text-white">4 Units</td>
<td class="px-6 py-4 whitespace-nowrap text-sm"><a class="text-primary hover:underline underline-offset-4" href="#">#POS-4402</a></td>
<td class="px-6 py-4 whitespace-nowrap text-sm text-slate-400">Elena R.</td>
</tr>
<tr class="hover:bg-primary/5 transition-colors">
<td class="px-6 py-4 whitespace-nowrap text-sm">Oct 18, 05:30 PM</td>
<td class="px-6 py-4 whitespace-nowrap">
<div class="flex items-center gap-3">
<div class="w-8 h-8 rounded bg-background-dark flex items-center justify-center">
<img class="w-full h-full object-cover rounded" data-alt="Brown paper bag containing baking flour" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCMk-iFQbGlm_H0s_Q6Y1dfQK7pfaLUxb3AcXVrsLl3Ah4mWaOL_CIwPZGrcn7ibq8OssoP63LQYlbEOn_HTY9L5NUWejF00RePw7XVyI6xAI7LA-zcaXfnhcPVqjBhf3tzd2Utr0aazbQeVVXyit4gzhmgcLymsww_IGtGAKBcqZb_4T709j05WTwbDsHvXOwYhzgm32zG7TZVP_V2GOl7YEUo68lF5AugtzAlnZKdBoOOFqwDanJoPnOZvEDtmJP4pfL9b0HyRDNn"/>
</div>
<span class="font-medium">Organic Rye Flour</span>
</div>
</td>
<td class="px-6 py-4 whitespace-nowrap">
<span class="px-2 py-1 rounded text-[10px] font-bold uppercase bg-rose-500/10 text-rose-500 border border-rose-500/20">Waste</span>
</td>
<td class="px-6 py-4 whitespace-nowrap text-rose-500">
<div class="flex items-center gap-1">
<span class="material-icons-outlined text-sm">south_east</span>
<span class="text-xs font-bold uppercase">Out</span>
</div>
</td>
<td class="px-6 py-4 whitespace-nowrap text-sm font-semibold text-white">2.5 Kg</td>
<td class="px-6 py-4 whitespace-nowrap text-sm"><a class="text-primary hover:underline underline-offset-4" href="#">#WST-0192</a></td>
<td class="px-6 py-4 whitespace-nowrap text-sm text-slate-400">Marcus V.</td>
</tr>
</tbody>
</table>
</div>
<div class="px-6 py-4 border-t border-primary/10 flex items-center justify-between">
<span class="text-xs text-slate-500 font-medium tracking-wide">Showing 1 to 3 of 152 movements</span>
<div class="flex gap-2">
<button class="px-3 py-1 bg-background-dark border border-primary/10 rounded text-xs hover:bg-primary/10">Previous</button>
<button class="px-3 py-1 bg-primary text-background-dark font-bold border border-primary rounded text-xs">1</button>
<button class="px-3 py-1 bg-background-dark border border-primary/10 rounded text-xs hover:bg-primary/10">2</button>
<button class="px-3 py-1 bg-background-dark border border-primary/10 rounded text-xs hover:bg-primary/10">Next</button>
</div>
</div>
</section>
<!-- Internal Transfers Section -->
<section class="space-y-6 pt-8 border-t border-primary/20">
<div class="flex items-center justify-between">
<div class="flex items-center gap-3">
<span class="material-icons-outlined text-primary">local_shipping</span>
<h2 class="text-xl font-bold text-white uppercase tracking-wider">Internal Stock Transfer</h2>
</div>
<div class="bg-primary/10 border border-primary/30 text-primary px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-widest">
                    Quick Transfer Utility
                </div>
</div>
<div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
<!-- Location Selectors -->
<div class="lg:col-span-4 space-y-4">
<div class="p-5 bg-charcoal rounded-xl border border-primary/10 space-y-4">
<label class="block">
<span class="text-xs font-bold text-primary uppercase tracking-widest mb-2 block">From Location</span>
<select class="w-full bg-background-dark border-primary/20 rounded-lg text-sm focus:ring-primary focus:border-primary text-slate-200">
<option>Main Kitchen (Storage A)</option>
<option>Cold Storage (Unit 2)</option>
<option>Front Counter Display</option>
</select>
</label>
<div class="flex justify-center -my-2">
<div class="w-8 h-8 rounded-full bg-primary flex items-center justify-center border-4 border-charcoal shadow-lg">
<span class="material-icons-outlined text-background-dark text-sm">arrow_downward</span>
</div>
</div>
<label class="block">
<span class="text-xs font-bold text-primary uppercase tracking-widest mb-2 block">To Location</span>
<select class="w-full bg-background-dark border-primary/20 rounded-lg text-sm focus:ring-primary focus:border-primary text-slate-200">
<option>Front Counter Display</option>
<option>Market Stall (Weekend)</option>
<option>Cold Storage (Unit 2)</option>
</select>
</label>
</div>
<button class="w-full py-4 bg-primary hover:bg-primary/90 text-background-dark font-black rounded-xl shadow-xl shadow-primary/10 transition-all uppercase tracking-widest text-sm flex items-center justify-center gap-3">
<span class="material-icons-outlined">send</span>
                        Transfer Stock Now
                    </button>
</div>
<!-- Transfer Item List -->
<div class="lg:col-span-8">
<div class="bg-charcoal rounded-xl border border-primary/10 overflow-hidden">
<div class="p-4 bg-background-dark/50 border-b border-primary/10 flex items-center justify-between">
<span class="text-xs font-bold text-slate-400 uppercase tracking-widest">Items to Transfer</span>
<button class="text-xs font-bold text-primary flex items-center gap-1 hover:underline">
<span class="material-icons-outlined text-xs">add_circle</span> Add Item
                            </button>
</div>
<div class="p-4 space-y-3 min-h-[220px]">
<!-- Draggable Item 1 -->
<div class="flex items-center gap-4 p-3 bg-background-dark border border-primary/5 rounded-lg group hover:border-primary/40 transition-colors">
<span class="material-icons-outlined text-slate-600 cursor-move">drag_indicator</span>
<div class="flex-1">
<p class="text-sm font-semibold">Baguette Tradition</p>
<p class="text-[10px] text-slate-500 uppercase">Available: 42 Units</p>
</div>
<div class="flex items-center gap-3">
<div class="flex items-center border border-primary/20 rounded bg-charcoal">
<button class="px-2 py-1 text-primary hover:bg-primary/10">-</button>
<input class="w-12 bg-transparent border-none text-center text-sm font-bold focus:ring-0 p-1" type="text" value="12"/>
<button class="px-2 py-1 text-primary hover:bg-primary/10">+</button>
</div>
<button class="p-1 text-slate-600 hover:text-rose-500">
<span class="material-icons-outlined text-sm">delete</span>
</button>
</div>
</div>
<!-- Draggable Item 2 -->
<div class="flex items-center gap-4 p-3 bg-background-dark border border-primary/5 rounded-lg group hover:border-primary/40 transition-colors">
<span class="material-icons-outlined text-slate-600 cursor-move">drag_indicator</span>
<div class="flex-1">
<p class="text-sm font-semibold">Pain au Chocolat</p>
<p class="text-[10px] text-slate-500 uppercase">Available: 15 Units</p>
</div>
<div class="flex items-center gap-3">
<div class="flex items-center border border-primary/20 rounded bg-charcoal">
<button class="px-2 py-1 text-primary hover:bg-primary/10">-</button>
<input class="w-12 bg-transparent border-none text-center text-sm font-bold focus:ring-0 p-1" type="text" value="8"/>
<button class="px-2 py-1 text-primary hover:bg-primary/10">+</button>
</div>
<button class="p-1 text-slate-600 hover:text-rose-500">
<span class="material-icons-outlined text-sm">delete</span>
</button>
</div>
</div>
<!-- Drop Zone Placeholder -->
<div class="border-2 border-dashed border-primary/10 rounded-lg py-6 flex flex-col items-center justify-center text-slate-600">
<span class="material-icons-outlined mb-1">archive</span>
<p class="text-xs uppercase font-bold tracking-widest">Drag additional items here</p>
</div>
</div>
<div class="p-4 bg-background-dark/30 flex justify-end gap-6 border-t border-primary/5">
<div class="text-right">
<p class="text-[10px] text-slate-500 uppercase font-bold">Total Items</p>
<p class="text-sm font-bold text-white">2 SKUs / 20 Units</p>
</div>
<div class="text-right">
<p class="text-[10px] text-slate-500 uppercase font-bold">Transfer Weight</p>
<p class="text-sm font-bold text-white">~4.2 kg</p>
</div>
</div>
</div>
</div>
</div>
</section>
</main>
<footer class="mt-12 py-8 border-t border-primary/10 text-center">
<p class="text-xs text-slate-500 font-medium tracking-wide">
            The Breakery Cloud Management Platform • Inventory Module v2.4.1
        </p>
</footer>
</body></html>
      <!-- STITCH_HTML_END -->
    \ }} />
  );
};

export default Stock_Movements___Transfers;
