# Design System: The Breakery Redesign (Luxe Dark)
**Project ID:** 6226570993221239944

## 1. Visual Theme & Atmosphere

The Breakery's interface embodies a **"Luxe Bakery"** aesthetic — a premium, moody, artisan-forward design language inspired by high-end French pâtisseries. The visual identity marries the intimacy of a candlelit bakery with the precision of a modern ERP system.

**Key Characteristics:**
- **Deep, immersive darkness** creating theatrical contrast — content emerges from shadow like items in a display case
- **Aged gold accents** used with restraint, evoking brass fixtures and gilded lettering found in Parisian shopfronts
- **Typographic formality** blending elegant italic serifs (brand identity) with clean geometric sans-serifs (operational UI)
- **Whisper-thin borders** and translucent dividers (`border-white/5`, `border-primary/10`) maintaining structure without visual weight
- **Utilitarian density** — operational screens prioritize information density while preserving premium feel through generous vertical rhythm and tracking
- **Monochromatic restraint** — color is reserved for semantic meaning (gold = brand/action, green = success/on-time, orange = warning/delayed, red = critical)

**Atmosphere Words:** Moody, Artisanal, Nocturnal, Refined, Theatrical, Dense-yet-Elegant

## 2. Color Palette & Roles

### Primary Brand Accent
- **Artisan Gold** (#C9A55C) — The singular brand accent. Used for primary CTAs, active navigation states, brand logotype, section headers, total amounts, and interactive highlights. Evokes aged brass, warm candlelight, and luxury pastry craft. Appears in variants across screens: #C9A55C (canonical), #c8a45b (operational screens), #cab06d (lighter POS variant).

### Background Foundation
- **Deep Onyx** (#0D0D0F) — Primary background. The absolute foundation of every screen. A near-black with imperceptible warm undertone that prevents the harshness of pure black. `bg-background-dark`
- **Onyx Surface** (#161618) — Elevated surface for cards, sidebars, panels, and secondary containers. Subtly lighter than Deep Onyx to create depth without brightness. `bg-onyx-surface`, `bg-card-dark`, `bg-surface`
- **Shimmer Highlight** (#1A1A1C) — Tertiary surface used for hover states, input backgrounds, and skeleton loading highlights. Barely perceptible lift from Onyx Surface.

### Typography Colors
- **Stone Text** (#E5E7EB) — Primary text. High-contrast but softer than pure white. Used for headings, product names, amounts, and all primary-reading content. `text-stone-text`
- **Muted Smoke** (#9CA3AF / #8E8E93) — Secondary text. Used for labels, metadata, timestamps, section headers, and supporting information. Two variants exist: cooler (#9CA3AF for back-office) and warmer (#8E8E93 for POS/front-facing). `text-muted-smoke`
- **Ghost Text** (stone-text/40 or stone-text/60) — Tertiary text using opacity modifiers. Used for placeholders, table sub-labels, micro-metadata, and de-emphasized context.

### Borders & Dividers
- **Whisper Border** (white/5) — Primary structural divider. So subtle it's almost invisible, providing separation without visual noise. Used for table rows, card edges, and layout dividers.
- **Gold Trace** (primary/10 or primary/20) — Warm-tinted border for sidebar edges, header bottoms, and elements that benefit from brand warmth. Creates a barely-visible gold glow.
- **Input Border** (#262629 / #27272A) — Slightly more visible border for form inputs and interactive card containers. `border-dark`, `input-border`

### Semantic Status Colors
- **Verdant Signal** (#4A5D4E / green-500) — Success, on-time orders, live connection indicators. The muted variant (#4A5D4E) is used in KDS for on-time order side bars; the vivid variant (green-500) for system status dots and badges.
- **Amber Caution** (#A6634B) — Delayed orders, approaching deadlines, soft warnings. A muted terracotta-orange that feels urgent without alarming. Used in KDS for delayed order side bars and timers.
- **Critical Crimson** (#991B1B / red-500) — Critical stock alerts, errors, action-required badges. The muted variant for operational warnings; vivid for dashboard alert badges.
- **KDS Active Orange** (#ec5b13) — KDS-specific primary accent replacing gold. A vivid, attention-grabbing orange for kitchen-facing screens where visibility under harsh lighting takes priority over brand elegance.

## 3. Typography Rules

### Font Families
- **Inter** — Primary sans-serif for all operational UI: body text, labels, buttons, navigation, data tables, form inputs. Clean, geometric, highly legible at small sizes. `font-sans`, `font-display`
- **Playfair Display** — Italic serif for brand identity moments only: the "B" logotype, dashboard headlines ("Executive Summary"), section display titles, and KPI values. Used sparingly to signal premium positioning. `font-script`, `font-display` (serif variant)

### Weight & Size Hierarchy
- **Display Headlines:** Playfair Display, medium-to-semibold (500-600), italic where brand-forward, 2rem-2.5rem. Used for page titles on dashboard and reports.
- **Section Headers:** Inter, bold (700), 0.625rem (10px-11px), **uppercase with extreme tracking** (0.15em-0.3em). The signature label style — small, commanding, and architectural. Example: `text-xs font-bold tracking-[0.2em] uppercase text-muted-smoke`
- **Body / Data:** Inter, regular to medium (400-500), 0.875rem (14px). Used for table content, product names, and descriptions.
- **Numeric Displays:** Inter, light to semibold (300-600), 1.5rem-3rem. Large numeric values use `font-light` for elegance (totals, prices); KPIs use `font-bold` for impact. Always `tabular-nums` for alignment.
- **Micro Labels:** Inter, medium to bold (500-700), 0.625rem (10px), uppercase with wide tracking (0.15em-0.25em). Used for metadata, sub-labels, status indicators.
- **Button Text:** Inter, bold (700), 0.6875rem-0.8125rem (11-13px), **uppercase with dramatic tracking** (0.25em). Creates a formal, commanding tone.

### Tracking Conventions (Letter-Spacing)
- `tracking-tight` — Numeric displays, order numbers (-0.025em)
- `tracking-wide` — Item names in KDS (0.025em)
- `tracking-widest` — Standard UI labels (0.1em)
- `tracking-[0.15em]` — Header metadata
- `tracking-[0.2em]` — Section headers (signature pattern)
- `tracking-[0.25em]` — Button text
- `tracking-[0.3em]` — Display labels, brand name in KDS

## 4. Component Stylings

### Buttons

**Primary CTA:**
- Shape: Subtly rounded corners (rounded-lg to rounded-xl, 0.5-0.75rem)
- Background: Solid Artisan Gold (`bg-primary` / `bg-aged-gold`)
- Text: Deep Onyx (`text-background-dark` / `text-black`), bold, uppercase, dramatic tracking (0.25em)
- Shadow: Warm gold glow (`shadow-xl shadow-aged-gold/10` or `shadow-lg shadow-primary/20`)
- Hover: Subtle brightness increase (`hover:brightness-110` or `hover:bg-primary/90`)
- Active: Micro-scale feedback (`active:scale-[0.98]`)
- Padding: Generous vertical (py-5 to py-6) for touch-friendly targets

**Secondary / Ghost Button:**
- Shape: Matching primary roundness (rounded-xl)
- Background: Transparent
- Border: Whisper-thin gold trace (`border border-white/10` or `border border-primary/20`)
- Text: Stone Text, bold, uppercase, wide tracking
- Hover: Subtle background tint (`hover:bg-white/5` or `hover:bg-primary/5`)

**Payment Tile Buttons (Checkout-specific):**
- Large square tiles (h-32) with centered label
- Decorative gold underline that expands on hover (`w-8 → w-12`)
- Active state: Gold background tint + gold ring (`bg-primary/10 ring-1 ring-primary/50`)

**Numeric Keypad Buttons:**
- Grid with 1px gold-tinted gaps (`gap-px bg-primary/10`)
- Tall cells (h-20) with light-weight numerals (text-2xl font-light)
- Hover: Full gold fill with dark text (`hover:bg-primary hover:text-background-dark`)

### Cards & Containers

**Stat/KPI Cards (Dashboard):**
- Generously rounded corners (rounded-2xl, 1rem)
- Background: Onyx Surface (`bg-card-dark`)
- Border: Subtle structural (`border border-border-dark`)
- Gold reveal bar: Hidden bar at bottom that appears on hover (`opacity-0 group-hover:opacity-100`, h-1, bg-primary)
- Icon badges: Gold-tinted background (`bg-primary/10 rounded-lg text-primary`)
- Internal padding: Comfortable p-6

**Data Cards (Shift Summary, Inventory):**
- Softer corners (rounded-lg)
- Background: Onyx Surface
- Border: Whisper white/5
- Internal spacing: p-6 with generous section gaps

**KDS Order Cards:**
- Minimal rounding (rounded-lg)
- Full-height columns with color-coded left border bar (w-1.5, absolute positioned)
- Green bar = on-time, Orange bar = delayed, Red bar = critical
- Bottom action area: Full-width button with subtle background tint on hover

### Navigation

**Full Sidebar (Back-Office, w-64):**
- Sticky, full-height (`h-screen sticky top-0`)
- Brand lockup at top: Playfair Display italic logotype or boxed "B" monogram
- Section groups with uppercase micro-labels (`text-[10px] font-semibold uppercase tracking-wider text-smoke`)
- Nav items: Icon + label, `text-sm font-medium`, `text-muted-smoke` default
- Hover: Gold text (`hover:text-primary`) with subtle background (`hover:bg-white/5` or `hover:bg-primary/5`)
- Active: Gold text + gold-tinted background + subtle gold border (`bg-primary/5 text-primary border border-primary/20` or `sidebar-active` with `border-right: 2px solid primary`)
- User card at bottom: Avatar circle with initials, name, role, logout button

**Compact Sidebar (POS, w-24):**
- Icon-only navigation with icon + micro-label stacked vertically
- Active state: Gold background tint with gold right border (2px solid)
- Brand: Single italic "B" character in Playfair Display

**Header Bars:**
- Height: h-16 to h-20
- Bottom border: Gold trace (`border-b border-primary/20` or `border-b border-white/5`)
- Background: Semi-transparent with blur (`bg-surface/50` or `bg-background-dark/80 backdrop-blur-md`)
- Content: Brand name + metadata on left, time/user on right

**Footer Status Bar:**
- Minimal height (h-10)
- Ultra-small uppercase text (`text-[10px] uppercase tracking-widest text-stone-text/40`)
- System info: terminal ID, uptime, sync status, version

### Inputs & Forms

- **Background:** Deep Onyx (#0D0D0F) — inputs are darker than their container surface
- **Border:** Input Border (#262629), 1px solid
- **Focus:** Gold border with matching outer glow (`border-color: aged-gold; box-shadow: 0 0 0 1px aged-gold` or `focus:ring-primary focus:border-primary`)
- **Text:** Pure white (#FFFFFF) for entered values
- **Placeholder:** Ghost Text (stone-text/40 or muted-smoke)
- **Corner Radius:** Matching card roundness (rounded-xl for prominent inputs, rounded-lg standard)
- **Padding:** Generous (py-6 pl-12 for large inputs like cash amounts; py-2.5 px-3 for standard selects)

### Tables

- **Header row:** Micro uppercase labels (`text-[10px] uppercase tracking-widest text-stone-text/40 font-semibold`)
- **Row dividers:** Whisper-thin (`divide-y divide-white/5` or `divide-y divide-primary/5`)
- **Totals row:** Stronger separator (`border-t-2 border-white/10`), larger text, gold accent for key values
- **Cell padding:** py-4 for comfortable touch-friendly rows
- **Alignment:** Left for labels, right for numeric values

### Loading & Skeleton States

- **Shimmer animation:** Gold-tinted gradient sweeping left-to-right
  - Base: Surface color (#161618)
  - Highlight: Barely-visible gold wash (`rgba(200, 164, 91, 0.05)`)
  - Duration: 3-4 seconds, infinite linear
- **Skeleton shapes:** Match actual content dimensions (rounded-sm for text, rounded-full for avatars)
- **Subtle variant:** Neutral (no gold tint) for secondary elements, slightly slower (4s)

### Scrollbars (Custom WebKit)

- Width: 4-6px, ultra-thin
- Track: Transparent or near-background
- Thumb: Dark with optional gold tint (`#2a2a2c` or `primary/33`)
- Thumb hover: Slightly brighter (`primary/55`)
- Border-radius: Pill-shaped (10px or 3px)

### Badges & Status Indicators

- **Live indicator:** Pulsing green dot (w-2 h-2 rounded-full bg-green-500 animate-pulse) with uppercase micro-label
- **Percentage badges:** Colored background tint with matching text (`text-green-500 bg-green-500/10 px-2 py-1 rounded`)
- **Alert badges:** Red variant for critical states (`text-red-500 bg-red-500/10`)

## 5. Layout Principles

### Screen Architecture
- **Full-viewport immersion:** All operational screens use `h-screen flex overflow-hidden` — no page scrolling, only panel scrolling
- **Panel-based composition:** Split-panel layouts with fixed sidebars and scrollable main content
- **Sidebar + Main:** Standard back-office layout (sidebar w-64, main flex-1)
- **Three-column POS:** Compact nav (w-24) + product grid (flex-1) + cart panel (w-[400-480px])
- **Two-column checkout:** Order summary (w-[450px]) + payment area (flex-1)

### Spacing Strategy
- **Compact density for operational screens:** POS, KDS, and checkout use tight spacing (p-5 to p-6) to maximize information visibility
- **Generous breathing for back-office:** Dashboard and reports use wider padding (p-8 to p-12) and generous section gaps (space-y-10 to space-y-12)
- **Content max-width:** `max-w-[1600px] mx-auto` for wide screens, `max-w-3xl mx-auto` for focused content
- **Consistent vertical rhythm:** Table rows py-4, card sections space-y-6, major sections space-y-12

### Responsive Grid
- **Dashboard KPIs:** 4-column grid (`grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6`)
- **KDS Orders:** 4-column grid, collapsing to 2 (1024px) then 1 (640px)
- **Shift Summary:** 2-column grid for summary cards (`grid-cols-2 gap-12`)

### Visual Hierarchy Techniques
- **Gold as attention anchor:** Primary totals, active states, and CTAs use gold to draw the eye
- **Opacity gradations:** `stone-text/80 → stone-text/60 → stone-text/40` to create text depth without multiple colors
- **Scale for emphasis:** Key values use large display sizes (text-2xl to text-5xl) with `font-light` for elegant restraint
- **Uppercase tracking as formality:** Section headers and labels use extreme tracking to convey architectural precision

## 6. Design System Notes for Stitch Generation

### Prompting Language Reference

When creating new screens for this project in Stitch, use these specific descriptive terms:

**Atmosphere:**
- "Premium dark bakery ERP with theatrical contrast and artisan gold accents"
- "Moody, nocturnal interface inspired by a French pâtisserie at closing time"
- "Dense operational UI with elegant restraint and whisper-thin borders"

**Colors (always include hex):**
- Primary accent: "Artisan Gold (#C9A55C)" — buttons, active nav, brand elements
- Background: "Deep Onyx (#0D0D0F)" — page foundation
- Surfaces: "Onyx Surface (#161618)" — cards, panels, sidebars
- Text: "Stone Text (#E5E7EB)" — primary; "Muted Smoke (#9CA3AF)" — secondary
- Borders: "Whisper-thin white/5 borders" or "Gold trace borders (primary/10)"

**Typography:**
- "Inter sans-serif for all UI text, Playfair Display italic serif for brand moments only"
- "Section headers use 10px uppercase Inter with extreme letter-spacing (0.2em) in Muted Smoke"
- "Buttons use bold uppercase Inter with dramatic letter-spacing (0.25em)"

**Components:**
- "Subtly rounded card with Onyx Surface background and whisper-thin border, gold reveal bar on hover"
- "Primary CTA in solid Artisan Gold with dark text, generous padding, and warm gold shadow glow"
- "Full-height sidebar with gold-tinted active state and Playfair Display italic brand monogram"
- "Data table with ghost-thin row dividers, micro-uppercase headers, and gold-accented total row"

**Layout:**
- "Full-viewport immersive layout with no page scroll, only panel scroll"
- "Split-panel composition with fixed sidebar and scrollable main content area"
- "Generous vertical rhythm with architectural section spacing"

### Screen-Specific Overrides

| Screen Type | Primary Color | Font Override | Notes |
|-------------|--------------|---------------|-------|
| POS Terminal | Gold (#C9A55C) | Inter + Playfair "B" | Compact nav (w-24), touch-optimized |
| KDS | Orange (#ec5b13) | Inter only | High-visibility, color-coded order bars |
| Customer Display | Gold (#c8a45b) | Inter only | Photography-first, cinematic split |
| Back-Office | Gold (#C9A55C) | Inter + Playfair headings | Full sidebar (w-64), dashboard cards |
| Loading States | Gold shimmer | Inter only | 3s shimmer animation, gold-tinted gradient |
