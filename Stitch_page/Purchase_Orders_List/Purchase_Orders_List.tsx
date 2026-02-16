import React from 'react';

const Purchase_Orders_List: React.FC = () => {
  return (
    <div dangerouslySetInnerHTML={{ __html: `
      <!-- STITCH_HTML_START -->
      <!DOCTYPE html>

<html class="dark" lang="en"><head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
<title>Purchase Orders | The Breakery</title>
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
                        "primary": "#eead2b",
                        "background-light": "#f8f7f6",
                        "background-dark": "#0D0D0F",
                        "surface": "#1A1A1D",
                    },
                    fontFamily: {
                        "display": ["Work Sans", "sans-serif"],
                        "serif": ["Playfair Display", "serif"],
                    },
                    borderRadius: {
                        "DEFAULT": "0.5rem",
                        "lg": "1rem",
                        "xl": "1.5rem",
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
        .animate-pulse-subtle {
            animation: pulse-subtle 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        @keyframes pulse-subtle {
            0%, 100% { opacity: 1; transform: scale(1); }
            50% { opacity: 0.85; transform: scale(1.02); }
        }
    </style>
</head>
<body class="bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 min-h-screen">
<div class="max-w-[1440px] mx-auto px-6 py-8">
<!-- Header Section -->
<header class="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
<div class="flex items-center gap-4">
<div class="bg-primary/10 p-3 rounded-lg">
<span class="material-icons-outlined text-primary text-3xl">clipboard_list</span>
</div>
<div>
<h1 class="font-serif text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Purchase Orders</h1>
<p class="text-slate-500 dark:text-slate-400 text-sm mt-1">Manage and track your bakery inventory procurement</p>
</div>
</div>
<button class="bg-primary hover:bg-primary/90 text-background-dark font-semibold px-6 py-3 rounded-lg flex items-center gap-2 transition-all active:scale-95 shadow-lg shadow-primary/10">
<span class="material-icons-outlined">add</span>
<span>New PO</span>
</button>
</header>
<!-- KPI Row -->
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
<div class="bg-white dark:bg-surface p-6 rounded-xl border border-slate-200 dark:border-primary/10 shadow-sm">
<div class="flex items-center justify-between mb-2">
<span class="text-sm font-medium text-slate-500 dark:text-slate-400">Open POs</span>
<span class="material-icons-outlined text-blue-500 text-xl">folder_open</span>
</div>
<div class="text-3xl font-bold text-blue-500">6</div>
<div class="mt-2 text-xs text-slate-400">Active requests</div>
</div>
<div class="bg-white dark:bg-surface p-6 rounded-xl border border-slate-200 dark:border-primary/10 shadow-sm">
<div class="flex items-center justify-between mb-2">
<span class="text-sm font-medium text-slate-500 dark:text-slate-400">Pending Delivery</span>
<span class="material-icons-outlined text-amber-500 text-xl">local_shipping</span>
</div>
<div class="text-3xl font-bold text-amber-500">3</div>
<div class="mt-2 text-xs text-slate-400">In transit from supplier</div>
</div>
<div class="bg-white dark:bg-surface p-6 rounded-xl border border-slate-200 dark:border-primary/10 shadow-sm">
<div class="flex items-center justify-between mb-2">
<span class="text-sm font-medium text-slate-500 dark:text-slate-400">This Month Total</span>
<span class="material-icons-outlined text-green-500 text-xl">payments</span>
</div>
<div class="text-2xl font-bold text-green-500 uppercase">Rp 15.400.000</div>
<div class="mt-2 text-xs text-slate-400">Total expenditure</div>
</div>
<div class="bg-white dark:bg-surface p-6 rounded-xl border border-red-500/20 dark:border-red-500/20 shadow-sm">
<div class="flex items-center justify-between mb-2">
<span class="text-sm font-medium text-slate-500 dark:text-slate-400">Overdue</span>
<span class="material-icons-outlined text-red-500 text-xl">warning_amber</span>
</div>
<div class="text-3xl font-bold text-red-500">1</div>
<div class="mt-2 text-xs text-red-500/70">Action required immediately</div>
</div>
</div>
<!-- Filters & Search -->
<div class="bg-white dark:bg-surface p-4 rounded-xl border border-slate-200 dark:border-primary/10 mb-6 flex flex-wrap items-center gap-4">
<div class="flex-1 min-w-[300px] relative">
<span class="material-icons-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">search</span>
<input class="w-full bg-slate-50 dark:bg-background-dark/50 border border-slate-200 dark:border-slate-700 rounded-lg pl-10 pr-4 py-2 text-sm focus:ring-primary focus:border-primary" placeholder="Search PO#, supplier or items..." type="text"/>
</div>
<div class="flex flex-wrap items-center gap-3">
<select class="bg-slate-50 dark:bg-background-dark/50 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2 text-sm text-slate-600 dark:text-slate-300 focus:ring-primary">
<option>All Suppliers</option>
<option>Vanilla Import</option>
<option>Grain &amp; Co</option>
<option>Dairy Delights</option>
</select>
<select class="bg-slate-50 dark:bg-background-dark/50 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2 text-sm text-slate-600 dark:text-slate-300 focus:ring-primary">
<option>Status: All</option>
<option>Sent</option>
<option>Received</option>
<option>Overdue</option>
</select>
<div class="bg-slate-50 dark:bg-background-dark/50 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2 text-sm text-slate-600 dark:text-slate-300 flex items-center gap-2 cursor-pointer hover:border-primary transition-colors">
<span class="material-icons-outlined text-sm">calendar_today</span>
<span>Date Range</span>
</div>
<button class="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 p-2 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
<span class="material-icons-outlined">filter_list</span>
</button>
</div>
</div>
<!-- PO Table -->
<div class="bg-white dark:bg-surface rounded-xl border border-slate-200 dark:border-primary/10 overflow-hidden shadow-xl">
<div class="overflow-x-auto">
<table class="w-full text-left border-collapse">
<thead>
<tr class="bg-slate-50 dark:bg-background-dark/40 border-b border-slate-200 dark:border-slate-700">
<th class="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">PO #</th>
<th class="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">Supplier</th>
<th class="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">Date</th>
<th class="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">Items</th>
<th class="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">Total (Rp)</th>
<th class="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">Exp. Date</th>
<th class="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">Status</th>
<th class="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">Actions</th>
</tr>
</thead>
<tbody class="divide-y divide-slate-200 dark:divide-slate-700/50">
<!-- Overdue Row -->
<tr class="hover:bg-primary/5 transition-colors group">
<td class="px-6 py-4 text-sm font-medium text-primary">PO-2026-088</td>
<td class="px-6 py-4 text-sm font-medium text-slate-800 dark:text-slate-200">Vanilla Import</td>
<td class="px-6 py-4 text-sm text-slate-500 dark:text-slate-400">Oct 12, 2026</td>
<td class="px-6 py-4 text-sm text-slate-500 dark:text-slate-400">12 items</td>
<td class="px-6 py-4 text-sm font-semibold text-slate-800 dark:text-slate-200">4.200.000</td>
<td class="px-6 py-4 text-sm text-red-400 font-medium">Oct 18, 2026</td>
<td class="px-6 py-4">
<span class="bg-red-500/10 text-red-500 px-3 py-1 rounded-full text-xs font-semibold flex items-center w-fit gap-1 animate-pulse-subtle">
<span class="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                                    Overdue
                                </span>
</td>
<td class="px-6 py-4">
<button class="text-slate-400 hover:text-primary transition-colors">
<span class="material-icons-outlined">more_horiz</span>
</button>
</td>
</tr>
<!-- Sent Row -->
<tr class="hover:bg-primary/5 transition-colors group">
<td class="px-6 py-4 text-sm font-medium text-primary">PO-2026-092</td>
<td class="px-6 py-4 text-sm font-medium text-slate-800 dark:text-slate-200">Grain &amp; Co</td>
<td class="px-6 py-4 text-sm text-slate-500 dark:text-slate-400">Oct 22, 2026</td>
<td class="px-6 py-4 text-sm text-slate-500 dark:text-slate-400">8 items</td>
<td class="px-6 py-4 text-sm font-semibold text-slate-800 dark:text-slate-200">2.150.000</td>
<td class="px-6 py-4 text-sm text-slate-500 dark:text-slate-400">Oct 26, 2026</td>
<td class="px-6 py-4">
<span class="bg-blue-500/10 text-blue-500 px-3 py-1 rounded-full text-xs font-semibold flex items-center w-fit gap-1">
<span class="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                                    Sent
                                </span>
</td>
<td class="px-6 py-4">
<button class="text-slate-400 hover:text-primary transition-colors">
<span class="material-icons-outlined">more_horiz</span>
</button>
</td>
</tr>
<!-- Received Row -->
<tr class="hover:bg-primary/5 transition-colors group">
<td class="px-6 py-4 text-sm font-medium text-primary">PO-2026-085</td>
<td class="px-6 py-4 text-sm font-medium text-slate-800 dark:text-slate-200">Dairy Delights</td>
<td class="px-6 py-4 text-sm text-slate-500 dark:text-slate-400">Oct 10, 2026</td>
<td class="px-6 py-4 text-sm text-slate-500 dark:text-slate-400">24 items</td>
<td class="px-6 py-4 text-sm font-semibold text-slate-800 dark:text-slate-200">8.900.000</td>
<td class="px-6 py-4 text-sm text-slate-500 dark:text-slate-400">Oct 14, 2026</td>
<td class="px-6 py-4">
<span class="bg-green-500/10 text-green-500 px-3 py-1 rounded-full text-xs font-semibold flex items-center w-fit gap-1">
<span class="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                                    Received
                                </span>
</td>
<td class="px-6 py-4">
<button class="text-slate-400 hover:text-primary transition-colors">
<span class="material-icons-outlined">more_horiz</span>
</button>
</td>
</tr>
<!-- Another Sent Row -->
<tr class="hover:bg-primary/5 transition-colors group">
<td class="px-6 py-4 text-sm font-medium text-primary">PO-2026-094</td>
<td class="px-6 py-4 text-sm font-medium text-slate-800 dark:text-slate-200">Fresh Produce Hub</td>
<td class="px-6 py-4 text-sm text-slate-500 dark:text-slate-400">Oct 24, 2026</td>
<td class="px-6 py-4 text-sm text-slate-500 dark:text-slate-400">5 items</td>
<td class="px-6 py-4 text-sm font-semibold text-slate-800 dark:text-slate-200">1.150.000</td>
<td class="px-6 py-4 text-sm text-slate-500 dark:text-slate-400">Oct 28, 2026</td>
<td class="px-6 py-4">
<span class="bg-blue-500/10 text-blue-500 px-3 py-1 rounded-full text-xs font-semibold flex items-center w-fit gap-1">
<span class="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                                    Sent
                                </span>
</td>
<td class="px-6 py-4">
<button class="text-slate-400 hover:text-primary transition-colors">
<span class="material-icons-outlined">more_horiz</span>
</button>
</td>
</tr>
<!-- Pending Row -->
<tr class="hover:bg-primary/5 transition-colors group">
<td class="px-6 py-4 text-sm font-medium text-primary">PO-2026-090</td>
<td class="px-6 py-4 text-sm font-medium text-slate-800 dark:text-slate-200">Sugar Rush Wholesalers</td>
<td class="px-6 py-4 text-sm text-slate-500 dark:text-slate-400">Oct 18, 2026</td>
<td class="px-6 py-4 text-sm text-slate-500 dark:text-slate-400">15 items</td>
<td class="px-6 py-4 text-sm font-semibold text-slate-800 dark:text-slate-200">3.050.000</td>
<td class="px-6 py-4 text-sm text-slate-500 dark:text-slate-400">Oct 25, 2026</td>
<td class="px-6 py-4">
<span class="bg-amber-500/10 text-amber-500 px-3 py-1 rounded-full text-xs font-semibold flex items-center w-fit gap-1">
<span class="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                                    Pending
                                </span>
</td>
<td class="px-6 py-4">
<button class="text-slate-400 hover:text-primary transition-colors">
<span class="material-icons-outlined">more_horiz</span>
</button>
</td>
</tr>
</tbody>
</table>
</div>
<!-- Pagination Placeholder -->
<div class="px-6 py-4 bg-slate-50 dark:bg-background-dark/40 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between">
<p class="text-xs text-slate-500">Showing <span class="font-semibold text-slate-700 dark:text-slate-300">1 to 5</span> of <span class="font-semibold text-slate-700 dark:text-slate-300">24</span> results</p>
<div class="flex items-center gap-2">
<button class="p-1.5 rounded border border-slate-200 dark:border-slate-700 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-50" disabled="">
<span class="material-icons-outlined text-sm">chevron_left</span>
</button>
<button class="px-3 py-1 rounded bg-primary text-background-dark font-medium text-xs">1</button>
<button class="px-3 py-1 rounded text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs">2</button>
<button class="px-3 py-1 rounded text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs">3</button>
<button class="p-1.5 rounded border border-slate-200 dark:border-slate-700 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800">
<span class="material-icons-outlined text-sm">chevron_right</span>
</button>
</div>
</div>
</div>
<!-- Mini Footer / Status Bar -->
<footer class="mt-12 flex items-center justify-between border-t border-slate-200 dark:border-primary/10 pt-6 opacity-60">
<div class="flex items-center gap-6">
<div class="flex items-center gap-2">
<div class="w-2 h-2 rounded-full bg-green-500"></div>
<span class="text-xs">Database Connected</span>
</div>
<div class="flex items-center gap-2">
<span class="material-icons-outlined text-xs">update</span>
<span class="text-xs">Last updated: 2 mins ago</span>
</div>
</div>
<div class="font-serif text-sm tracking-widest uppercase italic">The Breakery Procurement System</div>
</footer>
</div>
</body></html>
      <!-- STITCH_HTML_END -->
    ` }} />
  );
};

export default Purchase_Orders_List;
