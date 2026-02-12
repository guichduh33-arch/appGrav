# Phase 4 : Scale & Observabilite (Semaines 17-24)

## 4.1 Multi-Location (P3 - Effort Very High)
- [ ] Table `locations` + `location_transfers` + `location_transfer_items`
- [ ] Ajouter `location_id` sur `orders`, `stock_movements`, `pos_sessions`, `inventory_counts`
- [ ] Catalogue produit centralise, pricing par location
- [ ] Dashboard multi-location avec comparaison
- [ ] Transferts inter-locations

## 4.2 Monitoring & Observabilite
- [ ] Integration Sentry (error tracking + performance)
- [ ] Source maps pour production debugging
- [ ] Web Vitals (LCP, FID, CLS)
- [ ] Metriques business : sync failure rate, offline duration, checkout time

## 4.3 Tests E2E (Playwright)
- [ ] Setup Playwright avec fixtures
- [ ] 5 parcours critiques : POS checkout, offline order, void/refund, stock adjustment, shift management
- [ ] Integration CI/CD
- [ ] Tests de regression visuelle

## 4.4 Architecture Avancee (si necessaire)
- [ ] Evaluer SQLite via OPFS pour remplacer IndexedDB (meilleure performance offline)
- [ ] Delta sync avec `updated_at` tracking (remplacer full refresh)
- [ ] Parallelisation du sync engine (batch processing)
- [ ] API publique versionee (si besoin d'integrations tierces)

---
