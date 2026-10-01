CREATE TABLE IF NOT EXISTS public.redesign_chats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  role TEXT NOT NULL,
  content TEXT NOT NULL,
  file_name TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, DELETE ON public.redesign_chats TO authenticated;
GRANT ALL ON public.redesign_chats TO service_role;

ALTER TABLE public.redesign_chats ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read own chat messages" ON public.redesign_chats
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users insert own chat messages" ON public.redesign_chats
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users delete own chat messages" ON public.redesign_chats
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS redesign_chats_project_created_at_idx
  ON public.redesign_chats(project_id, created_at);

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
    IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname='supabase_realtime' AND schemaname='public' AND tablename='redesign_chats') THEN
      ALTER PUBLICATION supabase_realtime ADD TABLE public.redesign_chats;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname='supabase_realtime' AND schemaname='public' AND tablename='project_files') THEN
      ALTER PUBLICATION supabase_realtime ADD TABLE public.project_files;
    END IF;
  END IF;
END
$$;

NOTIFY pgrst, 'reload schema';