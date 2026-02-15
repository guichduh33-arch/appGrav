import React from 'react';

const Reports_Hub_Overview: React.FC = () => {
  return (
    <div dangerouslySetInnerHTML={{ __html: \
      <!-- STITCH_HTML_START -->
      <!DOCTYPE html>

<html class="dark" lang="en"><head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
<title>The Breakery Reports Hub</title>
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
                        "primary": "#e49e1b",
                        "background-light": "#f8f7f6",
                        "background-dark": "#0D0D0F",
                        "card-dark": "#1A1A1D",
                    },
                    fontFamily: {
                        "display": ["Inter", "sans-serif"],
                        "serif": ["Playfair Display", "serif"]
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
            font-family: 'Inter', sans-serif;
            background-color: #0D0D0F;
        }
        .glow-gold {
            filter: drop-shadow(0 0 8px rgba(228, 158, 27, 0.4));
        }
        .custom-scrollbar::-webkit-scrollbar {
            width: 4px;
            height: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
            background: #1A1A1D;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
            background: #e49e1b;
            border-radius: 10px;
        }
    </style>
</head>
<body class="bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 min-h-screen">
<!-- Header Section -->
<header class="border-b border-primary/10 bg-background-light dark:bg-background-dark/80 backdrop-blur-md sticky top-0 z-50">
<div class="max-w-[1600px] mx-auto px-6 h-20 flex items-center justify-between">
<div class="flex items-center gap-3">
<div class="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center text-primary">
<span class="material-icons-outlined">bar_chart</span>
</div>
<h1 class="font-serif text-2xl text-slate-900 dark:text-white">Reports &amp; Analytics</h1>
</div>
<div class="flex items-center gap-4">
<div class="flex items-center bg-card-dark border border-primary/10 rounded-lg px-3 py-2 gap-2">
<span class="material-icons-outlined text-sm text-primary">calendar_today</span>
<span class="text-sm font-medium">This Month</span>
<span class="material-icons-outlined text-sm text-slate-500">expand_more</span>
</div>
<button class="flex items-center gap-2 bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 px-4 py-2 rounded-lg transition-all">
<span class="material-icons-outlined text-sm">file_download</span>
<span class="text-sm font-semibold">Export All</span>
</button>
</div>
</div>
</header>
<main class="max-w-[1600px] mx-auto px-6 py-8">
<!-- Tab Navigation -->
<nav class="flex items-center gap-8 border-b border-slate-800 mb-8 overflow-x-auto custom-scrollbar whitespace-nowrap">
<a class="pb-4 text-primary border-b-2 border-primary font-medium transition-all" href="#">Overview</a>
<a class="pb-4 text-slate-500 hover:text-slate-300 font-medium transition-all" href="#">Daily Sales</a>
<a class="pb-4 text-slate-500 hover:text-slate-300 font-medium transition-all" href="#">Sales by Category</a>
<a class="pb-4 text-slate-500 hover:text-slate-300 font-medium transition-all" href="#">Sales by Hour</a>
<a class="pb-4 text-slate-500 hover:text-slate-300 font-medium transition-all" href="#">Product Performance</a>
<a class="pb-4 text-slate-500 hover:text-slate-300 font-medium transition-all" href="#">Inventory</a>
<a class="pb-4 text-slate-500 hover:text-slate-300 font-medium transition-all" href="#">Profit &amp; Loss</a>
<a class="pb-4 text-slate-500 hover:text-slate-300 font-medium transition-all" href="#">Session Cash</a>
</nav>
<!-- KPI Row -->
<div class="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6 mb-8">
<!-- Revenue Card -->
<div class="bg-card-dark border border-primary/10 p-6 rounded-xl hover:border-primary/30 transition-all group">
<div class="flex justify-between items-start mb-4">
<span class="text-slate-500 text-sm font-medium">Total Revenue</span>
<span class="bg-emerald-500/10 text-emerald-500 text-xs px-2 py-1 rounded-full">+8.5%</span>
</div>
<div class="text-2xl font-bold text-white mb-1">Rp 28.450.000</div>
<div class="text-xs text-slate-600">v last month: Rp 26.221.000</div>
</div>
<div class="bg-card-dark border border-primary/10 p-6 rounded-xl hover:border-primary/30 transition-all">
<div class="flex justify-between items-start mb-4">
<span class="text-slate-500 text-sm font-medium">Orders</span>
<span class="bg-emerald-500/10 text-emerald-500 text-xs px-2 py-1 rounded-full">+12%</span>
</div>
<div class="text-2xl font-bold text-white mb-1">1,240</div>
<div class="text-xs text-slate-600">Avg. 41 orders/day</div>
</div>
<div class="bg-card-dark border border-primary/10 p-6 rounded-xl hover:border-primary/30 transition-all">
<div class="flex justify-between items-start mb-4">
<span class="text-slate-500 text-sm font-medium">Avg Ticket</span>
<span class="bg-red-500/10 text-red-500 text-xs px-2 py-1 rounded-full">-2.1%</span>
</div>
<div class="text-2xl font-bold text-white mb-1">Rp 22.900</div>
<div class="text-xs text-slate-600">v last month: Rp 23.400</div>
</div>
<div class="bg-card-dark border border-primary/10 p-6 rounded-xl hover:border-primary/30 transition-all">
<div class="flex justify-between items-start mb-4">
<span class="text-slate-500 text-sm font-medium">Unique Customers</span>
<span class="bg-emerald-500/10 text-emerald-500 text-xs px-2 py-1 rounded-full">+4.2%</span>
</div>
<div class="text-2xl font-bold text-white mb-1">890</div>
<div class="text-xs text-slate-600">62% repeat rate</div>
</div>
<div class="bg-card-dark border border-primary/10 p-6 rounded-xl hover:border-primary/30 transition-all">
<div class="flex justify-between items-start mb-4">
<span class="text-slate-500 text-sm font-medium">Items Sold</span>
<span class="bg-emerald-500/10 text-emerald-500 text-xs px-2 py-1 rounded-full">+15%</span>
</div>
<div class="text-2xl font-bold text-white mb-1">3,120</div>
<div class="text-xs text-slate-600">2.5 items per order</div>
</div>
</div>
<!-- Revenue Trend Chart (Visual Representation) -->
<div class="bg-card-dark border border-primary/10 p-8 rounded-xl mb-8">
<div class="flex items-center justify-between mb-8">
<div>
<h3 class="text-lg font-semibold text-white">Revenue Trend</h3>
<p class="text-sm text-slate-500">Gross revenue performance over the last 30 days</p>
</div>
<div class="flex gap-2">
<span class="flex items-center gap-2 text-xs text-slate-400">
<span class="w-2 h-2 rounded-full bg-primary"></span> Current
                    </span>
<span class="flex items-center gap-2 text-xs text-slate-400">
<span class="w-2 h-2 rounded-full bg-slate-700"></span> Previous
                    </span>
</div>
</div>
<div class="relative h-[300px] w-full flex items-end gap-[2%] px-4">
<!-- Abstract Trend Lines Visualization -->
<svg class="absolute inset-0 w-full h-full" preserveaspectratio="none">
<path class="glow-gold" d="M0 250 Q 150 180, 300 220 T 600 120 T 900 150 T 1200 80 T 1600 100" fill="none" stroke="#e49e1b" stroke-width="3"></path>
<path d="M0 260 Q 150 200, 300 240 T 600 160 T 900 180 T 1200 140 T 1600 150" fill="none" stroke="#334155" stroke-dasharray="5,5" stroke-width="2"></path>
<!-- Vertical Grid Lines -->
<line stroke="#ffffff05" x1="20%" x2="20%" y1="0" y2="100%"></line>
<line stroke="#ffffff05" x1="40%" x2="40%" y1="0" y2="100%"></line>
<line stroke="#ffffff05" x1="60%" x2="60%" y1="0" y2="100%"></line>
<line stroke="#ffffff05" x1="80%" x2="80%" y1="0" y2="100%"></line>
</svg>
<div class="absolute bottom-[-24px] w-full flex justify-between text-[10px] text-slate-600 font-medium">
<span>Oct 01</span><span>Oct 07</span><span>Oct 14</span><span>Oct 21</span><span>Oct 28</span><span>Oct 31</span>
</div>
</div>
</div>
<!-- Middle Row: Top Products & Category Donut -->
<div class="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
<!-- Top 10 Products -->
<div class="bg-card-dark border border-primary/10 p-8 rounded-xl">
<h3 class="text-lg font-semibold text-white mb-6">Top 10 Products</h3>
<div class="space-y-5">
<div class="space-y-2">
<div class="flex justify-between text-sm">
<span class="text-slate-300">Classic Butter Croissant</span>
<span class="text-white font-medium">482 sold</span>
</div>
<div class="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
<div class="bg-primary h-full w-[95%] rounded-full"></div>
</div>
</div>
<div class="space-y-2">
<div class="flex justify-between text-sm">
<span class="text-slate-300">Pain au Chocolat</span>
<span class="text-white font-medium">395 sold</span>
</div>
<div class="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
<div class="bg-primary/80 h-full w-[80%] rounded-full"></div>
</div>
</div>
<div class="space-y-2">
<div class="flex justify-between text-sm">
<span class="text-slate-300">Artisanal Sourdough</span>
<span class="text-white font-medium">312 sold</span>
</div>
<div class="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
<div class="bg-primary/60 h-full w-[65%] rounded-full"></div>
</div>
</div>
<div class="space-y-2">
<div class="flex justify-between text-sm">
<span class="text-slate-300">Almond Croissant</span>
<span class="text-white font-medium">284 sold</span>
</div>
<div class="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
<div class="bg-primary/40 h-full w-[55%] rounded-full"></div>
</div>
</div>
<div class="space-y-2">
<div class="flex justify-between text-sm">
<span class="text-slate-300">Cold Brew Coffee</span>
<span class="text-white font-medium">250 sold</span>
</div>
<div class="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
<div class="bg-primary/30 h-full w-[45%] rounded-full"></div>
</div>
</div>
</div>
</div>
<!-- Revenue by Category -->
<div class="bg-card-dark border border-primary/10 p-8 rounded-xl flex flex-col items-center justify-center">
<h3 class="text-lg font-semibold text-white mb-8 self-start">Revenue by Category</h3>
<div class="relative w-64 h-64 mb-8">
<!-- SVG Donut Chart -->
<svg class="w-full h-full -rotate-90" viewbox="0 0 36 36">
<circle cx="18" cy="18" fill="transparent" r="15.9" stroke="#14b8a6" stroke-dasharray="45 55" stroke-dashoffset="0" stroke-width="4"></circle>
<circle cx="18" cy="18" fill="transparent" r="15.9" stroke="#f59e0b" stroke-dasharray="30 70" stroke-dashoffset="-45" stroke-width="4"></circle>
<circle cx="18" cy="18" fill="transparent" r="15.9" stroke="#e49e1b" stroke-dasharray="25 75" stroke-dashoffset="-75" stroke-width="4"></circle>
</svg>
<div class="absolute inset-0 flex flex-col items-center justify-center text-center">
<span class="text-xs text-slate-500 uppercase tracking-wider">Total</span>
<span class="text-xl font-bold text-white">Rp 28.4M</span>
</div>
</div>
<div class="grid grid-cols-3 gap-6 w-full">
<div class="flex flex-col items-center">
<div class="flex items-center gap-2 mb-1">
<span class="w-2 h-2 rounded-full bg-primary"></span>
<span class="text-xs text-slate-300">Pastry</span>
</div>
<span class="text-sm font-semibold">45%</span>
</div>
<div class="flex flex-col items-center">
<div class="flex items-center gap-2 mb-1">
<span class="w-2 h-2 rounded-full bg-amber-500"></span>
<span class="text-xs text-slate-300">Bread</span>
</div>
<span class="text-sm font-semibold">30%</span>
</div>
<div class="flex flex-col items-center">
<div class="flex items-center gap-2 mb-1">
<span class="w-2 h-2 rounded-full bg-teal-500"></span>
<span class="text-xs text-slate-300">Coffee</span>
</div>
<span class="text-sm font-semibold">25%</span>
</div>
</div>
</div>
</div>
<!-- Bottom Row: Hourly Distribution -->
<div class="bg-card-dark border border-primary/10 p-8 rounded-xl">
<div class="flex items-center justify-between mb-8">
<div>
<h3 class="text-lg font-semibold text-white">Hourly Distribution</h3>
<p class="text-sm text-slate-500">Identify peak traffic times to optimize staffing</p>
</div>
<span class="text-xs font-medium text-primary bg-primary/10 px-3 py-1 rounded-full border border-primary/20">Peak: 09:00 AM - 11:00 AM</span>
</div>
<div class="flex items-end justify-between h-48 gap-2">
<!-- Morning -->
<div class="flex-1 flex flex-col items-center gap-2">
<div class="w-full bg-primary/20 hover:bg-primary transition-all rounded-t-sm h-[20%]"></div>
<span class="text-[10px] text-slate-600">07:00</span>
</div>
<div class="flex-1 flex flex-col items-center gap-2">
<div class="w-full bg-primary/40 hover:bg-primary transition-all rounded-t-sm h-[60%]"></div>
<span class="text-[10px] text-slate-600">08:00</span>
</div>
<div class="flex-1 flex flex-col items-center gap-2">
<div class="w-full bg-primary/80 hover:bg-primary transition-all rounded-t-sm h-[95%]"></div>
<span class="text-[10px] text-slate-600 font-bold text-slate-400">09:00</span>
</div>
<div class="flex-1 flex flex-col items-center gap-2">
<div class="w-full bg-primary hover:bg-primary transition-all rounded-t-sm h-[100%] shadow-[0_0_15px_rgba(228,158,27,0.3)]"></div>
<span class="text-[10px] text-slate-600 font-bold text-slate-400">10:00</span>
</div>
<div class="flex-1 flex flex-col items-center gap-2">
<div class="w-full bg-primary/70 hover:bg-primary transition-all rounded-t-sm h-[85%]"></div>
<span class="text-[10px] text-slate-600">11:00</span>
</div>
<!-- Afternoon -->
<div class="flex-1 flex flex-col items-center gap-2">
<div class="w-full bg-primary/30 hover:bg-primary transition-all rounded-t-sm h-[40%]"></div>
<span class="text-[10px] text-slate-600">12:00</span>
</div>
<div class="flex-1 flex flex-col items-center gap-2">
<div class="w-full bg-primary/30 hover:bg-primary transition-all rounded-t-sm h-[35%]"></div>
<span class="text-[10px] text-slate-600">13:00</span>
</div>
<div class="flex-1 flex flex-col items-center gap-2">
<div class="w-full bg-primary/20 hover:bg-primary transition-all rounded-t-sm h-[25%]"></div>
<span class="text-[10px] text-slate-600">14:00</span>
</div>
<div class="flex-1 flex flex-col items-center gap-2">
<div class="w-full bg-primary/40 hover:bg-primary transition-all rounded-t-sm h-[50%]"></div>
<span class="text-[10px] text-slate-600">15:00</span>
</div>
<div class="flex-1 flex flex-col items-center gap-2">
<div class="w-full bg-primary/50 hover:bg-primary transition-all rounded-t-sm h-[65%]"></div>
<span class="text-[10px] text-slate-600">16:00</span>
</div>
<div class="flex-1 flex flex-col items-center gap-2">
<div class="w-full bg-primary/40 hover:bg-primary transition-all rounded-t-sm h-[45%]"></div>
<span class="text-[10px] text-slate-600">17:00</span>
</div>
<div class="flex-1 flex flex-col items-center gap-2">
<div class="w-full bg-primary/20 hover:bg-primary transition-all rounded-t-sm h-[20%]"></div>
<span class="text-[10px] text-slate-600">18:00</span>
</div>
</div>
</div>
</main>
<!-- Background Pattern Decoration -->
<div class="fixed inset-0 pointer-events-none overflow-hidden opacity-5 z-[-1]">
<img class="w-full h-full object-cover mix-blend-overlay grayscale" data-alt="Subtle dark background with bakery textures" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBvZETtp50ktP_iBXZyn1oL1IdeA3aBBhhexJ8UqOU7-ZHxqRi460VwAyIa_QEVg-5-JY53q9KKDlFgCM6u5v0D83AMIk3ShtcaHF3g9-p2U5Ltk6onx2kXeECJqo3COntJNSLqnSGH0r1kALWrVaUbQJqh009WBzYXqdjwRHjBKpl4O4VObPvRX-OV-7xzYzcNSiilWy0S5ZmoxTiEGuS6Q7FANLYrIZkVpWPs0zF26Qh6teuLbEOQH1nnXuEq2l8p7vTcbzqTrIN0"/>
</div>
</body></html>
      <!-- STITCH_HTML_END -->
    \ }} />
  );
};

export default Reports_Hub_Overview;
