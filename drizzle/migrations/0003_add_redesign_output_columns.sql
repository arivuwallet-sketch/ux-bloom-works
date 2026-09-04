ALTER TABLE public.project_files
  ADD COLUMN IF NOT EXISTS redesigned_content text,
  ADD COLUMN IF NOT EXISTS redesign_error text;

ALTER TABLE public.projects
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'draft';