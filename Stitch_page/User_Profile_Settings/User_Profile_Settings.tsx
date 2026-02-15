import React from 'react';

const User_Profile_Settings: React.FC = () => {
  return (
    <div dangerouslySetInnerHTML={{ __html: \
      <!-- STITCH_HTML_START -->
      <!DOCTYPE html>

<html class="dark" lang="en"><head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
<script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&amp;family=Playfair+Display:wght@400;600;700&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<script id="tailwind-config">
        tailwind.config = {
            darkMode: "class",
            theme: {
                extend: {
                    colors: {
                        "primary": "#e6a219",
                        "background-light": "#f8f7f6",
                        "background-dark": "#0D0D0F",
                        "surface-dark": "#111113",
                        "card-dark": "#1A1A1D",
                        "accent-taupe": "#8D867A",
                    },
                    fontFamily: {
                        "display": ["Inter", "sans-serif"],
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
<title>The Breakery | User Profile Settings</title>
<style>
        body {
            font-family: 'Inter', sans-serif;
            background-color: #0D0D0F;
        }
        .header-title {
            font-family: 'Playfair Display', serif;
        }
        /* Custom Scrollbar for modern feel */
        ::-webkit-scrollbar {
            width: 6px;
        }
        ::-webkit-scrollbar-track {
            background: #0D0D0F;
        }
        ::-webkit-scrollbar-thumb {
            background: #333;
            border-radius: 10px;
        }
        ::-webkit-scrollbar-thumb:hover {
            background: #444;
        }
    </style>
</head>
<body class="bg-background-light dark:bg-background-dark text-white font-display overflow-hidden">
<div class="flex h-screen w-full">
<!-- Sidebar Navigation -->
<aside class="w-[260px] bg-surface-dark border-r border-white/5 flex flex-col shrink-0">
<div class="p-8">
<div class="flex items-center gap-3">
<div class="w-8 h-8 bg-primary rounded flex items-center justify-center">
<span class="material-icons text-background-dark text-lg">bakery_dining</span>
</div>
<span class="font-serif text-xl tracking-tight uppercase font-semibold">The Breakery</span>
</div>
</div>
<nav class="flex-1 px-4 space-y-2">
<a class="flex items-center gap-3 px-4 py-3 rounded-lg text-accent-taupe hover:bg-white/5 transition-colors" href="#">
<span class="material-icons">dashboard</span>
<span class="font-medium">Dashboard</span>
</a>
<a class="flex items-center gap-3 px-4 py-3 rounded-lg text-accent-taupe hover:bg-white/5 transition-colors" href="#">
<span class="material-icons">point_of_sale</span>
<span class="font-medium">POS Terminal</span>
</a>
<a class="flex items-center gap-3 px-4 py-3 rounded-lg text-accent-taupe hover:bg-white/5 transition-colors" href="#">
<span class="material-icons">inventory_2</span>
<span class="font-medium">Inventory Control</span>
</a>
<a class="flex items-center gap-3 px-4 py-3 rounded-lg text-accent-taupe hover:bg-white/5 transition-colors" href="#">
<span class="material-icons">schedule</span>
<span class="font-medium">Staff Schedule</span>
</a>
<div class="pt-6 pb-2 px-4 text-[10px] uppercase tracking-widest text-white/30 font-bold">Account</div>
<a class="flex items-center gap-3 px-4 py-3 rounded-lg bg-primary/10 text-primary transition-colors border border-primary/20" href="#">
<span class="material-icons">person_outline</span>
<span class="font-medium">My Profile</span>
</a>
<a class="flex items-center gap-3 px-4 py-3 rounded-lg text-accent-taupe hover:bg-white/5 transition-colors" href="#">
<span class="material-icons">settings</span>
<span class="font-medium">System Preferences</span>
</a>
</nav>
<div class="p-6 border-t border-white/5">
<div class="bg-white/5 rounded-xl p-4 flex items-center gap-3">
<div class="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center border border-primary/40">
<img class="w-full h-full rounded-full object-cover" data-alt="Close up of a professional pastry chef portrait" src="https://lh3.googleusercontent.com/aida-public/AB6AXuD71_XBrnJKDUeEcNpCB59Z1w7DYJOtzenHzSDJByf1d8JdZTto2BXmQYuZmMLYVmyahSApgAoqmIyTDocWCuUpnfFbusN5VcokEDzL9VhG0geS-kymScJ0XasFbZA3yovcmQezizf2y5agQEWxu8vGJAU_Yd5PZLH1DABMyxNk0YOzSY9K5ARyo2WB8ipBzLTL3ye2F5uDvSiHvTlswQqZc_M5rSWWzuUJkEjf9ArMPCuo4JSKqg6O9sqr6au4X9LPaIbC7-gEzi5a"/>
</div>
<div>
<p class="text-sm font-semibold">Sarah Jenkins</p>
<p class="text-[11px] text-accent-taupe uppercase tracking-wider">Head Pastry Chef</p>
</div>
</div>
</div>
</aside>
<!-- Main Content Area -->
<main class="flex-1 flex flex-col overflow-y-auto bg-background-light dark:bg-background-dark relative">
<!-- Header -->
<header class="sticky top-0 z-10 bg-background-dark/80 backdrop-blur-md px-10 py-8 flex justify-between items-center border-b border-white/5">
<h1 class="header-title text-3xl font-semibold">My Profile</h1>
<div class="flex items-center gap-4">
<button class="w-10 h-10 rounded-full flex items-center justify-center bg-white/5 hover:bg-white/10 transition-all text-white/70">
<span class="material-icons text-xl">notifications</span>
</button>
<button class="w-10 h-10 rounded-full flex items-center justify-center bg-white/5 hover:bg-white/10 transition-all text-white/70">
<span class="material-icons text-xl">search</span>
</button>
</div>
</header>
<div class="max-w-5xl w-full mx-auto px-10 py-10 space-y-10">
<!-- Section: Personal Information -->
<section class="grid grid-cols-1 md:grid-cols-3 gap-8">
<div class="md:col-span-1">
<h2 class="text-xl font-serif mb-2">User Information</h2>
<p class="text-accent-taupe text-sm leading-relaxed">Update your professional details and how your profile appears to other staff members across the system.</p>
</div>
<div class="md:col-span-2">
<div class="bg-card-dark rounded-xl border border-white/5 p-8 shadow-2xl">
<div class="flex flex-col md:flex-row items-center gap-8 mb-8">
<div class="relative group">
<div class="w-32 h-32 rounded-full border-2 border-primary p-1">
<div class="w-full h-full rounded-full overflow-hidden relative">
<img class="w-full h-full object-cover grayscale-[20%] group-hover:scale-110 transition-transform duration-500" data-alt="Portrait of Sarah Jenkins Head Pastry Chef" src="https://lh3.googleusercontent.com/aida-public/AB6AXuB7ZrxoLkqEoXj4pj0Rkwpu2epZ4JvUwE6QL6reIliRO2EIJ-DhHr8rTJIbdZwGCG00wZohOE1Cnc7pWcXbi_8_Sm1d4X4unZhHZHv2j3X4-O6yBdb4Gc99EgTWQesdkdY7vcIV02R5m7n2ZvwYcfAM5IphqdXMwoNpjJ2Z4QNZHF1y4Su_bnVOIHgh7Z1_nlTyklPeSxPzUkgKsRgr3o0RnmIZr4MBOqxeG8lMtYE4tgEgkTSNmrlSZLdlbXCMwkI23w49Xl0_AG9o"/>
<div class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity cursor-pointer">
<span class="material-icons text-white text-2xl">camera_alt</span>
</div>
</div>
</div>
<button class="absolute bottom-1 right-1 w-8 h-8 bg-primary rounded-full flex items-center justify-center text-background-dark shadow-lg">
<span class="material-icons text-sm">edit</span>
</button>
</div>
<div class="flex-1 w-full space-y-4">
<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
<div>
<label class="block text-[11px] uppercase tracking-widest text-accent-taupe mb-2 font-bold">Display Name</label>
<input class="w-full bg-background-dark/50 border border-white/10 rounded-lg py-2.5 px-4 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all" type="text" value="Sarah Jenkins"/>
</div>
<div>
<label class="block text-[11px] uppercase tracking-widest text-accent-taupe mb-2 font-bold">Staff Title</label>
<input class="w-full bg-background-dark/50 border border-white/10 rounded-lg py-2.5 px-4 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all" type="text" value="Head Pastry Chef"/>
</div>
</div>
</div>
</div>
<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
<div>
<label class="block text-[11px] uppercase tracking-widest text-accent-taupe mb-2 font-bold">Work Email</label>
<input class="w-full bg-background-dark/50 border border-white/10 rounded-lg py-2.5 px-4 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all" type="email" value="s.jenkins@thebreakery.com"/>
</div>
<div>
<label class="block text-[11px] uppercase tracking-widest text-accent-taupe mb-2 font-bold">Phone Number</label>
<input class="w-full bg-background-dark/50 border border-white/10 rounded-lg py-2.5 px-4 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all" type="tel" value="+1 (555) 012-3456"/>
</div>
</div>
</div>
</div>
</section>
<hr class="border-white/5"/>
<!-- Section: Security -->
<section class="grid grid-cols-1 md:grid-cols-3 gap-8">
<div class="md:col-span-1">
<h2 class="text-xl font-serif mb-2">Security &amp; Access</h2>
<p class="text-accent-taupe text-sm leading-relaxed">Manage your authentication credentials and secondary verification methods.</p>
<button class="mt-4 flex items-center gap-2 px-5 py-2.5 bg-white/5 border border-white/10 rounded-lg text-sm font-medium hover:bg-white/10 transition-all">
<span class="material-icons text-lg">lock_open</span>
                            Change Personal PIN
                        </button>
</div>
<div class="md:col-span-2 space-y-6">
<div class="bg-card-dark rounded-xl border border-white/5 p-8 shadow-2xl">
<h3 class="text-sm font-bold uppercase tracking-widest mb-6 text-white/90">Update Password</h3>
<div class="space-y-4">
<div>
<label class="block text-[11px] uppercase tracking-widest text-accent-taupe mb-2 font-bold">Current Password</label>
<input class="w-full bg-background-dark/50 border border-white/10 rounded-lg py-2.5 px-4 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all" placeholder="••••••••" type="password"/>
</div>
<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
<div>
<label class="block text-[11px] uppercase tracking-widest text-accent-taupe mb-2 font-bold">New Password</label>
<input class="w-full bg-background-dark/50 border border-white/10 rounded-lg py-2.5 px-4 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all" placeholder="••••••••" type="password"/>
</div>
<div>
<label class="block text-[11px] uppercase tracking-widest text-accent-taupe mb-2 font-bold">Confirm New Password</label>
<input class="w-full bg-background-dark/50 border border-white/10 rounded-lg py-2.5 px-4 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all" placeholder="••••••••" type="password"/>
</div>
</div>
</div>
<div class="mt-8 pt-8 border-t border-white/5 flex items-center justify-between">
<div>
<h4 class="text-sm font-semibold">Two-Factor Authentication</h4>
<p class="text-[11px] text-accent-taupe mt-1 tracking-wide">Add an extra layer of security to your account via mobile app.</p>
</div>
<label class="relative inline-flex items-center cursor-pointer">
<input checked="" class="sr-only peer" type="checkbox" value=""/>
<div class="w-12 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:start-[4px] after:bg-white/60 after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary peer-checked:after:bg-background-dark"></div>
</label>
</div>
</div>
</div>
</section>
<hr class="border-white/5"/>
<!-- Section: Preferences -->
<section class="grid grid-cols-1 md:grid-cols-3 gap-8 pb-20">
<div class="md:col-span-1">
<h2 class="text-xl font-serif mb-2">Regional &amp; Preferences</h2>
<p class="text-accent-taupe text-sm leading-relaxed">Customize your dashboard experience and localization settings.</p>
</div>
<div class="md:col-span-2">
<div class="bg-card-dark rounded-xl border border-white/5 p-8 shadow-2xl grid grid-cols-1 md:grid-cols-2 gap-6">
<div>
<label class="block text-[11px] uppercase tracking-widest text-accent-taupe mb-2 font-bold">Language</label>
<div class="relative">
<select class="w-full bg-background-dark/50 border border-white/10 rounded-lg py-2.5 px-4 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all appearance-none cursor-pointer">
<option value="en">English (United States)</option>
<option value="fr">Français (France)</option>
<option value="id">Indonesian (Indonesia)</option>
</select>
<span class="material-icons absolute right-3 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none">expand_more</span>
</div>
</div>
<div>
<label class="block text-[11px] uppercase tracking-widest text-accent-taupe mb-2 font-bold">Default Module on Login</label>
<div class="relative">
<select class="w-full bg-background-dark/50 border border-white/10 rounded-lg py-2.5 px-4 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all appearance-none cursor-pointer">
<option value="pos">POS Terminal</option>
<option selected="" value="dashboard">Kitchen Dashboard</option>
<option value="inventory">Inventory Management</option>
</select>
<span class="material-icons absolute right-3 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none">expand_more</span>
</div>
</div>
</div>
</div>
</section>
</div>
<!-- Bottom Action Bar -->
<div class="sticky bottom-0 left-0 right-0 bg-background-dark border-t border-white/5 px-10 py-6 flex items-center justify-between z-20">
<a class="text-accent-taupe hover:text-white text-sm transition-colors flex items-center gap-2" href="#">
<span class="material-icons text-base">logout</span>
                    Sign Out
                </a>
<div class="flex items-center gap-4">
<button class="px-6 py-2.5 text-accent-taupe hover:text-white text-sm font-medium transition-colors">Discard Changes</button>
<button class="px-8 py-2.5 bg-primary text-background-dark font-bold rounded-lg hover:brightness-110 transition-all shadow-[0_0_20px_rgba(230,162,25,0.2)]">
                        Update Profile
                    </button>
</div>
</div>
</main>
</div>
</body></html>
      <!-- STITCH_HTML_END -->
    \ }} />
  );
};

export default User_Profile_Settings;
