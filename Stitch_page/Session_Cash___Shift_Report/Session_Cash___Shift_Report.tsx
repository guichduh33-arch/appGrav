import React from 'react';

const Session_Cash___Shift_Report: React.FC = () => {
  return (
    <div dangerouslySetInnerHTML={{ __html: \
      <!-- STITCH_HTML_START -->
      <!DOCTYPE html>

<html class="dark" lang="en"><head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
<title>The Breakery - Session Cash &amp; Shift Report</title>
<script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&amp;family=JetBrains+Mono:wght@400;500&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/icon?family=Material+Icons+Round" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<script id="tailwind-config">
        tailwind.config = {
            darkMode: "class",
            theme: {
                extend: {
                    colors: {
                        "primary": "#f9d406",
                        "background-light": "#f8f8f5",
                        "background-dark": "#0D0D0F",
                        "card-dark": "#1A1A1D",
                        "accent-red": "#EF4444",
                        "accent-green": "#10B981",
                        "neutral-dark": "#2a2a2e",
                    },
                    fontFamily: {
                        "display": ["Inter", "sans-serif"],
                        "mono": ["JetBrains Mono", "monospace"]
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
            background-color: #0D0D0F;
            color: #E5E7EB;
        }
        .custom-scrollbar::-webkit-scrollbar {
            width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
            background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
            background: #2a2a2e;
            border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background: #f9d406;
        }
    </style>
</head>
<body class="font-display bg-background-light dark:bg-background-dark min-h-screen flex flex-col overflow-hidden">
<!-- Header / Navigation -->
<header class="h-16 border-b border-primary/10 flex items-center justify-between px-8 bg-card-dark/50 backdrop-blur-md sticky top-0 z-50">
<div class="flex items-center gap-4">
<div class="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
<span class="material-icons-round text-background-dark font-bold">bakery_dining</span>
</div>
<div>
<h1 class="text-xl font-bold text-primary tracking-tight">The Breakery</h1>
<p class="text-[10px] uppercase tracking-widest text-primary/60 font-semibold">Premium POS System</p>
</div>
</div>
<div class="flex items-center gap-6">
<div class="flex items-center gap-2 bg-neutral-dark/50 px-3 py-1.5 rounded-lg border border-primary/5">
<span class="material-icons-round text-sm text-primary">calendar_today</span>
<span class="text-sm font-medium">Oct 20, 2023</span>
</div>
<div class="flex items-center gap-3 border-l border-primary/10 pl-6">
<div class="text-right">
<p class="text-sm font-bold">Admin Manager</p>
<p class="text-[10px] text-primary/60 uppercase">System Active</p>
</div>
<div class="w-10 h-10 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center overflow-hidden">
<img class="w-full h-full object-cover" data-alt="Portrait of the store manager" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDjgK3ZJ0MBsV5XejylLo4G0xamwYz3O4FsWxLcLLfeaILwQR-eO0oCSuI7jKz2IcJWTEi24u0CUXC5nqnBMzeJ7zbgxM2PxfhkUYAJPGZWuoQ6hKbd-FCItTu4BHmYxOyICiGHtKUxuqKtNiSioVqLXLxc1pBlBNYnqyi13zoXTC0idLV65nn7mfK2jebwSt3xFQGl_pXtInVACvLL39ny49X_Sao1CF79-G0E0fDE49MVlnfotB4sym5YdW56egR8Dj3E42vn-7HR"/>
</div>
</div>
</div>
</header>
<main class="flex-1 flex overflow-hidden">
<!-- Sidebar Navigation (Minimized) -->
<nav class="w-20 border-r border-primary/10 flex flex-col items-center py-8 gap-8 bg-card-dark/30">
<button class="w-12 h-12 rounded-xl flex items-center justify-center text-primary/40 hover:text-primary transition-colors">
<span class="material-icons-round">dashboard</span>
</button>
<button class="w-12 h-12 rounded-xl flex items-center justify-center bg-primary text-background-dark shadow-lg shadow-primary/20">
<span class="material-icons-round">payments</span>
</button>
<button class="w-12 h-12 rounded-xl flex items-center justify-center text-primary/40 hover:text-primary transition-colors">
<span class="material-icons-round">inventory_2</span>
</button>
<button class="w-12 h-12 rounded-xl flex items-center justify-center text-primary/40 hover:text-primary transition-colors">
<span class="material-icons-round">analytics</span>
</button>
<div class="mt-auto">
<button class="w-12 h-12 rounded-xl flex items-center justify-center text-primary/40 hover:text-primary transition-colors">
<span class="material-icons-round">settings</span>
</button>
</div>
</nav>
<!-- Content Area -->
<section class="flex-1 flex flex-col overflow-hidden">
<!-- Top Controls -->
<div class="p-6 flex items-center justify-between">
<div>
<h2 class="text-2xl font-bold text-white">Session Cash &amp; Shift Report</h2>
<p class="text-white/40 text-sm">Monitor register variances and staff accountability</p>
</div>
<div class="flex gap-3">
<button class="flex items-center gap-2 bg-neutral-dark hover:bg-neutral-dark/80 px-4 py-2 rounded-lg border border-primary/10 transition-all text-sm font-medium">
<span class="material-icons-round text-sm">filter_list</span> Filter
                    </button>
<button class="flex items-center gap-2 bg-primary text-background-dark px-4 py-2 rounded-lg font-bold transition-all text-sm shadow-lg shadow-primary/10">
<span class="material-icons-round text-sm">file_download</span> Export PDF
                    </button>
</div>
</div>
<!-- Table and Detail Layout -->
<div class="flex-1 flex px-6 pb-6 overflow-hidden gap-6">
<!-- Main Table Section -->
<div class="flex-1 flex flex-col gap-6 overflow-hidden">
<div class="flex-1 bg-card-dark border border-primary/10 rounded-xl overflow-hidden flex flex-col shadow-2xl">
<div class="overflow-y-auto flex-1 custom-scrollbar">
<table class="w-full text-left border-collapse">
<thead class="sticky top-0 bg-neutral-dark/90 backdrop-blur-sm z-10 border-b border-primary/10">
<tr>
<th class="py-4 px-6 text-[11px] font-bold text-primary/60 uppercase tracking-widest">Shift #</th>
<th class="py-4 px-6 text-[11px] font-bold text-primary/60 uppercase tracking-widest">Date / Time</th>
<th class="py-4 px-6 text-[11px] font-bold text-primary/60 uppercase tracking-widest">Cashier</th>
<th class="py-4 px-6 text-[11px] font-bold text-primary/60 uppercase tracking-widest text-right">Opening Bal.</th>
<th class="py-4 px-6 text-[11px] font-bold text-primary/60 uppercase tracking-widest text-right">Closing Bal.</th>
<th class="py-4 px-6 text-[11px] font-bold text-primary/60 uppercase tracking-widest text-center">Variance Status</th>
</tr>
</thead>
<tbody class="divide-y divide-primary/5">
<tr class="hover:bg-primary/5 transition-colors cursor-pointer bg-primary/10 border-l-4 border-l-primary">
<td class="py-4 px-6 font-mono text-sm">#011</td>
<td class="py-4 px-6">
<div class="text-sm font-medium">20 Oct 2023</div>
<div class="text-[11px] text-white/40">07:00 - 15:00</div>
</td>
<td class="py-4 px-6">
<div class="flex items-center gap-2">
<div class="w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 text-[10px] flex items-center justify-center font-bold">M</div>
<span class="text-sm">Mike Wheeler</span>
</div>
</td>
<td class="py-4 px-6 text-right font-mono text-sm text-white/60">Rp 1.000.000</td>
<td class="py-4 px-6 text-right font-mono text-sm text-white">Rp 5.450.000</td>
<td class="py-4 px-6 text-center">
<span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent-red/10 text-accent-red text-xs font-bold border border-accent-red/20">
<span class="material-icons-round text-xs">arrow_downward</span> -Rp 50.000
                                            </span>
</td>
</tr>
<tr class="hover:bg-primary/5 transition-colors cursor-pointer">
<td class="py-4 px-6 font-mono text-sm">#010</td>
<td class="py-4 px-6">
<div class="text-sm font-medium">19 Oct 2023</div>
<div class="text-[11px] text-white/40">15:00 - 23:00</div>
</td>
<td class="py-4 px-6">
<div class="flex items-center gap-2">
<div class="w-6 h-6 rounded-full bg-purple-500/20 text-purple-400 text-[10px] flex items-center justify-center font-bold">S</div>
<span class="text-sm">Sarah Jenkins</span>
</div>
</td>
<td class="py-4 px-6 text-right font-mono text-sm text-white/60">Rp 1.000.000</td>
<td class="py-4 px-6 text-right font-mono text-sm text-white">Rp 6.120.000</td>
<td class="py-4 px-6 text-center">
<span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent-green/10 text-accent-green text-xs font-bold border border-accent-green/20">
<span class="material-icons-round text-xs">check_circle</span> Balanced
                                            </span>
</td>
</tr>
<tr class="hover:bg-primary/5 transition-colors cursor-pointer">
<td class="py-4 px-6 font-mono text-sm">#009</td>
<td class="py-4 px-6">
<div class="text-sm font-medium">19 Oct 2023</div>
<div class="text-[11px] text-white/40">07:00 - 15:00</div>
</td>
<td class="py-4 px-6">
<div class="flex items-center gap-2">
<div class="w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 text-[10px] flex items-center justify-center font-bold">D</div>
<span class="text-sm">Dustin Henderson</span>
</div>
</td>
<td class="py-4 px-6 text-right font-mono text-sm text-white/60">Rp 1.000.000</td>
<td class="py-4 px-6 text-right font-mono text-sm text-white">Rp 4.200.000</td>
<td class="py-4 px-6 text-center">
<span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold border border-primary/20">
<span class="material-icons-round text-xs">arrow_upward</span> +Rp 15.000
                                            </span>
</td>
</tr>
<!-- Repeat data for visual density -->
<tr class="hover:bg-primary/5 transition-colors cursor-pointer">
<td class="py-4 px-6 font-mono text-sm">#008</td>
<td class="py-4 px-6">
<div class="text-sm font-medium">18 Oct 2023</div>
<div class="text-[11px] text-white/40">15:00 - 23:00</div>
</td>
<td class="py-4 px-6">
<div class="flex items-center gap-2">
<div class="w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 text-[10px] flex items-center justify-center font-bold">M</div>
<span class="text-sm">Mike Wheeler</span>
</div>
</td>
<td class="py-4 px-6 text-right font-mono text-sm text-white/60">Rp 1.000.000</td>
<td class="py-4 px-6 text-right font-mono text-sm text-white">Rp 7.890.000</td>
<td class="py-4 px-6 text-center">
<span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent-green/10 text-accent-green text-xs font-bold border border-accent-green/20">
<span class="material-icons-round text-xs">check_circle</span> Balanced
                                            </span>
</td>
</tr>
</tbody>
</table>
</div>
</div>
<!-- Trend Chart Section -->
<div class="h-48 bg-card-dark border border-primary/10 rounded-xl p-5 flex flex-col shadow-xl">
<div class="flex items-center justify-between mb-4">
<h3 class="text-xs font-bold text-primary/60 uppercase tracking-widest flex items-center gap-2">
<span class="material-icons-round text-sm">show_chart</span> Cash Variance Trend (Last 30 Sessions)
                            </h3>
<div class="flex items-center gap-4">
<div class="flex items-center gap-2 text-[10px] text-white/40">
<div class="w-2 h-2 rounded-full bg-primary"></div> Surplus
                                </div>
<div class="flex items-center gap-2 text-[10px] text-white/40">
<div class="w-2 h-2 rounded-full bg-accent-red"></div> Shortage
                                </div>
</div>
</div>
<div class="flex-1 flex items-center gap-1.5">
<!-- Visualizing bar chart with div elements -->
<div class="flex-1 bg-primary/20 rounded-t h-[40%]"></div>
<div class="flex-1 bg-primary/20 rounded-t h-[60%]"></div>
<div class="flex-1 bg-accent-red/20 rounded-b h-[30%] self-end -mb-[30%]"></div>
<div class="flex-1 bg-primary/20 rounded-t h-[80%]"></div>
<div class="flex-1 bg-primary/20 rounded-t h-[45%]"></div>
<div class="flex-1 bg-accent-red/60 rounded-b h-[50%] self-end -mb-[50%]"></div>
<div class="flex-1 bg-primary/20 rounded-t h-[30%]"></div>
<div class="flex-1 bg-primary/40 rounded-t h-[90%]"></div>
<div class="flex-1 bg-primary/20 rounded-t h-[20%]"></div>
<div class="flex-1 bg-accent-red/20 rounded-b h-[15%] self-end -mb-[15%]"></div>
<div class="flex-1 bg-primary/20 rounded-t h-[60%]"></div>
<div class="flex-1 bg-accent-red/40 rounded-b h-[40%] self-end -mb-[40%]"></div>
<div class="flex-1 bg-primary/80 rounded-t h-[100%] border-t-2 border-primary shadow-[0_0_15px_rgba(249,212,6,0.3)]"></div>
<div class="flex-1 bg-primary/20 rounded-t h-[55%]"></div>
<div class="flex-1 bg-accent-red/20 rounded-b h-[20%] self-end -mb-[20%]"></div>
<div class="flex-1 bg-primary/20 rounded-t h-[70%]"></div>
<div class="flex-1 bg-accent-red/20 rounded-b h-[10%] self-end -mb-[10%]"></div>
<div class="flex-1 bg-primary/20 rounded-t h-[40%]"></div>
<div class="flex-1 bg-primary/20 rounded-t h-[60%]"></div>
<div class="flex-1 bg-accent-red/20 rounded-b h-[30%] self-end -mb-[30%]"></div>
<div class="flex-1 bg-primary/20 rounded-t h-[80%]"></div>
<div class="flex-1 bg-primary/20 rounded-t h-[45%]"></div>
<div class="flex-1 bg-accent-red/20 rounded-b h-[20%] self-end -mb-[20%]"></div>
<div class="flex-1 bg-primary/20 rounded-t h-[30%]"></div>
<div class="flex-1 bg-primary/20 rounded-t h-[90%]"></div>
<div class="flex-1 bg-primary/20 rounded-t h-[20%]"></div>
<div class="flex-1 bg-accent-red/20 rounded-b h-[15%] self-end -mb-[15%]"></div>
<div class="flex-1 bg-primary/20 rounded-t h-[60%]"></div>
<div class="flex-1 bg-accent-red/80 rounded-b h-[70%] self-end -mb-[70%] border-b-2 border-accent-red shadow-[0_0_15px_rgba(239,68,68,0.3)]"></div>
<div class="flex-1 bg-primary/20 rounded-t h-[55%]"></div>
</div>
<div class="mt-4 border-t border-primary/10 pt-2 flex justify-between text-[8px] text-white/30 uppercase font-bold tracking-widest">
<span>Sept 20</span>
<span>Sept 30</span>
<span>Oct 10</span>
<span>Today</span>
</div>
</div>
</div>
<!-- Slide-in Session Detail Panel -->
<aside class="w-[400px] bg-card-dark border border-primary/20 rounded-xl overflow-hidden flex flex-col shadow-2xl relative">
<div class="absolute top-0 left-0 w-full h-1 bg-primary"></div>
<!-- Header -->
<div class="p-6 border-b border-primary/10">
<div class="flex items-center justify-between mb-4">
<span class="text-xs font-bold text-primary px-2 py-0.5 bg-primary/10 rounded">SHIFT #011</span>
<button class="text-white/40 hover:text-white"><span class="material-icons-round">close</span></button>
</div>
<h3 class="text-xl font-bold">Session Details</h3>
<p class="text-white/40 text-sm">Mike Wheeler • Oct 20, 2023</p>
</div>
<div class="flex-1 overflow-y-auto custom-scrollbar p-6 flex flex-col gap-6">
<!-- Denominations Breakdown -->
<div>
<h4 class="text-[11px] font-bold text-primary uppercase tracking-widest mb-4">Denominations Breakdown</h4>
<div class="bg-background-dark/50 rounded-lg overflow-hidden border border-primary/5">
<table class="w-full text-xs font-mono">
<tbody>
<tr class="border-b border-primary/5">
<td class="p-3 text-white/60 italic">100.000 x</td>
<td class="p-3 text-right text-white">45</td>
<td class="p-3 text-right text-primary font-bold">4.500.000</td>
</tr>
<tr class="border-b border-primary/5">
<td class="p-3 text-white/60 italic">50.000 x</td>
<td class="p-3 text-right text-white">14</td>
<td class="p-3 text-right text-primary font-bold">700.000</td>
</tr>
<tr class="border-b border-primary/5">
<td class="p-3 text-white/60 italic">20.000 x</td>
<td class="p-3 text-right text-white">8</td>
<td class="p-3 text-right text-primary font-bold">160.000</td>
</tr>
<tr class="border-b border-primary/5">
<td class="p-3 text-white/60 italic">10.000 x</td>
<td class="p-3 text-right text-white">7</td>
<td class="p-3 text-right text-primary font-bold">70.000</td>
</tr>
<tr class="border-b border-primary/5">
<td class="p-3 text-white/60 italic">5.000 x</td>
<td class="p-3 text-right text-white">4</td>
<td class="p-3 text-right text-primary font-bold">20.000</td>
</tr>
</tbody>
</table>
</div>
</div>
<!-- Summary Card -->
<div class="bg-neutral-dark/40 rounded-xl p-5 border border-primary/10">
<h4 class="text-[11px] font-bold text-primary/60 uppercase tracking-widest mb-4">Cash Reconciliation</h4>
<div class="space-y-3">
<div class="flex justify-between items-center text-sm">
<span class="text-white/60">Expected Cash</span>
<span class="font-mono font-medium">Rp 5.500.000</span>
</div>
<div class="flex justify-between items-center text-sm">
<span class="text-white/60">Actual Cash Counted</span>
<span class="font-mono font-medium">Rp 5.450.000</span>
</div>
<div class="pt-3 border-t border-primary/5 flex justify-between items-center">
<span class="text-sm font-bold">Variance</span>
<span class="font-mono text-lg font-bold text-accent-red">- Rp 50.000</span>
</div>
</div>
</div>
<!-- Cashier Notes -->
<div>
<h4 class="text-[11px] font-bold text-primary uppercase tracking-widest mb-3">Cashier Notes</h4>
<div class="p-4 bg-background-dark/80 rounded-lg text-sm text-white/70 italic border-l-2 border-primary/40">
                                "Register jam during mid-shift around 11:30. Had to reset the drawer manually. Possible miscount during the rush hour."
                            </div>
</div>
</div>
<!-- Footer Action -->
<div class="p-6 border-t border-primary/10 bg-neutral-dark/20 flex gap-3">
<button class="flex-1 py-3 px-4 bg-neutral-dark hover:bg-neutral-dark/80 rounded-lg font-bold text-sm border border-primary/10 transition-colors">
                            RE-COUNT
                        </button>
<button class="flex-1 py-3 px-4 bg-primary text-background-dark rounded-lg font-bold text-sm shadow-lg shadow-primary/20 transition-transform active:scale-95">
                            APPROVE SESSION
                        </button>
</div>
</aside>
</div>
</section>
</main>
<!-- Footer Stats -->
<footer class="h-12 bg-card-dark border-t border-primary/10 flex items-center justify-between px-8 text-[10px] text-white/30 uppercase font-bold tracking-[0.2em]">
<div class="flex gap-8">
<span class="flex items-center gap-2"><span class="w-1.5 h-1.5 rounded-full bg-accent-green"></span> System Status: Operational</span>
<span class="flex items-center gap-2">Total Monthly Variance: <span class="text-accent-red font-mono font-bold">- Rp 1.250.000</span></span>
</div>
<div>
            The Breakery Dashboard v2.4.0
        </div>
</footer>
</body></html>
      <!-- STITCH_HTML_END -->
    \ }} />
  );
};

export default Session_Cash___Shift_Report;
