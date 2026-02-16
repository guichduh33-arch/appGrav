import React from 'react';

const DesignBrief: React.FC = () => {
    return (
        <div dangerouslySetInnerHTML={{
            __html: `
      <!-- STITCH_HTML_START -->
      <!DOCTYPE html>
<html lang="en"><head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
<title>The Breakery Payment &amp; Checkout</title>
<script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&amp;family=Playfair+Display:wght@700&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<style type="text/tailwindcss">
        :root {
            --theme-bg-primary: #0D0D0F;
            --theme-bg-secondary: #1A1A1D;
            --color-gold: #C9A55C;
            --theme-text-primary: #E5E7EB;
            --theme-text-secondary: #9CA3AF;
            --theme-border: #2A2A30;
        }
        body {
            font-family: 'Inter', sans-serif;
            background-color: var(--theme-bg-primary);
            color: var(--theme-text-primary);
        }
        .font-serif {
            font-family: 'Playfair Display', serif;
        }
        .glass-panel {
            background: rgba(26, 26, 29, 0.85);
            backdrop-filter: blur(16px);
            border: 1px solid var(--theme-border);
        }
        .gold-gradient {
            background: linear-gradient(135deg, #C9A55C 0%, #B08D45 100%);
        }
        .gold-border {
            border: 2px solid var(--color-gold);
        }
        .numpad-btn {
            @apply flex items-center justify-center bg-[#252529] hover:bg-[#2F2F35] text-2xl font-semibold py-6 rounded-lg transition-colors active:scale-95;
        }
        .quick-tap-btn {
            @apply flex items-center justify-center bg-[#252529] hover:bg-[#2F2F35] text-sm font-bold py-4 rounded-lg border border-[#3A3A42] transition-colors active:scale-95;
        }
    </style>
</head>
<body class="h-screen overflow-hidden flex items-center justify-center bg-[url('https://images.unsplash.com/photo-1509440159596-0249088772ff?q=80&amp;w=2072&amp;auto=format&amp;fit=crop')] bg-cover bg-center">
<div class="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-6">
<div class="glass-panel w-full max-w-5xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
<div class="px-8 py-6 border-b border-[var(--theme-border)] flex justify-between items-center">
<div>
<h2 class="text-[var(--theme-text-secondary)] text-sm uppercase tracking-widest font-semibold">Payment Details</h2>
<div class="flex items-baseline gap-4 mt-1">
<span class="text-4xl font-serif text-[var(--color-gold)]">Rp 150.000</span>
<span class="text-[var(--theme-text-secondary)] text-sm">8 Items</span>
</div>
</div>
<button class="text-[var(--theme-text-secondary)] hover:text-white">
<span class="material-symbols-outlined text-3xl">close</span>
</button>
</div>
<div class="flex flex-1 overflow-hidden">
<div class="w-1/2 p-8 border-r border-[var(--theme-border)] flex flex-col gap-8">
<div class="grid grid-cols-2 gap-4">
<button class="gold-border flex flex-col items-center justify-center gap-3 p-6 rounded-xl bg-[#1E1E22] transition-all">
<span class="material-symbols-outlined text-4xl text-[var(--color-gold)]">payments</span>
<span class="font-semibold text-white">Cash</span>
</button>
<button class="flex flex-col items-center justify-center gap-3 p-6 rounded-xl bg-[#1E1E22] border-2 border-transparent hover:border-[var(--theme-border)] transition-all">
<span class="material-symbols-outlined text-4xl text-[var(--theme-text-secondary)]">credit_card</span>
<span class="font-semibold text-[var(--theme-text-secondary)]">Card</span>
</button>
<button class="flex flex-col items-center justify-center gap-3 p-6 rounded-xl bg-[#1E1E22] border-2 border-transparent hover:border-[var(--theme-border)] transition-all">
<span class="material-symbols-outlined text-4xl text-[var(--theme-text-secondary)]">account_balance</span>
<span class="font-semibold text-[var(--theme-text-secondary)]">Bank Transfer</span>
</button>
<button class="flex flex-col items-center justify-center gap-3 p-6 rounded-xl bg-[#1E1E22] border-2 border-transparent hover:border-[var(--theme-border)] transition-all">
<span class="material-symbols-outlined text-4xl text-[var(--theme-text-secondary)]">point_of_sale</span>
<span class="font-semibold text-[var(--theme-text-secondary)]">EDC</span>
</button>
</div>
<div class="flex-1 flex flex-col justify-center gap-6">
<div class="flex justify-between items-center px-4">
<span class="text-xl text-[var(--theme-text-secondary)]">Received</span>
<span class="text-3xl font-medium text-white">Rp 160.000</span>
</div>
<div class="h-[1px] bg-[var(--theme-border)]"></div>
<div class="flex justify-between items-center px-4 py-4 rounded-xl bg-green-500/10 border border-green-500/20">
<span class="text-xl text-green-500 font-medium">Change Due</span>
<span class="text-4xl font-serif text-green-500">Rp 10.000</span>
</div>
</div>
<button class="gold-gradient w-full py-6 rounded-xl text-black font-bold text-xl uppercase tracking-widest shadow-lg shadow-black/40 hover:opacity-90 active:scale-[0.98] transition-all">
                        Complete Payment
                    </button>
</div>
<div class="w-1/2 p-8 bg-[#131316]/50">
<div class="flex flex-col h-full gap-4">
<div class="bg-black/40 rounded-xl p-6 mb-2 border border-[var(--theme-border)] text-right">
<div class="text-[var(--theme-text-secondary)] text-xs uppercase tracking-tighter mb-1">Entry Amount</div>
<div class="text-5xl font-serif text-white">160.000</div>
</div>
<div class="grid grid-cols-3 gap-3">
<button class="quick-tap-btn text-[var(--color-gold)]">Rp 50.000</button>
<button class="quick-tap-btn text-[var(--color-gold)]">Rp 100.000</button>
<button class="quick-tap-btn text-[var(--theme-text-primary)]">EXACT</button>
</div>
<div class="grid grid-cols-3 gap-3 flex-1 mt-2">
<button class="numpad-btn text-white">1</button>
<button class="numpad-btn text-white">2</button>
<button class="numpad-btn text-white">3</button>
<button class="numpad-btn text-white">4</button>
<button class="numpad-btn text-white">5</button>
<button class="numpad-btn text-white">6</button>
<button class="numpad-btn text-white">7</button>
<button class="numpad-btn text-white">8</button>
<button class="numpad-btn text-white">9</button>
<button class="numpad-btn text-white">000</button>
<button class="numpad-btn text-white">0</button>
<button class="numpad-btn text-[var(--color-gold)]">
<span class="material-symbols-outlined text-3xl">backspace</span>
</button>
</div>
</div>
</div>
</div>
<div class="px-8 py-4 bg-[#0D0D0F] border-t border-[var(--theme-border)] flex justify-between text-[var(--theme-text-secondary)] text-xs">
<div class="flex gap-4">
<span>Terminal: POS-01</span>
<span>Staff: Alexander V.</span>
</div>
<div>Sync Status: Online</div>
</div>
</div>
</div>

</body></html>
      <!-- STITCH_HTML_END -->
    ` }} />
    );
};

export default DesignBrief;
