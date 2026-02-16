import React from 'react';

const Combo_Management: React.FC = () => {
  return (
    <div dangerouslySetInnerHTML={{ __html: `
      <!-- STITCH_HTML_START -->
      <!DOCTYPE html>

<html class="dark" lang="en"><head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
<title>The Breakery Combo Management</title>
<script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&amp;family=Playfair+Display:wght@600;700&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<script id="tailwind-config">
        tailwind.config = {
            darkMode: "class",
            theme: {
                extend: {
                    colors: {
                        "primary": "#f2d00d",
                        "background-light": "#f8f8f5",
                        "background-dark": "#0D0D0F",
                        "surface": "#1A1A1D",
                        "card-hover": "#252529",
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
            background-color: #0D0D0F;
        }
        .custom-scrollbar::-webkit-scrollbar {
            width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
            background: #1A1A1D;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
            background: #333;
            border-radius: 10px;
        }
    </style>
</head>
<body class="font-display text-white bg-background-light dark:bg-background-dark min-h-screen">
<!-- Main Navigation Bar -->
<nav class="border-b border-primary/10 bg-surface/50 backdrop-blur-md sticky top-0 z-40">
<div class="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
<div class="flex items-center gap-3">
<div class="w-10 h-10 bg-primary flex items-center justify-center rounded-lg">
<span class="material-icons text-background-dark">bakery_dining</span>
</div>
<div>
<h1 class="font-serif text-xl tracking-wide">The Breakery</h1>
<p class="text-[10px] uppercase tracking-[0.2em] text-primary">Management Portal</p>
</div>
</div>
<div class="flex items-center gap-6">
<button class="text-white/60 hover:text-primary transition-colors">
<span class="material-icons">notifications</span>
</button>
<div class="h-10 w-10 rounded-full border border-primary/20 p-0.5">
<div class="w-full h-full rounded-full bg-primary/10 flex items-center justify-center overflow-hidden">
<img class="w-full h-full object-cover" data-alt="Administrator profile picture headshot" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCICkssBd5iLjD2I966ngZDQv6333P7JpEcx4TjO5QpyXqyBOB5g_Pe4k86-VpQAnjmxx1u53wNUq7ZxBD83che97wP2uPUq2ojmDQU-LWhe77LzDHDwTumZ5z8dkuQDZ9NU80QmFYeRDw6jjOhKscTHV8_OLLHtQ12wgazIN3kI7Fksv0Q62pSPkf6iu8YDyYAFxF3Tyt5kiYPxqt7cQtc8HRjdxQ_r75JHCFHE0DiQkl3R21TMct9kV7SvmsKsXN4jmu7FOsqDd9I"/>
</div>
</div>
</div>
</div>
</nav>
<!-- Dashboard Content -->
<main class="max-w-7xl mx-auto px-6 py-8">
<!-- Header Action Area -->
<div class="flex items-center justify-between mb-10">
<div class="flex items-center gap-4">
<div class="p-3 bg-primary/10 rounded-xl text-primary">
<span class="material-icons">layers</span>
</div>
<div>
<h2 class="font-serif text-3xl font-bold">Combo Meals</h2>
<p class="text-white/40 text-sm">Manage your premium bakery bundles and special offers</p>
</div>
</div>
<button class="bg-primary hover:bg-primary/90 text-background-dark font-semibold px-6 py-3 rounded-xl flex items-center gap-2 transition-all transform hover:scale-[1.02] active:scale-95 shadow-lg shadow-primary/20">
<span class="material-icons">add</span>
<span>New Combo</span>
</button>
</div>
<!-- Combo Grid -->
<div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
<!-- Card 1 (Breakfast Special) -->
<div class="group bg-surface border border-white/5 rounded-xl overflow-hidden hover:border-primary/30 transition-all duration-300 shadow-xl">
<div class="relative h-48 overflow-hidden">
<img class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" data-alt="Premium breakfast croissant and coffee bundle" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDoXgRHU3AUXPhpbIr9m8wmQa_pp6bI0gCNPm6OOEfDx5dO01zK-c2Te04viQ8MTcbOJDeXG8ib4z0uuQohAUdZDbyhBrtf4QxPpevCXR88JgItdnWt4fKzxSihiXGnTatq2ZnlKrEsLmAf0Oa6MSTGTyYZs546qJuDSNz2IRvby-HkZj3NES0FMJGe_UEIz-Axty0gKYPjTmFBjgPmK9xIeQWzXNNd9bTj1MA27LUJ_UUQ3FjNb5YBd_JNFT-taeYb2hQhs4gSrjDt"/>
<div class="absolute inset-0 bg-gradient-to-t from-surface to-transparent"></div>
<div class="absolute top-4 right-4">
<span class="bg-primary text-background-dark font-bold px-3 py-1 rounded-full text-xs shadow-lg">Save 21%</span>
</div>
</div>
<div class="p-6">
<div class="flex justify-between items-start mb-4">
<div>
<h3 class="text-xl font-bold mb-1">Breakfast Special</h3>
<div class="flex items-center gap-2 text-white/40 text-sm">
<span class="material-icons text-sm">trending_up</span>
<span>145 sold this month</span>
</div>
</div>
<div class="text-right">
<p class="text-primary text-xl font-bold">Rp 75.000</p>
<p class="text-white/30 text-sm line-through">Rp 95.000</p>
</div>
</div>
<div class="space-y-3 mb-6">
<div class="flex items-center gap-3 p-3 bg-white/5 rounded-lg border border-white/5">
<span class="material-icons text-primary text-sm">check_circle</span>
<span class="text-sm font-medium">1 Pastry + 1 Hot/Cold Drink</span>
</div>
<div class="flex items-center gap-3 p-3 bg-white/5 rounded-lg border border-white/5">
<span class="material-icons text-primary text-sm">check_circle</span>
<span class="text-sm font-medium">Available 07:00 - 11:00</span>
</div>
</div>
<div class="flex items-center justify-between pt-4 border-t border-white/5">
<div class="flex -space-x-2">
<div class="w-8 h-8 rounded-full border-2 border-surface bg-gray-500 overflow-hidden">
<img class="w-full h-full object-cover" data-alt="Close up of a buttery croissant" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBQRWQOnyy3uRKwvsrNCy5YEcw4li3LuD7zwuvcglAwcXBnTSAGHLqN_MIQ_CDkTR-1DQ2OhL0DrHI3NhOmc0H441sXetloSc5K9M1Lx53MSDiTu-PqqYCVlsnrZYfYXwAOcJ_y8_ZJTiuOMeQkQdJTra263RQaXWS-1rOHUTyw7R-rhOzg9ZDKS3mylVmj_5uRiHttQCOReOZNK9ODFInM5hW7c6AfsCZBF02ocSAUaL9uuHsZvWuSexfycoONZwjhFmF_4LkIhIMV"/>
</div>
<div class="w-8 h-8 rounded-full border-2 border-surface bg-gray-500 overflow-hidden text-[10px] flex items-center justify-center bg-primary text-background-dark font-bold">+8</div>
</div>
<button class="text-primary/80 hover:text-primary flex items-center gap-1 text-sm font-semibold transition-colors">
<span>Edit details</span>
<span class="material-icons text-sm">chevron_right</span>
</button>
</div>
</div>
</div>
<!-- Card 2 (Afternoon Tea) -->
<div class="group bg-surface border border-white/5 rounded-xl overflow-hidden hover:border-primary/30 transition-all duration-300 shadow-xl opacity-80">
<div class="relative h-48 overflow-hidden">
<img class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" data-alt="Afternoon tea set with assorted mini pastries" src="https://lh3.googleusercontent.com/aida-public/AB6AXuC8XMHRnngDBTVScEB67M3Tym5JgF88dZDQHMsU8tS_sZ5hOq3oyYoMC8hX67BqcGnGD1utkzlTKfi1JYMmUqcplyYoEOQfl1GlTxBYpU1xCPsG91r-0HlqP3bbXIzP_d4-McN3dCVrpM8T1JCXYbXHjCs4da1oifj1mp9wcs-lNga9CVC3pUXxpVJbsxB9xjttlKYQvSBK0SRl4OD7B07ZGcbGCKAVKG_OduewzHQWsFEomH_RmgUqHRlL8RqCCrdud9G5AniHSyRW"/>
<div class="absolute inset-0 bg-gradient-to-t from-surface to-transparent"></div>
<div class="absolute top-4 right-4">
<span class="bg-primary text-background-dark font-bold px-3 py-1 rounded-full text-xs shadow-lg">Save 15%</span>
</div>
</div>
<div class="p-6">
<div class="flex justify-between items-start mb-4">
<div>
<h3 class="text-xl font-bold mb-1">Afternoon Tea Bundle</h3>
<div class="flex items-center gap-2 text-white/40 text-sm">
<span class="material-icons text-sm">trending_up</span>
<span>82 sold this month</span>
</div>
</div>
<div class="text-right">
<p class="text-primary text-xl font-bold">Rp 120.000</p>
<p class="text-white/30 text-sm line-through">Rp 142.000</p>
</div>
</div>
<div class="space-y-3 mb-6">
<div class="flex items-center gap-3 p-3 bg-white/5 rounded-lg border border-white/5">
<span class="material-icons text-primary text-sm">check_circle</span>
<span class="text-sm font-medium">3 Scones + Pot of Earl Grey</span>
</div>
<div class="flex items-center gap-3 p-3 bg-white/5 rounded-lg border border-white/5">
<span class="material-icons text-primary text-sm">check_circle</span>
<span class="text-sm font-medium">Available 14:00 - 17:00</span>
</div>
</div>
<div class="flex items-center justify-between pt-4 border-t border-white/5">
<div class="flex -space-x-2">
<div class="w-8 h-8 rounded-full border-2 border-surface bg-gray-500 overflow-hidden">
<img class="w-full h-full object-cover" data-alt="Classic scones with jam and cream" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAbj8kIjMfTPZdBM8KjA8OkUr5f3B4Tx2UQtQFFVN5ndCNvc4-fJu41zgx0NdnJV3K3hA9kaX-7RDFXwQKCaUogxUp26Zt39d_VACtn3oMDeZzkZoMjyxb_WU_JS9I6YTU__KQvIw18GmpjEAnH4U5SUlXLkL36zyuhMTkwj5Mht5kYoA6Fxuohg2XV1oOBk7NyhnAsucX5JKgooTpH20FZF0GtmjL-uw7FFfzTmkBK_TzpVpUcqT0kT074frJpUj2UxhtVZf6T1cpZ"/>
</div>
<div class="w-8 h-8 rounded-full border-2 border-surface bg-gray-500 overflow-hidden text-[10px] flex items-center justify-center bg-primary text-background-dark font-bold">+4</div>
</div>
<button class="text-primary/80 hover:text-primary flex items-center gap-1 text-sm font-semibold transition-colors">
<span>Edit details</span>
<span class="material-icons text-sm">chevron_right</span>
</button>
</div>
</div>
</div>
</div>
</main>
<!-- Modal Overlay -->
<div class="fixed inset-0 z-50 flex items-center justify-center p-6 bg-background-dark/80 backdrop-blur-sm">
<div class="bg-surface w-full max-w-6xl rounded-2xl border border-white/10 shadow-2xl overflow-hidden flex flex-col md:flex-row max-h-[90vh]">
<!-- Left Side: Form -->
<div class="flex-1 p-8 overflow-y-auto custom-scrollbar">
<div class="flex items-center justify-between mb-8">
<h3 class="font-serif text-2xl font-bold">Edit 'Breakfast Special'</h3>
<button class="text-white/40 hover:text-white transition-colors">
<span class="material-icons">close</span>
</button>
</div>
<div class="space-y-8">
<!-- General Info Section -->
<section>
<h4 class="text-xs uppercase tracking-widest text-primary font-bold mb-4">General Information</h4>
<div class="grid grid-cols-2 gap-4">
<div class="col-span-2">
<label class="block text-xs text-white/50 mb-1 ml-1">Combo Name</label>
<input class="w-full bg-background-dark border-white/10 rounded-lg p-3 text-white focus:ring-primary focus:border-primary" type="text" value="Breakfast Special"/>
</div>
<div>
<label class="block text-xs text-white/50 mb-1 ml-1">Base Price (Rp)</label>
<input class="w-full bg-background-dark border-white/10 rounded-lg p-3 text-white focus:ring-primary focus:border-primary font-mono" type="text" value="75.000"/>
</div>
<div>
<label class="block text-xs text-white/50 mb-1 ml-1">Original Price (Rp)</label>
<input class="w-full bg-background-dark border-white/10 rounded-lg p-3 text-white/50 focus:ring-primary focus:border-primary font-mono" type="text" value="95.000"/>
</div>
</div>
</section>
<!-- Choice Groups Section -->
<section>
<div class="flex items-center justify-between mb-4">
<h4 class="text-xs uppercase tracking-widest text-primary font-bold">Choice Groups</h4>
<button class="text-xs flex items-center gap-1 text-white/60 hover:text-primary transition-colors">
<span class="material-icons text-xs">add_circle</span>
<span>Add Group</span>
</button>
</div>
<div class="space-y-4">
<!-- Group 1 -->
<div class="p-4 bg-background-dark border border-white/5 rounded-xl">
<div class="flex items-center justify-between mb-3">
<div class="flex items-center gap-2">
<span class="material-icons text-white/30 cursor-move">drag_indicator</span>
<span class="font-semibold">Select Pastry</span>
<span class="bg-white/10 px-2 py-0.5 rounded text-[10px] text-white/50 uppercase">Mandatory</span>
</div>
<button class="text-red-400/60 hover:text-red-400">
<span class="material-icons text-sm">delete</span>
</button>
</div>
<div class="space-y-2">
<!-- Item 1 -->
<div class="flex items-center justify-between p-2 bg-white/5 rounded-lg border border-white/5">
<div class="flex items-center gap-3">
<div class="w-10 h-10 rounded bg-gray-700 overflow-hidden">
<img class="w-full h-full object-cover" data-alt="Fresh pain au chocolat pastry" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCtYaXWwYfciFeTg7DNl7kb5xqN_CY9my0c6OZYsfhgU2DdrUARPdIYmWW9cnPBkAUQvcptTq7c2500yubx3cKpnevgC7o160DPNpfUWz_wqUZT5Lh8nqVQLz7CJzFDVSP7SBzUECfMqn7TBjZiacyKdx3W1mcGAsqKbHB6DiJpL6OrLusE9928uGnbadrL88FWW3TKBZTx5wbY6AfgqpeWF2-w3O5KdcKrBD3RDfBB9kpDIlqbP4EeJttbzlglBNC_k4O8CkjEAomn"/>
</div>
<span class="text-sm">Pain au Chocolat</span>
</div>
<div class="flex items-center gap-4">
<span class="text-xs text-primary font-bold">+Rp 5.000</span>
<span class="material-icons text-white/20 text-sm">edit</span>
</div>
</div>
<!-- Item 2 -->
<div class="flex items-center justify-between p-2 bg-white/5 rounded-lg border border-white/5">
<div class="flex items-center gap-3">
<div class="w-10 h-10 rounded bg-gray-700 overflow-hidden">
<img class="w-full h-full object-cover" data-alt="Golden almond croissant pastry" src="https://lh3.googleusercontent.com/aida-public/AB6AXuD01fboijH-9EmeG9_a2v8Oa8BSBT4KZHWNnGSIARrReFNhpRCZAmoj8jkGxG2BNDm-fYa-nMyaux6uaj-ZLBsTrIXLF5MJtwK3S-68_HUYfmfWmgdo6MEJ-F5BcYy-1W-Z4nkOL2z2ivb7B6WqkfxJgdni6iLNKzB3cKlvHJ3uCQBBHlFnZuAUnRSvY0wqcheRlv9GTQCyiXQikpU7P-ZXGQ2KC91vU6fGBtqBgtpuXZMlZCe0RtUPnbnrO8gpOS4-4-bZRqWf7hwJ"/>
</div>
<span class="text-sm">Almond Croissant</span>
</div>
<div class="flex items-center gap-4">
<span class="text-xs text-white/30 font-bold">+Rp 0</span>
<span class="material-icons text-white/20 text-sm">edit</span>
</div>
</div>
<button class="w-full py-2 border border-dashed border-white/10 rounded-lg text-xs text-white/40 hover:text-primary hover:border-primary/40 transition-all mt-2">
                                        + Add item to choice group
                                    </button>
</div>
</div>
</div>
</section>
</div>
<div class="mt-10 flex gap-4">
<button class="flex-1 bg-primary text-background-dark font-bold py-4 rounded-xl shadow-lg shadow-primary/20 hover:scale-[1.01] transition-transform">
                        Save Combo Changes
                    </button>
<button class="px-8 border border-white/10 rounded-xl hover:bg-white/5 transition-colors text-white/60">
                        Archive
                    </button>
</div>
</div>
<!-- Right Side: POS Preview -->
<div class="w-full md:w-96 bg-background-dark/50 border-l border-white/10 p-8 flex flex-col">
<div class="mb-6">
<h4 class="text-xs uppercase tracking-widest text-white/40 font-bold mb-4">POS Visual Preview</h4>
<div class="bg-surface rounded-2xl border border-primary/20 p-5 shadow-2xl relative overflow-hidden group">
<!-- Preview Card -->
<div class="aspect-video rounded-xl overflow-hidden mb-4 relative">
<img class="w-full h-full object-cover" data-alt="Visual preview of the breakfast combo" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAosIi6C67w7KhsyE9IJ-Iyv5zDglpvyXrbdRqzZCu-4SVxt3hbeMR2IxuU-X5HyGOjmxHdKhr9coz9DOjB25H6Z6vS2n0UEuq7IpeLWKscyfazgZEuk1N-KchVzUgRIrTmzqTzuvWhltBYbz6YKI5fNUxIfMFhuYd5udOrY6_iQYqptvJVei9cVNEnIvULLKplpVKh3K5QVGNJyV08oJG1oaZprwB-9LCwQesWC6K7SD0fmlNOX9MdHr7osDfe25gQ7yWzX9vEcdbo"/>
<div class="absolute inset-0 bg-gradient-to-t from-surface/80 via-transparent to-transparent"></div>
<div class="absolute bottom-2 left-3 right-3 flex justify-between items-end">
<span class="bg-primary/90 text-background-dark text-[10px] font-bold px-2 py-0.5 rounded-full">LIVE PREVIEW</span>
</div>
</div>
<div class="space-y-2">
<div class="flex justify-between items-start">
<h5 class="font-bold text-lg">Breakfast Special</h5>
<p class="text-primary font-bold">Rp 75k</p>
</div>
<div class="space-y-1">
<p class="text-[10px] text-white/50 leading-relaxed">
                                    A morning delight featuring your choice of freshly baked artisanal pastry and a barista-crafted beverage.
                                </p>
</div>
<div class="pt-3 flex gap-2">
<div class="h-1 flex-1 bg-primary rounded-full"></div>
<div class="h-1 flex-1 bg-white/10 rounded-full"></div>
<div class="h-1 flex-1 bg-white/10 rounded-full"></div>
</div>
</div>
</div>
</div>
<div class="mt-auto">
<div class="p-4 bg-primary/5 rounded-xl border border-primary/10">
<div class="flex items-center gap-2 text-primary mb-1">
<span class="material-icons text-sm">info</span>
<span class="text-xs font-bold uppercase">Pro Tip</span>
</div>
<p class="text-xs text-white/60 leading-relaxed">
                            Adding price modifiers to premium items within choice groups can increase your average order value by up to 12%.
                        </p>
</div>
</div>
</div>
</div>
</div>
</body></html>
      <!-- STITCH_HTML_END -->
    ` }} />
  );
};

export default Combo_Management;
