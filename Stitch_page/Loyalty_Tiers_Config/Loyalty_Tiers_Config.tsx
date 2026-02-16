import React from 'react';

const Loyalty_Tiers_Config: React.FC = () => {
  return (
    <div dangerouslySetInnerHTML={{ __html: `
      <!-- STITCH_HTML_START -->
      <!DOCTYPE html>

<html class="dark" lang="en"><head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
<title>The Breakery - Loyalty Tiers Config</title>
<script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
<link href="https://fonts.googleapis.com/css2?family=Epilogue:wght@300;400;500;600;700&amp;family=Playfair+Display:wght@600;700&amp;display=swap" rel="stylesheet"/>
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
                        "background-dark": "#1a1814",
                        "card-dark": "#221d10",
                        "surface-dark": "#2d2719",
                    },
                    fontFamily: {
                        "display": ["Epilogue", "sans-serif"],
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
            font-family: 'Epilogue', sans-serif;
        }
        .serif-title {
            font-family: 'Playfair Display', serif;
        }
        .loyalty-card-gradient-gold {
            background: linear-gradient(135deg, #eebd2b 0%, #8a6d1a 100%);
        }
        .loyalty-card-gradient-platinum {
            background: linear-gradient(135deg, #e5e7eb 0%, #4b5563 100%);
        }
        .custom-scrollbar::-webkit-scrollbar {
            width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
            background: #221d10;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
            background: #eebd2b;
            border-radius: 10px;
        }
    </style>
</head>
<body class="bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 min-h-screen font-display">
<!-- Navigation / Header -->
<header class="border-b border-primary/10 bg-white/5 backdrop-blur-md sticky top-0 z-50">
<div class="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
<div class="flex items-center gap-3">
<div class="bg-primary p-2 rounded-lg">
<span class="material-icons text-background-dark">bakery_dining</span>
</div>
<div>
<h1 class="text-xl font-bold tracking-tight text-primary">THE BREAKERY</h1>
<p class="text-xs uppercase tracking-[0.2em] opacity-60">Management Console</p>
</div>
</div>
<div class="flex items-center gap-6">
<button class="flex items-center gap-2 px-4 py-2 rounded-lg bg-surface-dark border border-primary/20 hover:border-primary/50 transition-colors">
<span class="material-icons text-sm">settings</span>
<span class="text-sm font-medium">Settings</span>
</button>
<div class="h-10 w-10 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center">
<span class="material-icons text-primary">person</span>
</div>
</div>
</div>
</header>
<main class="max-w-7xl mx-auto px-6 py-8">
<!-- Page Title -->
<div class="flex items-center gap-3 mb-10">
<span class="material-icons text-primary text-3xl">favorite</span>
<h2 class="serif-title text-[28px] font-bold">Loyalty Program</h2>
</div>
<!-- Top Overview Bar -->
<div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
<div class="md:col-span-2 bg-card-dark rounded-xl p-6 border border-primary/10 flex items-center justify-between">
<div class="flex items-center gap-6">
<div>
<p class="text-sm text-primary/60 uppercase tracking-wider font-semibold mb-1">Points Earning Rate</p>
<div class="flex items-center gap-3">
<span class="text-2xl font-bold">1.5</span>
<span class="text-slate-400">points per \\$1.00 spent</span>
</div>
</div>
<div class="h-12 w-[1px] bg-primary/20"></div>
<div>
<p class="text-sm text-primary/60 uppercase tracking-wider font-semibold mb-1">Active Members</p>
<span class="text-2xl font-bold">12,482</span>
</div>
</div>
<div class="flex items-center gap-4 bg-surface-dark px-6 py-3 rounded-xl border border-primary/20">
<span class="text-sm font-medium">Program Status</span>
<label class="relative inline-flex items-center cursor-pointer">
<input checked="" class="sr-only peer" type="checkbox"/>
<div class="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
</label>
<span class="text-xs font-bold text-primary uppercase">Active</span>
</div>
</div>
<div class="bg-primary rounded-xl p-6 flex flex-col justify-between relative overflow-hidden group">
<div class="relative z-10">
<p class="text-background-dark/70 text-sm font-bold uppercase tracking-wider">Projected Growth</p>
<h3 class="text-background-dark text-3xl font-bold">+24%</h3>
</div>
<div class="relative z-10 mt-4 flex items-center gap-2 text-background-dark/80 font-medium">
<span class="material-icons text-sm">trending_up</span>
<span>Next 30 days</span>
</div>
<!-- Abstract Pattern background -->
<div class="absolute -right-4 -bottom-4 opacity-20">
<span class="material-icons text-9xl text-background-dark rotate-12">auto_awesome</span>
</div>
</div>
</div>
<div class="grid grid-cols-1 lg:grid-cols-12 gap-8">
<!-- Tier Configuration Table Section -->
<div class="lg:col-span-8">
<div class="bg-card-dark rounded-xl border border-primary/10 overflow-hidden">
<div class="px-6 py-4 border-b border-primary/10 flex justify-between items-center">
<h3 class="font-bold text-lg">Tier Configuration</h3>
<button class="text-primary text-sm font-bold flex items-center gap-1 hover:underline">
<span class="material-icons text-sm">add</span> Add New Tier
                        </button>
</div>
<div class="overflow-x-auto">
<table class="w-full text-left">
<thead class="bg-surface-dark/50 text-xs uppercase tracking-widest text-primary/60 font-bold">
<tr>
<th class="px-6 py-4">Tier Name</th>
<th class="px-6 py-4">Threshold</th>
<th class="px-6 py-4">Discount</th>
<th class="px-6 py-4">Color</th>
<th class="px-6 py-4 text-right">Distribution</th>
</tr>
</thead>
<tbody class="divide-y divide-primary/5">
<!-- Bronze -->
<tr class="hover:bg-primary/5 transition-colors group cursor-pointer">
<td class="px-6 py-5">
<div class="flex items-center gap-3">
<span class="material-icons text-[#cd7f32] text-xl">star_border</span>
<div>
<p class="font-bold text-sm">Bronze</p>
<p class="text-xs opacity-50 italic">Entry Level</p>
</div>
</div>
</td>
<td class="px-6 py-5">
<div class="flex items-center gap-1">
<input class="bg-surface-dark border-none rounded p-1 w-16 text-sm font-mono text-center focus:ring-1 focus:ring-primary" type="text" value="0"/>
<span class="text-[10px] opacity-40">PTS</span>
</div>
</td>
<td class="px-6 py-5 text-sm font-bold">0%</td>
<td class="px-6 py-5">
<div class="w-6 h-6 rounded-full bg-[#cd7f32] border-2 border-white/20 shadow-lg"></div>
</td>
<td class="px-6 py-5">
<div class="flex flex-col items-end gap-1">
<span class="text-xs font-mono opacity-60">6,241 users</span>
<div class="w-24 h-1.5 bg-surface-dark rounded-full overflow-hidden">
<div class="bg-[#cd7f32] h-full w-[50%]"></div>
</div>
</div>
</td>
</tr>
<!-- Silver -->
<tr class="hover:bg-primary/5 transition-colors group cursor-pointer">
<td class="px-6 py-5">
<div class="flex items-center gap-3">
<div class="flex">
<span class="material-icons text-slate-400 text-sm">star</span>
<span class="material-icons text-slate-400 text-sm">star</span>
</div>
<div>
<p class="font-bold text-sm">Silver</p>
<p class="text-xs opacity-50 italic">Frequent Baker</p>
</div>
</div>
</td>
<td class="px-6 py-5">
<div class="flex items-center gap-1">
<input class="bg-surface-dark border-none rounded p-1 w-16 text-sm font-mono text-center focus:ring-1 focus:ring-primary" type="text" value="500"/>
<span class="text-[10px] opacity-40">PTS</span>
</div>
</td>
<td class="px-6 py-5 text-sm font-bold text-primary">5%</td>
<td class="px-6 py-5">
<div class="w-6 h-6 rounded-full bg-slate-400 border-2 border-white/20 shadow-lg"></div>
</td>
<td class="px-6 py-5">
<div class="flex flex-col items-end gap-1">
<span class="text-xs font-mono opacity-60">3,812 users</span>
<div class="w-24 h-1.5 bg-surface-dark rounded-full overflow-hidden">
<div class="bg-slate-400 h-full w-[30%]"></div>
</div>
</div>
</td>
</tr>
<!-- Gold -->
<tr class="bg-primary/5 border-l-2 border-primary group cursor-pointer">
<td class="px-6 py-5">
<div class="flex items-center gap-3">
<div class="flex">
<span class="material-icons text-primary text-sm">star</span>
<span class="material-icons text-primary text-sm">star</span>
<span class="material-icons text-primary text-sm">star</span>
</div>
<div>
<p class="font-bold text-sm">Gold</p>
<p class="text-xs text-primary font-medium">Artisan Enthusiast</p>
</div>
</div>
</td>
<td class="px-6 py-5">
<div class="flex items-center gap-1">
<input class="bg-surface-dark border border-primary/40 rounded p-1 w-16 text-sm font-mono text-center focus:ring-1 focus:ring-primary" type="text" value="1,500"/>
<span class="text-[10px] text-primary">PTS</span>
</div>
</td>
<td class="px-6 py-5 text-sm font-bold text-primary">10%</td>
<td class="px-6 py-5">
<div class="w-6 h-6 rounded-full bg-primary border-2 border-white/20 shadow-lg ring-2 ring-primary/30"></div>
</td>
<td class="px-6 py-5">
<div class="flex flex-col items-end gap-1">
<span class="text-xs font-mono text-primary font-bold">1,945 users</span>
<div class="w-24 h-1.5 bg-surface-dark rounded-full overflow-hidden">
<div class="bg-primary h-full w-[15%]"></div>
</div>
</div>
</td>
</tr>
<!-- Platinum -->
<tr class="hover:bg-primary/5 transition-colors group cursor-pointer">
<td class="px-6 py-5">
<div class="flex items-center gap-3">
<span class="material-icons text-indigo-300 text-xl">workspace_premium</span>
<div>
<p class="font-bold text-sm">Platinum</p>
<p class="text-xs opacity-50 italic">The Master Baker</p>
</div>
</div>
</td>
<td class="px-6 py-5">
<div class="flex items-center gap-1">
<input class="bg-surface-dark border-none rounded p-1 w-16 text-sm font-mono text-center focus:ring-1 focus:ring-primary" type="text" value="5,000"/>
<span class="text-[10px] opacity-40">PTS</span>
</div>
</td>
<td class="px-6 py-5 text-sm font-bold text-primary">15%</td>
<td class="px-6 py-5">
<div class="w-6 h-6 rounded-full bg-indigo-200 border-2 border-white/20 shadow-lg"></div>
</td>
<td class="px-6 py-5">
<div class="flex flex-col items-end gap-1">
<span class="text-xs font-mono opacity-60">484 users</span>
<div class="w-24 h-1.5 bg-surface-dark rounded-full overflow-hidden">
<div class="bg-indigo-200 h-full w-[4%]"></div>
</div>
</div>
</td>
</tr>
</tbody>
</table>
</div>
</div>
<div class="mt-8 flex justify-end gap-4">
<button class="px-6 py-2.5 rounded-lg font-bold text-sm text-slate-400 hover:text-white transition-colors">Discard Changes</button>
<button class="px-10 py-2.5 rounded-lg font-bold text-sm bg-primary text-background-dark hover:brightness-110 transition-all shadow-lg shadow-primary/20">Save Configuration</button>
</div>
</div>
<!-- Preview Sidebar Section -->
<div class="lg:col-span-4 space-y-6">
<div class="bg-card-dark rounded-xl border border-primary/10 p-6 flex flex-col h-full">
<h3 class="font-bold text-lg mb-6 flex items-center justify-between">
                        Live Preview
                        <span class="px-2 py-0.5 rounded bg-green-500/20 text-green-500 text-[10px] uppercase font-bold tracking-tighter">Live Mockup</span>
</h3>
<!-- Loyalty Card Mockup -->
<div class="relative w-full aspect-[1.6/1] loyalty-card-gradient-gold rounded-2xl p-6 shadow-2xl flex flex-col justify-between overflow-hidden group">
<!-- Card Noise/Texture Overlays could go here, but using pure CSS -->
<div class="absolute top-0 right-0 p-8 opacity-10">
<span class="material-icons text-9xl">bakery_dining</span>
</div>
<div class="flex justify-between items-start relative z-10">
<div>
<h4 class="serif-title text-xl text-background-dark font-bold leading-tight">The Breakery</h4>
<p class="text-[10px] uppercase tracking-widest text-background-dark/60 font-bold">Premium Membership</p>
</div>
<div class="bg-background-dark/90 px-3 py-1 rounded-full border border-white/20">
<span class="text-[10px] font-bold text-primary uppercase">Gold Member</span>
</div>
</div>
<div class="flex items-end justify-between relative z-10">
<div class="space-y-1">
<p class="text-[10px] uppercase tracking-widest text-background-dark/60 font-bold">Member Name</p>
<p class="text-lg font-bold text-background-dark tracking-wide">ALEX DOUGH</p>
</div>
<div class="bg-white p-1 rounded-lg">
<img alt="QR Code" class="w-12 h-12" data-alt="Black and white QR code for membership" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAto2ZKFXd_jUdXxwEYhS7T_eMxfd-ja6RpwIofuzb6HxHLhbhulXVCtfVODFYeOsZtd_bOeEuQxbessQWiQaTp7YZaHjopfy_2o0SwEHB6fuKcTNoeW0TSmbzWaLYk0byJPBO9BlWZvyD-rorb5Z7lLNZZ3tVBf381hCC_nTAMcH80qU7cvO6AOBwQsylKf94K_iQjDQGTNt_PZSxOWU56qDSkuPniplWa_guNXsN-sWsAwooVZ06MK8MQWem51NbW3Gxk0fBHnXFF"/>
</div>
</div>
</div>
<div class="mt-8 space-y-6">
<div>
<p class="text-sm font-bold text-primary mb-4 flex items-center gap-2">
<span class="material-icons text-sm">info</span>
                                Card Details
                            </p>
<div class="space-y-3">
<div class="flex justify-between items-center py-2 border-b border-primary/10">
<span class="text-xs text-slate-400">Card Finish</span>
<span class="text-xs font-bold">Brushed Gold Metallic</span>
</div>
<div class="flex justify-between items-center py-2 border-b border-primary/10">
<span class="text-xs text-slate-400">Typography</span>
<span class="text-xs font-bold">Playfair / Epilogue</span>
</div>
<div class="flex justify-between items-center py-2 border-b border-primary/10">
<span class="text-xs text-slate-400">Benefits</span>
<span class="text-xs font-bold text-primary">10% OFF + Free Pastry</span>
</div>
</div>
</div>
<div class="p-4 bg-surface-dark rounded-xl border border-primary/10">
<p class="text-[10px] uppercase tracking-widest text-primary/60 font-bold mb-3">Customization Options</p>
<div class="flex gap-2">
<button class="flex-1 py-2 bg-background-dark border border-primary/30 rounded-md text-[10px] font-bold uppercase hover:bg-primary hover:text-background-dark transition-all">Upload Logo</button>
<button class="flex-1 py-2 bg-background-dark border border-primary/30 rounded-md text-[10px] font-bold uppercase hover:bg-primary hover:text-background-dark transition-all">Change Font</button>
</div>
</div>
</div>
<div class="mt-auto pt-6 text-center">
<p class="text-[10px] text-slate-500 italic">Visual mockup for digital wallet &amp; physical card rendering.</p>
</div>
</div>
</div>
</div>
</main>
<!-- Footer Decoration -->
<footer class="mt-20 border-t border-primary/10 py-12 bg-surface-dark/30">
<div class="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8">
<div class="flex items-center gap-3">
<span class="material-icons text-primary/40">bakery_dining</span>
<span class="serif-title text-primary/40 font-bold tracking-widest uppercase">The Breakery</span>
</div>
<div class="flex gap-10">
<a class="text-xs font-bold uppercase tracking-widest text-slate-500 hover:text-primary transition-colors" href="#">Documentation</a>
<a class="text-xs font-bold uppercase tracking-widest text-slate-500 hover:text-primary transition-colors" href="#">Support</a>
<a class="text-xs font-bold uppercase tracking-widest text-slate-500 hover:text-primary transition-colors" href="#">API Access</a>
</div>
<p class="text-[10px] text-slate-600 font-mono">© 2024 THE BREAKERY SYSTEM V2.4.1</p>
</div>
</footer>
</body></html>
      <!-- STITCH_HTML_END -->
    ` }} />
  );
};

export default Loyalty_Tiers_Config;
