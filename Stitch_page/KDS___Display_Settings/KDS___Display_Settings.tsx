import React from 'react';

const KDS___Display_Settings: React.FC = () => {
  return (
    <div dangerouslySetInnerHTML={{ __html: \
      <!-- STITCH_HTML_START -->
      <!DOCTYPE html>

<html class="dark" lang="en"><head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
<title>The Breakery - KDS &amp; Display Settings</title>
<script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
<link href="https://fonts.googleapis.com/css2?family=Work+Sans:wght@300;400;500;600;700&amp;family=Playfair+Display:wght@700&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/icon?family=Material+Icons+Outlined" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<script id="tailwind-config">
        tailwind.config = {
            darkMode: "class",
            theme: {
                extend: {
                    colors: {
                        "primary": "#c8a45b",
                        "background-light": "#f8f7f6",
                        "background-dark": "#0D0D0F",
                        "card-dark": "#1A1A1D",
                        "neutral-dark": "#2a2721",
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
            background-color: #0D0D0F;
        }
        .custom-scrollbar::-webkit-scrollbar {
            width: 4px;
            height: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
            background: #1A1A1D;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
            background: #c8a45b33;
            border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background: #c8a45b;
        }
    </style>
</head>
<body class="font-display text-white bg-background-light dark:bg-background-dark min-h-screen">
<div class="flex min-h-screen">
<!-- Sidebar Navigation (Minimal) -->
<aside class="w-20 border-r border-primary/10 flex flex-col items-center py-8 gap-8 bg-background-dark">
<div class="w-12 h-12 rounded-xl bg-primary flex items-center justify-center text-background-dark">
<span class="material-icons-outlined text-3xl">bakery_dining</span>
</div>
<nav class="flex flex-col gap-6">
<div class="p-3 text-white/50 hover:text-primary cursor-pointer transition-colors">
<span class="material-icons-outlined">dashboard</span>
</div>
<div class="p-3 text-white/50 hover:text-primary cursor-pointer transition-colors">
<span class="material-icons-outlined">receipt_long</span>
</div>
<div class="p-3 text-primary bg-primary/10 rounded-xl cursor-pointer">
<span class="material-icons-outlined">settings_input_component</span>
</div>
<div class="p-3 text-white/50 hover:text-primary cursor-pointer transition-colors">
<span class="material-icons-outlined">inventory_2</span>
</div>
<div class="p-3 text-white/50 hover:text-primary cursor-pointer transition-colors">
<span class="material-icons-outlined">settings</span>
</div>
</nav>
</aside>
<!-- Main Content -->
<main class="flex-1 p-8 overflow-y-auto max-w-7xl mx-auto w-full">
<!-- Header -->
<header class="mb-10 flex justify-between items-end">
<div>
<h1 class="font-serif text-3xl text-primary tracking-wide">Kitchen Display &amp; Customer Display</h1>
<p class="text-white/40 mt-1 uppercase text-xs tracking-[0.2em]">Hardware &amp; Routing Configuration</p>
</div>
<div class="flex gap-4">
<button class="px-6 py-2.5 bg-primary/10 text-primary border border-primary/20 rounded-lg hover:bg-primary/20 transition-all font-medium flex items-center gap-2">
<span class="material-icons-outlined text-lg">refresh</span>
                        Sync Hardware
                    </button>
<button class="px-8 py-2.5 bg-primary text-background-dark rounded-lg hover:brightness-110 transition-all font-semibold">
                        Save Display Settings
                    </button>
</div>
</header>
<div class="grid grid-cols-12 gap-8">
<!-- Section 1: KDS Stations -->
<section class="col-span-12 lg:col-span-7 space-y-8">
<div class="bg-card-dark rounded-xl border border-white/5 p-6 shadow-2xl">
<div class="flex justify-between items-center mb-6">
<h2 class="text-xl font-medium flex items-center gap-2">
<span class="material-icons-outlined text-primary">terminal</span>
                                KDS Stations
                            </h2>
<button class="text-primary hover:text-primary/80 flex items-center gap-1 text-sm font-semibold transition-colors">
<span class="material-icons-outlined text-sm">add</span>
                                Add Station
                            </button>
</div>
<div class="overflow-hidden">
<table class="w-full text-left">
<thead class="text-white/30 uppercase text-[10px] tracking-widest border-b border-white/5">
<tr>
<th class="pb-3 font-medium">Station Name</th>
<th class="pb-3 font-medium">Hardware ID</th>
<th class="pb-3 font-medium text-right">Status</th>
</tr>
</thead>
<tbody class="divide-y divide-white/5 text-sm">
<tr class="group hover:bg-white/[0.02]">
<td class="py-4 font-medium text-white/90">Kitchen Main</td>
<td class="py-4 text-white/40 font-mono">#KDS-102-ALPHA</td>
<td class="py-4 text-right">
<div class="flex items-center justify-end gap-2">
<span class="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></span>
<span class="text-emerald-500 font-medium">Connected</span>
</div>
</td>
</tr>
<tr class="group hover:bg-white/[0.02]">
<td class="py-4 font-medium text-white/90">Barista Counter</td>
<td class="py-4 text-white/40 font-mono">#KDS-104-BETA</td>
<td class="py-4 text-right">
<div class="flex items-center justify-end gap-2">
<span class="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></span>
<span class="text-emerald-500 font-medium">Connected</span>
</div>
</td>
</tr>
<tr class="group hover:bg-white/[0.02]">
<td class="py-4 font-medium text-white/90">Expediter Stand</td>
<td class="py-4 text-white/40 font-mono">#KDS-108-GAMMA</td>
<td class="py-4 text-right">
<div class="flex items-center justify-end gap-2">
<span class="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></span>
<span class="text-emerald-500 font-medium">Connected</span>
</div>
</td>
</tr>
</tbody>
</table>
</div>
</div>
<!-- Section 2: Order Routing -->
<div class="bg-card-dark rounded-xl border border-white/5 p-6 shadow-2xl">
<h2 class="text-xl font-medium flex items-center gap-2 mb-6">
<span class="material-icons-outlined text-primary">route</span>
                            Order Routing
                        </h2>
<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
<div class="space-y-4">
<label class="block text-xs uppercase tracking-widest text-white/40 mb-1">Menu Category</label>
<div class="flex items-center gap-4 bg-white/[0.03] p-3 rounded-lg border border-white/5">
<span class="material-icons-outlined text-white/40">bakery_dining</span>
<span class="flex-1 text-sm">Pastries &amp; Croissants</span>
<span class="material-icons-outlined text-white/20 text-sm rotate-90">arrow_forward_ios</span>
</div>
<div class="flex items-center gap-4 bg-white/[0.03] p-3 rounded-lg border border-white/5">
<span class="material-icons-outlined text-white/40">coffee</span>
<span class="flex-1 text-sm">Espresso &amp; Filter</span>
<span class="material-icons-outlined text-white/20 text-sm rotate-90">arrow_forward_ios</span>
</div>
<div class="flex items-center gap-4 bg-white/[0.03] p-3 rounded-lg border border-white/5">
<span class="material-icons-outlined text-white/40">restaurant</span>
<span class="flex-1 text-sm">Savory Breakfast</span>
<span class="material-icons-outlined text-white/20 text-sm rotate-90">arrow_forward_ios</span>
</div>
</div>
<div class="space-y-4">
<label class="block text-xs uppercase tracking-widest text-white/40 mb-1">Target Station</label>
<select class="w-full bg-neutral-dark border-white/10 rounded-lg text-sm focus:border-primary focus:ring-1 focus:ring-primary py-3">
<option>Kitchen Main</option>
<option>Barista Counter</option>
</select>
<select class="w-full bg-neutral-dark border-white/10 rounded-lg text-sm focus:border-primary focus:ring-1 focus:ring-primary py-3">
<option>Barista Counter</option>
<option>Kitchen Main</option>
</select>
<select class="w-full bg-neutral-dark border-white/10 rounded-lg text-sm focus:border-primary focus:ring-1 focus:ring-primary py-3">
<option>Kitchen Main</option>
<option>Barista Counter</option>
</select>
</div>
</div>
</div>
</section>
<!-- Section 3: Alerts & Customer Display -->
<section class="col-span-12 lg:col-span-5 space-y-8">
<!-- Alerts & Timing -->
<div class="bg-card-dark rounded-xl border border-white/5 p-6 shadow-2xl">
<h2 class="text-xl font-medium flex items-center gap-2 mb-6">
<span class="material-icons-outlined text-primary">timer</span>
                            Alerts &amp; Timing
                        </h2>
<div class="space-y-6">
<div class="flex items-center justify-between">
<div>
<p class="text-sm font-medium">Warning Threshold</p>
<p class="text-xs text-white/40">Orders turn amber at this mark</p>
</div>
<div class="flex items-center gap-3">
<input class="w-20 bg-neutral-dark border-white/10 rounded-lg text-center text-amber-500 font-bold focus:border-amber-500 focus:ring-0" type="number" value="5"/>
<span class="text-xs text-white/30 uppercase">Min</span>
</div>
</div>
<div class="flex items-center justify-between">
<div>
<p class="text-sm font-medium">Urgent Threshold</p>
<p class="text-xs text-white/40">Orders turn red &amp; alert sounds</p>
</div>
<div class="flex items-center gap-3">
<input class="w-20 bg-neutral-dark border-white/10 rounded-lg text-center text-red-500 font-bold focus:border-red-500 focus:ring-0" type="number" value="10"/>
<span class="text-xs text-white/30 uppercase">Min</span>
</div>
</div>
<div class="pt-4 border-t border-white/5 flex items-center justify-between">
<p class="text-sm font-medium">Kitchen Audio Alerts</p>
<label class="relative inline-flex items-center cursor-pointer">
<input checked="" class="sr-only peer" type="checkbox"/>
<div class="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
</label>
</div>
</div>
</div>
<!-- Customer Display -->
<div class="bg-card-dark rounded-xl border border-white/5 p-6 shadow-2xl">
<div class="flex justify-between items-center mb-6">
<h2 class="text-xl font-medium flex items-center gap-2">
<span class="material-icons-outlined text-primary">personal_video</span>
                                Customer Display
                            </h2>
<label class="relative inline-flex items-center cursor-pointer">
<input checked="" class="sr-only peer" type="checkbox"/>
<div class="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
</label>
</div>
<div class="mb-6">
<label class="block text-xs uppercase tracking-widest text-white/40 mb-2">Display URL</label>
<div class="flex items-center gap-2">
<input class="flex-1 bg-neutral-dark border-white/10 rounded-lg text-sm text-white/60 focus:ring-0 py-2 px-3 font-mono" readonly="" value="https://display.breakery.app/register-01"/>
<button class="p-2 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors">
<span class="material-icons-outlined text-lg">content_copy</span>
</button>
</div>
</div>
<div>
<div class="flex justify-between items-center mb-3">
<label class="block text-xs uppercase tracking-widest text-white/40">Promotional Carousel</label>
<span class="text-[10px] text-white/30 uppercase">3 images active</span>
</div>
<div class="flex gap-3 overflow-x-auto pb-2 custom-scrollbar">
<div class="relative group flex-shrink-0">
<img alt="" class="w-24 h-24 object-cover rounded-lg border border-white/10 group-hover:opacity-50 transition-opacity" data-alt="Freshly baked croissants on a tray" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDu7faIy_PNhQq88oJi5X2_-N9GOqHpqrZE0KwxQT05IbSWITBJBQ0ascEKPmWkCTaaBTBPAGITClbdV__9WUyiEhlmPco-m6S1JCLJXtK8gOPTGfVrzASefHkxYRT8o5IOVeCxKUq4Fxyqw0Fzx3Y3q_WUYxCcEwVTZ3g01ZmkbUcHiXgOq6YBnoXJ1BgAIkaejF02NUb3bJwVDELEvtN5DGfVmqS6kL5QQ085JYgBNH7_R507fEqVCna2s-SoaNrcWpTo9DZuV1gG"/>
<button class="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
<span class="material-icons-outlined text-red-500 bg-black/60 rounded-full p-1">delete</span>
</button>
</div>
<div class="relative group flex-shrink-0">
<img alt="" class="w-24 h-24 object-cover rounded-lg border border-white/10 group-hover:opacity-50 transition-opacity" data-alt="Artisanal coffee being poured into cup" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAn1iNSEklQrvwCr1MrYeXZeKX_2Bf5pHS6mCAs2GHyzkhmVZv4PJeit_zea4LDXYdZzPXR-tTu-yTzw_A2WYAaqFoE6AE9c4pajKNGKERmHEjUurSZFNf9ALR92rMvDRb4muE9b39aSAPpqdmCdyV5izvv2tQG8kxjlAUbLhhfnjDWys23UEwrKKFksWPnD9t4S-fSOGqBNFETteU8Qld86ocrIg99YyxE1docWVz-tzFTPNiCQaWUPiQGWbbv66dt_n9SYZyMY9Ew"/>
<button class="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
<span class="material-icons-outlined text-red-500 bg-black/60 rounded-full p-1">delete</span>
</button>
</div>
<div class="relative group flex-shrink-0">
<img alt="" class="w-24 h-24 object-cover rounded-lg border border-white/10 group-hover:opacity-50 transition-opacity" data-alt="Baker working with dough in kitchen" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAgJTauUchsGI4XmQhqC6slDQoxPzwlPto7nP9GApm97wslsapDqntrm3w4CGR4BlVLrcx8tGORp_zLmbJ_OwOl292H5V-q2aNRZDk_Srh_WxDHgGvAYYDcQWsmYWrWDVmHieH22MMxPUrz5afSXGYL0RbzkDn66d9F-nCRcmWbr9vW2P_-iAMDhQqR_g4sV8pXzuVMCpOFf8bdGD_inKE0QykXwPl86Ld5C4cNlX4qPauSJf27r-L4GDEEZfWA8nvr6WRbW2evRHeg"/>
<button class="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
<span class="material-icons-outlined text-red-500 bg-black/60 rounded-full p-1">delete</span>
</button>
</div>
<button class="w-24 h-24 rounded-lg border-2 border-dashed border-white/10 flex flex-col items-center justify-center text-white/20 hover:border-primary/50 hover:text-primary transition-all flex-shrink-0">
<span class="material-icons-outlined">add_photo_alternate</span>
<span class="text-[10px] uppercase font-bold mt-1">Add</span>
</button>
</div>
</div>
</div>
</section>
</div>
<!-- Footer Meta -->
<footer class="mt-12 pt-8 border-t border-white/5 flex justify-between items-center text-white/20 text-xs uppercase tracking-widest">
<div>The Breakery Management v4.2.0</div>
<div class="flex gap-6">
<a class="hover:text-primary transition-colors" href="#">Help Documentation</a>
<a class="hover:text-primary transition-colors" href="#">Hardware Support</a>
<a class="hover:text-primary transition-colors" href="#">System Health</a>
</div>
</footer>
</main>
</div>
</body></html>
      <!-- STITCH_HTML_END -->
    \ }} />
  );
};

export default KDS___Display_Settings;
