import React from 'react';

const Stock_Opname_Count: React.FC = () => {
  return (
    <div dangerouslySetInnerHTML={{ __html: `
      <!-- STITCH_HTML_START -->
      <!DOCTYPE html>

<html class="dark" lang="en"><head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
<title>The Breakery - Physical Inventory Count</title>
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
                        "surface-dark": "#161618",
                        "border-dark": "#2a2a2d",
                    },
                    fontFamily: {
                        "display": ["Manrope"],
                        "serif": ["Playfair Display"],
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
            -webkit-font-smoothing: antialiased;
        }
        .serif-font {
            font-family: 'Playfair Display', serif;
        }
        .custom-scrollbar::-webkit-scrollbar {
            width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
            background: #0D0D0F;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
            background: #2a2a2d;
            border-radius: 10px;
        }
    </style>
</head>
<body class="bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 min-h-screen">
<!-- Main Navigation / Sidebar Simulation -->
<div class="flex h-screen overflow-hidden">
<!-- Sidebar -->
<aside class="w-64 border-r border-border-dark hidden lg:flex flex-col bg-surface-dark/50">
<div class="p-6 border-b border-border-dark flex items-center gap-3">
<div class="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
<span class="material-icons text-background-dark text-lg">bakery_dining</span>
</div>
<h1 class="serif-font text-xl font-bold tracking-tight">The Breakery</h1>
</div>
<nav class="flex-1 p-4 space-y-2 overflow-y-auto custom-scrollbar">
<a class="flex items-center gap-3 p-3 rounded-lg hover:bg-white/5 transition-colors" href="#">
<span class="material-icons text-slate-400">dashboard</span>
<span class="font-medium">Dashboard</span>
</a>
<a class="flex items-center gap-3 p-3 rounded-lg bg-primary/10 text-primary transition-colors border border-primary/20" href="#">
<span class="material-icons">inventory_2</span>
<span class="font-medium">Inventory Count</span>
</a>
<a class="flex items-center gap-3 p-3 rounded-lg hover:bg-white/5 transition-colors text-slate-400" href="#">
<span class="material-icons">receipt_long</span>
<span class="font-medium">Purchase Orders</span>
</a>
<a class="flex items-center gap-3 p-3 rounded-lg hover:bg-white/5 transition-colors text-slate-400" href="#">
<span class="material-icons">assessment</span>
<span class="font-medium">Analytics</span>
</a>
</nav>
<div class="p-4 border-t border-border-dark">
<div class="flex items-center gap-3 p-2">
<img alt="Avatar" class="w-10 h-10 rounded-full" data-alt="Manager profile photo" src="https://lh3.googleusercontent.com/aida-public/AB6AXuD1fLIo6xsiB75-uoqh2af1N4ZCtV26zYc2aMZbBFpnbLvgl_oC23SLo8x8qoKhjeKzHUY6BgSOHiIq_4VGHfhFMHFnS0NhzscqkU00rd9SV7NvPveydarnuDJH8MiMcbzH5voyRU_PFIB1wlNOQeqm462up1gV60nrSqC4bvSoxJPmjhpT245y-0Opz_CG_iUr-Iz7MbVuEiX7lLC_PcQ4f_37hRJcjka0Te9eaFY2egk_JlwpCoAhXDsVW1FH5ZAH7giA1_dzoG0O"/>
<div>
<p class="text-sm font-semibold">Julian Baker</p>
<p class="text-xs text-slate-500">Inventory Manager</p>
</div>
</div>
</div>
</aside>
<!-- Main Content Area -->
<main class="flex-1 flex flex-col h-full overflow-hidden relative">
<!-- Header Section -->
<header class="h-20 border-b border-border-dark flex items-center justify-between px-8 bg-background-dark/80 backdrop-blur-md z-10 shrink-0">
<div class="flex items-center gap-4">
<span class="material-icons text-primary text-3xl">assignment_turned_in</span>
<div>
<h2 class="serif-font text-2xl font-bold">Physical Inventory Count</h2>
<p class="text-xs text-slate-500 uppercase tracking-widest font-bold">Session ID: OP-2026-013</p>
</div>
</div>
<div class="flex items-center gap-3">
<button class="px-4 py-2 text-sm font-semibold border border-border-dark rounded-lg hover:bg-white/5 transition-colors">
                        Save Draft
                    </button>
<button class="px-4 py-2 text-sm font-semibold bg-primary text-background-dark rounded-lg hover:brightness-110 transition-all flex items-center gap-2">
<span class="material-icons text-sm">publish</span>
                        Finalize Session
                    </button>
</div>
</header>
<!-- Scrollable Content -->
<div class="flex-1 overflow-y-auto custom-scrollbar p-8 pb-32">
<div class="max-w-7xl mx-auto space-y-8">
<!-- Top Section: Session History (Minimized) -->
<section>
<div class="flex items-center justify-between mb-4">
<h3 class="text-sm font-bold uppercase tracking-wider text-slate-400">Recent Sessions</h3>
<button class="text-xs text-primary hover:underline">View All History</button>
</div>
<div class="grid grid-cols-1 md:grid-cols-3 gap-4">
<div class="bg-surface-dark p-4 rounded-xl border border-border-dark flex justify-between items-center">
<div>
<p class="text-xs text-slate-500">Yesterday, 14:20</p>
<p class="font-semibold">OP-2026-012</p>
</div>
<span class="px-2 py-1 rounded bg-green-500/10 text-green-500 text-[10px] font-bold uppercase">Completed</span>
</div>
<div class="bg-surface-dark p-4 rounded-xl border border-primary/20 bg-primary/5 flex justify-between items-center">
<div>
<p class="text-xs text-slate-500">Current Session</p>
<p class="font-semibold text-primary">OP-2026-013</p>
</div>
<span class="px-2 py-1 rounded bg-primary text-background-dark text-[10px] font-bold uppercase">Active</span>
</div>
<div class="bg-surface-dark p-4 rounded-xl border border-border-dark flex justify-between items-center">
<div>
<p class="text-xs text-slate-500">2 days ago</p>
<p class="font-semibold">OP-2026-011</p>
</div>
<span class="px-2 py-1 rounded bg-slate-500/10 text-slate-400 text-[10px] font-bold uppercase">Completed</span>
</div>
</div>
</section>
<!-- Active Count Workspace -->
<section class="space-y-6">
<!-- Filters -->
<div class="flex items-center gap-2 overflow-x-auto pb-2 custom-scrollbar">
<button class="px-5 py-2 bg-primary text-background-dark rounded-full text-sm font-bold whitespace-nowrap">All Items</button>
<button class="px-5 py-2 bg-surface-dark border border-border-dark hover:border-slate-600 rounded-full text-sm font-medium whitespace-nowrap transition-colors">Raw Materials</button>
<button class="px-5 py-2 bg-surface-dark border border-border-dark hover:border-slate-600 rounded-full text-sm font-medium whitespace-nowrap transition-colors">Finished Goods</button>
<button class="px-5 py-2 bg-surface-dark border border-border-dark hover:border-slate-600 rounded-full text-sm font-medium whitespace-nowrap transition-colors">Packaging</button>
<button class="px-5 py-2 bg-surface-dark border border-border-dark hover:border-slate-600 rounded-full text-sm font-medium whitespace-nowrap transition-colors">Cleaning Supplies</button>
</div>
<!-- Count Table -->
<div class="bg-surface-dark rounded-xl border border-border-dark overflow-hidden">
<table class="w-full text-left border-collapse">
<thead class="bg-background-dark/50 border-b border-border-dark">
<tr>
<th class="px-6 py-4 text-xs font-bold uppercase tracking-widest text-slate-500">Product Details</th>
<th class="px-6 py-4 text-xs font-bold uppercase tracking-widest text-slate-500 text-center">System Stock</th>
<th class="px-6 py-4 text-xs font-bold uppercase tracking-widest text-slate-500 text-center w-48">Physical Count</th>
<th class="px-6 py-4 text-xs font-bold uppercase tracking-widest text-slate-500 text-right">Variance</th>
</tr>
</thead>
<tbody class="divide-y divide-border-dark">
<!-- Row 1 -->
<tr class="hover:bg-white/[0.02] transition-colors group">
<td class="px-6 py-5">
<div class="flex items-center gap-4">
<div class="w-10 h-10 rounded bg-background-dark flex items-center justify-center text-primary border border-border-dark">
<span class="material-icons text-xl">grain</span>
</div>
<div>
<p class="font-bold text-lg">Bread Flour</p>
<p class="text-xs text-slate-500">SKU: RAW-FLR-001</p>
</div>
</div>
</td>
<td class="px-6 py-5 text-center">
<span class="text-xl font-display text-slate-400">10.0 kg</span>
</td>
<td class="px-6 py-5">
<div class="relative">
<input class="w-full bg-background-dark border border-border-dark group-hover:border-slate-500 focus:border-primary focus:ring-1 focus:ring-primary rounded-lg text-center font-bold text-lg py-3 transition-all outline-none" step="0.1" type="number" value="10.0"/>
</div>
</td>
<td class="px-6 py-5 text-right">
<div class="flex items-center justify-end gap-2 text-green-500">
<span class="material-icons text-sm">check_circle</span>
<span class="text-lg font-bold">0.0 kg</span>
</div>
</td>
</tr>
<!-- Row 2 -->
<tr class="hover:bg-white/[0.02] transition-colors group">
<td class="px-6 py-5">
<div class="flex items-center gap-4">
<div class="w-10 h-10 rounded bg-background-dark flex items-center justify-center text-primary border border-border-dark">
<span class="material-icons text-xl">opacity</span>
</div>
<div>
<p class="font-bold text-lg">Unsalted Butter</p>
<p class="text-xs text-slate-500">SKU: RAW-BTR-004</p>
</div>
</div>
</td>
<td class="px-6 py-5 text-center">
<span class="text-xl font-display text-slate-400">5.0 kg</span>
</td>
<td class="px-6 py-5">
<div class="relative">
<input class="w-full bg-background-dark border-2 border-red-500/50 focus:border-red-500 focus:ring-0 rounded-lg text-center font-bold text-lg py-3 transition-all outline-none" step="0.1" type="number" value="4.5"/>
</div>
</td>
<td class="px-6 py-5 text-right">
<div class="flex items-center justify-end gap-2 text-red-500">
<span class="material-icons text-sm">warning</span>
<span class="text-lg font-bold">-0.5 kg</span>
</div>
</td>
</tr>
<!-- Row 3 -->
<tr class="hover:bg-white/[0.02] transition-colors group">
<td class="px-6 py-5">
<div class="flex items-center gap-4">
<div class="w-10 h-10 rounded bg-background-dark flex items-center justify-center text-primary border border-border-dark">
<span class="material-icons text-xl">egg</span>
</div>
<div>
<p class="font-bold text-lg">Fresh Farm Eggs</p>
<p class="text-xs text-slate-500">SKU: RAW-EGG-012</p>
</div>
</div>
</td>
<td class="px-6 py-5 text-center">
<span class="text-xl font-display text-slate-400">48 pcs</span>
</td>
<td class="px-6 py-5">
<div class="relative">
<input class="w-full bg-background-dark border border-border-dark group-hover:border-slate-500 focus:border-primary focus:ring-1 focus:ring-primary rounded-lg text-center font-bold text-lg py-3 transition-all outline-none" type="number" value="48"/>
</div>
</td>
<td class="px-6 py-5 text-right">
<div class="flex items-center justify-end gap-2 text-green-500">
<span class="material-icons text-sm">check_circle</span>
<span class="text-lg font-bold">0</span>
</div>
</td>
</tr>
<!-- Row 4 -->
<tr class="hover:bg-white/[0.02] transition-colors group">
<td class="px-6 py-5">
<div class="flex items-center gap-4">
<div class="w-10 h-10 rounded bg-background-dark flex items-center justify-center text-primary border border-border-dark">
<span class="material-icons text-xl">cake</span>
</div>
<div>
<p class="font-bold text-lg">Sugar Cane Powder</p>
<p class="text-xs text-slate-500">SKU: RAW-SGR-002</p>
</div>
</div>
</td>
<td class="px-6 py-5 text-center">
<span class="text-xl font-display text-slate-400">20.0 kg</span>
</td>
<td class="px-6 py-5">
<div class="relative">
<input class="w-full bg-background-dark border-2 border-red-500/50 focus:border-red-500 focus:ring-0 rounded-lg text-center font-bold text-lg py-3 transition-all outline-none" step="0.1" type="number" value="18.2"/>
</div>
</td>
<td class="px-6 py-5 text-right">
<div class="flex items-center justify-end gap-2 text-red-500">
<span class="material-icons text-sm">warning</span>
<span class="text-lg font-bold">-1.8 kg</span>
</div>
</td>
</tr>
</tbody>
</table>
</div>
</section>
</div>
</div>
<!-- Sticky Bottom Review Panel -->
<footer class="absolute bottom-0 left-0 right-0 p-6 bg-background-dark border-t border-border-dark/80 shadow-[0_-20px_50px_rgba(0,0,0,0.5)] z-20">
<div class="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
<div class="flex items-center gap-8">
<div class="flex items-center gap-3">
<div class="w-12 h-12 bg-red-500/10 rounded-full flex items-center justify-center text-red-500 border border-red-500/20">
<span class="material-icons">priority_high</span>
</div>
<div>
<p class="text-xl font-bold">3 Discrepancies</p>
<p class="text-xs text-slate-500 uppercase font-bold tracking-tight">Requires Adjustment</p>
</div>
</div>
<div class="h-10 w-px bg-border-dark hidden md:block"></div>
<div>
<p class="text-xs text-slate-500 uppercase font-bold tracking-tight mb-1">Adjustment Value</p>
<p class="text-2xl font-display font-extrabold text-red-400">-Rp 80.000</p>
</div>
</div>
<div class="flex flex-col items-end gap-2">
<div class="flex items-center gap-4">
<div class="flex items-center gap-2 text-slate-500 mr-4">
<span class="material-icons text-sm">lock</span>
<span class="text-xs font-semibold">Manager PIN Required</span>
</div>
<button class="px-10 py-4 bg-primary text-background-dark text-lg font-black rounded-xl hover:scale-[1.02] active:scale-[0.98] transition-all shadow-[0_0_25px_rgba(242,208,13,0.3)] serif-font">
                                Approve &amp; Adjust Stock
                            </button>
</div>
<p class="text-[10px] text-slate-600">Final adjustments will be logged and synced with Central ERP.</p>
</div>
</div>
</footer>
</main>
</div>
<!-- Background Decoration -->
<div class="fixed top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] pointer-events-none -z-10"></div>
<div class="fixed bottom-0 left-0 w-[300px] h-[300px] bg-primary/3 rounded-full blur-[100px] pointer-events-none -z-10"></div>
</body></html>
      <!-- STITCH_HTML_END -->
    ` }} />
  );
};

export default Stock_Opname_Count;
