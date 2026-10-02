-- Rezyn SEO Agent
-- Keeps SEO optimization output separate from redesign output so SEO-only runs
-- never overwrite the visual reconstruction and combined runs can optimize the
-- already-redesigned source.

CREATE TABLE IF NOT EXISTS public.project_seo_plans (
  project_id uuid PRIMARY KEY REFERENCES public.projects(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'planning'
    CHECK (status IN ('planning', 'ready', 'optimizing', 'done', 'failed')),
  source_mode text NOT NULL DEFAULT 'original'
    CHECK (source_mode IN ('original', 'redesigned')),
  source_signature text NOT NULL,
  plan jsonb NOT NULL DEFAULT '{}'::jsonb,
  audit_before jsonb NOT NULL DEFAULT '{}'::jsonb,
  audit_after jsonb,
  score_before integer CHECK (score_before IS NULL OR (score_before >= 0 AND score_before <= 100)),
  score_after integer CHECK (score_after IS NULL OR (score_after >= 0 AND score_after <= 100)),
  error text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS project_seo_plans_user_idx
  ON public.project_seo_plans(user_id, updated_at DESC);

CREATE TABLE IF NOT EXISTS public.project_seo_files (
  project_file_id uuid PRIMARY KEY REFERENCES public.project_files(id) ON DELETE CASCADE,
  project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  source_signature text NOT NULL,
  status text NOT NULL DEFAULT 'queued'
    CHECK (status IN ('queued', 'optimizing', 'done', 'failed', 'skipped')),
  seo_content text,
  error text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS project_seo_files_project_idx
  ON public.project_seo_files(project_id, status, updated_at DESC);
CREATE INDEX IF NOT EXISTS project_seo_files_user_idx
  ON public.project_seo_files(user_id, updated_at DESC);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.project_seo_plans TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.project_seo_files TO authenticated;
GRANT ALL ON public.project_seo_plans TO service_role;
GRANT ALL ON public.project_seo_files TO service_role;

ALTER TABLE public.project_seo_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_seo_files ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users read own SEO plans" ON public.project_seo_plans;
CREATE POLICY "Users read own SEO plans"
  ON public.project_seo_plans FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users create own SEO plans" ON public.project_seo_plans;
CREATE POLICY "Users create own SEO plans"
  ON public.project_seo_plans FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM public.projects
      WHERE projects.id = project_id AND projects.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users update own SEO plans" ON public.project_seo_plans;
CREATE POLICY "Users update own SEO plans"
  ON public.project_seo_plans FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users delete own SEO plans" ON public.project_seo_plans;
CREATE POLICY "Users delete own SEO plans"
  ON public.project_seo_plans FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users read own SEO files" ON public.project_seo_files;
CREATE POLICY "Users read own SEO files"
  ON public.project_seo_files FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users create own SEO files" ON public.project_seo_files;
CREATE POLICY "Users create own SEO files"
  ON public.project_seo_files FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM public.projects
      WHERE projects.id = project_id AND projects.user_id = auth.uid()
    )
    AND EXISTS (
      SELECT 1 FROM public.project_files
      WHERE project_files.id = project_file_id
        AND project_files.project_id = project_id
        AND project_files.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users update own SEO files" ON public.project_seo_files;
CREATE POLICY "Users update own SEO files"
  ON public.project_seo_files FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users delete own SEO files" ON public.project_seo_files;
CREATE POLICY "Users delete own SEO files"
  ON public.project_seo_files FOR DELETE TO authenticated
  USING (auth.uid() = user_id);
