# Restaurant ERP/POS Market Analysis

## Comparative Architecture Study for AppGrav

**Date**: February 9, 2026
**Systems Analyzed**: 10 (5 open source, 5 SaaS/commercial)

---

## Executive Summary

The restaurant POS/ERP market spans from monolithic Java desktop applications (Floreant, uniCenta) to cloud-native microservice architectures (Toast, Square). Key trends:

- **Offline-first is table stakes**: Every serious restaurant POS must handle network interruptions
- **Hybrid architectures dominate**: Pure cloud and pure local are extremes; most use local-first with cloud sync
- **API-first design** is standard for SaaS platforms enabling third-party integrations
- **Multi-platform** increasingly means a single web codebase deployed as PWA + native wrapper

### Architecture Spectrum

```
Pure Local                    Hybrid                      Pure Cloud
    |                           |                              |
Floreant     uniCenta    TouchBistro  Revel    Odoo    Toast  Square  Lightspeed
(Java/Local) (Java/Local) (Local+Cloud)(iPad+Cloud)(Web+Local)(Cloud) (Cloud)  (Cloud)
```

---

## Open Source Systems

### Odoo POS
- **Stack**: Python + OWL (custom JS) + PostgreSQL
- **Offline**: IndexedDB cache on session open, batch push on sync
- **Strengths**: Full ERP (accounting, HR, CRM), 20+ years maturity, extensive module ecosystem
- **Weaknesses**: ORM-only security (no RLS), complex self-hosting, Enterprise-only KDS
- **Relevance to AppGrav**: Similar offline pattern, but ORM security is weaker than PostgreSQL RLS

### Floreant POS
- **Stack**: Java Swing + Hibernate + MySQL/H2
- **Offline**: Fully local (no cloud dependency)
- **Strengths**: Restaurant-specialized, floor plans, KDS, recipes
- **Weaknesses**: Desktop-only, no cloud sync, dated UI, no API

### uniCenta oPOS
- **Stack**: Java Swing + JDBC + MySQL
- **Offline**: Fully local
- **Strengths**: Simple, customizable, JasperReports
- **Weaknesses**: No cloud, no API, permissions stored as XML blob

### ERPNext
- **Stack**: Python/Frappe + Vue.js + MariaDB
- **Offline**: IndexedDB cache (limited)
- **Strengths**: Full ERP, metadata-driven schema, active community
- **Weaknesses**: Restaurant module deprecated in v15, complex setup

### Loyverse
- **Stack**: Native iOS/Android + Cloud (AWS)
- **Offline**: SQLite cache on mobile devices
- **Strengths**: Free tier, SEA market presence, supports IDR
- **Weaknesses**: Limited customization, no open source, basic inventory

---

## SaaS / Commercial Systems

### Toast POS (Best-in-class offline)
- **Stack**: Android native + Java/Kotlin microservices + Kafka + PostgreSQL
- **Offline**: SQLite + store-and-forward card payments, multi-day offline
- **Strengths**: Custom hardware, advanced KDS (aging, speed metrics), 100+ permission codes
- **Weaknesses**: US-focused, proprietary hardware required, expensive

### Square for Restaurants (Best API design)
- **Stack**: Native iOS/Android + Go microservices
- **Offline**: SQLite cache, limited store-and-forward
- **Strengths**: Idempotency keys on all writes, polymorphic CatalogObject, fulfillment model
- **Weaknesses**: No QRIS, no IDR, basic KDS

### Lightspeed Restaurant (Best multi-location)
- **Stack**: iPad native + Angular web + Cloud
- **Offline**: CoreData/SQLite cache
- **Strengths**: Centralized menu management, per-location pricing, consolidated reporting
- **Weaknesses**: No offline card payments, iPad-only POS

### Revel Systems (Pioneered hybrid)
- **Stack**: iPad native + Cloud
- **Offline**: Local-first SQLite, continuous background sync
- **Strengths**: Store-and-forward cards, 100+ permissions, MDM device management
- **Weaknesses**: iPad-only, enterprise pricing

### TouchBistro (Most resilient offline)
- **Stack**: iPad native + Mac Mini local server + Cloud sync
- **Offline**: Local PostgreSQL on Mac Mini, internet completely optional
- **Strengths**: Full feature offline, local card processing, LAN-based
- **Weaknesses**: Requires Mac Mini hardware, no public API

---

## Key Patterns for AppGrav

### ID Strategy
UUID v4 is the correct choice for offline-first (matches Toast, Square). Allows conflict-free ID generation without server coordination.

### Order Model Comparison
- **Simple** (Floreant): Order -> OrderLines -> Modifiers
- **Medium** (AppGrav, Odoo): Order -> OrderLines -> Modifiers + Payments + Session
- **Complex** (Toast, Square): Order -> Checks/Fulfillments -> Selections -> Modifiers

The "Check" concept enables per-guest split bills - a gap in AppGrav.

### Offline Auth
All systems use PIN-based authentication for POS terminals. AppGrav's bcrypt + rate limiting matches commercial patterns. Consider increasing 24h TTL for rural deployments.

### Indonesian Market
None of the international POS systems integrate with QRIS or e-Faktur. This is where local competitors (Moka, Pawoon, Majoo) have an advantage, and where AppGrav can differentiate.

---

## AppGrav's Unique Position

AppGrav occupies a rare position: **cloud-native architecture with strong offline capabilities**. Most systems are either fully cloud (Square) or fully local (Floreant). AppGrav bridges both worlds with:

1. PostgreSQL RLS (stronger than Odoo/ERPNext ORM-only security)
2. PWA + Capacitor (no app store deployment needed)
3. Full offline mode in poor connectivity (critical for Lombok)
4. Self-hosted (no recurring SaaS fees)
5. Recipe/BOM management (bakery-specific advantage)

### Recommended Priorities
1. **QRIS payment integration** (increasingly mandatory in Indonesia)
2. **Advanced KDS** (ticket aging, speed metrics, all-day count)
3. **Split bill model** (add checks entity between orders and items)
4. **e-Faktur integration** (strong differentiator vs international POS)
5. **Idempotency keys** (prevent duplicate sync operations)
