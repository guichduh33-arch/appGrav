-- Migration: Create idempotency_keys table for sync deduplication
-- Sprint 3: Offline Improvements - Idempotency protection

CREATE TABLE IF NOT EXISTS public.idempotency_keys (
  key VARCHAR(255) PRIMARY KEY,
  entity_type VARCHAR(50) NOT NULL,
  entity_id UUID,
  response_status VARCHAR(20),
  created_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ DEFAULT now() + INTERVAL '24 hours'
);

CREATE INDEX idx_idempotency_expires ON public.idempotency_keys(expires_at);

ALTER TABLE public.idempotency_keys ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated access" ON public.idempotency_keys
  FOR ALL USING (auth.uid() IS NOT NULL);
