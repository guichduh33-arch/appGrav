import React from 'react';

const Login_Screen: React.FC = () => {
  return (
    <div dangerouslySetInnerHTML={{ __html: `
      <!-- STITCH_HTML_START -->
      <!DOCTYPE html>

<html class="dark" lang="en"><head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
<title>The Breakery - Artisan Bakery Login</title>
<script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&amp;family=Playfair+Display:ital,wght@0,600;0,700;1,600&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/icon?family=Material+Icons+Outlined" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<script id="tailwind-config">
        tailwind.config = {
            darkMode: "class",
            theme: {
                extend: {
                    colors: {
                        "primary": "#c8a45b",
                        "background-light": "#f8f7f6",
                        "background-dark": "#0D0D0F", // Deep Onyx specified
                        "surface-dark": "#1A1A1D",    // Warm Charcoal specified
                        "border-dark": "#2A2A30",     // Muted grey border
                        "muted-gold": "#A09B8E",
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
            font-family: 'Inter', sans-serif;
            background-color: #0D0D0F;
        }
        .login-card {
            background-color: #1A1A1D;
            border: 1px solid #2A2A30;
            width: 480px;
        }
        .input-focus-gold:focus {
            border-color: #c8a45b;
            box-shadow: 0 0 0 2px rgba(200, 164, 91, 0.2);
        }
    </style>
</head>
<body class="bg-background-light dark:bg-background-dark min-h-screen flex flex-col items-center justify-center font-display antialiased">
<!-- Main Login Container -->
<main class="flex-grow flex items-center justify-center p-6 w-full">
<div class="login-card rounded-xl p-10 shadow-2xl relative overflow-hidden">
<!-- Logo & Branding -->
<div class="text-center mb-10">
<div class="inline-block mb-2">
<span class="material-icons-outlined text-primary text-4xl">bakery_dining</span>
</div>
<h1 class="font-serif text-[36px] text-primary leading-tight flex items-center justify-center gap-3">
                    The Breakery
                </h1>
<div class="flex items-center justify-center gap-2 mt-2">
<span class="h-px w-4 bg-primary/30"></span>
<p class="text-muted-gold text-sm tracking-widest uppercase font-medium">Artisan Bakery · Lombok</p>
<span class="h-px w-4 bg-primary/30"></span>
</div>
</div>
<!-- Login Form -->
<form class="space-y-6">
<!-- Email Field -->
<div class="space-y-2">
<label class="text-xs font-semibold text-muted-gold uppercase tracking-wider ml-1" for="email">Email Address</label>
<div class="relative">
<span class="material-icons-outlined absolute left-3 top-1/2 -translate-y-1/2 text-muted-gold text-xl">mail</span>
<input class="w-full bg-background-dark/50 border border-border-dark rounded-lg py-3 pl-11 pr-4 text-white placeholder:text-zinc-600 outline-none transition-all input-focus-gold border-primary/50" id="email" placeholder="manager@thebreakery.id" type="email" value="admin@thebreakery.id"/>
</div>
<!-- Error Message -->
<p class="text-[#F87171] text-xs mt-1.5 flex items-center gap-1 ml-1">
<span class="material-icons-outlined text-sm">error_outline</span>
                        Invalid credentials
                    </p>
</div>
<!-- Password Field -->
<div class="space-y-2">
<div class="flex justify-between items-center px-1">
<label class="text-xs font-semibold text-muted-gold uppercase tracking-wider" for="password">Password</label>
</div>
<div class="relative">
<span class="material-icons-outlined absolute left-3 top-1/2 -translate-y-1/2 text-muted-gold text-xl">lock</span>
<input class="w-full bg-background-dark/50 border border-border-dark rounded-lg py-3 pl-11 pr-11 text-white placeholder:text-zinc-600 outline-none transition-all input-focus-gold" id="password" placeholder="••••••••" type="password"/>
<button class="absolute right-3 top-1/2 -translate-y-1/2 text-muted-gold hover:text-primary transition-colors" type="button">
<span class="material-icons-outlined text-xl">visibility</span>
</button>
</div>
</div>
<!-- Remember & Forgot -->
<div class="flex items-center justify-between">
<label class="flex items-center group cursor-pointer">
<div class="relative flex items-center">
<input checked="" class="peer h-5 w-5 border-border-dark bg-background-dark/50 rounded text-primary focus:ring-primary focus:ring-offset-background-dark" type="checkbox"/>
</div>
<span class="ml-2 text-sm text-zinc-400 group-hover:text-zinc-300 transition-colors">Remember me</span>
</label>
<a class="text-sm text-primary/80 hover:text-primary transition-colors font-medium" href="#">Forgot password?</a>
</div>
<!-- Sign In Button -->
<button class="w-full bg-primary hover:bg-[#b8944b] text-background-dark font-bold py-3.5 rounded-lg transition-all transform active:scale-[0.98] shadow-lg shadow-primary/10 mt-2" type="submit">
                    SIGN IN
                </button>
</form>
<!-- Secondary Divider -->
<div class="relative my-10">
<div class="absolute inset-0 flex items-center">
<div class="w-full border-t border-border-dark"></div>
</div>
<div class="relative flex justify-center text-xs uppercase">
<span class="bg-surface-dark px-4 text-muted-gold tracking-widest italic font-serif">Crafted Excellence</span>
</div>
</div>
<div class="text-center">
<p class="text-zinc-500 text-sm italic">"The finest crusts in the archipelago."</p>
</div>
</div>
</main>
<!-- Footer Utility -->
<footer class="w-full p-8 flex flex-col items-center gap-4">
<a class="flex items-center gap-2 text-muted-gold hover:text-primary transition-colors text-sm font-medium group" href="#">
<span class="material-icons-outlined text-lg group-hover:animate-pulse">wifi_off</span>
            Use Offline Mode (PIN)
        </a>
<div class="text-zinc-600 text-[10px] tracking-widest uppercase font-bold">
            Version 2.1.0
        </div>
</footer>
<!-- Decorative Background Elements -->
<div class="fixed top-0 left-0 w-full h-full pointer-events-none z-[-1] opacity-20">
<div class="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[120px]"></div>
<div class="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px]"></div>
</div>
</body></html>
      <!-- STITCH_HTML_END -->
    ` }} />
  );
};

export default Login_Screen;
