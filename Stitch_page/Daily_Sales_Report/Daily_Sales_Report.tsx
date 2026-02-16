import React from 'react';

const Daily_Sales_Report: React.FC = () => {
  return (
    <div dangerouslySetInnerHTML={{ __html: `
      <!-- STITCH_HTML_START -->
      <!DOCTYPE html>

<html class="dark" lang="en"><head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
<title>Daily Sales Report | The Breakery</title>
<script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/icon?family=Material+Icons+Round" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<script id="tailwind-config">
        tailwind.config = {
            darkMode: "class",
            theme: {
                extend: {
                    colors: {
                        "primary": "#c8a45b",
                        "background-light": "#f8f7f6",
                        "background-dark": "#0D0D0F", // Deep Onyx
                        "card-dark": "#1A1A1D",
                    },
                    fontFamily: {
                        "display": ["Inter"]
                    },
                    borderRadius: {"DEFAULT": "0.5rem", "lg": "1rem", "xl": "1.5rem", "full": "9999px"},
                },
            },
        }
    </script>
<style>
        body { font-family: 'Inter', sans-serif; }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #c8a45b44; border-radius: 10px; }
        .gradient-mask { mask-image: linear-gradient(to top, transparent, black); }
    </style>
</head>
<body class="bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 min-h-screen font-display flex">
<!-- Sidebar Navigation (Brief) -->
<aside class="w-20 border-r border-primary/10 bg-card-dark flex flex-col items-center py-8 gap-8">
<div class="w-12 h-12 bg-primary rounded-xl flex items-center justify-center text-background-dark font-bold text-xl">B</div>
<nav class="flex flex-col gap-6">
<a class="text-primary/40 hover:text-primary transition-colors" href="#"><span class="material-icons-round">dashboard</span></a>
<a class="text-primary" href="#"><span class="material-icons-round">analytics</span></a>
<a class="text-primary/40 hover:text-primary transition-colors" href="#"><span class="material-icons-round">receipt_long</span></a>
<a class="text-primary/40 hover:text-primary transition-colors" href="#"><span class="material-icons-round">inventory_2</span></a>
<a class="text-primary/40 hover:text-primary transition-colors" href="#"><span class="material-icons-round">settings</span></a>
</nav>
</aside>
<!-- Main Content Area -->
<main class="flex-1 flex overflow-hidden">
<!-- Main Dashboard Section -->
<section class="flex-1 p-8 overflow-y-auto custom-scrollbar">
<!-- Header -->
<header class="flex justify-between items-end mb-8">
<div>
<h1 class="text-3xl font-semibold text-white mb-1">Daily Sales Report</h1>
<p class="text-slate-400">Manage and monitor The Breakery's performance</p>
</div>
<div class="flex gap-3">
<button class="flex items-center gap-2 px-4 py-2 bg-card-dark border border-primary/20 rounded-lg text-sm hover:bg-primary/10 transition-colors">
<span class="material-icons-round text-primary text-sm">calendar_today</span>
                        Feb 01 - Feb 28, 2026
                    </button>
<button class="flex items-center gap-2 px-4 py-2 bg-primary text-background-dark font-semibold rounded-lg text-sm hover:bg-primary/90 transition-colors">
<span class="material-icons-round text-sm">file_download</span>
                        Export PDF
                    </button>
</div>
</header>
<!-- Metric Cards -->
<div class="grid grid-cols-3 gap-6 mb-8">
<div class="bg-card-dark p-6 rounded-xl border border-primary/10 shadow-xl">
<div class="flex justify-between items-start mb-4">
<div class="p-2 bg-primary/20 rounded-lg text-primary">
<span class="material-icons-round">payments</span>
</div>
<span class="text-xs text-emerald-400 font-medium">+12.4%</span>
</div>
<p class="text-slate-400 text-sm mb-1 uppercase tracking-wider font-medium">Revenue</p>
<h2 class="text-2xl font-bold text-white">Rp 4.125.000</h2>
</div>
<div class="bg-card-dark p-6 rounded-xl border border-primary/10 shadow-xl">
<div class="flex justify-between items-start mb-4">
<div class="p-2 bg-primary/20 rounded-lg text-primary">
<span class="material-icons-round">shopping_bag</span>
</div>
<span class="text-xs text-emerald-400 font-medium">+5.2%</span>
</div>
<p class="text-slate-400 text-sm mb-1 uppercase tracking-wider font-medium">Orders</p>
<h2 class="text-2xl font-bold text-white">47</h2>
</div>
<div class="bg-card-dark p-6 rounded-xl border border-primary/10 shadow-xl">
<div class="flex justify-between items-start mb-4">
<div class="p-2 bg-primary/20 rounded-lg text-primary">
<span class="material-icons-round">confirmation_number</span>
</div>
<span class="text-xs text-rose-400 font-medium">-2.1%</span>
</div>
<p class="text-slate-400 text-sm mb-1 uppercase tracking-wider font-medium">Avg Ticket</p>
<h2 class="text-2xl font-bold text-white">Rp 87.766</h2>
</div>
</div>
<!-- Revenue Trend Chart Placeholder -->
<div class="bg-card-dark p-6 rounded-xl border border-primary/10 mb-8">
<div class="flex justify-between items-center mb-6">
<h3 class="text-lg font-semibold text-white">Revenue Trends</h3>
<div class="flex bg-background-dark p-1 rounded-lg">
<button class="px-3 py-1 text-xs font-medium text-white bg-primary rounded-md">Daily</button>
<button class="px-3 py-1 text-xs font-medium text-slate-400 hover:text-white">Weekly</button>
</div>
</div>
<div class="relative h-64 w-full bg-background-dark/50 rounded-lg overflow-hidden flex items-end px-4 gap-2">
<!-- Fake Bars for Chart -->
<div class="flex-1 bg-primary/20 rounded-t-md h-[40%]"></div>
<div class="flex-1 bg-primary/30 rounded-t-md h-[60%]"></div>
<div class="flex-1 bg-primary/40 rounded-t-md h-[55%]"></div>
<div class="flex-1 bg-primary/20 rounded-t-md h-[30%]"></div>
<div class="flex-1 bg-primary/50 rounded-t-md h-[75%] relative">
<div class="absolute -top-10 left-1/2 -translate-x-1/2 bg-primary text-background-dark px-2 py-1 rounded text-[10px] font-bold">Rp 4.1M</div>
</div>
<div class="flex-1 bg-primary/20 rounded-t-md h-[45%]"></div>
<div class="flex-1 bg-primary/30 rounded-t-md h-[65%]"></div>
<div class="flex-1 bg-primary/10 rounded-t-md h-[35%]"></div>
<div class="flex-1 bg-primary/40 rounded-t-md h-[50%]"></div>
<div class="flex-1 bg-primary/20 rounded-t-md h-[40%]"></div>
</div>
</div>
<!-- Performance Table -->
<div class="bg-card-dark rounded-xl border border-primary/10 overflow-hidden">
<div class="p-6 border-b border-primary/10 flex justify-between items-center">
<h3 class="text-lg font-semibold text-white">Daily Performance</h3>
<div class="relative">
<input class="bg-background-dark border-primary/20 rounded-lg pl-9 pr-4 py-2 text-sm text-slate-300 focus:ring-primary focus:border-primary" placeholder="Search date..." type="text"/>
<span class="material-icons-round absolute left-3 top-2.5 text-slate-500 text-sm">search</span>
</div>
</div>
<table class="w-full text-left">
<thead class="bg-background-dark/50 text-slate-400 text-xs uppercase tracking-wider">
<tr>
<th class="px-6 py-4 font-medium">Date</th>
<th class="px-6 py-4 font-medium text-right">Gross Sales</th>
<th class="px-6 py-4 font-medium text-right">Discounts</th>
<th class="px-6 py-4 font-medium text-right">Net Sales</th>
<th class="px-6 py-4 font-medium text-right">Orders</th>
<th class="px-6 py-4 font-medium text-center">Status</th>
</tr>
</thead>
<tbody class="divide-y divide-primary/5">
<tr class="hover:bg-primary/5 cursor-pointer transition-colors group">
<td class="px-6 py-4 text-sm font-medium text-white">Feb 16, 2026</td>
<td class="px-6 py-4 text-sm text-slate-300 text-right">Rp 3.850.000</td>
<td class="px-6 py-4 text-sm text-rose-400 text-right">-Rp 120.000</td>
<td class="px-6 py-4 text-sm text-primary font-semibold text-right">Rp 3.730.000</td>
<td class="px-6 py-4 text-sm text-slate-300 text-right">42</td>
<td class="px-6 py-4 text-center"><span class="px-2 py-1 bg-emerald-500/10 text-emerald-400 text-[10px] rounded-full font-bold uppercase">Closed</span></td>
</tr>
<tr class="bg-primary/10 border-l-4 border-primary cursor-pointer transition-colors">
<td class="px-6 py-4 text-sm font-medium text-white">Feb 15, 2026</td>
<td class="px-6 py-4 text-sm text-slate-300 text-right">Rp 4.250.000</td>
<td class="px-6 py-4 text-sm text-rose-400 text-right">-Rp 125.000</td>
<td class="px-6 py-4 text-sm text-primary font-semibold text-right">Rp 4.125.000</td>
<td class="px-6 py-4 text-sm text-slate-300 text-right">47</td>
<td class="px-6 py-4 text-center"><span class="px-2 py-1 bg-emerald-500/10 text-emerald-400 text-[10px] rounded-full font-bold uppercase">Closed</span></td>
</tr>
<tr class="hover:bg-primary/5 cursor-pointer transition-colors group">
<td class="px-6 py-4 text-sm font-medium text-white">Feb 14, 2026</td>
<td class="px-6 py-4 text-sm text-slate-300 text-right">Rp 5.100.000</td>
<td class="px-6 py-4 text-sm text-rose-400 text-right">-Rp 200.000</td>
<td class="px-6 py-4 text-sm text-primary font-semibold text-right">Rp 4.900.000</td>
<td class="px-6 py-4 text-sm text-slate-300 text-right">58</td>
<td class="px-6 py-4 text-center"><span class="px-2 py-1 bg-emerald-500/10 text-emerald-400 text-[10px] rounded-full font-bold uppercase">Closed</span></td>
</tr>
<tr class="hover:bg-primary/5 cursor-pointer transition-colors group">
<td class="px-6 py-4 text-sm font-medium text-white">Feb 13, 2026</td>
<td class="px-6 py-4 text-sm text-slate-300 text-right">Rp 3.200.000</td>
<td class="px-6 py-4 text-sm text-rose-400 text-right">-Rp 50.000</td>
<td class="px-6 py-4 text-sm text-primary font-semibold text-right">Rp 3.150.000</td>
<td class="px-6 py-4 text-sm text-slate-300 text-right">38</td>
<td class="px-6 py-4 text-center"><span class="px-2 py-1 bg-emerald-500/10 text-emerald-400 text-[10px] rounded-full font-bold uppercase">Closed</span></td>
</tr>
</tbody>
</table>
</div>
</section>
<!-- Slide-in Drill-down Panel -->
<aside class="w-[30%] bg-card-dark border-l border-primary/20 overflow-y-auto custom-scrollbar shadow-2xl z-10">
<div class="p-8">
<div class="flex justify-between items-center mb-8">
<div>
<p class="text-xs text-primary font-bold uppercase tracking-[0.2em] mb-1">Drill-down</p>
<h2 class="text-2xl font-bold text-white">Feb 15, 2026</h2>
</div>
<button class="w-10 h-10 flex items-center justify-center rounded-full bg-background-dark text-slate-400 hover:text-white transition-colors">
<span class="material-icons-round">close</span>
</button>
</div>
<!-- Hourly Breakdown Bar Chart -->
<div class="mb-10">
<h4 class="text-sm font-semibold text-white mb-6 flex items-center gap-2">
<span class="material-icons-round text-primary text-lg">schedule</span>
                        Hourly Sales Breakdown
                    </h4>
<div class="flex items-end gap-1.5 h-32 px-2">
<div class="flex-1 bg-primary/20 rounded-t-sm h-[10%] group relative">
<div class="hidden group-hover:block absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-[10px] p-1 rounded">08am</div>
</div>
<div class="flex-1 bg-primary/40 rounded-t-sm h-[45%]"></div>
<div class="flex-1 bg-primary/60 rounded-t-sm h-[85%]"></div>
<div class="flex-1 bg-primary/80 rounded-t-sm h-[95%]"></div>
<div class="flex-1 bg-primary/40 rounded-t-sm h-[30%]"></div>
<div class="flex-1 bg-primary/20 rounded-t-sm h-[15%]"></div>
<div class="flex-1 bg-primary/50 rounded-t-sm h-[55%]"></div>
<div class="flex-1 bg-primary/90 rounded-t-sm h-[90%]"></div>
<div class="flex-1 bg-primary/70 rounded-t-sm h-[65%]"></div>
<div class="flex-1 bg-primary/30 rounded-t-sm h-[20%]"></div>
</div>
<div class="flex justify-between mt-2 text-[10px] text-slate-500 font-medium px-1 uppercase tracking-tighter">
<span>08:00</span>
<span>12:00</span>
<span>16:00</span>
<span>20:00</span>
</div>
</div>
<!-- Payment Mix Donut Placeholder -->
<div class="mb-10 p-6 bg-background-dark rounded-xl border border-primary/5">
<h4 class="text-sm font-semibold text-white mb-6">Payment Methods</h4>
<div class="flex items-center gap-6">
<div class="relative w-24 h-24">
<svg class="w-full h-full transform -rotate-90" viewbox="0 0 36 36">
<circle class="stroke-primary/10" cx="18" cy="18" fill="none" r="16" stroke-width="4"></circle>
<circle class="stroke-primary" cx="18" cy="18" fill="none" r="16" stroke-dasharray="65 100" stroke-width="4"></circle>
<circle class="stroke-amber-200" cx="18" cy="18" fill="none" r="16" stroke-dasharray="20 100" stroke-dashoffset="-65" stroke-width="4"></circle>
</svg>
<div class="absolute inset-0 flex flex-col items-center justify-center">
<span class="text-xs font-bold text-white">47</span>
<span class="text-[8px] text-slate-500 uppercase">Txns</span>
</div>
</div>
<div class="flex-1 space-y-2">
<div class="flex items-center justify-between text-xs">
<div class="flex items-center gap-2">
<div class="w-2 h-2 rounded-full bg-primary"></div>
<span class="text-slate-400">QRIS/Digital</span>
</div>
<span class="text-white font-medium">65%</span>
</div>
<div class="flex items-center justify-between text-xs">
<div class="flex items-center gap-2">
<div class="w-2 h-2 rounded-full bg-amber-200"></div>
<span class="text-slate-400">Debit Card</span>
</div>
<span class="text-white font-medium">20%</span>
</div>
<div class="flex items-center justify-between text-xs">
<div class="flex items-center gap-2">
<div class="w-2 h-2 rounded-full bg-slate-600"></div>
<span class="text-slate-400">Cash</span>
</div>
<span class="text-white font-medium">15%</span>
</div>
</div>
</div>
</div>
<!-- Top Staff Performance -->
<div class="mb-8">
<h4 class="text-sm font-semibold text-white mb-4">Top Staff (Today)</h4>
<div class="space-y-4">
<div class="flex items-center gap-4">
<div class="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center border border-primary/20 overflow-hidden">
<img class="w-full h-full object-cover" data-alt="Portrait of a female barista smiling" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBsVANbGKk92z5pAABbE8ANwVJtbgmpqxt8YUPE5udxQEs9odmPv1vdd3zGqR9GO5dYVs7HDT5EM1gkhiHT-traTt_eqtpq4C87ggIM2jOmPF1zltEzp__x5TTd_T8_ZEOxwBjpmtxaMSXl5lLbI2MsyNFEhrbxpoRniy9xmI6SeV4-1yrUl4VlQvtOHi1Hi97tj-V_UVDqVHcjiRtOLe46Z0cv6wbdK-M7yBd8GqmnWyBECjM3G23AcPGMCnwqOovfXttd460-0dET"/>
</div>
<div class="flex-1">
<p class="text-sm font-medium text-white">Arisara V.</p>
<p class="text-[10px] text-slate-500">22 Orders • Rp 1.8M</p>
</div>
<span class="text-primary material-icons-round">trending_up</span>
</div>
<div class="flex items-center gap-4">
<div class="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center border border-primary/20 overflow-hidden">
<img class="w-full h-full object-cover" data-alt="Portrait of a male server" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCTHGN0-IDEhtUBZrMHQ3d84du-97tIopWRlNGgyl8BcCcPgwoY1C-F8iX9lz2KGThWdX3Ja6RB11OltGw5zPXU5LlbjJRWBzJEArItPcyC6VsROqRr0L1yC8vWhFE0dMy_uIpi-cCbEa__1aTmA2PEAodTJb6sSmnwclvsnq0L55X1z6ddgD42lONIpesThLIv4rGHnksxZ4M8o7exlBHKB7TOk4-Rin4WZRvtsV7_kaJowOB3I4u82sArsiC5fNQKqXiVOa3KUxAT"/>
</div>
<div class="flex-1">
<p class="text-sm font-medium text-white">Julian M.</p>
<p class="text-[10px] text-slate-500">15 Orders • Rp 1.2M</p>
</div>
<span class="text-slate-600 material-icons-round">remove</span>
</div>
<div class="flex items-center gap-4">
<div class="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center border border-primary/20 overflow-hidden">
<img class="w-full h-full object-cover" data-alt="Portrait of a professional staff member" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCKEAoryhbZqe4PLGa6ih1MU0sey6p23vc7DHiah_OTnn-v7TrztGhGlLAdED3hS6SPAPd0XrFyMhKwZzTTu-dm_dsXOg2KgIoeEZsXABwrn3zXIwco8eP1bJlHvnK0S7u7NdJ_yg-1S8b78pRn6szDjIAMk-GYYBnGXL8g7BnUUv6INTnEr2hxBDKa_SXqerlJ7cekx49n4_Q97t54kVQM4Dfz6mApf7sj3oj8hMsgn8Rf-QpnWUGSm_PZqQR643sAhlQSP7K8nH0y"/>
</div>
<div class="flex-1">
<p class="text-sm font-medium text-white">Siska K.</p>
<p class="text-[10px] text-slate-500">10 Orders • Rp 1.1M</p>
</div>
<span class="text-primary material-icons-round">trending_up</span>
</div>
</div>
</div>
<button class="w-full py-4 border-2 border-dashed border-primary/20 rounded-xl text-primary font-bold text-xs uppercase tracking-widest hover:bg-primary/5 transition-colors">
                    View All 47 Transactions
                </button>
</div>
</aside>
</main>
</body></html>
      <!-- STITCH_HTML_END -->
    ` }} />
  );
};

export default Daily_Sales_Report;
