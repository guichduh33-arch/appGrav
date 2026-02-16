import React from 'react';

const Product_Details_and_Insights: React.FC = () => {
  return (
    <div dangerouslySetInnerHTML={{ __html: `
      <!-- STITCH_HTML_START -->
      <!DOCTYPE html>

<html class="dark" lang="en"><head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
<title>The Breakery | Product Details &amp; Insights</title>
<script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&amp;family=Playfair+Display:ital,wght@0,700;1,700&amp;display=swap" rel="stylesheet"/>
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
                        "card-dark": "#1A1A1D",
                        "border-dark": "#2A2A30",
                    },
                    fontFamily: {
                        "display": ["Inter", "sans-serif"],
                        "serif": ["Playfair Display", "serif"]
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
            background-color: #0D0D0F;
            color: #E2E2E2;
        }
    </style>
</head>
<body class="font-display bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 min-h-screen">
<!-- Navigation Bar -->
<nav class="border-b border-border-dark bg-card-dark px-8 py-4 flex items-center justify-between sticky top-0 z-50">
<div class="flex items-center gap-8">
<h1 class="text-primary font-serif italic text-2xl tracking-tighter">The Breakery</h1>
<div class="hidden md:flex gap-6 text-sm font-medium text-slate-400">
<a class="hover:text-primary transition-colors" href="#">Dashboard</a>
<a class="text-primary border-b border-primary pb-1" href="#">Inventory</a>
<a class="hover:text-primary transition-colors" href="#">Orders</a>
<a class="hover:text-primary transition-colors" href="#">Analytics</a>
</div>
</div>
<div class="flex items-center gap-4">
<button class="p-2 text-slate-400 hover:text-white"><span class="material-icons text-xl">notifications</span></button>
<div class="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center border border-primary/40">
<span class="text-xs font-bold text-primary">JD</span>
</div>
</div>
</nav>
<main class="max-w-[1440px] mx-auto p-8">
<!-- Header Section -->
<header class="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
<div class="space-y-2">
<div class="flex items-center gap-3">
<h2 class="font-serif text-4xl text-white">Croissant</h2>
<span class="bg-primary/10 text-primary text-[10px] uppercase tracking-widest px-2 py-1 rounded border border-primary/20 font-bold">Pastries</span>
<span class="bg-emerald-500/10 text-emerald-500 text-[10px] uppercase tracking-widest px-2 py-1 rounded border border-emerald-500/20 font-bold">In Stock</span>
</div>
<p class="text-slate-500 text-sm">SKU: BAK-CRS-001 • Last updated 2 hours ago</p>
</div>
<div class="flex items-center gap-3">
<button class="px-4 py-2 rounded-lg border border-border-dark bg-card-dark hover:bg-zinc-800 transition-colors text-sm flex items-center gap-2">
<span class="material-icons text-sm">content_copy</span> Duplicate
                </button>
<button class="px-4 py-2 rounded-lg border border-border-dark bg-card-dark hover:bg-zinc-800 transition-colors text-sm flex items-center gap-2">
<span class="material-icons text-sm">edit</span> Edit Product
                </button>
<button class="px-4 py-2 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500/20 border border-red-500/20 transition-colors text-sm flex items-center gap-2">
<span class="material-icons text-sm">delete</span> Delete
                </button>
</div>
</header>
<div class="grid grid-cols-12 gap-8">
<!-- Left Column: Product Info & Core Data -->
<div class="col-span-12 lg:col-span-7 space-y-8">
<!-- Product Image Section -->
<div class="relative group">
<div class="w-full h-[400px] rounded-xl overflow-hidden border border-border-dark bg-zinc-900">
<img alt="Golden Butter Croissant" class="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-500" data-alt="Golden brown buttery croissant on a dark background" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDTSzqKYMHxL7pLiRV1oF6e9SJelBWSo8lBrrDRvGUye_3ojET6M8xZ4VkDUviyeKhPxGXbuLDNNz-SwnuP6T1vuGCDj1DK1TfWHQM68yP3zXTe0lKvHkIUEmWV6mp7iLqCA2yYD5rWgd9_Nt6Ke0uKuBuvRxk988f1jz5CMfbyChm52CdbHh1oQ44Sbfue8H4l92WECcojmXPodkG9Bcg9no8uvyuFf3DJ-NDmV-VOzVDHn_DspumE1rVR-BdgmTdkl1J12NTGgMXT"/>
</div>
<div class="absolute bottom-4 right-4 flex gap-2">
<button class="bg-black/60 backdrop-blur-md p-2 rounded-lg text-white hover:bg-black transition-colors">
<span class="material-icons text-base">photo_camera</span>
</button>
</div>
</div>
<!-- Basic Info Card -->
<div class="bg-card-dark border border-border-dark rounded-xl p-6">
<h3 class="text-lg font-semibold mb-4 text-white flex items-center gap-2">
<span class="material-icons text-primary text-sm">info</span> Basic Information
                    </h3>
<div class="grid grid-cols-2 gap-6">
<div class="space-y-1">
<p class="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Product Description</p>
<p class="text-sm text-slate-300 leading-relaxed">Traditional French butter croissant with 24 layers of lamination. Prepared daily using premium fermented butter from Normandy.</p>
</div>
<div class="grid grid-cols-2 gap-4">
<div class="space-y-1">
<p class="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Category</p>
<p class="text-sm text-white">Classic Pastry</p>
</div>
<div class="space-y-1">
<p class="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Tax Rate</p>
<p class="text-sm text-white">VAT 11% (Included)</p>
</div>
</div>
</div>
</div>
<!-- Pricing Card -->
<div class="bg-card-dark border border-border-dark rounded-xl overflow-hidden">
<div class="p-6 border-b border-border-dark flex justify-between items-center">
<h3 class="text-lg font-semibold text-white">Pricing &amp; Margins</h3>
<div class="bg-primary/20 text-primary px-3 py-1 rounded-full text-xs font-bold border border-primary/30">
                            50.0% Gross Margin
                        </div>
</div>
<div class="overflow-x-auto">
<table class="w-full text-left">
<thead class="bg-zinc-900/50">
<tr>
<th class="px-6 py-4 text-[10px] text-slate-500 uppercase tracking-widest font-bold">Tier</th>
<th class="px-6 py-4 text-[10px] text-slate-500 uppercase tracking-widest font-bold">Amount</th>
<th class="px-6 py-4 text-[10px] text-slate-500 uppercase tracking-widest font-bold">Notes</th>
</tr>
</thead>
<tbody class="divide-y divide-border-dark">
<tr>
<td class="px-6 py-4 text-sm font-medium text-slate-300">Retail Price</td>
<td class="px-6 py-4 text-sm text-primary font-bold">Rp 35.000</td>
<td class="px-6 py-4 text-xs text-slate-500">Standard store price</td>
</tr>
<tr>
<td class="px-6 py-4 text-sm font-medium text-slate-300">Wholesale Price</td>
<td class="px-6 py-4 text-sm text-white">Rp 28.500</td>
<td class="px-6 py-4 text-xs text-slate-500">Min. order 20 pcs</td>
</tr>
<tr class="bg-zinc-900/30">
<td class="px-6 py-4 text-sm font-medium text-slate-300">Production Cost</td>
<td class="px-6 py-4 text-sm text-white">Rp 17.500</td>
<td class="px-6 py-4 text-xs text-slate-500">Includes labor &amp; overhead</td>
</tr>
</tbody>
</table>
</div>
</div>
<!-- Recipe Expandable Section -->
<div class="bg-card-dark border border-border-dark rounded-xl overflow-hidden">
<button class="w-full p-6 flex justify-between items-center hover:bg-zinc-800/30 transition-colors">
<h3 class="text-lg font-semibold text-white flex items-center gap-2">
<span class="material-icons text-primary text-sm">restaurant_menu</span> Recipe &amp; Ingredients
                        </h3>
<span class="material-icons text-slate-500">expand_less</span>
</button>
<div class="px-6 pb-6">
<div class="space-y-4">
<div class="flex items-center justify-between p-3 rounded bg-zinc-900/50 border border-border-dark">
<div class="flex flex-col">
<span class="text-sm font-medium text-slate-200">French T55 Flour</span>
<span class="text-xs text-slate-500">Supplier: Grands Moulins</span>
</div>
<div class="text-right">
<div class="text-sm font-bold text-white">125g</div>
<div class="text-[10px] text-slate-500">Rp 2.450</div>
</div>
</div>
<div class="flex items-center justify-between p-3 rounded bg-zinc-900/50 border border-border-dark">
<div class="flex flex-col">
<span class="text-sm font-medium text-slate-200">Isigny Ste Mère Butter</span>
<span class="text-xs text-slate-500">Supplier: EuroFood</span>
</div>
<div class="text-right">
<div class="text-sm font-bold text-white">85g</div>
<div class="text-[10px] text-slate-500">Rp 11.200</div>
</div>
</div>
<div class="flex items-center justify-between p-3 rounded bg-zinc-900/50 border border-border-dark">
<div class="flex flex-col">
<span class="text-sm font-medium text-slate-200">Fresh Yeast &amp; Salt</span>
<span class="text-xs text-slate-500">In-house stock</span>
</div>
<div class="text-right">
<div class="text-sm font-bold text-white">15g</div>
<div class="text-[10px] text-slate-500">Rp 850</div>
</div>
</div>
</div>
</div>
</div>
</div>
<!-- Right Column: Stock & Performance -->
<div class="col-span-12 lg:col-span-5 space-y-8">
<!-- Stock Status Card -->
<div class="bg-card-dark border border-border-dark rounded-xl p-6">
<div class="flex justify-between items-start mb-6">
<div>
<h3 class="text-sm font-bold text-slate-500 uppercase tracking-widest mb-1">Stock Status</h3>
<div class="flex items-baseline gap-2">
<span class="text-4xl font-bold text-white">45</span>
<span class="text-slate-400">pcs available</span>
</div>
</div>
<div class="p-3 rounded-lg bg-primary/10 border border-primary/20">
<span class="material-icons text-primary">inventory_2</span>
</div>
</div>
<div class="space-y-2">
<div class="flex justify-between text-xs font-medium mb-2">
<span class="text-slate-400">Inventory Level</span>
<span class="text-white">Min. Threshold: 20 pcs</span>
</div>
<div class="w-full h-3 bg-zinc-900 rounded-full overflow-hidden border border-border-dark">
<div class="h-full bg-primary w-[75%] rounded-full shadow-[0_0_10px_rgba(242,208,13,0.3)]"></div>
</div>
<p class="text-[11px] text-emerald-500 font-medium pt-1">+12 pcs added this morning</p>
</div>
</div>
<!-- Performance Card -->
<div class="bg-card-dark border border-border-dark rounded-xl p-6 relative overflow-hidden">
<!-- Rank Badge -->
<div class="absolute top-0 right-0">
<div class="bg-primary text-black font-bold text-[10px] px-4 py-1.5 rotate-45 translate-x-3 -translate-y-1 shadow-lg">
                            BEST SELLER #1
                        </div>
</div>
<h3 class="text-sm font-bold text-slate-500 uppercase tracking-widest mb-4">Performance</h3>
<div class="mb-6">
<p class="text-[10px] text-slate-500 uppercase mb-1">Monthly Revenue</p>
<h4 class="text-3xl font-bold text-primary">Rp 12.250.000</h4>
<div class="flex items-center gap-1 text-emerald-500 text-xs mt-1">
<span class="material-icons text-xs">trending_up</span>
<span>14% vs last month</span>
</div>
</div>
<!-- Sparkline Mockup -->
<div class="w-full h-24 flex items-end gap-1 mb-4">
<div class="flex-1 bg-primary/20 hover:bg-primary/40 transition-colors h-[40%] rounded-t-sm"></div>
<div class="flex-1 bg-primary/20 hover:bg-primary/40 transition-colors h-[60%] rounded-t-sm"></div>
<div class="flex-1 bg-primary/20 hover:bg-primary/40 transition-colors h-[55%] rounded-t-sm"></div>
<div class="flex-1 bg-primary/20 hover:bg-primary/40 transition-colors h-[80%] rounded-t-sm"></div>
<div class="flex-1 bg-primary/20 hover:bg-primary/40 transition-colors h-[70%] rounded-t-sm"></div>
<div class="flex-1 bg-primary hover:bg-primary/80 transition-colors h-[95%] rounded-t-sm"></div>
<div class="flex-1 bg-primary/20 hover:bg-primary/40 transition-colors h-[85%] rounded-t-sm"></div>
</div>
<div class="grid grid-cols-2 gap-4 border-t border-border-dark pt-4">
<div>
<p class="text-[10px] text-slate-500 uppercase">Units Sold</p>
<p class="text-lg font-bold text-white">350 <span class="text-xs text-slate-500 font-normal">pcs</span></p>
</div>
<div>
<p class="text-[10px] text-slate-500 uppercase">Conversion</p>
<p class="text-lg font-bold text-white">68.4%</p>
</div>
</div>
</div>
<!-- Recent Movements -->
<div class="bg-card-dark border border-border-dark rounded-xl overflow-hidden">
<div class="p-6 border-b border-border-dark">
<h3 class="text-sm font-bold text-slate-500 uppercase tracking-widest">Recent Movements</h3>
</div>
<div class="p-0">
<div class="flex items-center gap-4 px-6 py-4 border-b border-border-dark/50">
<div class="w-8 h-8 rounded bg-emerald-500/10 flex items-center justify-center text-emerald-500">
<span class="material-icons text-sm">add</span>
</div>
<div class="flex-1">
<p class="text-xs font-medium text-white">Restock from kitchen</p>
<p class="text-[10px] text-slate-500">Today, 06:45 AM</p>
</div>
<div class="text-xs font-bold text-emerald-500">+12</div>
</div>
<div class="flex items-center gap-4 px-6 py-4 border-b border-border-dark/50">
<div class="w-8 h-8 rounded bg-red-500/10 flex items-center justify-center text-red-500">
<span class="material-icons text-sm">remove</span>
</div>
<div class="flex-1">
<p class="text-xs font-medium text-white">Counter Sales (Batch 1)</p>
<p class="text-[10px] text-slate-500">Today, 10:30 AM</p>
</div>
<div class="text-xs font-bold text-red-500">-24</div>
</div>
<div class="flex items-center gap-4 px-6 py-4">
<div class="w-8 h-8 rounded bg-zinc-500/10 flex items-center justify-center text-zinc-500">
<span class="material-icons text-sm">history</span>
</div>
<div class="flex-1">
<p class="text-xs font-medium text-white">Manual Adjustment</p>
<p class="text-[10px] text-slate-500">Yesterday, 05:15 PM</p>
</div>
<div class="text-xs font-bold text-slate-300">-2</div>
</div>
</div>
</div>
<!-- Price History Timeline -->
<div class="bg-card-dark border border-border-dark rounded-xl p-6">
<h3 class="text-sm font-bold text-slate-500 uppercase tracking-widest mb-6">Price History</h3>
<div class="space-y-6 relative before:content-[''] before:absolute before:left-2 before:top-2 before:bottom-2 before:w-[1px] before:bg-border-dark">
<div class="relative pl-8">
<div class="absolute left-0 top-1 w-4 h-4 rounded-full bg-primary border-4 border-background-dark"></div>
<p class="text-xs font-bold text-white">Current Price Set</p>
<p class="text-[10px] text-slate-500 mb-1">Jan 12, 2024</p>
<p class="text-sm font-medium text-primary">Rp 35.000</p>
</div>
<div class="relative pl-8">
<div class="absolute left-0 top-1 w-4 h-4 rounded-full bg-zinc-700 border-4 border-background-dark"></div>
<p class="text-xs font-medium text-slate-400">Promo: Holiday Season</p>
<p class="text-[10px] text-slate-500 mb-1">Dec 15, 2023</p>
<p class="text-sm font-medium text-slate-400">Rp 30.000</p>
</div>
<div class="relative pl-8">
<div class="absolute left-0 top-1 w-4 h-4 rounded-full bg-zinc-700 border-4 border-background-dark"></div>
<p class="text-xs font-medium text-slate-400">Initial Launch</p>
<p class="text-[10px] text-slate-500 mb-1">Oct 01, 2023</p>
<p class="text-sm font-medium text-slate-400">Rp 32.500</p>
</div>
</div>
</div>
</div>
</div>
</main>
<!-- Footer Status -->
<footer class="mt-12 border-t border-border-dark bg-zinc-950 p-6">
<div class="max-w-[1440px] mx-auto flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] text-slate-600 uppercase tracking-widest font-bold">
<div class="flex items-center gap-4">
<span>© 2024 The Breakery Management</span>
<span class="w-1 h-1 rounded-full bg-slate-800"></span>
<span>Version 2.4.0-Stable</span>
</div>
<div class="flex items-center gap-6">
<span class="flex items-center gap-2"><span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span> Cloud Sync Active</span>
<a class="hover:text-primary transition-colors" href="#">Privacy Policy</a>
<a class="hover:text-primary transition-colors" href="#">System Health</a>
</div>
</div>
</footer>
</body></html>
      <!-- STITCH_HTML_END -->
    ` }} />
  );
};

export default Product_Details_and_Insights;
