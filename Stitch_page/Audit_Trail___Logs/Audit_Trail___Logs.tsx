import React from 'react';

const Audit_Trail___Logs: React.FC = () => {
  return (
    <div dangerouslySetInnerHTML={{ __html: \
      <!-- STITCH_HTML_START -->
      <!DOCTYPE html>

<html class="dark" lang="en"><head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
<script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
<link href="https://fonts.googleapis.com/css2?family=Manrope:wght@300;400;500;600;700;800&amp;family=Playfair+Display:wght@600;700&amp;family=JetBrains+Mono:wght@400;500&amp;display=swap" rel="stylesheet"/>
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
                        "display": ["Manrope", "sans-serif"],
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
            font-family: 'Manrope', sans-serif;
            background-color: #0D0D0F;
            color: #E2E2E2;
        }
        .scrollbar-hide::-webkit-scrollbar {
            display: none;
        }
    </style>
</head>
<body class="bg-background-light dark:bg-background-dark min-h-screen">
<!-- Navigation / Header -->
<header class="sticky top-0 z-50 bg-background-dark/80 backdrop-blur-md border-b border-border-dark px-8 py-6">
<div class="max-w-7xl mx-auto flex items-center justify-between">
<div class="flex items-center gap-4">
<div class="p-2 bg-primary/10 rounded-lg">
<span class="material-icons text-primary text-3xl">scroll</span>
</div>
<div>
<h1 class="font-serif text-3xl text-white tracking-tight">Audit Trail</h1>
<p class="text-white/40 text-sm font-medium">Monitoring activity for 'The Breakery'</p>
</div>
</div>
<button class="bg-primary hover:bg-primary/90 text-background-dark px-6 py-2.5 rounded-lg font-bold flex items-center gap-2 transition-all">
<span class="material-icons text-[20px]">file_download</span>
<span>Export Audit Log</span>
</button>
</div>
</header>
<main class="max-w-7xl mx-auto px-8 py-10">
<!-- Filter Bar -->
<div class="bg-card-dark border border-border-dark rounded-xl p-4 mb-8 flex flex-wrap items-center gap-4">
<!-- Search -->
<div class="relative flex-grow min-w-[300px]">
<span class="material-icons absolute left-3 top-1/2 -translate-y-1/2 text-white/30">search</span>
<input class="w-full bg-background-dark border-border-dark rounded-lg pl-10 pr-4 py-2 text-white focus:ring-primary focus:border-primary" placeholder="Search logs, orders, or users..." type="text"/>
</div>
<!-- Date Range -->
<div class="flex items-center gap-2 bg-background-dark border border-border-dark rounded-lg px-3 py-2 cursor-pointer hover:border-primary/50 transition-colors">
<span class="material-icons text-white/30 text-[20px]">calendar_today</span>
<span class="text-sm font-medium">Oct 20 - Oct 27, 2023</span>
</div>
<!-- User Select -->
<div class="flex items-center gap-2 bg-background-dark border border-border-dark rounded-lg px-3 py-2 cursor-pointer hover:border-primary/50 transition-colors">
<span class="material-icons text-white/30 text-[20px]">person_outline</span>
<span class="text-sm font-medium">All Team Members</span>
<span class="material-icons text-white/30 text-[18px]">expand_more</span>
</div>
<!-- Category Filters -->
<div class="flex items-center gap-1 p-1 bg-background-dark border border-border-dark rounded-lg overflow-x-auto scrollbar-hide">
<button class="px-4 py-1.5 rounded-md text-sm font-bold bg-primary text-background-dark">All</button>
<button class="px-4 py-1.5 rounded-md text-sm font-medium text-white/60 hover:text-white transition-colors">Orders</button>
<button class="px-4 py-1.5 rounded-md text-sm font-medium text-white/60 hover:text-white transition-colors">Products</button>
<button class="px-4 py-1.5 rounded-md text-sm font-medium text-white/60 hover:text-white transition-colors">Inventory</button>
<button class="px-4 py-1.5 rounded-md text-sm font-medium text-white/60 hover:text-white transition-colors">Settings</button>
<button class="px-4 py-1.5 rounded-md text-sm font-medium text-white/60 hover:text-white transition-colors">Auth</button>
</div>
</div>
<!-- Audit Timeline Container -->
<div class="relative">
<!-- Vertical Line -->
<div class="absolute left-[27px] top-0 bottom-0 w-[2px] bg-border-dark"></div>
<div class="space-y-6">
<!-- Audit Entry 1: Critical -->
<div class="relative pl-14">
<div class="absolute left-0 top-6 w-[56px] flex justify-center">
<div class="w-4 h-4 rounded-full bg-red-500 ring-4 ring-background-dark z-10"></div>
</div>
<div class="bg-card-dark border border-border-dark rounded-xl p-6 hover:border-red-500/30 transition-all group">
<div class="flex items-start justify-between">
<div class="flex items-center gap-4">
<div class="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold border border-primary/30">
                                    AD
                                </div>
<div>
<div class="flex items-center gap-3">
<h3 class="font-bold text-white text-lg leading-tight">Admin <span class="text-white/40 font-normal">voided Order</span> #BRK-042</h3>
<span class="px-2.5 py-0.5 bg-red-500/10 text-red-500 text-[11px] font-black uppercase tracking-wider rounded-full border border-red-500/20">Critical</span>
</div>
<p class="font-mono text-xs text-white/40 mt-1">2023-10-27 16:12:44</p>
</div>
</div>
<button class="text-white/20 hover:text-primary transition-colors">
<span class="material-icons">unfold_more</span>
</button>
</div>
<!-- Expanded Details -->
<div class="mt-6 pt-6 border-t border-border-dark grid grid-cols-2 gap-8">
<div>
<h4 class="text-[11px] font-bold text-white/30 uppercase tracking-widest mb-3">Context Metadata</h4>
<div class="space-y-2">
<div class="flex justify-between text-xs font-mono">
<span class="text-white/40">IP Address</span>
<span class="text-white/80">192.168.1.124</span>
</div>
<div class="flex justify-between text-xs font-mono">
<span class="text-white/40">User Agent</span>
<span class="text-white/80 text-right max-w-[200px] truncate">Mozilla/5.0 (Macintosh; Intel...)</span>
</div>
</div>
</div>
<div>
<h4 class="text-[11px] font-bold text-white/30 uppercase tracking-widest mb-3">Change Log</h4>
<div class="bg-background-dark/50 rounded-lg p-3 font-mono text-[11px] text-white/60">
<div class="flex gap-2"><span class="text-red-400">- status:</span> "Pending"</div>
<div class="flex gap-2"><span class="text-emerald-400">+ status:</span> "Voided"</div>
<div class="flex gap-2 mt-1"><span class="text-emerald-400">+ reason:</span> "Duplicate Order ID"</div>
</div>
</div>
</div>
</div>
</div>
<!-- Audit Entry 2: Info (Sarah) -->
<div class="relative pl-14">
<div class="absolute left-0 top-6 w-[56px] flex justify-center">
<div class="w-4 h-4 rounded-full bg-emerald-500 ring-4 ring-background-dark z-10"></div>
</div>
<div class="bg-card-dark border border-border-dark rounded-xl p-6 hover:border-emerald-500/30 transition-all">
<div class="flex items-start justify-between">
<div class="flex items-center gap-4">
<div class="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-background-dark font-bold">
                                    SM
                                </div>
<div>
<div class="flex items-center gap-3">
<h3 class="font-bold text-white text-lg leading-tight">Sarah Miller <span class="text-white/40 font-normal">created Order</span> #BRK-048</h3>
<span class="px-2.5 py-0.5 bg-emerald-500/10 text-emerald-500 text-[11px] font-black uppercase tracking-wider rounded-full border border-emerald-500/20">Info</span>
</div>
<p class="font-mono text-xs text-white/40 mt-1">2023-10-27 14:23:05</p>
</div>
</div>
<button class="text-white/20 hover:text-white transition-colors">
<span class="material-icons">unfold_more</span>
</button>
</div>
</div>
</div>
<!-- Audit Entry 3: Warning (Mike) -->
<div class="relative pl-14">
<div class="absolute left-0 top-6 w-[56px] flex justify-center">
<div class="w-4 h-4 rounded-full bg-amber-500 ring-4 ring-background-dark z-10"></div>
</div>
<div class="bg-card-dark border border-border-dark rounded-xl p-6 hover:border-amber-500/30 transition-all">
<div class="flex items-start justify-between">
<div class="flex items-center gap-4">
<div class="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white font-bold border border-white/20">
                                    MB
                                </div>
<div>
<div class="flex items-center gap-3">
<h3 class="font-bold text-white text-lg leading-tight">Mike Barnes <span class="text-white/40 font-normal">applied 15% discount to</span> #BRK-045</h3>
<span class="px-2.5 py-0.5 bg-amber-500/10 text-amber-500 text-[11px] font-black uppercase tracking-wider rounded-full border border-amber-500/20">Warning</span>
</div>
<p class="font-mono text-xs text-white/40 mt-1">2023-10-27 11:45:12</p>
</div>
</div>
<button class="text-white/20 hover:text-white transition-colors">
<span class="material-icons">unfold_more</span>
</button>
</div>
</div>
</div>
<!-- Audit Entry 4: System (Auto-sync) -->
<div class="relative pl-14">
<div class="absolute left-0 top-6 w-[56px] flex justify-center">
<div class="w-4 h-4 rounded-full bg-blue-500 ring-4 ring-background-dark z-10"></div>
</div>
<div class="bg-card-dark border border-border-dark rounded-xl p-6 hover:border-blue-500/30 transition-all">
<div class="flex items-start justify-between">
<div class="flex items-center gap-4">
<div class="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400">
<span class="material-icons text-xl">settings_suggest</span>
</div>
<div>
<div class="flex items-center gap-3">
<h3 class="font-bold text-white text-lg leading-tight">System <span class="text-white/40 font-normal">auto-synced offline orders</span></h3>
<span class="px-2.5 py-0.5 bg-blue-500/10 text-blue-400 text-[11px] font-black uppercase tracking-wider rounded-full border border-blue-500/20">Info</span>
</div>
<p class="font-mono text-xs text-white/40 mt-1">2023-10-27 09:00:00</p>
</div>
</div>
<button class="text-white/20 hover:text-white transition-colors">
<span class="material-icons">unfold_more</span>
</button>
</div>
</div>
</div>
<!-- Audit Entry 5: Info (Sarah) -->
<div class="relative pl-14">
<div class="absolute left-0 top-6 w-[56px] flex justify-center">
<div class="w-4 h-4 rounded-full bg-emerald-500 ring-4 ring-background-dark z-10"></div>
</div>
<div class="bg-card-dark border border-border-dark rounded-xl p-6 hover:border-emerald-500/30 transition-all">
<div class="flex items-start justify-between">
<div class="flex items-center gap-4">
<div class="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-background-dark font-bold">
                                    SM
                                </div>
<div>
<div class="flex items-center gap-3">
<h3 class="font-bold text-white text-lg leading-tight">Sarah Miller <span class="text-white/40 font-normal">updated Inventory</span> "Madagascar Vanilla"</h3>
<span class="px-2.5 py-0.5 bg-emerald-500/10 text-emerald-500 text-[11px] font-black uppercase tracking-wider rounded-full border border-emerald-500/20">Info</span>
</div>
<p class="font-mono text-xs text-white/40 mt-1">2023-10-26 18:30:11</p>
</div>
</div>
<button class="text-white/20 hover:text-white transition-colors">
<span class="material-icons">unfold_more</span>
</button>
</div>
</div>
</div>
</div>
</div>
<!-- Load More Section -->
<div class="mt-12 flex justify-center pb-20">
<button class="flex items-center gap-2 px-8 py-3 bg-card-dark border border-border-dark hover:border-primary/50 text-white/60 hover:text-white rounded-xl font-bold transition-all group">
<span class="material-icons group-hover:animate-bounce">keyboard_double_arrow_down</span>
<span>Load older activity logs</span>
</button>
</div>
</main>
<!-- Side Decoration (Gradient) -->
<div class="fixed top-0 right-0 w-[400px] h-[600px] bg-primary/5 blur-[120px] pointer-events-none -z-10"></div>
<div class="fixed bottom-0 left-0 w-[400px] h-[600px] bg-primary/5 blur-[120px] pointer-events-none -z-10"></div>
</body></html>
      <!-- STITCH_HTML_END -->
    \ }} />
  );
};

export default Audit_Trail___Logs;
