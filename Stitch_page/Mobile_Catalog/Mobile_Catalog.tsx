import React from 'react';

const Mobile_Catalog: React.FC = () => {
  return (
    <div dangerouslySetInnerHTML={{ __html: \
      <!-- STITCH_HTML_START -->
      <!DOCTYPE html>

<html class="dark" lang="en"><head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
<title>The Breakery Mobile Catalog</title>
<script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&amp;family=JetBrains+Mono:wght@500&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet"/>
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
                        "surface": "#1A1A1D",
                        "input-bg": "#111113",
                    },
                    fontFamily: {
                        "display": ["Inter", "sans-serif"],
                        "mono": ["JetBrains Mono", "monospace"]
                    },
                    borderRadius: {
                        "DEFAULT": "1rem",
                        "lg": "2rem",
                        "xl": "3rem",
                        "full": "9999px",
                    },
                },
            },
        }
    </script>
<style>
        body {
            -webkit-tap-highlight-color: transparent;
        }
        .hide-scrollbar::-webkit-scrollbar {
            display: none;
        }
        .hide-scrollbar {
            -ms-overflow-style: none;
            scrollbar-width: none;
        }
        .iphone-frame {
            width: 390px;
            height: 844px;
            overflow: hidden;
            position: relative;
        }
    </style>
<style>
    body {
      min-height: max(884px, 100dvh);
    }
  </style>
  </head>
<body class="bg-zinc-900 flex items-center justify-center min-h-screen font-display">
<!-- Mobile Device Mockup Container -->
<div class="iphone-frame bg-background-dark text-white shadow-2xl relative border-[8px] border-zinc-800 rounded-[3rem] overflow-hidden">
<!-- Status Bar Area (iOS Style) -->
<div class="h-11 w-full flex justify-between items-center px-8 pt-4">
<span class="text-xs font-bold">9:41</span>
<div class="flex gap-1.5 items-center">
<span class="material-icons text-[14px]">signal_cellular_alt</span>
<span class="material-icons text-[14px]">wifi</span>
<span class="material-icons text-[18px]">battery_full</span>
</div>
</div>
<!-- Header / Search Section -->
<header class="px-6 py-4 space-y-4">
<div class="flex justify-between items-end">
<div>
<h1 class="text-2xl font-bold text-white">The Breakery</h1>
<p class="text-xs text-zinc-500 font-medium">Catalog &amp; Inventory</p>
</div>
<div class="w-10 h-10 rounded-full bg-surface border border-zinc-800 flex items-center justify-center">
<span class="material-icons text-primary text-xl">notifications</span>
</div>
</div>
<!-- Search Bar -->
<div class="relative group">
<span class="material-icons absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-primary transition-colors">search</span>
<input class="w-full bg-input-bg border-none rounded-full py-3.5 pl-12 pr-4 text-sm text-white focus:ring-1 focus:ring-primary placeholder-zinc-600" placeholder="Find products..." type="text"/>
</div>
</header>
<!-- Category Horizontal Scroll -->
<div class="flex overflow-x-auto px-6 py-2 gap-3 hide-scrollbar">
<button class="px-6 py-2 bg-primary text-background-dark font-bold text-sm rounded-full whitespace-nowrap shadow-lg shadow-primary/20">All</button>
<button class="px-6 py-2 bg-surface text-zinc-400 font-semibold text-sm rounded-full whitespace-nowrap hover:bg-zinc-800 border border-zinc-800 transition-colors">Pastries</button>
<button class="px-6 py-2 bg-surface text-zinc-400 font-semibold text-sm rounded-full whitespace-nowrap hover:bg-zinc-800 border border-zinc-800 transition-colors">Breads</button>
<button class="px-6 py-2 bg-surface text-zinc-400 font-semibold text-sm rounded-full whitespace-nowrap hover:bg-zinc-800 border border-zinc-800 transition-colors">Drinks</button>
<button class="px-6 py-2 bg-surface text-zinc-400 font-semibold text-sm rounded-full whitespace-nowrap hover:bg-zinc-800 border border-zinc-800 transition-colors">Coffee</button>
</div>
<!-- Product Grid -->
<main class="px-6 pt-4 pb-32 h-[calc(844px-280px)] overflow-y-auto hide-scrollbar">
<div class="grid grid-cols-2 gap-4">
<!-- Card 1 -->
<div class="bg-surface rounded-2xl p-3 border border-zinc-800 flex flex-col relative group">
<div class="aspect-square rounded-xl bg-zinc-800 overflow-hidden mb-3">
<img class="w-full h-full object-cover" data-alt="Golden brown flaky almond croissant" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCwOCoytgpbYypb0UgFKdFyMIeNaYHo9P71jSgV7i1GseBHmGpscQjuHrUYg0j_gJNnF7ql_OttLfXdcYGRVL902GMCArOJwMjFdgC-EFacrCpexf4nkoCv26YSvQxdjpPsOt_Nf_vWcg8f3GUqzyR0Ji9jng5C4h55FLC_1V3uH0hTPrBTtK5iN6ioLQUZpn-3VN8o9PYFkiWbe411Gepch040s2C6y7_hUQwbhtGe4Fh9e6f4GiFXE-7_dU0x5M49ezdv9r97kwAJ"/>
</div>
<div class="flex items-center gap-1.5 mb-1">
<span class="w-2 h-2 rounded-full bg-emerald-500"></span>
<span class="text-[10px] text-emerald-500 font-bold uppercase tracking-wider">In Stock</span>
</div>
<h3 class="font-bold text-sm text-zinc-100 leading-tight mb-2">Almond Croissant</h3>
<div class="mt-auto flex items-end justify-between">
<span class="font-mono text-primary text-xs font-bold">Rp 35.000</span>
</div>
<button class="absolute bottom-3 right-3 w-10 h-10 bg-primary text-background-dark rounded-full flex items-center justify-center shadow-lg active:scale-95 transition-transform">
<span class="material-icons text-xl">add</span>
</button>
</div>
<!-- Card 2 -->
<div class="bg-surface rounded-2xl p-3 border border-zinc-800 flex flex-col relative">
<div class="aspect-square rounded-xl bg-zinc-800 overflow-hidden mb-3">
<img class="w-full h-full object-cover" data-alt="Rustic freshly baked sourdough loaf" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBL9lzItCjnz0mO87bek8TyUrBBJZy3s-V6kes3MWYIR3cyPEXOYNdexFwhX4pEUwYfA3tcht194bpYCyyPKfeplJGYxD8lyK-JLuZCLGvg7mvqHcS-TKi_e_xJSt5F2O4sfzuGRYh-CzDd3g2E1c0JSFUkJxkBnI_zWuIkC9ZMdgl-PT4F_292GXvkaJqbIwG3-0RER5GbXtvGEd8HPrAAzrjBNfJvbzjXaFlFdkGDzbGR_jewD2PYtewIsnmIqZVFExywWJmMzcGM"/>
</div>
<div class="flex items-center gap-1.5 mb-1">
<span class="w-2 h-2 rounded-full bg-amber-500"></span>
<span class="text-[10px] text-amber-500 font-bold uppercase tracking-wider">Low Stock</span>
</div>
<h3 class="font-bold text-sm text-zinc-100 leading-tight mb-2">Sourdough Loaf</h3>
<div class="mt-auto flex items-end justify-between">
<span class="font-mono text-primary text-xs font-bold">Rp 55.000</span>
</div>
<button class="absolute bottom-3 right-3 w-10 h-10 bg-primary text-background-dark rounded-full flex items-center justify-center shadow-lg active:scale-95 transition-transform">
<span class="material-icons text-xl">add</span>
</button>
</div>
<!-- Card 3 -->
<div class="bg-surface rounded-2xl p-3 border border-zinc-800 flex flex-col relative">
<div class="aspect-square rounded-xl bg-zinc-800 overflow-hidden mb-3">
<img class="w-full h-full object-cover" data-alt="Cold iced oat milk latte with foam" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDtTJVztCIr2sIAC5zAXv-jmfhvGv1VcGARIoYfiBkbEswSU3-0KTwH-r2um_CNY3o3QykYC4w1EkimbpmyCgnSvgYDwLe90aMJhYAPmnm2Khx9HYHiYy5r4NBf31lIni0VelzLW8Uwq1UHeFAR0QoRX_Rvb79TbeIQdHvUiq3lUJAN01JSOFanrKS-u02Ao0hAgWMJFckqDuegL_qYZofddC43R_hFgcTyMYdyeC53EGXB4XNJq521dhPkBbuAW7K9HzRz3kNvNnzF"/>
</div>
<div class="flex items-center gap-1.5 mb-1">
<span class="w-2 h-2 rounded-full bg-emerald-500"></span>
<span class="text-[10px] text-emerald-500 font-bold uppercase tracking-wider">In Stock</span>
</div>
<h3 class="font-bold text-sm text-zinc-100 leading-tight mb-2">Iced Oat Latte</h3>
<div class="mt-auto flex items-end justify-between">
<span class="font-mono text-primary text-xs font-bold">Rp 45.000</span>
</div>
<button class="absolute bottom-3 right-3 w-10 h-10 bg-primary text-background-dark rounded-full flex items-center justify-center shadow-lg active:scale-95 transition-transform">
<span class="material-icons text-xl">add</span>
</button>
</div>
<!-- Card 4 -->
<div class="bg-surface rounded-2xl p-3 border border-zinc-800 flex flex-col relative opacity-75">
<div class="aspect-square rounded-xl bg-zinc-800 overflow-hidden mb-3">
<img class="w-full h-full object-cover" data-alt="Classic French buttery baguette" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBfKBliBYbnFzSvPKxWGkEbfQEx8dBrcs2Cb1mDjaqe2bqWAvCVUjo-FNbZLunexN2w15tUWiUvllSjlO1AVqAK07H1Tqu8ZZIa2_Fy8ClIMZ4xg2DfvqRYpT72Qtbhb0vHfkTG3cL0006IHR0gL-3TwhrPJzdqYmalZuFuJReUmo8cHUeMJlXVksNscSUCbZxRwejtjsej0qfmsa_yLWqT_AQIqrYnaHe5qOsVQ2hc4BnGRm8UmbbZ00UOUrwbrJEr-nh190FAnPAe"/>
</div>
<div class="flex items-center gap-1.5 mb-1">
<span class="w-2 h-2 rounded-full bg-red-500"></span>
<span class="text-[10px] text-red-500 font-bold uppercase tracking-wider">Out of Stock</span>
</div>
<h3 class="font-bold text-sm text-zinc-100 leading-tight mb-2">Baguette Trad.</h3>
<div class="mt-auto flex items-end justify-between">
<span class="font-mono text-primary text-xs font-bold">Rp 28.000</span>
</div>
<button class="absolute bottom-3 right-3 w-10 h-10 bg-zinc-700 text-zinc-400 rounded-full flex items-center justify-center cursor-not-allowed">
<span class="material-icons text-xl">block</span>
</button>
</div>
<!-- Card 5 -->
<div class="bg-surface rounded-2xl p-3 border border-zinc-800 flex flex-col relative">
<div class="aspect-square rounded-xl bg-zinc-800 overflow-hidden mb-3">
<img class="w-full h-full object-cover" data-alt="Espresso in a ceramic cup" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAR8-mZlT5kA6romshCw530--84M_7Me_rmbw0l26fwwFdqF5_Wj_5xxoIlcRews4X-ca_PzgrQiNKA0U6ExCEwgSP4uJktBJsZ3D4w4550kiSTt_NspYkn2d34dqCOMjRIcgW-8MZFyLsjE6WDEkXvnsHnGkZUr6VVMiFytVIc4kPGYOMQ7EGHq31wMDJo0avw0PIwiXyDZ0V_TbkOWHzs8EK3BAOtMoIsVoGIT93WxuKUg5jidTQTm_m4t7TmTziPXb53E5OI0cwQ"/>
</div>
<div class="flex items-center gap-1.5 mb-1">
<span class="w-2 h-2 rounded-full bg-emerald-500"></span>
<span class="text-[10px] text-emerald-500 font-bold uppercase tracking-wider">In Stock</span>
</div>
<h3 class="font-bold text-sm text-zinc-100 leading-tight mb-2">Classic Espresso</h3>
<div class="mt-auto flex items-end justify-between">
<span class="font-mono text-primary text-xs font-bold">Rp 22.000</span>
</div>
<button class="absolute bottom-3 right-3 w-10 h-10 bg-primary text-background-dark rounded-full flex items-center justify-center shadow-lg active:scale-95 transition-transform">
<span class="material-icons text-xl">add</span>
</button>
</div>
<!-- Card 6 -->
<div class="bg-surface rounded-2xl p-3 border border-zinc-800 flex flex-col relative">
<div class="aspect-square rounded-xl bg-zinc-800 overflow-hidden mb-3">
<img class="w-full h-full object-cover" data-alt="Freshly squeezed orange juice" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBq7d085c5FXvtww9a9cFE7xDckERdwj6kqF5TduEX6N1dA0oDnq9M-l9YMIqaJrL-bRv2_r_OP5yVWhmITtxAUFkWlBoVPa2mbAbAzNm7-rCGNyODfQZDNIoBO5cOvfdw6j-xicAQoDuyuonP9vq4MXVALFG6vzeM_HOveQg41nORkOGrFgSI79b0QiIpqOYIW8fo89r2SkrjEf8vJuE4L5uagCAKP8VKaIORGdF_A8QmfUOQ2Wuj9LsZ5eubyeFUoNj4VWvvsETK1"/>
</div>
<div class="flex items-center gap-1.5 mb-1">
<span class="w-2 h-2 rounded-full bg-emerald-500"></span>
<span class="text-[10px] text-emerald-500 font-bold uppercase tracking-wider">In Stock</span>
</div>
<h3 class="font-bold text-sm text-zinc-100 leading-tight mb-2">Fresh Orange Juice</h3>
<div class="mt-auto flex items-end justify-between">
<span class="font-mono text-primary text-xs font-bold">Rp 30.000</span>
</div>
<button class="absolute bottom-3 right-3 w-10 h-10 bg-primary text-background-dark rounded-full flex items-center justify-center shadow-lg active:scale-95 transition-transform">
<span class="material-icons text-xl">add</span>
</button>
</div>
</div>
</main>
<!-- Floating Cart Action Button -->
<div class="absolute bottom-28 right-6 z-20">
<button class="flex items-center gap-3 bg-primary text-background-dark pl-4 pr-6 py-4 rounded-full shadow-2xl shadow-primary/40 active:scale-95 transition-transform ring-4 ring-background-dark">
<div class="relative">
<span class="material-icons text-2xl">shopping_cart</span>
<div class="absolute -top-3 -right-3 bg-white text-background-dark text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center ring-2 ring-primary">4</div>
</div>
<div class="flex flex-col items-start leading-none">
<span class="text-[10px] font-bold uppercase opacity-70">Total</span>
<span class="text-sm font-black font-mono">Rp 185.000</span>
</div>
</button>
</div>
<!-- Bottom Navigation Bar -->
<nav class="absolute bottom-0 w-full bg-surface border-t border-zinc-800 px-6 pt-3 pb-8 flex justify-between items-center z-10">
<div class="flex flex-col items-center gap-1 group cursor-pointer">
<span class="material-icons text-zinc-500 group-hover:text-primary transition-colors">home</span>
<span class="text-[10px] font-bold text-zinc-500 group-hover:text-primary uppercase tracking-tighter">Home</span>
</div>
<div class="flex flex-col items-center gap-1 cursor-pointer">
<span class="material-icons text-primary">grid_view</span>
<span class="text-[10px] font-bold text-primary uppercase tracking-tighter">Catalog</span>
</div>
<div class="flex flex-col items-center gap-1 group cursor-pointer">
<span class="material-icons text-zinc-500 group-hover:text-primary transition-colors">shopping_basket</span>
<span class="text-[10px] font-bold text-zinc-500 group-hover:text-primary uppercase tracking-tighter">Cart</span>
</div>
<div class="flex flex-col items-center gap-1 group cursor-pointer">
<span class="material-icons text-zinc-500 group-hover:text-primary transition-colors">receipt_long</span>
<span class="text-[10px] font-bold text-zinc-500 group-hover:text-primary uppercase tracking-tighter">Orders</span>
</div>
<div class="flex flex-col items-center gap-1 group cursor-pointer">
<span class="material-icons text-zinc-500 group-hover:text-primary transition-colors">person</span>
<span class="text-[10px] font-bold text-zinc-500 group-hover:text-primary uppercase tracking-tighter">Profile</span>
</div>
</nav>
<!-- Home Indicator (iOS Style) -->
<div class="absolute bottom-2 left-1/2 -translate-x-1/2 w-32 h-1 bg-zinc-700 rounded-full"></div>
</div>
</body></html>
      <!-- STITCH_HTML_END -->
    \ }} />
  );
};

export default Mobile_Catalog;
