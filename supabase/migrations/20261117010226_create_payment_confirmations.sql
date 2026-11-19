/*
# Create payment_confirmations table

1. Purpose
- Stores upgrade requests submitted by visitors who paid (or claim to have paid) for a
  "Featured Ad" listing upgrade via PayPal or USDT (TRC20) crypto transfers.
- The site owner (Alicemplea Team) reviews these records manually to verify payments
  and then activates the upgrade on the corresponding listing.

2. New Tables
- `payment_confirmations`
  - `id` (uuid, primary key, auto-generated)
  - `listing_title` (text, not null) — title of the listing to upgrade, entered by the user
  - `payment_method` (text, not null) — one of: PayPal, Binance (TRC20), Bybit (TRC20), RedotPay (TRC20)
  - `transaction_ref` (text, not null) — transaction ID / email reference supplied by the user
  - `status` (text, not null, default 'pending') — pending | approved | rejected, for owner review
  - `created_at` (timestamptz, default now())

3. Security
- RLS enabled.
- Grant INSERT to `anon` and `authenticated` only (visitors submit without signing in);
  no SELECT grant, so other visitors can never read anyone's payment data.
- Policies scoped TO anon, authenticated with insert-only write access.

4. Notes
- Table intentionally has no user_id: submissions are anonymous and reviewed manually
  against the supplied transaction reference.
*/

CREATE TABLE IF NOT EXISTS payment_confirmations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_title text NOT NULL,
  payment_method text NOT NULL,
  transaction_ref text NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE payment_confirmations ENABLE ROW LEVEL SECURITY;

GRANT INSERT ON payment_confirmations TO anon, authenticated;

DROP POLICY IF EXISTS "anon_insert_payment_confirmations" ON payment_confirmations;
CREATE POLICY "anon_insert_payment_confirmations"
ON payment_confirmations FOR INSERT
TO anon, authenticated
WITH CHECK (true);
