-- Fix RLS to allow the bot (anon key) to insert/update subscribers and write logs

-- Ensure RLS is enabled
ALTER TABLE IF EXISTS public.subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.subscriber_activity_log ENABLE ROW LEVEL SECURITY;

-- Allow read (already exists, keep idempotent)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'subscribers' AND policyname = 'Allow read access to subscribers'
  ) THEN
    CREATE POLICY "Allow read access to subscribers" ON public.subscribers
      FOR SELECT USING (true);
  END IF;
END $$;

-- Allow insert for anon (bot) with no restriction
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'subscribers' AND policyname = 'Allow insert to subscribers (anon)'
  ) THEN
    CREATE POLICY "Allow insert to subscribers (anon)" ON public.subscribers
      FOR INSERT WITH CHECK (true);
  END IF;
END $$;

-- Allow update for anon (bot)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'subscribers' AND policyname = 'Allow update to subscribers (anon)'
  ) THEN
    CREATE POLICY "Allow update to subscribers (anon)" ON public.subscribers
      FOR UPDATE USING (true) WITH CHECK (true);
  END IF;
END $$;

-- Activity log: allow insert
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'subscriber_activity_log' AND policyname = 'Allow insert to activity logs (anon)'
  ) THEN
    CREATE POLICY "Allow insert to activity logs (anon)" ON public.subscriber_activity_log
      FOR INSERT WITH CHECK (true);
  END IF;
END $$;

