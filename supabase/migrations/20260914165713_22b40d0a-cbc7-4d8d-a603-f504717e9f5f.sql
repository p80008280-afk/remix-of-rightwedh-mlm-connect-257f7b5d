REVOKE ALL ON FUNCTION public.claim_reward(uuid, integer) FROM anon, authenticated, public;
REVOKE ALL ON FUNCTION public.expire_due_rewards(uuid) FROM anon, authenticated, public;
REVOKE ALL ON FUNCTION public.credit_rewards(uuid) FROM anon, authenticated, public;
GRANT EXECUTE ON FUNCTION public.claim_reward(uuid, integer) TO service_role;
GRANT EXECUTE ON FUNCTION public.expire_due_rewards(uuid) TO service_role;
GRANT EXECUTE ON FUNCTION public.credit_rewards(uuid) TO service_role;