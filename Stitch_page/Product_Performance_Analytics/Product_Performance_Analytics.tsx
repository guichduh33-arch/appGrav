import React from 'react';

const Product_Performance_Analytics: React.FC = () => {
  return (
    <div dangerouslySetInnerHTML={{ __html: `
      <!-- STITCH_HTML_START -->
      <!DOCTYPE html>

<html class="dark" lang="en"><head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
<title>The Breakery | Product Performance Analytics</title>
<script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&amp;family=Playfair+Display:wght@600;700;800&amp;family=JetBrains+Mono:wght@400;500&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/icon?family=Material+Icons+Sharp" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<script id="tailwind-config">
      tailwind.config = {
        darkMode: "class",
        theme: {
          extend: {
            colors: {
              "primary": "#f9d406",
              "background-light": "#f8f8f5",
              "background-dark": "#0D0D0F",
              "surface-dark": "#1A1A1C",
            },
            fontFamily: {
              "display": ["Inter", "sans-serif"],
              "serif": ["Playfair Display", "serif"],
              "mono": ["JetBrains Mono", "monospace"],
            },
            borderRadius: {"DEFAULT": "0.5rem", "lg": "1rem", "xl": "1.5rem", "full": "9999px"},
          },
        },
      }
    </script>
<style>
        body { font-family: 'Inter', sans-serif; }
        .serif-heading { font-family: 'Playfair Display', serif; }
        .mono-data { font-family: 'JetBrains Mono', monospace; }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; height: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: #1A1A1C; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #f9d406; border-radius: 10px; }
    </style>
</head>
<body class="bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 min-h-screen">
<!-- Sidebar Navigation (Desktop) -->
<aside class="fixed left-0 top-0 h-full w-20 border-r border-white/5 bg-surface-dark flex flex-col items-center py-8 z-50">
<div class="mb-12">
<div class="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
<span class="material-icons-sharp text-background-dark font-bold">bakery_dining</span>
</div>
</div>
<nav class="flex flex-col gap-8 flex-1">
<button class="text-primary"><span class="material-icons-sharp">dashboard</span></button>
<button class="text-slate-500 hover:text-primary transition-colors"><span class="material-icons-sharp">inventory_2</span></button>
<button class="text-slate-500 hover:text-primary transition-colors"><span class="material-icons-sharp">analytics</span></button>
<button class="text-slate-500 hover:text-primary transition-colors"><span class="material-icons-sharp">settings</span></button>
</nav>
<div class="mt-auto">
<div class="w-10 h-10 rounded-full bg-slate-800 border border-white/10 flex items-center justify-center overflow-hidden">
<img alt="Profile" data-alt="Headshot of a bakery manager portrait" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDkBc40ZzzIzwWcwqgRWh-iTNO6VgtPv8KB8KC6NbnK3OGDl2pDNwYjNoTEnm94C-ls62N3AqWUJDfqyzjSl3jQ6pzT3myDb9cvEpu0wiFebIzqjD7a2TDxoBUPF8AvpxFq5gocgmFcAzVGWDVfTM7k4GNk5_gm4owtvfyOYcrGCS3ViufMn5OCvVBppocKDd2UyI9ocOziiMr_owWZGPBYUiMSpsc7d6W-pbqu6KYFDLPSbTbzNFtHmKVJZn4C2fX_zLXTlRrzECIo"/>
</div>
</div>
</aside>
<!-- Main Content -->
<main class="pl-20 min-h-screen">
<!-- Top Navigation -->
<header class="h-20 border-b border-white/5 flex items-center justify-between px-8 bg-surface-dark/50 backdrop-blur-md sticky top-0 z-40">
<div>
<h1 class="serif-heading text-2xl font-bold tracking-tight">Performance Analytics</h1>
<p class="text-xs text-slate-500 uppercase tracking-widest font-medium">The Breakery • Executive Dashboard</p>
</div>
<div class="flex items-center gap-4">
<div class="flex bg-background-dark/50 border border-white/5 rounded-lg p-1">
<button class="px-4 py-1.5 text-xs font-medium bg-primary text-background-dark rounded-md">Last 30 Days</button>
<button class="px-4 py-1.5 text-xs font-medium text-slate-400 hover:text-slate-200">Quarterly</button>
<button class="px-4 py-1.5 text-xs font-medium text-slate-400 hover:text-slate-200">Yearly</button>
</div>
<button class="flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 px-4 py-2 rounded-lg text-sm transition-all">
<span class="material-icons-sharp text-sm">filter_list</span>
<span>Filters</span>
</button>
</div>
</header>
<div class="p-8 space-y-8">
<!-- Top Performers Table Section -->
<section class="bg-surface-dark border border-white/5 rounded-xl overflow-hidden">
<div class="p-6 border-b border-white/5 flex items-center justify-between">
<h2 class="serif-heading text-xl">Top Performers</h2>
<button class="text-xs text-primary underline underline-offset-4 font-medium">Download Report</button>
</div>
<div class="overflow-x-auto custom-scrollbar">
<table class="w-full text-left border-collapse">
<thead>
<tr class="text-xs text-slate-500 uppercase tracking-widest bg-white/[0.02]">
<th class="px-6 py-4 font-semibold">Rank</th>
<th class="px-6 py-4 font-semibold">Product</th>
<th class="px-6 py-4 font-semibold">Category</th>
<th class="px-6 py-4 font-semibold">Units Sold</th>
<th class="px-6 py-4 font-semibold text-right">Revenue</th>
<th class="px-6 py-4 font-semibold text-center">Margin %</th>
<th class="px-6 py-4 font-semibold text-right">7-Day Trend</th>
</tr>
</thead>
<tbody class="divide-y divide-white/5">
<!-- Top Rank #1 -->
<tr class="bg-primary/5 group hover:bg-primary/[0.08] transition-colors">
<td class="px-6 py-4">
<div class="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-background-dark font-bold text-sm shadow-lg shadow-primary/20">1</div>
</td>
<td class="px-6 py-4">
<div class="flex items-center gap-4">
<div class="w-12 h-12 rounded-lg overflow-hidden border border-primary/20 bg-background-dark">
<img class="w-full h-full object-cover" data-alt="Golden flaky croissant on dark marble" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAhauCI9yC0_DSZ4SFGA9SfPuJ8gV8GLmUafk4pSuH72lQxEW5anAUmYeHPOv4K6qTJ92YiTvnaJGFDILL-wN0K93MVOonk7V14aaCzaonGKZm9LR0Tg8MY0RsXgZY6fV3MiekavMgp-G0xRZM1kYN4-xatQJ0Tc72K2PN8v4TYyJ41HV3RLX8AWWNMRnGBBcVzS2TDnIFBNU931Xf1CuhvGBC_C2hlv4UlBxQSD_HXwoUNbwgvpS2Rf9eiVenjv23hkhTRwSKCLPJx"/>
</div>
<div>
<p class="font-semibold text-slate-100">Classic Croissant</p>
<p class="text-xs text-slate-500 italic">Signature Viennoiserie</p>
</div>
</div>
</td>
<td class="px-6 py-4 text-sm text-slate-400">Pastry</td>
<td class="px-6 py-4 font-medium text-slate-200">842</td>
<td class="px-6 py-4 text-right mono-data text-primary font-bold">€4,631.00</td>
<td class="px-6 py-4 text-center">
<div class="px-2 py-1 rounded bg-emerald-500/10 text-emerald-500 text-xs font-bold inline-block">50%</div>
</td>
<td class="px-6 py-4 text-right">
<svg class="inline-block h-6 w-24" viewbox="0 0 100 20">
<path d="M0 15 Q 10 12, 20 18 T 40 10 T 60 14 T 80 5 T 100 2" fill="none" stroke="#f9d406" stroke-width="2"></path>
</svg>
</td>
</tr>
<!-- Rank #2 -->
<tr class="hover:bg-white/[0.02] transition-colors">
<td class="px-6 py-4 text-slate-500 font-mono pl-9">2</td>
<td class="px-6 py-4">
<div class="flex items-center gap-4">
<div class="w-12 h-12 rounded-lg overflow-hidden border border-white/5 bg-background-dark">
<img class="w-full h-full object-cover" data-alt="Artisanal sourdough bread loaf sliced" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDtaYoAjXVVXqtmqlO-_j4Gt4yN9lqSv1p2aPoSv_wM-lkQFhGW9K8DhBH_cuWtSt1di8PFkE_tuVZJbkkoTBHfx0ixTiPb1edaPY7yV3SGLkmORCEwA5Tr-AKHuin_4ZqTVNMhpK78dtUd462EuoC5DI3_j5lh_yhFcnBMVwhR1qtS-sTYCM8AAxn7eiLcM7cZMllWuqZkYALiQ6tyIdbEwbzlRnB6VS8X5MVa3LXOCIp-W6ZvsdwBWYgQXrDekp2XDRyyLZzHqJTJ"/>
</div>
<div>
<p class="font-semibold text-slate-300">Heritage Sourdough</p>
<p class="text-xs text-slate-600">Daily Bread</p>
</div>
</div>
</td>
<td class="px-6 py-4 text-sm text-slate-400">Bread</td>
<td class="px-6 py-4 font-medium text-slate-400">512</td>
<td class="px-6 py-4 text-right mono-data text-primary/80">€3,584.00</td>
<td class="px-6 py-4 text-center">
<div class="px-2 py-1 rounded bg-emerald-500/10 text-emerald-500 text-xs font-bold inline-block">42%</div>
</td>
<td class="px-6 py-4 text-right">
<svg class="inline-block h-6 w-24" viewbox="0 0 100 20">
<path d="M0 18 Q 20 18, 40 12 T 60 10 T 80 15 T 100 12" fill="none" stroke="#f9d406" stroke-opacity="0.5" stroke-width="2"></path>
</svg>
</td>
</tr>
<!-- Rank #3 -->
<tr class="hover:bg-white/[0.02] transition-colors">
<td class="px-6 py-4 text-slate-500 font-mono pl-9">3</td>
<td class="px-6 py-4">
<div class="flex items-center gap-4">
<div class="w-12 h-12 rounded-lg overflow-hidden border border-white/5 bg-background-dark">
<img class="w-full h-full object-cover" data-alt="Pain au chocolat pastry close up" src="https://lh3.googleusercontent.com/aida-public/AB6AXuA04MCyq5_IErKV9BPpEXJJJufNsfb5iV1u32yz19dW4X4QdIxXH6idL6au3h9tuFGAjketIdzF0BaaMJpx6AmXp91GQ0XF297JGmlZ74p9oNn5vLcaeNnShZbnD_tC4YoU69omHgRdTrdHIiVO8Vc8Tj6BNgc79OaOCeDjW7-Z8BRzcUCMmRhGEDhKMUJ4iVNHIeCxm6GBS_akVDEmr7lTwWTQNFgB0ZeULJH166oVurFCBUaMISjxH4rXFZsGLHpnZkKwuftwFUmT"/>
</div>
<div>
<p class="font-semibold text-slate-300">Pain au Chocolat</p>
<p class="text-xs text-slate-600">Viennoiserie</p>
</div>
</div>
</td>
<td class="px-6 py-4 text-sm text-slate-400">Pastry</td>
<td class="px-6 py-4 font-medium text-slate-400">489</td>
<td class="px-6 py-4 text-right mono-data text-primary/80">€2,934.00</td>
<td class="px-6 py-4 text-center">
<div class="px-2 py-1 rounded bg-emerald-500/10 text-emerald-500 text-xs font-bold inline-block">48%</div>
</td>
<td class="px-6 py-4 text-right">
<svg class="inline-block h-6 w-24" viewbox="0 0 100 20">
<path d="M0 5 Q 20 2, 40 8 T 60 4 T 80 12 T 100 18" fill="none" stroke="#ef4444" stroke-opacity="0.6" stroke-width="2"></path>
</svg>
</td>
</tr>
</tbody>
</table>
</div>
</section>
<!-- Charts Row -->
<div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
<!-- Bar Chart: Revenue -->
<div class="bg-surface-dark border border-white/5 rounded-xl p-6">
<h3 class="serif-heading text-lg mb-6">Top 10 by Revenue</h3>
<div class="space-y-4">
<div class="space-y-1">
<div class="flex justify-between text-xs mb-1">
<span class="text-slate-400">Croissant</span>
<span class="text-primary mono-data">€4.6k</span>
</div>
<div class="h-2 w-full bg-white/5 rounded-full overflow-hidden">
<div class="h-full bg-primary" style="width: 100%"></div>
</div>
</div>
<div class="space-y-1">
<div class="flex justify-between text-xs mb-1">
<span class="text-slate-400">Heritage Sourdough</span>
<span class="text-primary mono-data">€3.5k</span>
</div>
<div class="h-2 w-full bg-white/5 rounded-full overflow-hidden">
<div class="h-full bg-primary/80" style="width: 76%"></div>
</div>
</div>
<div class="space-y-1">
<div class="flex justify-between text-xs mb-1">
<span class="text-slate-400">Pain au Chocolat</span>
<span class="text-primary mono-data">€2.9k</span>
</div>
<div class="h-2 w-full bg-white/5 rounded-full overflow-hidden">
<div class="h-full bg-primary/60" style="width: 63%"></div>
</div>
</div>
<div class="space-y-1">
<div class="flex justify-between text-xs mb-1">
<span class="text-slate-400">Cannelé</span>
<span class="text-primary mono-data">€2.1k</span>
</div>
<div class="h-2 w-full bg-white/5 rounded-full overflow-hidden">
<div class="h-full bg-primary/40" style="width: 45%"></div>
</div>
</div>
<div class="space-y-1">
<div class="flex justify-between text-xs mb-1">
<span class="text-slate-400">Eclair</span>
<span class="text-primary mono-data">€1.8k</span>
</div>
<div class="h-2 w-full bg-white/5 rounded-full overflow-hidden">
<div class="h-full bg-primary/30" style="width: 39%"></div>
</div>
</div>
</div>
</div>
<!-- Donut Chart: Categories -->
<div class="bg-surface-dark border border-white/5 rounded-xl p-6">
<h3 class="serif-heading text-lg mb-6">Category Breakdown</h3>
<div class="relative flex items-center justify-center h-48">
<!-- Custom SVG Donut -->
<svg class="w-40 h-40 transform -rotate-90">
<circle class="text-white/5" cx="80" cy="80" fill="transparent" r="70" stroke="currentColor" stroke-width="12"></circle>
<circle class="text-primary" cx="80" cy="80" fill="transparent" r="70" stroke="currentColor" stroke-dasharray="440" stroke-dashoffset="132" stroke-width="12"></circle>
<circle class="text-primary/40" cx="80" cy="80" fill="transparent" r="70" stroke="currentColor" stroke-dasharray="440" stroke-dashoffset="350" stroke-width="12"></circle>
</svg>
<div class="absolute text-center">
<span class="block text-2xl font-bold mono-data text-primary">72%</span>
<span class="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Pastries</span>
</div>
</div>
<div class="grid grid-cols-2 gap-4 mt-6">
<div class="flex items-center gap-2">
<div class="w-2 h-2 rounded-full bg-primary"></div>
<span class="text-xs text-slate-400">Viennoiserie</span>
</div>
<div class="flex items-center gap-2">
<div class="w-2 h-2 rounded-full bg-primary/40"></div>
<span class="text-xs text-slate-400">Breads</span>
</div>
<div class="flex items-center gap-2">
<div class="w-2 h-2 rounded-full bg-white/20"></div>
<span class="text-xs text-slate-400">Confectionery</span>
</div>
<div class="flex items-center gap-2">
<div class="w-2 h-2 rounded-full bg-white/5"></div>
<span class="text-xs text-slate-400">Other</span>
</div>
</div>
</div>
<!-- Comparison Line Chart -->
<div class="bg-surface-dark border border-white/5 rounded-xl p-6">
<div class="flex justify-between items-center mb-6">
<h3 class="serif-heading text-lg">Growth Comparison</h3>
<div class="flex gap-4">
<div class="flex items-center gap-2 text-[10px] text-slate-400">
<div class="w-3 h-0.5 bg-primary"></div> Current
                            </div>
<div class="flex items-center gap-2 text-[10px] text-slate-400">
<div class="w-3 h-0.5 border-t border-dashed border-white/40"></div> Previous
                            </div>
</div>
</div>
<div class="h-48 w-full mt-4 flex items-end justify-between relative">
<!-- Grid Lines -->
<div class="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-10">
<div class="border-t border-white"></div>
<div class="border-t border-white"></div>
<div class="border-t border-white"></div>
<div class="border-t border-white"></div>
</div>
<!-- Line Path Visualization (Abstract) -->
<svg class="absolute inset-0 w-full h-full overflow-visible" preserveaspectratio="none">
<path d="M0,80 Q25,40 50,70 T100,20" fill="none" stroke="#f9d406" stroke-width="3"></path>
<path d="M0,90 Q25,70 50,85 T100,60" fill="none" stroke="rgba(255,255,255,0.2)" stroke-dasharray="4 4" stroke-width="2"></path>
</svg>
<!-- X-Axis Labels -->
<div class="absolute bottom-[-24px] w-full flex justify-between text-[10px] text-slate-600 px-2 uppercase tracking-tighter">
<span>Wk 1</span>
<span>Wk 2</span>
<span>Wk 3</span>
<span>Wk 4</span>
</div>
</div>
</div>
</div>
<!-- Bottom Section: Alerts & Logs -->
<div class="grid grid-cols-1 lg:grid-cols-2 gap-8 pb-12">
<!-- Unsold Products Alert -->
<div class="bg-primary/5 border border-primary/20 rounded-xl p-6">
<div class="flex items-center gap-3 mb-6">
<div class="p-2 bg-primary rounded-lg">
<span class="material-icons-sharp text-background-dark text-xl">warning</span>
</div>
<div>
<h3 class="serif-heading text-lg text-primary">Unsold Inventory Alert</h3>
<p class="text-xs text-primary/60 font-medium">Critical items with zero sales in the last 72 hours</p>
</div>
</div>
<div class="space-y-3">
<div class="flex items-center justify-between p-3 bg-white/5 border border-white/5 rounded-lg">
<div class="flex items-center gap-3">
<div class="w-8 h-8 rounded bg-background-dark flex items-center justify-center overflow-hidden grayscale">
<img data-alt="Vegan blueberry muffin top view" src="https://lh3.googleusercontent.com/aida-public/AB6AXuC0rmBrvVI_LEzE47FkSiU6XwLEXMDxWpAc1ToH5kslWuFV3fVfzhO6FSw9dwR1JAbwhVOjXz_B7FH21ySR9qc4Mnm9n2H7Wt3CmDQWonP0VINOpk3WQAq-5ZgRYyesinVD2lC0PisTfjhQyeMeu0sxckRhgm149dxgQ7O12KUNYPavI8ZLQzx7aN6Q9m9efvP8VMX10AW-IKeDXsHyfpf8hy5XW92J14seOv-UIGaK1d2tKAB8BixaB60rsWYA-x3cVPSHQzZxhGMI"/>
</div>
<span class="text-sm font-medium text-slate-300">Vegan Blueberry Muffin</span>
</div>
<span class="text-xs font-bold text-red-500 bg-red-500/10 px-2 py-0.5 rounded">0 UNITS</span>
</div>
<div class="flex items-center justify-between p-3 bg-white/5 border border-white/5 rounded-lg">
<div class="flex items-center gap-3">
<div class="w-8 h-8 rounded bg-background-dark flex items-center justify-center overflow-hidden grayscale">
<img data-alt="Rosemary focaccia loaf" src="https://lh3.googleusercontent.com/aida-public/AB6AXuApnsSjcqP9487l7U-k6HyDiCyIPqjrtWIhsV-No-GUyw_lFwnZGPLN1JIU6UxKgnLyAp6y7UkSjSY2DrEthCpZ6_Pm6zdKLTUYkJjcO1WuHGl5jL1rdpQtGnrQs7ReyW3nuw4x4GYsgexFBz6I3BCSX5MEQVefr8g6MyZ_Vyc71pp-czjVJCoSgJjcHYzsR1MRWrBWsTVn5oSAMLWzmpUpX641MPCRGYK6q1WVm84eBNCRLqPlko6ObbX6cyvsDJQGL8MVJz3SSsfa"/>
</div>
<span class="text-sm font-medium text-slate-300">Rosemary Focaccia</span>
</div>
<span class="text-xs font-bold text-red-500 bg-red-500/10 px-2 py-0.5 rounded">0 UNITS</span>
</div>
</div>
<button class="w-full mt-6 py-2.5 bg-primary text-background-dark font-bold text-xs uppercase tracking-widest rounded-lg hover:brightness-110 transition-all">Generate Markdowns</button>
</div>
<!-- Price Changes Log -->
<div class="bg-surface-dark border border-white/5 rounded-xl p-6">
<div class="flex items-center justify-between mb-6">
<h3 class="serif-heading text-lg">Price Adjustments</h3>
<span class="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Recent History</span>
</div>
<div class="space-y-4">
<div class="flex items-center justify-between py-2 border-b border-white/5">
<div>
<p class="text-sm font-medium text-slate-300">Brioche Nanterre</p>
<p class="text-[10px] text-slate-500">Oct 24, 2023</p>
</div>
<div class="flex items-center gap-4">
<span class="text-xs text-slate-500 line-through">€6.50</span>
<div class="flex items-center text-primary">
<span class="material-icons-sharp text-xs">arrow_upward</span>
<span class="mono-data text-sm font-bold">€7.20</span>
</div>
</div>
</div>
<div class="flex items-center justify-between py-2 border-b border-white/5">
<div>
<p class="text-sm font-medium text-slate-300">Espresso Macchiato</p>
<p class="text-[10px] text-slate-500">Oct 22, 2023</p>
</div>
<div class="flex items-center gap-4">
<span class="text-xs text-slate-500 line-through">€3.80</span>
<div class="flex items-center text-primary">
<span class="material-icons-sharp text-xs">arrow_upward</span>
<span class="mono-data text-sm font-bold">€4.10</span>
</div>
</div>
</div>
<div class="flex items-center justify-between py-2">
<div>
<p class="text-sm font-medium text-slate-300">Almond Croissant</p>
<p class="text-[10px] text-slate-500">Oct 20, 2023</p>
</div>
<div class="flex items-center gap-4">
<span class="text-xs text-slate-500 line-through">€5.20</span>
<div class="flex items-center text-emerald-500">
<span class="material-icons-sharp text-xs">arrow_downward</span>
<span class="mono-data text-sm font-bold">€4.90</span>
</div>
</div>
</div>
</div>
</div>
</div>
</div>
</main>
</body></html>
      <!-- STITCH_HTML_END -->
    ` }} />
  );
};

export default Product_Performance_Analytics;
