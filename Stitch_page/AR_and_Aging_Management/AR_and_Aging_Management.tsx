import React from 'react';

const AR_and_Aging_Management: React.FC = () => {
  return (
    <div dangerouslySetInnerHTML={{ __html: `
      <!-- STITCH_HTML_START -->
      <!DOCTYPE html>

<html class="dark" lang="en"><head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
<script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&amp;family=Playfair+Display:wght@600;700&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<script id="tailwind-config">
        tailwind.config = {
            darkMode: "class",
            theme: {
                extend: {
                    colors: {
                        "primary": "#eead2b",
                        "background-light": "#f8f7f6",
                        "background-dark": "#0D0D0F",
                        "charcoal": "#1A1A1D",
                        "border-muted": "#2A2A30"
                    },
                    fontFamily: {
                        "display": ["Inter", "sans-serif"],
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
            font-family: 'Inter', sans-serif;
            -webkit-font-smoothing: antialiased;
        }
        .title-serif {
            font-family: 'Playfair Display', serif;
        }
        .scrollbar-hide::-webkit-scrollbar {
            display: none;
        }
        .table-row-hover:hover {
            background-color: #1A1A1D;
        }
    </style>
</head>
<body class="bg-background-light dark:bg-background-dark text-slate-800 dark:text-slate-200 min-h-screen flex">
<!-- Sidebar Navigation Rail -->
<aside class="w-20 border-r border-border-muted flex flex-col items-center py-8 gap-8 bg-background-dark">
<div class="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center border border-primary/20">
<span class="text-primary font-bold text-2xl">B</span>
</div>
<nav class="flex flex-col gap-6">
<a class="text-primary" href="#"><span class="material-icons">dashboard</span></a>
<a class="text-slate-500 hover:text-primary transition-colors" href="#"><span class="material-icons">receipt_long</span></a>
<a class="text-slate-500 hover:text-primary transition-colors" href="#"><span class="material-icons">groups</span></a>
<a class="text-slate-500 hover:text-primary transition-colors" href="#"><span class="material-icons">inventory_2</span></a>
<a class="text-slate-500 hover:text-primary transition-colors" href="#"><span class="material-icons">analytics</span></a>
</nav>
<div class="mt-auto flex flex-col gap-6">
<a class="text-slate-500 hover:text-primary transition-colors" href="#"><span class="material-icons">settings</span></a>
<div class="w-10 h-10 rounded-full bg-slate-800 border border-border-muted overflow-hidden">
<img alt="Profile" data-alt="Headshot of a financial manager" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAzmx9sYhHq5TzLvpELFqVc402JlUJmS_w_IEzNctTb_gtSMh0jljPa0cquNcfWn-jJaPndcTZl11ehvEWl5FJqFS7PU5xeE2XGcUDLYH5UfDP8Ysi7MQCbyM_-DHU-TDKe1RVpanYITdoMo7Xk3pCxsH1tVfTK_OIrLk6NcW4w3tOatG3rzgEHYgbCaoe0K1Ef8J5Qffqd8BtTL4MC43Nfhyt9a8dzIFDMIfFmWhhi70iQgCqi0y3-sILx9muw7AZ09JP6ON7-UsEr"/>
</div>
</div>
</aside>
<!-- Main Content -->
<main class="flex-1 flex flex-col overflow-hidden">
<!-- Header -->
<header class="h-20 border-b border-border-muted flex items-center justify-between px-8 bg-background-dark">
<h1 class="title-serif text-2xl text-slate-100">Accounts Receivable &amp; Aging</h1>
<div class="flex items-center gap-4">
<button class="flex items-center gap-2 px-4 py-2 border border-border-muted rounded-lg text-sm font-medium text-slate-300 hover:bg-charcoal transition-colors">
<span class="material-icons text-sm">file_download</span>
                    Export Aging Report
                </button>
<button class="flex items-center gap-2 px-4 py-2 bg-primary text-black rounded-lg text-sm font-bold hover:bg-primary/90 transition-colors">
<span class="material-icons text-sm">auto_awesome_motion</span>
                    Batch Monthly Statements
                </button>
</div>
</header>
<!-- Aging Summary Row -->
<section class="p-8 grid grid-cols-5 gap-4 bg-background-dark">
<!-- Current -->
<div class="bg-charcoal border border-border-muted p-5 rounded-xl">
<p class="text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-1">Current</p>
<h3 class="text-2xl font-bold text-primary">\\$412,850.00</h3>
<div class="mt-3 w-full bg-slate-800 h-1 rounded-full overflow-hidden">
<div class="bg-primary h-full w-[65%]"></div>
</div>
<p class="mt-2 text-[10px] text-slate-400">65% of Total AR</p>
</div>
<!-- 1-30 Days -->
<div class="bg-charcoal border border-border-muted p-5 rounded-xl">
<p class="text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-1">1-30 Days</p>
<h3 class="text-2xl font-bold text-primary">\\$128,400.00</h3>
<div class="mt-3 w-full bg-slate-800 h-1 rounded-full overflow-hidden">
<div class="bg-primary/60 h-full w-[20%]"></div>
</div>
<p class="mt-2 text-[10px] text-slate-400">20% of Total AR</p>
</div>
<!-- 31-60 Days -->
<div class="bg-charcoal border border-border-muted p-5 rounded-xl">
<p class="text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-1">31-60 Days</p>
<h3 class="text-2xl font-bold text-primary">\\$54,220.00</h3>
<div class="mt-3 w-full bg-slate-800 h-1 rounded-full overflow-hidden">
<div class="bg-primary/40 h-full w-[8%]"></div>
</div>
<p class="mt-2 text-[10px] text-slate-400">8% of Total AR</p>
</div>
<!-- 61-90 Days -->
<div class="bg-charcoal border border-border-muted p-5 rounded-xl">
<p class="text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-1">61-90 Days</p>
<h3 class="text-2xl font-bold text-primary">\\$21,050.00</h3>
<div class="mt-3 w-full bg-slate-800 h-1 rounded-full overflow-hidden">
<div class="bg-orange-500 h-full w-[4%]"></div>
</div>
<p class="mt-2 text-[10px] text-slate-400">4% of Total AR</p>
</div>
<!-- 90+ Days -->
<div class="bg-charcoal border border-border-muted p-5 rounded-xl">
<p class="text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-1">90+ Days</p>
<h3 class="text-2xl font-bold text-red-500">\\$18,900.00</h3>
<div class="mt-3 w-full bg-slate-800 h-1 rounded-full overflow-hidden">
<div class="bg-red-500 h-full w-[3%]"></div>
</div>
<p class="mt-2 text-[10px] text-slate-400">3% of Total AR</p>
</div>
</section>
<!-- Unpaid Invoices Table -->
<section class="flex-1 px-8 pb-8 overflow-y-auto scrollbar-hide bg-background-dark">
<div class="border border-border-muted rounded-xl overflow-hidden bg-charcoal/30">
<table class="w-full text-left text-sm">
<thead class="bg-charcoal text-slate-400 border-b border-border-muted">
<tr>
<th class="px-6 py-4 font-semibold uppercase tracking-wider text-[11px]">Invoice #</th>
<th class="px-6 py-4 font-semibold uppercase tracking-wider text-[11px]">Date</th>
<th class="px-6 py-4 font-semibold uppercase tracking-wider text-[11px]">Client</th>
<th class="px-6 py-4 font-semibold uppercase tracking-wider text-[11px]">Original Amount</th>
<th class="px-6 py-4 font-semibold uppercase tracking-wider text-[11px]">Remaining Balance</th>
<th class="px-6 py-4 font-semibold uppercase tracking-wider text-[11px]">Days Overdue</th>
<th class="px-6 py-4 font-semibold uppercase tracking-wider text-[11px]">Status</th>
</tr>
</thead>
<tbody class="divide-y divide-border-muted">
<tr class="table-row-hover transition-colors">
<td class="px-6 py-4 font-mono text-primary">#INV-9402</td>
<td class="px-6 py-4 text-slate-400">Oct 12, 2023</td>
<td class="px-6 py-4 font-medium">Artisanal Flour Co.</td>
<td class="px-6 py-4 text-slate-400">\\$12,450.00</td>
<td class="px-6 py-4 font-bold text-slate-200">\\$8,200.00</td>
<td class="px-6 py-4"><span class="text-red-400 font-bold">12 Days</span></td>
<td class="px-6 py-4"><span class="px-2 py-1 rounded bg-primary/10 text-primary text-[10px] font-bold uppercase">Partial</span></td>
</tr>
<tr class="table-row-hover transition-colors">
<td class="px-6 py-4 font-mono text-primary">#INV-9418</td>
<td class="px-6 py-4 text-slate-400">Oct 15, 2023</td>
<td class="px-6 py-4 font-medium">The Daily Knead</td>
<td class="px-6 py-4 text-slate-400">\\$4,200.00</td>
<td class="px-6 py-4 font-bold text-slate-200">\\$4,200.00</td>
<td class="px-6 py-4"><span class="text-red-400 font-bold">9 Days</span></td>
<td class="px-6 py-4"><span class="px-2 py-1 rounded bg-slate-800 text-slate-400 text-[10px] font-bold uppercase">Unpaid</span></td>
</tr>
<tr class="table-row-hover transition-colors">
<td class="px-6 py-4 font-mono text-primary">#INV-9388</td>
<td class="px-6 py-4 text-slate-400">Sept 20, 2023</td>
<td class="px-6 py-4 font-medium">Urban Crumb Wholesale</td>
<td class="px-6 py-4 text-slate-400">\\$22,100.00</td>
<td class="px-6 py-4 font-bold text-slate-200">\\$22,100.00</td>
<td class="px-6 py-4"><span class="text-red-500 font-bold">34 Days</span></td>
<td class="px-6 py-4"><span class="px-2 py-1 rounded bg-slate-800 text-slate-400 text-[10px] font-bold uppercase">Unpaid</span></td>
</tr>
<tr class="table-row-hover transition-colors">
<td class="px-6 py-4 font-mono text-primary">#INV-9450</td>
<td class="px-6 py-4 text-slate-400">Oct 28, 2023</td>
<td class="px-6 py-4 font-medium">Baguette &amp; Beyond</td>
<td class="px-6 py-4 text-slate-400">\\$3,150.00</td>
<td class="px-6 py-4 font-bold text-slate-200">\\$3,150.00</td>
<td class="px-6 py-4"><span class="text-slate-500 italic">Current</span></td>
<td class="px-6 py-4"><span class="px-2 py-1 rounded bg-slate-800 text-slate-400 text-[10px] font-bold uppercase">Unpaid</span></td>
</tr>
<tr class="table-row-hover transition-colors">
<td class="px-6 py-4 font-mono text-primary">#INV-9312</td>
<td class="px-6 py-4 text-slate-400">Aug 05, 2023</td>
<td class="px-6 py-4 font-medium">Heritage Grains Ltd.</td>
<td class="px-6 py-4 text-slate-400">\\$18,900.00</td>
<td class="px-6 py-4 font-bold text-slate-200">\\$18,900.00</td>
<td class="px-6 py-4"><span class="text-red-500 font-bold text-lg">90+ Days</span></td>
<td class="px-6 py-4"><span class="px-2 py-1 rounded bg-red-500/10 text-red-500 text-[10px] font-bold uppercase">Critical</span></td>
</tr>
<tr class="table-row-hover transition-colors">
<td class="px-6 py-4 font-mono text-primary">#INV-9455</td>
<td class="px-6 py-4 text-slate-400">Oct 30, 2023</td>
<td class="px-6 py-4 font-medium">Golden Crust Bakers</td>
<td class="px-6 py-4 text-slate-400">\\$9,800.00</td>
<td class="px-6 py-4 font-bold text-slate-200">\\$9,800.00</td>
<td class="px-6 py-4"><span class="text-slate-500 italic">Current</span></td>
<td class="px-6 py-4"><span class="px-2 py-1 rounded bg-slate-800 text-slate-400 text-[10px] font-bold uppercase">Unpaid</span></td>
</tr>
<tr class="table-row-hover transition-colors">
<td class="px-6 py-4 font-mono text-primary">#INV-9456</td>
<td class="px-6 py-4 text-slate-400">Oct 30, 2023</td>
<td class="px-6 py-4 font-medium">Rye &amp; Shine Coffee</td>
<td class="px-6 py-4 text-slate-400">\\$1,250.00</td>
<td class="px-6 py-4 font-bold text-slate-200">\\$1,250.00</td>
<td class="px-6 py-4"><span class="text-slate-500 italic">Current</span></td>
<td class="px-6 py-4"><span class="px-2 py-1 rounded bg-slate-800 text-slate-400 text-[10px] font-bold uppercase">Unpaid</span></td>
</tr>
<tr class="table-row-hover transition-colors">
<td class="px-6 py-4 font-mono text-primary">#INV-9400</td>
<td class="px-6 py-4 text-slate-400">Oct 10, 2023</td>
<td class="px-6 py-4 font-medium">Sourdough Sisters</td>
<td class="px-6 py-4 text-slate-400">\\$6,700.00</td>
<td class="px-6 py-4 font-bold text-slate-200">\\$1,400.00</td>
<td class="px-6 py-4"><span class="text-red-400 font-bold">14 Days</span></td>
<td class="px-6 py-4"><span class="px-2 py-1 rounded bg-primary/10 text-primary text-[10px] font-bold uppercase">Partial</span></td>
</tr>
</tbody>
</table>
</div>
</section>
</main>
<!-- Overlaid Modal: Apply Payment -->
<div class="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-6">
<div class="bg-charcoal w-full max-w-md border border-border-muted rounded-xl shadow-2xl">
<div class="p-6 border-b border-border-muted flex justify-between items-center">
<h2 class="title-serif text-xl text-primary">Apply Payment</h2>
<button class="text-slate-500 hover:text-white"><span class="material-icons">close</span></button>
</div>
<form class="p-6 space-y-5">
<div class="space-y-1.5">
<label class="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Client</label>
<div class="bg-background-dark border border-border-muted p-3 rounded-lg text-slate-200 text-sm">
                        Artisanal Flour Co.
                    </div>
</div>
<div class="grid grid-cols-2 gap-4">
<div class="space-y-1.5">
<label class="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Amount</label>
<div class="relative">
<span class="absolute left-3 top-1/2 -translate-y-1/2 text-primary font-bold">\\$</span>
<input class="w-full bg-background-dark border border-border-muted pl-8 pr-3 py-2.5 rounded-lg text-sm focus:ring-1 focus:ring-primary focus:border-primary outline-none text-white" type="text" value="8,200.00"/>
</div>
</div>
<div class="space-y-1.5">
<label class="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Payment Date</label>
<input class="w-full bg-background-dark border border-border-muted px-3 py-2 rounded-lg text-sm focus:ring-1 focus:ring-primary focus:border-primary outline-none text-white [color-scheme:dark]" type="date" value="2023-11-01"/>
</div>
</div>
<div class="space-y-1.5">
<label class="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Payment Method</label>
<select class="w-full bg-background-dark border border-border-muted px-3 py-2.5 rounded-lg text-sm focus:ring-1 focus:ring-primary focus:border-primary outline-none text-white appearance-none">
<option>Bank Transfer</option>
<option>Check</option>
<option>Credit Card</option>
</select>
</div>
<div class="space-y-1.5">
<label class="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Reference #</label>
<input class="w-full bg-background-dark border border-border-muted px-3 py-2.5 rounded-lg text-sm focus:ring-1 focus:ring-primary focus:border-primary outline-none text-white" placeholder="e.g. ACH-482019" type="text"/>
</div>
<div class="flex items-center gap-3 py-2">
<div class="relative flex items-center">
<input checked="" class="w-5 h-5 rounded border-border-muted bg-background-dark text-primary focus:ring-primary focus:ring-offset-background-dark cursor-pointer" type="checkbox"/>
</div>
<label class="text-sm text-slate-300 cursor-pointer">Auto-apply to oldest outstanding invoices</label>
</div>
<div class="pt-4 flex gap-3">
<button class="flex-1 px-4 py-3 border border-border-muted rounded-lg text-sm font-medium text-slate-300 hover:bg-background-dark transition-colors" type="button">Cancel</button>
<button class="flex-1 px-4 py-3 bg-primary text-black rounded-lg text-sm font-bold hover:bg-primary/90 transition-colors shadow-lg shadow-primary/10" type="submit">Confirm Payment</button>
</div>
</form>
</div>
</div>
</body></html>
      <!-- STITCH_HTML_END -->
    ` }} />
  );
};

export default AR_and_Aging_Management;
