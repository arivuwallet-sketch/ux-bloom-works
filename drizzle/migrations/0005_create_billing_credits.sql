CREATE TABLE public.user_credits (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  balance integer NOT NULL DEFAULT 0 CHECK (balance >= 0),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.user_credits TO authenticated;
GRANT ALL ON public.user_credits TO service_role;
ALTER TABLE public.user_credits ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own credits" ON public.user_credits FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE TABLE public.credit_purchases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  order_id text NOT NULL UNIQUE,
  pack_id text NOT NULL,
  credits integer NOT NULL CHECK (credits > 0),
  amount numeric(12,2) NOT NULL,
  currency text NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  cf_payment_id text,
  created_at timestamptz NOT NULL DEFAULT now(),
  paid_at timestamptz
);
CREATE INDEX credit_purchases_user_idx ON public.credit_purchases(user_id, created_at DESC);
GRANT SELECT ON public.credit_purchases TO authenticated;
GRANT ALL ON public.credit_purchases TO service_role;
ALTER TABLE public.credit_purchases ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own purchases" ON public.credit_purchases FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE TABLE public.project_unlocks (
  project_id uuid PRIMARY KEY REFERENCES public.projects(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.project_unlocks TO authenticated;
GRANT ALL ON public.project_unlocks TO service_role;
ALTER TABLE public.project_unlocks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own unlocks" ON public.project_unlocks FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- Spend one credit to unlock a project (idempotent). Returns true when the project is unlocked.
CREATE OR REPLACE FUNCTION public.unlock_project(_project_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _uid uuid := auth.uid();
  _owner uuid;
  _updated integer;
BEGIN
  IF _uid IS NULL THEN RETURN false; END IF;
  SELECT user_id INTO _owner FROM public.projects WHERE id = _project_id;
  IF _owner IS NULL OR _owner <> _uid THEN RETURN false; END IF;
  IF EXISTS (SELECT 1 FROM public.project_unlocks WHERE project_id = _project_id) THEN RETURN true; END IF;
  UPDATE public.user_credits SET balance = balance - 1, updated_at = now()
    WHERE user_id = _uid AND balance > 0;
  GET DIAGNOSTICS _updated = ROW_COUNT;
  IF _updated = 0 THEN RETURN false; END IF;
  INSERT INTO public.project_unlocks(project_id, user_id) VALUES (_project_id, _uid)
    ON CONFLICT (project_id) DO NOTHING;
  RETURN true;
END;
$$;
REVOKE ALL ON FUNCTION public.unlock_project(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.unlock_project(uuid) TO authenticated;

-- Mark an order paid and add credits exactly once. Server-only.
CREATE OR REPLACE FUNCTION public.fulfill_credit_purchase(_order_id text, _cf_payment_id text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _row public.credit_purchases%ROWTYPE;
BEGIN
  UPDATE public.credit_purchases
    SET status = 'paid', paid_at = now(), cf_payment_id = _cf_payment_id
    WHERE order_id = _order_id AND status <> 'paid'
    RETURNING * INTO _row;
  IF NOT FOUND THEN RETURN false; END IF;
  INSERT INTO public.user_credits(user_id, balance) VALUES (_row.user_id, _row.credits)
    ON CONFLICT (user_id) DO UPDATE SET balance = public.user_credits.balance + EXCLUDED.balance, updated_at = now();
  RETURN true;
END;
$$;
REVOKE ALL ON FUNCTION public.fulfill_credit_purchase(text, text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.fulfill_credit_purchase(text, text) TO service_role;