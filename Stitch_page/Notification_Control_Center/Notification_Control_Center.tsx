import React from 'react';

const Notification_Control_Center: React.FC = () => {
  return (
    <div dangerouslySetInnerHTML={{ __html: `
      <!-- STITCH_HTML_START -->
      <!DOCTYPE html>

<html class="dark" lang="en"><head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
<title>The Breakery | Notification Control Center</title>
<script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
<link href="https://fonts.googleapis.com/css2?family=Newsreader:ital,opsz,wght@0,6..72,200..800;1,6..72,200..800&amp;family=Playfair+Display:wght@400;500;600;700&amp;display=swap" rel="stylesheet"/>
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
                "border-gold": "rgba(200, 164, 91, 0.2)",
              },
              fontFamily: {
                "display": ["Newsreader", "serif"],
                "header": ["Playfair Display", "serif"]
              },
              borderRadius: {"DEFAULT": "0.25rem", "lg": "0.5rem", "xl": "0.75rem", "full": "9999px"},
            },
          },
        }
    </script>
<style>
        body {
            font-family: 'Newsreader', serif;
            -webkit-font-smoothing: antialiased;
        }
        .header-font {
            font-family: 'Playfair Display', serif;
        }
        .custom-toggle:checked + .toggle-dot {
            transform: translateX(100%);
            background-color: #c8a45b;
        }
        .custom-toggle:checked {
            background-color: rgba(200, 164, 91, 0.2);
            border-color: #c8a45b;
        }
        input[type="time"]::-webkit-calendar-picker-indicator {
            filter: invert(72%) sepia(21%) saturate(795%) hue-rotate(1deg) brightness(91%) contrast(89%);
        }
    </style>
</head>
<body class="bg-background-light dark:bg-background-dark text-stone-800 dark:text-stone-200 min-h-screen">
<div class="max-w-6xl mx-auto px-8 py-12">
<!-- Header -->
<header class="mb-10 flex justify-between items-end border-b border-stone-800 pb-8">
<div>
<div class="flex items-center gap-3 mb-2">
<img alt="The Breakery Logo" class="w-10 h-10 rounded-full" data-alt="Minimalist gold bakery logo on black circle" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDRlzkos5sJpgAtOuMz6wJPB0PQWjrG0ne27p4_kM0jYHYIBkL8qEaQvCuj22BdDZjDRXQHAdUOdVJHt7G2tVTPWYJ_TxdorepbhJN7I15HR4Gt2GWP4uY5QRcDxsKkR7eSbjXLBN3P-OrG33qFzKqHrnA-EUhJbTKWMbUG4K0HTsk09y21Isdd8KQ2Ds4b0w-qQ9jyPbEvUMmgzoQS6nqqbKJ58zmuxGA43axUGfvOM1waQOxwlNmc9kGvBWqpYvMBkE5B92ftTLwj"/>
<span class="text-primary tracking-widest uppercase text-xs font-semibold">The Breakery</span>
</div>
<h1 class="header-font text-4xl text-stone-100">System Notifications</h1>
<p class="text-stone-400 mt-2 italic">Configure how your artisanal operation stays synchronized.</p>
</div>
<div class="flex gap-4">
<button class="px-6 py-2 border border-primary/30 text-primary rounded-lg hover:bg-primary/5 transition-colors">
                    View Logs
                </button>
</div>
</header>
<!-- Notification Matrix -->
<div class="bg-card-dark rounded-xl border border-stone-800 overflow-hidden mb-8">
<div class="p-6 border-b border-stone-800 bg-stone-900/50">
<h2 class="header-font text-xl text-stone-100">Event Matrix</h2>
</div>
<div class="overflow-x-auto">
<table class="w-full text-left">
<thead>
<tr class="text-stone-500 uppercase text-xs tracking-widest border-b border-stone-800">
<th class="px-8 py-5 font-medium">System Event</th>
<th class="px-8 py-5 font-medium text-center">In-App</th>
<th class="px-8 py-5 font-medium text-center">Email</th>
<th class="px-8 py-5 font-medium text-center">Push</th>
</tr>
</thead>
<tbody class="divide-y divide-stone-800/50">
<!-- Row: Low Stock -->
<tr class="hover:bg-white/5 transition-colors">
<td class="px-8 py-6">
<div class="flex items-center gap-4">
<span class="material-icons text-primary/60">inventory_2</span>
<div>
<p class="font-medium text-stone-200">Low Stock Alert</p>
<p class="text-xs text-stone-500 italic">Ingredient levels fall below 15% threshold</p>
</div>
</div>
</td>
<td class="px-8 py-6 text-center">
<label class="relative inline-flex items-center cursor-pointer">
<input checked="" class="sr-only peer" type="checkbox"/>
<div class="w-11 h-6 bg-stone-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-stone-400 after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary peer-checked:after:bg-white"></div>
</label>
</td>
<td class="px-8 py-6 text-center">
<label class="relative inline-flex items-center cursor-pointer">
<input checked="" class="sr-only peer" type="checkbox"/>
<div class="w-11 h-6 bg-stone-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-stone-400 after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary peer-checked:after:bg-white"></div>
</label>
</td>
<td class="px-8 py-6 text-center">
<label class="relative inline-flex items-center cursor-pointer">
<input class="sr-only peer" type="checkbox"/>
<div class="w-11 h-6 bg-stone-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-stone-400 after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary peer-checked:after:bg-white"></div>
</label>
</td>
</tr>
<!-- Row: New Order -->
<tr class="hover:bg-white/5 transition-colors">
<td class="px-8 py-6">
<div class="flex items-center gap-4">
<span class="material-icons text-primary/60">shopping_bag</span>
<div>
<p class="font-medium text-stone-200">New Online Order</p>
<p class="text-xs text-stone-500 italic">Confirmed payments from digital storefront</p>
</div>
</div>
</td>
<td class="px-8 py-6 text-center">
<label class="relative inline-flex items-center cursor-pointer">
<input checked="" class="sr-only peer" type="checkbox"/>
<div class="w-11 h-6 bg-stone-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-stone-400 after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary peer-checked:after:bg-white"></div>
</label>
</td>
<td class="px-8 py-6 text-center">
<label class="relative inline-flex items-center cursor-pointer">
<input class="sr-only peer" type="checkbox"/>
<div class="w-11 h-6 bg-stone-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-stone-400 after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary peer-checked:after:bg-white"></div>
</label>
</td>
<td class="px-8 py-6 text-center">
<label class="relative inline-flex items-center cursor-pointer">
<input checked="" class="sr-only peer" type="checkbox"/>
<div class="w-11 h-6 bg-stone-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-stone-400 after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary peer-checked:after:bg-white"></div>
</label>
</td>
</tr>
<!-- Row: Discount Voided -->
<tr class="hover:bg-white/5 transition-colors">
<td class="px-8 py-6">
<div class="flex items-center gap-4">
<span class="material-icons text-primary/60">monetization_on</span>
<div>
<p class="font-medium text-stone-200">Large Discount Voided</p>
<p class="text-xs text-stone-500 italic">Overrides on orders exceeding \\$100.00</p>
</div>
</div>
</td>
<td class="px-8 py-6 text-center">
<label class="relative inline-flex items-center cursor-pointer">
<input checked="" class="sr-only peer" type="checkbox"/>
<div class="w-11 h-6 bg-stone-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-stone-400 after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary peer-checked:after:bg-white"></div>
</label>
</td>
<td class="px-8 py-6 text-center">
<label class="relative inline-flex items-center cursor-pointer">
<input checked="" class="sr-only peer" type="checkbox"/>
<div class="w-11 h-6 bg-stone-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-stone-400 after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary peer-checked:after:bg-white"></div>
</label>
</td>
<td class="px-8 py-6 text-center">
<label class="relative inline-flex items-center cursor-pointer">
<input checked="" class="sr-only peer" type="checkbox"/>
<div class="w-11 h-6 bg-stone-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-stone-400 after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary peer-checked:after:bg-white"></div>
</label>
</td>
</tr>
<!-- Row: Backup Failure -->
<tr class="hover:bg-white/5 transition-colors">
<td class="px-8 py-6">
<div class="flex items-center gap-4">
<span class="material-icons text-red-500/80">report_problem</span>
<div>
<p class="font-medium text-stone-200">System Backup Failure</p>
<p class="text-xs text-red-400/70 italic">Critical: Daily archival of POS data interrupted</p>
</div>
</div>
</td>
<td class="px-8 py-6 text-center">
<label class="relative inline-flex items-center cursor-pointer">
<input checked="" class="sr-only peer" disabled="" type="checkbox"/>
<div class="w-11 h-6 bg-primary/40 rounded-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:translate-x-full opacity-50 cursor-not-allowed"></div>
</label>
</td>
<td class="px-8 py-6 text-center">
<label class="relative inline-flex items-center cursor-pointer">
<input checked="" class="sr-only peer" disabled="" type="checkbox"/>
<div class="w-11 h-6 bg-primary/40 rounded-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:translate-x-full opacity-50 cursor-not-allowed"></div>
</label>
</td>
<td class="px-8 py-6 text-center">
<label class="relative inline-flex items-center cursor-pointer">
<input checked="" class="sr-only peer" disabled="" type="checkbox"/>
<div class="w-11 h-6 bg-primary/40 rounded-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:translate-x-full opacity-50 cursor-not-allowed"></div>
</label>
</td>
</tr>
</tbody>
</table>
</div>
</div>
<!-- Secondary Section: Quiet Hours -->
<div class="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
<div class="md:col-span-2 bg-card-dark rounded-xl border border-stone-800 p-8 flex flex-col justify-between">
<div>
<div class="flex items-center justify-between mb-6">
<div class="flex items-center gap-3">
<span class="material-icons text-primary">nights_stay</span>
<h3 class="header-font text-xl text-stone-100">Quiet Hours Control</h3>
</div>
<label class="relative inline-flex items-center cursor-pointer">
<input checked="" class="sr-only peer" type="checkbox"/>
<div class="w-14 h-7 bg-stone-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-stone-400 after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary peer-checked:after:bg-white"></div>
</label>
</div>
<p class="text-stone-400 text-sm mb-8 italic">Silence non-critical push notifications during rest hours to ensure focus.</p>
<div class="flex items-center gap-6">
<div class="flex-1">
<label class="block text-xs uppercase tracking-widest text-stone-500 mb-2">Silence From</label>
<input class="w-full bg-stone-900 border border-stone-800 rounded-lg py-3 px-4 text-primary focus:ring-primary focus:border-primary" type="time" value="22:00"/>
</div>
<div class="flex items-end pb-3 text-stone-600">
<span class="material-icons">arrow_forward</span>
</div>
<div class="flex-1">
<label class="block text-xs uppercase tracking-widest text-stone-500 mb-2">Resume At</label>
<input class="w-full bg-stone-900 border border-stone-800 rounded-lg py-3 px-4 text-primary focus:ring-primary focus:border-primary" type="time" value="06:00"/>
</div>
</div>
</div>
</div>
<div class="bg-card-dark rounded-xl border border-stone-800 p-8 flex flex-col justify-center items-center text-center">
<div class="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
<span class="material-icons text-primary text-3xl">verified_user</span>
</div>
<h3 class="header-font text-lg text-stone-200 mb-2">Integrity Mode</h3>
<p class="text-xs text-stone-500 italic mb-6 leading-relaxed">System critical alerts bypass all silence rules automatically.</p>
<div class="py-2 px-4 bg-primary/5 border border-primary/20 rounded-full text-xs text-primary font-medium tracking-wide">
                    ACTIVE STATUS
                </div>
</div>
</div>
<!-- Footer Actions -->
<footer class="flex justify-between items-center">
<button class="text-stone-500 hover:text-stone-300 text-sm flex items-center gap-2 transition-colors">
<span class="material-icons text-sm">restart_alt</span>
                Reset to Factory Defaults
            </button>
<div class="flex gap-4">
<button class="px-8 py-3 bg-stone-800 text-stone-300 rounded-lg hover:bg-stone-700 transition-colors font-medium">
                    Cancel Changes
                </button>
<button class="px-10 py-3 bg-primary text-background-dark rounded-lg hover:brightness-110 transition-all font-semibold shadow-lg shadow-primary/10 uppercase tracking-widest text-sm">
                    Apply Preferences
                </button>
</div>
</footer>
</div>
</body></html>
      <!-- STITCH_HTML_END -->
    ` }} />
  );
};

export default Notification_Control_Center;
