import React from 'react';

const Tax___Financial_Settings: React.FC = () => {
  return (
    <div dangerouslySetInnerHTML={{ __html: \
      <!-- STITCH_HTML_START -->
      <!DOCTYPE html>

<html class="dark" lang="en"><head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
<title>The Breakery - Tax &amp; Financial Settings</title>
<script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&amp;family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&amp;display=swap" rel="stylesheet"/>
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
                        "background-dark": "#0D0D0F",
                        "card-dark": "#1A1A1D",
                        "input-dark": "#252529"
                    },
                    fontFamily: {
                        "display": ["Inter", "sans-serif"],
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
            font-family: 'Inter', sans-serif;
        }
        .serif-title {
            font-family: 'Playfair Display', serif;
        }
        input:focus, select:focus {
            outline: none;
            border-color: #c8a45b !important;
            ring: 1px solid #c8a45b !important;
        }
        /* Custom Toggle Style */
        .toggle-checkbox:checked {
            right: 0;
            background-color: #c8a45b;
        }
        .toggle-checkbox:checked + .toggle-label {
            background-color: #c8a45b;
        }
    </style>
</head>
<body class="bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 min-h-screen">
<div class="max-w-4xl mx-auto py-12 px-6">
<!-- Header -->
<header class="flex items-center justify-between mb-10">
<div class="flex items-center gap-4">
<div class="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center text-primary">
<span class="material-icons text-3xl">receipt_long</span>
</div>
<div>
<h1 class="serif-title text-3xl font-semibold tracking-tight">Tax &amp; Financial</h1>
<p class="text-sm text-slate-400 mt-1 font-display uppercase tracking-widest">Configuration Panel</p>
</div>
</div>
<div class="text-right">
<span class="text-xs text-slate-500 uppercase font-medium">Instance ID: BKRY-JKT-092</span>
</div>
</header>
<main class="space-y-6">
<!-- Section 1: Tax (PPN) -->
<section class="bg-card-dark rounded-xl p-8 border border-white/5 shadow-2xl">
<div class="flex items-center gap-2 mb-6 border-b border-white/5 pb-4">
<span class="material-icons text-primary text-xl">account_balance_wallet</span>
<h2 class="serif-title text-xl font-medium">Tax Configuration (PPN)</h2>
</div>
<div class="grid grid-cols-1 md:grid-cols-2 gap-8">
<div class="space-y-4">
<label class="block">
<span class="text-sm font-medium text-slate-300">Tax Name</span>
<input class="mt-2 block w-full bg-input-dark border-transparent rounded-lg focus:ring-primary focus:border-primary text-white p-3 font-display" placeholder="e.g. VAT, PPN" type="text" value="PPN"/>
</label>
<label class="block">
<span class="text-sm font-medium text-slate-300">Tax Rate (%)</span>
<div class="relative mt-2">
<input class="block w-full bg-input-dark border-transparent rounded-lg focus:ring-primary focus:border-primary text-white p-3 font-display pr-12" type="number" value="11"/>
<span class="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 font-bold">%</span>
</div>
</label>
</div>
<div class="space-y-6">
<div>
<span class="text-sm font-medium text-slate-300 block mb-3">Calculation Method</span>
<div class="grid grid-cols-2 gap-3">
<label class="cursor-pointer">
<input checked="" class="sr-only peer" name="tax_method" type="radio"/>
<div class="p-3 text-center rounded-lg bg-input-dark border border-transparent peer-checked:border-primary peer-checked:bg-primary/10 transition-all">
<span class="text-sm text-slate-400 peer-checked:text-primary">Tax Inclusive</span>
</div>
</label>
<label class="cursor-pointer">
<input class="sr-only peer" name="tax_method" type="radio"/>
<div class="p-3 text-center rounded-lg bg-input-dark border border-transparent peer-checked:border-primary peer-checked:bg-primary/10 transition-all">
<span class="text-sm text-slate-400 peer-checked:text-primary">Tax Exclusive</span>
</div>
</label>
</div>
</div>
<div class="flex items-center justify-between p-4 bg-primary/5 rounded-lg border border-primary/20">
<div>
<span class="block font-medium text-slate-200">Show tax on receipts</span>
<span class="text-xs text-slate-400">Include detailed breakdown for customers</span>
</div>
<label class="relative inline-flex items-center cursor-pointer">
<input checked="" class="sr-only peer" type="checkbox"/>
<div class="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
</label>
</div>
</div>
</div>
</section>
<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
<!-- Section 2: Currency -->
<section class="bg-card-dark rounded-xl p-8 border border-white/5 shadow-2xl">
<div class="flex items-center gap-2 mb-6">
<span class="material-icons text-primary">payments</span>
<h2 class="serif-title text-xl font-medium">Currency</h2>
</div>
<div class="space-y-4">
<div>
<span class="text-xs uppercase tracking-wider text-slate-500 font-bold">Standard ISO Code</span>
<div class="mt-2 p-3 bg-slate-800/50 border border-slate-700 rounded-lg text-slate-400 font-mono flex items-center gap-2">
<span class="material-icons text-sm">lock</span> IDR
                            </div>
</div>
<div class="p-4 bg-primary/5 rounded-lg border-l-4 border-primary">
<span class="text-xs uppercase tracking-wider text-slate-500 font-bold block mb-1">Display Preview</span>
<span class="text-2xl font-display font-semibold text-primary">Rp 1.250.000</span>
</div>
</div>
</section>
<!-- Section 3: Fiscal Year -->
<section class="bg-card-dark rounded-xl p-8 border border-white/5 shadow-2xl">
<div class="flex items-center gap-2 mb-6">
<span class="material-icons text-primary">event_note</span>
<h2 class="serif-title text-xl font-medium">Fiscal Year</h2>
</div>
<div class="space-y-4">
<label class="block">
<span class="text-sm font-medium text-slate-300">Start Month</span>
<select class="mt-2 block w-full bg-input-dark border-transparent rounded-lg focus:ring-primary focus:border-primary text-white p-3 font-display">
<option selected="">January</option>
<option>April</option>
<option>July</option>
<option>October</option>
</select>
</label>
<button class="w-full mt-2 flex items-center justify-center gap-2 px-4 py-3 bg-slate-800 text-slate-500 rounded-lg border border-slate-700 cursor-not-allowed transition-colors" disabled="">
<span class="material-icons text-sm">history_toggle_off</span>
                            Close Fiscal Year
                        </button>
</div>
</section>
</div>
<!-- Section 4: Rounding -->
<section class="bg-card-dark rounded-xl p-8 border border-white/5 shadow-2xl">
<div class="flex items-center gap-2 mb-6 border-b border-white/5 pb-4">
<span class="material-icons text-primary text-xl">toll</span>
<h2 class="serif-title text-xl font-medium">Cash Rounding</h2>
</div>
<div class="grid grid-cols-1 md:grid-cols-3 gap-8">
<div class="col-span-1">
<label class="block">
<span class="text-sm font-medium text-slate-300">Cash Rounding Rule</span>
<select class="mt-2 block w-full bg-input-dark border-transparent rounded-lg focus:ring-primary focus:border-primary text-white p-3 font-display">
<option selected="">Rp 100</option>
<option>Rp 500</option>
<option>Rp 1.000</option>
<option>No Rounding</option>
</select>
</label>
</div>
<div class="col-span-1">
<span class="text-sm font-medium text-slate-300 block mb-2">Rounding Method</span>
<div class="space-y-2">
<label class="flex items-center gap-3 cursor-pointer group">
<input checked="" class="w-4 h-4 text-primary bg-input-dark border-slate-600 focus:ring-primary" name="rounding_rule" type="radio"/>
<span class="text-sm text-slate-300 group-hover:text-primary transition-colors">To Nearest</span>
</label>
<label class="flex items-center gap-3 cursor-pointer group">
<input class="w-4 h-4 text-primary bg-input-dark border-slate-600 focus:ring-primary" name="rounding_rule" type="radio"/>
<span class="text-sm text-slate-300 group-hover:text-primary transition-colors">Always Up</span>
</label>
<label class="flex items-center gap-3 cursor-pointer group">
<input class="w-4 h-4 text-primary bg-input-dark border-slate-600 focus:ring-primary" name="rounding_rule" type="radio"/>
<span class="text-sm text-slate-300 group-hover:text-primary transition-colors">Always Down</span>
</label>
</div>
</div>
<div class="col-span-1">
<div class="bg-black/40 rounded-lg p-4 border border-white/5 flex flex-col items-center justify-center text-center">
<span class="text-[10px] uppercase tracking-tighter text-slate-500 mb-1">Live Rounding Preview</span>
<div class="flex items-center gap-2">
<span class="text-slate-500 line-through text-xs">Rp 1.250.045</span>
<span class="material-icons text-slate-600 text-sm">arrow_forward</span>
<span class="text-white font-bold">Rp 1.250.000</span>
</div>
</div>
</div>
</div>
</section>
<!-- Bottom Actions -->
<footer class="pt-6 flex items-center justify-between border-t border-white/5">
<p class="text-xs text-slate-500 max-w-sm">Changes will be logged in the audit trail and applied to all future invoices starting from next session.</p>
<div class="flex gap-4">
<button class="px-8 py-3 bg-primary hover:bg-primary/90 text-background-dark font-bold rounded-lg shadow-lg shadow-primary/20 transition-all flex items-center gap-2">
<span class="material-icons text-sm">save</span>
                        Save Tax Settings
                    </button>
</div>
</footer>
</main>
<!-- Aesthetic Background Elements -->
<div class="fixed top-0 right-0 -z-10 opacity-20 translate-x-1/2 -translate-y-1/2">
<div class="w-[600px] h-[600px] bg-primary/20 blur-[120px] rounded-full"></div>
</div>
<div class="fixed bottom-0 left-0 -z-10 opacity-10 -translate-x-1/2 translate-y-1/2">
<div class="w-[400px] h-[400px] bg-primary/30 blur-[100px] rounded-full"></div>
</div>
</div>
</body></html>
      <!-- STITCH_HTML_END -->
    \ }} />
  );
};

export default Tax___Financial_Settings;
