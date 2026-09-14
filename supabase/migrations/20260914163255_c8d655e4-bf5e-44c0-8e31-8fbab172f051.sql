REVOKE EXECUTE ON FUNCTION public.admin_review_order(uuid, text, text) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.admin_review_withdrawal(uuid, text, text) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.credit_rewards(uuid) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.process_order_approval(uuid) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.process_withdrawal_approval(uuid) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.generate_member_code() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.generate_referral_code() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.grant_admin_for_owner_email() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC;

GRANT EXECUTE ON FUNCTION public.admin_review_order(uuid, text, text) TO service_role;
GRANT EXECUTE ON FUNCTION public.admin_review_withdrawal(uuid, text, text) TO service_role;
GRANT EXECUTE ON FUNCTION public.credit_rewards(uuid) TO service_role;
GRANT EXECUTE ON FUNCTION public.process_order_approval(uuid) TO service_role;
GRANT EXECUTE ON FUNCTION public.process_withdrawal_approval(uuid) TO service_role;
GRANT EXECUTE ON FUNCTION public.generate_member_code() TO service_role;
GRANT EXECUTE ON FUNCTION public.generate_referral_code() TO service_role;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated, service_role;