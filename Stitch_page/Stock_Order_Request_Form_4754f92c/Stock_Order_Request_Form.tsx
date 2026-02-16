import React from 'react';

const Stock_Order_Request_Form: React.FC = () => {
  return (
    <div dangerouslySetInnerHTML={{ __html: `
      <!-- STITCH_HTML_START -->
      <!DOCTYPE html>
<html class="dark" lang="en"><head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
<title>The Breakery - Pending Supplier Orders Tracker</title>
<script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<script id="tailwind-config">
        tailwind.config = {
            darkMode: "class",
            theme: {
                extend: {
                    colors: {
                        "primary": "#C9A55C", // Aged Gold
                        "background-dark": "#0D0D0F", // Deep Onyx
                        "card-dark": "#161618",
                        "border-dark": "#2D2D30",
                        "stone-text": "#E5E7EB",
                        "muted-smoke": "#6B7280",
                        "muted-green": "#4A5D4E",
                    },
                    fontFamily: {
                        "display": ["Inter", "sans-serif"]
                    },
                    borderRadius: {
                        "DEFAULT": "0.25rem",
                    },
                },
            },
        }
    </script>
<style type="text/tailwindcss">
        @layer base {
            body {
                @apply bg-background-dark text-slate-100 font-display;
            }
        }
        ::-webkit-scrollbar {
            width: 4px;
        }
        ::-webkit-scrollbar-track {
            background: #0D0D0F;
        }
        ::-webkit-scrollbar-thumb {
            background: #2D2D30;
        }
        ::-webkit-scrollbar-thumb:hover {
            background: #C9A55C;
        }
        .status-badge {
            @apply px-3 py-1 text-[10px] font-semibold uppercase tracking-widest rounded-full border;
        }
        .status-sent {
            @apply border-muted-smoke text-muted-smoke;
        }
        .status-confirmed {
            @apply border-primary text-primary;
        }
        .status-shipped {
            @apply border-muted-green text-muted-green;
        }
    </style>
</head>
<body class="min-h-screen flex">
<aside class="w-64 border-r border-border-dark flex flex-col fixed h-full bg-background-dark z-20">
<div class="p-8">
<div class="flex items-center gap-3 mb-10">
<div class="w-8 h-8 bg-primary flex items-center justify-center rounded">
<span class="material-symbols-outlined text-background-dark text-xl">bakery_dining</span>
</div>
<div>
<h1 class="text-sm font-bold tracking-widest text-primary uppercase">The Breakery</h1>
<p class="text-[8px] tracking-[0.3em] uppercase opacity-40">Boutique Française</p>
</div>
</div>
<nav class="space-y-1">
<a class="flex items-center gap-3 px-4 py-3 text-xs font-medium text-slate-400 hover:text-primary transition-colors group" href="#">
<span class="material-symbols-outlined text-lg">dashboard</span>
<span class="tracking-widest uppercase">Dashboard</span>
</a>
<a class="flex items-center gap-3 px-4 py-3 text-xs font-medium text-primary bg-primary/5 rounded border-r-2 border-primary group" href="#">
<span class="material-symbols-outlined text-lg">inventory</span>
<span class="tracking-widest uppercase">Pending Orders</span>
</a>
<a class="flex items-center gap-3 px-4 py-3 text-xs font-medium text-slate-400 hover:text-primary transition-colors group" href="#">
<span class="material-symbols-outlined text-lg">local_shipping</span>
<span class="tracking-widest uppercase">Suppliers</span>
</a>
<a class="flex items-center gap-3 px-4 py-3 text-xs font-medium text-slate-400 hover:text-primary transition-colors group" href="#">
<span class="material-symbols-outlined text-lg">receipt_long</span>
<span class="tracking-widest uppercase">History</span>
</a>
</nav>
</div>
<div class="mt-auto p-8 border-t border-border-dark">
<div class="flex items-center gap-3">
<div class="w-8 h-8 rounded-full bg-border-dark flex items-center justify-center">
<span class="material-symbols-outlined text-slate-500 text-lg">person</span>
</div>
<div class="overflow-hidden">
<p class="text-[10px] font-bold text-slate-300 truncate">JEAN DUPONT</p>
<p class="text-[8px] text-slate-500 uppercase tracking-tighter">Procurement Mgr</p>
</div>
</div>
</div>
</aside>
<main class="flex-1 ml-64 min-h-screen">
<header class="h-24 border-b border-border-dark flex items-center justify-between px-10 sticky top-0 bg-background-dark/95 backdrop-blur-sm z-10">
<h2 class="text-xl font-light text-stone-text tracking-tight">Pending Supplier <span class="font-bold">Orders</span></h2>
<div class="flex items-center gap-4">
<div class="flex items-center gap-2">
<span class="text-[10px] uppercase tracking-widest text-slate-500">Filter Status:</span>
<select class="bg-card-dark border-border-dark text-[10px] uppercase tracking-widest text-slate-300 rounded px-3 py-1.5 focus:border-primary focus:ring-0">
<option>All Status</option>
<option>Sent</option>
<option>Confirmed</option>
<option>Shipped</option>
</select>
</div>
<div class="flex items-center gap-2">
<span class="text-[10px] uppercase tracking-widest text-slate-500">Supplier:</span>
<select class="bg-card-dark border-border-dark text-[10px] uppercase tracking-widest text-slate-300 rounded px-3 py-1.5 focus:border-primary focus:ring-0">
<option>All Partners</option>
<option>Moulin de Provence</option>
<option>Lescure Dairy Co.</option>
<option>Valrhona</option>
</select>
</div>
<button class="bg-primary px-4 py-2 rounded text-background-dark text-[10px] font-bold uppercase tracking-widest hover:bg-primary/90 transition-all">
                    New Order
                </button>
</div>
</header>
<div class="p-10 max-w-6xl mx-auto">
<div class="space-y-4">
<div class="bg-card-dark border border-border-dark rounded overflow-hidden transition-all hover:border-primary/40 group">
<div class="p-6 flex items-center justify-between cursor-pointer">
<div class="grid grid-cols-5 flex-1 items-center gap-8">
<div>
<p class="text-[10px] text-slate-500 uppercase tracking-widest mb-1">Order ID</p>
<p class="text-sm font-medium text-primary">#BRK-2023-088</p>
</div>
<div>
<p class="text-[10px] text-slate-500 uppercase tracking-widest mb-1">Supplier</p>
<p class="text-sm text-stone-text">Moulin de Provence</p>
</div>
<div>
<p class="text-[10px] text-slate-500 uppercase tracking-widest mb-1">Order Date</p>
<p class="text-sm text-stone-text">Oct 24, 2023</p>
</div>
<div>
<p class="text-[10px] text-slate-500 uppercase tracking-widest mb-1">Expected</p>
<p class="text-sm text-stone-text">Oct 28, 2023</p>
</div>
<div>
<p class="text-[10px] text-slate-500 uppercase tracking-widest mb-1">Value</p>
<p class="text-sm font-bold text-stone-text">€ 1,240.50</p>
</div>
</div>
<div class="flex items-center gap-6 ml-8">
<span class="status-badge status-confirmed">Confirmed</span>
<span class="material-symbols-outlined text-slate-600 group-hover:text-primary transition-colors">keyboard_arrow_down</span>
</div>
</div>
<div class="border-t border-border-dark/50 bg-background-dark/30 p-8 grid grid-cols-12 gap-10">
<div class="col-span-7">
<h4 class="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4">Order Summary</h4>
<div class="space-y-3">
<div class="flex justify-between text-xs py-2 border-b border-border-dark/30">
<span class="text-slate-400">Flour T55 - Artisan Grind (50kg)</span>
<span class="text-stone-text font-medium">10 Bags</span>
</div>
<div class="flex justify-between text-xs py-2 border-b border-border-dark/30">
<span class="text-slate-400">Organic Rye Berries (25kg)</span>
<span class="text-stone-text font-medium">4 Bags</span>
</div>
<div class="flex justify-between text-xs py-2">
<span class="text-slate-400">Levain Starter Culture</span>
<span class="text-stone-text font-medium">2 Units</span>
</div>
</div>
</div>
<div class="col-span-5">
<h4 class="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-6">Tracking Timeline</h4>
<div class="relative flex justify-between items-center px-2">
<div class="absolute h-[1px] bg-border-dark w-full top-1/2 -translate-y-1/2 z-0"></div>
<div class="absolute h-[1px] bg-primary w-1/3 top-1/2 -translate-y-1/2 z-0"></div>
<div class="relative z-10 flex flex-col items-center gap-2">
<div class="w-3 h-3 rounded-full bg-primary ring-4 ring-background-dark"></div>
<span class="text-[8px] uppercase tracking-widest font-bold text-primary">Sent</span>
</div>
<div class="relative z-10 flex flex-col items-center gap-2">
<div class="w-3 h-3 rounded-full bg-primary ring-4 ring-background-dark"></div>
<span class="text-[8px] uppercase tracking-widest font-bold text-primary">Confirmed</span>
</div>
<div class="relative z-10 flex flex-col items-center gap-2">
<div class="w-3 h-3 rounded-full bg-border-dark border border-slate-700 ring-4 ring-background-dark"></div>
<span class="text-[8px] uppercase tracking-widest font-medium text-slate-500">Shipped</span>
</div>
<div class="relative z-10 flex flex-col items-center gap-2">
<div class="w-3 h-3 rounded-full bg-border-dark border border-slate-700 ring-4 ring-background-dark"></div>
<span class="text-[8px] uppercase tracking-widest font-medium text-slate-500">Delivered</span>
</div>
</div>
</div>
</div>
</div>
<div class="bg-card-dark border border-border-dark rounded overflow-hidden transition-all hover:border-primary/40 group">
<div class="p-6 flex items-center justify-between cursor-pointer">
<div class="grid grid-cols-5 flex-1 items-center gap-8">
<div>
<p class="text-[10px] text-slate-500 uppercase tracking-widest mb-1">Order ID</p>
<p class="text-sm font-medium text-slate-300">#BRK-2023-091</p>
</div>
<div>
<p class="text-[10px] text-slate-500 uppercase tracking-widest mb-1">Supplier</p>
<p class="text-sm text-stone-text">Lescure Dairy Co.</p>
</div>
<div>
<p class="text-[10px] text-slate-500 uppercase tracking-widest mb-1">Order Date</p>
<p class="text-sm text-stone-text">Oct 25, 2023</p>
</div>
<div>
<p class="text-[10px] text-slate-500 uppercase tracking-widest mb-1">Expected</p>
<p class="text-sm text-stone-text">Oct 30, 2023</p>
</div>
<div>
<p class="text-[10px] text-slate-500 uppercase tracking-widest mb-1">Value</p>
<p class="text-sm font-bold text-stone-text">€ 845.00</p>
</div>
</div>
<div class="flex items-center gap-6 ml-8">
<span class="status-badge status-shipped">Shipped</span>
<span class="material-symbols-outlined text-slate-600 group-hover:text-primary transition-colors">keyboard_arrow_right</span>
</div>
</div>
</div>
<div class="bg-card-dark border border-border-dark rounded overflow-hidden transition-all hover:border-primary/40 group">
<div class="p-6 flex items-center justify-between cursor-pointer">
<div class="grid grid-cols-5 flex-1 items-center gap-8">
<div>
<p class="text-[10px] text-slate-500 uppercase tracking-widest mb-1">Order ID</p>
<p class="text-sm font-medium text-slate-300">#BRK-2023-094</p>
</div>
<div>
<p class="text-[10px] text-slate-500 uppercase tracking-widest mb-1">Supplier</p>
<p class="text-sm text-stone-text">Valrhona Chocolaterie</p>
</div>
<div>
<p class="text-[10px] text-slate-500 uppercase tracking-widest mb-1">Order Date</p>
<p class="text-sm text-stone-text">Oct 26, 2023</p>
</div>
<div>
<p class="text-[10px] text-slate-500 uppercase tracking-widest mb-1">Expected</p>
<p class="text-sm text-stone-text">Nov 02, 2023</p>
</div>
<div>
<p class="text-[10px] text-slate-500 uppercase tracking-widest mb-1">Value</p>
<p class="text-sm font-bold text-stone-text">€ 2,120.75</p>
</div>
</div>
<div class="flex items-center gap-6 ml-8">
<span class="status-badge status-sent">Sent</span>
<span class="material-symbols-outlined text-slate-600 group-hover:text-primary transition-colors">keyboard_arrow_right</span>
</div>
</div>
</div>
<div class="bg-card-dark border border-border-dark rounded overflow-hidden transition-all hover:border-primary/40 group">
<div class="p-6 flex items-center justify-between cursor-pointer">
<div class="grid grid-cols-5 flex-1 items-center gap-8">
<div>
<p class="text-[10px] text-slate-500 uppercase tracking-widest mb-1">Order ID</p>
<p class="text-sm font-medium text-slate-300">#BRK-2023-095</p>
</div>
<div>
<p class="text-[10px] text-slate-500 uppercase tracking-widest mb-1">Supplier</p>
<p class="text-sm text-stone-text">Bridor Professional</p>
</div>
<div>
<p class="text-[10px] text-slate-500 uppercase tracking-widest mb-1">Order Date</p>
<p class="text-sm text-stone-text">Oct 27, 2023</p>
</div>
<div>
<p class="text-[10px] text-slate-500 uppercase tracking-widest mb-1">Expected</p>
<p class="text-sm text-stone-text">Nov 01, 2023</p>
</div>
<div>
<p class="text-[10px] text-slate-500 uppercase tracking-widest mb-1">Value</p>
<p class="text-sm font-bold text-stone-text">€ 450.00</p>
</div>
</div>
<div class="flex items-center gap-6 ml-8">
<span class="status-badge status-confirmed">Confirmed</span>
<span class="material-symbols-outlined text-slate-600 group-hover:text-primary transition-colors">keyboard_arrow_right</span>
</div>
</div>
</div>
</div>
<footer class="mt-12 flex items-center justify-between opacity-30 text-[9px] uppercase tracking-[0.3em]">
<p>© 2024 The Breakery Artisan Bakery Group</p>
<div class="flex gap-10">
<a class="hover:text-primary transition-colors" href="#">Support</a>
<a class="hover:text-primary transition-colors" href="#">Privacy</a>
<a class="hover:text-primary transition-colors" href="#">Terms</a>
</div>
</footer>
</div>
</main>

</body></html>
      <!-- STITCH_HTML_END -->
    ` }} />
  );
};

export default Stock_Order_Request_Form;
