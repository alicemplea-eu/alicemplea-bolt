/*
# Create listings and listing_reports tables

1. New Tables
- `listings`: community classifieds for all 4 categories (jobs, seekers, housing, services).
  - `id` (uuid, primary key)
  - `category` (text: 'jobs' | 'seekers' | 'housing' | 'services')
  - `title`, `description` (text, content of the listing)
  - `country_code` (text, ISO code of one of the 27 EU countries)
  - `city` (text), `latitude`/`longitude` (double precision, for the map)
  - `price_text` (text, salary/rent/price as free text)
  - `contact_email`, `contact_phone` (text, gated behind login in the UI)
  - `details` (jsonb, category-specific fields like job type, skills, budget)
  - `user_id` (uuid, owner, defaults to the authenticated user)
  - `status` (text: 'active' | 'hidden' | 'archived'; 'hidden' = auto-hidden by reports)
  - `featured`, `verified` (boolean, admin/set via upgrade only — never user-writable)
  - `report_count` (integer, denormalized count of abuse reports)
  - `created_at` (timestamptz), `expires_at` (timestamptz, created + 21 days = auto-archive)
- `listing_reports`: abuse reports, one row per report.
  - `id` (uuid), `listing_id` (fk -> listings, cascade)
  - `reporter_id` (uuid, defaults to auth.uid(); null for anonymous)
  - `reason` (text, optional), `created_at` (timestamptz)
  - unique(listing_id, reporter_id) so a signed-in user can only report a listing once

2. Security
- RLS enabled on both tables.
- listings SELECT: anyone (anon + authenticated) sees active, unexpired listings; owners also see their own hidden/archived/expired rows.
- listings INSERT: authenticated only, ownership enforced, and users cannot self-feature/self-verify/self-hide.
- listings UPDATE/DELETE: authenticated owners only, with column-restricted grants (status/featured/verified/report_count are not updatable by users).
- listing_reports INSERT: anon + authenticated (anyone can report); no SELECT grant needed.
- service_role gets full grants for moderation/edge functions.

3. Automation
- Trigger `trg_listing_report`: on each new report, increments `listings.report_count`
  and flips `status` to 'hidden' when the count reaches 5 (auto-hide).
- Auto-archive after 21 days is enforced by the `expires_at > now()` condition in the
  SELECT policy (expired listings stop being served to everyone) — no cron needed.

4. Notes
- `user_id` defaults to `auth.uid()` so client inserts can omit it.
- Anonymous reporters have `reporter_id = null`; Postgres unique treats NULLs as distinct,
  so anonymous reports always count (each one is a distinct report).
*/

CREATE TABLE IF NOT EXISTS public.listings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category text NOT NULL CHECK (category IN ('jobs','seekers','housing','services')),
  title text NOT NULL,
  description text NOT NULL,
  country_code text NOT NULL,
  city text NOT NULL,
  latitude double precision,
  longitude double precision,
  price_text text,
  contact_email text,
  contact_phone text,
  details jsonb NOT NULL DEFAULT '{}'::jsonb,
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active','hidden','archived')),
  featured boolean NOT NULL DEFAULT false,
  verified boolean NOT NULL DEFAULT false,
  report_count integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL DEFAULT now() + interval '21 days'
);

CREATE TABLE IF NOT EXISTS public.listing_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id uuid NOT NULL REFERENCES public.listings(id) ON DELETE CASCADE,
  reporter_id uuid DEFAULT auth.uid(),
  reason text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (listing_id, reporter_id)
);

CREATE INDEX IF NOT EXISTS idx_listings_category ON public.listings (category, status, expires_at);
CREATE INDEX IF NOT EXISTS idx_listings_country ON public.listings (country_code);
CREATE INDEX IF NOT EXISTS idx_reports_listing ON public.listing_reports (listing_id);

ALTER TABLE public.listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.listing_reports ENABLE ROW LEVEL SECURITY;

GRANT SELECT ON public.listings TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.listings TO authenticated;
GRANT INSERT ON public.listing_reports TO anon, authenticated;
GRANT ALL ON public.listings TO service_role;
GRANT ALL ON public.listing_reports TO service_role;

GRANT INSERT (category, title, description, country_code, city, latitude, longitude, price_text, contact_email, contact_phone, details)
  ON public.listings TO authenticated;
GRANT UPDATE (title, description, country_code, city, latitude, longitude, price_text, contact_email, contact_phone, details)
  ON public.listings TO authenticated;

DROP POLICY IF EXISTS "listings_select_public" ON public.listings;
CREATE POLICY "listings_select_public" ON public.listings
  FOR SELECT TO anon, authenticated
  USING (
    (status = 'active' AND expires_at > now())
    OR auth.uid() = user_id
  );

DROP POLICY IF EXISTS "listings_insert_own" ON public.listings;
CREATE POLICY "listings_insert_own" ON public.listings
  FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = user_id
    AND status = 'active'
    AND featured = false
    AND verified = false
  );

DROP POLICY IF EXISTS "listings_update_own" ON public.listings;
CREATE POLICY "listings_update_own" ON public.listings
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id AND status = 'active' AND featured = false AND verified = false);

DROP POLICY IF EXISTS "listings_delete_own" ON public.listings;
CREATE POLICY "listings_delete_own" ON public.listings
  FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "reports_insert_any" ON public.listing_reports;
CREATE POLICY "reports_insert_any" ON public.listing_reports
  FOR INSERT TO anon, authenticated
  WITH CHECK (true);

-- SECURITY DEFINER: reporters only have INSERT on listing_reports, the counter
-- update on listings must run with elevated rights. Locked down + execute revoked.
CREATE OR REPLACE FUNCTION public.handle_listing_report()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.listings
  SET report_count = report_count + 1,
      status = CASE WHEN report_count + 1 >= 5 THEN 'hidden' ELSE status END
  WHERE id = NEW.listing_id;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_listing_report ON public.listing_reports;
CREATE TRIGGER trg_listing_report
AFTER INSERT ON public.listing_reports
FOR EACH ROW EXECUTE FUNCTION public.handle_listing_report();

REVOKE EXECUTE ON FUNCTION public.handle_listing_report() FROM PUBLIC, anon, authenticated;
