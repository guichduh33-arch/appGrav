-- I9: Create cleanup function for idempotency_keys and sync_queue tables
-- These tables grow indefinitely without periodic cleanup.
-- This function should be called periodically via pg_cron or application-level scheduler.
--
-- To schedule with pg_cron (must be enabled in Supabase dashboard first):
--   SELECT cron.schedule('cleanup-old-records', '0 3 * * *', $$SELECT public.cleanup_old_records()$$);

CREATE OR REPLACE FUNCTION public.cleanup_old_records()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Delete idempotency keys older than 7 days
  DELETE FROM public.idempotency_keys WHERE created_at < NOW() - INTERVAL '7 days';

  -- Delete completed sync_queue entries older than 30 days
  DELETE FROM public.sync_queue WHERE status = 'completed' AND created_at < NOW() - INTERVAL '30 days';

  -- Delete failed sync_queue entries older than 7 days
  DELETE FROM public.sync_queue WHERE status = 'failed' AND created_at < NOW() - INTERVAL '7 days';
END;
$$;

COMMENT ON FUNCTION public.cleanup_old_records() IS
'Periodic cleanup of stale records from idempotency_keys (>7d) and sync_queue (completed >30d, failed >7d). Schedule via pg_cron: SELECT cron.schedule(''cleanup-old-records'', ''0 3 * * *'', $$SELECT public.cleanup_old_records()$$);';
