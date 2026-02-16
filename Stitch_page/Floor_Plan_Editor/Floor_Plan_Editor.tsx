import React from 'react';

const Floor_Plan_Editor: React.FC = () => {
  return (
    <div dangerouslySetInnerHTML={{ __html: `
      <!-- STITCH_HTML_START -->
      <!DOCTYPE html>

<html class="dark" lang="en"><head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
<title>The Breakery Floor Plan Editor</title>
<script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600&amp;family=Work+Sans:wght@300;400;500;600&amp;display=swap" rel="stylesheet"/>
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
                        "panel-dark": "#1A1A1D",
                    },
                    fontFamily: {
                        "display": ["Work Sans", "sans-serif"],
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
            font-family: 'Work Sans', sans-serif;
        }
        .canvas-grid {
            background-size: 40px 40px;
            background-image: 
                linear-gradient(to right, rgba(200, 164, 91, 0.05) 1px, transparent 1px),
                linear-gradient(to bottom, rgba(200, 164, 91, 0.05) 1px, transparent 1px);
        }
        .table-occupied-glow {
            box-shadow: 0 0 15px rgba(200, 164, 91, 0.4);
        }
    </style>
</head>
<body class="bg-background-light dark:bg-background-dark text-slate-800 dark:text-slate-200 overflow-hidden h-screen flex flex-col">
<!-- Header -->
<header class="h-16 border-b border-primary/10 bg-panel-dark flex items-center justify-between px-6 z-30">
<div class="flex items-center gap-4">
<span class="text-primary material-icons text-3xl">restaurant</span>
<h1 class="font-serif text-2xl text-primary">The Breakery <span class="text-slate-400 font-display font-light text-lg ml-2">Floor Plan Editor</span></h1>
</div>
<div class="flex items-center gap-8">
<div class="flex items-center gap-3">
<span class="text-xs uppercase tracking-widest text-slate-400 font-medium">Live View</span>
<label class="relative inline-flex items-center cursor-pointer">
<input checked="" class="sr-only peer" type="checkbox" value=""/>
<div class="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
</label>
<span class="text-xs uppercase tracking-widest text-primary font-bold">Edit Mode</span>
</div>
<div class="h-8 w-[1px] bg-primary/20"></div>
<button class="bg-primary hover:bg-primary/90 text-background-dark px-6 py-2 rounded-lg font-semibold text-sm transition-colors flex items-center gap-2">
<span class="material-icons text-sm">save</span>
                SAVE LAYOUT
            </button>
</div>
</header>
<div class="flex-1 flex overflow-hidden">
<!-- Left Toolbar -->
<aside class="w-20 bg-panel-dark border-r border-primary/10 flex flex-col items-center py-6 gap-6 z-20">
<div class="flex flex-col gap-4">
<button class="w-12 h-12 flex items-center justify-center rounded-xl bg-primary/10 border border-primary text-primary hover:bg-primary/20 transition-all group relative" title="Add Round Table">
<span class="material-icons">radio_button_unchecked</span>
<span class="absolute left-16 bg-panel-dark border border-primary/20 px-2 py-1 rounded text-[10px] whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity">Round Table</span>
</button>
<button class="w-12 h-12 flex items-center justify-center rounded-xl bg-slate-800 border border-slate-700 text-slate-400 hover:text-primary hover:border-primary/50 transition-all group relative" title="Add Rectangular Table">
<span class="material-icons">crop_din</span>
<span class="absolute left-16 bg-panel-dark border border-primary/20 px-2 py-1 rounded text-[10px] whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity">Square Table</span>
</button>
<button class="w-12 h-12 flex items-center justify-center rounded-xl bg-slate-800 border border-slate-700 text-slate-400 hover:text-primary hover:border-primary/50 transition-all group relative" title="Add Long Table">
<span class="material-icons">view_day</span>
<span class="absolute left-16 bg-panel-dark border border-primary/20 px-2 py-1 rounded text-[10px] whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity">Long Table</span>
</button>
<button class="w-12 h-12 flex items-center justify-center rounded-xl bg-slate-800 border border-slate-700 text-slate-400 hover:text-primary hover:border-primary/50 transition-all group relative" title="Add Wall">
<span class="material-icons">remove</span>
<span class="absolute left-16 bg-panel-dark border border-primary/20 px-2 py-1 rounded text-[10px] whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity">Wall Divider</span>
</button>
</div>
<div class="mt-auto flex flex-col gap-4">
<div class="flex flex-col items-center gap-1">
<button class="w-10 h-10 flex items-center justify-center rounded-full bg-primary/20 text-primary border border-primary/30">
<span class="material-icons text-sm">grid_on</span>
</button>
<span class="text-[9px] uppercase font-bold text-primary">Snap</span>
</div>
<button class="w-10 h-10 flex items-center justify-center rounded-full bg-slate-800 text-slate-400 hover:text-white">
<span class="material-icons text-sm">zoom_in</span>
</button>
<button class="w-10 h-10 flex items-center justify-center rounded-full bg-slate-800 text-slate-400 hover:text-white">
<span class="material-icons text-sm">zoom_out</span>
</button>
</div>
</aside>
<!-- Central Canvas Area -->
<main class="flex-1 relative bg-background-dark overflow-hidden canvas-grid">
<!-- Canvas Interaction Layer -->
<div class="absolute inset-0 p-12">
<!-- Table Elements (Mockup Draggables) -->
<!-- Table 1: Occupied (Gold) -->
<div class="absolute top-[20%] left-[15%] group cursor-move">
<div class="w-24 h-24 rounded-full border-2 border-primary bg-panel-dark flex flex-col items-center justify-center table-occupied-glow relative">
<span class="text-xs text-primary font-bold">T-01</span>
<div class="flex gap-1 mt-1">
<span class="w-1 h-1 rounded-full bg-primary"></span>
<span class="w-1 h-1 rounded-full bg-primary"></span>
<span class="w-1 h-1 rounded-full bg-primary"></span>
<span class="w-1 h-1 rounded-full bg-primary"></span>
</div>
<div class="absolute -top-2 -right-2 bg-primary text-background-dark text-[10px] font-bold px-1.5 py-0.5 rounded shadow-lg">4 SEATS</div>
</div>
</div>
<!-- Table 2: Available (Green) -->
<div class="absolute top-[20%] left-[40%] group cursor-move">
<div class="w-20 h-20 rounded-xl border-2 border-emerald-500 bg-panel-dark flex flex-col items-center justify-center relative shadow-xl shadow-emerald-500/10">
<span class="text-xs text-emerald-500 font-bold">T-04</span>
<div class="flex gap-1 mt-1">
<span class="w-1 h-1 rounded-full bg-emerald-500"></span>
<span class="w-1 h-1 rounded-full bg-emerald-500"></span>
</div>
<div class="absolute -top-2 -right-2 bg-emerald-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">2 SEATS</div>
</div>
</div>
<!-- Table 3: Reserved (Blue) -->
<div class="absolute top-[50%] left-[30%] group cursor-move ring-2 ring-primary ring-offset-4 ring-offset-background-dark">
<div class="w-32 h-20 rounded-lg border-2 border-sky-400 bg-panel-dark flex flex-col items-center justify-center relative shadow-xl shadow-sky-400/10">
<span class="text-xs text-sky-400 font-bold">T-12</span>
<div class="flex gap-1 mt-1">
<span class="w-1 h-1 rounded-full bg-sky-400"></span>
<span class="w-1 h-1 rounded-full bg-sky-400"></span>
<span class="w-1 h-1 rounded-full bg-sky-400"></span>
<span class="w-1 h-1 rounded-full bg-sky-400"></span>
<span class="w-1 h-1 rounded-full bg-sky-400"></span>
<span class="w-1 h-1 rounded-full bg-sky-400"></span>
</div>
<div class="absolute -top-2 -right-2 bg-sky-400 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">6 SEATS</div>
<!-- Selection Handles -->
<div class="absolute -top-1 -left-1 w-2 h-2 bg-primary rounded-full"></div>
<div class="absolute -bottom-1 -right-1 w-2 h-2 bg-primary rounded-full"></div>
</div>
</div>
<!-- Bar Counter Section -->
<div class="absolute top-[10%] right-[10%] group cursor-move">
<div class="w-16 h-80 rounded-full border-2 border-slate-700 bg-panel-dark flex items-center justify-center flex-col gap-8 opacity-80">
<span class="text-[10px] uppercase tracking-tighter text-slate-500 -rotate-90">BAR COUNTER</span>
<div class="flex flex-col gap-4">
<div class="w-3 h-3 rounded-full border border-slate-600"></div>
<div class="w-3 h-3 rounded-full border border-slate-600"></div>
<div class="w-3 h-3 rounded-full border border-slate-600"></div>
<div class="w-3 h-3 rounded-full border border-slate-600"></div>
</div>
</div>
</div>
<!-- Wall Element -->
<div class="absolute top-[45%] left-[5%]">
<div class="w-2 h-40 bg-slate-800 rounded-full border border-slate-700"></div>
</div>
<!-- Empty Canvas Indicator (Subtle) -->
<div class="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-2 text-slate-500 bg-panel-dark/80 backdrop-blur px-4 py-2 rounded-full border border-primary/10">
<span class="material-icons text-sm">info</span>
<span class="text-xs font-medium">Select a table to edit its properties or drag to reposition.</span>
</div>
</div>
</main>
<!-- Right Properties Panel -->
<aside class="w-80 bg-panel-dark border-l border-primary/10 flex flex-col z-20">
<div class="p-6 border-b border-primary/10 flex items-center justify-between">
<h2 class="font-semibold text-primary uppercase text-xs tracking-widest">Properties Inspector</h2>
<span class="material-icons text-slate-500 text-sm">settings</span>
</div>
<div class="flex-1 p-6 overflow-y-auto space-y-8">
<!-- Selected Info -->
<div class="space-y-4">
<div class="flex items-center gap-4">
<div class="w-12 h-12 rounded bg-sky-400/10 border border-sky-400/30 flex items-center justify-center text-sky-400">
<span class="material-icons">view_day</span>
</div>
<div>
<p class="text-[10px] text-slate-500 uppercase font-bold tracking-tight">Active Selection</p>
<h3 class="text-lg font-medium text-slate-200">Table T-12</h3>
</div>
</div>
</div>
<!-- Form Fields -->
<div class="space-y-6">
<!-- Table Number -->
<div class="space-y-2">
<label class="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Table Number</label>
<input class="w-full bg-background-dark border-slate-700 rounded-lg text-sm text-slate-200 focus:ring-primary focus:border-primary" type="text" value="T-12"/>
</div>
<!-- Seats Stepper -->
<div class="space-y-2">
<label class="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Seats Capacity</label>
<div class="flex items-center gap-2">
<button class="w-10 h-10 rounded-lg bg-background-dark border border-slate-700 flex items-center justify-center text-slate-400 hover:text-primary">-</button>
<div class="flex-1 h-10 bg-background-dark border border-slate-700 rounded-lg flex items-center justify-center text-sm font-bold text-slate-200">6</div>
<button class="w-10 h-10 rounded-lg bg-background-dark border border-slate-700 flex items-center justify-center text-slate-400 hover:text-primary">+</button>
</div>
</div>
<!-- Zone Dropdown -->
<div class="space-y-2">
<label class="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Zone Assignment</label>
<select class="w-full bg-background-dark border-slate-700 rounded-lg text-sm text-slate-200 focus:ring-primary focus:border-primary">
<option>Main Indoor</option>
<option>Outdoor Patio</option>
<option selected="">VIP Lounge</option>
<option>Private Booths</option>
</select>
</div>
<!-- Coordinates -->
<div class="grid grid-cols-2 gap-4">
<div class="space-y-2">
<label class="text-[10px] uppercase font-bold text-slate-500 tracking-wider">X Coordinate</label>
<div class="px-4 py-2 bg-background-dark/50 border border-slate-800 rounded-lg text-sm text-slate-400 font-mono">
                                480 px
                            </div>
</div>
<div class="space-y-2">
<label class="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Y Coordinate</label>
<div class="px-4 py-2 bg-background-dark/50 border border-slate-800 rounded-lg text-sm text-slate-400 font-mono">
                                320 px
                            </div>
</div>
</div>
</div>
<div class="h-[1px] bg-primary/10"></div>
<!-- Danger Zone -->
<button class="w-full flex items-center justify-center gap-2 py-3 border border-red-500/20 text-red-500 hover:bg-red-500/10 rounded-lg text-xs font-bold transition-all uppercase">
<span class="material-icons text-sm">delete_outline</span>
                    Remove Element
                </button>
</div>
<div class="p-6 bg-background-dark/30 mt-auto">
<div class="flex justify-between items-center mb-4">
<span class="text-[10px] text-slate-500 font-bold uppercase">Status legend</span>
</div>
<div class="grid grid-cols-2 gap-2">
<div class="flex items-center gap-2">
<span class="w-2 h-2 rounded-full bg-emerald-500"></span>
<span class="text-[10px] text-slate-400">Available</span>
</div>
<div class="flex items-center gap-2">
<span class="w-2 h-2 rounded-full bg-primary"></span>
<span class="text-[10px] text-slate-400">Occupied</span>
</div>
<div class="flex items-center gap-2">
<span class="w-2 h-2 rounded-full bg-sky-400"></span>
<span class="text-[10px] text-slate-400">Reserved</span>
</div>
<div class="flex items-center gap-2">
<span class="w-2 h-2 rounded-full bg-slate-600"></span>
<span class="text-[10px] text-slate-400">Closed</span>
</div>
</div>
</div>
</aside>
</div>
<!-- Mode Footer Overlay -->
<div class="absolute bottom-6 left-24 flex items-center gap-4 bg-panel-dark/90 backdrop-blur-md border border-primary/20 p-2 rounded-xl shadow-2xl z-40">
<div class="flex -space-x-2">
<img class="w-8 h-8 rounded-full border-2 border-background-dark object-cover" data-alt="Manager profile picture" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDG0tR3iIKacFO7NtNJvVjztMCPlS6azkmFFKqUeLHkxSmU3PfNFO-z1YQfRmR4oNyVqmIF7TcpyUss6LNeEtN1KDwDck4EIAiN1hLAnsx7eXK47afJ5GUITE0yhR86ougZtrtFa6Wa_zb5YdSo56kxSE1lhUQ9KWVlRzTX8z7G_XgWwlcll9Nx_tzgjDu-AMDdgtPLF2Rshf5LnbFcGJi4_I00QAT2kcCmnu2YQJ2L4BigZLhy103xp-cs2hvhxzMIjljN2lAuCgoi"/>
<img class="w-8 h-8 rounded-full border-2 border-background-dark object-cover" data-alt="Staff member avatar" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAE4luyOVbxDtyXjvchxRa7YclEcphMOlVAG6_lH9fmGCi8DUv3KDqJapQk6y5MZkI2WQNI6gya4hLmAUlVlyW-PHB_J4kBxPzDHWhMd3GfOMc9CdhUU3_Vznyl5QgNdOhGhGJ3EaukJIJDzWtCvhEF8VwLkBwF390x6DRFpWpCfV-WRImflxgY9M-fHCHKPWMiAJF-VbFTe4k9ZJ65Gbo7WRwuda9687Oelhc7H8k8VQj1d1YL4UUntRpCSNqgtCLfjrEtRdNMJbTf"/>
<div class="w-8 h-8 rounded-full border-2 border-background-dark bg-primary flex items-center justify-center text-[10px] text-background-dark font-bold">+3</div>
</div>
<div class="pr-4">
<p class="text-[10px] text-slate-400 font-medium">Collaborating now</p>
<p class="text-[11px] text-primary font-bold">2 active editors</p>
</div>
</div>
</body></html>
      <!-- STITCH_HTML_END -->
    ` }} />
  );
};

export default Floor_Plan_Editor;
