CREATE TABLE public.audit_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  company text,
  product_url text,
  product_type text NOT NULL,
  budget_range text,
  message text,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT INSERT ON public.audit_requests TO anon, authenticated;
GRANT ALL ON public.audit_requests TO service_role;

ALTER TABLE public.audit_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit an audit request"
ON public.audit_requests
FOR INSERT
TO anon, authenticated
WITH CHECK (true);