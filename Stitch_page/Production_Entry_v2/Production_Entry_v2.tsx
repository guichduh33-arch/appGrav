import React from 'react';

const Production_Entry_v2: React.FC = () => {
  return (
    <div dangerouslySetInnerHTML={{ __html: `
      <!-- STITCH_HTML_START -->
      <!DOCTYPE html>
<html class="dark" lang="en"><head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
<title>The Breakery Enterprise - Production Entry</title>
<script src="https://cdn.tailwindcss.com?plugins=forms,typography,container-queries"></script>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&amp;family=Playfair+Display:wght@600;700&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<style type="text/tailwindcss">
        :root {
            --deep-onyx: #0D0D0F;
            --warm-charcoal: #1A1A1D;
            --artisan-gold: #C9A55C;
            --muted-smoke: #8E8E93;
        }
        @layer base {
            body {
                font-family: 'Inter', sans-serif;
                background-color: var(--deep-onyx);
                color: #FFFFFF;
            }
            .font-serif {
                font-family: 'Playfair Display', serif;
            }
        }
        .sidebar-active {
            color: var(--artisan-gold);
            background: rgba(201, 165, 92, 0.08);
            border-right: 2px solid var(--artisan-gold);
        }
        .tab-active {
            color: var(--artisan-gold);
            border-bottom: 2px solid var(--artisan-gold);
        }
        .custom-scrollbar::-webkit-scrollbar {
            width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
            background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
            background: #2D2D2F;
            border-radius: 10px;
        }
    </style>
</head>
<body class="min-h-screen flex overflow-hidden">
<aside class="w-[240px] flex-shrink-0 border-r border-white/5 bg-[#0D0D0F] flex flex-col h-screen z-20">
<div class="p-6 flex items-center gap-3">
<div class="w-9 h-9 rounded-full border border-[var(--artisan-gold)] flex items-center justify-center">
<span class="text-[var(--artisan-gold)] font-bold text-sm">B</span>
</div>
<div class="flex flex-col">
<h1 class="font-serif text-sm font-bold tracking-tight leading-none">THE BREAKERY</h1>
<span class="text-[9px] uppercase tracking-[0.2em] text-[var(--muted-smoke)] mt-1">Back Office</span>
</div>
</div>
<div class="px-6 mb-6">
<div class="flex items-center gap-2 px-2 py-1 rounded-full bg-emerald-500/5 border border-emerald-500/10 w-fit">
<span class="relative flex h-1.5 w-1.5">
<span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
<span class="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
</span>
<span class="text-emerald-500 text-[10px] font-bold tracking-widest uppercase">Online</span>
</div>
</div>
<nav class="flex-1 px-3 space-y-1 overflow-y-auto custom-scrollbar">
<div class="text-[10px] font-bold text-[var(--muted-smoke)] uppercase tracking-widest px-3 mb-3">Operations</div>
<a class="flex items-center gap-3 px-3 py-2.5 text-sm text-[var(--muted-smoke)] hover:text-white transition-colors group" href="#">
<span class="material-symbols-outlined text-xl group-hover:text-white">dashboard</span>
                Dashboard
            </a>
<a class="flex items-center gap-3 px-3 py-2.5 text-sm text-[var(--muted-smoke)] hover:text-white transition-colors group" href="#">
<span class="material-symbols-outlined text-xl group-hover:text-white">point_of_sale</span>
                POS Terminal
            </a>
<a class="flex items-center gap-3 px-3 py-2.5 text-sm text-[var(--muted-smoke)] hover:text-white transition-colors group" href="#">
<span class="material-symbols-outlined text-xl group-hover:text-white">restaurant</span>
                Kitchen Display
            </a>
<div class="text-[10px] font-bold text-[var(--muted-smoke)] uppercase tracking-widest px-3 mb-3 mt-8">Management</div>
<a class="flex items-center gap-3 px-3 py-2.5 text-sm text-[var(--muted-smoke)] hover:text-white transition-colors group" href="#">
<span class="material-symbols-outlined text-xl group-hover:text-white">inventory_2</span>
                Products
            </a>
<a class="flex items-center gap-3 px-3 py-2.5 text-sm sidebar-active font-medium" href="#">
<span class="material-symbols-outlined text-xl">layers</span>
                Stock &amp; Inventory
            </a>
<a class="flex items-center gap-3 px-3 py-2.5 text-sm text-[var(--muted-smoke)] hover:text-white transition-colors group" href="#">
<span class="material-symbols-outlined text-xl group-hover:text-white">history</span>
                Order History
            </a>
<a class="flex items-center gap-3 px-3 py-2.5 text-sm text-[var(--muted-smoke)] hover:text-white transition-colors group" href="#">
<span class="material-symbols-outlined text-xl group-hover:text-white">business</span>
                B2B Wholesale
            </a>
</nav>
<div class="p-4 border-t border-white/5">
<div class="flex items-center gap-3 p-3 bg-[var(--warm-charcoal)] rounded-xl border border-white/5">
<div class="w-9 h-9 rounded-lg bg-[var(--artisan-gold)]/10 flex items-center justify-center text-[var(--artisan-gold)] font-bold">M</div>
<div class="flex-1 min-w-0">
<p class="text-sm font-semibold truncate">Mamat</p>
<p class="text-[10px] text-[var(--muted-smoke)] uppercase">Admin</p>
</div>
<button class="text-[var(--muted-smoke)] hover:text-white transition-colors">
<span class="material-symbols-outlined text-lg">logout</span>
</button>
</div>
</div>
</aside>
<main class="flex-1 overflow-y-auto custom-scrollbar flex flex-col">
<header class="p-8 pb-0">
<div class="mb-8">
<h2 class="font-serif text-4xl text-white">Stock &amp; Inventory</h2>
<p class="text-[var(--muted-smoke)] mt-2 text-sm">Manage stock, track movements, and monitor inventory</p>
</div>
<div class="flex gap-8 border-b border-white/5">
<button class="pb-4 text-xs font-bold uppercase tracking-widest text-[var(--muted-smoke)] hover:text-white transition-colors flex items-center gap-2">
<span class="material-symbols-outlined text-lg">inventory</span> Stock
                </button>
<button class="pb-4 text-xs font-bold uppercase tracking-widest text-[var(--muted-smoke)] hover:text-white transition-colors flex items-center gap-2">
<span class="material-symbols-outlined text-lg">local_shipping</span> Incoming
                </button>
<button class="pb-4 text-xs font-bold uppercase tracking-widest text-[var(--muted-smoke)] hover:text-white transition-colors flex items-center gap-2">
<span class="material-symbols-outlined text-lg">sync_alt</span> Transfers
                </button>
<button class="pb-4 text-xs font-bold uppercase tracking-widest text-[var(--muted-smoke)] hover:text-white transition-colors flex items-center gap-2">
<span class="material-symbols-outlined text-lg">delete_outline</span> Wastage
                </button>
<button class="pb-4 text-xs font-bold uppercase tracking-widest tab-active flex items-center gap-2">
<span class="material-symbols-outlined text-lg">precision_manufacturing</span> Production
                </button>
<button class="pb-4 text-xs font-bold uppercase tracking-widest text-[var(--muted-smoke)] hover:text-white transition-colors flex items-center gap-2">
<span class="material-symbols-outlined text-lg">fact_check</span> Opname
                </button>
<button class="pb-4 text-xs font-bold uppercase tracking-widest text-[var(--muted-smoke)] hover:text-white transition-colors flex items-center gap-2">
<span class="material-symbols-outlined text-lg">analytics</span> Movements
                </button>
</div>
</header>
<div class="p-8 space-y-6">
<div class="flex gap-3">
<button class="px-6 py-2.5 text-xs font-bold uppercase tracking-widest rounded-full bg-[var(--artisan-gold)] text-black">Viennoiserie</button>
<button class="px-6 py-2.5 text-xs font-bold uppercase tracking-widest rounded-full border border-white/10 text-[var(--muted-smoke)] hover:text-white hover:border-white/20 transition-all">Pastry</button>
<button class="px-6 py-2.5 text-xs font-bold uppercase tracking-widest rounded-full border border-white/10 text-[var(--muted-smoke)] hover:text-white hover:border-white/20 transition-all">Bakery</button>
<button class="px-6 py-2.5 text-xs font-bold uppercase tracking-widest rounded-full border border-white/10 text-[var(--muted-smoke)] hover:text-white hover:border-white/20 transition-all">Hot Kitchen</button>
</div>
<div class="grid grid-cols-12 gap-6">
<div class="col-span-12 lg:col-span-7 xl:col-span-8">
<div class="bg-[var(--warm-charcoal)] rounded-2xl border border-white/5 h-[650px] flex flex-col overflow-hidden">
<div class="p-6 border-b border-white/5 flex items-center justify-between">
<h3 class="font-serif text-xl">Production Entry</h3>
<div class="relative w-80">
<span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted-smoke)] text-xl">search</span>
<input class="w-full bg-[var(--deep-onyx)] border border-white/5 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:ring-1 focus:ring-[var(--artisan-gold)] focus:border-[var(--artisan-gold)] text-white placeholder-[var(--muted-smoke)]/50 transition-all" placeholder="Search for a product..." type="text"/>
</div>
</div>
<div class="flex-1 flex flex-col items-center justify-center p-12">
<div class="w-24 h-24 rounded-full bg-[var(--deep-onyx)] flex items-center justify-center mb-6 border border-white/5">
<span class="material-symbols-outlined text-4xl text-[var(--muted-smoke)]/30">content_paste</span>
</div>
<h4 class="text-lg font-medium text-white/90">No product added</h4>
<p class="text-[var(--muted-smoke)] text-sm text-center max-w-sm mt-2">Search for a product from the Viennoiserie section to start recording today's production.</p>
</div>
</div>
</div>
<div class="col-span-12 lg:col-span-5 xl:col-span-4 space-y-6">
<div class="bg-[var(--warm-charcoal)] p-4 rounded-2xl border border-white/5 flex items-center justify-between">
<button class="p-2 text-[var(--muted-smoke)] hover:text-white transition-colors">
<span class="material-symbols-outlined">chevron_left</span>
</button>
<div class="text-center">
<span class="text-xs font-bold uppercase tracking-widest text-[var(--artisan-gold)]">Today</span>
<p class="text-sm font-medium mt-0.5">February 11, 2026</p>
</div>
<button class="p-2 text-[var(--muted-smoke)] hover:text-white transition-colors">
<span class="material-symbols-outlined">chevron_right</span>
</button>
</div>
<div class="grid grid-cols-2 gap-4">
<div class="bg-[var(--warm-charcoal)] border border-emerald-500/20 p-6 rounded-2xl">
<p class="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-500 mb-2">Produced</p>
<h4 class="text-4xl font-serif text-emerald-500">0</h4>
</div>
<div class="bg-[var(--warm-charcoal)] border border-rose-500/20 p-6 rounded-2xl">
<p class="text-[10px] font-bold uppercase tracking-[0.2em] text-rose-500 mb-2">Waste</p>
<h4 class="text-4xl font-serif text-rose-500">0</h4>
</div>
</div>
<div class="bg-[var(--warm-charcoal)] rounded-2xl border border-white/5 flex flex-col h-[380px]">
<div class="p-5 border-b border-white/5">
<h3 class="text-[11px] font-bold uppercase tracking-[0.2em] text-[var(--muted-smoke)]">Today's Production (0)</h3>
</div>
<div class="flex-1 flex flex-col items-center justify-center p-6 text-center">
<span class="material-symbols-outlined text-4xl text-[var(--muted-smoke)]/20 mb-4">history_toggle_off</span>
<p class="text-sm text-[var(--muted-smoke)] italic">No production recorded yet</p>
</div>
<div class="p-5 mt-auto">
<button class="w-full bg-[var(--artisan-gold)] hover:brightness-110 active:scale-[0.98] text-black font-bold text-xs uppercase tracking-widest py-4 rounded-xl transition-all shadow-lg shadow-[var(--artisan-gold)]/10 flex items-center justify-center gap-2">
<span class="material-symbols-outlined text-lg">check_circle</span>
                                Submit Production
                            </button>
</div>
</div>
</div>
</div>
</div>
</main>

</body></html>
      <!-- STITCH_HTML_END -->
    ` }} />
  );
};

export default Production_Entry_v2;
