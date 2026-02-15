import React from 'react';

const Internal_Stock_Transfers: React.FC = () => {
  return (
    <div dangerouslySetInnerHTML={{ __html: \
      <!-- STITCH_HTML_START -->
      <!DOCTYPE html>

<html class="dark" lang="en"><head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
<title>Internal Stock Transfers | The Breakery</title>
<script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&amp;family=Playfair+Display:wght@400;500;600;700&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<script id="tailwind-config">
      tailwind.config = {
        darkMode: "class",
        theme: {
          extend: {
            colors: {
              "primary": "#e6a219",
              "background-light": "#f8f7f6",
              "background-dark": "#0D0D0F",
              "surface-dark": "#111113",
              "item-dark": "#1A1A1D",
            },
            fontFamily: {
              "sans": ["Inter", "sans-serif"],
              "display": ["Playfair Display", "serif"]
            },
            borderRadius: {"DEFAULT": "0.25rem", "lg": "0.5rem", "xl": "0.75rem", "full": "9999px"},
          },
        },
      }
    </script>
<style>
        body {
            background-color: #0D0D0F;
            font-family: 'Inter', sans-serif;
            color: #d1d5db;
        }
        .font-display { font-family: 'Playfair Display', serif; }
        .custom-scrollbar::-webkit-scrollbar {
            width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
            background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
            background: #2d2d30;
            border-radius: 10px;
        }
        .table-row-hover:hover {
            background-color: #1A1A1D;
        }
    </style>
</head>
<body class="bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 h-screen flex overflow-hidden">
<!-- LEFT SIDEBAR (260px) -->
<aside class="w-[260px] flex-shrink-0 bg-surface-dark border-r border-primary/10 flex flex-col h-full">
<div class="p-8">
<div class="flex items-center gap-3 mb-10">
<div class="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
<span class="material-icons text-background-dark">bakery_dining</span>
</div>
<div>
<h1 class="font-display text-xl font-bold text-white tracking-tight leading-none">The Breakery</h1>
<span class="text-[10px] uppercase tracking-widest text-primary font-bold">Premium Logistics</span>
</div>
</div>
<nav class="space-y-1">
<a class="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-all group" href="#">
<span class="material-icons text-xl group-hover:text-primary transition-colors">dashboard</span>
<span class="text-sm font-medium">Dashboard</span>
</a>
<a class="flex items-center gap-3 px-4 py-3 rounded-lg bg-primary/10 text-primary transition-all" href="#">
<span class="material-icons text-xl">swap_horiz</span>
<span class="text-sm font-medium">Stock Transfers</span>
</a>
<a class="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-all group" href="#">
<span class="material-icons text-xl group-hover:text-primary transition-colors">inventory_2</span>
<span class="text-sm font-medium">Inventory</span>
</a>
<a class="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-all group" href="#">
<span class="material-icons text-xl group-hover:text-primary transition-colors">local_shipping</span>
<span class="text-sm font-medium">Deliveries</span>
</a>
<a class="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-all group" href="#">
<span class="material-icons text-xl group-hover:text-primary transition-colors">analytics</span>
<span class="text-sm font-medium">Reports</span>
</a>
</nav>
</div>
<div class="mt-auto p-6 border-t border-white/5">
<div class="flex items-center gap-3">
<img class="w-10 h-10 rounded-full border-2 border-primary/20 object-cover" data-alt="Profile picture of bakery manager" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDWkJtt6o7YuUT3R7Wyd2cKem6esFdVycPjK29Z2rGT7Hw21c59OJrD-d4MJ0TdDeJqpV8SnHzis34G8_Io4wdBGGAe9atWTph9xiRodCsKL8rlFlHNh4hoNUJAvwe062Q__l8MWO-1gSbQMp497O-XYJ9P-EE4NshIIchxFS9N0IpUDGc0sakUELHwdPhZR4JUErha-H6t1w16XwE3H847yWluiH16-7avyQVeS8ckOLQzEknv5G4sRqJK36qABg7voS9k78gdFlwZ"/>
<div class="overflow-hidden">
<p class="text-sm font-semibold text-white truncate">Marcus Vane</p>
<p class="text-xs text-slate-500 truncate">Logistics Director</p>
</div>
</div>
</div>
</aside>
<!-- MAIN CONTENT AREA -->
<main class="flex-grow flex flex-col min-w-0 bg-background-dark">
<!-- HEADER -->
<header class="h-20 border-b border-white/5 px-8 flex items-center justify-between">
<div>
<nav class="flex text-xs text-slate-500 gap-2 mb-1">
<span class="hover:text-primary cursor-pointer">Logistics</span>
<span>/</span>
<span class="text-primary font-medium">Stock Transfers</span>
</nav>
<h2 class="font-display text-2xl text-white font-medium">Internal Stock Transfers</h2>
</div>
<div class="flex items-center gap-4">
<div class="relative">
<span class="material-icons absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm">search</span>
<input class="bg-surface-dark border-white/5 rounded-lg pl-10 pr-4 py-2 text-sm focus:ring-primary focus:border-primary w-64 text-slate-300" placeholder="Search transfers..." type="text"/>
</div>
<button class="w-10 h-10 rounded-lg bg-surface-dark border border-white/5 flex items-center justify-center text-slate-400 hover:text-primary hover:border-primary/50 transition-all">
<span class="material-icons text-xl">notifications</span>
</button>
</div>
</header>
<!-- CONTENT -->
<div class="p-8 overflow-y-auto custom-scrollbar flex-grow">
<!-- STATS PREVIEW -->
<div class="grid grid-cols-4 gap-6 mb-8">
<div class="bg-surface-dark p-6 rounded-xl border border-white/5">
<p class="text-xs text-slate-500 uppercase tracking-wider mb-2">Total Transfers (MoM)</p>
<div class="flex items-end justify-between">
<span class="text-2xl font-semibold text-white">482</span>
<span class="text-emerald-500 text-xs font-medium flex items-center bg-emerald-500/10 px-2 py-0.5 rounded-full">+12%</span>
</div>
</div>
<div class="bg-surface-dark p-6 rounded-xl border border-white/5">
<p class="text-xs text-slate-500 uppercase tracking-wider mb-2">In Transit</p>
<div class="flex items-end justify-between">
<span class="text-2xl font-semibold text-white">18</span>
<span class="text-sky-500 text-xs font-medium flex items-center bg-sky-500/10 px-2 py-0.5 rounded-full">Active</span>
</div>
</div>
<div class="bg-surface-dark p-6 rounded-xl border border-white/5">
<p class="text-xs text-slate-500 uppercase tracking-wider mb-2">Requests Pending</p>
<div class="flex items-end justify-between">
<span class="text-2xl font-semibold text-white">04</span>
<span class="text-primary text-xs font-medium flex items-center bg-primary/10 px-2 py-0.5 rounded-full">Urgent</span>
</div>
</div>
<div class="bg-surface-dark p-6 rounded-xl border border-white/5">
<p class="text-xs text-slate-500 uppercase tracking-wider mb-2">Loss Rate</p>
<div class="flex items-end justify-between">
<span class="text-2xl font-semibold text-white">0.42%</span>
<span class="text-slate-500 text-xs font-medium flex items-center bg-white/5 px-2 py-0.5 rounded-full">-2.1%</span>
</div>
</div>
</div>
<!-- TRANSFER HISTORY TABLE -->
<div class="bg-surface-dark rounded-xl border border-white/5 overflow-hidden">
<div class="p-6 border-b border-white/5 flex justify-between items-center">
<h3 class="font-display text-lg text-white">Transfer History</h3>
<div class="flex gap-2">
<button class="px-3 py-1.5 text-xs bg-item-dark border border-white/5 rounded hover:border-primary/50 text-slate-300">Export CSV</button>
<button class="px-3 py-1.5 text-xs bg-item-dark border border-white/5 rounded hover:border-primary/50 text-slate-300">Filters</button>
</div>
</div>
<table class="w-full text-left text-sm">
<thead>
<tr class="bg-item-dark/50 text-slate-500 uppercase text-[10px] tracking-widest font-bold">
<th class="px-6 py-4">Date</th>
<th class="px-6 py-4">Transfer ID</th>
<th class="px-6 py-4">From Location</th>
<th class="px-6 py-4">To Location</th>
<th class="px-6 py-4 text-center">Total Items</th>
<th class="px-6 py-4">Status</th>
<th class="px-6 py-4 text-right">Action</th>
</tr>
</thead>
<tbody class="divide-y divide-white/5">
<tr class="table-row-hover transition-colors">
<td class="px-6 py-4 text-slate-400">Oct 24, 2023</td>
<td class="px-6 py-4 font-mono font-medium text-white">#TR-4920</td>
<td class="px-6 py-4">
<div class="flex items-center gap-2 text-slate-300">
<span class="w-2 h-2 rounded-full bg-emerald-500"></span>
                                    Main Kitchen
                                </div>
</td>
<td class="px-6 py-4 text-slate-300">Front Display</td>
<td class="px-6 py-4 text-center text-white">124</td>
<td class="px-6 py-4">
<span class="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-500 text-[10px] font-bold uppercase tracking-wide border border-emerald-500/20">Completed</span>
</td>
<td class="px-6 py-4 text-right">
<button class="text-slate-500 hover:text-primary"><span class="material-icons text-lg">more_vert</span></button>
</td>
</tr>
<tr class="table-row-hover transition-colors">
<td class="px-6 py-4 text-slate-400">Oct 25, 2023</td>
<td class="px-6 py-4 font-mono font-medium text-white">#TR-4921</td>
<td class="px-6 py-4">
<div class="flex items-center gap-2 text-slate-300">
<span class="w-2 h-2 rounded-full bg-emerald-500"></span>
                                    Main Kitchen
                                </div>
</td>
<td class="px-6 py-4 text-slate-300">Barista Station</td>
<td class="px-6 py-4 text-center text-white">45</td>
<td class="px-6 py-4">
<span class="px-2.5 py-1 rounded-full bg-sky-500/10 text-sky-500 text-[10px] font-bold uppercase tracking-wide border border-sky-500/20">In Transit</span>
</td>
<td class="px-6 py-4 text-right">
<button class="text-slate-500 hover:text-primary"><span class="material-icons text-lg">more_vert</span></button>
</td>
</tr>
<tr class="table-row-hover transition-colors">
<td class="px-6 py-4 text-slate-400">Oct 25, 2023</td>
<td class="px-6 py-4 font-mono font-medium text-white">#TR-4922</td>
<td class="px-6 py-4">
<div class="flex items-center gap-2 text-slate-300">
<span class="w-2 h-2 rounded-full bg-amber-500"></span>
                                    Upper Warehouse
                                </div>
</td>
<td class="px-6 py-4 text-slate-300">Main Kitchen</td>
<td class="px-6 py-4 text-center text-white">210</td>
<td class="px-6 py-4">
<span class="px-2.5 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-wide border border-primary/20">Requested</span>
</td>
<td class="px-6 py-4 text-right">
<button class="text-slate-500 hover:text-primary"><span class="material-icons text-lg">more_vert</span></button>
</td>
</tr>
<tr class="table-row-hover transition-colors">
<td class="px-6 py-4 text-slate-400">Oct 26, 2023</td>
<td class="px-6 py-4 font-mono font-medium text-white">#TR-4923</td>
<td class="px-6 py-4">
<div class="flex items-center gap-2 text-slate-300">
<span class="w-2 h-2 rounded-full bg-emerald-500"></span>
                                    Main Kitchen
                                </div>
</td>
<td class="px-6 py-4 text-slate-300">Event Space B</td>
<td class="px-6 py-4 text-center text-white">56</td>
<td class="px-6 py-4">
<span class="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-500 text-[10px] font-bold uppercase tracking-wide border border-emerald-500/20">Completed</span>
</td>
<td class="px-6 py-4 text-right">
<button class="text-slate-500 hover:text-primary"><span class="material-icons text-lg">more_vert</span></button>
</td>
</tr>
<tr class="table-row-hover transition-colors">
<td class="px-6 py-4 text-slate-400">Oct 26, 2023</td>
<td class="px-6 py-4 font-mono font-medium text-white">#TR-4924</td>
<td class="px-6 py-4">
<div class="flex items-center gap-2 text-slate-300">
<span class="w-2 h-2 rounded-full bg-emerald-500"></span>
                                    Main Kitchen
                                </div>
</td>
<td class="px-6 py-4 text-slate-300">Front Display</td>
<td class="px-6 py-4 text-center text-white">82</td>
<td class="px-6 py-4">
<span class="px-2.5 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-wide border border-primary/20">Requested</span>
</td>
<td class="px-6 py-4 text-right">
<button class="text-slate-500 hover:text-primary"><span class="material-icons text-lg">more_vert</span></button>
</td>
</tr>
</tbody>
</table>
<div class="p-4 bg-item-dark/30 flex items-center justify-between text-xs text-slate-500">
<p>Showing 5 of 482 transfers</p>
<div class="flex gap-2">
<button class="px-3 py-1 rounded border border-white/5 hover:bg-white/5">Previous</button>
<button class="px-3 py-1 rounded bg-primary text-background-dark font-bold">1</button>
<button class="px-3 py-1 rounded border border-white/5 hover:bg-white/5">2</button>
<button class="px-3 py-1 rounded border border-white/5 hover:bg-white/5">Next</button>
</div>
</div>
</div>
</div>
</main>
<!-- NEW TRANSFER SIDEBAR (320px) -->
<aside class="w-[320px] flex-shrink-0 bg-surface-dark border-l border-primary/10 flex flex-col h-full">
<div class="p-6 border-b border-white/5 bg-item-dark/50">
<h3 class="font-display text-lg text-white mb-1">New Transfer</h3>
<p class="text-xs text-slate-500">Initialize stock movement between stations.</p>
</div>
<div class="flex-grow p-6 overflow-y-auto custom-scrollbar space-y-6">
<!-- Origin Dropdown -->
<div>
<label class="block text-[10px] font-bold uppercase tracking-widest text-primary mb-2">Origin</label>
<div class="relative">
<select class="w-full bg-item-dark border border-white/10 rounded-lg py-2.5 px-4 text-sm text-slate-300 appearance-none focus:ring-1 focus:ring-primary focus:border-primary">
<option>Main Kitchen</option>
<option>Upper Warehouse</option>
<option>Cold Storage</option>
</select>
<span class="material-icons absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none">expand_more</span>
</div>
</div>
<!-- Destination Dropdown -->
<div>
<label class="block text-[10px] font-bold uppercase tracking-widest text-primary mb-2">Destination</label>
<div class="relative">
<select class="w-full bg-item-dark border border-white/10 rounded-lg py-2.5 px-4 text-sm text-slate-300 appearance-none focus:ring-1 focus:ring-primary focus:border-primary">
<option>Front Display</option>
<option>Barista Station</option>
<option>Event Space B</option>
</select>
<span class="material-icons absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none">expand_more</span>
</div>
</div>
<!-- Add Items Search -->
<div>
<label class="block text-[10px] font-bold uppercase tracking-widest text-primary mb-2">Add Items</label>
<div class="relative mb-3">
<span class="material-icons absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm">search</span>
<input class="w-full bg-item-dark border border-white/10 rounded-lg pl-10 pr-4 py-2 text-sm text-slate-300 focus:ring-1 focus:ring-primary focus:border-primary" placeholder="Search product..." type="text"/>
</div>
<!-- Selected Item Preview -->
<div class="bg-item-dark/40 border border-white/5 rounded-lg p-3 space-y-3">
<div class="flex items-center justify-between">
<div class="flex items-center gap-2">
<span class="w-2 h-2 rounded-full bg-primary"></span>
<span class="text-xs text-white">Artisan Sourdough</span>
</div>
<div class="flex items-center gap-2">
<button class="w-6 h-6 rounded bg-white/5 flex items-center justify-center text-slate-400 hover:text-white">-</button>
<span class="text-xs font-bold text-white w-4 text-center">24</span>
<button class="w-6 h-6 rounded bg-white/5 flex items-center justify-center text-slate-400 hover:text-white">+</button>
</div>
</div>
<div class="flex items-center justify-between">
<div class="flex items-center gap-2">
<span class="w-2 h-2 rounded-full bg-primary"></span>
<span class="text-xs text-white">Butter Croissants</span>
</div>
<div class="flex items-center gap-2">
<button class="w-6 h-6 rounded bg-white/5 flex items-center justify-center text-slate-400 hover:text-white">-</button>
<span class="text-xs font-bold text-white w-4 text-center">12</span>
<button class="w-6 h-6 rounded bg-white/5 flex items-center justify-center text-slate-400 hover:text-white">+</button>
</div>
</div>
</div>
</div>
<!-- Batch Selection -->
<div>
<label class="block text-[10px] font-bold uppercase tracking-widest text-primary mb-2">Production Batch</label>
<div class="relative">
<select class="w-full bg-item-dark border border-white/10 rounded-lg py-2.5 px-4 text-sm text-slate-300 appearance-none focus:ring-1 focus:ring-primary focus:border-primary">
<option>Morning Run #829 (6:00 AM)</option>
<option>Night Prep #828 (11:00 PM)</option>
<option>Emergency Bake #827 (1:00 PM)</option>
</select>
<span class="material-icons absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none">history</span>
</div>
</div>
<!-- Shipment Memo -->
<div>
<label class="block text-[10px] font-bold uppercase tracking-widest text-primary mb-2">Shipment Memo</label>
<textarea class="w-full bg-item-dark border border-white/10 rounded-lg p-4 text-sm text-slate-300 focus:ring-1 focus:ring-primary focus:border-primary resize-none" placeholder="Additional delivery notes..." rows="3"></textarea>
</div>
</div>
<!-- FOOTER ACTIONS -->
<div class="p-6 border-t border-white/5 bg-item-dark/30 space-y-3">
<button class="w-full bg-primary hover:bg-primary/90 text-background-dark font-bold py-3 rounded-lg transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/10">
<span class="material-icons text-lg">add_circle</span>
                Create Transfer
            </button>
<button class="w-full bg-white/5 hover:bg-white/10 text-white font-medium py-3 rounded-lg border border-white/10 transition-all flex items-center justify-center gap-2">
<span class="material-icons text-lg">description</span>
                Shipment Memo
            </button>
</div>
</aside>
</body></html>
      <!-- STITCH_HTML_END -->
    \ }} />
  );
};

export default Internal_Stock_Transfers;
