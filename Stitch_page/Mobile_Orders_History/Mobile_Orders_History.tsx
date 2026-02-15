import React from 'react';

const Mobile_Orders_History: React.FC = () => {
  return (
    <div dangerouslySetInnerHTML={{ __html: \
      <!-- STITCH_HTML_START -->
      <!DOCTYPE html>

<html class="dark" lang="en"><head>
<meta charset="utf-8"/>
<meta content="width=390, height=844, initial-scale=1.0" name="viewport"/>
<script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
<link href="https://fonts.googleapis.com/css2?family=Epilogue:wght@300;400;500;600;700&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/icon?family=Material+Icons+Round" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<script id="tailwind-config">
        tailwind.config = {
            darkMode: "class",
            theme: {
                extend: {
                    colors: {
                        "primary": "#f2a60d",
                        "background-light": "#f8f7f5",
                        "background-dark": "#0D0D0F",
                        "card-dark": "#1A1A1D",
                        "neutral-muted": "#2A2A2E",
                    },
                    fontFamily: {
                        "display": ["Epilogue"]
                    },
                    borderRadius: {
                        "DEFAULT": "1rem",
                        "lg": "2rem",
                        "xl": "3rem",
                        "full": "9999px"
                    },
                },
            },
        }
    </script>
<style>
        body {
            background-color: #0D0D0F;
            color: #f8f7f5;
            -webkit-tap-highlight-color: transparent;
            user-select: none;
        }
        .status-pulse {
            width: 8px;
            height: 8px;
            background-color: currentColor;
            border-radius: 50%;
            margin-right: 6px;
        }
        .ios-blur {
            backdrop-filter: blur(20px);
            -webkit-backdrop-filter: blur(20px);
        }
        .no-scrollbar::-webkit-scrollbar {
            display: none;
        }
        .no-scrollbar {
            -ms-overflow-style: none;
            scrollbar-width: none;
        }
    </style>
<style>
    body {
      min-height: max(884px, 100dvh);
    }
  </style>
  </head>
<body class="font-display bg-background-light dark:bg-background-dark overflow-hidden">
<div class="relative mx-auto w-[390px] h-[844px] flex flex-col shadow-2xl overflow-hidden border-x border-neutral-muted/20">
<!-- Pull to Refresh Indicator -->
<div class="absolute top-12 left-0 right-0 flex justify-center opacity-40">
<span class="material-icons-round text-primary animate-spin">refresh</span>
</div>
<!-- Header -->
<header class="sticky top-0 z-20 pt-12 pb-4 px-6 ios-blur bg-background-dark/80">
<div class="flex justify-between items-end">
<h1 class="text-3xl font-bold tracking-tight">My Orders</h1>
<button class="w-10 h-10 rounded-full bg-neutral-muted flex items-center justify-center hover:bg-neutral-muted/80 active:scale-95 transition-all">
<span class="material-icons-round text-white text-xl">filter_list</span>
</button>
</div>
<!-- Date Filter Pills -->
<div class="flex gap-3 mt-6 overflow-x-auto no-scrollbar pb-2">
<button class="px-5 py-2.5 rounded-full bg-primary text-background-dark font-semibold whitespace-nowrap text-sm">Today</button>
<button class="px-5 py-2.5 rounded-full bg-neutral-muted text-gray-300 font-medium whitespace-nowrap text-sm border border-white/5">Yesterday</button>
<button class="px-5 py-2.5 rounded-full bg-neutral-muted text-gray-300 font-medium whitespace-nowrap text-sm border border-white/5">This Week</button>
<button class="px-5 py-2.5 rounded-full bg-neutral-muted text-gray-300 font-medium whitespace-nowrap text-sm border border-white/5">Last Month</button>
</div>
</header>
<!-- Order List -->
<main class="flex-1 overflow-y-auto px-4 pt-4 pb-32 space-y-4 no-scrollbar">
<!-- Order Card 1: Preparing -->
<div class="bg-card-dark rounded-2xl p-5 border border-white/5 shadow-lg active:scale-[0.98] transition-all">
<div class="flex justify-between items-start mb-3">
<div>
<h2 class="text-white font-bold text-lg leading-none">Order #8842</h2>
<span class="text-gray-500 text-xs font-medium uppercase tracking-wider mt-1 block">10:30 AM</span>
</div>
<div class="flex items-center px-3 py-1.5 rounded-full bg-blue-500/10 text-blue-400 text-[10px] font-bold uppercase tracking-wider">
<span class="status-pulse bg-blue-400 opacity-80"></span>
                        Preparing
                    </div>
</div>
<div class="space-y-1 mb-4">
<div class="flex items-center text-gray-400 text-sm">
<span class="material-icons-round text-base mr-2">shopping_bag</span>
                        3 items • Dine-in • Table 5
                    </div>
</div>
<div class="flex justify-between items-center pt-4 border-t border-white/5">
<div class="text-xl font-bold text-white">$24.50</div>
<a class="text-primary font-bold text-sm uppercase tracking-widest flex items-center hover:opacity-80" href="#">
                        View Details
                        <span class="material-icons-round text-base ml-1">chevron_right</span>
</a>
</div>
</div>
<!-- Order Card 2: Ready -->
<div class="bg-card-dark rounded-2xl p-5 border border-white/5 shadow-lg active:scale-[0.98] transition-all">
<div class="flex justify-between items-start mb-3">
<div>
<h2 class="text-white font-bold text-lg leading-none">Order #8840</h2>
<span class="text-gray-500 text-xs font-medium uppercase tracking-wider mt-1 block">10:15 AM</span>
</div>
<div class="flex items-center px-3 py-1.5 rounded-full bg-green-500/10 text-green-400 text-[10px] font-bold uppercase tracking-wider">
<span class="status-pulse bg-green-400"></span>
                        Ready
                    </div>
</div>
<div class="space-y-1 mb-4">
<div class="flex items-center text-gray-400 text-sm">
<span class="material-icons-round text-base mr-2">delivery_dining</span>
                        1 item • Takeaway • Pickup
                    </div>
</div>
<div class="flex justify-between items-center pt-4 border-t border-white/5">
<div class="text-xl font-bold text-white">$8.00</div>
<a class="text-primary font-bold text-sm uppercase tracking-widest flex items-center hover:opacity-80" href="#">
                        View Details
                        <span class="material-icons-round text-base ml-1">chevron_right</span>
</a>
</div>
</div>
<!-- Order Card 3: Completed -->
<div class="bg-card-dark rounded-2xl p-5 border border-white/5 shadow-lg opacity-70">
<div class="flex justify-between items-start mb-3">
<div>
<h2 class="text-white font-bold text-lg leading-none">Order #8839</h2>
<span class="text-gray-500 text-xs font-medium uppercase tracking-wider mt-1 block">09:45 AM</span>
</div>
<div class="flex items-center px-3 py-1.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-bold uppercase tracking-wider">
<span class="status-pulse bg-emerald-400"></span>
                        Completed
                    </div>
</div>
<div class="space-y-1 mb-4">
<div class="flex items-center text-gray-400 text-sm">
<span class="material-icons-round text-base mr-2">restaurant</span>
                        5 items • Dine-in • Table 2
                    </div>
</div>
<div class="flex justify-between items-center pt-4 border-t border-white/5">
<div class="text-xl font-bold text-white">$42.25</div>
<a class="text-primary font-bold text-sm uppercase tracking-widest flex items-center hover:opacity-80" href="#">
                        View Details
                        <span class="material-icons-round text-base ml-1">chevron_right</span>
</a>
</div>
</div>
<!-- Order Card 4: Completed -->
<div class="bg-card-dark rounded-2xl p-5 border border-white/5 shadow-lg opacity-70">
<div class="flex justify-between items-start mb-3">
<div>
<h2 class="text-white font-bold text-lg leading-none">Order #8835</h2>
<span class="text-gray-500 text-xs font-medium uppercase tracking-wider mt-1 block">08:12 AM</span>
</div>
<div class="flex items-center px-3 py-1.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-bold uppercase tracking-wider">
<span class="status-pulse bg-emerald-400"></span>
                        Completed
                    </div>
</div>
<div class="space-y-1 mb-4">
<div class="flex items-center text-gray-400 text-sm">
<span class="material-icons-round text-base mr-2">shopping_bag</span>
                        2 items • Takeaway • Pickup
                    </div>
</div>
<div class="flex justify-between items-center pt-4 border-t border-white/5">
<div class="text-xl font-bold text-white">$15.50</div>
<a class="text-primary font-bold text-sm uppercase tracking-widest flex items-center hover:opacity-80" href="#">
                        View Details
                        <span class="material-icons-round text-base ml-1">chevron_right</span>
</a>
</div>
</div>
</main>
<!-- Bottom Navigation Bar -->
<nav class="absolute bottom-0 left-0 right-0 h-24 ios-blur bg-background-dark/90 border-t border-white/5 px-8 pb-6 flex justify-between items-center z-30">
<button class="flex flex-col items-center gap-1 group">
<div class="w-12 h-1 bg-primary absolute top-0 rounded-full scale-x-0 transition-transform"></div>
<span class="material-icons-round text-primary text-2xl">assignment</span>
<span class="text-[10px] font-bold uppercase tracking-wider text-primary">Orders</span>
</button>
<button class="flex flex-col items-center gap-1 text-gray-500 active:text-primary transition-colors">
<span class="material-icons-round text-2xl">inventory_2</span>
<span class="text-[10px] font-bold uppercase tracking-wider">Stock</span>
</button>
<button class="flex flex-col items-center gap-1 text-gray-500 active:text-primary transition-colors">
<span class="material-icons-round text-2xl">insights</span>
<span class="text-[10px] font-bold uppercase tracking-wider">Stats</span>
</button>
<button class="flex flex-col items-center gap-1 text-gray-500 active:text-primary transition-colors">
<span class="material-icons-round text-2xl">account_circle</span>
<span class="text-[10px] font-bold uppercase tracking-wider">Profile</span>
</button>
</nav>
<!-- Home Indicator (iOS style) -->
<div class="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-32 h-1.5 bg-white/20 rounded-full z-40"></div>
</div>
</body></html>
      <!-- STITCH_HTML_END -->
    \ }} />
  );
};

export default Mobile_Orders_History;
