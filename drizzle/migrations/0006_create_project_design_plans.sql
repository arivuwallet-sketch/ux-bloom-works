-- Project-level dependency/design plan generated before any file transformation.
CREATE TABLE IF NOT EXISTS public.project_design_plans (
  project_id uuid PRIMARY KEY REFERENCES public.projects(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'planning' CHECK (status IN ('planning', 'ready', 'failed')),
  source_signature text NOT NULL,
  style_signature text NOT NULL,
  dependency_graph jsonb NOT NULL DEFAULT '{}'::jsonb,
  plan jsonb NOT NULL DEFAULT '{}'::jsonb,
  error text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS project_design_plans_user_idx
  ON public.project_design_plans(user_id, updated_at DESC);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.project_design_plans TO authenticated;
GRANT ALL ON public.project_design_plans TO service_role;

ALTER TABLE public.project_design_plans ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users read own project design plans" ON public.project_design_plans;
CREATE POLICY "Users read own project design plans"
  ON public.project_design_plans FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users create own project design plans" ON public.project_design_plans;
CREATE POLICY "Users create own project design plans"
  ON public.project_design_plans FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM public.projects
      WHERE projects.id = project_id
        AND projects.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users update own project design plans" ON public.project_design_plans;
CREATE POLICY "Users update own project design plans"
  ON public.project_design_plans FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users delete own project design plans" ON public.project_design_plans;
CREATE POLICY "Users delete own project design plans"
  ON public.project_design_plans FOR DELETE TO authenticated
  USING (auth.uid() = user_id);
