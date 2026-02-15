import React from 'react';

const Payment_Methods_Config: React.FC = () => {
  return (
    <div dangerouslySetInnerHTML={{ __html: \
      <!-- STITCH_HTML_START -->
      <!DOCTYPE html>

<html class="dark" lang="en"><head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
<title>Payment Methods Config | The Breakery</title>
<script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&amp;family=Playfair+Display:wght@600;700&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/icon?family=Material+Icons+Outlined" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<script id="tailwind-config">
      tailwind.config = {
        darkMode: "class",
        theme: {
          extend: {
            colors: {
              "primary": "#f2a60d",
              "background-light": "#f8f7f5",
              "background-dark": "#0D0D0F", // Customized from base for extra depth
              "card-dark": "#1A1A1D",
              "border-dark": "#2A2A30"
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
<style>
        body {
            font-family: 'Inter', sans-serif;
            -webkit-font-smoothing: antialiased;
        }
        .header-title {
            font-family: 'Playfair Display', serif;
        }
        /* Custom Toggle Style */
        .toggle-checkbox:checked {
            right: 0;
            border-color: #f2a60d;
        }
        .toggle-checkbox:checked + .toggle-label {
            background-color: #f2a60d;
        }
    </style>
</head>
<body class="bg-background-light dark:bg-background-dark text-slate-800 dark:text-slate-200 min-h-screen">
<div class="max-w-6xl mx-auto px-6 py-12">
<!-- Header Section -->
<header class="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-4">
<div>
<h1 class="header-title text-3xl font-bold text-slate-900 dark:text-primary mb-2">Payment Methods</h1>
<p class="text-slate-500 dark:text-slate-400 text-sm">Configure and manage transaction gateways for The Breakery platform.</p>
</div>
<div class="flex items-center gap-3">
<span class="text-xs font-semibold uppercase tracking-wider text-slate-400">System Status:</span>
<span class="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-500 text-xs font-medium border border-emerald-500/20">
<span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                    Operational
                </span>
</div>
</header>
<!-- Payment Methods Grid -->
<div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12">
<!-- Cash Payment Card -->
<div class="bg-white dark:bg-card-dark border border-slate-200 dark:border-border-dark rounded-xl p-6 transition-all hover:shadow-lg hover:shadow-primary/5">
<div class="flex items-start justify-between mb-6">
<div class="flex items-center gap-4">
<div class="w-12 h-12 flex items-center justify-center bg-primary/10 rounded-lg">
<span class="material-icons-outlined text-primary text-3xl">payments</span>
</div>
<div>
<h3 class="font-bold text-lg dark:text-white">Cash</h3>
<p class="text-xs text-slate-500">Standard physical currency</p>
</div>
</div>
<label class="relative inline-flex items-center cursor-pointer">
<input checked="" class="sr-only peer" type="checkbox"/>
<div class="w-11 h-6 bg-slate-200 peer-focus:outline-none dark:bg-slate-700 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary"></div>
</label>
</div>
<div class="space-y-4">
<div>
<label class="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">Change Rounding</label>
<select class="w-full bg-slate-50 dark:bg-background-dark/50 border border-slate-200 dark:border-border-dark rounded-lg px-4 py-2.5 text-sm focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all">
<option>Round down to nearest 500</option>
<option>Round up to nearest 1000</option>
<option>No rounding</option>
</select>
</div>
</div>
</div>
<!-- Debit/Credit Card -->
<div class="bg-white dark:bg-card-dark border border-slate-200 dark:border-border-dark rounded-xl p-6 transition-all hover:shadow-lg hover:shadow-primary/5">
<div class="flex items-start justify-between mb-6">
<div class="flex items-center gap-4">
<div class="w-12 h-12 flex items-center justify-center bg-primary/10 rounded-lg">
<span class="material-icons-outlined text-primary text-3xl">credit_card</span>
</div>
<div>
<h3 class="font-bold text-lg dark:text-white">Debit/Credit Card</h3>
<p class="text-xs text-slate-500">Visa, Mastercard, AMEX</p>
</div>
</div>
<label class="relative inline-flex items-center cursor-pointer">
<input checked="" class="sr-only peer" type="checkbox"/>
<div class="w-11 h-6 bg-slate-200 peer-focus:outline-none dark:bg-slate-700 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary"></div>
</label>
</div>
<div class="space-y-4">
<div class="grid grid-cols-2 gap-3">
<div class="flex items-center gap-2 p-2 rounded-lg bg-slate-50 dark:bg-background-dark/30 border border-slate-200 dark:border-border-dark">
<div class="w-6 h-4 bg-blue-800 rounded-sm overflow-hidden" title="Visa">
<div class="w-full h-full bg-slate-200/20 flex items-center justify-center text-[8px] font-bold text-white italic">VISA</div>
</div>
<span class="text-xs font-medium">Visa Enabled</span>
</div>
<div class="flex items-center gap-2 p-2 rounded-lg bg-slate-50 dark:bg-background-dark/30 border border-slate-200 dark:border-border-dark">
<div class="w-6 h-4 bg-orange-600 rounded-sm overflow-hidden" title="Mastercard">
<div class="w-full h-full bg-slate-200/20 flex items-center justify-center text-[8px] font-bold text-white italic">MC</div>
</div>
<span class="text-xs font-medium">Mastercard</span>
</div>
</div>
</div>
</div>
<!-- EDC Terminal -->
<div class="bg-white dark:bg-card-dark border border-slate-200 dark:border-border-dark rounded-xl p-6 transition-all hover:shadow-lg hover:shadow-primary/5">
<div class="flex items-start justify-between mb-6">
<div class="flex items-center gap-4">
<div class="w-12 h-12 flex items-center justify-center bg-primary/10 rounded-lg">
<span class="material-icons-outlined text-primary text-3xl">settings_remote</span>
</div>
<div>
<h3 class="font-bold text-lg dark:text-white">EDC Terminal</h3>
<p class="text-xs text-slate-500">External hardware integration</p>
</div>
</div>
<label class="relative inline-flex items-center cursor-pointer">
<input checked="" class="sr-only peer" type="checkbox"/>
<div class="w-11 h-6 bg-slate-200 peer-focus:outline-none dark:bg-slate-700 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary"></div>
</label>
</div>
<div class="space-y-4">
<div class="grid grid-cols-2 gap-4">
<div>
<label class="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">Terminal ID</label>
<input class="w-full bg-slate-50 dark:bg-background-dark/50 border border-slate-200 dark:border-border-dark rounded-lg px-4 py-2.5 text-sm focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all" type="text" value="BRK-0092-A"/>
</div>
<div>
<label class="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">Baud Rate</label>
<select class="w-full bg-slate-50 dark:bg-background-dark/50 border border-slate-200 dark:border-border-dark rounded-lg px-4 py-2.5 text-sm focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all">
<option>9600</option>
<option selected="">115200</option>
</select>
</div>
</div>
</div>
</div>
<!-- QRIS Payment -->
<div class="bg-white dark:bg-card-dark border border-slate-200 dark:border-border-dark rounded-xl p-6 transition-all hover:shadow-lg hover:shadow-primary/5">
<div class="flex items-start justify-between mb-6">
<div class="flex items-center gap-4">
<div class="w-12 h-12 flex items-center justify-center bg-primary/10 rounded-lg">
<span class="material-icons-outlined text-primary text-3xl">qr_code_2</span>
</div>
<div>
<h3 class="font-bold text-lg dark:text-white">QRIS</h3>
<p class="text-xs text-slate-500">Quick Response Code Indonesia Standard</p>
</div>
</div>
<label class="relative inline-flex items-center cursor-pointer">
<input checked="" class="sr-only peer" type="checkbox"/>
<div class="w-11 h-6 bg-slate-200 peer-focus:outline-none dark:bg-slate-700 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary"></div>
</label>
</div>
<div class="space-y-4">
<div class="flex gap-4">
<div class="flex-1">
<label class="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">Merchant ID</label>
<input class="w-full bg-slate-50 dark:bg-background-dark/50 border border-slate-200 dark:border-border-dark rounded-lg px-4 py-2.5 text-sm focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all" placeholder="ID1020210..." type="text"/>
</div>
<div class="w-20 h-20 bg-white p-1 rounded-lg border border-slate-200 flex items-center justify-center overflow-hidden">
<img alt="QR Code" class="w-full h-full object-contain" data-alt="A static QR code for merchant payment" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAergvixEY3UJoqxiEEWVfCpu9Shpo6aoXBBkLZ0qE2dno0BqiZi7UvJfgCyMN3DS3vBFKxN7yqeKMCqsZ8amQPRyKLsDBJ_v0TEu3S_P3bBFzxzKpstG3QfInOraByLRh9cCZiusqpbvpyThELbA36RaSjek-PFJrDhZVZEpo8OBOv6PIC7KNKiwg2S97tBM0VXm2Rnxji78nr64GK36WwC8O3vZwGth7dLZ_XaWmxGLruRhRWsKAprSxifc7ggDe1KYb00GwXftAm"/>
</div>
</div>
</div>
</div>
<!-- Add New Method (Dashed Card) -->
<button class="border-2 border-dashed border-slate-300 dark:border-border-dark rounded-xl p-8 flex flex-col items-center justify-center gap-3 transition-all hover:bg-slate-100 dark:hover:bg-primary/5 hover:border-primary group">
<div class="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
<span class="material-icons-outlined text-slate-400 dark:text-slate-500 group-hover:text-primary">add</span>
</div>
<span class="font-medium text-slate-500 dark:text-slate-400 group-hover:text-primary">Add Payment Method</span>
</button>
</div>
<!-- Global Settings / Split Payment Section -->
<div class="bg-white dark:bg-card-dark border border-slate-200 dark:border-border-dark rounded-xl overflow-hidden">
<div class="px-6 py-4 border-b border-slate-200 dark:border-border-dark flex items-center justify-between">
<div class="flex items-center gap-2">
<span class="material-icons-outlined text-primary">call_split</span>
<h2 class="font-bold text-lg dark:text-white">Split Payment Configuration</h2>
</div>
<span class="text-xs font-medium px-2 py-0.5 rounded bg-primary/10 text-primary">Global Setting</span>
</div>
<div class="p-8">
<div class="flex flex-col md:flex-row md:items-center justify-between gap-12">
<div class="flex-1">
<div class="flex items-center justify-between mb-2">
<h4 class="font-semibold dark:text-white">Allow split payments</h4>
<label class="relative inline-flex items-center cursor-pointer">
<input checked="" class="sr-only peer" type="checkbox"/>
<div class="w-11 h-6 bg-slate-200 peer-focus:outline-none dark:bg-slate-700 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary"></div>
</label>
</div>
<p class="text-sm text-slate-500 max-w-md">Enable customers to combine multiple payment methods (e.g., partial cash and partial card) for a single order.</p>
</div>
<div class="w-full md:w-64">
<label class="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">Maximum Splits Allowed</label>
<div class="flex items-center">
<button class="w-10 h-10 flex items-center justify-center bg-slate-100 dark:bg-background-dark border border-slate-200 dark:border-border-dark rounded-l-lg hover:bg-slate-200 dark:hover:bg-border-dark transition-colors">
<span class="material-icons-outlined text-sm">remove</span>
</button>
<input class="w-full h-10 text-center bg-transparent border-y border-x-0 border-slate-200 dark:border-border-dark focus:ring-0 outline-none font-bold text-primary" type="number" value="3"/>
<button class="w-10 h-10 flex items-center justify-center bg-slate-100 dark:bg-background-dark border border-slate-200 dark:border-border-dark rounded-r-lg hover:bg-slate-200 dark:hover:bg-border-dark transition-colors">
<span class="material-icons-outlined text-sm">add</span>
</button>
</div>
</div>
</div>
</div>
</div>
<!-- Footer Actions -->
<div class="mt-10 flex items-center justify-end gap-4">
<button class="px-6 py-2.5 rounded-lg border border-slate-300 dark:border-border-dark text-slate-600 dark:text-slate-400 font-medium hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                Discard Changes
            </button>
<button class="px-8 py-2.5 rounded-lg bg-primary text-background-dark font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] transition-transform active:scale-[0.98]">
                Save Configuration
            </button>
</div>
</div>
</body></html>
      <!-- STITCH_HTML_END -->
    \ }} />
  );
};

export default Payment_Methods_Config;
