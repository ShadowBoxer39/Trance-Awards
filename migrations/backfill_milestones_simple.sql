-- Simplified backfill script that avoids JOIN issues
-- Run this AFTER creating the radio_milestones table

-- 1. Add listening hour milestones for top listeners
WITH listener_milestones AS (
  SELECT
    user_id,
    nickname,
    avatar_url,
    FLOOR(total_seconds / 3600) as hours,
    created_at,
    CASE
      WHEN FLOOR(total_seconds / 3600) >= 500 THEN 500
      WHEN FLOOR(total_seconds / 3600) >= 250 THEN 250
      WHEN FLOOR(total_seconds / 3600) >= 100 THEN 100
      WHEN FLOOR(total_seconds / 3600) >= 50 THEN 50
      WHEN FLOOR(total_seconds / 3600) >= 25 THEN 25
      WHEN FLOOR(total_seconds / 3600) >= 10 THEN 10
      WHEN FLOOR(total_seconds / 3600) >= 5 THEN 5
      WHEN FLOOR(total_seconds / 3600) >= 1 THEN 1
      ELSE NULL
    END as milestone_hours
  FROM radio_listeners
  WHERE total_seconds > 0
)
INSERT INTO radio_milestones (user_id, nickname, avatar_url, milestone_type, metadata, created_at)
SELECT
  user_id,
  nickname,
  avatar_url,
  'listening_hours',
  jsonb_build_object('hours', milestone_hours),
  created_at + (milestone_hours || ' hours')::interval
FROM listener_milestones
WHERE milestone_hours IS NOT NULL
ORDER BY milestone_hours DESC
LIMIT 50;

-- 2. Add first signup milestones for recent 20 users
INSERT INTO radio_milestones (user_id, nickname, avatar_url, milestone_type, metadata, created_at)
SELECT
  user_id,
  nickname,
  avatar_url,
  'first_signup',
  '{}'::jsonb,
  created_at
FROM radio_listeners
ORDER BY created_at DESC
LIMIT 20;

-- 3. Add track like milestones for top tracks
DO $$
DECLARE
  track_record RECORD;
  highest_milestone INT;
BEGIN
  FOR track_record IN
    SELECT track, artist, likes
    FROM get_top_tracks(50)
    WHERE likes >= 5
  LOOP
    highest_milestone := CASE
      WHEN track_record.likes >= 50 THEN 50
      WHEN track_record.likes >= 25 THEN 25
      WHEN track_record.likes >= 10 THEN 10
      WHEN track_record.likes >= 5 THEN 5
      ELSE NULL
    END;

    IF highest_milestone IS NOT NULL THEN
      INSERT INTO radio_milestones (user_id, nickname, avatar_url, milestone_type, metadata, created_at)
      VALUES (
        NULL,
        NULL,
        NULL,
        'track_milestone_likes',
        jsonb_build_object(
          'track_name', track_record.track,
          'artist_name', track_record.artist,
          'like_count', highest_milestone
        ),
        NOW() - (random() * interval '30 days')
      );
    END IF;
  END LOOP;
END $$;

-- Done! Check results
SELECT
  milestone_type,
  COUNT(*) as count
FROM radio_milestones
GROUP BY milestone_type
ORDER BY count DESC;

SELECT 'Backfill complete! Activity feed is ready.' as status;
