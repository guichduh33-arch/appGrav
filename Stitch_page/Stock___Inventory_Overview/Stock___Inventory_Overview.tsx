import React from 'react';

const Stock___Inventory_Overview: React.FC = () => {
  return (
    <div dangerouslySetInnerHTML={{ __html: \
      <!-- STITCH_HTML_START -->
      <!DOCTYPE html>

<html class="dark" lang="en"><head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
<title>The Breakery - Stock &amp; Inventory Overview</title>
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
                        "primary": "#f9a806",
                        "background-light": "#f8f7f5",
                        "background-dark": "#0D0D0F",
                        "surface-dark": "#161618",
                        "border-dark": "#262629",
                    },
                    fontFamily: {
                        "display": ["Work Sans"],
                        "serif": ["Playfair Display"]
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
            background-color: #0D0D0F;
        }
        .serif-title {
            font-family: 'Playfair Display', serif;
        }
        /* Custom scrollbar for dark theme */
        ::-webkit-scrollbar {
            width: 8px;
        }
        ::-webkit-scrollbar-track {
            background: #0D0D0F;
        }
        ::-webkit-scrollbar-thumb {
            background: #262629;
            border-radius: 4px;
        }
        ::-webkit-scrollbar-thumb:hover {
            background: #f9a806;
        }
    </style>
</head>
<body class="bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 min-h-screen">
<!-- Top Navigation -->
<nav class="border-b border-border-dark bg-background-dark/80 backdrop-blur-md sticky top-0 z-40">
<div class="max-w-[1600px] mx-auto px-6 flex items-center h-16">
<div class="flex items-center gap-2 mr-12">
<div class="w-8 h-8 bg-primary rounded flex items-center justify-center">
<span class="material-icons text-background-dark text-xl">bakery_dining</span>
</div>
<span class="serif-title text-xl font-bold tracking-tight">The Breakery</span>
</div>
<div class="flex items-center h-full space-x-8">
<a class="relative h-full flex items-center text-primary font-medium px-1" href="#">
                    Stock
                    <div class="absolute bottom-0 left-0 w-full h-0.5 bg-primary"></div>
</a>
<a class="text-slate-400 hover:text-white transition-colors" href="#">Incoming</a>
<a class="text-slate-400 hover:text-white transition-colors" href="#">Waste</a>
<a class="text-slate-400 hover:text-white transition-colors" href="#">Production</a>
<a class="text-slate-400 hover:text-white transition-colors" href="#">Suppliers</a>
<a class="text-slate-400 hover:text-white transition-colors" href="#">Reports</a>
</div>
<div class="ml-auto flex items-center gap-4">
<button class="p-2 text-slate-400 hover:text-primary">
<span class="material-icons">search</span>
</button>
<button class="p-2 text-slate-400 hover:text-primary relative">
<span class="material-icons">notifications</span>
<span class="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-background-dark"></span>
</button>
<div class="h-8 w-8 rounded-full overflow-hidden border border-border-dark">
<img alt="Profile" class="w-full h-full object-cover" data-alt="User profile avatar" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBJtlPfERc5qVK5EOS7PNaEk02j4mbmRbwmGdxCJFSgFAaoMBUARO9o2NCfFC0QCHheuPT9WNaJop-5ikQlxH49cmUIMF5O7nlTenA1Q615D-paBvPJnY7Dh8UMO01W8ClKDM6iSAB5mNNwgsMzJWTvnqXThceb7ibwtU7qUuzq5XnSGhANFk-KzRYiemMZBHrivKf04Utusw85Nwhv78R46ZodS2OX-Y-xdoWobcL6NIb-mnGKRqEZEHqasKLikRCwFza-g62aDAv_"/>
</div>
</div>
</div>
</nav>
<main class="max-w-[1600px] mx-auto px-6 py-8">
<!-- Header -->
<div class="flex items-center justify-between mb-8">
<div class="flex items-center gap-4">
<div class="w-12 h-12 rounded-lg bg-surface-dark border border-border-dark flex items-center justify-center">
<span class="material-icons text-primary">warehouse</span>
</div>
<div>
<h1 class="serif-title text-3xl font-semibold">Stock &amp; Inventory</h1>
<p class="text-slate-500 text-sm">Monitor and manage your bakery supplies in real-time.</p>
</div>
</div>
<div class="flex gap-3">
<button class="px-4 py-2 bg-surface-dark border border-border-dark rounded-lg hover:bg-border-dark transition-colors flex items-center gap-2">
<span class="material-icons text-sm">download</span>
                    Export CSV
                </button>
<button class="px-4 py-2 bg-primary text-background-dark font-semibold rounded-lg hover:brightness-110 transition-all flex items-center gap-2">
<span class="material-icons text-sm">add</span>
                    Add New Item
                </button>
</div>
</div>
<!-- Alert Summary -->
<div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
<!-- Out of Stock -->
<div class="bg-surface-dark border-l-4 border-red-500 p-6 rounded-xl shadow-lg border-y border-r border-border-dark">
<div class="flex items-center justify-between mb-2">
<span class="text-slate-400 font-medium">Out of Stock</span>
<span class="material-icons text-red-500">error_outline</span>
</div>
<div class="flex items-baseline gap-2">
<span class="text-4xl font-bold text-red-500">2</span>
<span class="text-slate-500 text-sm">items require immediate attention</span>
</div>
</div>
<!-- Below Minimum -->
<div class="bg-surface-dark border-l-4 border-amber-500 p-6 rounded-xl shadow-lg border-y border-r border-border-dark">
<div class="flex items-center justify-between mb-2">
<span class="text-slate-400 font-medium">Below Minimum</span>
<span class="material-icons text-amber-500">warning_amber</span>
</div>
<div class="flex items-baseline gap-2">
<span class="text-4xl font-bold text-amber-500">5</span>
<span class="text-slate-500 text-sm">items reaching threshold</span>
</div>
</div>
<!-- Healthy -->
<div class="bg-surface-dark border-l-4 border-emerald-500 p-6 rounded-xl shadow-lg border-y border-r border-border-dark">
<div class="flex items-center justify-between mb-2">
<span class="text-slate-400 font-medium">Healthy</span>
<span class="material-icons text-emerald-500">check_circle_outline</span>
</div>
<div class="flex items-baseline gap-2">
<span class="text-4xl font-bold text-emerald-500">42</span>
<span class="text-slate-500 text-sm">items at optimal levels</span>
</div>
</div>
</div>
<!-- Table View -->
<div class="bg-surface-dark border border-border-dark rounded-xl overflow-hidden shadow-2xl relative">
<div class="overflow-x-auto">
<table class="w-full text-left">
<thead class="bg-black/40 border-b border-border-dark">
<tr>
<th class="px-6 py-4 font-semibold text-slate-400 text-sm">Product</th>
<th class="px-6 py-4 font-semibold text-slate-400 text-sm">SKU</th>
<th class="px-6 py-4 font-semibold text-slate-400 text-sm">Category</th>
<th class="px-6 py-4 font-semibold text-slate-400 text-sm">Current vs Min Stock</th>
<th class="px-6 py-4 font-semibold text-slate-400 text-sm">Unit</th>
<th class="px-6 py-4 font-semibold text-slate-400 text-sm">Status</th>
<th class="px-6 py-4 font-semibold text-slate-400 text-sm text-right">Action</th>
</tr>
</thead>
<tbody class="divide-y divide-border-dark/50">
<!-- Row 1: Butter (Out of Stock) -->
<tr class="hover:bg-white/5 transition-colors group">
<td class="px-6 py-4">
<div class="flex items-center gap-3">
<div class="w-10 h-10 rounded bg-background-dark border border-border-dark p-1">
<div class="w-full h-full bg-slate-800 rounded flex items-center justify-center">
<span class="material-icons text-slate-600 text-sm">egg</span>
</div>
</div>
<span class="font-medium">Butter (Unsalted)</span>
</div>
</td>
<td class="px-6 py-4 font-mono text-xs text-slate-500">BT-002-LUX</td>
<td class="px-6 py-4"><span class="px-2 py-1 rounded bg-slate-800 text-slate-400 text-xs">Dairy</span></td>
<td class="px-6 py-4">
<div class="flex flex-col gap-1.5 min-w-[140px]">
<div class="flex justify-between text-xs mb-1">
<span class="text-red-500 font-bold">0kg</span>
<span class="text-slate-500">Min: 20kg</span>
</div>
<div class="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
<div class="h-full bg-red-500 w-[0%]"></div>
</div>
</div>
</td>
<td class="px-6 py-4 text-slate-400 text-sm">kg</td>
<td class="px-6 py-4">
<span class="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-red-500/10 text-red-500 border border-red-500/20">Out</span>
</td>
<td class="px-6 py-4 text-right">
<button class="text-slate-500 hover:text-primary transition-colors">
<span class="material-icons">more_vert</span>
</button>
</td>
</tr>
<!-- Row 2: Bread Flour (Low Stock) -->
<tr class="hover:bg-white/5 transition-colors group bg-primary/5">
<td class="px-6 py-4">
<div class="flex items-center gap-3">
<div class="w-10 h-10 rounded bg-background-dark border border-border-dark p-1">
<div class="w-full h-full bg-slate-800 rounded flex items-center justify-center">
<span class="material-icons text-slate-600 text-sm">grain</span>
</div>
</div>
<span class="font-medium">Organic Bread Flour</span>
</div>
</td>
<td class="px-6 py-4 font-mono text-xs text-slate-500">FL-B-105</td>
<td class="px-6 py-4"><span class="px-2 py-1 rounded bg-slate-800 text-slate-400 text-xs">Flour</span></td>
<td class="px-6 py-4">
<div class="flex flex-col gap-1.5 min-w-[140px]">
<div class="flex justify-between text-xs mb-1">
<span class="text-amber-500 font-bold">50kg</span>
<span class="text-slate-500">Min: 200kg</span>
</div>
<div class="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
<div class="h-full bg-amber-500 w-[25%]"></div>
</div>
</div>
</td>
<td class="px-6 py-4 text-slate-400 text-sm">kg</td>
<td class="px-6 py-4">
<span class="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-500/10 text-amber-500 border border-amber-500/20">Low</span>
</td>
<td class="px-6 py-4 text-right">
<button class="px-3 py-1 bg-primary text-background-dark text-xs font-bold rounded hover:brightness-110">Adjust</button>
</td>
</tr>
<!-- Row 3: Yeast (Healthy) -->
<tr class="hover:bg-white/5 transition-colors group">
<td class="px-6 py-4">
<div class="flex items-center gap-3">
<div class="w-10 h-10 rounded bg-background-dark border border-border-dark p-1">
<div class="w-full h-full bg-slate-800 rounded flex items-center justify-center">
<span class="material-icons text-slate-600 text-sm">science</span>
</div>
</div>
<span class="font-medium">Active Dry Yeast</span>
</div>
</td>
<td class="px-6 py-4 font-mono text-xs text-slate-500">YS-DRY-50</td>
<td class="px-6 py-4"><span class="px-2 py-1 rounded bg-slate-800 text-slate-400 text-xs">Leavening</span></td>
<td class="px-6 py-4">
<div class="flex flex-col gap-1.5 min-w-[140px]">
<div class="flex justify-between text-xs mb-1">
<span class="text-emerald-500 font-bold">45kg</span>
<span class="text-slate-500">Min: 10kg</span>
</div>
<div class="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
<div class="h-full bg-emerald-500 w-[85%]"></div>
</div>
</div>
</td>
<td class="px-6 py-4 text-slate-400 text-sm">kg</td>
<td class="px-6 py-4">
<span class="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">Healthy</span>
</td>
<td class="px-6 py-4 text-right">
<button class="text-slate-500 hover:text-primary transition-colors">
<span class="material-icons">more_vert</span>
</button>
</td>
</tr>
<!-- Row 4: Sea Salt (Healthy) -->
<tr class="hover:bg-white/5 transition-colors group">
<td class="px-6 py-4">
<div class="flex items-center gap-3">
<div class="w-10 h-10 rounded bg-background-dark border border-border-dark p-1">
<div class="w-full h-full bg-slate-800 rounded flex items-center justify-center">
<span class="material-icons text-slate-600 text-sm">water_drop</span>
</div>
</div>
<span class="font-medium">Fine Sea Salt</span>
</div>
</td>
<td class="px-6 py-4 font-mono text-xs text-slate-500">SLT-04-F</td>
<td class="px-6 py-4"><span class="px-2 py-1 rounded bg-slate-800 text-slate-400 text-xs">Pantry</span></td>
<td class="px-6 py-4">
<div class="flex flex-col gap-1.5 min-w-[140px]">
<div class="flex justify-between text-xs mb-1">
<span class="text-emerald-500 font-bold">120kg</span>
<span class="text-slate-500">Min: 50kg</span>
</div>
<div class="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
<div class="h-full bg-emerald-500 w-[100%]"></div>
</div>
</div>
</td>
<td class="px-6 py-4 text-slate-400 text-sm">kg</td>
<td class="px-6 py-4">
<span class="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">Healthy</span>
</td>
<td class="px-6 py-4 text-right">
<button class="text-slate-500 hover:text-primary transition-colors">
<span class="material-icons">more_vert</span>
</button>
</td>
</tr>
</tbody>
</table>
</div>
<!-- Modal Overlay -->
<div class="absolute inset-0 bg-background-dark/80 backdrop-blur-sm z-50 flex items-center justify-center p-6">
<div class="bg-surface-dark border border-border-dark w-full max-w-md rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden">
<div class="p-6 border-b border-border-dark flex justify-between items-center">
<div>
<h2 class="serif-title text-xl font-semibold">Quick Stock Adjust</h2>
<p class="text-slate-500 text-xs">Bread Flour • FL-B-105</p>
</div>
<button class="text-slate-500 hover:text-white">
<span class="material-icons">close</span>
</button>
</div>
<div class="p-6 space-y-5">
<div class="bg-amber-500/5 border border-amber-500/20 p-3 rounded text-amber-200 text-xs flex gap-2">
<span class="material-icons text-sm">info</span>
<span>This item is currently below its minimum threshold of 200kg.</span>
</div>
<div class="space-y-2">
<label class="block text-xs font-semibold text-slate-400 uppercase tracking-wider">Adjustment Quantity</label>
<div class="flex gap-2">
<div class="relative flex-1">
<input class="w-full bg-background-dark border border-border-dark rounded-lg py-3 px-4 text-white focus:ring-1 focus:ring-primary focus:border-primary" type="number" value="50"/>
<span class="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 text-sm">kg</span>
</div>
<div class="flex flex-col gap-1">
<button class="px-2 bg-background-dark border border-border-dark rounded hover:bg-border-dark text-slate-400">
<span class="material-icons text-xs">add</span>
</button>
<button class="px-2 bg-background-dark border border-border-dark rounded hover:bg-border-dark text-slate-400">
<span class="material-icons text-xs">remove</span>
</button>
</div>
</div>
</div>
<div class="space-y-2">
<label class="block text-xs font-semibold text-slate-400 uppercase tracking-wider">Reason for Adjustment</label>
<select class="w-full bg-background-dark border border-border-dark rounded-lg py-3 px-4 text-white focus:ring-1 focus:ring-primary focus:border-primary appearance-none">
<option>Correction / Manual Audit</option>
<option>Waste / Spillage</option>
<option>Damaged Goods</option>
<option>New Shipment (Quick Entry)</option>
<option>Internal Use</option>
</select>
</div>
<div class="space-y-2">
<label class="block text-xs font-semibold text-slate-400 uppercase tracking-wider">Notes (Optional)</label>
<textarea class="w-full bg-background-dark border border-border-dark rounded-lg py-2 px-4 text-white focus:ring-1 focus:ring-primary focus:border-primary text-sm h-20 resize-none" placeholder="e.g. Discovered dampness in bag #4"></textarea>
</div>
</div>
<div class="p-6 bg-background-dark/50 border-t border-border-dark flex gap-3">
<button class="flex-1 px-4 py-3 bg-slate-800 text-white font-semibold rounded-lg hover:bg-slate-700 transition-colors">
                            Cancel
                        </button>
<button class="flex-[2] px-4 py-3 bg-primary text-background-dark font-bold rounded-lg hover:brightness-110 shadow-lg shadow-primary/10 transition-all">
                            Confirm Adjustment
                        </button>
</div>
</div>
</div>
</div>
<!-- Footer Stats -->
<div class="mt-8 flex flex-col md:flex-row gap-8 items-start md:items-center justify-between text-slate-500 text-sm">
<div class="flex items-center gap-6">
<div class="flex items-center gap-2">
<span class="w-2 h-2 rounded-full bg-emerald-500"></span>
<span>Last Synced: 2 mins ago</span>
</div>
<div class="flex items-center gap-2">
<span class="w-2 h-2 rounded-full bg-primary"></span>
<span>Database: Production-Main</span>
</div>
</div>
<div class="flex items-center gap-4">
<span>Show:</span>
<select class="bg-transparent border-none focus:ring-0 text-slate-300 py-0 cursor-pointer">
<option>50 Rows</option>
<option>100 Rows</option>
<option>All Items</option>
</select>
<div class="flex items-center border border-border-dark rounded overflow-hidden">
<button class="px-3 py-1 bg-surface-dark border-r border-border-dark hover:bg-border-dark">
<span class="material-icons text-sm">chevron_left</span>
</button>
<span class="px-3 py-1 bg-surface-dark text-white font-medium">1</span>
<button class="px-3 py-1 bg-surface-dark border-l border-border-dark hover:bg-border-dark">
<span class="material-icons text-sm">chevron_right</span>
</button>
</div>
</div>
</div>
</main>
</body></html><!-- Image placeholders meta data --><!-- 
data-alt descriptions:
1. User profile avatar: Close-up of a professional baker's face
2. Material Icon Warehouse: A warehouse icon silhouette in gold
3. Product placeholder egg: Simple minimalist icon of an egg
4. Product placeholder grain: Simple minimalist icon of wheat or grain
5. Product placeholder science: Simple minimalist icon of a test tube for yeast
6. Product placeholder water_drop: Simple minimalist icon of a water drop representing salt
-->
      <!-- STITCH_HTML_END -->
    \ }} />
  );
};

export default Stock___Inventory_Overview;
