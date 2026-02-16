import React from 'react';

const Stock_Opname_Form: React.FC = () => {
  return (
    <div dangerouslySetInnerHTML={{ __html: `
      <!-- STITCH_HTML_START -->
      <!DOCTYPE html>

<html class="dark" lang="en"><head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
<title>The Breakery - Physical Stocktake (Opname)</title>
<script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&amp;family=Playfair+Display:wght@600;700&amp;family=JetBrains+Mono:wght@400;500&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<script id="tailwind-config">
        tailwind.config = {
            darkMode: "class",
            theme: {
                extend: {
                    colors: {
                        "primary": "#d3ae64",
                        "background-light": "#f8f7f6",
                        "background-dark": "#0D0D0F",
                        "panel-dark": "#1A1A1D",
                        "danger": "#F87171",
                    },
                    fontFamily: {
                        "display": ["Inter", "sans-serif"],
                        "serif": ["Playfair Display", "serif"],
                        "mono": ["JetBrains Mono", "monospace"],
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
        .font-mono {
            font-family: 'JetBrains Mono', monospace;
        }
        .font-serif {
            font-family: 'Playfair Display', serif;
        }
        /* Custom scrollbar for data-heavy table */
        ::-webkit-scrollbar {
            width: 8px;
            height: 8px;
        }
        ::-webkit-scrollbar-track {
            background: #0D0D0F;
        }
        ::-webkit-scrollbar-thumb {
            background: #333;
            border-radius: 4px;
        }
        ::-webkit-scrollbar-thumb:hover {
            background: #d3ae64;
        }
    </style>
</head>
<body class="bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 min-h-screen flex flex-col overflow-hidden">
<!-- Header Section -->
<header class="h-20 border-b border-primary/20 bg-background-light dark:bg-background-dark flex items-center justify-between px-8 shrink-0">
<div class="flex items-center gap-6">
<div class="flex items-center gap-3">
<div class="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
<span class="material-icons text-background-dark">inventory_2</span>
</div>
<h1 class="text-2xl font-serif dark:text-white">Physical Stocktake (Opname) <span class="text-primary/60 ml-2 text-lg font-display font-light">#2026-02-15</span></h1>
</div>
<div class="h-6 w-[1px] bg-primary/20"></div>
<div class="flex items-center text-sm text-slate-400">
<span class="material-icons text-sm mr-2">location_on</span>
                Main Bakery Hub - Floor A
            </div>
</div>
<div class="flex items-center gap-4">
<div class="flex items-center gap-2 bg-primary/10 px-3 py-1.5 rounded text-primary text-sm font-medium border border-primary/20">
<span class="relative flex h-2 w-2">
<span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
<span class="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
</span>
                Live Session Active
            </div>
<button class="p-2 hover:bg-white/5 rounded-full transition-colors">
<span class="material-icons">settings</span>
</button>
</div>
</header>
<!-- Main Content Area -->
<main class="flex-1 flex overflow-hidden">
<!-- Center Table Section -->
<section class="flex-1 overflow-auto p-8">
<div class="mb-6 flex justify-between items-end">
<div>
<h2 class="text-lg font-semibold text-white/90">Entry Table</h2>
<p class="text-sm text-slate-500">Record physical counts for all items in the current inventory batch.</p>
</div>
<div class="flex gap-4">
<div class="relative">
<span class="material-icons absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm">search</span>
<input class="bg-panel-dark border border-white/10 rounded-lg pl-10 pr-4 py-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all w-64" placeholder="Filter by SKU or Product..." type="text"/>
</div>
</div>
</div>
<div class="rounded-xl border border-white/5 bg-panel-dark overflow-hidden">
<table class="w-full text-left border-collapse">
<thead>
<tr class="border-b border-white/5 bg-white/[0.02]">
<th class="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-400">SKU</th>
<th class="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-400">Product Name</th>
<th class="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-400 text-right">System Stock</th>
<th class="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-400 text-center w-40">Physical Count</th>
<th class="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-400 text-right">Discrepancy</th>
<th class="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-400">Reason Code</th>
</tr>
</thead>
<tbody class="divide-y divide-white/5">
<!-- Row 1 -->
<tr class="hover:bg-white/[0.02] transition-colors group">
<td class="px-6 py-4 font-mono text-sm text-primary/80">BK-SR-001</td>
<td class="px-6 py-4 font-medium text-white/90">Sourdough Classic Large</td>
<td class="px-6 py-4 text-right font-mono">45.000</td>
<td class="px-6 py-4">
<input class="w-full bg-background-dark border-2 border-primary/40 rounded py-1.5 px-3 text-center font-mono focus:border-primary focus:ring-0 outline-none transition-all text-primary shadow-[0_0_10px_rgba(211,174,100,0.1)]" type="number" value="40.000"/>
</td>
<td class="px-6 py-4 text-right font-mono text-danger font-medium">-5.000</td>
<td class="px-6 py-4">
<select class="bg-background-dark border border-white/10 rounded px-2 py-1.5 text-sm w-full focus:border-primary outline-none">
<option>Waste</option>
<option>Theft</option>
<option>Error</option>
<option>Damage</option>
</select>
</td>
</tr>
<!-- Row 2 -->
<tr class="hover:bg-white/[0.02] transition-colors group">
<td class="px-6 py-4 font-mono text-sm text-primary/80">BK-CR-042</td>
<td class="px-6 py-4 font-medium text-white/90">Butter Croissant (Frozen)</td>
<td class="px-6 py-4 text-right font-mono">120.000</td>
<td class="px-6 py-4">
<input class="w-full bg-background-dark border border-white/10 rounded py-1.5 px-3 text-center font-mono focus:border-primary focus:ring-0 outline-none transition-all text-white/70" type="number" value="120.000"/>
</td>
<td class="px-6 py-4 text-right font-mono text-slate-500">0.000</td>
<td class="px-6 py-4">
<select class="bg-background-dark border border-white/10 rounded px-2 py-1.5 text-sm w-full focus:border-primary outline-none text-slate-500">
<option>None</option>
<option>Waste</option>
<option>Theft</option>
</select>
</td>
</tr>
<!-- Row 3 -->
<tr class="hover:bg-white/[0.02] transition-colors group">
<td class="px-6 py-4 font-mono text-sm text-primary/80">BK-FL-088</td>
<td class="px-6 py-4 font-medium text-white/90">Premium Rye Flour</td>
<td class="px-6 py-4 text-right font-mono">25.500</td>
<td class="px-6 py-4">
<input class="w-full bg-background-dark border-2 border-primary/40 rounded py-1.5 px-3 text-center font-mono focus:border-primary focus:ring-0 outline-none transition-all text-primary" type="number" value="23.250"/>
</td>
<td class="px-6 py-4 text-right font-mono text-danger font-medium">-2.250</td>
<td class="px-6 py-4">
<select class="bg-background-dark border border-white/10 rounded px-2 py-1.5 text-sm w-full focus:border-primary outline-none">
<option selected="">Error</option>
<option>Waste</option>
<option>Theft</option>
</select>
</td>
</tr>
<!-- Row 4 -->
<tr class="hover:bg-white/[0.02] transition-colors group">
<td class="px-6 py-4 font-mono text-sm text-primary/80">BK-CH-112</td>
<td class="px-6 py-4 font-medium text-white/90">Chocolate Chips 70%</td>
<td class="px-6 py-4 text-right font-mono">12.000</td>
<td class="px-6 py-4">
<input class="w-full bg-background-dark border border-white/10 rounded py-1.5 px-3 text-center font-mono focus:border-primary focus:ring-0 outline-none transition-all text-white/70" type="number" value="12.000"/>
</td>
<td class="px-6 py-4 text-right font-mono text-slate-500">0.000</td>
<td class="px-6 py-4">
<select class="bg-background-dark border border-white/10 rounded px-2 py-1.5 text-sm w-full focus:border-primary outline-none text-slate-500">
<option>None</option>
<option>Waste</option>
</select>
</td>
</tr>
<!-- Row 5 -->
<tr class="hover:bg-white/[0.02] transition-colors group">
<td class="px-6 py-4 font-mono text-sm text-primary/80">BK-EG-201</td>
<td class="px-6 py-4 font-medium text-white/90">Organic Pasture Eggs</td>
<td class="px-6 py-4 text-right font-mono">500.000</td>
<td class="px-6 py-4">
<input class="w-full bg-background-dark border-2 border-primary/40 rounded py-1.5 px-3 text-center font-mono focus:border-primary focus:ring-0 outline-none transition-all text-primary" type="number" value="488.000"/>
</td>
<td class="px-6 py-4 text-right font-mono text-danger font-medium">-12.000</td>
<td class="px-6 py-4">
<select class="bg-background-dark border border-white/10 rounded px-2 py-1.5 text-sm w-full focus:border-primary outline-none">
<option>Waste</option>
<option>Theft</option>
<option selected="">Damage</option>
</select>
</td>
</tr>
</tbody>
</table>
<div class="p-6 border-t border-white/5 bg-white/[0.01] flex items-center justify-between text-sm text-slate-500">
<p>Showing 5 of 142 items</p>
<div class="flex gap-2">
<button class="px-3 py-1 bg-white/5 rounded border border-white/10 hover:bg-white/10">Previous</button>
<button class="px-3 py-1 bg-white/5 rounded border border-white/10 hover:bg-white/10">Next</button>
</div>
</div>
</div>
</section>
<!-- Sidebar Summary Section -->
<aside class="w-[400px] border-l border-primary/20 bg-panel-dark p-8 flex flex-col gap-8 shrink-0">
<div>
<h3 class="text-xs font-bold uppercase tracking-widest text-primary mb-4">Discrepancy Summary</h3>
<div class="bg-background-dark rounded-xl p-5 border border-white/5 space-y-4">
<div>
<p class="text-slate-400 text-xs mb-1">Total Items Counted</p>
<p class="text-2xl font-mono text-white">42 <span class="text-sm text-slate-600">/ 142</span></p>
</div>
<div class="h-[1px] bg-white/5"></div>
<div>
<p class="text-slate-400 text-xs mb-1">Total Inventory Value Change</p>
<p class="text-2xl font-mono text-danger">-Rp 250.000</p>
<p class="text-[10px] text-danger/60 mt-1 flex items-center">
<span class="material-icons text-[12px] mr-1">trending_down</span>
                            -4.2% against system value
                        </p>
</div>
</div>
</div>
<div class="flex-1">
<h3 class="text-xs font-bold uppercase tracking-widest text-primary mb-4">High-Discrepancy Items</h3>
<div class="space-y-3 overflow-y-auto max-h-[400px] pr-2">
<!-- High Discrepancy Card 1 -->
<div class="bg-danger/5 border border-danger/20 p-4 rounded-lg">
<div class="flex justify-between items-start mb-2">
<span class="text-sm font-medium text-white/90">Sourdough Classic</span>
<span class="text-xs font-mono text-danger">-5.000</span>
</div>
<div class="flex justify-between items-end">
<span class="text-[10px] text-slate-500 font-mono">Val. Loss: -Rp 125,000</span>
<button class="text-[10px] uppercase font-bold text-primary hover:underline">Review</button>
</div>
</div>
<!-- High Discrepancy Card 2 -->
<div class="bg-danger/5 border border-danger/20 p-4 rounded-lg">
<div class="flex justify-between items-start mb-2">
<span class="text-sm font-medium text-white/90">Pasture Eggs</span>
<span class="text-xs font-mono text-danger">-12.000</span>
</div>
<div class="flex justify-between items-end">
<span class="text-[10px] text-slate-500 font-mono">Val. Loss: -Rp 48,000</span>
<button class="text-[10px] uppercase font-bold text-primary hover:underline">Review</button>
</div>
</div>
<!-- High Discrepancy Card 3 -->
<div class="bg-danger/5 border border-danger/20 p-4 rounded-lg">
<div class="flex justify-between items-start mb-2">
<span class="text-sm font-medium text-white/90">Rye Flour</span>
<span class="text-xs font-mono text-danger">-2.250</span>
</div>
<div class="flex justify-between items-end">
<span class="text-[10px] text-slate-500 font-mono">Val. Loss: -Rp 77,000</span>
<button class="text-[10px] uppercase font-bold text-primary hover:underline">Review</button>
</div>
</div>
</div>
</div>
<div class="bg-primary/5 rounded-lg p-4 border border-primary/10">
<div class="flex items-center gap-3">
<span class="material-icons text-primary">info</span>
<p class="text-xs text-slate-400 leading-relaxed">System stock values are locked during the opname session to prevent conflicts.</p>
</div>
</div>
</aside>
</main>
<!-- Footer Action Bar -->
<footer class="h-20 bg-panel-dark border-t border-primary/20 px-8 flex items-center justify-between shrink-0">
<div class="flex items-center gap-6">
<button class="text-slate-400 hover:text-white transition-colors flex items-center text-sm font-medium">
<span class="material-icons text-lg mr-2">pause_circle</span>
                Pause Session
            </button>
<div class="h-4 w-[1px] bg-white/10"></div>
<p class="text-xs text-slate-500 italic">Last auto-saved at 14:22:45</p>
</div>
<div class="flex items-center gap-4">
<button class="flex items-center px-5 py-2.5 rounded-lg border border-primary/40 text-primary font-medium hover:bg-primary/10 transition-all text-sm">
<span class="material-icons text-lg mr-2">ios_share</span>
                Export Count Sheet
            </button>
<button class="flex items-center px-8 py-2.5 rounded-lg bg-primary text-background-dark font-bold hover:bg-primary/90 transition-all text-sm shadow-[0_4px_14px_0_rgba(211,174,100,0.3)]">
<span class="material-icons text-lg mr-2">check_circle</span>
                Finalize &amp; Reconcile
            </button>
</div>
</footer>
</body></html>
      <!-- STITCH_HTML_END -->
    ` }} />
  );
};

export default Stock_Opname_Form;
