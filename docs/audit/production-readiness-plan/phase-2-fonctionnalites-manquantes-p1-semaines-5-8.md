# Phase 2 : Fonctionnalites Manquantes P1 (Semaines 5-8)

## 2.1 Email Notifications (P1 - Impact High)
- [ ] Implementer edge function `send-email` avec SMTP (Resend/SendGrid)
- [ ] Templates : `order_confirmation`, `daily_summary`, `low_stock_alert`
- [ ] Tables : `email_templates`, `email_log` (avec RLS)
- [ ] UI : Activer le settings SMTP existant (`/settings/notifications`)

## 2.2 Integration QRIS/Midtrans (P1 - Impact High)
- [ ] Edge function `payment-webhook` pour notifications Midtrans
- [ ] Service `paymentGatewayService.ts` (QR generation, status check)
- [ ] Tables : `payment_transactions`, `payment_reconciliation`
- [ ] UI : QR code dans PaymentModal pour paiements QRIS
- [ ] Rapprochement quotidien automatique

## 2.3 KDS Ameliore (P2 - Impact Medium)
- [ ] Ticket aging avec couleurs (vert 0-5min, jaune 5-10min, rouge 10min+)
- [ ] Seuils configurables par station (deja dans settings Epic 10)
- [ ] Alertes audio pour tickets en retard
- [ ] Dashboard vitesse de service (avg prep time par station)
- [ ] Vue "all-day count" (compteur par produit en preparation)

---
