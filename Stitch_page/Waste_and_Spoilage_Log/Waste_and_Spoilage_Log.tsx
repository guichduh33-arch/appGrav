import React from 'react';

const Waste_and_Spoilage_Log: React.FC = () => {
  return (
    <div dangerouslySetInnerHTML={{ __html: `
      <!-- STITCH_HTML_START -->
      <!DOCTYPE html>

<html class="dark" lang="en"><head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
<title>The Breakery - Waste &amp; Spoilage Log</title>
<script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
<link href="https://fonts.googleapis.com/css2?family=Manrope:wght@300;400;500;600;700;800&amp;family=Playfair+Display:wght@600;700&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<script id="tailwind-config">
        tailwind.config = {
            darkMode: "class",
            theme: {
                extend: {
                    colors: {
                        "primary": "#f2d00d",
                        "background-light": "#f8f8f5",
                        "background-dark": "#0D0D0F",
                        "surface-dark": "#1A1A1D",
                    },
                    fontFamily: {
                        "display": ["Manrope", "sans-serif"],
                        "accent": ["Playfair Display", "serif"]
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
            font-family: 'Manrope', sans-serif;
            background-color: #0D0D0F;
        }
        .playfair {
            font-family: 'Playfair Display', serif;
        }
    </style>
</head>
<body class="bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 min-h-screen">
<!-- Sidebar Navigation (Briefly represented for context) -->
<aside class="fixed left-0 top-0 h-full w-20 border-r border-primary/10 bg-background-dark flex flex-col items-center py-8 gap-8 z-10">
<div class="w-12 h-12 bg-primary rounded-xl flex items-center justify-center">
<span class="material-icons text-background-dark font-bold">bakery_dining</span>
</div>
<div class="flex flex-col gap-6 mt-8">
<span class="material-icons text-slate-500 hover:text-primary cursor-pointer transition-colors">dashboard</span>
<span class="material-icons text-slate-500 hover:text-primary cursor-pointer transition-colors">inventory_2</span>
<span class="material-icons text-primary cursor-pointer transition-colors">delete_sweep</span>
<span class="material-icons text-slate-500 hover:text-primary cursor-pointer transition-colors">assessment</span>
<span class="material-icons text-slate-500 hover:text-primary cursor-pointer transition-colors">settings</span>
</div>
</aside>
<main class="ml-20 p-8">
<!-- Header Section -->
<header class="flex justify-between items-center mb-10">
<div class="flex items-center gap-4">
<div class="p-3 bg-primary/10 rounded-lg">
<span class="material-icons text-primary">delete_outline</span>
</div>
<h1 class="playfair text-3xl font-bold tracking-tight text-white">Waste &amp; Spoilage</h1>
</div>
<button class="flex items-center gap-2 bg-primary hover:bg-primary/90 text-background-dark font-bold px-6 py-2.5 rounded-lg transition-all shadow-[0_0_20px_rgba(242,208,13,0.15)]">
<span class="material-icons text-sm">add</span>
<span>Log Waste</span>
</button>
</header>
<!-- KPI Cards Grid -->
<section class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
<!-- Today's Waste -->
<div class="bg-surface-dark border border-white/5 p-6 rounded-xl relative overflow-hidden group">
<div class="flex justify-between items-start mb-4">
<p class="text-slate-400 font-medium">Today's Waste</p>
<span class="material-icons text-red-500/50">trending_down</span>
</div>
<div class="flex items-baseline gap-2">
<h3 class="text-3xl font-extrabold text-red-500">Rp 125.000</h3>
</div>
<div class="mt-2 text-xs text-slate-500 flex items-center gap-1">
<span class="text-red-500">↑ 12%</span> vs yesterday
                </div>
<div class="absolute bottom-0 right-0 p-2 opacity-5 group-hover:opacity-10 transition-opacity">
<span class="material-icons text-8xl">receipt_long</span>
</div>
</div>
<!-- This Month -->
<div class="bg-surface-dark border border-white/5 p-6 rounded-xl relative overflow-hidden group">
<div class="flex justify-between items-start mb-4">
<p class="text-slate-400 font-medium">This Month</p>
<span class="material-icons text-amber-500/50">warning_amber</span>
</div>
<div class="flex items-baseline gap-2">
<h3 class="text-3xl font-extrabold text-amber-500">Rp 2.340.000</h3>
</div>
<div class="mt-2 text-xs text-slate-500 flex items-center gap-1">
<span class="text-amber-500">↑ 2.4%</span> monthly average
                </div>
<div class="absolute bottom-0 right-0 p-2 opacity-5 group-hover:opacity-10 transition-opacity">
<span class="material-icons text-8xl">calendar_today</span>
</div>
</div>
<!-- Waste Rate -->
<div class="bg-surface-dark border border-white/5 p-6 rounded-xl relative overflow-hidden group">
<div class="flex justify-between items-start mb-4">
<p class="text-slate-400 font-medium">Waste Rate</p>
<span class="material-icons text-emerald-500/50">check_circle_outline</span>
</div>
<div class="flex items-baseline gap-2">
<h3 class="text-3xl font-extrabold text-emerald-500">3.2%</h3>
</div>
<div class="mt-2 text-xs text-slate-500 flex items-center gap-1">
<span class="text-emerald-500">↓ 0.5%</span> target: &lt; 4.0%
                </div>
<div class="absolute bottom-0 right-0 p-2 opacity-5 group-hover:opacity-10 transition-opacity">
<span class="material-icons text-8xl">pie_chart</span>
</div>
</div>
</section>
<!-- Waste Log Table -->
<section class="bg-surface-dark rounded-xl border border-white/5 overflow-hidden">
<div class="p-6 border-b border-white/5 flex justify-between items-center bg-white/5">
<h2 class="font-bold text-lg text-white">Recent Waste Logs</h2>
<div class="flex gap-2">
<div class="relative">
<input class="bg-background-dark border-white/10 rounded-lg pl-10 pr-4 py-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none text-slate-200" placeholder="Search product..." type="text"/>
<span class="material-icons absolute left-3 top-2 text-slate-500 text-sm">search</span>
</div>
<button class="bg-background-dark border border-white/10 p-2 rounded-lg hover:bg-white/5 transition-colors">
<span class="material-icons text-slate-400">filter_list</span>
</button>
</div>
</div>
<div class="overflow-x-auto">
<table class="w-full text-left">
<thead>
<tr class="bg-white/2 text-slate-400 text-xs uppercase tracking-widest border-b border-white/5">
<th class="px-6 py-4 font-semibold">Date</th>
<th class="px-6 py-4 font-semibold">Product</th>
<th class="px-6 py-4 font-semibold">Qty</th>
<th class="px-6 py-4 font-semibold">Unit</th>
<th class="px-6 py-4 font-semibold">Cost (Rp)</th>
<th class="px-6 py-4 font-semibold">Reason</th>
<th class="px-6 py-4 font-semibold">Staff</th>
<th class="px-6 py-4 font-semibold"></th>
</tr>
</thead>
<tbody class="divide-y divide-white/5">
<tr class="hover:bg-white/2 transition-colors">
<td class="px-6 py-4 text-sm text-slate-300">24 Oct, 09:12</td>
<td class="px-6 py-4 font-medium text-white">Sourdough Country Loaf</td>
<td class="px-6 py-4 text-sm">5</td>
<td class="px-6 py-4 text-sm text-slate-400">pcs</td>
<td class="px-6 py-4 text-sm font-semibold">175.000</td>
<td class="px-6 py-4">
<span class="px-3 py-1 text-[10px] font-bold uppercase rounded-full border border-amber-500/30 text-amber-500 bg-amber-500/5">Expired</span>
</td>
<td class="px-6 py-4 text-sm text-slate-300">Amanda S.</td>
<td class="px-6 py-4 text-right">
<button class="text-slate-500 hover:text-white"><span class="material-icons text-lg">more_vert</span></button>
</td>
</tr>
<tr class="hover:bg-white/2 transition-colors">
<td class="px-6 py-4 text-sm text-slate-300">24 Oct, 10:45</td>
<td class="px-6 py-4 font-medium text-white">Butter Croissant</td>
<td class="px-6 py-4 text-sm">3</td>
<td class="px-6 py-4 text-sm text-slate-400">pcs</td>
<td class="px-6 py-4 text-sm font-semibold">66.000</td>
<td class="px-6 py-4">
<span class="px-3 py-1 text-[10px] font-bold uppercase rounded-full border border-red-500/30 text-red-500 bg-red-500/5">Damaged</span>
</td>
<td class="px-6 py-4 text-sm text-slate-300">Budi R.</td>
<td class="px-6 py-4 text-right">
<button class="text-slate-500 hover:text-white"><span class="material-icons text-lg">more_vert</span></button>
</td>
</tr>
<tr class="hover:bg-white/2 transition-colors">
<td class="px-6 py-4 text-sm text-slate-300">23 Oct, 18:30</td>
<td class="px-6 py-4 font-medium text-white">Whole Milk 1L</td>
<td class="px-6 py-4 text-sm">2</td>
<td class="px-6 py-4 text-sm text-slate-400">btl</td>
<td class="px-6 py-4 text-sm font-semibold">38.000</td>
<td class="px-6 py-4">
<span class="px-3 py-1 text-[10px] font-bold uppercase rounded-full border border-orange-500/30 text-orange-500 bg-orange-500/5">Spoiled</span>
</td>
<td class="px-6 py-4 text-sm text-slate-300">Siti K.</td>
<td class="px-6 py-4 text-right">
<button class="text-slate-500 hover:text-white"><span class="material-icons text-lg">more_vert</span></button>
</td>
</tr>
<tr class="hover:bg-white/2 transition-colors">
<td class="px-6 py-4 text-sm text-slate-300">23 Oct, 14:00</td>
<td class="px-6 py-4 font-medium text-white">Pistachio Pain au Choc</td>
<td class="px-6 py-4 text-sm">4</td>
<td class="px-6 py-4 text-sm text-slate-400">pcs</td>
<td class="px-6 py-4 text-sm font-semibold">120.000</td>
<td class="px-6 py-4">
<span class="px-3 py-1 text-[10px] font-bold uppercase rounded-full border border-purple-500/30 text-purple-500 bg-purple-500/5">Quality</span>
</td>
<td class="px-6 py-4 text-sm text-slate-300">Amanda S.</td>
<td class="px-6 py-4 text-right">
<button class="text-slate-500 hover:text-white"><span class="material-icons text-lg">more_vert</span></button>
</td>
</tr>
<tr class="hover:bg-white/2 transition-colors">
<td class="px-6 py-4 text-sm text-slate-300">23 Oct, 11:20</td>
<td class="px-6 py-4 font-medium text-white">French Baguette</td>
<td class="px-6 py-4 text-sm">8</td>
<td class="px-6 py-4 text-sm text-slate-400">pcs</td>
<td class="px-6 py-4 text-sm font-semibold">160.000</td>
<td class="px-6 py-4">
<span class="px-3 py-1 text-[10px] font-bold uppercase rounded-full border border-blue-500/30 text-blue-500 bg-blue-500/5">Overproduction</span>
</td>
<td class="px-6 py-4 text-sm text-slate-300">Chef Marco</td>
<td class="px-6 py-4 text-right">
<button class="text-slate-500 hover:text-white"><span class="material-icons text-lg">more_vert</span></button>
</td>
</tr>
</tbody>
</table>
</div>
<div class="p-4 border-t border-white/5 flex justify-center">
<button class="text-primary text-xs font-bold uppercase tracking-widest hover:underline">Load More Records</button>
</div>
</section>
<!-- Overlay Modal (Log Waste Form) -->
<div class="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-6">
<div class="bg-surface-dark border-2 border-primary w-full max-w-xl rounded-xl shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden">
<div class="flex justify-between items-center p-6 border-b border-white/5">
<h2 class="playfair text-2xl text-primary font-bold">Log Waste Entry</h2>
<button class="text-slate-400 hover:text-white transition-colors">
<span class="material-icons">close</span>
</button>
</div>
<form class="p-8 space-y-6">
<!-- Product Search -->
<div class="space-y-2">
<label class="text-xs font-bold uppercase tracking-wider text-slate-400">Search Product</label>
<div class="relative">
<input class="w-full bg-background-dark border-white/10 rounded-lg py-3 pl-4 pr-12 focus:border-primary focus:ring-1 focus:ring-primary outline-none text-white transition-all" type="text" value="Almond Croissant"/>
<span class="material-icons absolute right-4 top-3 text-primary">search</span>
</div>
</div>
<div class="grid grid-cols-2 gap-6">
<!-- Qty -->
<div class="space-y-2">
<label class="text-xs font-bold uppercase tracking-wider text-slate-400">Quantity</label>
<div class="flex items-center gap-0 overflow-hidden border border-white/10 rounded-lg focus-within:border-primary transition-all">
<input class="w-full bg-background-dark border-none py-3 pl-4 text-white focus:ring-0" placeholder="0" type="number"/>
<span class="bg-white/5 px-4 py-3 text-slate-400 border-l border-white/10 text-sm">pcs</span>
</div>
</div>
<!-- Reason -->
<div class="space-y-2">
<label class="text-xs font-bold uppercase tracking-wider text-slate-400">Reason</label>
<select class="w-full bg-background-dark border-white/10 rounded-lg py-3 pl-4 pr-10 focus:border-primary focus:ring-1 focus:ring-primary outline-none text-white appearance-none transition-all">
<option>Select Reason</option>
<option>Expired</option>
<option>Damaged</option>
<option>Spoiled</option>
<option>Quality Control</option>
<option>Overproduction</option>
</select>
</div>
</div>
<div class="grid grid-cols-2 gap-6">
<!-- Calculated Cost -->
<div class="space-y-2">
<label class="text-xs font-bold uppercase tracking-wider text-slate-400 text-primary">Auto-Calculated Cost</label>
<div class="w-full bg-primary/10 border border-primary/20 rounded-lg py-3 px-4 font-bold text-primary flex items-center justify-between">
<span>Rp</span>
<span>22.000</span>
</div>
</div>
<!-- Photo Evidence -->
<div class="space-y-2">
<label class="text-xs font-bold uppercase tracking-wider text-slate-400">Photo Evidence</label>
<div class="w-full border-2 border-dashed border-white/10 rounded-lg py-3 px-4 flex items-center justify-center gap-2 text-slate-500 hover:border-primary/50 hover:text-slate-300 cursor-pointer transition-all bg-white/2">
<span class="material-icons text-xl">camera_alt</span>
<span class="text-sm">Upload Photo</span>
</div>
</div>
</div>
<!-- Actions -->
<div class="pt-4 flex gap-4">
<button class="flex-1 bg-white/5 hover:bg-white/10 text-white font-bold py-3.5 rounded-lg transition-all border border-white/10" type="button">
                            Cancel
                        </button>
<button class="flex-[2] bg-primary hover:bg-primary/90 text-background-dark font-extrabold py-3.5 rounded-lg transition-all shadow-lg" type="submit">
                            Log Waste Entry
                        </button>
</div>
</form>
</div>
</div>
</main>
<!-- Map Location Data Placeholder (As requested for the tool) -->
<div data-location="Paris" style="display:none"></div>
</body></html>
      <!-- STITCH_HTML_END -->
    ` }} />
  );
};

export default Waste_and_Spoilage_Log;
