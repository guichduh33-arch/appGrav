# Checkout & Payment — Luxe Bakery POS

A premium, full-screen checkout and payment modal for an artisan French bakery POS system. Two-column layout: left shows the order summary, right handles payment entry. Dark, moody, elegant — like paying at a high-end pâtisserie counter at night.

---

**DESIGN SYSTEM (REQUIRED):**
- Platform: Web, Desktop-first, touch-optimized (1920×1080 target)
- Theme: Dark, luxe-minimal, artisan bakery aesthetic
- Primary Background: Deep Onyx (#0D0D0F)
- Surface/Cards: Warm Charcoal (#1A1A1D) with subtle border (#2A2A30)
- Primary Accent: Artisan Gold (#C9A55C) for CTAs, active states, progress bars
- Text High Contrast: Stone White (#E5E7EB) for headings and amounts
- Text Muted: Smoke Gray (#9CA3AF) for labels and secondary info
- Success: Muted Emerald (#22C55E) for completed states and change display
- Warning: Soft Amber (#F59E0B) for offline indicators
- Error: Deep Rose (#EF4444) for validation errors
- Headings Font: Playfair Display (Serif), italic for branding
- Body Font: Inter (Sans-serif), weights 300–700
- Buttons: Subtly rounded (8px), primary buttons use gold gradient, uppercase tracking-wide text
- Cards: Rounded (12px), soft shadow, subtle border
- Spacing: Generous whitespace, elegant margins, premium density

---

**Page Structure:**

## LEFT COLUMN (45% width) — Order Summary

1. **Branding Header:**
   - "THE BREAKERY" in Playfair Display italic, small caps, gold color
   - Below: Station name ("POS 1") and terminal ID in muted text, 10px
   - Thin gold separator line below

2. **Order Info Bar:**
   - Order number badge (e.g., "#1204") in a small pill with gold border
   - Order type icon + label: "Dine-in · Table 5" or "Take-out" or "Delivery"
   - Customer name if selected (e.g., "Marie Dupont · VIP") with a small gold star icon

3. **Order Items Table:**
   - Column headers: "Item" (left), "Qty" (center), "Price" (right) — muted text, 11px, uppercase
   - Each row shows:
     - Product name in white (14px, medium weight)
     - Below name: modifiers in muted italic (12px), e.g., "Extra shot, Oat milk"
     - Below modifiers: special notes in amber italic (11px), e.g., "No sugar"
     - Quantity centered in a small rounded pill
     - Price right-aligned in white
   - Locked items show a small lock icon next to the name in muted gold
   - Combo items show "COMBO" mini-badge in gold before the name
   - Promotion items show a small "%" badge in emerald green
   - Show 6–8 sample items with varied modifiers, a combo, and a promotion item
   - Scrollable area if items overflow, with subtle fade at bottom edge

4. **Totals Section:**
   - Thin separator line (#2A2A30)
   - "Subtotal" label (muted) + amount (white), right-aligned
   - "Promo Discount (–15%)" in emerald green + negative amount in green (only if applicable)
   - "Manual Discount (–10%)" in emerald green + negative amount (only if applicable)
   - "Tax Included (10%)" in muted small text + amount in muted
   - Thick gold separator line
   - **"TOTAL"** label in gold uppercase (16px, bold) + **total amount in gold** (28px, bold)
   - Format amounts as: "Rp 550.000" with dot thousands separator

## RIGHT COLUMN (55% width) — Payment Controls

5. **Payment Progress Header:**
   - Status badge: "Payment in Progress" (gold pill) or "Payment Complete" (green pill)
   - Progress bar: thin horizontal bar, gold fill proportional to paid/total ratio
   - Below bar: "Paid: Rp 300.000 / Rp 550.000" in white, "Remaining: Rp 250.000" in gold
   - When complete: bar turns green, remaining shows "Rp 0"

6. **Added Payments List** (visible when at least 1 payment added):
   - Each payment row in a subtle card (#1A1A1D):
     - Payment method icon (banknote for cash, credit card for card, QR code for QRIS, etc.)
     - Method name (e.g., "Cash") in white
     - Amount in white, right-aligned
     - Small red trash icon button to remove
   - Show 1 example: "Cash — Rp 300.000" with trash icon

7. **Payment Method Selector** (3×2 grid of buttons):
   - Six method buttons arranged in a responsive grid:
     - Cash (active state with gold border + subtle gold background glow)
     - Card
     - QRIS
     - EDC
     - Transfer
     - Store Credit (muted/disabled unless wholesale customer)
   - Each button: dark surface card, outlined icon above label, 48px height minimum
   - Active/selected: gold border, subtle gold radial gradient background
   - Hover: lighter border (#3A3A40)
   - Disabled: 40% opacity, no interaction

8. **Cash Amount Entry Panel** (shown when Cash is selected):
   - Large amount display: "Rp 300.000" in gold, 32px, centered in a dark card
   - Quick amount buttons row (horizontal scroll if needed):
     - "Exact" pill button (gold outline)
     - "Rp 100.000", "Rp 200.000", "Rp 500.000", "Rp 1.000.000" pill buttons
     - Dark surface, white text, gold border on hover
   - Full numeric keypad (4×3 grid):
     - Digits 1–9, then "C" (clear, red-tinted), "0", "⌫" (backspace)
     - Large touch-friendly buttons (64px height), rounded, dark surface
     - Subtle press feedback (slightly lighter background)
   - Change display (appears when cash > total):
     - Green highlighted card: "Change: Rp 50.000" in large emerald text (24px)
     - Subtle green border glow

9. **Non-Cash Reference Input** (shown when Card/QRIS/EDC/Transfer selected):
   - Amount input field with gold focus border
   - Reference number input field with placeholder: "Transaction reference..."
   - Both in dark surface cards with subtle borders

10. **Action Footer:**
    - Left: "Cancel" button (ghost style, muted text, no background)
    - Center: "Add Payment" button (secondary, outlined gold) — only when split payment in progress
    - Right: **"Process Payment"** large CTA button (gold gradient background, white text, uppercase, 48px height, full rounded)
    - When payment complete: button text changes to "Complete Order" with green gradient
    - Below buttons: small muted text line: "Terminal POS-01 · Online · v2.1.0"

---

**Visual Details & Polish:**
- Subtle grain/noise texture overlay on background (very faint, 2% opacity)
- Gold elements should feel warm and luminous against the dark background
- Use subtle box-shadows on cards (0 4px 20px rgba(0,0,0,0.4))
- Amounts should use tabular/monospace number alignment for clean columns
- Transitions: smooth opacity and border-color changes (200ms ease)
- The overall feel should be: "luxury register at a Parisian patisserie"
- No rounded avatar circles — keep it geometric and clean
- Icons should be outlined/line-style, not filled — thin and elegant

**Sample Data:**
- Order #1204, Dine-in, Table 5
- Customer: "Marie Dupont" (VIP)
- Items: Pain au Chocolat ×2, Café Latte (Extra shot, Oat milk) ×1, Le Petit Déjeuner Combo (Croissant + Café) ×1 [COMBO], Tarte Citron ×1 [10% OFF], Baguette Tradition ×3, Éclair Chocolat ×2 (Sans gluten), Jus d'Orange Pressé ×1
- Subtotal: Rp 605.000, Promo: –Rp 55.000, Total: Rp 550.000
- Tax included: Rp 50.000
- 1 payment added: Cash Rp 300.000
- Remaining: Rp 250.000
- Cash selected, showing keypad with "300000" entered
