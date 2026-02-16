import React from 'react';

const Supplier_Management_and_Contact: React.FC = () => {
  return (
    <div dangerouslySetInnerHTML={{ __html: `
      <!-- STITCH_HTML_START -->
      <!DOCTYPE html>

<html class="dark" lang="en"><head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
<title>The Breakery | Supplier Management</title>
<script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/icon?family=Material+Icons+Round" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<script id="tailwind-config">
        tailwind.config = {
          darkMode: "class",
          theme: {
            extend: {
              colors: {
                "primary": "#c8a45b",
                "background-light": "#f8f7f6",
                "background-dark": "#0d0d0f",
                "stone": "#e5e7eb",
                "onyx-light": "#1e1b14",
                "muted-smoke": "#9ca3af"
              },
              fontFamily: {
                "display": ["Inter", "sans-serif"]
              },
              borderRadius: {"DEFAULT": "0.25rem", "lg": "0.5rem", "xl": "0.75rem", "full": "9999px"},
            },
          },
        }
    </script>
<style>
        body {
            font-family: 'Inter', sans-serif;
        }
        .custom-scrollbar::-webkit-scrollbar {
            width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
            background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
            background: #2d2a24;
            border-radius: 10px;
        }
    </style>
</head>
<body class="bg-background-light dark:bg-background-dark text-stone font-display h-screen overflow-hidden flex">
<!-- Sidebar -->
<aside class="w-20 lg:w-64 border-r border-primary/10 flex flex-col items-center lg:items-stretch bg-background-light dark:bg-background-dark">
<div class="p-6 flex items-center gap-3">
<div class="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
<span class="material-icons-round text-white">bakery_dining</span>
</div>
<span class="hidden lg:block text-xl font-bold tracking-tight text-primary">The Breakery</span>
</div>
<nav class="flex-1 px-4 space-y-2 mt-4">
<a class="flex items-center gap-4 px-4 py-3 rounded-xl hover:bg-primary/10 transition-colors group" href="#">
<span class="material-icons-round text-muted-smoke group-hover:text-primary">dashboard</span>
<span class="hidden lg:block font-medium">Dashboard</span>
</a>
<a class="flex items-center gap-4 px-4 py-3 rounded-xl bg-primary/10 text-primary border-l-4 border-primary" href="#">
<span class="material-icons-round">inventory_2</span>
<span class="hidden lg:block font-medium">Suppliers</span>
</a>
<a class="flex items-center gap-4 px-4 py-3 rounded-xl hover:bg-primary/10 transition-colors group" href="#">
<span class="material-icons-round text-muted-smoke group-hover:text-primary">shopping_basket</span>
<span class="hidden lg:block font-medium">Inventory</span>
</a>
<a class="flex items-center gap-4 px-4 py-3 rounded-xl hover:bg-primary/10 transition-colors group" href="#">
<span class="material-icons-round text-muted-smoke group-hover:text-primary">receipt_long</span>
<span class="hidden lg:block font-medium">Orders</span>
</a>
<a class="flex items-center gap-4 px-4 py-3 rounded-xl hover:bg-primary/10 transition-colors group" href="#">
<span class="material-icons-round text-muted-smoke group-hover:text-primary">analytics</span>
<span class="hidden lg:block font-medium">Analytics</span>
</a>
</nav>
<div class="p-6 border-t border-primary/10">
<div class="flex items-center gap-3">
<img class="w-10 h-10 rounded-full object-cover grayscale" data-alt="Profile picture of bakery manager" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAAiWewsQnMnsTU2RUA2Ko6r2QCQvMgukcDrAvyqIXN4O8kvl-NquK-U3CqDbNZfFyqIEgwMaLuIuSAEYI16VR_DXtO_mmzJ5hXz4dlSzEwsq7wzHBwayIlY0Ia_xxADPpmCe79-Qa8NLMfyR9A-l4RSo-tqjOlWkPhXLWVhKjpfV_Tz2MKktg7lZl_1WPd3ucUJiLMsD_RsOuu_AEL2mLqAVjHIsLMo5uEthSKe2aQBCVVV19SHjp8p2zk-K9b4uGMYVjOPdoMDN0"/>
<div class="hidden lg:block overflow-hidden">
<p class="text-sm font-semibold truncate">Jean-Luc Morel</p>
<p class="text-xs text-muted-smoke">Manager</p>
</div>
</div>
</div>
</aside>
<!-- Main Content -->
<main class="flex-1 flex flex-col min-w-0 bg-background-light dark:bg-background-dark">
<!-- Top Bar -->
<header class="h-20 border-b border-primary/10 flex items-center justify-between px-8 shrink-0">
<div class="flex-1 max-w-2xl relative">
<span class="material-icons-round absolute left-4 top-1/2 -translate-y-1/2 text-muted-smoke">search</span>
<input class="w-full bg-onyx-light/50 border border-primary/20 rounded-xl py-2.5 pl-12 pr-4 focus:outline-none focus:border-primary text-stone placeholder-muted-smoke transition-all" placeholder="Search suppliers, categories, or contact person..." type="text"/>
</div>
<button class="ml-6 bg-primary hover:bg-primary/90 text-white font-semibold px-6 py-2.5 rounded-xl flex items-center gap-2 transition-all transform active:scale-95 shadow-lg shadow-primary/20">
<span class="material-icons-round text-sm">add</span>
                Add New Supplier
            </button>
</header>
<!-- Viewport Area -->
<div class="flex-1 flex overflow-hidden">
<!-- Supplier List (Left Column) -->
<section class="w-[400px] border-r border-primary/10 flex flex-col bg-onyx-light/20">
<div class="p-6 border-b border-primary/5 flex items-center justify-between">
<h2 class="text-lg font-semibold tracking-tight">Active Suppliers <span class="text-primary ml-2 text-sm font-normal">(12)</span></h2>
<button class="material-icons-round text-muted-smoke hover:text-stone transition-colors">filter_list</button>
</div>
<div class="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-3">
<!-- Supplier Card: Active -->
<div class="p-4 rounded-xl border border-primary bg-primary/5 cursor-pointer relative transition-all group">
<div class="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-12 bg-primary rounded-r-full"></div>
<div class="flex justify-between items-start mb-2">
<h3 class="font-bold text-stone">Moulin de Provence</h3>
<span class="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded border border-primary/30 text-primary bg-primary/10">Flour</span>
</div>
<p class="text-sm text-muted-smoke mb-4">Marcelle Desaulniers</p>
<div class="flex items-center justify-between text-xs">
<span class="flex items-center gap-1 text-muted-smoke italic">
<span class="material-icons-round text-[14px]">event</span>
                                Last: Oct 12, 2023
                            </span>
<span class="text-primary font-medium">View details</span>
</div>
</div>
<!-- Supplier Card: Regular -->
<div class="p-4 rounded-xl border border-primary/10 bg-onyx-light/30 hover:border-primary/40 cursor-pointer transition-all">
<div class="flex justify-between items-start mb-2">
<h3 class="font-bold text-stone">Laiterie Artisanale</h3>
<span class="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded border border-stone/20 text-muted-smoke">Dairy</span>
</div>
<p class="text-sm text-muted-smoke mb-4">Sébastien Roche</p>
<div class="flex items-center justify-between text-xs">
<span class="flex items-center gap-1 text-muted-smoke italic">
<span class="material-icons-round text-[14px]">event</span>
                                Last: Oct 15, 2023
                            </span>
</div>
</div>
<!-- Supplier Card: Regular -->
<div class="p-4 rounded-xl border border-primary/10 bg-onyx-light/30 hover:border-primary/40 cursor-pointer transition-all">
<div class="flex justify-between items-start mb-2">
<h3 class="font-bold text-stone">Fruits de Verger</h3>
<span class="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded border border-stone/20 text-muted-smoke">Produce</span>
</div>
<p class="text-sm text-muted-smoke mb-4">Elodie Blanc</p>
<div class="flex items-center justify-between text-xs">
<span class="flex items-center gap-1 text-muted-smoke italic">
<span class="material-icons-round text-[14px]">event</span>
                                Last: Oct 18, 2023
                            </span>
</div>
</div>
<!-- Supplier Card: Regular -->
<div class="p-4 rounded-xl border border-primary/10 bg-onyx-light/30 hover:border-primary/40 cursor-pointer transition-all">
<div class="flex justify-between items-start mb-2">
<h3 class="font-bold text-stone">Épices du Monde</h3>
<span class="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded border border-stone/20 text-muted-smoke">Spices</span>
</div>
<p class="text-sm text-muted-smoke mb-4">Arnaud Dubois</p>
<div class="flex items-center justify-between text-xs">
<span class="flex items-center gap-1 text-muted-smoke italic">
<span class="material-icons-round text-[14px]">event</span>
                                Last: Sep 30, 2023
                            </span>
</div>
</div>
</div>
</section>
<!-- Expanded Contact Panel (Right Column) -->
<section class="flex-1 flex flex-col bg-background-light dark:bg-background-dark overflow-y-auto custom-scrollbar">
<div class="p-8 max-w-4xl mx-auto w-full">
<!-- Header Info -->
<div class="flex items-start justify-between mb-10">
<div class="flex gap-6 items-center">
<div class="w-24 h-24 bg-onyx-light rounded-2xl flex items-center justify-center border border-primary/20">
<img class="w-20 h-20 object-cover rounded-xl opacity-80" data-alt="Grain silo at a rustic flour mill" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDdnQoPyy7KO5kL2zJyf_o30glVjpxhJaXzP9PJWgJS7u_bV1yExii2v_qRawr2IL9iJXtVxl9fc0X7brhjcMQ9Y-zc0FH1YQviHsUKL-5Zc6SxaHdTx_DPqjj_bKHNalKbtMjJF04QlNUwkb4ZkemJnzpV1ZrvS9f7t0RwxvZvtc0Vm7Ai36S60DwLXkmQZ-_ly3Rw_YjcFzH5uBqUQKFC30gZR4-8KZbkN-vBmNl7vtPVHlgrCssWP4v7cexYLZWbuU1eZREKRwk"/>
</div>
<div>
<h1 class="text-4xl font-bold text-stone tracking-tight mb-2">Moulin de Provence</h1>
<p class="text-primary font-medium flex items-center gap-2">
<span class="material-icons-round text-sm">verified</span>
                                    Preferred Artisanal Supplier
                                </p>
</div>
</div>
<div class="flex gap-2">
<button class="p-2.5 rounded-xl border border-primary/20 hover:bg-onyx-light transition-all">
<span class="material-icons-round">edit</span>
</button>
<button class="p-2.5 rounded-xl border border-primary/20 hover:bg-onyx-light transition-all">
<span class="material-icons-round text-red-400">delete_outline</span>
</button>
</div>
</div>
<div class="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
<!-- Contact Info Card -->
<div class="bg-onyx-light/30 p-6 rounded-2xl border border-primary/10">
<h3 class="text-xs font-bold uppercase tracking-widest text-primary/60 mb-6">Contact Details</h3>
<div class="space-y-6">
<div class="flex items-center gap-4">
<div class="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
<span class="material-icons-round">person</span>
</div>
<div>
<p class="text-xs text-muted-smoke">Primary Contact</p>
<p class="font-medium">Marcelle Desaulniers</p>
</div>
</div>
<div class="flex items-center gap-4">
<div class="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
<span class="material-icons-round">phone</span>
</div>
<div>
<p class="text-xs text-muted-smoke">Phone Number</p>
<p class="font-medium">+33 4 90 12 34 56</p>
</div>
</div>
<div class="flex items-center gap-4">
<div class="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
<span class="material-icons-round">alternate_email</span>
</div>
<div>
<p class="text-xs text-muted-smoke">Email Address</p>
<p class="font-medium">contact@moulindeprovence.fr</p>
</div>
</div>
</div>
</div>
<!-- Logistics Card -->
<div class="bg-onyx-light/30 p-6 rounded-2xl border border-primary/10">
<h3 class="text-xs font-bold uppercase tracking-widest text-primary/60 mb-6">Logistics &amp; Supply</h3>
<div class="space-y-6">
<div class="flex items-center gap-4">
<div class="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
<span class="material-icons-round">local_shipping</span>
</div>
<div>
<p class="text-xs text-muted-smoke">Delivery Schedule</p>
<p class="font-medium">Tue, Thu (06:00 AM)</p>
</div>
</div>
<div class="flex items-center gap-4">
<div class="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
<span class="material-icons-round">place</span>
</div>
<div>
<p class="text-xs text-muted-smoke">Origin</p>
<p class="font-medium">Avignon, Provence-Alpes-Côte d'Azur</p>
</div>
</div>
<div class="flex items-center gap-4">
<div class="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
<span class="material-icons-round">payments</span>
</div>
<div>
<p class="text-xs text-muted-smoke">Payment Terms</p>
<p class="font-medium">Net 30 Days</p>
</div>
</div>
</div>
</div>
</div>
<!-- Quick Email Communication -->
<div class="bg-onyx-light/50 p-8 rounded-2xl border border-primary/20 mb-10">
<div class="flex items-center gap-3 mb-6">
<span class="material-icons-round text-primary">mail</span>
<h3 class="text-xl font-bold tracking-tight">Quick Email</h3>
</div>
<div class="relative">
<textarea class="w-full bg-background-dark border border-primary/10 rounded-xl p-4 focus:outline-none focus:border-primary text-stone placeholder-muted-smoke/50 resize-none" placeholder="Draft a quick message or inquiry to Moulin de Provence..." rows="4"></textarea>
<div class="absolute bottom-4 right-4 flex gap-3">
<button class="bg-primary text-white px-5 py-2 rounded-lg font-medium hover:bg-primary/90 transition-all flex items-center gap-2">
                                    Send Message
                                    <span class="material-icons-round text-sm">send</span>
</button>
</div>
</div>
</div>
<!-- Footer Actions -->
<div class="flex flex-col sm:flex-row gap-4">
<button class="flex-1 border-2 border-primary text-primary hover:bg-primary/10 font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-3">
<span class="material-icons-round">history</span>
                            Order History with Supplier
                        </button>
<button class="flex-1 bg-primary text-white font-bold py-4 rounded-xl hover:bg-primary/90 transition-all flex items-center justify-center gap-3 shadow-xl shadow-primary/10">
<span class="material-icons-round">add_shopping_cart</span>
                            Place New Order
                        </button>
</div>
<!-- Recent Activity Section -->
<div class="mt-16 border-t border-primary/10 pt-10">
<h3 class="text-lg font-bold mb-6">Recent Transactions</h3>
<div class="space-y-4">
<div class="flex items-center justify-between p-4 bg-onyx-light/20 rounded-xl border border-transparent hover:border-primary/20 transition-all">
<div class="flex items-center gap-4">
<div class="w-10 h-10 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center">
<span class="material-icons-round">check_circle</span>
</div>
<div>
<p class="font-medium">PO-98231 - 500kg T55 Flour</p>
<p class="text-xs text-muted-smoke italic">Oct 12, 2023</p>
</div>
</div>
<p class="font-bold text-stone">€1,240.00</p>
</div>
<div class="flex items-center justify-between p-4 bg-onyx-light/20 rounded-xl border border-transparent hover:border-primary/20 transition-all">
<div class="flex items-center gap-4">
<div class="w-10 h-10 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center">
<span class="material-icons-round">check_circle</span>
</div>
<div>
<p class="font-medium">PO-97504 - 200kg Rye Flour</p>
<p class="text-xs text-muted-smoke italic">Sep 28, 2023</p>
</div>
</div>
<p class="font-bold text-stone">€640.00</p>
</div>
</div>
</div>
</div>
</section>
</div>
</main>
</body></html>
      <!-- STITCH_HTML_END -->
    ` }} />
  );
};

export default Supplier_Management_and_Contact;
