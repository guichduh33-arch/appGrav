import React from 'react';

const General_Ledger_View: React.FC = () => {
  return (
    <div dangerouslySetInnerHTML={{ __html: \
      <!-- STITCH_HTML_START -->
      <html class="dark" lang="en"><head>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/></head><body class="bg-background-light dark:bg-background-dark text-slate-200 min-h-screen flex flex-col">\`\`\`html




<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
<title>General Ledger - The Breakery</title>
<script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&amp;family=Playfair+Display:wght@700&amp;family=JetBrains+Mono:wght@400;500;700&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet"/>
<script id="tailwind-config">
      tailwind.config = {
        darkMode: "class",
        theme: {
          extend: {
            colors: {
              "primary": "#f2d00d",
              "background-light": "#f8f8f5",
              "background-dark": "#0D0D0F",
              "ledger-panel": "#161618",
              "ledger-border": "#2D2D30",
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
        body {
            font-family: 'Inter', sans-serif;
            background-color: #0D0D0F;
        }
        .font-playfair { font-family: 'Playfair Display', serif; }
        .font-jetbrains { font-family: 'JetBrains Mono', monospace; }
        ::-webkit-scrollbar { width: 8px; height: 8px; }
        ::-webkit-scrollbar-track { background: #0D0D0F; }
        ::-webkit-scrollbar-thumb { background: #2D2D30; border-radius: 4px; }
        ::-webkit-scrollbar-thumb:hover { background: #3D3D40; }
    </style>
<!-- Header Section -->
<header class="border-b border-ledger-border px-8 py-6 flex justify-between items-center bg-background-dark/80 backdrop-blur-md sticky top-0 z-30">
<div>
<h1 class="text-[28px] font-serif text-white tracking-tight">General Ledger</h1>
<p class="text-xs text-slate-500 font-display mt-1">Financial Year 2023 - 2024</p>
</div>
<div class="flex items-center gap-4">
<button class="flex items-center gap-2 px-4 py-2 rounded-lg border border-primary/30 text-primary hover:bg-primary/10 transition-colors font-medium text-sm">
<span class="material-icons text-sm">download</span>
                Export to CSV
            </button>
<div class="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center border border-primary/30">
<span class="material-icons text-primary text-sm">person</span>
</div>
</div>
</header>
<main class="flex-grow p-8 max-w-[1400px] mx-auto w-full">
<!-- Filter Bar -->
<div class="bg-ledger-panel border border-ledger-border rounded-xl p-5 mb-8 flex flex-wrap items-center gap-6">
<!-- Account Selector -->
<div class="flex-grow min-w-[300px]">
<label class="block text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-2">Account Selector</label>
<div class="relative group">
<span class="material-icons absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary">search</span>
<input class="w-full bg-background-dark border border-ledger-border rounded-lg pl-10 pr-4 py-2.5 text-sm text-slate-200 focus:border-primary focus:ring-1 focus:ring-primary transition-all outline-none" type="text" value="1110 — Cash on Hand"/>
</div>
</div>
<!-- Date Picker -->
<div class="min-w-[240px]">
<label class="block text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-2">Date Range</label>
<div class="relative">
<span class="material-icons absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">calendar_today</span>
<input class="w-full bg-background-dark border border-ledger-border rounded-lg pl-10 pr-4 py-2.5 text-sm text-slate-200 outline-none" type="text" value="Oct 01, 2023 - Oct 31, 2023"/>
</div>
</div>
<!-- Toggle -->
<div class="flex items-center gap-3">
<div class="relative inline-flex items-center cursor-pointer">
<input checked="" class="sr-only peer" type="checkbox" value=""/>
<div class="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
</div>
<span class="text-xs font-medium text-slate-400">Show Zero Balances</span>
</div>
<!-- Generate Button -->
<button class="bg-primary text-background-dark px-8 py-2.5 rounded-lg font-bold text-sm hover:brightness-110 active:scale-95 transition-all ml-auto">
                Generate
            </button>
</div>
<!-- Summary Statistics Header -->
<div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
<div class="bg-ledger-panel border border-ledger-border rounded-xl p-6 flex flex-col justify-between">
<span class="text-xs font-bold text-slate-500 uppercase tracking-widest">Opening Balance</span>
<div class="mt-4 flex items-baseline gap-2">
<span class="text-slate-400 text-sm font-jetbrains">Rp</span>
<span class="text-2xl font-jetbrains text-slate-100">8.200.000</span>
</div>
</div>
<div class="bg-ledger-panel border border-ledger-border rounded-xl p-6 flex flex-col justify-between border-l-4 border-l-emerald-500/50">
<span class="text-xs font-bold text-slate-500 uppercase tracking-widest">Total Debits</span>
<div class="mt-4 flex items-baseline gap-2">
<span class="text-slate-400 text-sm font-jetbrains">Rp</span>
<span class="text-2xl font-jetbrains text-emerald-400">6.550.000</span>
</div>
</div>
<div class="bg-ledger-panel border border-ledger-border rounded-xl p-6 flex flex-col justify-between border-l-4 border-l-rose-500/50">
<span class="text-xs font-bold text-slate-500 uppercase tracking-widest">Total Credits</span>
<div class="mt-4 flex items-baseline gap-2">
<span class="text-slate-400 text-sm font-jetbrains">Rp</span>
<span class="text-2xl font-jetbrains text-rose-400">2.300.000</span>
</div>
</div>
</div>
<!-- Ledger Table -->
<div class="bg-ledger-panel border border-ledger-border rounded-xl overflow-hidden shadow-2xl">
<div class="overflow-x-auto">
<table class="w-full text-left border-collapse">
<thead>
<tr class="bg-background-dark/50 border-b border-ledger-border">
<th class="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-500">Date</th>
<th class="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-500">Reference</th>
<th class="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-500">Description</th>
<th class="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-500">Method</th>
<th class="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-500 text-right">Debit</th>
<th class="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-500 text-right">Credit</th>
<th class="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-500 text-right">Running Balance</th>
</tr>
</thead>
<tbody class="divide-y divide-ledger-border/50">
<!-- Header Row -->
<tr class="bg-slate-400/5">
<td class="px-6 py-4 text-xs font-semibold text-slate-400" colspan="4">Brought Forward (Opening Balance)</td>
<td class="px-6 py-4 text-right"></td>
<td class="px-6 py-4 text-right"></td>
<td class="px-6 py-4 text-right font-jetbrains text-slate-300 text-sm">8.200.000</td>
</tr>
<!-- Row 1 -->
<tr class="hover:bg-white/[0.02] transition-colors">
<td class="px-6 py-4 text-sm text-slate-400">Oct 02, 2023</td>
<td class="px-6 py-4 text-sm font-medium text-primary hover:underline cursor-pointer">#INV-2023-1021</td>
<td class="px-6 py-4">
<span class="text-sm text-slate-200">Sales revenue</span>
<div class="text-[10px] text-slate-500 mt-0.5">Customer: Artisan Bistro Group</div>
</td>
<td class="px-6 py-4">
<span class="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20">AUTO</span>
</td>
<td class="px-6 py-4 text-right font-jetbrains text-sm text-emerald-400">450.000</td>
<td class="px-6 py-4 text-right font-jetbrains text-sm text-slate-600">—</td>
<td class="px-6 py-4 text-right font-jetbrains text-sm text-[#F5F5F0]">8.650.000</td>
</tr>
<!-- Row 2 -->
<tr class="hover:bg-white/[0.02] transition-colors">
<td class="px-6 py-4 text-sm text-slate-400">Oct 05, 2023</td>
<td class="px-6 py-4 text-sm font-medium text-primary hover:underline cursor-pointer">#PAY-0092</td>
<td class="px-6 py-4">
<span class="text-sm text-slate-200">Supplier payment</span>
<div class="text-[10px] text-slate-500 mt-0.5">To: Central Flour Mills Ltd.</div>
</td>
<td class="px-6 py-4">
<span class="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-700/50 text-slate-400 border border-slate-600/30 uppercase">Manual</span>
</td>
<td class="px-6 py-4 text-right font-jetbrains text-sm text-slate-600">—</td>
<td class="px-6 py-4 text-right font-jetbrains text-sm text-rose-400">2.300.000</td>
<td class="px-6 py-4 text-right font-jetbrains text-sm text-[#F5F5F0]">6.350.000</td>
</tr>
<!-- Row 3 -->
<tr class="hover:bg-white/[0.02] transition-colors">
<td class="px-6 py-4 text-sm text-slate-400">Oct 12, 2023</td>
<td class="px-6 py-4 text-sm font-medium text-primary hover:underline cursor-pointer">#INV-2023-1105</td>
<td class="px-6 py-4">
<span class="text-sm text-slate-200">Sales revenue</span>
<div class="text-[10px] text-slate-500 mt-0.5">Walk-in wholesale orders</div>
</td>
<td class="px-6 py-4">
<span class="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20">AUTO</span>
</td>
<td class="px-6 py-4 text-right font-jetbrains text-sm text-emerald-400">6.100.000</td>
<td class="px-6 py-4 text-right font-jetbrains text-sm text-slate-600">—</td>
<td class="px-6 py-4 text-right font-jetbrains text-sm text-[#F5F5F0]">12.450.000</td>
</tr>
</tbody>
<tfoot>
<tr class="bg-primary/5 border-t-2 border-primary/20">
<td class="px-6 py-6 text-sm font-bold text-slate-300" colspan="4">Total Period Summary</td>
<td class="px-6 py-6 text-right font-jetbrains text-sm text-emerald-400 font-bold">6.550.000</td>
<td class="px-6 py-6 text-right font-jetbrains text-sm text-rose-400 font-bold">2.300.000</td>
<td class="px-6 py-6 text-right"></td>
</tr>
</tfoot>
</table>
</div>
</div>
<!-- Closing Balance Footer -->
<div class="mt-6 flex justify-end">
<div class="bg-background-dark border border-primary/40 rounded-xl px-10 py-6 flex items-center gap-12 shadow-[0_0_20px_rgba(242,208,13,0.1)]">
<div>
<span class="block text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">Closing Balance</span>
<span class="text-xs text-slate-600">As of Oct 31, 2023</span>
</div>
<div class="flex items-baseline gap-3">
<span class="text-primary/70 font-jetbrains text-lg">Rp</span>
<span class="text-4xl font-jetbrains font-bold text-primary">12.450.000</span>
</div>
</div>
</div>
</main>
<!-- App Bottom Info -->
<footer class="mt-auto px-8 py-4 border-t border-ledger-border flex justify-between items-center bg-background-dark">
<div class="flex items-center gap-4">
<img class="w-6 h-6 rounded" data-alt="Small bakery branding logo icon" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCSN3iD6VM4BVm_DydGKiat2K38rRFVQFXFLl8aHgMegnb7t37JseMmrq9a0K9Biud8-T9Njvxz81JrRlnq8IU5XEBtpXY04aSsTYLvdAIRbB5vm5pVpRBDENoyVxnuiob9cve5xxVD-BTB59votydSAH04SpOyU_k6FczLoIfHHgHRlPWdWrEEOGAkID42t_7XPurscAFgpdoKcOLif_bM7h_cg-zZsib_cz3bhrjXAzTCh2phe8CPpsykDVkA2uRfSj98bPKAaUcS"/>
<span class="text-[10px] text-slate-600 font-bold uppercase tracking-widest">The Breakery — ERP Accounting v2.4.1</span>
</div>
<div class="flex items-center gap-6 text-[10px] text-slate-500 font-medium">
<span class="flex items-center gap-1"><span class="w-2 h-2 rounded-full bg-emerald-500"></span> Database Connected</span>
<span>Server: ID-JKT-01</span>
</div>
</footer>
</body></html><!-- End of generated code -->
      <!-- STITCH_HTML_END -->
    \ }} />
  );
};

export default General_Ledger_View;
