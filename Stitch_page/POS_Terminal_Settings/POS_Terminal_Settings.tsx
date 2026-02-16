import React from 'react';

const POS_Terminal_Settings: React.FC = () => {
  return (
    <div dangerouslySetInnerHTML={{ __html: `
      <!-- STITCH_HTML_START -->
      <!DOCTYPE html>

<html class="dark" lang="en"><head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
<title>The Breakery POS Terminal Settings</title>
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
                        "background-dark": "#0D0D0F",
                        "surface": "#1A1A1D",
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
            -webkit-font-smoothing: antialiased;
        }
        .playfair {
            font-family: 'Playfair Display', serif;
        }
        input:focus, select:focus, textarea:focus {
            outline: none;
            box-shadow: 0 0 0 2px rgba(200, 164, 91, 0.3);
            border-color: #c8a45b !important;
        }
        .toggle-checkbox:checked {
            right: 0;
            border-color: #c8a45b;
            background-color: #c8a45b;
        }
        .toggle-checkbox:checked + .toggle-label {
            background-color: #c8a45b;
        }
    </style>
</head>
<body class="bg-background-dark text-gray-200 min-h-screen flex">
<!-- Sidebar -->
<aside class="w-64 border-r border-primary/10 bg-background-dark hidden lg:flex flex-col">
<div class="p-8">
<h1 class="playfair text-2xl font-bold text-primary tracking-tight italic">The Breakery</h1>
</div>
<nav class="flex-1 px-4 space-y-2">
<a class="flex items-center px-4 py-3 rounded-lg text-gray-400 hover:bg-surface hover:text-primary transition-all duration-200" href="#">
<span class="material-icons mr-3">dashboard</span>
<span class="font-display font-medium">Dashboard</span>
</a>
<a class="flex items-center px-4 py-3 rounded-lg text-gray-400 hover:bg-surface hover:text-primary transition-all duration-200" href="#">
<span class="material-icons mr-3">point_of_sale</span>
<span class="font-display font-medium">Register</span>
</a>
<a class="flex items-center px-4 py-3 rounded-lg bg-surface text-primary transition-all duration-200" href="#">
<span class="material-icons mr-3">settings</span>
<span class="font-display font-medium">Terminal Settings</span>
</a>
<a class="flex items-center px-4 py-3 rounded-lg text-gray-400 hover:bg-surface hover:text-primary transition-all duration-200" href="#">
<span class="material-icons mr-3">inventory_2</span>
<span class="font-display font-medium">Inventory</span>
</a>
<a class="flex items-center px-4 py-3 rounded-lg text-gray-400 hover:bg-surface hover:text-primary transition-all duration-200" href="#">
<span class="material-icons mr-3">receipt_long</span>
<span class="font-display font-medium">Reports</span>
</a>
</nav>
<div class="p-8 border-t border-primary/10">
<div class="flex items-center">
<img class="w-10 h-10 rounded-full object-cover mr-3 border-2 border-primary/30" data-alt="Portrait of a bakery manager" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCAyuCxfg81Oa0daK6NrYFriG8tmwANUyR77M2l8SfQRckyp3vWzw0T7JBrCZwLVtNjhk0B-mc_Skr3tvnJkMNWrt4HOwlCsTinG61V18oeyOJZ3qCBnKamMJKwVQEjEjDvS20Fh9TrFm0h-RWBTwn_A2oGSpZ0URpHJUnMJEy2buxmrKiCfiXa5uAPF1xeOw4IV2N41LCLllB3VIRlnJC5sQ1hlkjfWyT74c8vBDVwm9de5kl441Lv-UG6Q-VL4MiQYvaNBmUu3qvP"/>
<div>
<p class="text-sm font-semibold text-white">Julien V.</p>
<p class="text-xs text-gray-500">Store Manager</p>
</div>
</div>
</div>
</aside>
<!-- Main Content -->
<main class="flex-1 overflow-y-auto pb-24 relative">
<header class="p-8 pb-0">
<h2 class="playfair text-4xl text-white font-bold mb-2">POS Configuration</h2>
<p class="text-gray-500 font-display">Manage terminal behavior and operational parameters for your bakery outlets.</p>
</header>
<div class="p-8 grid grid-cols-1 xl:grid-cols-2 gap-8">
<!-- SECTION 1: General -->
<div class="bg-surface p-8 rounded-xl border border-primary/5 shadow-2xl">
<div class="flex items-center mb-6">
<span class="material-icons text-primary mr-3">settings_input_component</span>
<h3 class="playfair text-2xl text-white font-bold">General</h3>
</div>
<div class="space-y-8">
<div>
<label class="block text-sm font-display text-gray-400 mb-4 uppercase tracking-wider">Default Order Type</label>
<div class="flex gap-4">
<label class="relative flex-1 cursor-pointer">
<input checked="" class="peer sr-only" name="orderType" type="radio"/>
<div class="p-4 rounded-lg border border-primary/20 bg-background-dark/50 text-center peer-checked:border-primary peer-checked:bg-primary/10 transition-all duration-200">
<span class="material-icons block text-gray-500 peer-checked:text-primary mb-1">restaurant</span>
<span class="text-sm font-medium">Dine-in</span>
</div>
</label>
<label class="relative flex-1 cursor-pointer">
<input class="peer sr-only" name="orderType" type="radio"/>
<div class="p-4 rounded-lg border border-primary/20 bg-background-dark/50 text-center peer-checked:border-primary peer-checked:bg-primary/10 transition-all duration-200">
<span class="material-icons block text-gray-500 peer-checked:text-primary mb-1">shopping_bag</span>
<span class="text-sm font-medium">Takeaway</span>
</div>
</label>
<label class="relative flex-1 cursor-pointer">
<input class="peer sr-only" name="orderType" type="radio"/>
<div class="p-4 rounded-lg border border-primary/20 bg-background-dark/50 text-center peer-checked:border-primary peer-checked:bg-primary/10 transition-all duration-200">
<span class="material-icons block text-gray-500 peer-checked:text-primary mb-1">local_shipping</span>
<span class="text-sm font-medium">Delivery</span>
</div>
</label>
</div>
</div>
<div class="space-y-4">
<div class="flex items-center justify-between">
<span class="text-sm font-display text-gray-300">Auto-print receipt</span>
<label class="relative inline-flex items-center cursor-pointer">
<input checked="" class="sr-only peer" type="checkbox"/>
<div class="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
</label>
</div>
<div class="flex items-center justify-between">
<span class="text-sm font-display text-gray-300">Send to KDS (Kitchen Display System)</span>
<label class="relative inline-flex items-center cursor-pointer">
<input checked="" class="sr-only peer" type="checkbox"/>
<div class="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
</label>
</div>
</div>
</div>
</div>
<!-- SECTION 2: Shift & Register -->
<div class="bg-surface p-8 rounded-xl border border-primary/5 shadow-2xl">
<div class="flex items-center mb-6">
<span class="material-icons text-primary mr-3">point_of_sale</span>
<h3 class="playfair text-2xl text-white font-bold">Shift &amp; Register</h3>
</div>
<div class="space-y-6">
<div class="flex items-center justify-between">
<div>
<span class="text-sm font-display text-gray-300 block font-medium">Require shift opening</span>
<span class="text-xs text-gray-500">Force staff to open shift before first transaction</span>
</div>
<label class="relative inline-flex items-center cursor-pointer">
<input checked="" class="sr-only peer" type="checkbox"/>
<div class="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
</label>
</div>
<div>
<label class="block text-xs font-display text-gray-500 mb-2 uppercase tracking-wider">Opening Balance</label>
<div class="relative">
<span class="absolute left-4 top-1/2 -translate-y-1/2 text-primary font-medium">Rp</span>
<input class="w-full bg-background-dark border border-primary/20 rounded-lg py-3 pl-12 pr-4 text-white font-medium focus:ring-primary focus:border-primary" type="text" value="500.000"/>
</div>
</div>
<div class="flex items-center justify-between p-4 bg-background-dark/30 rounded-lg border border-primary/10">
<div>
<span class="text-sm font-display text-gray-300 block font-medium">No-reconciliation mode</span>
<span class="text-xs text-gray-500 italic">Disables manual cash verification at shift end</span>
</div>
<label class="relative inline-flex items-center cursor-pointer">
<input class="sr-only peer" type="checkbox"/>
<div class="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
</label>
</div>
</div>
</div>
<!-- SECTION 3: Discounts -->
<div class="bg-surface p-8 rounded-xl border border-primary/5 shadow-2xl xl:col-span-2">
<div class="flex items-center mb-6">
<span class="material-icons text-primary mr-3">sell</span>
<h3 class="playfair text-2xl text-white font-bold">Discounts</h3>
</div>
<div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
<div class="space-y-6">
<div class="flex items-center justify-between">
<span class="text-sm font-display text-gray-300">Allow Manual Discounts</span>
<label class="relative inline-flex items-center cursor-pointer">
<input checked="" class="sr-only peer" type="checkbox"/>
<div class="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
</label>
</div>
<div>
<label class="block text-xs font-display text-gray-500 mb-2 uppercase tracking-wider">Max Discount (%)</label>
<input class="w-full bg-background-dark border border-primary/20 rounded-lg py-3 px-4 text-white font-medium" type="number" value="50"/>
</div>
<div>
<label class="block text-xs font-display text-gray-500 mb-2 uppercase tracking-wider">Manager PIN Threshold (%)</label>
<input class="w-full bg-background-dark border border-primary/20 rounded-lg py-3 px-4 text-white font-medium" type="number" value="20"/>
<span class="text-[10px] text-gray-600 mt-1 block italic">Require PIN for discounts above this value</span>
</div>
</div>
<div class="lg:col-span-2">
<label class="block text-xs font-display text-gray-500 mb-4 uppercase tracking-wider">Predefined Discounts</label>
<div class="bg-background-dark/50 rounded-lg overflow-hidden border border-primary/10">
<table class="w-full text-left text-sm">
<thead class="bg-primary/5 text-gray-400 font-medium">
<tr>
<th class="px-6 py-3">Label</th>
<th class="px-6 py-3">Value</th>
<th class="px-6 py-3 text-right">Actions</th>
</tr>
</thead>
<tbody class="divide-y divide-primary/10">
<tr>
<td class="px-6 py-4 font-medium text-white">Early Bird</td>
<td class="px-6 py-4 text-primary">15%</td>
<td class="px-6 py-4 text-right">
<button class="text-gray-500 hover:text-primary mr-3"><span class="material-icons text-lg">edit</span></button>
<button class="text-gray-500 hover:text-red-500"><span class="material-icons text-lg">delete</span></button>
</td>
</tr>
<tr>
<td class="px-6 py-4 font-medium text-white">Staff Meal</td>
<td class="px-6 py-4 text-primary">50%</td>
<td class="px-6 py-4 text-right">
<button class="text-gray-500 hover:text-primary mr-3"><span class="material-icons text-lg">edit</span></button>
<button class="text-gray-500 hover:text-red-500"><span class="material-icons text-lg">delete</span></button>
</td>
</tr>
<tr>
<td class="px-6 py-4 font-medium text-white">End of Day Clearance</td>
<td class="px-6 py-4 text-primary">30%</td>
<td class="px-6 py-4 text-right">
<button class="text-gray-500 hover:text-primary mr-3"><span class="material-icons text-lg">edit</span></button>
<button class="text-gray-500 hover:text-red-500"><span class="material-icons text-lg">delete</span></button>
</td>
</tr>
</tbody>
</table>
<button class="w-full py-3 text-sm font-medium text-primary hover:bg-primary/5 transition-colors border-t border-primary/10">
                                + Add New Preset
                            </button>
</div>
</div>
</div>
</div>
<!-- SECTION 4: Cart & Inventory -->
<div class="bg-surface p-8 rounded-xl border border-primary/5 shadow-2xl xl:col-span-2">
<div class="flex items-center mb-6">
<span class="material-icons text-primary mr-3">shopping_cart</span>
<h3 class="playfair text-2xl text-white font-bold">Cart &amp; Inventory</h3>
</div>
<div class="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
<div>
<label class="block text-xs font-display text-gray-500 mb-2 uppercase tracking-wider">Cart Timeout (Minutes)</label>
<div class="flex items-center gap-4">
<input class="flex-1 bg-background-dark border border-primary/20 rounded-lg py-3 px-4 text-white font-medium" type="number" value="10"/>
<span class="text-sm text-gray-400">Clears cart automatically after inactivity</span>
</div>
</div>
<div class="bg-orange-900/10 border border-orange-500/30 p-6 rounded-lg">
<div class="flex items-start gap-4">
<div class="p-2 bg-orange-500/20 rounded-lg">
<span class="material-icons text-orange-500">warning</span>
</div>
<div class="flex-1">
<div class="flex items-center justify-between mb-2">
<h4 class="font-bold text-orange-200">Critical Control</h4>
<label class="relative inline-flex items-center cursor-pointer">
<input class="sr-only peer" type="checkbox"/>
<div class="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500"></div>
</label>
</div>
<p class="text-sm text-orange-200/70">Allow negative stock sales. Enabling this will bypass inventory checks during the checkout process.</p>
</div>
</div>
</div>
</div>
</div>
</div>
</main>
<!-- Fixed Footer Actions -->
<div class="fixed bottom-0 right-0 left-64 bg-background-dark/95 backdrop-blur-md border-t border-primary/10 p-4 px-8 flex justify-end items-center gap-4 shadow-[0_-10px_30px_rgba(0,0,0,0.5)] z-50">
<span class="text-xs text-gray-500 mr-auto font-display">Last saved: Oct 24, 2023 - 14:45 PM</span>
<button class="px-6 py-3 text-sm font-display font-semibold text-gray-400 hover:text-white transition-colors">Discard Changes</button>
<button class="bg-primary hover:bg-primary/90 text-background-dark font-display font-bold py-3 px-10 rounded-lg shadow-xl shadow-primary/10 flex items-center gap-2 transition-all transform hover:scale-[1.02] active:scale-[0.98]">
<span class="material-icons text-xl">save</span>
            SAVE CONFIGURATION
        </button>
</div>
</body></html>
      <!-- STITCH_HTML_END -->
    ` }} />
  );
};

export default POS_Terminal_Settings;
