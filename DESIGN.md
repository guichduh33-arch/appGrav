# Design System: The Breakery (POS/ERP)

## Vision
A premium, professional, and intuitive interface for high-end boutique bakeries. The design prioritizes clarity of information, speed of operation, and visual harmony across all terminals (POS, KDS, Customer Display).

## Design Principles
1. **Professional Minimalism**: High contrast but low cognitive load. Use whitespace and precise typography instead of heavy borders.
2. **Sober Iconography**: Use minimalist, line-based icons (Lucide/Heroicons). No playful or colorful emojis.
3. **Harmonious Palette**: A unified set of colors used consistently across all screens to reduce training time and visual fatigue.
4. **Subtle Branding**: Lightweight integration of "The Breakery" logo to maintain a premium feel without being intrusive.

## Visual Identity

### Color Palette (The "Luxe Bakery" Palette)
| Token | HEX | Role |
| :--- | :--- | :--- |
| **Deep Onyx** | `#0D0D0F` | Main background (Dark mode) |
| **Warm Charcoal** | `#1A1A1D` | Card and surface background |
| **Aged Gold** | `#C9A55C` | Primary accent, luxury buttons, branding |
| **Olive Muted** | `#4A5D4E` | Success state, healthy indicators |
| **Clay Terracotta** | `#A6634B` | Secondary accent, interactive elements |
| **Stone Text** | `#E5E7EB` | Primary text |
| **Muted Smoke** | `#9CA3AF` | Secondary text, placeholders |

### Typography
- **Headings**: `Inter` or `Outfit` (Bold/Semi-bold) for a modern, premium feel.
- **Body**: `Inter` (Regular/Medium) for maximum legibility in high-pressure environments.
- **Numbers**: Tabular numerals for price and quantity alignment.

### Iconography
- **Library**: `Lucide-React` (Customized stroke width: `1.5` for elegance).
- **Style**: Monochromatic or subtle color hints. No emoji-style icons.

## Layout Strategy

### POS (Point of Sale)
- **Layout**: 3-column architecture (Categories | Products | Cart).
- **Navigation**: Persistent top bar for user/shift info.
- **Interaction**: Large touch targets, subtle micro-animations on cart add.

### KDS (Kitchen Display System)
- **Layout**: Columnar or Grid view based on volume.
- **Visual Hierarchy**: Urgency indicated by border intensity and subtle color shifts rather than large red banners.
- **Information**: High contrast for readability from a distance.

### Customer Display
- **Layout**: Split screen (60% Promo/Logo | 40% Cart & Status).
- **Branding**: Logo as a subtle watermark or small, refined header element.

## Proposed Improvements
- [ ] Replace hardcoded blue/red with Olive/Clay tones.
- [ ] Refine all modal designs to use shorter margins and soft shadows.
- [ ] Implement a global "Glassmorphism" effect for high-end feel on surfaces.
- [ ] Simplify navigation by grouping settings into a single "Command Center".
