import React from 'react';

const ShiftSummary: React.FC = () => {
    return (
        <div dangerouslySetInnerHTML={{
            __html: `
      <!-- STITCH_HTML_START -->
      <!DOCTYPE html>

<html class="dark" lang="en"><head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
<title>The Breakery - Shift Summary &amp; Closing</title>
<script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&amp;family=Playfair+Display:ital,wght@0,600;0,700;1,600&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<script id="tailwind-config">
        tailwind.config = {
            darkMode: "class",
            theme: {
                extend: {
                    colors: {
                        "primary": "#c8a45b",
                        "background-light": "#f8f7f6",
                        "background-dark": "#1e1b14",
                        "surface-dark": "#2a261f",
                        "border-dark": "#3d362a",
                    },
                    fontFamily: {
                        "display": ["Inter", "sans-serif"],
                        "serif": ["Playfair Display", "serif"],
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
            background-color: #1e1b14;
        }
        .font-serif-header {
            font-family: 'Playfair Display', serif;
        }
    </style>
</head>
<body class="bg-background-light dark:bg-background-dark text-slate-800 dark:text-slate-100 min-h-screen flex items-center justify-center p-4">
<!-- Modal Backdrop Overlay -->
<div class="fixed inset-0 bg-black/80 backdrop-blur-sm z-0"></div>
<!-- Main Closing Shift Modal -->
<main class="relative z-10 w-full max-w-4xl bg-white dark:bg-surface-dark rounded-xl shadow-2xl border border-primary/20 overflow-hidden">
<!-- Header Section -->
<header class="p-8 border-b border-border-dark flex justify-between items-start bg-primary/5">
<div>
<h1 class="text-3xl font-serif-header font-bold text-primary mb-1">Shift Summary &amp; Closing</h1>
<p class="text-sm text-slate-400 font-display uppercase tracking-widest flex items-center gap-2">
<span class="material-icons text-sm">person</span>
                    Lead Barista: Julianne V. • Oct 24, 2023 • 21:45 PM
                </p>
</div>
<button class="text-slate-400 hover:text-white transition-colors">
<span class="material-icons">close</span>
</button>
</header>
<div class="p-8 space-y-8">
<!-- Stats Grid -->
<section class="grid grid-cols-1 md:grid-cols-3 gap-6">
<div class="bg-background-dark/50 border border-border-dark p-5 rounded-lg flex flex-col items-center text-center">
<span class="text-primary/60 text-xs font-bold uppercase tracking-tighter mb-2">Shift Duration</span>
<span class="text-2xl font-semibold font-display">08h 42m</span>
<span class="text-[10px] text-slate-500 mt-1">Started at 13:03 PM</span>
</div>
<div class="bg-background-dark/50 border border-border-dark p-5 rounded-lg flex flex-col items-center text-center">
<span class="text-primary/60 text-xs font-bold uppercase tracking-tighter mb-2">Total Orders</span>
<span class="text-2xl font-semibold font-display">124</span>
<span class="text-[10px] text-slate-500 mt-1">Avg $19.75 / order</span>
</div>
<div class="bg-background-dark/50 border border-border-dark p-5 rounded-lg flex flex-col items-center text-center">
<span class="text-primary/60 text-xs font-bold uppercase tracking-tighter mb-2">Net Sales</span>
<span class="text-2xl font-semibold font-display text-primary">$2,450.00</span>
<span class="text-[10px] text-slate-500 mt-1">Excl. Tips &amp; Tax</span>
</div>
</section>
<!-- Financial Breakdown Table -->
<section>
<h2 class="text-lg font-serif-header text-primary mb-4 flex items-center gap-2">
<span class="material-icons text-sm">receipt_long</span>
                    Payment Reconciliation
                </h2>
<div class="overflow-hidden rounded-lg border border-border-dark">
<table class="w-full text-left border-collapse">
<thead class="bg-primary/10 border-b border-border-dark">
<tr>
<th class="px-6 py-3 text-xs font-bold uppercase tracking-wider text-primary">Payment Method</th>
<th class="px-6 py-3 text-xs font-bold uppercase tracking-wider text-primary text-right">Expected</th>
<th class="px-6 py-3 text-xs font-bold uppercase tracking-wider text-primary text-right">Actual</th>
<th class="px-6 py-3 text-xs font-bold uppercase tracking-wider text-primary text-right">Discrepancy</th>
</tr>
</thead>
<tbody class="divide-y divide-border-dark font-display">
<tr class="bg-white/5">
<td class="px-6 py-4 font-medium">Cash (Drawer)</td>
<td class="px-6 py-4 text-right">$842.50</td>
<td class="px-6 py-4 text-right text-slate-400">--</td>
<td class="px-6 py-4 text-right text-slate-400">--</td>
</tr>
<tr>
<td class="px-6 py-4 font-medium">Credit Card (Stripe)</td>
<td class="px-6 py-4 text-right">$1,215.00</td>
<td class="px-6 py-4 text-right">$1,215.00</td>
<td class="px-6 py-4 text-right text-emerald-500 font-bold">$0.00</td>
</tr>
<tr class="bg-white/5">
<td class="px-6 py-4 font-medium">EDC / Gift Cards</td>
<td class="px-6 py-4 text-right">$392.50</td>
<td class="px-6 py-4 text-right">$392.50</td>
<td class="px-6 py-4 text-right text-emerald-500 font-bold">$0.00</td>
</tr>
</tbody>
<tfoot class="bg-background-dark/30">
<tr>
<td class="px-6 py-4 font-bold text-primary">TOTAL RECONCILED</td>
<td class="px-6 py-4 text-right font-bold">$2,450.00</td>
<td class="px-6 py-4 text-right font-bold">$1,607.50</td>
<td class="px-6 py-4 text-right text-rose-500 font-bold">-$842.50</td>
</tr>
</tfoot>
</table>
</div>
</section>
<!-- Cash Reconciliation Input Module -->
<section class="grid grid-cols-1 md:grid-cols-2 gap-8 items-end bg-background-dark/40 p-6 rounded-lg border border-primary/10">
<div class="space-y-4">
<label class="block text-sm font-bold uppercase tracking-wide text-slate-300" for="counted-cash">
                        Actual Counted Cash in Drawer
                    </label>
<div class="relative">
<span class="absolute left-4 top-1/2 -translate-y-1/2 text-primary font-bold text-xl">$</span>
<input class="w-full bg-surface-dark border-2 border-primary/30 focus:border-primary focus:ring-0 rounded-lg py-4 pl-10 pr-4 text-2xl font-display font-semibold text-white transition-all" id="counted-cash" placeholder="0.00" type="number" value="840.00"/>
</div>
</div>
<div class="space-y-4">
<div class="flex justify-between items-center mb-1">
<span class="text-xs font-bold uppercase tracking-wide text-slate-400">Variance Indicator</span>
<span class="text-xs text-rose-400 flex items-center gap-1">
<span class="material-icons text-[14px]">warning</span> Discrepancy Found
                        </span>
</div>
<div class="bg-rose-500/10 border border-rose-500/30 rounded-lg p-4 flex justify-between items-center">
<div class="flex flex-col">
<span class="text-[10px] uppercase text-rose-300 font-bold">Shortfall</span>
<span class="text-xl font-bold text-rose-500">-$2.50</span>
</div>
<div class="h-10 w-10 bg-rose-500/20 rounded-full flex items-center justify-center">
<span class="material-icons text-rose-500">trending_down</span>
</div>
</div>
</div>
</section>
</div>
<!-- Footer Actions -->
<footer class="p-8 bg-background-dark/60 border-t border-border-dark flex flex-col md:flex-row gap-4 items-center justify-between">
<button class="flex items-center gap-2 text-slate-400 hover:text-primary transition-colors font-display text-sm font-medium">
<span class="material-icons">print</span>
                Print X-Report Summary
            </button>
<div class="flex gap-4 w-full md:w-auto">
<button class="flex-1 md:flex-none px-8 py-4 bg-transparent border border-border-dark hover:border-slate-500 text-slate-300 rounded-lg font-display font-semibold transition-all">
                    Back to POS
                </button>
<button class="flex-1 md:flex-none px-12 py-4 bg-primary hover:bg-primary/90 text-white rounded-lg font-display font-bold text-lg shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-3">
<span class="material-icons">lock</span>
                    Finalize &amp; Close Shift
                </button>
</div>
</footer>
</main>
<!-- Background Decoration for Artisan Feel -->
<div class="fixed bottom-0 left-0 p-8 opacity-20 pointer-events-none z-0">
<img class="w-64 h-64 object-cover rounded-full mix-blend-overlay" data-alt="Top down view of coffee beans on dark surface" src="https://lh3.googleusercontent.com/aida-public/AB6AXuB6kTGsRW2a59VHAYnZNk4rnHOKjT5X4VQhxYtNM7eT_2L235vLk3m7fCec806pIGP94XdDPGEo8A3-I_GBdyrvX6Rxz6J1TEnM_gSXV1il73UWDqYqARjZntBiAEgY7Eiq11M7ZJ1Rhs7ajrrP0Jn95sfqudCacrz_IP5HwTgF-JNCR-h23UXyba9kpDj5_5yx_YE4ZjU-_TV_j8Nd6Ya4EPzBCzoIMHdluYIqJuzQIpA5-dCRLNmO6Td5ldow16TgrZtntGw7_pc"/>
</div>
<div class="fixed top-0 right-0 p-8 opacity-20 pointer-events-none z-0">
<img class="w-96 h-96 object-cover rounded-full mix-blend-overlay" data-alt="Warm bakery interior with golden lighting" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAPWp5dHMibVOPsb0MCA9Xshr3N_KDr86zvIVsHy_v8xO3yYdH10N-ZiSFZTvN9cY2-O92Ss-4ixjBGi5tEBOFe-Iq2ydBon9yszxN6sIyXkmRnwXM_8VPvmy9XRBfIxSRnmLU5t50yJ7CS1nzn-StbxALBdm_Z7vB5PyxP8674KM_DksJ3DZYPciEsP4Etb1XCqRG1am7HLltfcj4CMXtZW2jElVzKD7Xoi3dX2JcoJxf8SC3MC3C1FXNtNsiGVRqewj1P9s2S-PA"/>
</div>
</body></html>
      <!-- STITCH_HTML_END -->
    ` }} />
    );
};

export default ShiftSummary;
