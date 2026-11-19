/*
# Grant EXECUTE on is_admin to authenticated

The weekly_jobs insert policy evaluates is_admin() in the context of the invoking
user, so authenticated needs EXECUTE. The function only returns a boolean derived
from the session email — no information exposure.
*/

GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;
