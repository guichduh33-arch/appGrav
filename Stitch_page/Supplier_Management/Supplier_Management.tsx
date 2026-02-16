import React from 'react';

const Supplier_Management: React.FC = () => {
  return (
    <div dangerouslySetInnerHTML={{ __html: `
      <!-- STITCH_HTML_START -->
      <!DOCTYPE html>

<html class="dark" lang="en"><head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
<title>The Breakery - Supplier Management</title>
<script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&amp;family=Playfair+Display:wght@700&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<script id="tailwind-config">
    tailwind.config = {
      darkMode: "class",
      theme: {
        extend: {
          colors: {
            "primary": "#eead2b",
            "background-light": "#f8f7f6",
            "background-dark": "#0D0D0F", // Requested Specific Black
            "card-dark": "#1A1A1D", // Requested Specific Card Color
          },
          fontFamily: {
            "display": ["Inter", "sans-serif"],
            "playfair": ["Playfair Display", "serif"]
          },
          borderRadius: {"DEFAULT": "0.5rem", "lg": "1rem", "xl": "1.5rem", "full": "9999px"},
        },
      },
    }
  </script>
<style>
    body {
      font-family: 'Inter', sans-serif;
      scrollbar-width: thin;
      scrollbar-color: #eead2b #1A1A1D;
    }
    .custom-scrollbar::-webkit-scrollbar { width: 6px; }
    .custom-scrollbar::-webkit-scrollbar-track { background: #0D0D0F; }
    .custom-scrollbar::-webkit-scrollbar-thumb { background: #eead2b; border-radius: 10px; }
  </style>
</head>
<body class="bg-background-light dark:bg-background-dark text-slate-800 dark:text-slate-200 min-h-screen flex overflow-hidden">
<!-- Sidebar Navigation (Collapsed Minimalist) -->
<aside class="w-20 bg-card-dark border-r border-primary/10 flex flex-col items-center py-8 space-y-8">
<div class="w-12 h-12 bg-primary rounded-xl flex items-center justify-center text-background-dark font-bold text-xl">B</div>
<nav class="flex flex-col space-y-6">
<button class="text-slate-500 hover:text-primary transition-colors"><span class="material-icons">dashboard</span></button>
<button class="text-slate-500 hover:text-primary transition-colors"><span class="material-icons">inventory_2</span></button>
<button class="text-primary bg-primary/10 p-2 rounded-lg transition-colors"><span class="material-icons">local_shipping</span></button>
<button class="text-slate-500 hover:text-primary transition-colors"><span class="material-icons">payments</span></button>
<button class="text-slate-500 hover:text-primary transition-colors"><span class="material-icons">analytics</span></button>
</nav>
</aside>
<!-- Main Content Area -->
<main class="flex-1 flex flex-col relative overflow-hidden">
<!-- Header -->
<header class="h-20 px-8 flex items-center justify-between border-b border-primary/10 bg-background-dark/80 backdrop-blur-md z-10">
<div class="flex items-center space-x-4">
<span class="material-icons text-primary text-3xl">local_shipping</span>
<h1 class="font-playfair text-2xl text-slate-100">Suppliers</h1>
</div>
<div class="flex items-center space-x-6">
<div class="relative">
<input class="bg-card-dark border-primary/20 rounded-lg pl-10 pr-4 py-2 text-sm focus:ring-primary focus:border-primary transition-all w-64" placeholder="Search vendors..." type="text"/>
<span class="material-icons absolute left-3 top-2.5 text-slate-500 text-sm">search</span>
</div>
<button class="bg-primary hover:bg-primary/90 text-background-dark px-6 py-2.5 rounded-lg font-semibold flex items-center space-x-2 transition-all shadow-lg shadow-primary/10">
<span class="material-icons text-lg">add</span>
<span>New Supplier</span>
</button>
</div>
</header>
<!-- Scrollable Content -->
<div class="flex-1 p-8 overflow-y-auto custom-scrollbar">
<!-- Grid Layout -->
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
<!-- Supplier Card 1 -->
<div class="bg-card-dark border border-primary/10 rounded-xl p-6 hover:border-primary/40 transition-all group">
<div class="flex justify-between items-start mb-4">
<div>
<h3 class="text-lg font-bold text-slate-100 group-hover:text-primary transition-colors">Golden Grain Co.</h3>
<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary mt-1 border border-primary/20">
                Flour &amp; Grains
              </span>
</div>
<div class="flex items-center">
<span class="h-2 w-2 rounded-full bg-green-500 animate-pulse mr-2"></span>
<span class="text-[10px] uppercase tracking-wider text-green-500 font-bold">Active</span>
</div>
</div>
<div class="space-y-3 mb-6">
<div class="flex items-center text-sm text-slate-400">
<span class="material-icons text-xs mr-3 text-primary/60">person</span>
<span>Thomas Wheatley</span>
</div>
<div class="flex items-center text-sm text-slate-400">
<span class="material-icons text-xs mr-3 text-primary/60">phone</span>
<span>+62 812 3456 7890</span>
</div>
<div class="flex items-center text-sm text-slate-400">
<span class="material-icons text-xs mr-3 text-primary/60">email</span>
<span>orders@goldengrain.id</span>
</div>
</div>
<div class="pt-4 border-t border-primary/5 flex justify-between items-center text-xs text-slate-500 font-medium">
<div class="flex items-center">
<span class="text-slate-300">12 POs</span>
<span class="mx-2 text-primary/20">|</span>
<span class="text-slate-300">Rp 45.2M total</span>
</div>
<div class="text-[10px] uppercase opacity-60 italic">Last order: Feb 12</div>
</div>
</div>
<!-- Supplier Card 2 -->
<div class="bg-card-dark border border-primary/10 rounded-xl p-6 hover:border-primary/40 transition-all group">
<div class="flex justify-between items-start mb-4">
<div>
<h3 class="text-lg font-bold text-slate-100 group-hover:text-primary transition-colors">Dairy Delights Ltd.</h3>
<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary mt-1 border border-primary/20">
                Dairy &amp; Butter
              </span>
</div>
<div class="flex items-center">
<span class="h-2 w-2 rounded-full bg-green-500 animate-pulse mr-2"></span>
<span class="text-[10px] uppercase tracking-wider text-green-500 font-bold">Active</span>
</div>
</div>
<div class="space-y-3 mb-6">
<div class="flex items-center text-sm text-slate-400">
<span class="material-icons text-xs mr-3 text-primary/60">person</span>
<span>Sarah Jenkins</span>
</div>
<div class="flex items-center text-sm text-slate-400">
<span class="material-icons text-xs mr-3 text-primary/60">phone</span>
<span>+62 811 9876 5432</span>
</div>
<div class="flex items-center text-sm text-slate-400">
<span class="material-icons text-xs mr-3 text-primary/60">email</span>
<span>sarah@dairydelights.co</span>
</div>
</div>
<div class="pt-4 border-t border-primary/5 flex justify-between items-center text-xs text-slate-500 font-medium">
<div class="flex items-center">
<span class="text-slate-300">28 POs</span>
<span class="mx-2 text-primary/20">|</span>
<span class="text-slate-300">Rp 102.8M total</span>
</div>
<div class="text-[10px] uppercase opacity-60 italic">Last order: Feb 14</div>
</div>
</div>
<!-- Supplier Card 3 -->
<div class="bg-card-dark border border-primary/10 rounded-xl p-6 hover:border-primary/40 transition-all group">
<div class="flex justify-between items-start mb-4">
<div>
<h3 class="text-lg font-bold text-slate-100 group-hover:text-primary transition-colors">Yeast &amp; Co.</h3>
<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary mt-1 border border-primary/20">
                Ingredients
              </span>
</div>
<div class="flex items-center">
<span class="h-2 w-2 rounded-full bg-green-500 animate-pulse mr-2"></span>
<span class="text-[10px] uppercase tracking-wider text-green-500 font-bold">Active</span>
</div>
</div>
<div class="space-y-3 mb-6">
<div class="flex items-center text-sm text-slate-400">
<span class="material-icons text-xs mr-3 text-primary/60">person</span>
<span>Budi Santoso</span>
</div>
<div class="flex items-center text-sm text-slate-400">
<span class="material-icons text-xs mr-3 text-primary/60">phone</span>
<span>+62 21 555 1234</span>
</div>
<div class="flex items-center text-sm text-slate-400">
<span class="material-icons text-xs mr-3 text-primary/60">email</span>
<span>sales@yeastco.id</span>
</div>
</div>
<div class="pt-4 border-t border-primary/5 flex justify-between items-center text-xs text-slate-500 font-medium">
<div class="flex items-center">
<span class="text-slate-300">8 POs</span>
<span class="mx-2 text-primary/20">|</span>
<span class="text-slate-300">Rp 12.5M total</span>
</div>
<div class="text-[10px] uppercase opacity-60 italic">Last order: Jan 30</div>
</div>
</div>
<!-- Additional Cards for Visual Depth -->
<div class="bg-card-dark border border-primary/10 rounded-xl p-6 hover:border-primary/40 transition-all group opacity-60 grayscale hover:grayscale-0 hover:opacity-100">
<div class="flex justify-between items-start mb-4">
<div>
<h3 class="text-lg font-bold text-slate-100">Spice Route Imports</h3>
<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary mt-1 border border-primary/20">
                Specialty Spices
              </span>
</div>
<div class="flex items-center">
<span class="h-2 w-2 rounded-full bg-slate-600 mr-2"></span>
<span class="text-[10px] uppercase tracking-wider text-slate-500 font-bold">Idle</span>
</div>
</div>
<div class="space-y-3 mb-6">
<div class="flex items-center text-sm text-slate-400"><span class="material-icons text-xs mr-3 text-primary/60">person</span><span>Amir Khan</span></div>
<div class="flex items-center text-sm text-slate-400"><span class="material-icons text-xs mr-3 text-primary/60">phone</span><span>+62 813 0000 1111</span></div>
</div>
<div class="pt-4 border-t border-primary/5 flex justify-between items-center text-xs text-slate-500 font-medium">
<div class="flex items-center"><span class="text-slate-300">4 POs</span><span class="mx-2 text-primary/20">|</span><span class="text-slate-300">Rp 5.2M total</span></div>
<div class="text-[10px] uppercase opacity-60 italic">Last order: Dec 20</div>
</div>
</div>
</div>
</div>
<!-- Background Overlay for Side Panel -->
<div class="absolute inset-0 bg-background-dark/60 backdrop-blur-sm z-20 pointer-events-none opacity-100 transition-opacity"></div>
<!-- Side Panel: New Supplier Form -->
<aside class="absolute right-0 top-0 h-full w-[450px] bg-card-dark border-l border-primary/20 shadow-2xl z-30 transform translate-x-0 transition-transform flex flex-col">
<div class="p-6 border-b border-primary/10 flex items-center justify-between">
<h2 class="text-xl font-playfair text-slate-100">New Supplier</h2>
<button class="text-slate-400 hover:text-white transition-colors">
<span class="material-icons">close</span>
</button>
</div>
<form class="flex-1 overflow-y-auto custom-scrollbar p-8 space-y-8">
<!-- General Info Section -->
<section class="space-y-4">
<h3 class="text-xs uppercase tracking-widest text-primary font-bold">General Information</h3>
<div class="space-y-4">
<div>
<label class="block text-xs text-slate-400 mb-1">Company Name</label>
<input class="w-full bg-background-dark/50 border-primary/10 rounded-lg text-slate-100 focus:ring-primary focus:border-primary placeholder-slate-600" type="text" value="Golden Grain Co."/>
</div>
<div class="grid grid-cols-2 gap-4">
<div>
<label class="block text-xs text-slate-400 mb-1">Primary Contact</label>
<input class="w-full bg-background-dark/50 border-primary/10 rounded-lg text-slate-100 focus:ring-primary focus:border-primary" placeholder="Full name" type="text"/>
</div>
<div>
<label class="block text-xs text-slate-400 mb-1">Category</label>
<select class="w-full bg-background-dark/50 border-primary/10 rounded-lg text-slate-300 focus:ring-primary focus:border-primary">
<option>Flour &amp; Grains</option>
<option>Dairy &amp; Butter</option>
<option>Ingredients</option>
<option>Packaging</option>
</select>
</div>
</div>
</div>
</section>
<!-- Contact Details -->
<section class="space-y-4">
<h3 class="text-xs uppercase tracking-widest text-primary font-bold">Contact Details</h3>
<div class="space-y-4">
<div class="grid grid-cols-2 gap-4">
<div>
<label class="block text-xs text-slate-400 mb-1">Phone Number</label>
<input class="w-full bg-background-dark/50 border-primary/10 rounded-lg text-slate-100 focus:ring-primary focus:border-primary" placeholder="+62..." type="tel"/>
</div>
<div>
<label class="block text-xs text-slate-400 mb-1">Email Address</label>
<input class="w-full bg-background-dark/50 border-primary/10 rounded-lg text-slate-100 focus:ring-primary focus:border-primary" placeholder="email@vendor.com" type="email"/>
</div>
</div>
<div>
<label class="block text-xs text-slate-400 mb-1">Physical Address</label>
<textarea class="w-full bg-background-dark/50 border-primary/10 rounded-lg text-slate-100 focus:ring-primary focus:border-primary" placeholder="Street, Building, City..." rows="2"></textarea>
</div>
</div>
</section>
<!-- Financials Section -->
<section class="space-y-4">
<h3 class="text-xs uppercase tracking-widest text-primary font-bold">Financials &amp; Terms</h3>
<div class="space-y-4">
<div class="grid grid-cols-2 gap-4">
<div>
<label class="block text-xs text-slate-400 mb-1">Tax ID (NPWP)</label>
<input class="w-full bg-background-dark/50 border-primary/10 rounded-lg text-slate-100 focus:ring-primary focus:border-primary text-sm" placeholder="00.000.000.0-000.000" type="text"/>
</div>
<div>
<label class="block text-xs text-slate-400 mb-1">Payment Terms</label>
<select class="w-full bg-background-dark/50 border-primary/10 rounded-lg text-slate-300 focus:ring-primary focus:border-primary text-sm">
<option>NET 15</option>
<option selected="">NET 30</option>
<option>NET 60</option>
<option>Due on Receipt</option>
</select>
</div>
</div>
<div class="p-4 bg-background-dark/30 border border-primary/5 rounded-lg space-y-3">
<label class="block text-[10px] uppercase font-bold text-slate-500">Bank Details</label>
<div class="space-y-2">
<input class="w-full bg-transparent border-0 border-b border-primary/10 text-sm focus:ring-0 focus:border-primary text-slate-200 py-1" placeholder="Bank Name" type="text"/>
<input class="w-full bg-transparent border-0 border-b border-primary/10 text-sm focus:ring-0 focus:border-primary text-slate-200 py-1" placeholder="Account Number" type="text"/>
<input class="w-full bg-transparent border-0 border-b border-primary/10 text-sm focus:ring-0 focus:border-primary text-slate-200 py-1" placeholder="Account Holder Name" type="text"/>
</div>
</div>
</div>
</section>
</form>
<div class="p-6 border-t border-primary/10 bg-background-dark/50 flex flex-col space-y-3">
<button class="w-full bg-primary hover:bg-primary/90 text-background-dark font-bold py-3 rounded-lg transition-all shadow-xl shadow-primary/20">
          Save Supplier
        </button>
<button class="w-full border border-primary/20 text-slate-400 hover:text-slate-100 hover:border-primary/40 font-medium py-3 rounded-lg transition-all">
          Cancel
        </button>
</div>
</aside>
</main>
<!-- Notification Toast (Floating Bottom) -->
<div class="fixed bottom-8 left-1/2 transform -translate-x-1/2 flex items-center bg-card-dark border border-primary/40 px-6 py-3 rounded-full shadow-2xl z-50 animate-bounce">
<span class="material-icons text-primary mr-3">check_circle</span>
<p class="text-sm font-medium text-slate-200">System online: All supplier integrations active.</p>
</div>
</body></html>
      <!-- STITCH_HTML_END -->
    ` }} />
  );
};

export default Supplier_Management;
