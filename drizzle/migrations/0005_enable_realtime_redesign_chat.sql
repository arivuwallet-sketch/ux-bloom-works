-- Rezyn Chat live agent updates.
-- Idempotently add the chat and project file tables to Supabase Realtime so
-- clients can receive persisted agent-stage messages and file status changes.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
      AND schemaname = 'public'
      AND tablename = 'redesign_chats'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.redesign_chats;
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
      AND schemaname = 'public'
      AND tablename = 'project_files'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.project_files;
  END IF;
END
$$;
