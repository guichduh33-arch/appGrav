import React from 'react';

const Promotions_List_and_Editor: React.FC = () => {
  return (
    <div dangerouslySetInnerHTML={{ __html: `
      <!-- STITCH_HTML_START -->
      <!DOCTYPE html>

<html class="dark" lang="en"><head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
<title>The Breakery - Promotions Management</title>
<script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&amp;family=Playfair+Display:wght@700&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet"/>
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
                        "charcoal": "#1A1A1D",
                        "border-onyx": "#2A2A30",
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
            -webkit-font-smoothing: antialiased;
        }
        .font-playfair {
            font-family: 'Playfair Display', serif;
        }
        .modal-overlay {
            background-color: rgba(0, 0, 0, 0.85);
            backdrop-filter: blur(8px);
        }
    </style>
</head>
<body class="bg-background-light dark:bg-background-dark text-slate-800 dark:text-slate-100 min-h-screen">
<!-- Header -->
<header class="border-b border-border-onyx bg-charcoal/50 backdrop-blur-md sticky top-0 z-40">
<div class="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
<div class="flex items-center gap-4">
<div class="bg-primary/20 p-2 rounded-lg">
<span class="material-icons text-primary text-2xl">percent</span>
</div>
<h1 class="text-2xl font-playfair tracking-tight">Promotions</h1>
</div>
<div class="flex items-center gap-4">
<div class="relative group">
<span class="material-icons absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">search</span>
<input class="bg-charcoal border border-border-onyx rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 w-64" placeholder="Search promotions..." type="text"/>
</div>
<button class="bg-primary hover:bg-primary/90 text-background-dark font-semibold px-4 py-2 rounded-lg flex items-center gap-2 transition-colors">
<span class="material-icons text-xl">add</span>
                    New Promotion
                </button>
</div>
</div>
</header>
<!-- Main Content -->
<main class="max-w-7xl mx-auto px-6 py-8">
<!-- Stats Row -->
<div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
<div class="bg-charcoal border border-border-onyx p-6 rounded-xl">
<p class="text-slate-400 text-sm mb-1 uppercase tracking-wider font-semibold">Active Promotions</p>
<div class="flex items-baseline gap-2">
<span class="text-3xl font-bold">12</span>
<span class="text-emerald-500 text-sm flex items-center"><span class="material-icons text-sm">arrow_upward</span> 2</span>
</div>
</div>
<div class="bg-charcoal border border-border-onyx p-6 rounded-xl">
<p class="text-slate-400 text-sm mb-1 uppercase tracking-wider font-semibold">Redemption Rate</p>
<div class="flex items-baseline gap-2">
<span class="text-3xl font-bold">64.2%</span>
<span class="text-primary text-sm font-medium">+5.4% this week</span>
</div>
</div>
<div class="bg-charcoal border border-border-onyx p-6 rounded-xl">
<p class="text-slate-400 text-sm mb-1 uppercase tracking-wider font-semibold">Total Savings Provided</p>
<div class="flex items-baseline gap-2">
<span class="text-3xl font-bold">\\$12,450</span>
</div>
</div>
</div>
<!-- Promotions List -->
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
<!-- Card 1 -->
<div class="bg-charcoal border border-border-onyx rounded-xl p-6 hover:border-primary/50 transition-colors group relative overflow-hidden">
<div class="flex justify-between items-start mb-4">
<span class="px-2 py-1 bg-emerald-500/10 text-emerald-500 text-[10px] font-bold uppercase tracking-widest rounded border border-emerald-500/20">Active</span>
<button class="text-slate-500 hover:text-white transition-colors">
<span class="material-icons">more_vert</span>
</button>
</div>
<h3 class="text-xl font-bold mb-1">Happy Hour 20% Off</h3>
<p class="text-slate-400 text-sm mb-6">Daily afternoon special on beverage menu.</p>
<div class="space-y-4">
<div>
<div class="flex justify-between text-xs mb-1.5">
<span class="text-slate-500">Usage Progress</span>
<span class="text-slate-300 font-medium">47/100</span>
</div>
<div class="w-full bg-border-onyx rounded-full h-1.5 overflow-hidden">
<div class="bg-primary h-full rounded-full" style="width: 47%"></div>
</div>
</div>
<div class="flex flex-wrap gap-2">
<span class="bg-primary/10 text-primary px-2 py-1 rounded text-xs font-medium border border-primary/20">All Drinks</span>
<span class="bg-border-onyx text-slate-400 px-2 py-1 rounded text-xs">Mon - Fri</span>
</div>
</div>
</div>
<!-- Card 2 -->
<div class="bg-charcoal border border-border-onyx rounded-xl p-6 hover:border-primary/50 transition-colors group relative">
<div class="flex justify-between items-start mb-4">
<span class="px-2 py-1 bg-emerald-500/10 text-emerald-500 text-[10px] font-bold uppercase tracking-widest rounded border border-emerald-500/20">Active</span>
<button class="text-slate-500 hover:text-white transition-colors">
<span class="material-icons">more_vert</span>
</button>
</div>
<h3 class="text-xl font-bold mb-1">Early Bird Croissant</h3>
<p class="text-slate-400 text-sm mb-6">BOGO on all pastries before 9:00 AM.</p>
<div class="space-y-4">
<div>
<div class="flex justify-between text-xs mb-1.5">
<span class="text-slate-500">Usage Progress</span>
<span class="text-slate-300 font-medium">89/100</span>
</div>
<div class="w-full bg-border-onyx rounded-full h-1.5 overflow-hidden">
<div class="bg-primary h-full rounded-full" style="width: 89%"></div>
</div>
</div>
<div class="flex flex-wrap gap-2">
<span class="bg-primary/10 text-primary px-2 py-1 rounded text-xs font-medium border border-primary/20">Pastries</span>
<span class="bg-border-onyx text-slate-400 px-2 py-1 rounded text-xs">Daily</span>
</div>
</div>
</div>
<!-- Card 3 -->
<div class="bg-charcoal border border-border-onyx rounded-xl p-6 hover:border-primary/50 transition-colors group relative">
<div class="flex justify-between items-start mb-4">
<span class="px-2 py-1 bg-slate-500/10 text-slate-500 text-[10px] font-bold uppercase tracking-widest rounded border border-slate-500/20">Scheduled</span>
<button class="text-slate-500 hover:text-white transition-colors">
<span class="material-icons">more_vert</span>
</button>
</div>
<h3 class="text-xl font-bold mb-1">Weekend Family Pack</h3>
<p class="text-slate-400 text-sm mb-6">Fixed \\$10 discount on orders over \\$50.</p>
<div class="space-y-4">
<div>
<div class="flex justify-between text-xs mb-1.5">
<span class="text-slate-500">Usage Progress</span>
<span class="text-slate-300 font-medium">0/250</span>
</div>
<div class="w-full bg-border-onyx rounded-full h-1.5 overflow-hidden">
<div class="bg-primary h-full rounded-full" style="width: 0%"></div>
</div>
</div>
<div class="flex flex-wrap gap-2">
<span class="bg-primary/10 text-primary px-2 py-1 rounded text-xs font-medium border border-primary/20">All Items</span>
<span class="bg-border-onyx text-slate-400 px-2 py-1 rounded text-xs">Sat - Sun</span>
</div>
</div>
</div>
</div>
</main>
<!-- Promotion Editor Modal Overlay -->
<div class="fixed inset-0 z-50 modal-overlay flex items-center justify-center p-6">
<div class="bg-charcoal border border-border-onyx w-full max-w-2xl rounded-xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
<!-- Modal Header -->
<div class="px-8 py-6 border-b border-border-onyx flex justify-between items-center">
<div>
<h2 class="text-xl font-playfair font-bold">Edit Promotion</h2>
<p class="text-slate-400 text-xs mt-1 uppercase tracking-widest">Promotion Details &amp; Rules</p>
</div>
<button class="text-slate-500 hover:text-white transition-colors">
<span class="material-icons">close</span>
</button>
</div>
<!-- Modal Content (Scrollable) -->
<div class="p-8 overflow-y-auto custom-scrollbar">
<div class="space-y-8">
<!-- Title & Desc -->
<div class="grid grid-cols-1 gap-4">
<div class="space-y-1">
<label class="text-sm font-semibold text-slate-300">Promotion Name</label>
<input class="w-full bg-background-dark border-border-onyx rounded-lg text-sm px-4 py-3 focus:ring-primary focus:border-primary" type="text" value="Happy Hour 20% Off"/>
</div>
</div>
<!-- Discount Type Radio Group -->
<div class="space-y-3">
<label class="text-sm font-semibold text-slate-300">Discount Type</label>
<div class="grid grid-cols-3 gap-4">
<label class="relative flex flex-col items-center justify-center p-4 border-2 border-primary bg-primary/5 rounded-xl cursor-pointer">
<input checked="" class="hidden" name="type" type="radio"/>
<span class="material-icons text-primary mb-2">percent</span>
<span class="text-sm font-medium">Percentage</span>
</label>
<label class="relative flex flex-col items-center justify-center p-4 border border-border-onyx bg-background-dark/50 rounded-xl cursor-pointer hover:border-primary/50 transition-colors">
<input class="hidden" name="type" type="radio"/>
<span class="material-icons text-slate-500 mb-2">payments</span>
<span class="text-sm font-medium text-slate-400">Fixed</span>
</label>
<label class="relative flex flex-col items-center justify-center p-4 border border-border-onyx bg-background-dark/50 rounded-xl cursor-pointer hover:border-primary/50 transition-colors">
<input class="hidden" name="type" type="radio"/>
<span class="material-icons text-slate-500 mb-2">shopping_bag</span>
<span class="text-sm font-medium text-slate-400">BOGO</span>
</label>
</div>
</div>
<!-- Conditions Grid -->
<div class="grid grid-cols-2 gap-6">
<div class="space-y-1">
<label class="text-sm font-semibold text-slate-300">Minimum Purchase</label>
<div class="relative">
<span class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm">\\$</span>
<input class="w-full bg-background-dark border-border-onyx rounded-lg text-sm pl-8 pr-4 py-3 focus:ring-primary focus:border-primary" type="number" value="10.00"/>
</div>
</div>
<div class="space-y-1">
<label class="text-sm font-semibold text-slate-300">Discount Value (%)</label>
<input class="w-full bg-background-dark border-border-onyx rounded-lg text-sm px-4 py-3 focus:ring-primary focus:border-primary" type="number" value="20"/>
</div>
</div>
<!-- Time & Schedule -->
<div class="space-y-4">
<label class="text-sm font-semibold text-slate-300">Availability</label>
<div class="grid grid-cols-2 gap-4">
<div class="flex items-center gap-2 bg-background-dark border border-border-onyx rounded-lg px-3 py-2">
<span class="material-icons text-xs text-slate-500">schedule</span>
<input class="bg-transparent border-none text-sm focus:ring-0 p-0 w-full" type="time" value="14:00"/>
</div>
<div class="flex items-center gap-2 bg-background-dark border border-border-onyx rounded-lg px-3 py-2">
<span class="material-icons text-xs text-slate-500">history</span>
<input class="bg-transparent border-none text-sm focus:ring-0 p-0 w-full" type="time" value="17:00"/>
</div>
</div>
<div class="flex justify-between gap-2">
<label class="flex-1">
<input checked="" class="hidden peer" type="checkbox"/>
<div class="text-center py-2 rounded-lg border border-border-onyx bg-background-dark peer-checked:bg-primary peer-checked:text-background-dark peer-checked:border-primary text-xs font-bold transition-all cursor-pointer">MON</div>
</label>
<label class="flex-1">
<input checked="" class="hidden peer" type="checkbox"/>
<div class="text-center py-2 rounded-lg border border-border-onyx bg-background-dark peer-checked:bg-primary peer-checked:text-background-dark peer-checked:border-primary text-xs font-bold transition-all cursor-pointer">TUE</div>
</label>
<label class="flex-1">
<input checked="" class="hidden peer" type="checkbox"/>
<div class="text-center py-2 rounded-lg border border-border-onyx bg-background-dark peer-checked:bg-primary peer-checked:text-background-dark peer-checked:border-primary text-xs font-bold transition-all cursor-pointer">WED</div>
</label>
<label class="flex-1">
<input checked="" class="hidden peer" type="checkbox"/>
<div class="text-center py-2 rounded-lg border border-border-onyx bg-background-dark peer-checked:bg-primary peer-checked:text-background-dark peer-checked:border-primary text-xs font-bold transition-all cursor-pointer">THU</div>
</label>
<label class="flex-1">
<input checked="" class="hidden peer" type="checkbox"/>
<div class="text-center py-2 rounded-lg border border-border-onyx bg-background-dark peer-checked:bg-primary peer-checked:text-background-dark peer-checked:border-primary text-xs font-bold transition-all cursor-pointer">FRI</div>
</label>
<label class="flex-1">
<input class="hidden peer" type="checkbox"/>
<div class="text-center py-2 rounded-lg border border-border-onyx bg-background-dark peer-checked:bg-primary peer-checked:text-background-dark peer-checked:border-primary text-xs font-bold transition-all cursor-pointer">SAT</div>
</label>
<label class="flex-1">
<input class="hidden peer" type="checkbox"/>
<div class="text-center py-2 rounded-lg border border-border-onyx bg-background-dark peer-checked:bg-primary peer-checked:text-background-dark peer-checked:border-primary text-xs font-bold transition-all cursor-pointer">SUN</div>
</label>
</div>
</div>
<!-- Scope Selection -->
<div class="space-y-1">
<label class="text-sm font-semibold text-slate-300">Product Scope</label>
<div class="relative">
<div class="w-full bg-background-dark border border-border-onyx rounded-lg px-4 py-3 flex flex-wrap gap-2 items-center">
<div class="bg-primary/20 text-primary px-2 py-0.5 rounded text-xs flex items-center gap-1 border border-primary/30">
                                    Coffee <span class="material-icons text-[14px] cursor-pointer">close</span>
</div>
<div class="bg-primary/20 text-primary px-2 py-0.5 rounded text-xs flex items-center gap-1 border border-primary/30">
                                    Tea <span class="material-icons text-[14px] cursor-pointer">close</span>
</div>
<div class="bg-primary/20 text-primary px-2 py-0.5 rounded text-xs flex items-center gap-1 border border-primary/30">
                                    Smoothies <span class="material-icons text-[14px] cursor-pointer">close</span>
</div>
<span class="text-slate-500 text-sm ml-2">Add more...</span>
</div>
</div>
</div>
<!-- Limits -->
<div class="grid grid-cols-2 gap-6">
<div class="space-y-1">
<label class="text-sm font-semibold text-slate-300">Total Usage Limit</label>
<input class="w-full bg-background-dark border-border-onyx rounded-lg text-sm px-4 py-3 focus:ring-primary focus:border-primary" type="number" value="100"/>
</div>
<div class="space-y-1">
<label class="text-sm font-semibold text-slate-300">Limit per Customer</label>
<input class="w-full bg-background-dark border-border-onyx rounded-lg text-sm px-4 py-3 focus:ring-primary focus:border-primary" type="number" value="1"/>
</div>
</div>
</div>
</div>
<!-- Modal Footer -->
<div class="px-8 py-6 border-t border-border-onyx flex justify-end gap-3 bg-charcoal">
<button class="px-6 py-2.5 rounded-lg text-sm font-semibold text-slate-400 hover:text-white transition-colors">Cancel</button>
<button class="bg-primary hover:bg-primary/90 text-background-dark px-8 py-2.5 rounded-lg text-sm font-bold shadow-lg shadow-primary/10 transition-colors">Save Promotion</button>
</div>
</div>
</div>

\\`\\`\\`</body></html>
      <!-- STITCH_HTML_END -->
    ` }} />
  );
};

export default Promotions_List_and_Editor;
