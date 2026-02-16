import React from 'react';

const Back_Office_Dashboard_Redesign: React.FC = () => {
  return (
    <div dangerouslySetInnerHTML={{ __html: `
      <!-- STITCH_HTML_START -->
      <!DOCTYPE html>
<html class="dark" lang="en"><head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
<title>The Breakery - Back-Office Dashboard</title>
<script src="https://cdn.tailwindcss.com?plugins=forms,typography"></script>
<link href="https://fonts.googleapis.com" rel="preconnect"/>
<link crossorigin="" href="https://fonts.gstatic.com" rel="preconnect"/>
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400..900;1,400..900&amp;family=Inter:wght@300;400;500;600&amp;family=Material+Icons+Outlined&amp;display=swap" rel="stylesheet"/>
<script>
        tailwind.config = {
            darkMode: "class",
            theme: {
                extend: {
                    colors: {
                        primary: "#C9A55C", // Aged Gold
                        "background-light": "#F9FAFB",
                        "background-dark": "#0D0D0F", // Deep Onyx
                        "card-dark": "#161618",
                        "border-dark": "#27272A",
                        "smoke": "#9CA3AF"
                    },
                    fontFamily: {
                        display: ["Playfair Display", "serif"],
                        sans: ["Inter", "sans-serif"],
                    },
                    borderRadius: {
                        DEFAULT: "0.5rem",
                    },
                },
            },
        };
    </script>
<style>
        .sidebar-active {
            color: #C9A55C;
            background-color: rgba(201, 165, 92, 0.05);
            border-right: 2px solid #C9A55C;
        }
        .chart-gradient {
            background: linear-gradient(180deg, rgba(201, 165, 92, 0.1) 0%, rgba(201, 165, 92, 0) 100%);
        }
    </style>
</head>
<body class="bg-background-light dark:bg-background-dark text-slate-900 dark:text-gray-200 font-sans antialiased">
<div class="flex min-h-screen">
<aside class="w-64 border-r border-gray-200 dark:border-border-dark bg-white dark:bg-background-dark flex flex-col sticky top-0 h-screen z-50">
<div class="p-8">
<h1 class="font-display text-2xl italic font-semibold text-primary">The Breakery</h1>
<p class="text-[10px] uppercase tracking-widest text-smoke mt-1 opacity-70">Artisanal Bakery System</p>
</div>
<nav class="flex-1 px-4 space-y-1 overflow-y-auto">
<div class="mb-6">
<p class="px-4 text-[10px] font-semibold text-smoke uppercase tracking-wider mb-2">Operations</p>
<a class="sidebar-active flex items-center px-4 py-3 text-sm font-medium transition-colors" href="#">
<span class="material-icons-outlined mr-3 text-[20px]">dashboard</span>
                        Dashboard
                    </a>
<a class="flex items-center px-4 py-3 text-sm font-medium text-slate-600 dark:text-gray-400 hover:text-primary dark:hover:text-primary transition-colors group" href="#">
<span class="material-icons-outlined mr-3 text-[20px] group-hover:text-primary">point_of_sale</span>
                        POS Terminal
                    </a>
<a class="flex items-center px-4 py-3 text-sm font-medium text-slate-600 dark:text-gray-400 hover:text-primary dark:hover:text-primary transition-colors group" href="#">
<span class="material-icons-outlined mr-3 text-[20px] group-hover:text-primary">restaurant</span>
                        Kitchen Display
                    </a>
</div>
<div class="mb-6">
<p class="px-4 text-[10px] font-semibold text-smoke uppercase tracking-wider mb-2">Management</p>
<a class="flex items-center px-4 py-3 text-sm font-medium text-slate-600 dark:text-gray-400 hover:text-primary dark:hover:text-primary transition-colors group" href="#">
<span class="material-icons-outlined mr-3 text-[20px] group-hover:text-primary">inventory_2</span>
                        Products
                    </a>
<a class="flex items-center px-4 py-3 text-sm font-medium text-slate-600 dark:text-gray-400 hover:text-primary dark:hover:text-primary transition-colors group" href="#">
<span class="material-icons-outlined mr-3 text-[20px] group-hover:text-primary">warehouse</span>
                        Stock &amp; Inventory
                    </a>
<a class="flex items-center px-4 py-3 text-sm font-medium text-slate-600 dark:text-gray-400 hover:text-primary dark:hover:text-primary transition-colors group" href="#">
<span class="material-icons-outlined mr-3 text-[20px] group-hover:text-primary">receipt_long</span>
                        Order History
                    </a>
</div>
</nav>
<div class="p-4 border-t border-gray-200 dark:border-border-dark">
<div class="flex items-center p-3 bg-gray-50 dark:bg-card-dark rounded-xl border border-gray-100 dark:border-border-dark">
<div class="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-bold text-sm">
                        JD
                    </div>
<div class="ml-3">
<p class="text-xs font-semibold dark:text-white">Jean Dupont</p>
<p class="text-[10px] text-smoke uppercase">Administrator</p>
</div>
<button class="ml-auto text-smoke hover:text-primary transition-colors">
<span class="material-icons-outlined text-sm">logout</span>
</button>
</div>
</div>
</aside>
<main class="flex-1 overflow-x-hidden bg-gray-50 dark:bg-background-dark p-8">
<header class="flex justify-between items-end mb-10">
<div>
<h2 class="font-display text-4xl font-medium dark:text-gray-100">Executive Summary</h2>
<p class="text-smoke mt-2">Welcome back. Here's what's happening at The Breakery today.</p>
</div>
<div class="flex gap-3">
<div class="flex items-center gap-2 bg-white dark:bg-card-dark border border-gray-200 dark:border-border-dark px-4 py-2 rounded-lg text-sm font-medium">
<span class="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
<span class="text-slate-600 dark:text-gray-300">Live System: <strong>Online</strong></span>
</div>
<button class="bg-primary hover:bg-opacity-90 transition-all text-background-dark px-6 py-2.5 rounded-lg font-semibold flex items-center gap-2 shadow-lg shadow-primary/10">
<span class="material-icons-outlined text-sm">add</span>
                        New Order
                    </button>
</div>
</header>
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
<div class="bg-white dark:bg-card-dark border border-gray-200 dark:border-border-dark p-6 rounded-2xl relative overflow-hidden group">
<div class="flex justify-between items-start mb-4">
<div class="p-2 bg-primary/10 rounded-lg text-primary">
<span class="material-icons-outlined">payments</span>
</div>
<span class="text-xs font-bold text-green-500 bg-green-500/10 px-2 py-1 rounded">+12.5%</span>
</div>
<p class="text-xs font-semibold uppercase tracking-wider text-smoke mb-1">Total Sales</p>
<h3 class="text-3xl font-display font-bold dark:text-white">€14,280.50</h3>
<div class="absolute bottom-0 left-0 w-full h-1 bg-primary opacity-0 group-hover:opacity-100 transition-opacity"></div>
</div>
<div class="bg-white dark:bg-card-dark border border-gray-200 dark:border-border-dark p-6 rounded-2xl relative overflow-hidden group">
<div class="flex justify-between items-start mb-4">
<div class="p-2 bg-primary/10 rounded-lg text-primary">
<span class="material-icons-outlined">shopping_basket</span>
</div>
<span class="text-xs font-bold text-primary bg-primary/10 px-2 py-1 rounded">24 New</span>
</div>
<p class="text-xs font-semibold uppercase tracking-wider text-smoke mb-1">Active Orders</p>
<h3 class="text-3xl font-display font-bold dark:text-white">127</h3>
<div class="absolute bottom-0 left-0 w-full h-1 bg-primary opacity-0 group-hover:opacity-100 transition-opacity"></div>
</div>
<div class="bg-white dark:bg-card-dark border border-gray-200 dark:border-border-dark p-6 rounded-2xl relative overflow-hidden group">
<div class="flex justify-between items-start mb-4">
<div class="p-2 bg-red-500/10 rounded-lg text-red-500">
<span class="material-icons-outlined">error_outline</span>
</div>
<span class="text-xs font-bold text-red-500 bg-red-500/10 px-2 py-1 rounded">Action Required</span>
</div>
<p class="text-xs font-semibold uppercase tracking-wider text-smoke mb-1">Stock Alerts</p>
<h3 class="text-3xl font-display font-bold dark:text-white">8</h3>
<div class="absolute bottom-0 left-0 w-full h-1 bg-primary opacity-0 group-hover:opacity-100 transition-opacity"></div>
</div>
<div class="bg-white dark:bg-card-dark border border-gray-200 dark:border-border-dark p-6 rounded-2xl relative overflow-hidden group">
<div class="flex justify-between items-start mb-4">
<div class="p-2 bg-primary/10 rounded-lg text-primary">
<span class="material-icons-outlined">trending_up</span>
</div>
<span class="text-xs font-bold text-green-500 bg-green-500/10 px-2 py-1 rounded">+€2,400</span>
</div>
<p class="text-xs font-semibold uppercase tracking-wider text-smoke mb-1">Net Profit</p>
<h3 class="text-3xl font-display font-bold dark:text-white">€4,892.00</h3>
<div class="absolute bottom-0 left-0 w-full h-1 bg-primary opacity-0 group-hover:opacity-100 transition-opacity"></div>
</div>
</div>
<div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
<div class="lg:col-span-2 bg-white dark:bg-card-dark border border-gray-200 dark:border-border-dark p-8 rounded-2xl">
<div class="flex justify-between items-center mb-8">
<div>
<h4 class="text-lg font-display font-semibold dark:text-white">Sales Performance</h4>
<p class="text-xs text-smoke">Weekly overview of revenue streams</p>
</div>
<select class="bg-transparent border border-gray-200 dark:border-border-dark rounded-md text-xs font-medium px-3 py-1 dark:text-gray-400 focus:ring-primary focus:border-primary">
<option>Last 7 Days</option>
<option>Last 30 Days</option>
</select>
</div>
<div class="h-64 relative">
<div class="absolute inset-0 flex flex-col justify-between">
<div class="border-b border-gray-100 dark:border-border-dark h-0"></div>
<div class="border-b border-gray-100 dark:border-border-dark h-0"></div>
<div class="border-b border-gray-100 dark:border-border-dark h-0"></div>
<div class="border-b border-gray-100 dark:border-border-dark h-0"></div>
<div class="border-b border-gray-100 dark:border-border-dark h-0"></div>
</div>
<svg class="absolute inset-0 w-full h-full" preserveAspectRatio="none">
<path class="drop-shadow-lg" d="M0,150 Q50,140 100,100 T200,80 T300,120 T400,60 T500,40 T600,70" fill="none" stroke="#C9A55C" stroke-width="3"></path>
<path class="opacity-10" d="M0,150 Q50,140 100,100 T200,80 T300,120 T400,60 T500,40 T600,70 V256 H0 Z" fill="url(#gradient)"></path>
<defs>
<linearGradient id="gradient" x1="0%" x2="0%" y1="0%" y2="100%">
<stop offset="0%" style="stop-color:#C9A55C;stop-opacity:1"></stop>
<stop offset="100%" style="stop-color:#C9A55C;stop-opacity:0"></stop>
</linearGradient>
</defs>
<circle class="animate-pulse" cx="200" cy="80" fill="#C9A55C" r="5"></circle>
<circle class="animate-pulse" cx="400" cy="60" fill="#C9A55C" r="5"></circle>
<circle class="animate-pulse" cx="500" cy="40" fill="#C9A55C" r="5"></circle>
</svg>
<div class="absolute bottom-0 left-0 w-full flex justify-between text-[10px] text-smoke mt-4 pt-4">
<span>MON</span>
<span>TUE</span>
<span>WED</span>
<span>THU</span>
<span>FRI</span>
<span>SAT</span>
<span>SUN</span>
</div>
</div>
</div>
<div class="bg-white dark:bg-card-dark border border-gray-200 dark:border-border-dark rounded-2xl overflow-hidden flex flex-col">
<div class="p-6 border-b border-gray-200 dark:border-border-dark flex justify-between items-center">
<h4 class="text-lg font-display font-semibold dark:text-white">Live Orders</h4>
<button class="text-xs text-primary font-semibold hover:underline">View All</button>
</div>
<div class="flex-1 overflow-y-auto max-h-[400px]">
<table class="w-full text-left">
<thead class="bg-gray-50 dark:bg-[#1A1A1C] text-[10px] uppercase tracking-widest text-smoke font-bold">
<tr>
<th class="px-6 py-3">ID</th>
<th class="px-6 py-3">Status</th>
<th class="px-6 py-3 text-right">Amount</th>
</tr>
</thead>
<tbody class="divide-y divide-gray-100 dark:divide-border-dark">
<tr class="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors group">
<td class="px-6 py-4">
<div class="flex flex-col">
<span class="text-xs font-bold dark:text-gray-200">#ORD-4921</span>
<span class="text-[10px] text-smoke">2 mins ago</span>
</div>
</td>
<td class="px-6 py-4">
<span class="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-500 border border-amber-500/20">PREPARING</span>
</td>
<td class="px-6 py-4 text-right">
<span class="text-xs font-bold dark:text-gray-200">€42.00</span>
</td>
</tr>
<tr class="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors group">
<td class="px-6 py-4">
<div class="flex flex-col">
<span class="text-xs font-bold dark:text-gray-200">#ORD-4920</span>
<span class="text-[10px] text-smoke">8 mins ago</span>
</div>
</td>
<td class="px-6 py-4">
<span class="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-green-500/10 text-green-500 border border-green-500/20">READY</span>
</td>
<td class="px-6 py-4 text-right">
<span class="text-xs font-bold dark:text-gray-200">€18.50</span>
</td>
</tr>
<tr class="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors group">
<td class="px-6 py-4">
<div class="flex flex-col">
<span class="text-xs font-bold dark:text-gray-200">#ORD-4919</span>
<span class="text-[10px] text-smoke">15 mins ago</span>
</div>
</td>
<td class="px-6 py-4">
<span class="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-gray-500/10 text-smoke border border-smoke/20">PENDING</span>
</td>
<td class="px-6 py-4 text-right">
<span class="text-xs font-bold dark:text-gray-200">€65.20</span>
</td>
</tr>
<tr class="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors group">
<td class="px-6 py-4">
<div class="flex flex-col">
<span class="text-xs font-bold dark:text-gray-200">#ORD-4918</span>
<span class="text-[10px] text-smoke">22 mins ago</span>
</div>
</td>
<td class="px-6 py-4">
<span class="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-green-500/10 text-green-500 border border-green-500/20">READY</span>
</td>
<td class="px-6 py-4 text-right">
<span class="text-xs font-bold dark:text-gray-200">€12.00</span>
</td>
</tr>
<tr class="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors group">
<td class="px-6 py-4">
<div class="flex flex-col">
<span class="text-xs font-bold dark:text-gray-200">#ORD-4917</span>
<span class="text-[10px] text-smoke">45 mins ago</span>
</div>
</td>
<td class="px-6 py-4">
<span class="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-green-500/10 text-green-500 border border-green-500/20">READY</span>
</td>
<td class="px-6 py-4 text-right">
<span class="text-xs font-bold dark:text-gray-200">€31.00</span>
</td>
</tr>
</tbody>
</table>
</div>
</div>
</div>
<div class="mt-8 bg-white dark:bg-card-dark border border-gray-200 dark:border-border-dark rounded-2xl p-8">
<div class="flex justify-between items-center mb-6">
<div>
<h4 class="text-lg font-display font-semibold dark:text-white">Inventory Monitor</h4>
<p class="text-xs text-smoke">Real-time status of raw materials and ingredients</p>
</div>
<div class="flex gap-2">
<button class="px-4 py-2 text-xs font-bold border border-gray-200 dark:border-border-dark rounded-lg dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 transition-all">All Items</button>
<button class="px-4 py-2 text-xs font-bold bg-red-500/10 text-red-500 border border-red-500/20 rounded-lg">Critical Low</button>
</div>
</div>
<div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
<div class="p-4 border border-gray-100 dark:border-border-dark rounded-xl">
<div class="flex justify-between items-start mb-3">
<div>
<h5 class="text-sm font-bold dark:text-gray-200">Almond Flour</h5>
<p class="text-[10px] text-smoke">Supplier: Paris Mills</p>
</div>
<span class="material-icons-outlined text-red-500 text-sm">warning</span>
</div>
<div class="w-full bg-gray-100 dark:bg-border-dark h-1.5 rounded-full overflow-hidden">
<div class="bg-red-500 h-full w-[12%]"></div>
</div>
<div class="flex justify-between mt-2 text-[10px]">
<span class="text-smoke">Status: <span class="text-red-500 font-bold uppercase">Critical</span></span>
<span class="dark:text-gray-400 font-bold">1.2 / 10.0 kg</span>
</div>
</div>
<div class="p-4 border border-gray-100 dark:border-border-dark rounded-xl">
<div class="flex justify-between items-start mb-3">
<div>
<h5 class="text-sm font-bold dark:text-gray-200">Butter (Unsalted)</h5>
<p class="text-[10px] text-smoke">Supplier: Breton Dairy</p>
</div>
</div>
<div class="w-full bg-gray-100 dark:bg-border-dark h-1.5 rounded-full overflow-hidden">
<div class="bg-primary h-full w-[65%]"></div>
</div>
<div class="flex justify-between mt-2 text-[10px]">
<span class="text-smoke">Status: <span class="text-primary font-bold uppercase">Optimal</span></span>
<span class="dark:text-gray-400 font-bold">16.2 / 25.0 kg</span>
</div>
</div>
<div class="p-4 border border-gray-100 dark:border-border-dark rounded-xl">
<div class="flex justify-between items-start mb-3">
<div>
<h5 class="text-sm font-bold dark:text-gray-200">Organic Yeast</h5>
<p class="text-[10px] text-smoke">Supplier: Bio-Levain</p>
</div>
<span class="material-icons-outlined text-primary text-sm">hourglass_bottom</span>
</div>
<div class="w-full bg-gray-100 dark:bg-border-dark h-1.5 rounded-full overflow-hidden">
<div class="bg-primary h-full w-[38%]"></div>
</div>
<div class="flex justify-between mt-2 text-[10px]">
<span class="text-smoke">Status: <span class="text-primary font-bold uppercase">Warning</span></span>
<span class="dark:text-gray-400 font-bold">1.9 / 5.0 kg</span>
</div>
</div>
<div class="p-4 border border-gray-100 dark:border-border-dark rounded-xl">
<div class="flex justify-between items-start mb-3">
<div>
<h5 class="text-sm font-bold dark:text-gray-200">Pain Chocolat</h5>
<p class="text-[10px] text-smoke">Daily Fresh Stock</p>
</div>
</div>
<div class="w-full bg-gray-100 dark:bg-border-dark h-1.5 rounded-full overflow-hidden">
<div class="bg-green-500 h-full w-[88%]"></div>
</div>
<div class="flex justify-between mt-2 text-[10px]">
<span class="text-smoke">Status: <span class="text-green-500 font-bold uppercase">Stocked</span></span>
<span class="dark:text-gray-400 font-bold">44 / 50 pcs</span>
</div>
</div>
</div>
</div>
</main>
</div>
<div class="fixed bottom-8 right-8 flex items-center gap-3 bg-white dark:bg-card-dark border border-gray-200 dark:border-border-dark p-4 rounded-xl shadow-2xl z-50 transform translate-y-0 opacity-100 transition-all duration-500 border-l-4 border-l-primary">
<div class="p-2 bg-primary/10 rounded-full text-primary">
<span class="material-icons-outlined text-sm">notifications_active</span>
</div>
<div>
<p class="text-xs font-bold dark:text-white">Sync Complete</p>
<p class="text-[10px] text-smoke">Dashboard data refreshed at 14:32</p>
</div>
<button class="ml-4 text-smoke hover:text-gray-700 dark:hover:text-white">
<span class="material-icons-outlined text-sm">close</span>
</button>
</div>

</body></html>
      <!-- STITCH_HTML_END -->
    ` }} />
  );
};

export default Back_Office_Dashboard_Redesign;
