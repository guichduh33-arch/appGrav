# AppGrav vs Industry - Comparative Analysis Matrix

**Date**: February 9, 2026
**Systems Compared**: AppGrav, Odoo, Floreant, ERPNext, Toast, Square, Revel, TouchBistro, Lightspeed, Loyverse

---

## 1. Architecture Comparison

| Dimension | AppGrav | Odoo | Toast | Square | TouchBistro | Revel |
|-----------|---------|------|-------|--------|-------------|-------|
| **Frontend** | React PWA | OWL (custom) | Android native | iOS/Android native | iOS native | iOS native |
| **Backend** | Supabase | Python/Werkzeug | Java/Kotlin microservices | Go microservices | Mac Mini server | Cloud |
| **Database** | PostgreSQL (RLS) | PostgreSQL (ORM) | PostgreSQL | Proprietary | PostgreSQL (local) | PostgreSQL |
| **Offline Storage** | IndexedDB (Dexie) | IndexedDB | SQLite | SQLite | PostgreSQL (local) | SQLite |
| **Real-time** | Supabase Realtime | Longpolling/WS | WebSocket + Kafka | WebSocket | TCP/LAN | WebSocket |
| **Mobile** | Capacitor | React Native | Android native | Native | iPad native | iPad native |
| **API** | Supabase auto-gen | JSON-RPC + REST | REST + gRPC | REST + GraphQL | None | REST |

---

## 2. Offline Capability Matrix

| Feature | AppGrav | Odoo | Floreant | Toast | Revel | TouchBistro |
|---------|---------|------|----------|-------|-------|-------------|
| **Offline order taking** | Yes | Yes | Yes (local) | Yes | Yes | Yes |
| **Offline payments (cash)** | Yes | Yes | Yes | Yes | Yes | Yes |
| **Offline card payments** | No | No | N/A | Yes (store-forward) | Yes | Yes (local server) |
| **Max offline duration** | 24h (auth TTL) | Session only | Infinite | Days | Indefinite | Indefinite |
| **Offline auth** | PIN + bcrypt | PIN | PIN | PIN | PIN | PIN |
| **Sync strategy** | Queue + backoff | Batch push | N/A (local) | Delta + UUID dedup | Background + timestamp | Local server |
| **Conflict resolution** | Timestamp reject | Last-write-wins | N/A | Timestamp + dedup | Timestamp | Local server wins |
| **Conflict UI** | No | No | N/A | Yes | Limited | N/A |
| **Offline product edit** | No | No | Yes | No | No | No |
| **Offline customer create** | No | No | Yes | No | No | No |

### AppGrav vs Best-in-Class (Toast)

| Aspect | AppGrav | Toast | Gap |
|--------|---------|-------|-----|
| Offline duration | 24 hours | Multi-day | Medium - increase auth TTL |
| Card store-forward | Not supported | Supported | Large - needs payment gateway |
| Conflict resolution | Reject + notify | Auto-resolve + UI | Medium - add resolution UI |
| Sync performance | Sequential FIFO | Parallel batched | Small - add batch processing |
| Delta sync | Full refresh | Incremental | Medium - add updated_at tracking |

---

## 3. Feature Completeness Matrix

| Module | AppGrav | Odoo | ERPNext | Toast | Square | Revel | Lightspeed |
|--------|---------|------|---------|-------|--------|-------|------------|
| **POS Terminal** | Full | Full | Full | Full | Full | Full | Full |
| **Product Catalog** | Full | Full | Full | Full | Full | Full | Full |
| **Modifiers/Options** | Full | Full | Basic | Full | Full | Full | Full |
| **Combo Deals** | Full | Enterprise | Basic | Full | Limited | Full | Full |
| **Promotions** | Full | Enterprise | Basic | Full | Full | Full | Full |
| **Split Payment** | Full | Full | Basic | Full | Full | Full | Full |
| **Split Bill (per guest)** | No | Yes | No | Yes | Yes | Yes | Yes |
| **Customer Loyalty** | Basic | Enterprise | Basic | Full | Full | Full | Full |
| **KDS** | Basic | Enterprise | No | Advanced | Basic | Advanced | Advanced |
| **Floor Plan** | Full | Full | Full | Full | Basic | Full | Full |
| **Inventory** | Full | Full | Full | Full | Basic | Full | Full |
| **Recipes/BOM** | Full | Full | Full | Limited | No | Full | Full |
| **Purchase Orders** | Partial | Full | Full | Full | No | Full | Full |
| **Stock Transfers** | Basic | Full | Full | Full | No | Full | Full |
| **Reporting** | 20+ reports | 50+ | 30+ | 75+ | 30+ | 50+ | 40+ |
| **Multi-Location** | No | Yes | Yes | Yes | Yes | Yes | Yes |
| **Accounting** | No | Full | Full | Basic | No | No | No |
| **HR/Payroll** | No | Full | Full | Full | Full | Full | No |
| **Online Ordering** | No | No | No | Yes | Yes | Yes | Yes |
| **Customer Display** | Yes | Yes | No | Yes | No | Yes | Yes |
| **Mobile App** | Capacitor | React Native | Web | Android | Native | iPad | No |
| **Offline Mode** | Full | Basic | Basic | Full | Limited | Full | Basic |
| **Open Source** | No | Community | Yes | No | No | No | No |
| **API** | Auto-gen | Full | Full | Full | Full | Full | Full |

### Feature Gap Analysis

**AppGrav has but competitors lack**:
- PostgreSQL RLS (database-level security) - Only AppGrav and TouchBistro
- PWA deployment (no app store needed) - Only AppGrav and Odoo/ERPNext
- Supabase Realtime (built-in WebSocket) - Unique advantage
- Combined offline + cloud (most are one or the other)

**Competitors have but AppGrav lacks**:
- Split bill per guest (Toast, Square, Revel, Lightspeed)
- Store-and-forward card payments (Toast, Revel)
- Multi-location support (all SaaS competitors)
- Online ordering integration (Toast, Square)
- Advanced KDS with aging/speed metrics (Toast, Revel)
- Full accounting (Odoo, ERPNext)
- HR/Labor management (Toast, Revel)

---

## 4. Security Comparison

| Security Feature | AppGrav | Odoo | Toast | Square | Revel |
|-----------------|---------|------|-------|--------|-------|
| **DB-level security (RLS)** | Yes | No (ORM only) | Cloud-managed | Cloud-managed | Cloud-managed |
| **PIN auth** | Yes (bcrypt) | Yes | Yes | Yes | Yes |
| **2FA/MFA** | No | TOTP (Enterprise) | Yes | Yes | Yes |
| **Rate limiting** | DB-level only | None | Edge + app | Edge + app | Edge + app |
| **Audit logging** | Yes | Chatter | Full | Full | Full |
| **Permission granularity** | 70+ codes | Groups + rules | 100+ codes | Scopes | 100+ codes |
| **Session management** | UUID tokens | Cookies | OAuth2 + JWT | OAuth2 | OAuth2 |
| **Data encryption at rest** | No | No | Yes | Yes | Yes |
| **PCI compliance** | N/A | N/A | Level 1 | Level 1 | Level 1 |

---

## 5. Indonesian Market Fit

| Feature | AppGrav | Moka POS | Pawoon | Majoo | Loyverse |
|---------|---------|----------|--------|-------|----------|
| **IDR Currency** | Yes | Yes | Yes | Yes | Yes |
| **QRIS Integration** | Manual | Integrated | Integrated | Integrated | No |
| **e-Faktur** | No | Yes | No | Yes | No |
| **Bahasa Indonesia** | No (English) | Yes | Yes | Yes | Yes |
| **Tax 11% PPN** | Configurable | Yes | Yes | Yes | Yes |
| **Offline Mode** | Full | SQLite cache | Limited | Yes | SQLite |
| **Recipe/BOM** | Yes | No | No | Basic | No |
| **Open API** | Supabase | Limited | No | Limited | Yes |
| **Price** | Self-hosted | Subscription | Subscription | Subscription | Free tier |
| **POS Hardware** | Any browser | Android | Android | Any | iOS/Android |

### AppGrav Advantages in Indonesia
1. **Full offline mode** - Critical for Lombok's connectivity
2. **Self-hosted** - No recurring SaaS fees
3. **Recipe/BOM** - Important for bakery operations
4. **Open database** - PostgreSQL, full data ownership
5. **Customizable** - Open codebase vs locked SaaS

### AppGrav Gaps in Indonesia
1. **No QRIS integration** - Increasingly mandatory
2. **No e-Faktur** - Required for PKP businesses
3. **English only** - Staff may prefer Bahasa Indonesia
4. **No Bahasa** - i18n suspended

---

## 6. Technical Quality Comparison

| Metric | AppGrav | Odoo | ERPNext | Average SaaS |
|--------|---------|------|---------|-------------|
| **TypeScript** | Full | JavaScript | JavaScript | TypeScript |
| **Test coverage** | ~60% services | ~70% | ~50% | ~80% |
| **Code organization** | Feature-based | Module-based | DocType-based | Feature-based |
| **State management** | Zustand (12 stores) | OWL reactivity | Frappe | Redux/Zustand |
| **API design** | Auto-generated | JSON-RPC | REST | REST + GraphQL |
| **CI/CD** | Manual | GitHub Actions | GitHub Actions | Full pipeline |
| **Documentation** | Good (CLAUDE.md) | Extensive | Extensive | Varies |
| **Bundle size** | Unknown | Large | Medium | Optimized |

---

## 7. Deployment & Cost Comparison

| Aspect | AppGrav | Odoo Community | ERPNext | Toast | Square |
|--------|---------|---------------|---------|-------|--------|
| **Hosting** | Supabase (free/paid) | Self-hosted | Self-hosted | SaaS only | SaaS only |
| **Monthly cost** | ~$25 (Supabase Pro) | $0 (self-host) | $0 (self-host) | $75/terminal | $60/location |
| **Hardware** | Any browser device | Any | Any | Toast hardware | Square hardware |
| **Setup complexity** | Low | High | High | Low (vendor) | Low (vendor) |
| **Customization** | Full (source code) | Full (source) | Full (source) | API only | API only |
| **Maintenance** | Developer needed | Developer needed | Developer needed | Vendor managed | Vendor managed |
| **Scaling** | Supabase auto-scale | Manual | Manual | Automatic | Automatic |

---

## 8. Positioning Summary

### AppGrav's Sweet Spot
```
Single-location bakery/restaurant in Indonesia that needs:
- Reliable offline operation (connectivity issues)
- Full inventory + recipe management (bakery-specific)
- Low ongoing costs (self-hosted vs SaaS subscription)
- Customizable (open codebase)
- Modern stack (React, TypeScript, PostgreSQL)
```

### When to Choose AppGrav Over Alternatives

| Choose AppGrav if... | Choose Alternative if... |
|---------------------|------------------------|
| Single location, bakery/restaurant | Multi-location chain -> Lightspeed |
| Need offline in poor connectivity | Need integrated payments -> Toast |
| Want full data ownership | Want zero-maintenance -> Square |
| Developer available for customization | No developer available -> Moka/Loyverse |
| Budget-conscious (no SaaS fees) | Need full ERP (HR, accounting) -> Odoo |
| Indonesia-specific (IDR, tax) | US/EU market -> Toast/Square |

### Competitive Positioning Map

```
                    Feature Richness
                          |
                Full ERP  |  Odoo      ERPNext
                          |
              Restaurant  |     Toast      Revel
              Specialized |        Lightspeed
                          |   TouchBistro
                          |       AppGrav ★
                          |          Square
                          |    Loyverse
                Basic POS | Floreant  uniCenta
                          |
          ----------------+------------------------
          Local/Offline       Cloud-Native
                    Deployment Model
```

AppGrav occupies a unique position: **cloud-native architecture with strong offline capabilities** - a combination few competitors offer. Most systems are either fully cloud (Square) or fully local (Floreant). AppGrav bridges both worlds.
