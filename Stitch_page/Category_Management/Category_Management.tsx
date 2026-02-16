import React from 'react';

const Category_Management: React.FC = () => {
  return (
    <div dangerouslySetInnerHTML={{ __html: `
      <!-- STITCH_HTML_START -->
      <!DOCTYPE html>

<html class="dark" lang="en"><head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
<title>Customer Category Management | The Breakery</title>
<script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&amp;family=Playfair+Display:wght@600;700&amp;family=JetBrains+Mono:wght@400;500&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<script id="tailwind-config">
        tailwind.config = {
            darkMode: "class",
            theme: {
                extend: {
                    colors: {
                        "primary": "#eebd2b",
                        "background-light": "#f8f7f6",
                        "background-dark": "#0D0D0F", // Deep Onyx
                        "card-dark": "#1A1A1D",      // Surface Charcoal
                        "border-dark": "#2A2A2E",
                    },
                    fontFamily: {
                        "display": ["Inter", "sans-serif"],
                        "serif": ["'Playfair Display'", "serif"],
                        "mono": ["'JetBrains Mono'", "monospace"],
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
        .font-playfair { font-family: 'Playfair Display', serif; }
        .font-jetbrains { font-family: 'JetBrains Mono', monospace; }
        
        .custom-scrollbar::-webkit-scrollbar {
            width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
            background: #0D0D0F;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
            background: #2A2A2E;
            border-radius: 10px;
        }
    </style>
</head>
<body class="bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 min-h-screen flex flex-col font-display">
<!-- Header Navigation -->
<header class="border-b border-primary/10 bg-background-light dark:bg-background-dark/80 backdrop-blur-md sticky top-0 z-40">
<div class="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
<div class="flex items-center gap-3">
<div class="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
<span class="material-icons text-background-dark font-bold">bakery_dining</span>
</div>
<div>
<h1 class="text-xl font-playfair font-bold tracking-tight">The Breakery</h1>
<p class="text-[10px] uppercase tracking-[0.2em] text-primary/80 font-semibold">Management Console</p>
</div>
</div>
<div class="flex items-center gap-6">
<button class="text-slate-400 hover:text-primary transition-colors">
<span class="material-icons">notifications</span>
</button>
<div class="h-8 w-[1px] bg-primary/20"></div>
<div class="flex items-center gap-3">
<div class="text-right">
<p class="text-xs font-semibold">Admin User</p>
<p class="text-[10px] text-slate-500">Super Admin</p>
</div>
<div class="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center border border-primary/30 overflow-hidden">
<img class="w-full h-full object-cover" data-alt="Admin user profile picture" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDVZtsp_WHvEsODS46OUb8z3iZXjmkE6rPLmeltKStyeLLDDVMlJZ32qXWPCRbFQBa-_1O2uk3DD8hQcBXaa_z1QmTVYIoDKgX9aLoDobBWaFWhJ6dZJINjutvKUco4jnV2-56VWvfPRQPc6IFrgNGqIm00kgYELJhzWALtci322_iJ8gjbm9HICdOmHL4BmQ3-aC3mA1qUkR2c90W5kg0CThX2XZERuLf5mLt8ftzmA6BmeQAVm_2nEAHmjut9_Lb6MVWM3CD28Q0r"/>
</div>
</div>
</div>
</div>
</header>
<main class="max-w-7xl mx-auto px-6 py-10 w-full flex-grow relative">
<!-- Page Action Header -->
<div class="flex items-center justify-between mb-10">
<div>
<h2 class="text-3xl font-playfair font-bold dark:text-white">Customer Categories</h2>
<p class="text-slate-500 dark:text-slate-400 mt-1">Manage pricing tiers and customer segments for your bakery.</p>
</div>
<button class="bg-primary hover:bg-primary/90 text-background-dark px-6 py-2.5 rounded-lg font-bold flex items-center gap-2 transition-all transform hover:scale-[1.02] shadow-lg shadow-primary/10">
<span class="material-icons text-xl">add</span>
                New Category
            </button>
</div>
<!-- Categories Grid -->
<div class="grid grid-cols-1 md:grid-cols-2 gap-6 pb-20">
<!-- Category Card: Wholesale -->
<div class="bg-card-dark border border-border-dark p-6 rounded-xl hover:border-primary/40 transition-all group relative overflow-hidden">
<div class="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
<button class="p-2 bg-background-dark border border-border-dark rounded-lg text-slate-400 hover:text-primary hover:border-primary/50 transition-colors">
<span class="material-icons text-sm">edit</span>
</button>
<button class="p-2 bg-background-dark border border-border-dark rounded-lg text-slate-400 hover:text-red-400 hover:border-red-400/50 transition-colors">
<span class="material-icons text-sm">delete</span>
</button>
</div>
<div class="flex justify-between items-start mb-4">
<div>
<h3 class="text-2xl font-playfair font-bold text-white mb-1">Wholesale</h3>
<p class="font-jetbrains text-xs text-primary/60">wholesale-partners</p>
</div>
<span class="px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 text-[10px] font-bold uppercase tracking-wider">
                        Wholesale Tier
                    </span>
</div>
<div class="space-y-4">
<div class="flex items-center gap-3 text-slate-400">
<span class="material-icons text-primary/80">payments</span>
<span class="text-sm">25% Discount Applied to bulk orders</span>
</div>
<div class="flex items-center gap-3 text-slate-400">
<span class="material-icons text-primary/80">group</span>
<span class="text-sm">48 Customers active</span>
</div>
</div>
</div>
<!-- Category Card: Retail -->
<div class="bg-card-dark border border-border-dark p-6 rounded-xl hover:border-primary/40 transition-all group relative">
<div class="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
<button class="p-2 bg-background-dark border border-border-dark rounded-lg text-slate-400 hover:text-primary hover:border-primary/50 transition-colors">
<span class="material-icons text-sm">edit</span>
</button>
<button class="p-2 bg-background-dark border border-border-dark rounded-lg text-slate-400 hover:text-red-400 hover:border-red-400/50 transition-colors">
<span class="material-icons text-sm">delete</span>
</button>
</div>
<div class="flex justify-between items-start mb-4">
<div>
<h3 class="text-2xl font-playfair font-bold text-white mb-1">Retail</h3>
<p class="font-jetbrains text-xs text-primary/60">standard-retail</p>
</div>
<span class="px-3 py-1 rounded-full bg-slate-800 text-slate-400 border border-slate-700 text-[10px] font-bold uppercase tracking-wider">
                        Standard
                    </span>
</div>
<div class="space-y-4">
<div class="flex items-center gap-3 text-slate-400">
<span class="material-icons text-primary/80">sell</span>
<span class="text-sm">Base Price List</span>
</div>
<div class="flex items-center gap-3 text-slate-400">
<span class="material-icons text-primary/80">group</span>
<span class="text-sm">1,204 Customers active</span>
</div>
</div>
</div>
<!-- Category Card: Discount 10% -->
<div class="bg-card-dark border border-border-dark p-6 rounded-xl hover:border-primary/40 transition-all group relative">
<div class="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
<button class="p-2 bg-background-dark border border-border-dark rounded-lg text-slate-400 hover:text-primary hover:border-primary/50 transition-colors">
<span class="material-icons text-sm">edit</span>
</button>
<button class="p-2 bg-background-dark border border-border-dark rounded-lg text-slate-400 hover:text-red-400 hover:border-red-400/50 transition-colors">
<span class="material-icons text-sm">delete</span>
</button>
</div>
<div class="flex justify-between items-start mb-4">
<div>
<h3 class="text-2xl font-playfair font-bold text-white mb-1">Discount 10%</h3>
<p class="font-jetbrains text-xs text-primary/60">discount-tier-1</p>
</div>
<span class="px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 text-[10px] font-bold uppercase tracking-wider">
                        Discount Tier
                    </span>
</div>
<div class="space-y-4">
<div class="flex items-center gap-3 text-slate-400">
<span class="material-icons text-primary/80">percent</span>
<span class="text-sm">10% Discount Applied to all items</span>
</div>
<div class="flex items-center gap-3 text-slate-400">
<span class="material-icons text-primary/80">group</span>
<span class="text-sm">82 Customers active</span>
</div>
</div>
</div>
<!-- Category Card: Hotel Partners -->
<div class="bg-card-dark border border-border-dark p-6 rounded-xl hover:border-primary/40 transition-all group relative">
<div class="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
<button class="p-2 bg-background-dark border border-border-dark rounded-lg text-slate-400 hover:text-primary hover:border-primary/50 transition-colors">
<span class="material-icons text-sm">edit</span>
</button>
<button class="p-2 bg-background-dark border border-border-dark rounded-lg text-slate-400 hover:text-red-400 hover:border-red-400/50 transition-colors">
<span class="material-icons text-sm">delete</span>
</button>
</div>
<div class="flex justify-between items-start mb-4">
<div>
<h3 class="text-2xl font-playfair font-bold text-white mb-1">Hotel Partners</h3>
<p class="font-jetbrains text-xs text-primary/60">hotel-wholesale-special</p>
</div>
<span class="px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 text-[10px] font-bold uppercase tracking-wider">
                        Custom Rule
                    </span>
</div>
<div class="space-y-4">
<div class="flex items-center gap-3 text-slate-400">
<span class="material-icons text-primary/80">location_city</span>
<span class="text-sm">Variable pricing per SKU</span>
</div>
<div class="flex items-center gap-3 text-slate-400">
<span class="material-icons text-primary/80">group</span>
<span class="text-sm">15 Customers active</span>
</div>
</div>
</div>
</div>
<!-- Create Category Modal Overlay -->
<div class="fixed inset-0 bg-background-dark/80 backdrop-blur-sm z-50 flex items-center justify-center p-6">
<div class="bg-card-dark border-2 border-primary/40 w-full max-w-lg rounded-xl shadow-2xl shadow-primary/5 overflow-hidden">
<div class="p-6 border-b border-border-dark flex justify-between items-center">
<div>
<h2 class="text-2xl font-playfair font-bold text-white">Create Category</h2>
<p class="text-xs text-slate-500 mt-1">Add a new customer segment and pricing rule</p>
</div>
<button class="text-slate-500 hover:text-white transition-colors">
<span class="material-icons">close</span>
</button>
</div>
<div class="p-8">
<div class="space-y-6">
<div class="grid grid-cols-2 gap-4">
<div class="space-y-2">
<label class="text-xs font-bold uppercase tracking-widest text-primary/80 block">Category Name</label>
<input class="w-full bg-background-dark border border-border-dark rounded-lg px-4 py-3 text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all placeholder:text-slate-700" placeholder="e.g. VIP Loyalty" type="text"/>
</div>
<div class="space-y-2">
<label class="text-xs font-bold uppercase tracking-widest text-primary/80 block">Slug</label>
<input class="w-full bg-background-dark border border-border-dark rounded-lg px-4 py-3 text-primary/70 font-jetbrains text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all placeholder:text-slate-700" placeholder="vip-loyalty" type="text"/>
</div>
</div>
<div class="space-y-2">
<label class="text-xs font-bold uppercase tracking-widest text-primary/80 block">Price Modifier Type</label>
<div class="relative">
<select class="w-full bg-background-dark border border-border-dark rounded-lg px-4 py-3 text-white appearance-none focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all">
<option>Standard (Base Pricing)</option>
<option>Wholesale (Tiered)</option>
<option>Discount (Flat %)</option>
<option>Custom Rule</option>
</select>
<span class="material-icons absolute right-3 top-3.5 text-slate-500 pointer-events-none">expand_more</span>
</div>
</div>
<div class="space-y-2">
<label class="text-xs font-bold uppercase tracking-widest text-primary/80 block">Discount / Modifier Value (%)</label>
<div class="relative">
<input class="w-full bg-background-dark border border-border-dark rounded-lg px-4 py-3 text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all placeholder:text-slate-700" placeholder="15" type="number"/>
<span class="absolute right-4 top-3.5 text-slate-500 font-mono">%</span>
</div>
</div>
<div class="pt-4 flex gap-4">
<button class="flex-1 border border-border-dark hover:bg-white/5 text-slate-400 py-3 rounded-lg font-bold transition-all">
                                Cancel
                            </button>
<button class="flex-[2] bg-primary hover:bg-primary/90 text-background-dark py-3 rounded-lg font-bold transition-all transform hover:scale-[1.01] shadow-lg shadow-primary/10">
                                Save Category
                            </button>
</div>
</div>
</div>
</div>
</div>
</main>
<!-- Footer Status Bar -->
<footer class="border-t border-primary/10 bg-background-dark py-4 px-6 mt-auto">
<div class="max-w-7xl mx-auto flex justify-between items-center text-[11px] text-slate-600 font-mono">
<div class="flex gap-6">
<span class="flex items-center gap-2">
<span class="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                    System Online
                </span>
<span>DB: live-cluster-01</span>
</div>
<div class="flex gap-4">
<span class="hover:text-primary cursor-pointer transition-colors">Documentation</span>
<span class="hover:text-primary cursor-pointer transition-colors">API Keys</span>
<span>v2.4.0-stable</span>
</div>
</div>
</footer>
</body></html>
      <!-- STITCH_HTML_END -->
    ` }} />
  );
};

export default Category_Management;
