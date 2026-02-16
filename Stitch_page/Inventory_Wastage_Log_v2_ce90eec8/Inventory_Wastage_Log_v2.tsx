import React from 'react';

const Inventory_Wastage_Log_v2: React.FC = () => {
  return (
    <div dangerouslySetInnerHTML={{ __html: `
      <!-- STITCH_HTML_START -->
      <!DOCTYPE html>
<html class="dark" lang="en"><head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
<title>The Breakery | Enterprise Wastage Log</title>
<script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&amp;family=Playfair+Display:wght@400;600;700&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<script id="tailwind-config">
        tailwind.config = {
          darkMode: "class",
          theme: {
            extend: {
              colors: {
                "onyx": "#0D0D0F",
                "charcoal": "#1A1A1D",
                "gold": "#C9A55C",
                "stone-text": "#E5E7EB"
              },
              fontFamily: {
                "sans": ["Inter", "sans-serif"],
                "display": ["Playfair Display", "serif"]
              }
            },
          },
        }
    </script>
<style type="text/tailwindcss">
        @layer base {
            body {
                @apply bg-onyx text-stone-text font-sans antialiased;
            }
        }
        .custom-scrollbar::-webkit-scrollbar {
            width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
            background: #0D0D0F;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
            background: #C9A55C33;
            border-radius: 10px;
        }
        .material-symbols-outlined {
            font-variation-settings: 'FILL' 0, 'wght' 300, 'GRAD' 0, 'opsz' 24;
        }
    </style>
</head>
<body class="overflow-hidden">
<div class="flex h-screen">
<aside class="w-[240px] flex-shrink-0 border-r border-gold/10 bg-onyx flex flex-col">
<div class="p-8">
<div class="flex items-center gap-3">
<div class="w-10 h-10 bg-gold flex items-center justify-center rounded-sm">
<span class="text-onyx font-bold text-xl font-display">B</span>
</div>
<span class="text-sm font-bold tracking-[0.25em] uppercase text-stone-text">The Breakery</span>
</div>
</div>
<nav class="flex-1 px-4 space-y-1 mt-6">
<a class="flex items-center gap-4 px-4 py-3 text-stone-text/50 hover:text-gold transition-colors duration-200" href="#">
<span class="material-symbols-outlined text-[20px]">dashboard</span>
<span class="text-[11px] font-semibold uppercase tracking-widest">Dashboard</span>
</a>
<a class="flex items-center gap-4 px-4 py-3 text-stone-text/50 hover:text-gold transition-colors duration-200" href="#">
<span class="material-symbols-outlined text-[20px]">inventory_2</span>
<span class="text-[11px] font-semibold uppercase tracking-widest">Stock Levels</span>
</a>
<a class="flex items-center gap-4 px-4 py-3 text-gold bg-gold/5 border-l-2 border-gold -ml-4 pl-[18px]" href="#">
<span class="material-symbols-outlined text-[20px]">delete_sweep</span>
<span class="text-[11px] font-semibold uppercase tracking-widest">Wastage Log</span>
</a>
<a class="flex items-center gap-4 px-4 py-3 text-stone-text/50 hover:text-gold transition-colors duration-200" href="#">
<span class="material-symbols-outlined text-[20px]">payments</span>
<span class="text-[11px] font-semibold uppercase tracking-widest">Financials</span>
</a>
<a class="flex items-center gap-4 px-4 py-3 text-stone-text/50 hover:text-gold transition-colors duration-200" href="#">
<span class="material-symbols-outlined text-[20px]">settings</span>
<span class="text-[11px] font-semibold uppercase tracking-widest">Preferences</span>
</a>
</nav>
<div class="p-6 mt-auto border-t border-gold/10">
<div class="flex items-center gap-3 p-3 bg-charcoal rounded-lg border border-gold/5">
<div class="w-9 h-9 rounded bg-gold/10 flex items-center justify-center border border-gold/20">
<span class="material-symbols-outlined text-gold">person</span>
</div>
<div class="min-w-0">
<p class="text-[11px] font-bold text-stone-text truncate uppercase tracking-tight">Jean-Luc Durand</p>
<p class="text-[9px] text-stone-text/40 uppercase tracking-widest">Administrator</p>
</div>
</div>
</div>
</aside>
<main class="flex-1 flex flex-col min-w-0 overflow-hidden bg-onyx">
<header class="h-20 flex items-center justify-between px-10 border-b border-gold/10 bg-onyx/50 backdrop-blur-md sticky top-0 z-10">
<h1 class="text-2xl font-display text-stone-text tracking-wide uppercase">Inventory <span class="font-bold">Wastage</span></h1>
<div class="flex items-center gap-6">
<div class="relative w-72">
<span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-stone-text/30 text-[18px]">search</span>
<input class="w-full bg-charcoal border border-gold/20 rounded py-2.5 pl-10 pr-4 text-xs text-stone-text placeholder:text-stone-text/30 focus:outline-none focus:border-gold/50 transition-all" placeholder="Search by item or staff..." type="text"/>
</div>
<button class="bg-gold hover:bg-gold/90 text-onyx font-bold text-[11px] px-6 py-2.5 rounded shadow-xl shadow-gold/10 transition-all uppercase tracking-widest flex items-center gap-2">
<span class="material-symbols-outlined text-lg">add</span> Report Waste
                    </button>
</div>
</header>
<div class="flex-1 overflow-y-auto custom-scrollbar p-10">
<div class="grid grid-cols-3 gap-8 mb-10">
<div class="bg-charcoal border border-gold/10 p-8 rounded-sm relative group">
<div class="absolute top-4 right-4 text-gold/20">
<span class="material-symbols-outlined text-3xl">analytics</span>
</div>
<p class="text-[10px] uppercase tracking-[0.2em] text-stone-text/40 mb-4 font-semibold">Total Waste (Month-to-Date)</p>
<div class="flex items-baseline gap-2">
<span class="text-4xl font-display text-gold">142.50</span>
<span class="text-xs text-stone-text/30 uppercase tracking-widest">Units</span>
</div>
<div class="absolute bottom-0 left-0 h-[1px] w-full bg-gradient-to-r from-transparent via-gold/30 to-transparent"></div>
</div>
<div class="bg-charcoal border border-gold/10 p-8 rounded-sm relative group">
<div class="absolute top-4 right-4 text-gold/20">
<span class="material-symbols-outlined text-3xl">bakery_dining</span>
</div>
<p class="text-[10px] uppercase tracking-[0.2em] text-stone-text/40 mb-4 font-semibold">Highest Waste Category</p>
<div class="flex items-baseline gap-2">
<span class="text-4xl font-display text-gold tracking-tight">Pastry</span>
<span class="text-xs text-stone-text/30 uppercase tracking-widest">38% total</span>
</div>
<div class="absolute bottom-0 left-0 h-[1px] w-full bg-gradient-to-r from-transparent via-gold/30 to-transparent"></div>
</div>
<div class="bg-charcoal border border-gold/10 p-8 rounded-sm relative group">
<div class="absolute top-4 right-4 text-gold/20">
<span class="material-symbols-outlined text-3xl">account_balance_wallet</span>
</div>
<p class="text-[10px] uppercase tracking-[0.2em] text-stone-text/40 mb-4 font-semibold">Financial Loss</p>
<div class="flex items-baseline gap-2">
<span class="text-4xl font-display text-gold">€1,842.00</span>
<span class="text-xs text-green-500/60 uppercase tracking-widest font-bold">Stable</span>
</div>
<div class="absolute bottom-0 left-0 h-[1px] w-full bg-gradient-to-r from-transparent via-gold/30 to-transparent"></div>
</div>
</div>
<div class="bg-charcoal border border-gold/10 rounded-sm">
<div class="overflow-x-auto">
<table class="w-full text-left border-collapse">
<thead>
<tr class="border-b border-gold/10 bg-onyx/20">
<th class="px-8 py-5 text-[10px] font-bold text-stone-text/40 uppercase tracking-[0.2em]">Date</th>
<th class="px-8 py-5 text-[10px] font-bold text-stone-text/40 uppercase tracking-[0.2em]">Item Name</th>
<th class="px-8 py-5 text-[10px] font-bold text-stone-text/40 uppercase tracking-[0.2em] text-center">Quantity</th>
<th class="px-8 py-5 text-[10px] font-bold text-stone-text/40 uppercase tracking-[0.2em]">Reason</th>
<th class="px-8 py-5 text-[10px] font-bold text-stone-text/40 uppercase tracking-[0.2em] text-right">Loss Value</th>
<th class="w-12"></th>
</tr>
</thead>
<tbody class="divide-y divide-gold/5">
<tr class="hover:bg-gold/5 transition-colors group cursor-pointer bg-gold/5">
<td class="px-8 py-6 text-[13px] text-stone-text/60 tabular-nums">Nov 24, 2023</td>
<td class="px-8 py-6">
<div class="flex items-center gap-4">
<div class="w-10 h-10 rounded-sm bg-onyx border border-gold/10 overflow-hidden">
<img class="w-full h-full object-cover grayscale brightness-75 hover:grayscale-0 transition-all duration-500" data-alt="Freshly baked croissants on tray" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBmKXCu7DZ1RMhkMIq9jbbM5iyAuxeAat07aElP6NJky1BTZ3TEhW4KPdf0npXNdY7cHiJ--4dte1O1DISkiaUvwln58mog1UnrGB7oBitEgGxVHIQo181wBTcG6JXyLDGmvIhhyJ0xdk-jAKRec-ZQ0qKC2U-lB0RvS1Eh8N14emdxeCMLSiV-83-tIZ2CAHDo27APuIqK6fBg_xt_hTjXzBQclAHrV67OdNYSJCzfHSCou7mv5m7wFtIX_Ulp9VKxQKXDDV8rtVU"/>
</div>
<span class="text-[13px] font-bold text-stone-text uppercase tracking-wider">Almond Croissant</span>
</div>
</td>
<td class="px-8 py-6 text-[13px] text-stone-text text-center tabular-nums font-bold">12</td>
<td class="px-8 py-6">
<span class="inline-flex items-center px-2.5 py-1 rounded-sm text-[9px] font-bold uppercase tracking-widest bg-red-500/10 text-red-400 border border-red-500/20">Expired</span>
</td>
<td class="px-8 py-6 text-[13px] text-gold font-bold text-right tabular-nums">€54.00</td>
<td class="px-8 py-6 text-right">
<span class="material-symbols-outlined text-gold transform rotate-180">expand_more</span>
</td>
</tr>
<tr class="bg-onyx/40">
<td class="px-8 py-0" colspan="6">
<div class="grid grid-cols-2 gap-12 py-8 border-l-2 border-gold ml-4">
<div class="pl-10">
<p class="text-[10px] uppercase tracking-widest text-stone-text/30 mb-2 font-bold">Waste Reason Note</p>
<p class="text-[13px] text-stone-text/80 leading-relaxed italic italic font-serif">"Batch failed internal quality check due to temperature fluctuation in Proofing Unit 04. Exterior over-browning while core remained doughy."</p>
</div>
<div class="pr-10">
<p class="text-[10px] uppercase tracking-widest text-stone-text/30 mb-3 font-bold">Reporting Staff</p>
<div class="flex items-center gap-3">
<div class="w-8 h-8 rounded bg-gold/10 flex items-center justify-center border border-gold/20">
<span class="text-[10px] text-gold font-bold">MB</span>
</div>
<span class="text-xs text-stone-text font-bold uppercase tracking-widest">Marc-Antoine Boulanger</span>
</div>
</div>
</div>
</td>
</tr>
<tr class="hover:bg-gold/5 transition-colors group cursor-pointer">
<td class="px-8 py-6 text-[13px] text-stone-text/60 tabular-nums">Nov 23, 2023</td>
<td class="px-8 py-6">
<div class="flex items-center gap-4">
<div class="w-10 h-10 rounded-sm bg-onyx border border-gold/10 overflow-hidden">
<img class="w-full h-full object-cover grayscale brightness-75 hover:grayscale-0 transition-all duration-500" data-alt="Glass bottle of organic milk" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDnO29WDKACBcNPGaGmTR079lKf8F0wYQzkmzmlN25I7Q_baBjjCvohfs7458iO1UCnZ-3IxNchYKb9xfeS_y353Q5DM6aWn2ZeA_Nv0p6-Bx3TyvHeYiodZ1VRrefaz1yeFw66D1VOoujEvZH1ApmMHYHgDvoaVqT3dbbus_5dOm43nwMgZppcTagnx2bwXmEfJ31lCE1XULuDGKuSofzHuYKDP_MbKij-eCpzdAVQSr-ym0v4GV23vpI6kqFRo3ds18l-CqVjyRg"/>
</div>
<span class="text-[13px] font-bold text-stone-text uppercase tracking-wider">Whole Milk (2L)</span>
</div>
</td>
<td class="px-8 py-6 text-[13px] text-stone-text text-center tabular-nums font-bold">4</td>
<td class="px-8 py-6">
<span class="inline-flex items-center px-2.5 py-1 rounded-sm text-[9px] font-bold uppercase tracking-widest bg-yellow-500/10 text-yellow-400 border border-yellow-500/20">Damaged</span>
</td>
<td class="px-8 py-6 text-[13px] text-gold font-bold text-right tabular-nums">€11.20</td>
<td class="px-8 py-6 text-right">
<span class="material-symbols-outlined text-stone-text/20 group-hover:text-gold transition-colors">expand_more</span>
</td>
</tr>
<tr class="hover:bg-gold/5 transition-colors group cursor-pointer">
<td class="px-8 py-6 text-[13px] text-stone-text/60 tabular-nums">Nov 22, 2023</td>
<td class="px-8 py-6">
<div class="flex items-center gap-4">
<div class="w-10 h-10 rounded-sm bg-onyx border border-gold/10 overflow-hidden">
<img class="w-full h-full object-cover grayscale brightness-75 hover:grayscale-0 transition-all duration-500" data-alt="Baguette tradition on dark background" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBqUnqhuq4HWkM_YTzhyoDFwTIZOUNGiev1rKQqW9MH9Sy2RKoxOirWPp2iozKMZwHn86QSFCI_xqpeVraHfcdHD0jwCfvUD3l83NELWYufwivyGhXw6q-pYgUAVRa4R_Pwo05GkzlWCtEcHhj6ZTP9ZLnd8nvvVlNys4uXLJpgZ83qnGowgBgy8MCtL8P73jBchyOpEHNfCsVbCIQmG4GZBMnMYvyoC7FsK9RTp71ZLeMQ68uail8vNATBOy5wKAHddEyCaagqhok"/>
</div>
<span class="text-[13px] font-bold text-stone-text uppercase tracking-wider">Baguette Tradition</span>
</div>
</td>
<td class="px-8 py-6 text-[13px] text-stone-text text-center tabular-nums font-bold">25</td>
<td class="px-8 py-6">
<span class="inline-flex items-center px-2.5 py-1 rounded-sm text-[9px] font-bold uppercase tracking-widest bg-blue-500/10 text-blue-400 border border-blue-500/20">QC</span>
</td>
<td class="px-8 py-6 text-[13px] text-gold font-bold text-right tabular-nums">€37.50</td>
<td class="px-8 py-6 text-right">
<span class="material-symbols-outlined text-stone-text/20 group-hover:text-gold transition-colors">expand_more</span>
</td>
</tr>
</tbody>
</table>
</div>
<div class="px-8 py-6 flex items-center justify-between border-t border-gold/10">
<p class="text-[10px] text-stone-text/30 uppercase tracking-[0.2em] font-bold">Showing 1-15 of 24 records</p>
<div class="flex gap-3">
<button class="w-9 h-9 flex items-center justify-center rounded-sm border border-gold/10 text-stone-text/30 hover:text-gold transition-colors">
<span class="material-symbols-outlined text-sm">chevron_left</span>
</button>
<button class="w-9 h-9 flex items-center justify-center rounded-sm bg-gold/10 border border-gold/40 text-gold">
<span class="text-[10px] font-bold">01</span>
</button>
<button class="w-9 h-9 flex items-center justify-center rounded-sm border border-gold/10 text-stone-text/30 hover:text-gold transition-colors">
<span class="text-[10px] font-bold">02</span>
</button>
<button class="w-9 h-9 flex items-center justify-center rounded-sm border border-gold/10 text-stone-text/30 hover:text-gold transition-colors">
<span class="material-symbols-outlined text-sm">chevron_right</span>
</button>
</div>
</div>
</div>
<footer class="mt-12 flex justify-between items-center py-6 border-t border-gold/5">
<div class="flex items-center gap-6 opacity-30">
<p class="text-[9px] uppercase tracking-widest font-bold">Audit Log: Active v4.2.0</p>
<span class="w-1 h-1 bg-gold rounded-full"></span>
<p class="text-[9px] uppercase tracking-widest font-bold">Enterprise Secured</p>
</div>
<div class="flex gap-8 opacity-40">
<span class="text-[9px] font-bold uppercase tracking-[0.3em]">Paris</span>
<span class="text-[9px] font-bold uppercase tracking-[0.3em]">Lyon</span>
<span class="text-[9px] font-bold uppercase tracking-[0.3em]">Bordeaux</span>
</div>
</footer>
</div>
</main>
</div>

</body></html>
      <!-- STITCH_HTML_END -->
    ` }} />
  );
};

export default Inventory_Wastage_Log_v2;
