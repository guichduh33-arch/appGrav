import React from 'react';

const Product_Creator: React.FC = () => {
  return (
    <div dangerouslySetInnerHTML={{ __html: `
      <!-- STITCH_HTML_START -->
      <!DOCTYPE html>

<html class="dark" lang="en"><head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
<title>The Breakery - Product Creator</title>
<script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&amp;family=Playfair+Display:wght@600;700&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/icon?family=Material+Icons+Outlined" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<script id="tailwind-config">
        tailwind.config = {
            darkMode: "class",
            theme: {
                extend: {
                    colors: {
                        "primary": "#f2d00d",
                        "background-light": "#f8f8f5",
                        "background-dark": "#1A1A1D",
                    },
                    fontFamily: {
                        "display": ["Inter", "sans-serif"],
                        "heading": ["Playfair Display", "serif"]
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
            background-color: #1A1A1D;
        }
        .heading-font {
            font-family: 'Playfair Display', serif;
        }
        input::placeholder {
            color: rgba(255, 255, 255, 0.3);
        }
        .custom-scrollbar::-webkit-scrollbar {
            width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
            background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
            background: #333;
            border-radius: 10px;
        }
    </style>
</head>
<body class="bg-background-light dark:bg-background-dark text-slate-200 antialiased h-screen flex flex-col overflow-hidden">
<!-- Header -->
<header class="border-b border-white/10 bg-background-dark/80 backdrop-blur-md z-10 px-8 py-4 flex items-center justify-between">
<div class="flex items-center gap-4">
<div class="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
<span class="material-icons-outlined text-background-dark font-bold">bakery_dining</span>
</div>
<div>
<h1 class="heading-font text-xl font-bold text-white leading-tight">The Breakery</h1>
<p class="text-xs text-white/50 tracking-widest uppercase">Product Management</p>
</div>
</div>
<div class="flex items-center gap-6">
<div class="flex items-center gap-2 text-sm text-white/60">
<span class="material-icons-outlined text-sm">history</span>
<span>Last saved: 2 mins ago</span>
</div>
<div class="h-8 w-[1px] bg-white/10"></div>
<button class="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center hover:bg-white/5 transition-colors">
<span class="material-icons-outlined text-lg">notifications</span>
</button>
</div>
</header>
<!-- Main Content Area -->
<main class="flex-1 overflow-hidden flex">
<!-- Left Column: Form (65%) -->
<div class="w-[65%] overflow-y-auto custom-scrollbar p-8 bg-background-dark">
<div class="max-w-4xl mx-auto space-y-12 pb-24">
<!-- Page Title -->
<div>
<h2 class="heading-font text-3xl text-white mb-2">Create New Product</h2>
<p class="text-white/60">Define the specifications, pricing, and ingredients for your artisanal creation.</p>
</div>
<!-- Basic Info Section -->
<section class="space-y-6">
<div class="flex items-center gap-3 pb-2 border-b border-white/5">
<span class="material-icons-outlined text-primary">info</span>
<h3 class="heading-font text-xl text-white">Basic Information</h3>
</div>
<div class="grid grid-cols-2 gap-6">
<div class="col-span-2 sm:col-span-1">
<label class="block text-xs font-semibold text-white/50 uppercase tracking-wider mb-2">Product Name</label>
<input class="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-primary focus:ring-1 focus:ring-primary transition-all outline-none" type="text" value="Sourdough Baguette"/>
</div>
<div class="col-span-2 sm:col-span-1">
<label class="block text-xs font-semibold text-white/50 uppercase tracking-wider mb-2">SKU / Identifier</label>
<div class="flex gap-2">
<input class="flex-1 bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none" type="text" value="BRD-SOU-004"/>
<button class="px-4 bg-white/5 border border-white/10 rounded-lg text-white/60 hover:text-white hover:bg-white/10">
<span class="material-icons-outlined">refresh</span>
</button>
</div>
</div>
<div class="col-span-2">
<label class="block text-xs font-semibold text-white/50 uppercase tracking-wider mb-2">Category</label>
<select class="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none appearance-none">
<option>Artisanal Breads</option>
<option>Pastries &amp; Danishes</option>
<option>Coffee &amp; Beverages</option>
<option>Special Occasion Cakes</option>
</select>
</div>
</div>
</section>
<!-- Pricing Section -->
<section class="space-y-6">
<div class="flex items-center gap-3 pb-2 border-b border-white/5">
<span class="material-icons-outlined text-primary">payments</span>
<h3 class="heading-font text-xl text-white">Pricing &amp; Margins</h3>
</div>
<div class="bg-primary/5 border border-primary/20 rounded-xl p-6 flex items-center justify-between">
<div class="space-y-1">
<label class="block text-xs font-semibold text-primary/80 uppercase tracking-wider">Selling Price</label>
<div class="flex items-center">
<span class="text-4xl font-bold text-primary mr-2">\\$</span>
<input class="bg-transparent text-5xl font-bold text-primary border-none focus:ring-0 w-32 p-0" type="text" value="8.50"/>
</div>
</div>
<div class="h-16 w-[1px] bg-primary/20"></div>
<div class="text-center px-8">
<label class="block text-xs font-semibold text-white/50 uppercase tracking-wider mb-1">Total Cost (COGS)</label>
<p class="text-2xl font-semibold text-white">\\$2.15</p>
</div>
<div class="h-16 w-[1px] bg-primary/20"></div>
<div class="text-right">
<label class="block text-xs font-semibold text-white/50 uppercase tracking-wider mb-1">Profit Margin</label>
<div class="inline-flex items-center px-3 py-1 bg-green-500/20 text-green-400 rounded-full font-bold text-lg">
                                74.7%
                            </div>
</div>
</div>
</section>
<!-- Inventory Section -->
<section class="space-y-6">
<div class="flex items-center gap-3 pb-2 border-b border-white/5">
<span class="material-icons-outlined text-primary">inventory_2</span>
<h3 class="heading-font text-xl text-white">Inventory Management</h3>
</div>
<div class="grid grid-cols-3 gap-6 items-end">
<div class="col-span-1">
<label class="block text-xs font-semibold text-white/50 uppercase tracking-wider mb-2">Unit of Measure</label>
<select class="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-primary outline-none">
<option>Each (ea)</option>
<option>Kilogram (kg)</option>
<option>Gram (g)</option>
</select>
</div>
<div class="col-span-1">
<label class="block text-xs font-semibold text-white/50 uppercase tracking-wider mb-2">Min. Stock Level</label>
<input class="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-primary outline-none" type="number" value="12"/>
</div>
<div class="col-span-1 flex items-center h-[50px] gap-3">
<label class="relative inline-flex items-center cursor-pointer">
<input checked="" class="sr-only peer" type="checkbox"/>
<div class="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white/60 after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
<span class="ml-3 text-sm font-medium text-white/70 tracking-wide">Track Inventory</span>
</label>
</div>
</div>
</section>
<!-- Recipe / BOM Section -->
<section class="space-y-6">
<div class="flex items-center justify-between pb-2 border-b border-white/5">
<div class="flex items-center gap-3">
<span class="material-icons-outlined text-primary">restaurant_menu</span>
<h3 class="heading-font text-xl text-white">Recipe / BOM</h3>
</div>
<button class="flex items-center gap-2 text-primary hover:text-primary/80 text-sm font-semibold">
<span class="material-icons-outlined text-lg">add_circle_outline</span>
                            Add Ingredient
                        </button>
</div>
<div class="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
<table class="w-full text-left border-collapse">
<thead>
<tr class="bg-white/5">
<th class="px-6 py-4 text-xs font-bold text-white/40 uppercase tracking-widest">Ingredient</th>
<th class="px-6 py-4 text-xs font-bold text-white/40 uppercase tracking-widest text-center">Qty</th>
<th class="px-6 py-4 text-xs font-bold text-white/40 uppercase tracking-widest">Unit</th>
<th class="px-6 py-4 text-xs font-bold text-white/40 uppercase tracking-widest text-right">Cost</th>
<th class="px-6 py-4 w-12"></th>
</tr>
</thead>
<tbody class="divide-y divide-white/5">
<tr class="group hover:bg-white/5 transition-colors">
<td class="px-6 py-4 text-white font-medium">Organic Bread Flour</td>
<td class="px-6 py-4 text-center">
<input class="w-16 bg-white/10 border-none rounded text-center text-white py-1 text-sm focus:ring-1 focus:ring-primary" type="text" value="500"/>
</td>
<td class="px-6 py-4 text-white/60 text-sm">g</td>
<td class="px-6 py-4 text-right text-white font-mono">\\$1.12</td>
<td class="px-6 py-4">
<button class="text-white/20 group-hover:text-red-400 transition-colors">
<span class="material-icons-outlined text-lg">delete</span>
</button>
</td>
</tr>
<tr class="group hover:bg-white/5 transition-colors">
<td class="px-6 py-4 text-white font-medium">Filtered Spring Water</td>
<td class="px-6 py-4 text-center">
<input class="w-16 bg-white/10 border-none rounded text-center text-white py-1 text-sm focus:ring-1 focus:ring-primary" type="text" value="350"/>
</td>
<td class="px-6 py-4 text-white/60 text-sm">ml</td>
<td class="px-6 py-4 text-right text-white font-mono">\\$0.05</td>
<td class="px-6 py-4">
<button class="text-white/20 group-hover:text-red-400 transition-colors">
<span class="material-icons-outlined text-lg">delete</span>
</button>
</td>
</tr>
<tr class="group hover:bg-white/5 transition-colors">
<td class="px-6 py-4 text-white font-medium">Sea Salt (Fine)</td>
<td class="px-6 py-4 text-center">
<input class="w-16 bg-white/10 border-none rounded text-center text-white py-1 text-sm focus:ring-1 focus:ring-primary" type="text" value="10"/>
</td>
<td class="px-6 py-4 text-white/60 text-sm">g</td>
<td class="px-6 py-4 text-right text-white font-mono">\\$0.18</td>
<td class="px-6 py-4">
<button class="text-white/20 group-hover:text-red-400 transition-colors">
<span class="material-icons-outlined text-lg">delete</span>
</button>
</td>
</tr>
<tr class="group hover:bg-white/5 transition-colors">
<td class="px-6 py-4 text-white font-medium">Sourdough Starter (House)</td>
<td class="px-6 py-4 text-center">
<input class="w-16 bg-white/10 border-none rounded text-center text-white py-1 text-sm focus:ring-1 focus:ring-primary" type="text" value="100"/>
</td>
<td class="px-6 py-4 text-white/60 text-sm">g</td>
<td class="px-6 py-4 text-right text-white font-mono">\\$0.80</td>
<td class="px-6 py-4">
<button class="text-white/20 group-hover:text-red-400 transition-colors">
<span class="material-icons-outlined text-lg">delete</span>
</button>
</td>
</tr>
</tbody>
</table>
</div>
</section>
</div>
</div>
<!-- Right Column: Live POS Preview (35%) -->
<div class="w-[35%] bg-white/5 border-l border-white/10 p-12 flex flex-col items-center justify-start overflow-y-auto">
<div class="w-full max-w-sm sticky top-0 space-y-10">
<div class="text-center">
<span class="text-xs font-bold text-white/30 uppercase tracking-[0.3em] mb-4 block">Live POS Preview</span>
<div class="h-[1px] w-12 bg-primary/40 mx-auto"></div>
</div>
<!-- POS Card Mockup -->
<div class="bg-background-dark border border-white/10 rounded-2xl overflow-hidden shadow-2xl transform scale-100 hover:scale-[1.02] transition-transform duration-300">
<div class="relative h-56 w-full">
<img class="w-full h-full object-cover grayscale-[20%] brightness-75" data-alt="Golden crusty sourdough baguette on a rustic wooden board" src="https://lh3.googleusercontent.com/aida-public/AB6AXuB2H2DKU7MJUeMs1GbEEGAI7VYbY1lpdMG2hox7Za_r_DQuuw9OTifwXNwTc2BM0EobrHUImNbIgK57RmVu3vOg-H6xPoKLdEpehA2zv4dLhz3GSwtRNwqKAR6JkGRVj1xeGhYmDdt12FHy60-QyK1lRDuc28IdW5uvY7Ioew_zU1cHcdqNDmzAlDs6kW4GZeiV3ivR1dKhFcz91VeRCoquyrx5LQViv1gspEhFLCtlpo57uHHdtUpqp6q-TCon_jBWrbGJyLmcUeNR"/>
<div class="absolute inset-0 bg-gradient-to-t from-background-dark via-transparent to-transparent"></div>
<div class="absolute bottom-4 left-4">
<span class="inline-flex items-center px-2 py-0.5 rounded bg-primary text-background-dark text-[10px] font-bold uppercase tracking-wider mb-1">
                                Artisanal Breads
                            </span>
</div>
</div>
<div class="p-6 space-y-4">
<div class="flex justify-between items-start">
<h4 class="heading-font text-2xl text-white">Sourdough Baguette</h4>
<span class="text-primary font-bold text-2xl">\\$8.50</span>
</div>
<p class="text-white/40 text-sm line-clamp-2 italic font-serif leading-relaxed">
                            Stone-baked sourdough with a signature crispy crust and a light, airy crumb structure. Made with 100% organic flour.
                        </p>
<div class="flex gap-2">
<button class="flex-1 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-white text-xs font-bold uppercase tracking-widest transition-colors">
                                Quick Edit
                            </button>
<button class="w-12 h-12 flex items-center justify-center bg-primary rounded-lg text-background-dark hover:brightness-110 transition-all">
<span class="material-icons-outlined">add</span>
</button>
</div>
</div>
</div>
<!-- Preview Legend -->
<div class="bg-white/5 rounded-xl p-6 border border-dashed border-white/10">
<h5 class="text-xs font-bold text-white/60 uppercase tracking-widest mb-4">Display Rules</h5>
<ul class="space-y-3">
<li class="flex items-center gap-3 text-xs text-white/40">
<span class="material-icons-outlined text-primary text-sm">check_circle</span>
                            Visible on customer-facing display
                        </li>
<li class="flex items-center gap-3 text-xs text-white/40">
<span class="material-icons-outlined text-primary text-sm">check_circle</span>
                            Categorized under 'Daily Bakes'
                        </li>
<li class="flex items-center gap-3 text-xs text-white/40">
<span class="material-icons-outlined text-primary text-sm">check_circle</span>
                            Auto-sync with kitchen display
                        </li>
</ul>
</div>
</div>
</div>
</main>
<!-- Bottom Bar -->
<footer class="h-20 border-t border-white/10 bg-background-dark/95 backdrop-blur-sm z-20 px-8 flex items-center justify-between">
<div class="flex items-center gap-4">
<button class="px-6 py-2.5 rounded-lg text-white/50 hover:text-white font-semibold text-sm transition-colors">
                Discard Changes
            </button>
</div>
<div class="flex items-center gap-4">
<button class="px-6 py-2.5 rounded-lg border border-white/10 text-white hover:bg-white/5 font-semibold text-sm transition-all">
                Save as Draft
            </button>
<button class="px-8 py-2.5 bg-primary rounded-lg text-background-dark font-bold text-sm hover:scale-[1.02] active:scale-95 transition-all shadow-[0_0_20px_rgba(242,208,13,0.3)]">
                Save &amp; Publish Product
            </button>
</div>
</footer>
</body></html>
      <!-- STITCH_HTML_END -->
    ` }} />
  );
};

export default Product_Creator;
