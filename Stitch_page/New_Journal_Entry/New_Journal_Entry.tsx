import React from 'react';

const New_Journal_Entry: React.FC = () => {
  return (
    <div dangerouslySetInnerHTML={{ __html: \
      <!-- STITCH_HTML_START -->
      <!DOCTYPE html>

<html class="dark" lang="en"><head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
<title>New Journal Entry - The Breakery</title>
<script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&amp;family=Playfair+Display:wght@600&amp;family=JetBrains+Mono:wght@500&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<script id="tailwind-config">
        tailwind.config = {
            darkMode: "class",
            theme: {
                extend: {
                    colors: {
                        "primary": "#f2cc0d",
                        "background-light": "#f8f8f5",
                        "background-dark": "#0D0D0F",
                        "card-dark": "#1A1A1D",
                        "border-dark": "#2A2A30",
                    },
                    fontFamily: {
                        "display": ["Inter", "sans-serif"],
                        "serif": ["Playfair Display", "serif"],
                        "mono": ["JetBrains Mono", "monospace"],
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
            background-color: #0D0D0F;
        }
        .serif-font { font-family: 'Playfair Display', serif; }
        .mono-font { font-family: 'JetBrains Mono', monospace; }
        input:focus, select:focus, textarea:focus {
            outline: none;
            border-color: #f2cc0d !important;
            ring: 1px;
            ring-color: #f2cc0d;
        }
    </style>
</head>
<body class="bg-background-light dark:bg-background-dark text-slate-200 min-h-screen flex flex-col font-display">
<!-- Header Navigation -->
<header class="border-b border-border-dark bg-card-dark/50 backdrop-blur-md sticky top-0 z-50">
<div class="max-w-[1400px] mx-auto px-6 h-20 flex items-center justify-between">
<div class="flex items-center gap-8">
<h1 class="serif-font text-2xl text-white">The Breakery</h1>
<nav class="hidden md:flex items-center gap-6 text-sm font-medium text-slate-400">
<a class="hover:text-primary transition-colors" href="#">Dashboard</a>
<a class="text-primary border-b-2 border-primary pt-1 pb-1" href="#">Accounting</a>
<a class="hover:text-primary transition-colors" href="#">Reports</a>
<a class="hover:text-primary transition-colors" href="#">Settings</a>
</nav>
</div>
<div class="flex items-center gap-4">
<button class="p-2 hover:bg-white/5 rounded-full transition-colors">
<span class="material-icons text-slate-400">notifications</span>
</button>
<div class="h-8 w-8 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center">
<span class="text-primary text-xs font-bold">JD</span>
</div>
</div>
</div>
</header>
<main class="flex-grow max-w-[1400px] mx-auto w-full px-6 py-8">
<!-- Page Title & ID -->
<div class="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
<div>
<nav class="flex items-center gap-2 text-xs text-slate-500 mb-2 uppercase tracking-widest font-semibold">
<span>Accounting</span>
<span class="material-icons text-[10px]">chevron_right</span>
<span>Journal Entries</span>
</nav>
<div class="flex items-center gap-4">
<h2 class="serif-font text-3xl text-white">New Journal Entry</h2>
<span class="px-3 py-1 bg-primary/10 text-primary border border-primary/20 rounded-full text-xs font-semibold tracking-wide uppercase">Manual</span>
</div>
</div>
<div class="flex flex-col items-end">
<span class="text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-1">Reference ID</span>
<span class="mono-font text-xl text-primary">JE-2026-0234</span>
</div>
</div>
<!-- Form Top Section -->
<div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
<div class="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-card-dark border border-border-dark rounded-xl">
<div class="space-y-2">
<label class="block text-xs font-medium text-slate-400 uppercase tracking-wider">Entry Date</label>
<div class="relative">
<input class="w-full bg-background-dark border border-border-dark rounded-lg px-4 py-2.5 text-sm text-slate-200 focus:ring-1 focus:ring-primary" type="text" value="2026-02-14"/>
<span class="material-icons absolute right-3 top-2.5 text-slate-500 text-sm">calendar_today</span>
</div>
</div>
<div class="space-y-2">
<label class="block text-xs font-medium text-slate-400 uppercase tracking-wider">Reference (Optional)</label>
<input class="w-full bg-background-dark border border-border-dark rounded-lg px-4 py-2.5 text-sm text-slate-200 focus:ring-1 focus:ring-primary" placeholder="e.g. INV-9920" type="text"/>
</div>
<div class="md:col-span-2 space-y-2">
<label class="block text-xs font-medium text-slate-400 uppercase tracking-wider">Description</label>
<textarea class="w-full bg-background-dark border border-border-dark rounded-lg px-4 py-2.5 text-sm text-slate-200 focus:ring-1 focus:ring-primary resize-none" rows="1">Monthly rent payment</textarea>
</div>
</div>
<!-- Quick Summary / Attachment Box -->
<div class="bg-card-dark border border-border-dark rounded-xl p-6 flex flex-col justify-center items-center border-dashed border-2 hover:border-primary/50 transition-colors cursor-pointer group">
<span class="material-icons text-slate-600 mb-2 text-3xl group-hover:text-primary transition-colors">cloud_upload</span>
<p class="text-sm font-medium text-slate-400">Drop attachments here</p>
<p class="text-[10px] text-slate-500 mt-1 uppercase tracking-tighter">PDF, JPG up to 10MB</p>
</div>
</div>
<!-- Lines Table -->
<div class="bg-card-dark border border-border-dark rounded-xl overflow-hidden mb-8">
<table class="w-full text-left border-collapse">
<thead>
<tr class="bg-background-dark/50 border-b border-border-dark">
<th class="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest w-1/3">Account</th>
<th class="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Line Description</th>
<th class="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-right w-40">Debit</th>
<th class="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-right w-40">Credit</th>
<th class="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest w-12 text-center"></th>
</tr>
</thead>
<tbody class="divide-y divide-border-dark">
<!-- Row 1 -->
<tr class="group hover:bg-white/[0.02] transition-colors">
<td class="px-6 py-4">
<div class="relative">
<select class="w-full bg-transparent border-none text-sm text-slate-200 focus:ring-0 p-0 cursor-pointer">
<option selected="">6110 — Rent Expense</option>
<option>1120 — Bank Account</option>
<option>2100 — Accounts Payable</option>
</select>
<div class="h-[1px] w-full bg-border-dark group-hover:bg-slate-700 mt-1"></div>
</div>
</td>
<td class="px-6 py-4">
<input class="w-full bg-transparent border-none text-sm text-slate-400 focus:ring-0 p-0 italic" type="text" value="Office Rent - February"/>
<div class="h-[1px] w-full bg-border-dark group-hover:bg-slate-700 mt-1"></div>
</td>
<td class="px-6 py-4 text-right">
<div class="flex items-center justify-end gap-1">
<span class="text-xs text-slate-500 mono-font">Rp</span>
<input class="bg-transparent border-none text-sm text-white focus:ring-0 p-0 text-right mono-font w-24" type="text" value="15.000.000"/>
</div>
<div class="h-[1px] w-full bg-border-dark group-hover:bg-slate-700 mt-1"></div>
</td>
<td class="px-6 py-4 text-right text-slate-600">
<div class="flex items-center justify-end gap-1">
<span class="text-xs text-slate-600 mono-font">Rp</span>
<input class="bg-transparent border-none text-sm text-slate-600 focus:ring-0 p-0 text-right mono-font w-24" type="text" value="0"/>
</div>
<div class="h-[1px] w-full bg-border-dark group-hover:bg-slate-700 mt-1"></div>
</td>
<td class="px-6 py-4 text-center">
<button class="text-slate-600 hover:text-red-400 transition-colors">
<span class="material-icons text-lg">delete_outline</span>
</button>
</td>
</tr>
<!-- Row 2 -->
<tr class="group hover:bg-white/[0.02] transition-colors">
<td class="px-6 py-4">
<div class="relative">
<select class="w-full bg-transparent border-none text-sm text-slate-200 focus:ring-0 p-0 cursor-pointer">
<option>6110 — Rent Expense</option>
<option selected="">1120 — Bank Account</option>
<option>2100 — Accounts Payable</option>
</select>
<div class="h-[1px] w-full bg-border-dark group-hover:bg-slate-700 mt-1"></div>
</div>
</td>
<td class="px-6 py-4">
<input class="w-full bg-transparent border-none text-sm text-slate-400 focus:ring-0 p-0 italic" type="text" value="Monthly rent payment"/>
<div class="h-[1px] w-full bg-border-dark group-hover:bg-slate-700 mt-1"></div>
</td>
<td class="px-6 py-4 text-right">
<div class="flex items-center justify-end gap-1">
<span class="text-xs text-slate-600 mono-font">Rp</span>
<input class="bg-transparent border-none text-sm text-slate-600 focus:ring-0 p-0 text-right mono-font w-24" type="text" value="0"/>
</div>
<div class="h-[1px] w-full bg-border-dark group-hover:bg-slate-700 mt-1"></div>
</td>
<td class="px-6 py-4 text-right">
<div class="flex items-center justify-end gap-1">
<span class="text-xs text-slate-500 mono-font">Rp</span>
<input class="bg-transparent border-none text-sm text-white focus:ring-0 p-0 text-right mono-font w-24" type="text" value="15.000.000"/>
</div>
<div class="h-[1px] w-full bg-border-dark group-hover:bg-slate-700 mt-1"></div>
</td>
<td class="px-6 py-4 text-center">
<button class="text-slate-600 hover:text-red-400 transition-colors">
<span class="material-icons text-lg">delete_outline</span>
</button>
</td>
</tr>
</tbody>
</table>
<!-- Add Row Button -->
<div class="p-4 bg-background-dark/30">
<button class="flex items-center gap-2 text-xs font-semibold text-primary/70 hover:text-primary transition-colors">
<span class="material-icons text-sm">add_circle_outline</span>
                    ADD NEW LINE
                </button>
</div>
</div>
<!-- Balance Check Section -->
<div class="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
<div class="p-6 bg-card-dark border border-border-dark rounded-xl">
<h3 class="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Internal Memo</h3>
<textarea class="w-full bg-background-dark/50 border border-border-dark rounded-lg px-4 py-3 text-sm text-slate-400 focus:ring-1 focus:ring-primary resize-none" placeholder="Add internal notes for auditing..." rows="3"></textarea>
</div>
<div class="space-y-4">
<div class="bg-card-dark border border-border-dark rounded-xl p-6 shadow-xl">
<div class="space-y-4 mb-6">
<div class="flex justify-between items-center">
<span class="text-sm text-slate-400">Total Debits</span>
<span class="mono-font text-white">Rp 15.000.000</span>
</div>
<div class="flex justify-between items-center">
<span class="text-sm text-slate-400">Total Credits</span>
<span class="mono-font text-white">Rp 15.000.000</span>
</div>
<div class="h-[1px] bg-border-dark"></div>
<div class="flex justify-between items-center pt-2">
<div class="flex items-center gap-2">
<span class="material-icons text-green-500 text-xl">check_circle</span>
<span class="text-sm font-semibold text-green-500">Balanced</span>
</div>
<div class="flex flex-col items-end">
<span class="text-[10px] text-slate-500 uppercase tracking-widest">Difference</span>
<span class="mono-font text-slate-500 text-xs">Rp 0</span>
</div>
</div>
</div>
</div>
</div>
</div>
</main>
<!-- Footer Action Bar -->
<footer class="border-t border-border-dark bg-card-dark/80 backdrop-blur-xl sticky bottom-0 z-50 py-4 mt-auto">
<div class="max-w-[1400px] mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
<div class="flex items-center gap-4">
<a class="text-sm text-slate-500 hover:text-white transition-colors" href="#">Cancel and discard</a>
<div class="h-4 w-[1px] bg-border-dark"></div>
<div class="flex items-center gap-2">
<span class="w-2 h-2 rounded-full bg-yellow-500 animate-pulse"></span>
<span class="text-xs text-slate-400 italic">Unsaved changes...</span>
</div>
</div>
<div class="flex items-center gap-3 w-full md:w-auto">
<button class="flex-1 md:flex-none px-6 py-2.5 rounded-lg border border-border-dark text-slate-300 font-medium hover:bg-white/5 transition-all text-sm">
                    Save as Draft
                </button>
<button class="flex-1 md:flex-none px-8 py-2.5 rounded-lg bg-primary text-black font-bold hover:shadow-[0_0_20px_rgba(242,204,13,0.3)] transition-all text-sm">
                    Post Entry
                </button>
</div>
</div>
</footer>
</body></html>
      <!-- STITCH_HTML_END -->
    \ }} />
  );
};

export default New_Journal_Entry;
