CREATE TABLE public.redesign_chats (
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

CREATE INDEX redesign_chats_project_id_idx ON public.redesign_chats(project_id);
