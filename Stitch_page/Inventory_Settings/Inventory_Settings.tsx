import React from 'react';

const Inventory_Settings: React.FC = () => {
  return (
    <div dangerouslySetInnerHTML={{ __html: `
      <!-- STITCH_HTML_START -->
      <!DOCTYPE html>

<html class="dark" lang="en"><head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
<title>The Breakery - Inventory Settings</title>
<script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600&amp;family=Work+Sans:wght@300;400;500;600&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<script id="tailwind-config">
        tailwind.config = {
            darkMode: "class",
            theme: {
                extend: {
                    colors: {
                        "primary": "#c8a45b",
                        "background-light": "#f8f7f6",
                        "background-dark": "#0d0d0f",
                        "card-dark": "#1a1a1d",
                        "danger": "#ef4444"
                    },
                    fontFamily: {
                        "display": ["Work Sans", "sans-serif"],
                        "brand": ["Playfair Display", "serif"]
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
            font-family: 'Work Sans', sans-serif;
        }
        .font-brand {
            font-family: 'Playfair Display', serif;
        }
        /* Custom scrollbar for dark mode */
        ::-webkit-scrollbar {
            width: 8px;
        }
        ::-webkit-scrollbar-track {
            background: #0d0d0f;
        }
        ::-webkit-scrollbar-thumb {
            background: #2a2a2d;
            border-radius: 4px;
        }
        ::-webkit-scrollbar-thumb:hover {
            background: #c8a45b;
        }
    </style>
</head>
<body class="bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 min-h-screen">
<!-- Layout Container -->
<div class="max-w-5xl mx-auto px-6 py-12">
<!-- Header Section -->
<header class="flex items-center justify-between mb-10">
<div class="flex items-center gap-4">
<div class="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center text-primary">
<span class="material-icons text-3xl">warehouse</span>
</div>
<div>
<h1 class="text-3xl font-brand font-semibold tracking-tight">Inventory Configuration</h1>
<p class="text-sm text-primary/60 font-medium uppercase tracking-widest mt-1">System Management</p>
</div>
</div>
<div class="hidden md:flex items-center gap-3">
<span class="text-xs text-slate-500">Last synced: 2 minutes ago</span>
<button class="p-2 hover:bg-card-dark rounded-full transition-colors text-slate-400">
<span class="material-icons">refresh</span>
</button>
</div>
</header>
<!-- Main Content Grid -->
<div class="space-y-6">
<!-- SECTION 1: Stock Tracking -->
<section class="bg-white dark:bg-card-dark rounded-xl border border-slate-200 dark:border-white/5 overflow-hidden shadow-sm">
<div class="px-6 py-4 border-b border-slate-100 dark:border-white/5 flex items-center justify-between">
<h2 class="font-semibold text-lg flex items-center gap-2">
<span class="material-icons text-primary text-sm">inventory_2</span>
                        Stock Tracking
                    </h2>
</div>
<div class="p-6 space-y-6">
<!-- Master Switch -->
<div class="flex items-center justify-between">
<div>
<p class="font-medium">Track Stock Levels</p>
<p class="text-sm text-slate-500">Enable real-time inventory tracking across all items.</p>
</div>
<label class="relative inline-flex items-center cursor-pointer">
<input checked="" class="sr-only peer" type="checkbox"/>
<div class="w-11 h-6 bg-slate-200 dark:bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
</label>
</div>
<div class="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
<!-- Left Column -->
<div class="space-y-4">
<div class="flex items-center justify-between">
<span class="text-sm">Auto-deduct on sale</span>
<label class="relative inline-flex items-center cursor-pointer scale-90">
<input checked="" class="sr-only peer" type="checkbox"/>
<div class="w-10 h-5 bg-slate-200 dark:bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
</label>
</div>
<div class="flex items-center justify-between">
<span class="text-sm">Deduct based on BOM</span>
<label class="relative inline-flex items-center cursor-pointer scale-90">
<input checked="" class="sr-only peer" type="checkbox"/>
<div class="w-10 h-5 bg-slate-200 dark:bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
</label>
</div>
</div>
<!-- Right Column (Danger Toggle) -->
<div class="p-4 rounded-lg bg-danger/5 border border-danger/20">
<div class="flex items-start justify-between">
<div class="pr-4">
<p class="text-sm font-semibold text-danger">Allow negative stock</p>
<p class="text-xs text-danger/70 mt-1">Warning: This may cause discrepancies in financial reports.</p>
</div>
<label class="relative inline-flex items-center cursor-pointer scale-90">
<input class="sr-only peer" type="checkbox"/>
<div class="w-10 h-5 bg-slate-200 dark:bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-danger"></div>
</label>
</div>
</div>
</div>
</div>
</section>
<!-- SECTION 2: Alerts & Reorder -->
<section class="bg-white dark:bg-card-dark rounded-xl border border-slate-200 dark:border-white/5 overflow-hidden shadow-sm">
<div class="px-6 py-4 border-b border-slate-100 dark:border-white/5 flex items-center justify-between">
<h2 class="font-semibold text-lg flex items-center gap-2">
<span class="material-icons text-primary text-sm">notifications_active</span>
                        Alerts &amp; Reorder
                    </h2>
</div>
<div class="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
<div class="space-y-2">
<label class="block text-sm font-medium text-slate-400">Global Low Stock Threshold</label>
<div class="relative">
<input class="w-full bg-slate-50 dark:bg-background-dark/50 border border-slate-200 dark:border-white/10 rounded-lg py-2 px-4 focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all" type="number" value="10"/>
<span class="absolute right-3 top-2.5 text-xs text-slate-500">Units</span>
</div>
</div>
<div class="flex items-center justify-between p-4 bg-primary/5 rounded-lg border border-primary/10">
<div class="flex items-center gap-3">
<div>
<div class="flex items-center gap-2">
<p class="text-sm font-medium">Auto-generate PO</p>
<span class="px-1.5 py-0.5 text-[10px] bg-primary text-background-dark font-bold rounded">BETA</span>
</div>
<p class="text-xs text-slate-500 mt-0.5">Automate reordering when threshold is met.</p>
</div>
</div>
<label class="relative inline-flex items-center cursor-pointer">
<input class="sr-only peer" type="checkbox"/>
<div class="w-11 h-6 bg-slate-200 dark:bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
</label>
</div>
</div>
</section>
<!-- SECTION 3: Locations -->
<section class="bg-white dark:bg-card-dark rounded-xl border border-slate-200 dark:border-white/5 overflow-hidden shadow-sm">
<div class="px-6 py-4 border-b border-slate-100 dark:border-white/5 flex items-center justify-between">
<h2 class="font-semibold text-lg flex items-center gap-2">
<span class="material-icons text-primary text-sm">location_on</span>
                        Storage Locations
                    </h2>
<button class="text-primary text-sm font-semibold flex items-center gap-1 hover:opacity-80 transition-opacity">
<span class="material-icons text-base">add</span>
                        Add Location
                    </button>
</div>
<div class="overflow-x-auto">
<table class="w-full text-left">
<thead class="bg-slate-50 dark:bg-white/5 text-xs uppercase tracking-wider text-slate-500 font-medium">
<tr>
<th class="px-6 py-3">Location Name</th>
<th class="px-6 py-3">Primary Use</th>
<th class="px-6 py-3">Status</th>
<th class="px-6 py-3 text-right">Action</th>
</tr>
</thead>
<tbody class="divide-y divide-slate-100 dark:divide-white/5">
<tr class="hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors">
<td class="px-6 py-4 font-medium">Main Kitchen</td>
<td class="px-6 py-4 text-sm text-slate-400">Production &amp; Prep</td>
<td class="px-6 py-4">
<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400">Active</span>
</td>
<td class="px-6 py-4 text-right">
<button class="text-slate-400 hover:text-primary transition-colors"><span class="material-icons text-lg">more_vert</span></button>
</td>
</tr>
<tr class="hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors">
<td class="px-6 py-4 font-medium">Cold Room</td>
<td class="px-6 py-4 text-sm text-slate-400">Perishables</td>
<td class="px-6 py-4">
<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400">Active</span>
</td>
<td class="px-6 py-4 text-right">
<button class="text-slate-400 hover:text-primary transition-colors"><span class="material-icons text-lg">more_vert</span></button>
</td>
</tr>
<tr class="hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors">
<td class="px-6 py-4 font-medium">Dry Storage</td>
<td class="px-6 py-4 text-sm text-slate-400">Bulk Grains &amp; Flours</td>
<td class="px-6 py-4">
<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400">Active</span>
</td>
<td class="px-6 py-4 text-right">
<button class="text-slate-400 hover:text-primary transition-colors"><span class="material-icons text-lg">more_vert</span></button>
</td>
</tr>
<tr class="hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors">
<td class="px-6 py-4 font-medium">Display</td>
<td class="px-6 py-4 text-sm text-slate-400">Finished Goods</td>
<td class="px-6 py-4">
<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800 dark:bg-white/10 dark:text-slate-400">In-Store</span>
</td>
<td class="px-6 py-4 text-right">
<button class="text-slate-400 hover:text-primary transition-colors"><span class="material-icons text-lg">more_vert</span></button>
</td>
</tr>
</tbody>
</table>
</div>
</section>
<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
<!-- SECTION 4: Stock Count (Opname) -->
<section class="bg-white dark:bg-card-dark rounded-xl border border-slate-200 dark:border-white/5 overflow-hidden shadow-sm">
<div class="px-6 py-4 border-b border-slate-100 dark:border-white/5">
<h2 class="font-semibold text-lg flex items-center gap-2">
<span class="material-icons text-primary text-sm">fact_check</span>
                            Stock Count (Opname)
                        </h2>
</div>
<div class="p-6 space-y-6">
<div class="space-y-2">
<label class="block text-sm font-medium text-slate-400">Audit Frequency</label>
<select class="w-full bg-slate-50 dark:bg-background-dark/50 border border-slate-200 dark:border-white/10 rounded-lg py-2 px-4 focus:ring-1 focus:ring-primary focus:border-primary outline-none">
<option>Weekly</option>
<option selected="">Bi-Weekly</option>
<option>Monthly</option>
<option>Quarterly</option>
</select>
</div>
<div class="flex items-center justify-between">
<div>
<p class="text-sm font-medium">Manager approval</p>
<p class="text-xs text-slate-500">Require verification for discrepancies &gt; 5%.</p>
</div>
<label class="relative inline-flex items-center cursor-pointer scale-90">
<input checked="" class="sr-only peer" type="checkbox"/>
<div class="w-10 h-5 bg-slate-200 dark:bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
</label>
</div>
</div>
</section>
<!-- SECTION 5: Waste Management -->
<section class="bg-white dark:bg-card-dark rounded-xl border border-slate-200 dark:border-white/5 overflow-hidden shadow-sm">
<div class="px-6 py-4 border-b border-slate-100 dark:border-white/5">
<h2 class="font-semibold text-lg flex items-center gap-2">
<span class="material-icons text-primary text-sm">delete_outline</span>
                            Waste Management
                        </h2>
</div>
<div class="p-6 space-y-6">
<div class="flex items-center justify-between">
<div>
<p class="text-sm font-medium">Photo requirement</p>
<p class="text-xs text-slate-500">Mandatory photo for items over \\$20 value.</p>
</div>
<label class="relative inline-flex items-center cursor-pointer scale-90">
<input checked="" class="sr-only peer" type="checkbox"/>
<div class="w-10 h-5 bg-slate-200 dark:bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
</label>
</div>
<div class="flex items-center justify-between">
<div>
<p class="text-sm font-medium">Reason requirement</p>
<p class="text-xs text-slate-500">Force select a reason code (Expired, Damaged, etc.)</p>
</div>
<label class="relative inline-flex items-center cursor-pointer scale-90">
<input checked="" class="sr-only peer" type="checkbox"/>
<div class="w-10 h-5 bg-slate-200 dark:bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
</label>
</div>
</div>
</section>
</div>
<!-- Action Footer -->
<div class="mt-12 pt-8 border-t border-slate-200 dark:border-white/5 flex items-center justify-end gap-4">
<button class="px-6 py-2.5 rounded-lg font-medium text-slate-500 hover:text-white hover:bg-white/5 transition-all">
                    Discard Changes
                </button>
<button class="bg-primary hover:bg-primary/90 text-background-dark font-bold px-8 py-2.5 rounded-lg shadow-lg shadow-primary/20 transition-all flex items-center gap-2">
<span class="material-icons text-lg">save</span>
                    Save Inventory Settings
                </button>
</div>
</div>
<!-- Background Decor (Abstract Pattern) -->
<div class="fixed top-0 right-0 -z-10 w-[500px] h-[500px] bg-primary/5 blur-[120px] rounded-full pointer-events-none"></div>
<div class="fixed bottom-0 left-0 -z-10 w-[400px] h-[400px] bg-primary/3 blur-[100px] rounded-full pointer-events-none"></div>
</div>
</body></html>
      <!-- STITCH_HTML_END -->
    ` }} />
  );
};

export default Inventory_Settings;
