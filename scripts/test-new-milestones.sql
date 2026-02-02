-- Test script to populate new milestone types
-- Run this in Supabase SQL editor to test the new milestones locally

-- 1. Add some artist signup milestones
INSERT INTO radio_milestones (user_id, nickname, avatar_url, milestone_type, metadata, created_at)
VALUES
  (NULL, NULL, NULL, 'artist_signup', '{"artist_name": "DJ TestArtist"}'::jsonb, NOW() - interval '5 minutes'),
  (NULL, NULL, NULL, 'artist_signup', '{"artist_name": "Progressive Trance Master"}'::jsonb, NOW() - interval '15 minutes'),
  (NULL, NULL, NULL, 'artist_signup', '{"artist_name": "Uplifting Sounds"}'::jsonb, NOW() - interval '1 hour');

-- 2. Add some track first play milestones
INSERT INTO radio_milestones (user_id, nickname, avatar_url, milestone_type, metadata, created_at)
VALUES
  (NULL, NULL, NULL, 'track_first_play', '{"track_name": "Sunrise Emotions", "artist_name": "DJ TestArtist"}'::jsonb, NOW() - interval '3 minutes'),
  (NULL, NULL, NULL, 'track_first_play', '{"track_name": "Dreams of Tomorrow", "artist_name": "Progressive Trance Master"}'::jsonb, NOW() - interval '10 minutes'),
  (NULL, NULL, NULL, 'track_first_play', '{"track_name": "Euphoric Nights", "artist_name": "Uplifting Sounds"}'::jsonb, NOW() - interval '45 minutes');

-- 3. Add some track first like milestones (with user info)
-- Replace the user_id, nickname, and avatar_url with real data from your radio_listeners table
INSERT INTO radio_milestones (user_id, nickname, avatar_url, milestone_type, metadata, created_at)
SELECT
  user_id,
  nickname,
  avatar_url,
  'track_first_like',
  '{"track_name": "Sunrise Emotions", "artist_name": "DJ TestArtist"}'::jsonb,
  NOW() - interval '2 minutes'
FROM radio_listeners
WHERE nickname IS NOT NULL
LIMIT 1;

INSERT INTO radio_milestones (user_id, nickname, avatar_url, milestone_type, metadata, created_at)
SELECT
  user_id,
  nickname,
  avatar_url,
  'track_first_like',
  '{"track_name": "Dreams of Tomorrow", "artist_name": "Progressive Trance Master"}'::jsonb,
  NOW() - interval '8 minutes'
FROM radio_listeners
WHERE nickname IS NOT NULL
OFFSET 1
LIMIT 1;

-- Check results
SELECT
  id,
  nickname,
  milestone_type,
  metadata,
  created_at
FROM radio_milestones
WHERE milestone_type IN ('artist_signup', 'track_first_play', 'track_first_like')
ORDER BY created_at DESC
LIMIT 20;
