import React from 'react';

const Physical_Inventory_Log: React.FC = () => {
  return (
    <div dangerouslySetInnerHTML={{ __html: `
      <!-- STITCH_HTML_START -->
      <!DOCTYPE html>
<html class="dark" lang="en"><head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
<title>The Breakery - Enterprise Opname Log</title>
<script src="https://cdn.tailwindcss.com?plugins=forms,typography,container-queries"></script>
<link href="https://fonts.googleapis.com" rel="preconnect"/>
<link crossorigin="" href="https://fonts.gstatic.com" rel="preconnect"/>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&amp;family=Playfair+Display:wght@700&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<style type="text/tailwindcss">
        :root {
            --primary-gold: #C9A55C;
            --deep-onyx: #0D0D0F;
            --sidebar-onyx: #121214;
            --stone-gray: #E5E7EB;
            --border-muted: #1F1F23;
        }
        .material-symbols-outlined {
            font-variation-settings: 'FILL' 0, 'wght' 300, 'GRAD' 0, 'opsz' 24;
        }
        body {
            font-family: 'Inter', sans-serif;
            background-color: var(--deep-onyx);
        }
        .font-display {
            font-family: 'Playfair Display', serif;
        }
        .sidebar-active {
            background-color: rgba(201, 165, 92, 0.08);
            border-right: 2px solid var(--primary-gold);
            color: var(--primary-gold) !important;
        }
        .scrollbar-hide::-webkit-scrollbar {
            display: none;
        }
        .scrollbar-hide {
            -ms-overflow-style: none;
            scrollbar-width: none;
        }
    </style>
</head>
<body class="text-stone-gray antialiased min-h-screen flex">
<aside class="w-[240px] bg-[var(--sidebar-onyx)] border-r border-[var(--border-muted)] flex flex-col fixed h-full z-20">
<div class="p-6">
<div class="flex items-center gap-3 mb-10">
<div class="w-10 h-10 rounded-full border border-[var(--primary-gold)] flex items-center justify-center">
<span class="material-symbols-outlined text-[var(--primary-gold)]">bakery_dining</span>
</div>
<div>
<h1 class="font-display text-lg text-white leading-tight">The Breakery</h1>
<div class="flex items-center gap-1.5 mt-0.5">
<span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
<span class="text-[9px] uppercase tracking-[0.1em] text-gray-500 font-bold">Back Office Online</span>
</div>
</div>
</div>
<nav class="space-y-8">
<div>
<p class="text-[10px] uppercase tracking-[0.2em] text-gray-600 font-bold mb-4 px-3">Operations</p>
<ul class="space-y-1">
<li><a class="flex items-center gap-3 px-3 py-2 text-sm text-gray-400 hover:text-white transition-colors" href="#"><span class="material-symbols-outlined text-[20px]">dashboard</span> Dashboard</a></li>
<li><a class="flex items-center gap-3 px-3 py-2 text-sm text-gray-400 hover:text-white transition-colors" href="#"><span class="material-symbols-outlined text-[20px]">point_of_sale</span> POS Terminal</a></li>
<li><a class="flex items-center gap-3 px-3 py-2 text-sm text-gray-400 hover:text-white transition-colors" href="#"><span class="material-symbols-outlined text-[20px]">kitchen</span> Kitchen Display</a></li>
</ul>
</div>
<div>
<p class="text-[10px] uppercase tracking-[0.2em] text-gray-600 font-bold mb-4 px-3">Management</p>
<ul class="space-y-1">
<li><a class="flex items-center gap-3 px-3 py-2 text-sm text-gray-400 hover:text-white transition-colors" href="#"><span class="material-symbols-outlined text-[20px]">inventory_2</span> Products</a></li>
<li><a class="flex items-center gap-3 px-3 py-2 text-sm sidebar-active" href="#"><span class="material-symbols-outlined text-[20px]">inventory</span> Stock &amp; Inventory</a></li>
<li><a class="flex items-center gap-3 px-3 py-2 text-sm text-gray-400 hover:text-white transition-colors" href="#"><span class="material-symbols-outlined text-[20px]">history</span> Order History</a></li>
<li><a class="flex items-center gap-3 px-3 py-2 text-sm text-gray-400 hover:text-white transition-colors" href="#"><span class="material-symbols-outlined text-[20px]">storefront</span> B2B Wholesale</a></li>
</ul>
</div>
</nav>
</div>
<div class="mt-auto p-4 border-t border-[var(--border-muted)] bg-[var(--deep-onyx)]">
<div class="flex items-center justify-between p-2 rounded-lg bg-[var(--sidebar-onyx)]">
<div class="flex items-center gap-3">
<div class="w-8 h-8 rounded bg-[var(--primary-gold)] flex items-center justify-center text-xs font-bold text-black">M</div>
<div>
<p class="text-xs font-semibold text-white">mamat</p>
<p class="text-[10px] text-gray-500 uppercase tracking-tighter">Administrator</p>
</div>
</div>
<span class="material-symbols-outlined text-gray-500 hover:text-white cursor-pointer text-lg">logout</span>
</div>
</div>
</aside>
<main class="flex-1 ml-[240px] flex flex-col min-h-screen bg-[var(--deep-onyx)]">
<header class="px-10 py-8 border-b border-[var(--border-muted)] sticky top-0 bg-[var(--deep-onyx)] z-10">
<div class="flex flex-col md:flex-row md:items-end justify-between gap-6">
<div>
<h2 class="font-display text-4xl text-white mb-2">Stock &amp; Inventory</h2>
<p class="text-gray-500 text-sm tracking-wide">Enterprise-grade inventory tracking and reconciliation system.</p>
</div>
<button class="bg-[var(--primary-gold)] hover:brightness-110 text-black font-bold py-3 px-8 rounded shadow-lg transition-all flex items-center gap-2 uppercase text-[11px] tracking-[0.15em]">
<span class="material-symbols-outlined text-[18px]">add</span> New Inventory
                </button>
</div>
<nav class="flex gap-10 mt-10 overflow-x-auto whitespace-nowrap scrollbar-hide border-b border-[var(--border-muted)]">
<a class="pb-4 text-[13px] font-medium text-gray-500 hover:text-white transition-colors flex items-center gap-2" href="#">
<span class="material-symbols-outlined text-[18px]">package_2</span> Stock
                </a>
<a class="pb-4 text-[13px] font-medium text-gray-500 hover:text-white transition-colors flex items-center gap-2" href="#">
<span class="material-symbols-outlined text-[18px]">download</span> Incoming
                </a>
<a class="pb-4 text-[13px] font-medium text-gray-500 hover:text-white transition-colors flex items-center gap-2" href="#">
<span class="material-symbols-outlined text-[18px]">swap_horiz</span> Transfers
                </a>
<a class="pb-4 text-[13px] font-medium text-gray-500 hover:text-white transition-colors flex items-center gap-2" href="#">
<span class="material-symbols-outlined text-[18px]">delete_outline</span> Wastage
                </a>
<a class="pb-4 text-[13px] font-medium text-gray-500 hover:text-white transition-colors flex items-center gap-2" href="#">
<span class="material-symbols-outlined text-[18px]">precision_manufacturing</span> Production
                </a>
<a class="pb-4 text-[13px] font-medium text-[var(--primary-gold)] border-b-2 border-[var(--primary-gold)] flex items-center gap-2" href="#">
<span class="material-symbols-outlined text-[18px]">checklist</span> Opname
                </a>
<a class="pb-4 text-[13px] font-medium text-gray-500 hover:text-white transition-colors flex items-center gap-2" href="#">
<span class="material-symbols-outlined text-[18px]">sync_alt</span> Movements
                </a>
</nav>
</header>
<section class="flex-1 p-10 overflow-y-auto">
<div class="max-w-full">
<div class="mb-8">
<h3 class="font-display text-2xl text-white">Physical Inventory Log</h3>
<p class="text-sm text-gray-500 mt-1">Reviewing current reconcile cycles and reconciliation history</p>
</div>
<div class="bg-[var(--sidebar-onyx)] border border-[var(--border-muted)] rounded shadow-2xl overflow-hidden">
<table class="w-full text-left border-collapse">
<thead>
<tr class="bg-[var(--deep-onyx)] border-b border-[var(--border-muted)]">
<th class="px-8 py-5 text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em]">Number</th>
<th class="px-8 py-5 text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em]">Section</th>
<th class="px-8 py-5 text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em]">Date</th>
<th class="px-8 py-5 text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em]">Status</th>
<th class="px-8 py-5 text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em]">Notes</th>
<th class="px-8 py-5 text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em] text-right">Action</th>
</tr>
</thead>
<tbody class="divide-y divide-[var(--border-muted)]">
<tr class="hover:bg-[var(--deep-onyx)] transition-colors group">
<td class="px-8 py-6 font-mono text-xs text-gray-300">INV-1770550104329</td>
<td class="px-8 py-6">
<span class="px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-widest bg-blue-950/30 text-blue-400 border border-blue-900/50">PASTRY</span>
</td>
<td class="px-8 py-6 text-sm text-gray-400">Feb 08, 2026</td>
<td class="px-8 py-6">
<span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold bg-gray-900 text-gray-400 border border-gray-800">
<span class="w-1.5 h-1.5 rounded-full bg-gray-500"></span> DRAFT
                                    </span>
</td>
<td class="px-8 py-6 text-sm italic text-gray-600">Periodic month-end count...</td>
<td class="px-8 py-6 text-right">
<button class="inline-flex items-center gap-2 px-5 py-2 text-[11px] font-bold uppercase tracking-widest text-[var(--primary-gold)] border border-[var(--primary-gold)] rounded hover:bg-[var(--primary-gold)] hover:text-black transition-all">
                                        Continue <span class="material-symbols-outlined text-[16px]">arrow_forward</span>
</button>
</td>
</tr>
<tr class="hover:bg-[var(--deep-onyx)] transition-colors group">
<td class="px-8 py-6 font-mono text-xs text-gray-300">INV-1770545057426</td>
<td class="px-8 py-6 text-sm text-gray-600">—</td>
<td class="px-8 py-6 text-sm text-gray-400">Feb 08, 2026</td>
<td class="px-8 py-6">
<span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold bg-gray-900 text-gray-400 border border-gray-800">
<span class="w-1.5 h-1.5 rounded-full bg-gray-500"></span> DRAFT
                                    </span>
</td>
<td class="px-8 py-6 text-sm italic text-gray-600">Initial count for store opening</td>
<td class="px-8 py-6 text-right">
<button class="inline-flex items-center gap-2 px-5 py-2 text-[11px] font-bold uppercase tracking-widest text-[var(--primary-gold)] border border-[var(--primary-gold)] rounded hover:bg-[var(--primary-gold)] hover:text-black transition-all">
                                        Continue <span class="material-symbols-outlined text-[16px]">arrow_forward</span>
</button>
</td>
</tr>
<tr class="hover:bg-[var(--deep-onyx)] transition-colors group">
<td class="px-8 py-6 font-mono text-xs text-gray-300">INV-1770265270839</td>
<td class="px-8 py-6 text-sm text-gray-600">—</td>
<td class="px-8 py-6 text-sm text-gray-400">Feb 05, 2026</td>
<td class="px-8 py-6">
<span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold bg-gray-900 text-gray-400 border border-gray-800">
<span class="w-1.5 h-1.5 rounded-full bg-gray-500"></span> DRAFT
                                    </span>
</td>
<td class="px-8 py-6 text-sm italic text-gray-600">Weekly reconciliation</td>
<td class="px-8 py-6 text-right">
<button class="inline-flex items-center gap-2 px-5 py-2 text-[11px] font-bold uppercase tracking-widest text-[var(--primary-gold)] border border-[var(--primary-gold)] rounded hover:bg-[var(--primary-gold)] hover:text-black transition-all">
                                        Continue <span class="material-symbols-outlined text-[16px]">arrow_forward</span>
</button>
</td>
</tr>
</tbody>
</table>
<div class="px-8 py-6 bg-[var(--deep-onyx)] border-t border-[var(--border-muted)] flex items-center justify-between">
<p class="text-[10px] text-gray-600 uppercase tracking-widest font-bold">Showing 3 active entries</p>
<div class="flex gap-4">
<button class="w-8 h-8 rounded border border-[var(--border-muted)] text-gray-600 flex items-center justify-center cursor-not-allowed">
<span class="material-symbols-outlined text-sm">chevron_left</span>
</button>
<button class="w-8 h-8 rounded border border-[var(--border-muted)] text-gray-600 flex items-center justify-center cursor-not-allowed">
<span class="material-symbols-outlined text-sm">chevron_right</span>
</button>
</div>
</div>
</div>
<div class="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
<div class="bg-[var(--sidebar-onyx)] p-8 rounded border border-[var(--border-muted)] shadow-xl relative overflow-hidden group">
<div class="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
<span class="material-symbols-outlined text-6xl">inventory</span>
</div>
<p class="text-[10px] uppercase font-bold tracking-[0.2em] text-gray-500 mb-3">Total Counts This Month</p>
<h4 class="text-4xl font-display text-white">12</h4>
<div class="mt-4 flex items-center gap-1.5 text-xs text-emerald-500 font-medium">
<span class="material-symbols-outlined text-base">trending_up</span> +2 from last cycle
                        </div>
</div>
<div class="bg-[var(--sidebar-onyx)] p-8 rounded border border-[var(--border-muted)] shadow-xl relative overflow-hidden group">
<div class="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
<span class="material-symbols-outlined text-6xl">pending_actions</span>
</div>
<p class="text-[10px] uppercase font-bold tracking-[0.2em] text-gray-500 mb-3">Active Drafts</p>
<h4 class="text-4xl font-display text-white">3</h4>
<div class="mt-4 flex items-center gap-1.5 text-xs text-amber-500 font-medium">
<span class="material-symbols-outlined text-base">warning</span> Requires finalization
                        </div>
</div>
<div class="bg-[var(--sidebar-onyx)] p-8 rounded border border-[var(--border-muted)] shadow-xl relative overflow-hidden group">
<div class="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
<span class="material-symbols-outlined text-6xl">sync</span>
</div>
<p class="text-[10px] uppercase font-bold tracking-[0.2em] text-gray-500 mb-3">Last Sync</p>
<h4 class="text-4xl font-display text-white">Today</h4>
<div class="mt-4 flex items-center gap-1.5 text-xs text-blue-400 font-medium">
<span class="material-symbols-outlined text-base">sync</span> 08:24 PM
                        </div>
</div>
</div>
</div>
</section>
</main>

</body></html>
      <!-- STITCH_HTML_END -->
    ` }} />
  );
};

export default Physical_Inventory_Log;
