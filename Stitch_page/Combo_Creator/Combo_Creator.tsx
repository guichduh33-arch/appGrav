import React from 'react';

const Combo_Creator: React.FC = () => {
  return (
    <div dangerouslySetInnerHTML={{ __html: `
      <!-- STITCH_HTML_START -->
      <!DOCTYPE html>

<html class="dark" lang="en"><head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
<title>The Breakery Combo Creator</title>
<script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
<link href="https://fonts.googleapis.com/css2?family=Work+Sans:wght@300;400;500;600;700&amp;display=swap" rel="stylesheet"/>
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
                        "background-dark": "#0D0D0F", // User requested #0D0D0F
                        "card-dark": "#1A1A1D", // User requested #1A1A1D
                        "surface-dark": "#23200f",
                    },
                    fontFamily: {
                        "display": ["Work Sans", "sans-serif"]
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
            background-color: #0D0D0F;
        }
    </style>
</head>
<body class="font-display text-slate-200 antialiased min-h-screen">
<!-- Top Navigation Bar -->
<nav class="border-b border-white/5 bg-background-dark/80 backdrop-blur-md sticky top-0 z-50">
<div class="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
<div class="flex items-center gap-4">
<span class="material-icons-round text-primary text-3xl">bakery_dining</span>
<span class="text-xl font-bold tracking-tight text-white uppercase italic">The Breakery</span>
</div>
<div class="flex items-center gap-6">
<button class="text-sm font-medium text-slate-400 hover:text-white transition-colors">Cancel</button>
<button class="bg-primary text-background-dark px-6 py-2 rounded font-bold text-sm uppercase tracking-wider hover:bg-primary/90 transition-all shadow-[0_0_20px_rgba(249,212,6,0.2)]">
                    Save Combo
                </button>
</div>
</div>
</nav>
<main class="max-w-7xl mx-auto px-6 py-10">
<div class="flex flex-col lg:flex-row gap-8">
<!-- LEFT COLUMN (65%) -->
<div class="lg:w-[65%] space-y-8">
<div>
<h1 class="text-3xl font-bold text-white mb-2">Create New Combo</h1>
<p class="text-slate-400">Configure your bundle logic, pricing, and item groups for the POS system.</p>
</div>
<!-- Basic Information Card -->
<section class="bg-card-dark rounded-xl p-8 border border-white/5 shadow-2xl">
<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
<div class="md:col-span-2">
<label class="block text-xs font-bold text-primary uppercase tracking-widest mb-2">Combo Name</label>
<input class="w-full bg-background-dark border-white/10 rounded-lg py-3 px-4 text-white focus:ring-primary focus:border-primary transition-all" type="text" value="Breakfast Special"/>
</div>
<div class="md:col-span-2">
<label class="block text-xs font-bold text-primary uppercase tracking-widest mb-2">Description</label>
<textarea class="w-full bg-background-dark border-white/10 rounded-lg py-3 px-4 text-white focus:ring-primary focus:border-primary transition-all" rows="2">Start your morning right with a fresh pastry and a signature drink of your choice.</textarea>
</div>
<div>
<label class="block text-xs font-bold text-primary uppercase tracking-widest mb-2">Base Price</label>
<div class="relative">
<span class="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-medium">Rp</span>
<input class="w-full bg-background-dark border-white/10 rounded-lg py-3 pl-12 pr-4 text-white focus:ring-primary focus:border-primary transition-all font-semibold" type="text" value="75.000"/>
</div>
</div>
<div class="flex items-end">
<div class="bg-primary/10 border border-primary/20 px-4 py-3 rounded-lg flex items-center gap-3">
<span class="text-primary material-icons-round text-sm">trending_down</span>
<span class="text-primary font-bold">Save 21%</span>
<span class="text-xs text-primary/60">compared to à la carte</span>
</div>
</div>
</div>
</section>
<!-- Choice Groups -->
<div class="space-y-6">
<h2 class="text-lg font-bold text-white flex items-center gap-2">
<span class="material-icons-round text-primary">list</span>
                        Choice Groups
                    </h2>
<!-- Group 1 -->
<div class="bg-card-dark rounded-xl border border-white/5 overflow-hidden">
<div class="p-6 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
<div>
<h3 class="font-bold text-white flex items-center gap-2">
                                    Choose Your Pastry
                                    <span class="text-[10px] bg-primary/20 text-primary px-2 py-0.5 rounded uppercase tracking-tighter">Required</span>
</h3>
<p class="text-xs text-slate-500 mt-1">Pick 1 selection from this group</p>
</div>
<button class="text-slate-500 hover:text-white transition-colors">
<span class="material-icons-round text-xl">settings</span>
</button>
</div>
<div class="p-6 space-y-4">
<div class="flex items-center justify-between p-3 rounded-lg bg-background-dark/50 border border-white/5">
<div class="flex items-center gap-4">
<div class="w-10 h-10 rounded overflow-hidden">
<img class="w-full h-full object-cover" data-alt="Golden buttery croissant close up" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAAbF4hU2fIqbN3EFlmUEru0RJNx3q9xpq-mrqSRaWmT39U8sn4fqffTk5YEMWek8qyCqFh3YIDuL4OVtjm1-fOeUYsinYEzj8wUTwJXpAKArbizHStn2SXk50AE4hTMvFsjMscExnwdnIP4d-k9vubhxAM-nYSx1jiGK9UpTqHdVi7_SNT2EQQvm188NwxosO7J7e5OU0Jfs_CY7XawZRcNwG9ghUdN4_za6Z00esDrSXkPAC0tiYlVQ8NfL--ttd39TYZHZRxcmPp"/>
</div>
<span class="font-medium">Croissant</span>
</div>
<span class="text-primary font-bold text-sm">+Rp 0</span>
</div>
<div class="flex items-center justify-between p-3 rounded-lg bg-background-dark/50 border border-primary/30 ring-1 ring-primary/30">
<div class="flex items-center gap-4">
<div class="w-10 h-10 rounded overflow-hidden">
<img class="w-full h-full object-cover" data-alt="Pain au chocolat pastry" src="https://lh3.googleusercontent.com/aida-public/AB6AXuD3GarDWEmbY6SWqg6fJye7RtV9lbiM82-0iLkrNhHp8lNf_tF-hal4nQStn9sP9DSrjetaCUYTbG9OFeRure2pqMrNPmkX0E60pC4HsmRw-fkPrIMnmu0v6SgeIaRMF9PcDOkwjy2Sum0XTJsbnZrfLY1CnA2znXwvFXtDy9_nK09JY8Rla-o2J3w1c91Aun0s8Ec3I6wNMVesWJVij7N_-6St4H_X7XVGFhspIiBxMIb9UGYYKrWXH_TVoSMr8o-i7nPpzXnfedoc"/>
</div>
<span class="font-medium">Pain au Chocolat</span>
</div>
<span class="text-primary font-bold text-sm">+Rp 5.000</span>
</div>
<div class="flex items-center justify-between p-3 rounded-lg bg-background-dark/50 border border-white/5">
<div class="flex items-center gap-4">
<div class="w-10 h-10 rounded overflow-hidden">
<img class="w-full h-full object-cover" data-alt="Sweet fruit danish pastry" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCsB282mnz54fAh0rulA8VA2syMcjkA7nLLq_OZReswAKI1sKu52Tkai93qYwcoNe1YAH0q6LqcdRfe0zTeB2CsavQgNjogoA7kdcb_kay53mIMfv_EHd8vDmcedkvvjLDClUl1IkHVpPkfD6-L_n4oq1ogPiYhRyPmR3w9PkvIRTuw0Oegfzl-ASvKXvC_lxqEDDYMAyGuoHwtX0E0gMuX0uhDiWISHnssyNcCjwtYrxid38guaJJ_Yvu0YpqBaqzU0HC_cFe2yKGR"/>
</div>
<span class="font-medium">Danish</span>
</div>
<span class="text-primary font-bold text-sm">+Rp 3.000</span>
</div>
</div>
</div>
<!-- Group 2 -->
<div class="bg-card-dark rounded-xl border border-white/5 overflow-hidden">
<div class="p-6 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
<div>
<h3 class="font-bold text-white flex items-center gap-2">
                                    Choose Your Drink
                                    <span class="text-[10px] bg-primary/20 text-primary px-2 py-0.5 rounded uppercase tracking-tighter">Required</span>
</h3>
<p class="text-xs text-slate-500 mt-1">Pick 1 selection from this group</p>
</div>
<button class="text-slate-500 hover:text-white transition-colors">
<span class="material-icons-round text-xl">settings</span>
</button>
</div>
<div class="p-6 space-y-4">
<div class="flex items-center justify-between p-3 rounded-lg bg-background-dark/50 border border-white/5">
<span class="font-medium">Americano</span>
<span class="text-primary font-bold text-sm">+Rp 0</span>
</div>
<div class="flex items-center justify-between p-3 rounded-lg bg-background-dark/50 border border-white/5">
<span class="font-medium">Latte</span>
<span class="text-primary font-bold text-sm">+Rp 2.000</span>
</div>
<div class="flex items-center justify-between p-3 rounded-lg bg-background-dark/50 border border-white/5">
<span class="font-medium">Orange Juice</span>
<span class="text-primary font-bold text-sm">+Rp 8.000</span>
</div>
</div>
</div>
<!-- Group 3 -->
<div class="bg-card-dark rounded-xl border border-white/5 overflow-hidden">
<div class="p-6 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
<div>
<h3 class="font-bold text-white flex items-center gap-2">
                                    Add Extra
                                    <span class="text-[10px] bg-white/10 text-slate-400 px-2 py-0.5 rounded uppercase tracking-tighter">Optional</span>
</h3>
<p class="text-xs text-slate-500 mt-1">Pick 0-2 selections</p>
</div>
<button class="text-slate-500 hover:text-white transition-colors">
<span class="material-icons-round text-xl">settings</span>
</button>
</div>
<div class="p-6 space-y-4">
<div class="flex items-center justify-between p-3 rounded-lg bg-background-dark/50 border border-white/5 opacity-80">
<span class="font-medium">Extra Butter</span>
<span class="text-primary font-bold text-sm">+Rp 5.000</span>
</div>
<div class="flex items-center justify-between p-3 rounded-lg bg-background-dark/50 border border-white/5 opacity-80">
<span class="font-medium">Strawberry Jam</span>
<span class="text-primary font-bold text-sm">+Rp 4.000</span>
</div>
</div>
</div>
<!-- Add Group Button -->
<button class="w-full border-2 border-dashed border-white/10 hover:border-primary/50 hover:bg-primary/5 transition-all rounded-xl py-6 flex flex-col items-center justify-center gap-2 group">
<span class="material-icons-round text-slate-500 group-hover:text-primary">add_circle_outline</span>
<span class="text-slate-500 group-hover:text-primary font-medium">Add Choice Group</span>
</button>
</div>
</div>
<!-- RIGHT COLUMN (35%) -->
<div class="lg:w-[35%]">
<div class="sticky top-24">
<div class="mb-4 flex items-center justify-between">
<h2 class="text-xs font-bold text-primary uppercase tracking-widest">Live Preview</h2>
<span class="text-[10px] text-slate-500">POS Interface View</span>
</div>
<!-- POS Card Preview -->
<div class="bg-card-dark rounded-xl overflow-hidden border border-white/10 shadow-2xl ring-1 ring-white/5">
<div class="relative h-56">
<img class="w-full h-full object-cover" data-alt="Aesthetic coffee and croissant breakfast set" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDDpPjl1We8a5FkUehb4Kpw8ZBZs8zVEjwEUbCY2HqYuE7eLPF66VYGyARqXvGlydZsJxappGUoKJXRtGjRl15d98Qh3i2pCdateP9I9M5JpQnqhtuM0a25q4qj19rSgvMbHW6vYu3pN-LV_c6lOkecsdC4fNcB7gus5aOniKOufJtINg4OfUQzsFHOA2xTQDNavE0Sgyn7FS0taykaEYzdrfp94z9VoCeHdsmY7lYIcKw44vVO2wSOEbaVB0wFvgqxlu17N85HFi84"/>
<div class="absolute inset-0 bg-gradient-to-t from-background-dark via-transparent to-transparent"></div>
<div class="absolute top-4 right-4">
<span class="bg-primary text-background-dark text-[10px] font-black uppercase px-2 py-1 rounded shadow-lg">Combo</span>
</div>
</div>
<div class="p-6">
<div class="flex justify-between items-start mb-2">
<h3 class="text-xl font-bold text-white">Breakfast Special</h3>
<div class="text-right">
<span class="block text-[10px] text-slate-500 uppercase leading-none mb-1">Starts from</span>
<span class="text-xl font-bold text-primary">Rp 75.000</span>
</div>
</div>
<p class="text-sm text-slate-400 line-clamp-2 mb-6">Start your morning right with a fresh pastry and a signature drink of your choice.</p>
<div class="space-y-3">
<div class="flex items-center gap-2 text-xs text-slate-500 border-t border-white/5 pt-4">
<span class="material-icons-round text-sm">check_circle</span>
<span>Includes 1 Pastry</span>
</div>
<div class="flex items-center gap-2 text-xs text-slate-500">
<span class="material-icons-round text-sm">check_circle</span>
<span>Includes 1 Signature Drink</span>
</div>
<div class="flex items-center gap-2 text-xs text-slate-500">
<span class="material-icons-round text-sm">add_circle</span>
<span>Optional add-ons available</span>
</div>
</div>
<button class="w-full mt-8 bg-white/5 hover:bg-white/10 text-white font-bold py-3 rounded-lg border border-white/10 transition-all uppercase tracking-widest text-xs">
                                Add to Order
                            </button>
</div>
</div>
<!-- Info Alert -->
<div class="mt-6 p-4 rounded-lg bg-surface-dark border border-primary/20 flex gap-3">
<span class="material-icons-round text-primary text-lg">info</span>
<div class="text-xs text-slate-300">
<p class="font-bold text-primary mb-1">Pricing Logic</p>
<p>Base price + any positive price adjustments from selected choice groups will determine the final checkout amount.</p>
</div>
</div>
</div>
</div>
</div>
</main>
</body></html>
      <!-- STITCH_HTML_END -->
    ` }} />
  );
};

export default Combo_Creator;
