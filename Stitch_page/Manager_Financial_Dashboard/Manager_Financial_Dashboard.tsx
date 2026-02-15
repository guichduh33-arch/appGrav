import React from 'react';

const Manager_Financial_Dashboard: React.FC = () => {
  return (
    <div dangerouslySetInnerHTML={{ __html: \
      <!-- STITCH_HTML_START -->
      <!DOCTYPE html>

<html class="dark" lang="en"><head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
<title>The Breakery Manager Financial Dashboard</title>
<script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
<link href="https://fonts.googleapis.com/css2?family=Work+Sans:wght@300;400;500;600;700&amp;family=Playfair+Display:wght@700&amp;display=swap" rel="stylesheet"/>
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
                        "surface-dark": "#1A1A1D",
                        "accent-blue": "#3b82f6",
                        "accent-red": "#ef4444",
                    },
                    fontFamily: {
                        "display": ["Work Sans", "sans-serif"],
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
            font-family: 'Work Sans', sans-serif;
        }
        .serif-font {
            font-family: 'Playfair Display', serif;
        }
        .heatmap-grid {
            display: grid;
            grid-template-columns: repeat(24, 1fr);
            gap: 2px;
        }
        .custom-scrollbar::-webkit-scrollbar {
            width: 4px;
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
<body class="bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 min-h-screen flex flex-col font-display">
<!-- Header Section -->
<header class="sticky top-0 z-50 bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-md border-b border-primary/10 px-8 py-4 flex justify-between items-center">
<div class="flex items-center gap-4">
<div class="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
<span class="material-icons text-background-dark">bakery_dining</span>
</div>
<h1 class="serif-font text-[28px] font-bold tracking-tight">Manager Dashboard</h1>
</div>
<div class="flex items-center gap-6">
<div class="flex bg-surface-dark border border-primary/20 rounded-lg p-1">
<button class="px-4 py-1.5 text-sm font-medium rounded-md transition-all text-slate-400 hover:text-white">Day</button>
<button class="px-4 py-1.5 text-sm font-medium rounded-md transition-all bg-primary text-background-dark shadow-lg">This Week</button>
<button class="px-4 py-1.5 text-sm font-medium rounded-md transition-all text-slate-400 hover:text-white">Month</button>
</div>
<div class="flex items-center gap-3 border-l border-primary/20 pl-6">
<div class="text-right">
<p class="text-xs text-slate-400">Store Manager</p>
<p class="text-sm font-semibold">Alex Sterling</p>
</div>
<div class="w-10 h-10 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center overflow-hidden">
<img class="w-full h-full object-cover" data-alt="Manager profile photo portrait" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAY2h2IkG-nER2hbsLEudbX-9yydHGB2P-J6EbQa8kT2hLJJ2ddDCYV6p4wXkiveUyMt3IifELrlIC-XwMnoVUf13WI-Ys1kpHS-0bSFVQh9uDBN_WIxTl38KI8tkbsiw0wqCi9H8wiyBfOB-Sp0t-ZAVuqfkMTcT3QjvrQO51E6P9qRpNlTGbDkXOByaHnSuKPKBRcGrVI-iYyo0WpTXJuH8C_u9ONe5IdAmzxNXwSCjDr2noY7KEZ7y_WrLgMbIEJvw2jVEVz5ojV"/>
</div>
</div>
</div>
</header>
<main class="flex-grow p-8 space-y-8">
<!-- KPI Row -->
<section class="grid grid-cols-5 gap-6">
<!-- Gross Revenue -->
<div class="bg-surface-dark border border-primary/10 rounded-xl p-5 shadow-xl">
<div class="flex justify-between items-start mb-4">
<p class="text-slate-400 text-xs font-medium uppercase tracking-wider">Gross Revenue</p>
<span class="material-icons text-primary/40">payments</span>
</div>
<h3 class="text-2xl font-bold mb-1">Rp 28.450.000</h3>
<p class="text-xs flex items-center gap-1 text-emerald-400">
<span class="material-icons text-sm">trending_up</span>
                    +8.5% <span class="text-slate-500">vs last week</span>
</p>
</div>
<!-- Net Profit -->
<div class="bg-surface-dark border border-primary/10 rounded-xl p-5 shadow-xl">
<div class="flex justify-between items-start mb-4">
<p class="text-slate-400 text-xs font-medium uppercase tracking-wider">Net Profit</p>
<span class="px-2 py-0.5 bg-primary/20 text-primary text-[10px] rounded font-bold">30% MARGIN</span>
</div>
<h3 class="text-2xl font-bold mb-1">Rp 8.535.000</h3>
<p class="text-xs text-slate-500">Calculated after overheads</p>
</div>
<!-- COGS -->
<div class="bg-surface-dark border border-primary/10 rounded-xl p-5 shadow-xl">
<div class="flex justify-between items-start mb-4">
<p class="text-slate-400 text-xs font-medium uppercase tracking-wider">COGS</p>
<span class="material-icons text-accent-blue/40">inventory_2</span>
</div>
<h3 class="text-2xl font-bold mb-1 text-accent-blue">Rp 11.380.000</h3>
<p class="text-xs flex items-center gap-1 text-accent-blue/80">
<span class="material-icons text-sm">trending_down</span>
                    -2.1% <span class="text-slate-500">efficiency gain</span>
</p>
</div>
<!-- Total Customers -->
<div class="bg-surface-dark border border-primary/10 rounded-xl p-5 shadow-xl">
<div class="flex justify-between items-start mb-4">
<p class="text-slate-400 text-xs font-medium uppercase tracking-wider">Total Customers</p>
<span class="material-icons text-primary/40">groups</span>
</div>
<h3 class="text-2xl font-bold mb-1">189</h3>
<p class="text-xs text-slate-500">Avg. Rp 150k / visit</p>
</div>
<!-- Staff Hours -->
<div class="bg-surface-dark border border-primary/10 rounded-xl p-5 shadow-xl">
<div class="flex justify-between items-start mb-4">
<p class="text-slate-400 text-xs font-medium uppercase tracking-wider">Staff Hours</p>
<span class="material-icons text-primary/40">schedule</span>
</div>
<h3 class="text-2xl font-bold mb-1">142h</h3>
<p class="text-xs text-slate-500">Across 6 active staff</p>
</div>
</section>
<!-- Charts Grid -->
<section class="grid grid-cols-2 gap-8">
<!-- Top Left: Revenue vs COGS -->
<div class="bg-surface-dark border border-primary/5 rounded-xl p-6 shadow-xl flex flex-col">
<div class="flex justify-between items-center mb-6">
<h4 class="font-bold text-lg">Revenue vs COGS</h4>
<div class="flex gap-4 text-xs">
<div class="flex items-center gap-1.5"><span class="w-3 h-3 rounded-full bg-primary"></span> Revenue</div>
<div class="flex items-center gap-1.5"><span class="w-3 h-3 rounded-full bg-primary/30"></span> COGS</div>
</div>
</div>
<div class="flex-grow flex items-end justify-between gap-4 h-64 px-2">
<!-- Monday -->
<div class="flex-1 flex flex-col items-center gap-2 group">
<div class="w-full relative h-48 flex flex-col justify-end">
<div class="w-full bg-primary/30 rounded-t h-[40%] transition-all group-hover:bg-primary/40"></div>
<div class="w-full bg-primary rounded-b h-[60%] transition-all group-hover:brightness-110"></div>
</div>
<span class="text-[10px] text-slate-500">MON</span>
</div>
<!-- Tuesday -->
<div class="flex-1 flex flex-col items-center gap-2 group">
<div class="w-full relative h-48 flex flex-col justify-end">
<div class="w-full bg-primary/30 rounded-t h-[35%] transition-all group-hover:bg-primary/40"></div>
<div class="w-full bg-primary rounded-b h-[65%] transition-all group-hover:brightness-110"></div>
</div>
<span class="text-[10px] text-slate-500">TUE</span>
</div>
<!-- Wednesday -->
<div class="flex-1 flex flex-col items-center gap-2 group">
<div class="w-full relative h-48 flex flex-col justify-end">
<div class="w-full bg-primary/30 rounded-t h-[45%] transition-all group-hover:bg-primary/40"></div>
<div class="w-full bg-primary rounded-b h-[55%] transition-all group-hover:brightness-110"></div>
</div>
<span class="text-[10px] text-slate-500">WED</span>
</div>
<!-- Thursday -->
<div class="flex-1 flex flex-col items-center gap-2 group">
<div class="w-full relative h-48 flex flex-col justify-end">
<div class="w-full bg-primary/30 rounded-t h-[30%] transition-all group-hover:bg-primary/40"></div>
<div class="w-full bg-primary rounded-b h-[70%] transition-all group-hover:brightness-110"></div>
</div>
<span class="text-[10px] text-slate-500">THU</span>
</div>
<!-- Friday -->
<div class="flex-1 flex flex-col items-center gap-2 group">
<div class="w-full relative h-48 flex flex-col justify-end">
<div class="w-full bg-primary/30 rounded-t h-[42%] transition-all group-hover:bg-primary/40"></div>
<div class="w-full bg-primary rounded-b h-[58%] transition-all group-hover:brightness-110"></div>
</div>
<span class="text-[10px] text-slate-500">FRI</span>
</div>
<!-- Saturday -->
<div class="flex-1 flex flex-col items-center gap-2 group">
<div class="w-full relative h-48 flex flex-col justify-end">
<div class="w-full bg-primary/30 rounded-t h-[25%] transition-all group-hover:bg-primary/40"></div>
<div class="w-full bg-primary rounded-b h-[75%] transition-all group-hover:brightness-110"></div>
</div>
<span class="text-[10px] text-slate-500 font-bold text-primary/60">SAT</span>
</div>
<!-- Sunday -->
<div class="flex-1 flex flex-col items-center gap-2 group">
<div class="w-full relative h-48 flex flex-col justify-end">
<div class="w-full bg-primary/30 rounded-t h-[28%] transition-all group-hover:bg-primary/40"></div>
<div class="w-full bg-primary rounded-b h-[72%] transition-all group-hover:brightness-110"></div>
</div>
<span class="text-[10px] text-slate-500 font-bold text-primary/60">SUN</span>
</div>
</div>
</div>
<!-- Top Right: Hourly Heatmap -->
<div class="bg-surface-dark border border-primary/5 rounded-xl p-6 shadow-xl">
<div class="flex justify-between items-center mb-6">
<h4 class="font-bold text-lg">Hourly Sales Heatmap</h4>
<span class="text-[10px] text-slate-400 uppercase">Traffic Intensity</span>
</div>
<div class="space-y-1">
<div class="flex text-[8px] text-slate-500 mb-2 pl-8">
<div class="flex-grow flex justify-between">
<span>00:00</span><span>04:00</span><span>08:00</span><span>12:00</span><span>16:00</span><span>20:00</span><span>23:59</span>
</div>
</div>
<!-- Rendering Heatmap Rows -->
<div class="flex items-center gap-2">
<span class="text-[10px] text-slate-500 w-6">MON</span>
<div class="heatmap-grid flex-grow h-4">
<!-- JS would generate these; manually creating patterns -->
<div class="bg-primary/5 rounded-sm"></div><div class="bg-primary/5 rounded-sm"></div><div class="bg-primary/5 rounded-sm"></div><div class="bg-primary/5 rounded-sm"></div><div class="bg-primary/10 rounded-sm"></div><div class="bg-primary/20 rounded-sm"></div><div class="bg-primary/40 rounded-sm"></div><div class="bg-primary/80 rounded-sm"></div><div class="bg-primary rounded-sm shadow-sm shadow-primary/20"></div><div class="bg-primary/60 rounded-sm"></div><div class="bg-primary/40 rounded-sm"></div><div class="bg-primary/20 rounded-sm"></div><div class="bg-primary/40 rounded-sm"></div><div class="bg-primary/60 rounded-sm"></div><div class="bg-primary rounded-sm shadow-sm shadow-primary/20"></div><div class="bg-primary/80 rounded-sm"></div><div class="bg-primary/60 rounded-sm"></div><div class="bg-primary/40 rounded-sm"></div><div class="bg-primary/20 rounded-sm"></div><div class="bg-primary/10 rounded-sm"></div><div class="bg-primary/5 rounded-sm"></div><div class="bg-primary/5 rounded-sm"></div><div class="bg-primary/5 rounded-sm"></div><div class="bg-primary/5 rounded-sm"></div>
</div>
</div>
<!-- Repeat for other days (condensed for visual representation) -->
<div class="flex items-center gap-2">
<span class="text-[10px] text-slate-500 w-6">TUE</span>
<div class="heatmap-grid flex-grow h-4">
<div class="bg-primary/5 rounded-sm"></div><div class="bg-primary/5 rounded-sm"></div><div class="bg-primary/5 rounded-sm"></div><div class="bg-primary/10 rounded-sm"></div><div class="bg-primary/10 rounded-sm"></div><div class="bg-primary/30 rounded-sm"></div><div class="bg-primary/60 rounded-sm"></div><div class="bg-primary rounded-sm"></div><div class="bg-primary rounded-sm"></div><div class="bg-primary/80 rounded-sm"></div><div class="bg-primary/40 rounded-sm"></div><div class="bg-primary/20 rounded-sm"></div><div class="bg-primary/30 rounded-sm"></div><div class="bg-primary/50 rounded-sm"></div><div class="bg-primary/70 rounded-sm"></div><div class="bg-primary/90 rounded-sm"></div><div class="bg-primary/60 rounded-sm"></div><div class="bg-primary/30 rounded-sm"></div><div class="bg-primary/10 rounded-sm"></div><div class="bg-primary/5 rounded-sm"></div><div class="bg-primary/5 rounded-sm"></div><div class="bg-primary/5 rounded-sm"></div><div class="bg-primary/5 rounded-sm"></div><div class="bg-primary/5 rounded-sm"></div>
</div>
</div>
<div class="flex items-center gap-2">
<span class="text-[10px] text-slate-500 w-6">WED</span>
<div class="heatmap-grid flex-grow h-4"><div class="bg-primary/5 rounded-sm"></div><div class="bg-primary/5 rounded-sm"></div><div class="bg-primary/5 rounded-sm"></div><div class="bg-primary/5 rounded-sm"></div><div class="bg-primary/10 rounded-sm"></div><div class="bg-primary/20 rounded-sm"></div><div class="bg-primary/50 rounded-sm"></div><div class="bg-primary/80 rounded-sm"></div><div class="bg-primary rounded-sm"></div><div class="bg-primary/90 rounded-sm"></div><div class="bg-primary/70 rounded-sm"></div><div class="bg-primary/50 rounded-sm"></div><div class="bg-primary/40 rounded-sm"></div><div class="bg-primary/60 rounded-sm"></div><div class="bg-primary/80 rounded-sm"></div><div class="bg-primary rounded-sm"></div><div class="bg-primary/80 rounded-sm"></div><div class="bg-primary/50 rounded-sm"></div><div class="bg-primary/30 rounded-sm"></div><div class="bg-primary/10 rounded-sm"></div><div class="bg-primary/5 rounded-sm"></div><div class="bg-primary/5 rounded-sm"></div><div class="bg-primary/5 rounded-sm"></div><div class="bg-primary/5 rounded-sm"></div></div>
</div>
<div class="flex items-center gap-2">
<span class="text-[10px] text-slate-500 w-6">THU</span>
<div class="heatmap-grid flex-grow h-4"><div class="bg-primary/5 rounded-sm"></div><div class="bg-primary/10 rounded-sm"></div><div class="bg-primary/10 rounded-sm"></div><div class="bg-primary/20 rounded-sm"></div><div class="bg-primary/30 rounded-sm"></div><div class="bg-primary/60 rounded-sm"></div><div class="bg-primary/90 rounded-sm"></div><div class="bg-primary rounded-sm"></div><div class="bg-primary rounded-sm"></div><div class="bg-primary/80 rounded-sm"></div><div class="bg-primary/50 rounded-sm"></div><div class="bg-primary/30 rounded-sm"></div><div class="bg-primary/30 rounded-sm"></div><div class="bg-primary/60 rounded-sm"></div><div class="bg-primary/90 rounded-sm"></div><div class="bg-primary rounded-sm"></div><div class="bg-primary/80 rounded-sm"></div><div class="bg-primary/50 rounded-sm"></div><div class="bg-primary/30 rounded-sm"></div><div class="bg-primary/10 rounded-sm"></div><div class="bg-primary/5 rounded-sm"></div><div class="bg-primary/5 rounded-sm"></div><div class="bg-primary/5 rounded-sm"></div><div class="bg-primary/5 rounded-sm"></div></div>
</div>
<div class="flex items-center gap-2">
<span class="text-[10px] text-slate-500 w-6">FRI</span>
<div class="heatmap-grid flex-grow h-4"><div class="bg-primary/5 rounded-sm"></div><div class="bg-primary/5 rounded-sm"></div><div class="bg-primary/10 rounded-sm"></div><div class="bg-primary/20 rounded-sm"></div><div class="bg-primary/40 rounded-sm"></div><div class="bg-primary/70 rounded-sm"></div><div class="bg-primary/90 rounded-sm"></div><div class="bg-primary rounded-sm"></div><div class="bg-primary rounded-sm"></div><div class="bg-primary/90 rounded-sm"></div><div class="bg-primary/70 rounded-sm"></div><div class="bg-primary/40 rounded-sm"></div><div class="bg-primary/50 rounded-sm"></div><div class="bg-primary/80 rounded-sm"></div><div class="bg-primary rounded-sm"></div><div class="bg-primary rounded-sm"></div><div class="bg-primary/90 rounded-sm"></div><div class="bg-primary/70 rounded-sm"></div><div class="bg-primary/40 rounded-sm"></div><div class="bg-primary/20 rounded-sm"></div><div class="bg-primary/10 rounded-sm"></div><div class="bg-primary/5 rounded-sm"></div><div class="bg-primary/5 rounded-sm"></div><div class="bg-primary/5 rounded-sm"></div></div>
</div>
<div class="flex items-center gap-2">
<span class="text-[10px] text-slate-500 w-6">SAT</span>
<div class="heatmap-grid flex-grow h-4"><div class="bg-primary/10 rounded-sm"></div><div class="bg-primary/10 rounded-sm"></div><div class="bg-primary/20 rounded-sm"></div><div class="bg-primary/30 rounded-sm"></div><div class="bg-primary/60 rounded-sm"></div><div class="bg-primary/90 rounded-sm"></div><div class="bg-primary rounded-sm"></div><div class="bg-primary rounded-sm"></div><div class="bg-primary rounded-sm"></div><div class="bg-primary rounded-sm"></div><div class="bg-primary/90 rounded-sm"></div><div class="bg-primary/80 rounded-sm"></div><div class="bg-primary/90 rounded-sm"></div><div class="bg-primary rounded-sm"></div><div class="bg-primary rounded-sm"></div><div class="bg-primary rounded-sm"></div><div class="bg-primary rounded-sm"></div><div class="bg-primary/90 rounded-sm"></div><div class="bg-primary/70 rounded-sm"></div><div class="bg-primary/50 rounded-sm"></div><div class="bg-primary/30 rounded-sm"></div><div class="bg-primary/20 rounded-sm"></div><div class="bg-primary/10 rounded-sm"></div><div class="bg-primary/10 rounded-sm"></div></div>
</div>
<div class="flex items-center gap-2">
<span class="text-[10px] text-slate-500 w-6">SUN</span>
<div class="heatmap-grid flex-grow h-4"><div class="bg-primary/10 rounded-sm"></div><div class="bg-primary/20 rounded-sm"></div><div class="bg-primary/30 rounded-sm"></div><div class="bg-primary/50 rounded-sm"></div><div class="bg-primary/80 rounded-sm"></div><div class="bg-primary rounded-sm"></div><div class="bg-primary rounded-sm"></div><div class="bg-primary rounded-sm"></div><div class="bg-primary rounded-sm"></div><div class="bg-primary rounded-sm"></div><div class="bg-primary rounded-sm"></div><div class="bg-primary rounded-sm"></div><div class="bg-primary rounded-sm"></div><div class="bg-primary rounded-sm"></div><div class="bg-primary rounded-sm"></div><div class="bg-primary rounded-sm"></div><div class="bg-primary rounded-sm"></div><div class="bg-primary rounded-sm"></div><div class="bg-primary/90 rounded-sm"></div><div class="bg-primary/70 rounded-sm"></div><div class="bg-primary/50 rounded-sm"></div><div class="bg-primary/30 rounded-sm"></div><div class="bg-primary/20 rounded-sm"></div><div class="bg-primary/10 rounded-sm"></div></div>
</div>
</div>
<div class="mt-6 flex justify-between items-center">
<p class="text-[10px] text-slate-500">Peak hours: 10:00 AM &amp; 2:00 PM</p>
<div class="flex gap-1 items-center">
<span class="text-[8px] text-slate-600">LOW</span>
<div class="flex gap-0.5">
<div class="w-2 h-2 rounded-full bg-primary/10"></div>
<div class="w-2 h-2 rounded-full bg-primary/40"></div>
<div class="w-2 h-2 rounded-full bg-primary/70"></div>
<div class="w-2 h-2 rounded-full bg-primary"></div>
</div>
<span class="text-[8px] text-slate-600">HIGH</span>
</div>
</div>
</div>
<!-- Bottom Left: Payment Mix -->
<div class="bg-surface-dark border border-primary/5 rounded-xl p-6 shadow-xl flex flex-col">
<h4 class="font-bold text-lg mb-6">Payment Mix</h4>
<div class="space-y-6 flex-grow flex flex-col justify-center">
<div class="space-y-2">
<div class="flex justify-between text-sm">
<span class="flex items-center gap-2"><span class="w-2 h-2 rounded-full bg-primary"></span> QRIS</span>
<span class="font-semibold text-primary">Rp 12.802.500 (45%)</span>
</div>
<div class="w-full bg-primary/10 h-2 rounded-full overflow-hidden">
<div class="bg-primary h-full rounded-full" style="width: 45%"></div>
</div>
</div>
<div class="space-y-2">
<div class="flex justify-between text-sm">
<span class="flex items-center gap-2"><span class="w-2 h-2 rounded-full bg-amber-200"></span> Cash</span>
<span class="font-semibold text-slate-300">Rp 7.112.500 (25%)</span>
</div>
<div class="w-full bg-primary/10 h-2 rounded-full overflow-hidden">
<div class="bg-amber-200/60 h-full rounded-full" style="width: 25%"></div>
</div>
</div>
<div class="space-y-2">
<div class="flex justify-between text-sm">
<span class="flex items-center gap-2"><span class="w-2 h-2 rounded-full bg-amber-600"></span> EDC Card</span>
<span class="font-semibold text-slate-300">Rp 5.690.000 (20%)</span>
</div>
<div class="w-full bg-primary/10 h-2 rounded-full overflow-hidden">
<div class="bg-amber-600 h-full rounded-full" style="width: 20%"></div>
</div>
</div>
<div class="space-y-2">
<div class="flex justify-between text-sm">
<span class="flex items-center gap-2"><span class="w-2 h-2 rounded-full bg-amber-900"></span> Others</span>
<span class="font-semibold text-slate-300">Rp 2.845.000 (10%)</span>
</div>
<div class="w-full bg-primary/10 h-2 rounded-full overflow-hidden">
<div class="bg-amber-900 h-full rounded-full" style="width: 10%"></div>
</div>
</div>
</div>
</div>
<!-- Bottom Right: Staff Performance -->
<div class="bg-surface-dark border border-primary/5 rounded-xl p-6 shadow-xl flex flex-col overflow-hidden">
<div class="flex justify-between items-center mb-6">
<h4 class="font-bold text-lg">Staff Performance</h4>
<button class="text-xs text-primary hover:underline uppercase font-semibold">Full Report</button>
</div>
<div class="overflow-auto custom-scrollbar flex-grow">
<table class="w-full text-left">
<thead>
<tr class="text-[10px] uppercase tracking-widest text-slate-500 border-b border-primary/10 pb-2">
<th class="py-3 font-medium">Name</th>
<th class="py-3 font-medium text-center">Orders</th>
<th class="py-3 font-medium text-right">Revenue</th>
<th class="py-3 font-medium text-center">Rating</th>
</tr>
</thead>
<tbody class="divide-y divide-primary/5">
<tr class="group hover:bg-white/5 transition-colors">
<td class="py-4 flex items-center gap-3">
<div class="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary">SM</div>
<span class="text-sm font-medium">Siti Maemunah</span>
</td>
<td class="py-4 text-center text-sm">42</td>
<td class="py-4 text-right text-sm font-bold text-primary">Rp 6.3M</td>
<td class="py-4 text-center">
<div class="flex justify-center text-primary text-xs">
<span class="material-icons text-sm">star</span>
<span class="material-icons text-sm">star</span>
<span class="material-icons text-sm">star</span>
<span class="material-icons text-sm">star</span>
<span class="material-icons text-sm">star_half</span>
</div>
</td>
</tr>
<tr class="group hover:bg-white/5 transition-colors">
<td class="py-4 flex items-center gap-3">
<div class="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary">BS</div>
<span class="text-sm font-medium">Budi Santoso</span>
</td>
<td class="py-4 text-center text-sm">38</td>
<td class="py-4 text-right text-sm font-bold text-primary">Rp 5.7M</td>
<td class="py-4 text-center">
<div class="flex justify-center text-primary text-xs">
<span class="material-icons text-sm">star</span>
<span class="material-icons text-sm">star</span>
<span class="material-icons text-sm">star</span>
<span class="material-icons text-sm">star</span>
<span class="material-icons text-sm text-slate-700">star</span>
</div>
</td>
</tr>
<tr class="group hover:bg-white/5 transition-colors">
<td class="py-4 flex items-center gap-3">
<div class="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary">AR</div>
<span class="text-sm font-medium">Andi Ramlan</span>
</td>
<td class="py-4 text-center text-sm">31</td>
<td class="py-4 text-right text-sm font-bold text-primary">Rp 4.6M</td>
<td class="py-4 text-center">
<div class="flex justify-center text-primary text-xs">
<span class="material-icons text-sm">star</span>
<span class="material-icons text-sm">star</span>
<span class="material-icons text-sm">star</span>
<span class="material-icons text-sm">star_half</span>
<span class="material-icons text-sm text-slate-700">star</span>
</div>
</td>
</tr>
<tr class="group hover:bg-white/5 transition-colors">
<td class="py-4 flex items-center gap-3">
<div class="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary">DW</div>
<span class="text-sm font-medium">Dewi Wulan</span>
</td>
<td class="py-4 text-center text-sm">29</td>
<td class="py-4 text-right text-sm font-bold text-primary">Rp 4.3M</td>
<td class="py-4 text-center">
<div class="flex justify-center text-primary text-xs">
<span class="material-icons text-sm">star</span>
<span class="material-icons text-sm">star</span>
<span class="material-icons text-sm">star</span>
<span class="material-icons text-sm">star</span>
<span class="material-icons text-sm">star</span>
</div>
</td>
</tr>
</tbody>
</table>
</div>
</div>
</section>
</main>
<!-- Bottom Alerts Bar -->
<footer class="sticky bottom-0 bg-surface-dark border-t border-primary/20 p-2 z-50 overflow-hidden">
<div class="flex items-center gap-4 overflow-x-auto no-scrollbar py-1">
<div class="flex-none flex items-center gap-2 px-4 py-1.5 bg-primary/10 border border-primary/20 rounded-lg">
<span class="material-icons text-primary text-lg animate-pulse">warning</span>
<span class="text-xs font-semibold whitespace-nowrap">LOW STOCK:</span>
<span class="text-xs text-slate-400 whitespace-nowrap">Premium Flour (4kg left)</span>
</div>
<div class="flex-none flex items-center gap-2 px-4 py-1.5 bg-accent-red/10 border border-accent-red/20 rounded-lg">
<span class="material-icons text-accent-red text-lg">error_outline</span>
<span class="text-xs font-semibold whitespace-nowrap uppercase">Overdue PO:</span>
<span class="text-xs text-slate-400 whitespace-nowrap">PO-2023-452 (Yesterday)</span>
</div>
<div class="flex-none flex items-center gap-2 px-4 py-1.5 bg-primary/10 border border-primary/20 rounded-lg">
<span class="material-icons text-primary text-lg">receipt_long</span>
<span class="text-xs font-semibold whitespace-nowrap uppercase">Unpaid Invoices:</span>
<span class="text-xs text-slate-400 whitespace-nowrap">3 Vendors (Total Rp 4.2M)</span>
</div>
<div class="flex-none flex items-center gap-2 px-4 py-1.5 bg-accent-blue/10 border border-accent-blue/20 rounded-lg">
<span class="material-icons text-accent-blue text-lg">description</span>
<span class="text-xs font-semibold whitespace-nowrap uppercase">PPN Filing:</span>
<span class="text-xs text-slate-400 whitespace-nowrap">Due in 5 days</span>
</div>
<div class="ml-auto flex items-center gap-4 pr-4 border-l border-white/10 pl-4">
<div class="flex items-center gap-1.5">
<div class="w-2 h-2 rounded-full bg-emerald-500"></div>
<span class="text-[10px] text-slate-500 uppercase font-bold tracking-tighter">System Live</span>
</div>
<span class="text-[10px] text-slate-600 font-mono">192.168.1.104</span>
</div>
</div>
</footer>
</body></html>
      <!-- STITCH_HTML_END -->
    \ }} />
  );
};

export default Manager_Financial_Dashboard;
