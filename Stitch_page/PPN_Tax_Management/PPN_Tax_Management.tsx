import React from 'react';

const PPN_Tax_Management: React.FC = () => {
  return (
    <div dangerouslySetInnerHTML={{ __html: \
      <!-- STITCH_HTML_START -->
      <!DOCTYPE html>

<html class="dark" lang="en"><head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
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
            "primary": "#f2d00d",
            "background-light": "#f8f8f5",
            "background-dark": "#0D0D0F", // Customized Onyx as requested
            "charcoal": "#1A1A1D",
          },
          fontFamily: {
            "display": ["Inter", "sans-serif"],
            "playfair": ["Playfair Display", "serif"]
          },
          borderRadius: {"DEFAULT": "0.5rem", "lg": "1rem", "xl": "1.5rem", "full": "9999px"},
        },
      },
    }
  </script>
</head>
<body class="bg-background-light dark:bg-background-dark text-slate-200 font-display min-h-screen">
<!-- Sidebar Navigation (Luxe Style) -->
<aside class="fixed left-0 top-0 h-full w-64 bg-charcoal border-r border-primary/10 hidden lg:flex flex-col">
<div class="p-8">
<h1 class="text-primary font-playfair text-2xl tracking-tight">The Breakery</h1>
<p class="text-[10px] uppercase tracking-[0.2em] text-primary/60 mt-1">Artisan Patisserie</p>
</div>
<nav class="flex-1 px-4 space-y-2 mt-4">
<a class="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-white/5 transition-colors group" href="#">
<span class="material-icons text-white/40 group-hover:text-primary">dashboard</span>
<span class="text-sm">Dashboard</span>
</a>
<a class="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-white/5 transition-colors group" href="#">
<span class="material-icons text-white/40 group-hover:text-primary">receipt_long</span>
<span class="text-sm">Invoices</span>
</a>
<a class="flex items-center gap-3 px-4 py-3 rounded-lg bg-primary/10 text-primary transition-colors border-l-2 border-primary" href="#">
<span class="material-icons">account_balance_wallet</span>
<span class="text-sm font-semibold">Tax Management</span>
</a>
<a class="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-white/5 transition-colors group" href="#">
<span class="material-icons text-white/40 group-hover:text-primary">inventory_2</span>
<span class="text-sm">Supplies</span>
</a>
</nav>
<div class="p-4 border-t border-white/5">
<div class="flex items-center gap-3 p-3 rounded-lg bg-white/5">
<div class="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary border border-primary/30">
<span class="material-icons">person</span>
</div>
<div>
<p class="text-xs font-bold text-white">Finance Team</p>
<p class="text-[10px] text-white/40 uppercase">Administrator</p>
</div>
</div>
</div>
</aside>
<!-- Main Content -->
<main class="lg:ml-64 p-8 min-h-screen">
<!-- Header Section -->
<header class="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
<div>
<h2 class="font-playfair text-[28px] text-white tracking-tight">PPN Tax Management</h2>
<nav class="flex items-center gap-2 text-sm text-white/40 mt-1">
<span>Compliance</span>
<span class="material-icons text-xs">chevron_right</span>
<span class="text-primary/70">Monthly PPN (1111)</span>
</nav>
</div>
<!-- Selectors -->
<div class="flex items-center gap-3 bg-charcoal p-1 rounded-xl border border-white/5">
<div class="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-lg border border-white/10">
<span class="material-icons text-primary text-sm">calendar_today</span>
<select class="bg-transparent text-sm border-none focus:ring-0 text-white font-medium cursor-pointer">
<option value="2026">2026</option>
<option value="2025">2025</option>
</select>
</div>
<div class="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-lg border border-white/10">
<select class="bg-transparent text-sm border-none focus:ring-0 text-white font-medium cursor-pointer">
<option value="2">February</option>
<option value="1">January</option>
</select>
</div>
</div>
</header>
<!-- KPI Cards Grid -->
<section class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
<!-- VAT Output -->
<div class="bg-charcoal p-6 rounded-xl border border-white/5 relative overflow-hidden group">
<div class="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 transition-opacity">
<span class="material-icons text-[120px]">trending_up</span>
</div>
<div class="relative z-10">
<p class="text-white/40 text-xs font-semibold uppercase tracking-wider mb-2">VAT Collected (Output)</p>
<div class="flex items-baseline gap-2">
<span class="text-xs text-primary">Rp</span>
<h3 class="text-2xl font-bold text-white tracking-tight">8.450.000</h3>
</div>
<p class="text-[10px] text-emerald-500 mt-2 flex items-center gap-1 font-medium">
<span class="material-icons text-xs">arrow_upward</span> 12% from last month
          </p>
</div>
</div>
<!-- VAT Input -->
<div class="bg-charcoal p-6 rounded-xl border border-white/5 relative overflow-hidden group">
<div class="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 transition-opacity">
<span class="material-icons text-[120px]">shopping_cart</span>
</div>
<div class="relative z-10">
<p class="text-white/40 text-xs font-semibold uppercase tracking-wider mb-2">VAT Deductible (Input)</p>
<div class="flex items-baseline gap-2">
<span class="text-xs text-primary">Rp</span>
<h3 class="text-2xl font-bold text-white tracking-tight">3.200.000</h3>
</div>
<p class="text-[10px] text-white/40 mt-2 flex items-center gap-1">
<span class="material-icons text-xs">remove</span> No significant change
          </p>
</div>
</div>
<!-- VAT Payable (Highlighted) -->
<div class="bg-primary p-[1px] rounded-xl shadow-2xl shadow-primary/10">
<div class="bg-charcoal p-6 rounded-[calc(0.75rem-1px)] h-full relative overflow-hidden">
<div class="absolute inset-0 bg-primary/5"></div>
<div class="relative z-10">
<div class="flex justify-between items-start mb-2">
<p class="text-primary text-xs font-bold uppercase tracking-widest">VAT Payable (Net)</p>
<span class="bg-primary/20 text-primary text-[10px] px-2 py-0.5 rounded-full font-bold">DUE MAR 15</span>
</div>
<div class="flex items-baseline gap-2">
<span class="text-xs text-primary">Rp</span>
<h3 class="text-3xl font-bold text-white tracking-tight">5.250.000</h3>
</div>
<p class="text-[10px] text-white/60 mt-2">Amount to be paid to the state treasury.</p>
</div>
</div>
</div>
</section>
<!-- Detailed Tax Breakdown Table -->
<section class="bg-charcoal rounded-xl border border-white/5 overflow-hidden mb-10">
<div class="p-6 border-b border-white/5 flex justify-between items-center">
<h4 class="font-bold text-lg text-white">VAT Calculation Breakdown</h4>
<div class="flex gap-2">
<button class="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs hover:bg-white/10 transition-colors">
<span class="material-icons text-sm">filter_list</span> Filter
          </button>
</div>
</div>
<div class="overflow-x-auto">
<table class="w-full text-left border-collapse">
<thead>
<tr class="text-[10px] uppercase tracking-widest text-white/40 border-b border-white/5 bg-white/5">
<th class="px-6 py-4 font-bold">Category</th>
<th class="px-6 py-4 font-bold">Description</th>
<th class="px-6 py-4 font-bold text-right">Tax Base (DPP)</th>
<th class="px-6 py-4 font-bold text-right">Tax Rate</th>
<th class="px-6 py-4 font-bold text-right">VAT Amount</th>
</tr>
</thead>
<tbody class="text-sm">
<!-- Output VAT Section -->
<tr class="bg-white/5">
<td class="px-6 py-3 font-bold text-primary text-xs tracking-wide" colspan="5">A. PPN KELUARAN (Output VAT)</td>
</tr>
<tr class="border-b border-white/5 hover:bg-white/[0.02]">
<td class="px-6 py-4 font-medium">Standard Sales</td>
<td class="px-6 py-4 text-white/40">Domestic Retail Sales</td>
<td class="px-6 py-4 text-right">72.000.000</td>
<td class="px-6 py-4 text-right">11%</td>
<td class="px-6 py-4 text-right text-white font-medium">7.920.000</td>
</tr>
<tr class="border-b border-white/5 hover:bg-white/[0.02]">
<td class="px-6 py-4 font-medium">Other Deliveries</td>
<td class="px-6 py-4 text-white/40">Pastry Gifts &amp; Samplers</td>
<td class="px-6 py-4 text-right">4.818.181</td>
<td class="px-6 py-4 text-right">11%</td>
<td class="px-6 py-4 text-right text-white font-medium">530.000</td>
</tr>
<tr class="border-b border-white/10 bg-white/[0.03]">
<td class="px-6 py-3 font-bold text-right text-white/40" colspan="4">Total Output VAT</td>
<td class="px-6 py-3 text-right text-white font-bold underline decoration-primary underline-offset-4">8.450.000</td>
</tr>
<!-- Input VAT Section -->
<tr class="bg-white/5">
<td class="px-6 py-3 font-bold text-primary text-xs tracking-wide" colspan="5">B. PPN MASUKAN (Input VAT)</td>
</tr>
<tr class="border-b border-white/5 hover:bg-white/[0.02]">
<td class="px-6 py-4 font-medium">Local Purchases</td>
<td class="px-6 py-4 text-white/40">Flour &amp; Dairy Supplies</td>
<td class="px-6 py-4 text-right">24.545.454</td>
<td class="px-6 py-4 text-right">11%</td>
<td class="px-6 py-4 text-right text-white font-medium">2.700.000</td>
</tr>
<tr class="border-b border-white/5 hover:bg-white/[0.02]">
<td class="px-6 py-4 font-medium">Utilities &amp; Rent</td>
<td class="px-6 py-4 text-white/40">Store Electricity &amp; Water</td>
<td class="px-6 py-4 text-right">4.545.454</td>
<td class="px-6 py-4 text-right">11%</td>
<td class="px-6 py-4 text-right text-white font-medium">500.000</td>
</tr>
<tr class="border-b border-white/10 bg-white/[0.03]">
<td class="px-6 py-3 font-bold text-right text-white/40" colspan="4">Total Deductible Input VAT</td>
<td class="px-6 py-3 text-right text-white font-bold underline decoration-primary underline-offset-4">(3.200.000)</td>
</tr>
<!-- Calculation Summary -->
<tr class="bg-primary/10">
<td class="px-6 py-5 font-bold text-right text-primary uppercase tracking-widest text-xs" colspan="4">Net VAT Payable (A - B)</td>
<td class="px-6 py-5 text-right text-primary text-lg font-bold tracking-tight">Rp 5.250.000</td>
</tr>
</tbody>
</table>
</div>
</section>
<!-- Status & Action Footer -->
<section class="flex flex-col md:flex-row items-center justify-between gap-6 p-6 bg-charcoal rounded-xl border border-white/5">
<div class="flex items-center gap-4">
<div class="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
<span class="material-icons">hourglass_empty</span>
</div>
<div>
<p class="text-white font-semibold">February 2026 Status</p>
<p class="text-xs text-white/40 mt-0.5">⏳ Not yet filed — Due Mar 15, 2026</p>
</div>
</div>
<div class="flex flex-wrap items-center gap-3">
<!-- Date Picker Placeholder for Filing -->
<div class="relative group mr-2">
<button class="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-xs text-white/60 hover:text-white transition-all">
<span class="material-icons text-sm">event</span>
            Set Filing Date
          </button>
</div>
<button class="px-5 py-2.5 rounded-lg border border-white/10 text-white text-sm font-medium hover:bg-white/5 transition-colors">
          Export PDF Summary
        </button>
<button class="px-5 py-2.5 rounded-lg bg-primary text-background-dark text-sm font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2">
<span class="material-icons text-sm">download</span>
          Export DJP Format
        </button>
<button class="px-5 py-2.5 rounded-lg bg-emerald-600/20 text-emerald-500 border border-emerald-500/30 text-sm font-bold hover:bg-emerald-600/30 transition-all flex items-center gap-2">
<span class="material-icons text-sm">check_circle</span>
          Mark as Filed
        </button>
</div>
</section>
<!-- Support Section -->
<footer class="mt-12 text-center">
<div class="inline-flex items-center gap-2 text-white/20 text-[10px] uppercase tracking-[0.3em]">
<span>Powered by</span>
<span class="font-bold text-white/30">Breakery Cloud Systems</span>
</div>
</footer>
</main>
<!-- Illustration / Background Texture (Abstract) -->
<div class="fixed top-0 right-0 -z-10 w-[500px] h-[500px] bg-primary/5 blur-[120px] rounded-full pointer-events-none"></div>
<div class="fixed bottom-0 left-0 -z-10 w-[300px] h-[300px] bg-primary/5 blur-[80px] rounded-full pointer-events-none"></div>
</body></html>
      <!-- STITCH_HTML_END -->
    \ }} />
  );
};

export default PPN_Tax_Management;
