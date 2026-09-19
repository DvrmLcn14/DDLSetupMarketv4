-- ========================================================
-- DDL SETUP MARKETPLACE - SUPABASE DATABASE SCHEMA & POLICIES
-- Execute this SQL in Supabase SQL Editor (https://supabase.com/dashboard)
-- ========================================================

-- 1. Create 'setups' table
CREATE TABLE IF NOT EXISTS public.setups (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  game_id TEXT NOT NULL DEFAULT 'f1_25',
  track_id TEXT NOT NULL,
  car_name TEXT NOT NULL,
  creator_username TEXT NOT NULL,
  creator_badge TEXT DEFAULT 'Community',
  creator_avatar TEXT,
  best_lap_time TEXT DEFAULT '1:30.000',
  lap_time_seconds NUMERIC DEFAULT 90,
  average_rating NUMERIC DEFAULT 5.0,
  rating_count INTEGER DEFAULT 1,
  user_rating NUMERIC,
  condition TEXT DEFAULT 'Dry',
  type TEXT DEFAULT 'Qualifying',
  downforce_level TEXT DEFAULT 'Medium',
  date_added TEXT,
  downloads INTEGER DEFAULT 0,
  notes TEXT,
  specs JSONB NOT NULL DEFAULT '{}'::jsonb,
  input_device TEXT DEFAULT 'Wheel',
  is_user_submitted BOOLEAN DEFAULT true,
  proof_screenshot TEXT,
  is_proof_verified BOOLEAN DEFAULT false,
  verification_status TEXT DEFAULT 'verified',
  verification_notes TEXT,
  proof_timestamp TEXT,
  setup_screenshots JSONB DEFAULT '[]'::jsonb,
  custom_track_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create 'comments' table for real-time discussion
CREATE TABLE IF NOT EXISTS public.comments (
  id TEXT PRIMARY KEY,
  setup_id TEXT NOT NULL REFERENCES public.setups(id) ON DELETE CASCADE,
  parent_id TEXT,
  author_username TEXT NOT NULL,
  author_badge TEXT DEFAULT 'Community',
  author_avatar TEXT,
  content TEXT NOT NULL,
  likes INTEGER DEFAULT 0,
  tag TEXT DEFAULT 'General',
  is_pinned BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Enable Row Level Security (RLS) and grant public permissions
ALTER TABLE public.setups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

-- Allow public access for reading, inserting, updating, and deleting setups
CREATE POLICY "Allow public read access on setups" ON public.setups FOR SELECT USING (true);
CREATE POLICY "Allow public insert access on setups" ON public.setups FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access on setups" ON public.setups FOR UPDATE USING (true);
CREATE POLICY "Allow public delete access on setups" ON public.setups FOR DELETE USING (true);

-- Allow public access for reading, inserting, updating, and deleting comments
CREATE POLICY "Allow public read access on comments" ON public.comments FOR SELECT USING (true);
CREATE POLICY "Allow public insert access on comments" ON public.comments FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access on comments" ON public.comments FOR UPDATE USING (true);
CREATE POLICY "Allow public delete access on comments" ON public.comments FOR DELETE USING (true);

-- 4. Enable Realtime replication for instant cross-device updates
ALTER PUBLICATION supabase_realtime ADD TABLE public.setups;
ALTER PUBLICATION supabase_realtime ADD TABLE public.comments;
