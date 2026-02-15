import React from 'react';

const Printing___Receipt_Settings: React.FC = () => {
  return (
    <div dangerouslySetInnerHTML={{ __html: \
      <!-- STITCH_HTML_START -->
      <!DOCTYPE html>

<html class="dark" lang="en"><head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
<script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&amp;family=Playfair+Display:ital,wght@0,400;0,700;1,400&amp;display=swap" rel="stylesheet"/>
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
            "surface-dark": "#1a1a1d",
            "border-gold": "#c8a45b33",
          },
          fontFamily: {
            "display": ["Inter", "sans-serif"],
            "serif": ["Playfair Display", "serif"]
          },
          borderRadius: {"DEFAULT": "0.25rem", "lg": "0.5rem", "xl": "0.75rem", "full": "9999px"},
        },
      },
    }
  </script>
<title>The Breakery | Printing &amp; Receipts</title>
<style>
    body {
      font-family: 'Inter', sans-serif;
    }
    .receipt-paper {
      box-shadow: 0 10px 30px rgba(0,0,0,0.5);
      position: relative;
    }
    .receipt-paper::after {
      content: "";
      position: absolute;
      bottom: -10px;
      left: 0;
      right: 0;
      height: 10px;
      background-image: linear-gradient(135deg, transparent 33.33%, #ffffff 33.33%, #ffffff 66.66%, transparent 66.66%), 
                        linear-gradient(225deg, transparent 33.33%, #ffffff 33.33%, #ffffff 66.66%, transparent 66.66%);
      background-size: 15px 30px;
      background-position: 0 0;
    }
  </style>
</head>
<body class="bg-background-light dark:bg-background-dark text-slate-800 dark:text-slate-200 min-h-screen font-display">
<!-- Main Container -->
<div class="max-w-[1440px] mx-auto px-6 py-8">
<!-- Header -->
<header class="flex items-center justify-between mb-10">
<div class="flex items-center gap-4">
<div class="bg-primary/10 p-3 rounded-lg border border-border-gold">
<span class="material-icons text-primary text-3xl">print</span>
</div>
<div>
<h1 class="font-serif text-3xl font-bold text-slate-900 dark:text-white">Printing &amp; Receipts</h1>
<p class="text-sm text-slate-500 dark:text-slate-400 mt-1">Manage network connectivity and visual output templates</p>
</div>
</div>
<div class="flex gap-3">
<button class="px-4 py-2 border border-primary/30 text-primary rounded-lg hover:bg-primary/5 transition-colors font-medium">
          View Logs
        </button>
<button class="px-4 py-2 bg-primary text-background-dark rounded-lg hover:bg-primary/90 transition-colors font-semibold">
          Save Changes
        </button>
</div>
</header>
<div class="grid grid-cols-12 gap-8">
<!-- Left Column: Settings & Connectivity -->
<div class="col-span-12 lg:col-span-7 space-y-8">
<!-- Connection Card -->
<section class="bg-surface-dark border border-white/5 rounded-xl p-6 shadow-xl">
<div class="flex items-center justify-between mb-6">
<h2 class="text-lg font-semibold flex items-center gap-2">
<span class="material-icons text-primary text-sm">hub</span>
              Print Server Configuration
            </h2>
<div class="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
<span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
<span class="text-xs font-bold text-emerald-500 uppercase tracking-wider">Connected</span>
</div>
</div>
<div class="space-y-4">
<div>
<label class="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wide">Print Server URL</label>
<div class="flex gap-3">
<input class="flex-1 bg-background-dark border border-white/10 rounded-lg px-4 py-2.5 text-white focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all" type="text" value="http://192.168.1.104:9100/breakery-print"/>
<button class="px-5 py-2.5 bg-white/5 border border-white/10 hover:border-primary/50 text-slate-200 rounded-lg transition-all flex items-center gap-2 font-medium">
<span class="material-icons text-sm">refresh</span>
                  Test Connection
                </button>
</div>
</div>
</div>
</section>
<!-- Printer Assignments Table -->
<section class="bg-surface-dark border border-white/5 rounded-xl overflow-hidden shadow-xl">
<div class="p-6 border-b border-white/5 flex items-center justify-between">
<h2 class="text-lg font-semibold flex items-center gap-2">
<span class="material-icons text-primary text-sm">settings_input_component</span>
              Device Assignments
            </h2>
<button class="text-primary hover:text-white text-sm flex items-center gap-1 transition-colors">
<span class="material-icons text-sm">add</span> Add Printer
            </button>
</div>
<div class="overflow-x-auto">
<table class="w-full text-left">
<thead>
<tr class="text-xs uppercase tracking-wider text-slate-500 bg-white/5">
<th class="px-6 py-4 font-semibold">Printer Name</th>
<th class="px-6 py-4 font-semibold">Type</th>
<th class="px-6 py-4 font-semibold text-center">Paper Size</th>
<th class="px-6 py-4 font-semibold">Status</th>
<th class="px-6 py-4 font-semibold text-right">Action</th>
</tr>
</thead>
<tbody class="divide-y divide-white/5">
<tr class="hover:bg-white/5 transition-colors group">
<td class="px-6 py-4">
<div class="font-medium text-slate-200">Main Receipt</div>
<div class="text-xs text-slate-500">Front Desk Station</div>
</td>
<td class="px-6 py-4 text-sm text-slate-400 italic">Thermal Receipt</td>
<td class="px-6 py-4 text-center">
<span class="px-2 py-1 bg-background-dark border border-white/10 rounded text-xs font-mono">80mm</span>
</td>
<td class="px-6 py-4">
<span class="inline-flex items-center gap-1.5 text-emerald-500 text-xs font-medium">
<span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Active
                    </span>
</td>
<td class="px-6 py-4 text-right">
<button class="text-slate-500 hover:text-primary transition-colors">
<span class="material-icons text-lg">tune</span>
</button>
</td>
</tr>
<tr class="hover:bg-white/5 transition-colors group">
<td class="px-6 py-4">
<div class="font-medium text-slate-200">Kitchen Printer</div>
<div class="text-xs text-slate-500">Baking Ops Station</div>
</td>
<td class="px-6 py-4 text-sm text-slate-400 italic">Impact Dot Matrix</td>
<td class="px-6 py-4 text-center">
<span class="px-2 py-1 bg-background-dark border border-white/10 rounded text-xs font-mono">80mm</span>
</td>
<td class="px-6 py-4">
<span class="inline-flex items-center gap-1.5 text-emerald-500 text-xs font-medium">
<span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Active
                    </span>
</td>
<td class="px-6 py-4 text-right">
<button class="text-slate-500 hover:text-primary transition-colors">
<span class="material-icons text-lg">tune</span>
</button>
</td>
</tr>
<tr class="hover:bg-white/5 transition-colors group">
<td class="px-6 py-4">
<div class="font-medium text-slate-200">Label Printer</div>
<div class="text-xs text-slate-500">Packaging Station</div>
</td>
<td class="px-6 py-4 text-sm text-slate-400 italic">Adhesive Label</td>
<td class="px-6 py-4 text-center">
<span class="px-2 py-1 bg-background-dark border border-white/10 rounded text-xs font-mono">62mm</span>
</td>
<td class="px-6 py-4">
<span class="inline-flex items-center gap-1.5 text-amber-500 text-xs font-medium">
<span class="w-1.5 h-1.5 rounded-full bg-amber-500"></span> Offline
                    </span>
</td>
<td class="px-6 py-4 text-right">
<button class="text-slate-500 hover:text-primary transition-colors">
<span class="material-icons text-lg">tune</span>
</button>
</td>
</tr>
</tbody>
</table>
</div>
</section>
</div>
<!-- Right Column: Receipt Preview -->
<div class="col-span-12 lg:col-span-5 flex flex-col items-center">
<div class="sticky top-8 w-full max-w-sm">
<div class="mb-6 flex items-center justify-between px-2">
<h3 class="font-semibold text-lg">Template Preview</h3>
<span class="text-xs text-slate-500 italic">Mockup 1:1 Scale</span>
</div>
<!-- Receipt Mockup -->
<div class="receipt-paper bg-white text-slate-900 p-8 w-full rounded-t-sm font-mono text-[11px] leading-tight">
<!-- Receipt Header -->
<div class="text-center mb-6">
<h4 class="font-serif text-xl font-bold uppercase tracking-widest mb-1">The Breakery</h4>
<p>Craft Artisan Bakes</p>
<p>128 Baker Street, London</p>
<p>+44 20 7946 0958</p>
</div>
<!-- Transaction Info -->
<div class="border-y border-dashed border-slate-300 py-3 mb-4">
<div class="flex justify-between">
<span>ORDER #4920</span>
<span>24/05/2024 14:32</span>
</div>
<div class="flex justify-between">
<span>SERVER: ELARA</span>
<span>STATION: 01</span>
</div>
</div>
<!-- Line Items -->
<div class="space-y-2 mb-4">
<div class="flex justify-between">
<span class="flex-1 text-left">1 x Signature Sourdough</span>
<span class="w-16 text-right">£6.50</span>
</div>
<div class="flex justify-between">
<span class="flex-1 text-left">2 x Almond Croissant</span>
<span class="w-16 text-right">£8.00</span>
</div>
<div class="flex justify-between">
<span class="flex-1 text-left">1 x Madagascar Vanilla Latte</span>
<span class="w-16 text-right">£4.25</span>
</div>
</div>
<!-- Totals -->
<div class="border-t border-slate-900 pt-3 mb-6">
<div class="flex justify-between font-bold text-sm">
<span>TOTAL</span>
<span>£18.75</span>
</div>
<div class="flex justify-between mt-1">
<span>VAT (20%)</span>
<span>£3.13</span>
</div>
</div>
<!-- QR & Footer -->
<div class="text-center space-y-4">
<div class="flex justify-center">
<div class="w-20 h-20 bg-slate-100 flex items-center justify-center border border-slate-200">
<img alt="QR Code" class="w-16 h-16 grayscale" data-alt="Black and white QR code for feedback" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAW47yHBa23rtdcrn9zPdDv2b9lgtYaBjc9gUFsp6gQn2zUQCjHfa2aFsAFcBYJOmvYfvpMnuxhZg9gyrHSHCqvm40z0s21fd-o5ju2yX9IyUF7Lj5g1lkMJScCQ9bMrlQRks2wh-iBtWu0OJTleywozq-NMEZHIMk1H1g5IA1YWIQxk7FlxUjy87yg6v6zFeWvch8MKGouYRz6aajqsu7n9Ogvq-X61rTq9-ZTb47qAdrVaGcANJ9SAq2bSpk2EDGS6a_6u8cOEvUL"/>
</div>
</div>
<div>
<p class="font-bold">Thank you for choosing The Breakery</p>
<p>Scan to join our Rewards Program</p>
</div>
</div>
</div>
<!-- Action Button Below Preview -->
<button class="w-full mt-10 py-4 bg-primary text-background-dark font-bold rounded-lg shadow-lg hover:brightness-110 transition-all flex items-center justify-center gap-2">
<span class="material-icons">palette</span>
            Customize Template
          </button>
<div class="mt-4 p-4 rounded-lg bg-surface-dark/50 border border-white/5 flex gap-3">
<span class="material-icons text-slate-500">info</span>
<p class="text-xs text-slate-500 leading-relaxed">
               Changes to the receipt template will automatically sync to all active printers once saved. Refresh the server connection to force immediate update.
             </p>
</div>
</div>
</div>
</div>
</div>
</body></html>
      <!-- STITCH_HTML_END -->
    \ }} />
  );
};

export default Printing___Receipt_Settings;
