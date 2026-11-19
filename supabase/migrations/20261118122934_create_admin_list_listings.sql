/*
# Admin listing feed function

1. Purpose
- The public SELECT policy on `listings` only exposes active, unexpired rows (plus a
  user's own rows), so the admin dashboard cannot see hidden, archived or reported
  listings through normal queries.
- Adds `admin_list_listings()`: a SECURITY DEFINER function that returns ALL listings
  (newest first) — but ONLY when the caller's session email is the admin email.

2. New Functions
- `admin_list_listings()` — returns SETOF listings; raises 'Not authorized' for anyone
  except the admin email. Locked search_path; EXECUTE revoked from PUBLIC and anon,
  granted to authenticated.

3. Security
- Uses the same is_admin() email check as the other admin functions; the email comes
  from the signed JWT, never from client input.
- No table or policy changes; ordinary users keep their existing access untouched.
*/

CREATE OR REPLACE FUNCTION public.admin_list_listings()
RETURNS SETOF public.listings
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;
  RETURN QUERY SELECT * FROM public.listings ORDER BY created_at DESC;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.admin_list_listings() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_list_listings() TO authenticated;
