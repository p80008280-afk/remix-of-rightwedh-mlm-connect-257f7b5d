CREATE EXTENSION IF NOT EXISTS pg_cron;
SELECT cron.schedule('expire-lapsed-members', '35 18 * * *', $$SELECT public.expire_lapsed_members();$$);