import React from 'react';

const Patisserie_and_Modifiers: React.FC = () => {
    return (
        <div dangerouslySetInnerHTML={{
            __html: `
      <!-- STITCH_HTML_START -->
      <!DOCTYPE html>

<html class="dark" lang="en"><head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
<title>The Breakery Pâtisserie POS</title>
<script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&amp;display=swap" rel="stylesheet"/>
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
                        "onyx-panel": "#141416",
                        "onyx-border": "#262626",
                    },
                    fontFamily: {
                        "display": ["Inter", "sans-serif"]
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
</head>
<body class="font-display bg-background-light dark:bg-background-dark text-stone-200 antialiased overflow-hidden h-screen flex">
<!-- Left Column: Sidebar Navigation -->
<aside class="w-64 flex-shrink-0 bg-onyx-panel border-r border-onyx-border flex flex-col h-full">
<div class="p-8">
<h1 class="text-xl font-bold tracking-widest text-primary uppercase">The Breakery</h1>
<p class="text-[10px] text-stone-500 uppercase tracking-[0.2em] mt-1">Haute Pâtisserie</p>
</div>
<nav class="flex-1 px-4 space-y-2 mt-4">
<a class="flex items-center px-4 py-3 text-stone-400 hover:text-white transition-colors group" href="#">
<span class="material-icons mr-3 text-xl opacity-70 group-hover:opacity-100">bakery_dining</span>
<span class="text-sm font-medium tracking-wide">Boulangerie</span>
</a>
<a class="flex items-center px-4 py-3 text-stone-400 hover:text-white transition-colors group" href="#">
<span class="material-icons mr-3 text-xl opacity-70 group-hover:opacity-100">croissant</span>
<span class="text-sm font-medium tracking-wide">Viennoiserie</span>
</a>
<a class="flex items-center px-4 py-3 bg-primary text-white rounded-lg shadow-lg shadow-primary/10" href="#">
<span class="material-icons mr-3 text-xl">cake</span>
<span class="text-sm font-semibold tracking-wide">Pâtisserie</span>
</a>
<a class="flex items-center px-4 py-3 text-stone-400 hover:text-white transition-colors group" href="#">
<span class="material-icons mr-3 text-xl opacity-70 group-hover:opacity-100">coffee</span>
<span class="text-sm font-medium tracking-wide">Café</span>
</a>
<a class="flex items-center px-4 py-3 text-stone-400 hover:text-white transition-colors group" href="#">
<span class="material-icons mr-3 text-xl opacity-70 group-hover:opacity-100">restaurant</span>
<span class="text-sm font-medium tracking-wide">Savory</span>
</a>
</nav>
<div class="p-6 border-t border-onyx-border">
<div class="flex items-center space-x-3">
<div class="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center border border-primary/30">
<span class="text-xs font-bold text-primary tracking-tighter">JD</span>
</div>
<div>
<p class="text-xs font-semibold text-stone-300">Jean-Luc Dupont</p>
<p class="text-[10px] text-stone-500">Master Chef</p>
</div>
</div>
</div>
</aside>
<!-- Center Column: Product Grid & Active State Overlay -->
<main class="flex-1 overflow-y-auto relative bg-background-dark">
<header class="sticky top-0 z-10 bg-background-dark/80 backdrop-blur-md border-b border-onyx-border px-8 py-6 flex justify-between items-center">
<h2 class="text-2xl font-semibold tracking-tight">Pâtisserie Menu</h2>
<div class="relative">
<span class="material-icons absolute left-3 top-1/2 -translate-y-1/2 text-stone-500 text-lg">search</span>
<input class="bg-onyx-panel border border-onyx-border rounded-lg pl-10 pr-4 py-2 text-sm text-stone-300 focus:outline-none focus:border-primary/50 w-64 transition-all" placeholder="Search items..." type="text"/>
</div>
</header>
<div class="p-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
<!-- Product Item: Active State (Raspberry Mille-feuille) -->
<div class="group relative bg-onyx-panel border-2 border-primary rounded-xl overflow-hidden shadow-2xl shadow-primary/5">
<div class="h-48 overflow-hidden">
<img class="w-full h-full object-cover grayscale-[0.2] transition-transform duration-500 group-hover:scale-105" data-alt="Exquisite Raspberry Mille-feuille with cream layers" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBcDFEh9-pPXKryV1lwccEfPf9WwGI7aBl9k4YibMaj1_wjfy_ILr6B8SOZui0-T2q0srl6az-OpcmHj8zbObGGvU9vrci4NSCvV3vjyQFjDPo8E33ltDWveHJoyIq63luXGcQhjpH4BULOceQG6wZu1_9NGHtM2KC_1hwOn1mlIju_dI6aa9oYrWjOa-7fZZDsMzq46TUl_rem3AgvT5pgvyKshdI6TpYZHS8oYd1hChTCicOsXHBQ_vUk4IKlq5fzugCt9SYDals"/>
</div>
<div class="p-5">
<div class="flex justify-between items-start mb-2">
<h3 class="text-lg font-semibold text-stone-100">Raspberry Mille-feuille</h3>
<span class="text-primary font-bold">€12.50</span>
</div>
<p class="text-xs text-stone-500 leading-relaxed mb-4">Traditional caramelized puff pastry, Tahitian vanilla cream, fresh raspberries.</p>
<div class="flex items-center justify-between">
<span class="text-[10px] tracking-widest text-primary font-bold uppercase">Active selection</span>
<div class="w-2 h-2 rounded-full bg-primary animate-pulse"></div>
</div>
</div>
</div>
<!-- Other Product Items -->
<div class="group bg-onyx-panel border border-onyx-border rounded-xl overflow-hidden hover:border-stone-700 transition-all">
<div class="h-48 overflow-hidden">
<img class="w-full h-full object-cover grayscale opacity-80 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-500" data-alt="Elegant French Lemon Tart with meringue" src="https://lh3.googleusercontent.com/aida-public/AB6AXuB4MBeAQVbVhe1bVkLOkhEujP0VteYWQOIyNI9FHUn0JHPOwpUrAR0-5bXMM1wYQPV9xtuBiv0VPPdJ739BmoDBPlUEXFpqu0kTLdvvh4m5NnA22kT9j2FC5_0yjBG3r4q7k4-1LO683r8NDxZ1f0CIz7ZdyCnE2w0lQ-frAKUvlaRnok3KrtOapC4xCfNezLxSY_EwdoNpvs4p9ZvCITWB9iDidQkOFSuD2BGC8UaGRINMK0NDAN51XKYKf0gsYz5D5zIBlrnoUaE"/>
</div>
<div class="p-5">
<div class="flex justify-between items-start mb-2">
<h3 class="text-lg font-semibold text-stone-100">Lemon Meringue Tart</h3>
<span class="text-stone-400 font-bold">€9.50</span>
</div>
<p class="text-xs text-stone-500 leading-relaxed">Sicilian lemon curd, toasted Italian meringue, sable crust.</p>
</div>
</div>
<div class="group bg-onyx-panel border border-onyx-border rounded-xl overflow-hidden hover:border-stone-700 transition-all">
<div class="h-48 overflow-hidden">
<img class="w-full h-full object-cover grayscale opacity-80 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-500" data-alt="Classic French Opera Cake layers" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBJrhsAZOAotNpsCBblm7MmjT4s-WSEoUaaqQ-xYTjdL4v5FExkgbanYRRCZFv8rLx5yDdh1Zp8TVUlMA8x2Io4Thjsxji0CQsQYbmz28J5TXMXPjYBNnRptJRABdAj7v9c0k9jGyzU_LYXz7KLNHiNOKhX4sgBihXu_DWFjIrETbMmzhJodhiKwpDzPI-uDsWU1rGCeFsqo6uIB6BEcSE56Iuk5D6rToKQKeSwKsP03euNRPuQ_oDTtKfXlziEm9N5RMm3H17iQ1Q"/>
</div>
<div class="p-5">
<div class="flex justify-between items-start mb-2">
<h3 class="text-lg font-semibold text-stone-100">Opera Cake</h3>
<span class="text-stone-400 font-bold">€11.00</span>
</div>
<p class="text-xs text-stone-500 leading-relaxed">Almond sponge, coffee buttercream, dark chocolate ganache glaze.</p>
</div>
</div>
<div class="group bg-onyx-panel border border-onyx-border rounded-xl overflow-hidden hover:border-stone-700 transition-all">
<div class="h-48 overflow-hidden">
<img class="w-full h-full object-cover grayscale opacity-80 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-500" data-alt="Pistachio Eclair with green glaze" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCmyXZR01ez6v6y4JJlQthfh7r-FlgfzCMfKz4VHcLUDDU3HcRyqsjR7dZjm1MQtcqaVQrkiq5iRv74vNbxCQE2EbviGSjbJCrZKnuzvK8U7n6rCqyey89LSPfeEtyI5_oFY3bsbpco8K3FxQXKctUrnWlNWvsc4utweNvzx6Z8zBtm4hFi7s16EsAS7kEmOALYOAYTrJINePRAFZjkFlY08ZljLJYANWAYxvQ8TjprP52_gNdASkatQR2tzOhlRNZIGb08C30fgdo"/>
</div>
<div class="p-5">
<div class="flex justify-between items-start mb-2">
<h3 class="text-lg font-semibold text-stone-100">Pistachio Éclair</h3>
<span class="text-stone-400 font-bold">€8.50</span>
</div>
<p class="text-xs text-stone-500 leading-relaxed">Choux pastry, Bronte pistachio cream, candied nuts.</p>
</div>
</div>
</div>
<!-- Modifiers Overlay (Focused Selection) -->
<div class="absolute inset-x-0 bottom-0 top-[88px] bg-background-dark/95 backdrop-blur-sm z-20 p-8 flex items-center justify-center">
<div class="bg-onyx-panel border border-onyx-border w-full max-w-2xl rounded-xl shadow-2xl overflow-hidden flex flex-col md:flex-row h-auto max-h-[80vh]">
<div class="w-full md:w-5/12 h-64 md:h-auto">
<img class="w-full h-full object-cover" data-alt="Focus on Raspberry Mille-feuille details" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDjfryt_Cd6HFPu7yT0Q-2nNHSf7j97h-51YeGNTXPyZ3Cn7fkKBRySqYZyCAFj7MzzYG2eqK-ER2JkZ7ldXuh0LYAXpjEvseUvh8mMtZmaRzxOBA9BkYad2OGCwPJlLuTHTIA_3A-2Em0L9ouSFX9x-18URkBJhOy_KjazQdbiRNIQFiEkxxMcyN6bFQ1s-IoR9rX5654W2gmQ16BNYFTm9rXqF5sf7-ZUqsu0ydCI7AiXHn81WtMjCunacNdAfreO9Atk0RvjowY"/>
</div>
<div class="flex-1 p-8 overflow-y-auto">
<div class="flex justify-between items-start mb-6">
<div>
<h2 class="text-2xl font-bold text-stone-100">Raspberry Mille-feuille</h2>
<p class="text-stone-500 text-sm mt-1 italic">Personalize this selection</p>
</div>
<button class="text-stone-500 hover:text-white">
<span class="material-icons">close</span>
</button>
</div>
<div class="space-y-6">
<div>
<h4 class="text-[10px] font-bold text-primary uppercase tracking-[0.2em] mb-3">Service Options</h4>
<div class="grid grid-cols-1 gap-3">
<button class="flex items-center justify-between p-4 border border-primary bg-primary/5 rounded-lg text-left transition-all">
<div class="flex items-center">
<span class="material-icons text-primary mr-3">redeem</span>
<span class="text-sm font-medium text-stone-100">Gift Box Packaging</span>
</div>
<span class="text-xs font-semibold text-primary">+€2.00</span>
</button>
<button class="flex items-center justify-between p-4 border border-primary bg-primary/5 rounded-lg text-left transition-all">
<div class="flex items-center">
<span class="material-icons text-primary mr-3">edit_note</span>
<span class="text-sm font-medium text-stone-100">Handwritten Note</span>
</div>
<span class="text-xs font-semibold text-primary">+€1.50</span>
</button>
</div>
</div>
<div>
<h4 class="text-[10px] font-bold text-stone-500 uppercase tracking-[0.2em] mb-3">Premium Finishes</h4>
<div class="grid grid-cols-1 gap-3">
<button class="flex items-center justify-between p-4 border border-onyx-border hover:border-primary/50 rounded-lg text-left transition-all group">
<div class="flex items-center">
<span class="material-icons text-stone-600 group-hover:text-primary mr-3">auto_awesome</span>
<span class="text-sm font-medium text-stone-300">Add Gold Leaf (24k)</span>
</div>
<span class="text-xs font-semibold text-stone-500 group-hover:text-primary">+€3.00</span>
</button>
</div>
</div>
<div class="pt-4 border-t border-onyx-border flex gap-4">
<button class="flex-1 bg-primary hover:bg-primary/90 text-white font-bold py-4 rounded-lg transition-colors text-sm tracking-widest uppercase">
                                Update Cart — €16.00
                            </button>
</div>
</div>
</div>
</div>
</div>
</div>
</main>
<!-- Right Column: Active Cart -->
<aside class="w-96 flex-shrink-0 bg-onyx-panel border-l border-onyx-border flex flex-col h-full shadow-2xl">
<div class="p-8 border-b border-onyx-border">
<div class="flex justify-between items-center">
<h3 class="text-lg font-semibold">Active Order</h3>
<span class="bg-onyx-border text-stone-400 px-3 py-1 rounded-full text-[10px] font-bold">#4920</span>
</div>
</div>
<div class="flex-1 overflow-y-auto p-8 space-y-8">
<!-- Cart Item -->
<div class="relative">
<div class="flex justify-between items-start mb-2">
<div class="flex items-start">
<span class="text-primary font-bold mr-3 text-sm">1×</span>
<h4 class="text-sm font-semibold text-stone-100">Raspberry Mille-feuille</h4>
</div>
<span class="text-sm font-medium text-stone-300">€16.00</span>
</div>
<!-- Modifiers nested underneath -->
<ul class="ml-7 space-y-1.5 border-l border-onyx-border/50 pl-4 py-1">
<li class="flex justify-between text-[11px] text-stone-500 font-light">
<span>Gift Box Packaging</span>
<span>€2.00</span>
</li>
<li class="flex justify-between text-[11px] text-stone-500 font-light">
<span>Handwritten Note</span>
<span>€1.50</span>
</li>
</ul>
</div>
<!-- Example of other cart item (muted/no modifiers) -->
<div class="flex justify-between items-start">
<div class="flex items-start">
<span class="text-stone-600 font-bold mr-3 text-sm">2×</span>
<h4 class="text-sm font-semibold text-stone-100">Double Espresso</h4>
</div>
<span class="text-sm font-medium text-stone-300">€7.00</span>
</div>
</div>
<div class="p-8 bg-background-dark/50 border-t border-onyx-border">
<div class="space-y-3 mb-8">
<div class="flex justify-between text-xs text-stone-500">
<span>Subtotal</span>
<span>€23.00</span>
</div>
<div class="flex justify-between text-xs text-stone-500">
<span>VAT (10%)</span>
<span>€2.30</span>
</div>
<div class="flex justify-between text-lg font-bold text-stone-100 pt-2 border-t border-onyx-border">
<span>Total</span>
<span class="text-primary">€25.30</span>
</div>
</div>
<div class="grid grid-cols-2 gap-4">
<button class="py-4 rounded-lg border border-onyx-border text-xs font-bold uppercase tracking-widest text-stone-400 hover:text-white hover:border-stone-600 transition-all">
                    Split Bill
                </button>
<button class="py-4 rounded-lg bg-primary text-white text-xs font-bold uppercase tracking-widest shadow-lg shadow-primary/20 hover:scale-[1.02] transition-transform">
                    Checkout
                </button>
</div>
</div>
</aside>
</body></html>
    ` }} />
    );
};

export default Patisserie_and_Modifiers;
