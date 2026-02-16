import React from 'react';

const Stock_Order_Request_Form_v2: React.FC = () => {
  return (
    <div dangerouslySetInnerHTML={{ __html: `
      <!-- STITCH_HTML_START -->
      <!DOCTYPE html>

<html class="dark" lang="en"><head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
<title>The Breakery - Stock Order Request</title>
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
                        "primary": "#c8a45b",
                        "background-light": "#f8f7f6",
                        "background-dark": "#0D0D0F", // Deep Onyx
                        "card-dark": "#1A1A1C",
                        "border-dark": "#2D2D30",
                    },
                    fontFamily: {
                        "display": ["Inter", "sans-serif"]
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
        }
        /* Custom scrollbar for a premium look */
        ::-webkit-scrollbar {
            width: 6px;
        }
        ::-webkit-scrollbar-track {
            background: #0D0D0F;
        }
        ::-webkit-scrollbar-thumb {
            background: #2D2D30;
            border-radius: 10px;
        }
        ::-webkit-scrollbar-thumb:hover {
            background: #c8a45b;
        }
        input:focus, select:focus, textarea:focus {
            outline: none !important;
            border-color: #c8a45b !important;
            box-shadow: 0 0 0 1px #c8a45b !important;
        }
    </style>
</head>
<body class="bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 min-h-screen font-display">
<!-- Header Navigation -->
<header class="border-b border-primary/10 bg-background-light dark:bg-background-dark/80 backdrop-blur-md sticky top-0 z-50">
<div class="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
<div class="flex items-center gap-3">
<div class="w-10 h-10 bg-primary flex items-center justify-center rounded-lg">
<span class="material-icons text-background-dark">bakery_dining</span>
</div>
<div>
<h1 class="text-xl font-bold tracking-tight text-primary uppercase">The Breakery</h1>
<p class="text-[10px] tracking-[0.2em] uppercase opacity-60">Boutique Française</p>
</div>
</div>
<div class="flex items-center gap-6">
<div class="text-right">
<p class="text-xs opacity-50 uppercase tracking-widest">Order Portal</p>
<p class="text-sm font-medium">Stock Management</p>
</div>
<div class="h-8 w-px bg-primary/20"></div>
<button class="flex items-center gap-2 text-sm opacity-70 hover:opacity-100 transition-opacity">
<span class="material-icons text-lg">account_circle</span>
<span>Admin</span>
</button>
</div>
</div>
</header>
<main class="max-w-7xl mx-auto px-6 py-10">
<!-- Title & Breadcrumb -->
<div class="mb-10">
<h2 class="text-3xl font-light text-slate-100">Stock Order <span class="text-primary font-semibold tracking-tight">Request</span></h2>
<p class="text-slate-500 mt-2">Create and dispatch a high-priority inventory request to your verified suppliers.</p>
</div>
<div class="grid grid-cols-12 gap-8">
<!-- Left Column: Form Details -->
<div class="col-span-12 lg:col-span-4 space-y-6">
<div class="bg-card-dark border border-border-dark rounded-xl p-6 shadow-2xl">
<h3 class="text-sm font-semibold uppercase tracking-widest text-primary mb-6 flex items-center gap-2">
<span class="material-icons text-sm">info</span> Order Metadata
                    </h3>
<div class="space-y-5">
<!-- Supplier Selection -->
<div>
<label class="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">Select Supplier</label>
<div class="relative">
<select class="w-full bg-background-dark border border-border-dark rounded-lg py-3 px-4 text-sm appearance-none focus:border-primary focus:ring-0 transition-all cursor-pointer">
<option value="">Choose a partner...</option>
<option value="moulin">Moulin de Provence</option>
<option value="lescure">Lescure Dairy Co.</option>
<option value="valrhona">Valrhona Chocolaterie</option>
<option value="bridor">Bridor Professional</option>
</select>
<span class="material-icons absolute right-3 top-3 text-primary pointer-events-none">expand_more</span>
</div>
</div>
<!-- Expected Date -->
<div>
<label class="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">Expected Delivery Date</label>
<div class="relative">
<input class="w-full bg-background-dark border border-border-dark rounded-lg py-3 px-4 text-sm focus:border-primary focus:ring-0 transition-all [color-scheme:dark]" type="date"/>
<span class="material-icons absolute right-3 top-3 text-primary pointer-events-none text-lg">calendar_today</span>
</div>
</div>
<!-- Reference Number -->
<div>
<label class="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">Order Reference Number</label>
<input class="w-full bg-background-dark border border-border-dark rounded-lg py-3 px-4 text-sm focus:border-primary focus:ring-0 transition-all" placeholder="e.g. BRK-2023-001" type="text"/>
</div>
</div>
</div>
<!-- Status Info Card -->
<div class="bg-primary/5 border border-primary/20 rounded-xl p-6">
<div class="flex items-start gap-4">
<span class="material-icons text-primary mt-1">verified_user</span>
<div>
<h4 class="text-sm font-semibold text-primary uppercase tracking-tight">Supply Chain Verified</h4>
<p class="text-xs text-slate-400 mt-1 leading-relaxed">Your order will be electronically signed and transmitted via encrypted channel to the chosen supplier upon submission.</p>
</div>
</div>
</div>
</div>
<!-- Right Column: Line Items -->
<div class="col-span-12 lg:col-span-8 space-y-6">
<div class="bg-card-dark border border-border-dark rounded-xl overflow-hidden shadow-2xl">
<div class="p-6 border-b border-border-dark flex justify-between items-center">
<h3 class="text-sm font-semibold uppercase tracking-widest text-primary flex items-center gap-2">
<span class="material-icons text-sm">list_alt</span> Order Line Items
                        </h3>
<button class="text-xs flex items-center gap-1 text-slate-400 hover:text-primary transition-colors">
<span class="material-icons text-sm">add</span> Add New Row
                        </button>
</div>
<div class="overflow-x-auto">
<table class="w-full text-left border-collapse">
<thead>
<tr class="bg-background-dark/50">
<th class="py-4 px-6 text-[10px] font-semibold text-slate-500 uppercase tracking-widest border-b border-border-dark">Item Name</th>
<th class="py-4 px-6 text-[10px] font-semibold text-slate-500 uppercase tracking-widest border-b border-border-dark w-24">Quantity</th>
<th class="py-4 px-6 text-[10px] font-semibold text-slate-500 uppercase tracking-widest border-b border-border-dark w-32">Unit</th>
<th class="py-4 px-6 text-[10px] font-semibold text-slate-500 uppercase tracking-widest border-b border-border-dark text-right">Est. Cost</th>
<th class="py-4 px-6 text-[10px] font-semibold text-slate-500 uppercase tracking-widest border-b border-border-dark w-16"></th>
</tr>
</thead>
<tbody class="divide-y divide-border-dark/50">
<!-- Row 1 -->
<tr class="hover:bg-primary/5 transition-colors group">
<td class="py-4 px-6">
<input class="w-full bg-transparent border-none p-0 text-sm focus:ring-0 text-slate-200" type="text" value="Flour T55 - Artisan Grind"/>
</td>
<td class="py-4 px-6">
<input class="w-full bg-transparent border-none p-0 text-sm focus:ring-0 text-slate-200" type="number" value="10"/>
</td>
<td class="py-4 px-6">
<select class="w-full bg-transparent border-none p-0 text-sm focus:ring-0 text-slate-200 cursor-pointer">
<option selected="">kg</option>
<option>liters</option>
<option>cases</option>
<option>units</option>
</select>
</td>
<td class="py-4 px-6 text-right font-medium text-slate-300">€ 42.00</td>
<td class="py-4 px-6 text-right">
<button class="text-slate-600 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100">
<span class="material-icons text-sm">delete_outline</span>
</button>
</td>
</tr>
<!-- Row 2 -->
<tr class="hover:bg-primary/5 transition-colors group">
<td class="py-4 px-6">
<input class="w-full bg-transparent border-none p-0 text-sm focus:ring-0 text-slate-200" type="text" value="Unsalted AOP Butter"/>
</td>
<td class="py-4 px-6">
<input class="w-full bg-transparent border-none p-0 text-sm focus:ring-0 text-slate-200" type="number" value="25"/>
</td>
<td class="py-4 px-6">
<select class="w-full bg-transparent border-none p-0 text-sm focus:ring-0 text-slate-200 cursor-pointer">
<option>kg</option>
<option>liters</option>
<option selected="">cases</option>
<option>units</option>
</select>
</td>
<td class="py-4 px-6 text-right font-medium text-slate-300">€ 312.50</td>
<td class="py-4 px-6 text-right">
<button class="text-slate-600 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100">
<span class="material-icons text-sm">delete_outline</span>
</button>
</td>
</tr>
<!-- Row 3 -->
<tr class="hover:bg-primary/5 transition-colors group">
<td class="py-4 px-6">
<input class="w-full bg-transparent border-none p-0 text-sm focus:ring-0 text-slate-500 italic" placeholder="Click to add item..." type="text"/>
</td>
<td class="py-4 px-6">
<input class="w-full bg-transparent border-none p-0 text-sm focus:ring-0 text-slate-500" placeholder="0" type="number"/>
</td>
<td class="py-4 px-6">
<select class="w-full bg-transparent border-none p-0 text-sm focus:ring-0 text-slate-500 cursor-pointer">
<option>kg</option>
<option>liters</option>
<option>cases</option>
<option>units</option>
</select>
</td>
<td class="py-4 px-6 text-right font-medium text-slate-500">€ 0.00</td>
<td class="py-4 px-6 text-right">
<button class="text-slate-600 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100">
<span class="material-icons text-sm">delete_outline</span>
</button>
</td>
</tr>
</tbody>
</table>
</div>
</div>
<!-- Footer Section: Special Instructions -->
<div class="bg-card-dark border border-border-dark rounded-xl p-6 shadow-2xl">
<label class="block text-xs font-semibold text-primary uppercase tracking-widest mb-4 flex items-center gap-2">
<span class="material-icons text-sm">notes</span> Special Instructions
                    </label>
<textarea class="w-full bg-background-dark border border-border-dark rounded-lg py-3 px-4 text-sm focus:border-primary focus:ring-0 transition-all resize-none" placeholder="Add specific delivery requirements, substitutions, or gate access codes for the supplier..." rows="3"></textarea>
</div>
<!-- Totals & Actions -->
<div class="flex flex-col md:flex-row items-center justify-between gap-6 p-8 bg-card-dark border border-border-dark rounded-xl shadow-2xl">
<div class="flex items-center gap-12">
<div>
<p class="text-[10px] font-semibold text-slate-500 uppercase tracking-widest mb-1">Total Items</p>
<p class="text-2xl font-light text-slate-100">35 <span class="text-xs text-slate-500 font-normal ml-1 tracking-tight">Units</span></p>
</div>
<div class="h-10 w-px bg-border-dark hidden md:block"></div>
<div>
<p class="text-[10px] font-semibold text-slate-500 uppercase tracking-widest mb-1">Estimated Order Value</p>
<p class="text-3xl font-bold text-primary">€ 354.50</p>
</div>
</div>
<div class="w-full md:w-auto">
<button class="w-full md:w-auto bg-primary hover:bg-primary/90 text-background-dark font-bold px-10 py-4 rounded-lg flex items-center justify-center gap-3 transition-all transform active:scale-[0.98] uppercase tracking-widest text-sm">
<span>Send Order Request</span>
<span class="material-icons text-lg">send</span>
</button>
</div>
</div>
</div>
</div>
</main>
<!-- Footer Meta -->
<footer class="max-w-7xl mx-auto px-6 py-12 border-t border-border-dark mt-10">
<div class="flex flex-col md:flex-row justify-between items-center opacity-40 text-[10px] uppercase tracking-[0.2em]">
<p>© 2024 The Breakery Artisan Bakery Group</p>
<div class="flex gap-8 mt-4 md:mt-0">
<a class="hover:text-primary transition-colors" href="#">Supplier Directory</a>
<a class="hover:text-primary transition-colors" href="#">Inventory Policy</a>
<a class="hover:text-primary transition-colors" href="#">Help Center</a>
</div>
</div>
</footer>
</body></html>
      <!-- STITCH_HTML_END -->
    ` }} />
  );
};

export default Stock_Order_Request_Form_v2;
