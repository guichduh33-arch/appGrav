import React from 'react';

const Incoming_Stock_and_Goods_Receipt: React.FC = () => {
  return (
    <div dangerouslySetInnerHTML={{ __html: `
      <!-- STITCH_HTML_START -->
      <!DOCTYPE html>

<html class="dark" lang="en"><head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
<script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&amp;family=Work+Sans:wght@300;400;500;600&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/icon?family=Material+Icons+Outlined" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<script id="tailwind-config">
        tailwind.config = {
          darkMode: "class",
          theme: {
            extend: {
              colors: {
                "primary": "#c8a45b",
                "background-light": "#f8f7f6",
                "background-dark": "#0D0D0F",
                "card-dark": "#1A1A1D",
                "accent-amber": "#d97706",
                "accent-green": "#059669",
                "accent-blue": "#2563eb",
                "accent-red": "#dc2626"
              },
              fontFamily: {
                "display": ["Work Sans"],
                "serif": ["Playfair Display"]
              },
              borderRadius: {"DEFAULT": "0.25rem", "lg": "0.5rem", "xl": "0.75rem", "full": "9999px"},
            },
          },
        }
    </script>
<style>
        body {
            font-family: 'Work Sans', sans-serif;
        }
        .serif-font {
            font-family: 'Playfair Display', serif;
        }
    </style>
</head>
<body class="bg-background-light dark:bg-background-dark text-slate-800 dark:text-slate-200 min-h-screen">
<div class="max-w-[1440px] mx-auto p-8">
<!-- Header Section -->
<header class="flex justify-between items-center mb-10">
<div>
<h1 class="serif-font text-3xl font-bold text-slate-900 dark:text-white">Incoming Stock</h1>
<p class="text-sm text-slate-500 dark:text-slate-400 mt-1 uppercase tracking-widest">Inventory Management &amp; Goods Receipt</p>
</div>
<button class="bg-primary hover:bg-primary/90 text-background-dark font-semibold px-6 py-2.5 rounded-lg flex items-center gap-2 transition-all">
<span class="material-icons-outlined text-sm">add</span>
                New Receipt
            </button>
</header>
<!-- KPI Metrics Grid -->
<div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
<!-- Pending Deliveries -->
<div class="bg-card-dark border border-primary/10 rounded-xl p-6 relative overflow-hidden group">
<div class="absolute top-0 right-0 w-24 h-24 bg-accent-amber/10 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110"></div>
<div class="flex flex-col">
<span class="text-slate-400 text-sm font-medium mb-2">Pending Deliveries</span>
<div class="flex items-end gap-3">
<span class="text-4xl font-bold text-accent-amber">4</span>
<span class="text-xs text-slate-500 mb-1.5 uppercase tracking-tighter">Due Today</span>
</div>
</div>
</div>
<!-- Received Today -->
<div class="bg-card-dark border border-primary/10 rounded-xl p-6 relative overflow-hidden group">
<div class="absolute top-0 right-0 w-24 h-24 bg-accent-green/10 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110"></div>
<div class="flex flex-col">
<span class="text-slate-400 text-sm font-medium mb-2">Received Today</span>
<div class="flex items-end gap-3">
<span class="text-4xl font-bold text-accent-green">2</span>
<span class="text-xs text-slate-500 mb-1.5 uppercase tracking-tighter">Completed</span>
</div>
</div>
</div>
<!-- Expected This Week -->
<div class="bg-card-dark border border-primary/10 rounded-xl p-6 relative overflow-hidden group">
<div class="absolute top-0 right-0 w-24 h-24 bg-accent-blue/10 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110"></div>
<div class="flex flex-col">
<span class="text-slate-400 text-sm font-medium mb-2">Expected This Week</span>
<div class="flex items-end gap-3">
<span class="text-4xl font-bold text-accent-blue">6</span>
<span class="text-xs text-slate-500 mb-1.5 uppercase tracking-tighter">Shipments</span>
</div>
</div>
</div>
</div>
<!-- Incoming Table Container -->
<div class="bg-card-dark rounded-xl border border-primary/10 shadow-2xl overflow-hidden">
<div class="p-6 border-b border-white/5 flex justify-between items-center">
<h2 class="text-lg font-semibold text-white">Purchase Orders Schedule</h2>
<div class="flex gap-2">
<div class="relative">
<span class="material-icons-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm">search</span>
<input class="bg-background-dark border border-white/10 rounded-lg pl-9 pr-4 py-1.5 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all" placeholder="Search PO or Supplier..." type="text"/>
</div>
</div>
</div>
<table class="w-full text-left">
<thead class="bg-white/5 text-slate-400 text-xs uppercase tracking-wider font-semibold">
<tr>
<th class="px-6 py-4">PO #</th>
<th class="px-6 py-4">Supplier</th>
<th class="px-6 py-4">Expected Date</th>
<th class="px-6 py-4">Items</th>
<th class="px-6 py-4">Status</th>
<th class="px-6 py-4 text-right">Actions</th>
</tr>
</thead>
<tbody class="divide-y divide-white/5">
<!-- Row 1: Active/Selected -->
<tr class="bg-primary/5 border-l-4 border-l-primary">
<td class="px-6 py-5 font-mono text-sm text-primary">#PO-9942</td>
<td class="px-6 py-5 font-medium text-white">Artisan Flour Mills</td>
<td class="px-6 py-5 text-sm text-slate-300">Today, 14:30</td>
<td class="px-6 py-5 text-sm text-slate-400">5 Items</td>
<td class="px-6 py-5">
<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-accent-amber/20 text-accent-amber ring-1 ring-inset ring-accent-amber/30">
                                Pending
                            </span>
</td>
<td class="px-6 py-5 text-right">
<button class="bg-primary/20 hover:bg-primary/30 text-primary border border-primary/30 px-4 py-1.5 rounded-lg text-xs font-bold uppercase transition-all">
                                Expand Details
                            </button>
</td>
</tr>
<!-- Expanded Details Form -->
<tr class="bg-background-dark/50">
<td class="px-10 py-8" colspan="6">
<div class="bg-white/5 border border-white/10 rounded-xl p-6">
<div class="flex items-center justify-between mb-6">
<div class="flex items-center gap-4">
<div class="bg-primary/10 p-2 rounded-lg">
<span class="material-icons-outlined text-primary">inventory_2</span>
</div>
<h3 class="text-white font-semibold">Goods Receipt Processing</h3>
</div>
<div class="text-sm text-slate-400">
                                        Reference: <span class="text-white">PO-9942-A</span>
</div>
</div>
<table class="w-full mb-8">
<thead class="text-xs text-slate-500 uppercase border-b border-white/5">
<tr>
<th class="pb-3 font-normal text-left">Product Name</th>
<th class="pb-3 font-normal text-center">Ordered Qty</th>
<th class="pb-3 font-normal text-center">Received Qty</th>
<th class="pb-3 font-normal text-center">Unit</th>
<th class="pb-3 font-normal text-center">Variance</th>
<th class="pb-3 font-normal text-right px-4">QC Check</th>
</tr>
</thead>
<tbody class="divide-y divide-white/5">
<tr>
<td class="py-4 text-white">Strong Bread Flour (T55)</td>
<td class="py-4 text-center text-slate-300">500.00</td>
<td class="py-4 text-center">
<input class="w-24 bg-card-dark border border-white/10 rounded-md py-1 text-center text-sm focus:border-primary outline-none" type="number" value="500"/>
</td>
<td class="py-4 text-center text-slate-500">KG</td>
<td class="py-4 text-center text-accent-green">0.00</td>
<td class="py-4 text-right px-4">
<input checked="" class="rounded border-white/10 bg-card-dark text-primary focus:ring-primary h-4 w-4" type="checkbox"/>
</td>
</tr>
<tr>
<td class="py-4 text-white">Organic Unsalted Butter</td>
<td class="py-4 text-center text-slate-300">120.00</td>
<td class="py-4 text-center">
<input class="w-24 bg-card-dark border border-accent-red/50 rounded-md py-1 text-center text-sm focus:border-accent-red outline-none" type="number" value="115"/>
</td>
<td class="py-4 text-center text-slate-500">KG</td>
<td class="py-4 text-center text-accent-red font-medium">-5.00</td>
<td class="py-4 text-right px-4">
<input class="rounded border-white/10 bg-card-dark text-primary focus:ring-primary h-4 w-4" type="checkbox"/>
</td>
</tr>
<tr>
<td class="py-4 text-white">Bourbon Vanilla Beans</td>
<td class="py-4 text-center text-slate-300">2.00</td>
<td class="py-4 text-center">
<input class="w-24 bg-card-dark border border-white/10 rounded-md py-1 text-center text-sm focus:border-primary outline-none" type="number" value="2"/>
</td>
<td class="py-4 text-center text-slate-500">KG</td>
<td class="py-4 text-center text-accent-green">0.00</td>
<td class="py-4 text-right px-4">
<input checked="" class="rounded border-white/10 bg-card-dark text-primary focus:ring-primary h-4 w-4" type="checkbox"/>
</td>
</tr>
</tbody>
</table>
<div class="flex justify-between items-start">
<div class="max-w-md">
<label class="block text-xs text-slate-500 uppercase mb-2">Internal Receipt Notes</label>
<textarea class="w-full bg-card-dark border border-white/10 rounded-lg p-3 text-sm text-slate-300 focus:border-primary outline-none h-24" placeholder="Mention variances, damaged goods, or quality issues here..."></textarea>
</div>
<div class="flex flex-col gap-3">
<div class="bg-accent-red/10 border border-accent-red/20 rounded-lg p-4 mb-2 flex items-start gap-3">
<span class="material-icons-outlined text-accent-red text-lg">warning</span>
<div>
<p class="text-xs font-semibold text-accent-red uppercase">Variance Warning</p>
<p class="text-xs text-accent-red/80">Discrepancy detected in Butter qty. Receipt will be marked as 'Partial'.</p>
</div>
</div>
<div class="flex justify-end gap-3">
<button class="px-6 py-2 border border-white/10 rounded-lg text-sm font-medium hover:bg-white/5 transition-colors">Discard</button>
<button class="px-8 py-2 bg-primary text-background-dark font-bold rounded-lg text-sm shadow-lg shadow-primary/20 hover:scale-[1.02] transition-transform">Confirm Receipt</button>
</div>
</div>
</div>
</div>
</td>
</tr>
<!-- Row 2 -->
<tr class="hover:bg-white/5 transition-colors">
<td class="px-6 py-5 font-mono text-sm text-slate-400">#PO-9938</td>
<td class="px-6 py-5 font-medium text-white">Swiss Chocolate Co.</td>
<td class="px-6 py-5 text-sm text-slate-300">Yesterday, 09:15</td>
<td class="px-6 py-5 text-sm text-slate-400">12 Items</td>
<td class="px-6 py-5">
<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-accent-green/20 text-accent-green ring-1 ring-inset ring-accent-green/30">
<span class="material-icons-outlined text-[10px] mr-1">check_circle</span>
                                Received
                            </span>
</td>
<td class="px-6 py-5 text-right">
<button class="text-slate-500 hover:text-white px-4 py-1.5 rounded-lg text-xs font-bold uppercase transition-all">
                                View Details
                            </button>
</td>
</tr>
<!-- Row 3 -->
<tr class="hover:bg-white/5 transition-colors">
<td class="px-6 py-5 font-mono text-sm text-slate-400">#PO-9945</td>
<td class="px-6 py-5 font-medium text-white">Dairy Peak Logistics</td>
<td class="px-6 py-5 text-sm text-slate-300">Tomorrow, 10:00</td>
<td class="px-6 py-5 text-sm text-slate-400">3 Items</td>
<td class="px-6 py-5">
<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-500/20 text-slate-400 ring-1 ring-inset ring-slate-500/30">
                                Scheduled
                            </span>
</td>
<td class="px-6 py-5 text-right">
<button class="bg-primary text-background-dark px-4 py-1.5 rounded-lg text-xs font-bold uppercase transition-all">
                                Receive
                            </button>
</td>
</tr>
</tbody>
</table>
<!-- Table Footer/Pagination -->
<div class="p-4 border-t border-white/5 flex items-center justify-between">
<p class="text-xs text-slate-500">Showing 1-10 of 24 purchase orders</p>
<div class="flex items-center gap-1">
<button class="p-1.5 rounded bg-white/5 text-slate-500 hover:text-white transition-colors">
<span class="material-icons-outlined text-sm">chevron_left</span>
</button>
<button class="w-8 h-8 rounded bg-primary text-background-dark text-xs font-bold">1</button>
<button class="w-8 h-8 rounded hover:bg-white/5 text-xs text-slate-400">2</button>
<button class="w-8 h-8 rounded hover:bg-white/5 text-xs text-slate-400">3</button>
<button class="p-1.5 rounded bg-white/5 text-slate-500 hover:text-white transition-colors">
<span class="material-icons-outlined text-sm">chevron_right</span>
</button>
</div>
</div>
</div>
<!-- Secondary Information Cards -->
<div class="grid grid-cols-1 md:grid-cols-2 gap-6 mt-10">
<div class="bg-card-dark rounded-xl border border-white/5 overflow-hidden">
<div class="p-4 border-b border-white/5 bg-white/5">
<h3 class="text-xs font-bold uppercase tracking-widest text-slate-400">Inventory Map: Main Warehouse</h3>
</div>
<div class="h-48 relative bg-background-dark flex items-center justify-center overflow-hidden">
<img class="w-full h-full object-cover opacity-30 grayscale contrast-125" data-alt="Schematic warehouse layout with highlighted zones" data-location="Chicago" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDvJNEpNBYyMAY9VklhCGtCKWii7hxdMO2Civ92TE6XkdJkS6O4-DE11c4Wd0nUsBdWtJJRyDt-mXLykDZXJwmT9MGM31WN2L5BIepvsGMY8EGN_yPWIIyHdKgwQVJH0xbbOb1MA53_TykmYMixjIzrtxyY7c0Tj0PWW6-9E1ae45OiAknNX39-E0X9eot8s0KSVW5OOwUYT15rZmvagaY1iIaazPWLhUk53nm3nC7uoPVjVn4DyxyRIiunrXNoOn-5g0Vgx3VMCMsd"/>
<div class="absolute inset-0 bg-gradient-to-t from-card-dark to-transparent"></div>
<div class="absolute bottom-4 left-4 bg-primary/90 text-background-dark px-3 py-1 rounded-full text-[10px] font-bold uppercase">Dock A-04 Receiving</div>
</div>
</div>
<div class="bg-card-dark rounded-xl border border-white/5 p-6 flex flex-col justify-center">
<div class="flex items-start gap-4 mb-4">
<div class="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
<span class="material-icons-outlined text-primary">local_shipping</span>
</div>
<div>
<h3 class="text-white font-medium">Logistics Efficiency</h3>
<p class="text-sm text-slate-500">Average receipt time: <span class="text-accent-green font-medium">18 mins</span></p>
</div>
</div>
<div class="space-y-3">
<div class="w-full bg-white/5 rounded-full h-1.5">
<div class="bg-primary h-1.5 rounded-full" style="width: 82%"></div>
</div>
<div class="flex justify-between text-[10px] uppercase font-bold text-slate-600">
<span>Receiving Performance</span>
<span class="text-primary">82% Target met</span>
</div>
</div>
</div>
</div>
</div>
</body></html>
      <!-- STITCH_HTML_END -->
    ` }} />
  );
};

export default Incoming_Stock_and_Goods_Receipt;
