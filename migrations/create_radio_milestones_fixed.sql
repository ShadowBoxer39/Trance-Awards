-- Create radio_milestones table for tracking user achievements and events
-- Safe version that won't error if policies already exist

CREATE TABLE IF NOT EXISTS radio_milestones (
  id BIGSERIAL PRIMARY KEY,
  user_id TEXT,
  nickname TEXT,
  avatar_url TEXT,
  milestone_type TEXT NOT NULL,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_radio_milestones_created_at ON radio_milestones(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_radio_milestones_user_id ON radio_milestones(user_id);
CREATE INDEX IF NOT EXISTS idx_radio_milestones_type ON radio_milestones(milestone_type);

-- Enable RLS
ALTER TABLE radio_milestones ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Public milestones are viewable by everyone" ON radio_milestones;
DROP POLICY IF EXISTS "Service role can insert milestones" ON radio_milestones;

-- Create policies
CREATE POLICY "Public milestones are viewable by everyone"
  ON radio_milestones FOR SELECT
  USING (true);

CREATE POLICY "Service role can insert milestones"
  ON radio_milestones FOR INSERT
  WITH CHECK (true);

-- Comment
COMMENT ON TABLE radio_milestones IS 'Tracks user achievements and community milestones for the radio activity feed';

-- Done
SELECT 'radio_milestones table is ready!' as status;
