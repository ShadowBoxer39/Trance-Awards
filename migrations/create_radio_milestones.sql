-- Create radio_milestones table for tracking user achievements and events
-- Run this in your Supabase SQL Editor

CREATE TABLE IF NOT EXISTS radio_milestones (
  id BIGSERIAL PRIMARY KEY,
  user_id TEXT, -- User who achieved the milestone (nullable for system events)
  nickname TEXT, -- User nickname at time of milestone
  avatar_url TEXT, -- User avatar at time of milestone
  milestone_type TEXT NOT NULL, -- Type of milestone achieved
  metadata JSONB, -- Additional data (track_name, artist_name, hours, etc.)
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Milestone types:
-- 'listening_hours' - User reached X hours (metadata: { hours: 10 })
-- 'first_signup' - User joined for the first time
-- 'track_liked' - User liked a track (metadata: { track_name, artist_name })
-- 'track_submitted' - User submitted a track (metadata: { track_name })
-- 'track_milestone_likes' - Track reached X likes (metadata: { track_name, artist_name, like_count: 50 })
-- 'track_rank_one' - Track hit #1 on charts (metadata: { track_name, artist_name })
-- 'total_listeners' - Radio reached X total listeners (metadata: { count: 100 })

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_radio_milestones_created_at ON radio_milestones(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_radio_milestones_user_id ON radio_milestones(user_id);
CREATE INDEX IF NOT EXISTS idx_radio_milestones_type ON radio_milestones(milestone_type);

-- Enable Row Level Security (RLS)
ALTER TABLE radio_milestones ENABLE ROW LEVEL SECURITY;

-- Policy: Everyone can read milestones
CREATE POLICY "Public milestones are viewable by everyone"
  ON radio_milestones FOR SELECT
  USING (true);

-- Policy: Only authenticated users can insert milestones (via service role)
CREATE POLICY "Service role can insert milestones"
  ON radio_milestones FOR INSERT
  WITH CHECK (true);

-- Comment for documentation
COMMENT ON TABLE radio_milestones IS 'Tracks user achievements and community milestones for the radio activity feed';
