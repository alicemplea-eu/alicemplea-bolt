/*
# Admin controls: privileged listing actions + weekly official jobs

1. Purpose
- Gives the site owner (identified server-side by the email alicemplea.eu@gmail.com)
  a safe server-enforced way to moderate listings and publish weekly official jobs.
- All privileged checks happen in SECURITY DEFINER functions that verify the CALLER's
  session email — never trusting anything the browser sends.

2. New Tables
- `weekly_jobs` — official jobs published weekly by the admin:
  - `id` (uuid, primary key)
  - `title` (text, not null), `company` (text, not null, default 'Alicemplea Team')
  - `country_code` (text, not null, check ES/FR), `city` (text, not null)
  - `description` (text, not null), `apply_url` (text)
  - `published_at` (timestamptz, default now())

3. New Functions (all SECURITY DEFINER, search_path locked, EXECUTE revoked from anon)
- `is_admin()` — boolean; true only when the caller's session email is the admin email.
- `admin_update_listing(p_id, p_status, p_featured, p_verified)` — admin-only moderation:
  sets status ('active'|'hidden'|'archived'), featured, verified. Null = unchanged.
- `admin_delete_listing(p_id)` — admin-only delete of any listing.
- `admin_create_weekly_job(title, country, city, description, apply_url)` — admin-only insert.

4. Security changes
- RLS enabled on weekly_jobs. SELECT: public (anon + authenticated), jobs are public content.
  INSERT: admin-only via policy calling is_admin().
- Admin listing mutations run through SECURITY DEFINER functions; ordinary users keep
  their existing owner-scoped column-restricted grants untouched.
- service_role unchanged.

5. Notes
- The admin identity check uses auth.email() inside the database — the email cannot be
  forged by the client, since it comes from the signed JWT session.
- No destructive schema changes; existing tables and policies are untouched.
*/

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT coalesce(auth.email(), '') = 'alicemplea.eu@gmail.com';
$$;

CREATE TABLE IF NOT EXISTS public.weekly_jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  company text NOT NULL DEFAULT 'Alicemplea Team',
  country_code text NOT NULL CHECK (country_code IN ('ES','FR')),
  city text NOT NULL,
  description text NOT NULL,
  apply_url text,
  published_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_weekly_jobs_country ON public.weekly_jobs (country_code, published_at DESC);

ALTER TABLE public.weekly_jobs ENABLE ROW LEVEL SECURITY;

GRANT SELECT ON public.weekly_jobs TO anon, authenticated;
GRANT INSERT ON public.weekly_jobs TO authenticated;

DROP POLICY IF EXISTS "weekly_jobs_select_public" ON public.weekly_jobs;
CREATE POLICY "weekly_jobs_select_public" ON public.weekly_jobs
  FOR SELECT TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "weekly_jobs_insert_admin" ON public.weekly_jobs;
CREATE POLICY "weekly_jobs_insert_admin" ON public.weekly_jobs
  FOR INSERT TO authenticated
  WITH CHECK (public.is_admin());

CREATE OR REPLACE FUNCTION public.admin_update_listing(
  p_id uuid,
  p_status text,
  p_featured boolean,
  p_verified boolean
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

  IF p_status IS NOT NULL AND p_status NOT IN ('active','hidden','archived') THEN
    RAISE EXCEPTION 'Invalid status';
  END IF;

  UPDATE public.listings
  SET status = coalesce(p_status, status),
      featured = coalesce(p_featured, featured),
      verified = coalesce(p_verified, verified)
  WHERE id = p_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Listing not found';
  END IF;
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_delete_listing(p_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

  DELETE FROM public.listings WHERE id = p_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Listing not found';
  END IF;
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_create_weekly_job(
  p_title text,
  p_country text,
  p_city text,
  p_description text,
  p_apply_url text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

  IF p_country NOT IN ('ES','FR') THEN
    RAISE EXCEPTION 'Invalid country';
  END IF;

  IF length(trim(p_title)) = 0 OR length(trim(p_description)) = 0 THEN
    RAISE EXCEPTION 'Title and description are required';
  END IF;

  INSERT INTO public.weekly_jobs (title, country_code, city, description, apply_url)
  VALUES (trim(p_title), p_country, trim(p_city), trim(p_description), nullif(trim(p_apply_url), ''));
END;
$$;

REVOKE EXECUTE ON FUNCTION public.is_admin() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.admin_update_listing(uuid, text, boolean, boolean) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.admin_delete_listing(uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.admin_create_weekly_job(text, text, text, text, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_update_listing(uuid, text, boolean, boolean) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_delete_listing(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_create_weekly_job(text, text, text, text, text) TO authenticated;
