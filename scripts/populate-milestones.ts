// scripts/populate-milestones.ts
// Run this once to backfill milestones from existing data
// Usage: npx tsx scripts/populate-milestones.ts

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function populateMilestones() {
  console.log('🚀 Starting milestone population...\n');

  let totalInserted = 0;

  // 1. Backfill listening hour milestones
  console.log('📊 Fetching listening milestones...');
  const { data: listeners } = await supabase
    .from('radio_listeners')
    .select('user_id, nickname, avatar_url, total_seconds, created_at')
    .order('total_seconds', { ascending: false });

  if (listeners) {
    const milestoneThresholds = [1, 5, 10, 25, 50, 100, 250, 500];

    for (const listener of listeners) {
      const hours = Math.floor(listener.total_seconds / 3600);

      // Find all milestones this user has passed
      const passedMilestones = milestoneThresholds.filter(m => hours >= m);

      // Create a milestone for each threshold passed (use created_at + offset for timestamps)
      for (let i = 0; i < passedMilestones.length; i++) {
        const milestone = passedMilestones[i];

        // Create timestamps spread over the past (more recent = higher milestones)
        const daysAgo = (passedMilestones.length - i) * 2; // Space them out
        const timestamp = new Date();
        timestamp.setDate(timestamp.getDate() - daysAgo);

        await supabase
          .from('radio_milestones')
          .insert({
            user_id: listener.user_id,
            nickname: listener.nickname,
            avatar_url: listener.avatar_url,
            milestone_type: 'listening_hours',
            metadata: { hours: milestone },
            created_at: timestamp.toISOString()
          });

        totalInserted++;
      }
    }
    console.log(`✅ Added ${totalInserted} listening hour milestones\n`);
  }

  // 2. Backfill first signup milestones
  console.log('👋 Fetching signup milestones...');
  const { data: allListeners } = await supabase
    .from('radio_listeners')
    .select('user_id, nickname, avatar_url, created_at')
    .order('created_at', { ascending: false })
    .limit(20); // Only get recent 20 signups

  if (allListeners) {
    for (const listener of allListeners) {
      await supabase
        .from('radio_milestones')
        .insert({
          user_id: listener.user_id,
          nickname: listener.nickname,
          avatar_url: listener.avatar_url,
          milestone_type: 'first_signup',
          metadata: {},
          created_at: listener.created_at
        });

      totalInserted++;
    }
    console.log(`✅ Added ${allListeners.length} signup milestones\n`);
  }

  // 3. Backfill track like milestones for top tracks
  console.log('❤️ Fetching track like milestones...');

  // Get top tracks with their like counts
  const { data: topTracks, error } = await supabase.rpc('get_top_tracks', { lim: 50 });

  if (topTracks) {
    const likeMilestones = [5, 10, 25, 50];

    for (const track of topTracks) {
      const likeCount = track.likes || 0;

      // Find the highest milestone this track has reached
      const reachedMilestones = likeMilestones.filter(m => likeCount >= m);

      if (reachedMilestones.length > 0) {
        // Only add the highest milestone reached
        const highestMilestone = reachedMilestones[reachedMilestones.length - 1];

        // Use a timestamp from the past (more likes = more recent)
        const daysAgo = Math.max(1, 30 - Math.floor(likeCount / 2));
        const timestamp = new Date();
        timestamp.setDate(timestamp.getDate() - daysAgo);

        await supabase
          .from('radio_milestones')
          .insert({
            user_id: null,
            nickname: null,
            avatar_url: null,
            milestone_type: 'track_milestone_likes',
            metadata: {
              track_name: track.track,
              artist_name: track.artist,
              like_count: highestMilestone
            },
            created_at: timestamp.toISOString()
          });

        totalInserted++;
      }
    }
    console.log(`✅ Added track like milestones for ${topTracks.length} tracks\n`);
  }

  // 4. Sample some recent "user liked track" events
  console.log('💜 Fetching recent like events...');
  const { data: recentLikes } = await supabase
    .from('radio_track_likes')
    .select('track_name, artist_name, user_fingerprint, created_at')
    .order('created_at', { ascending: false })
    .limit(30);

  if (recentLikes) {
    for (const like of recentLikes) {
      // Get user info if they're a registered listener
      const { data: listener } = await supabase
        .from('radio_listeners')
        .select('user_id, nickname, avatar_url')
        .eq('user_id', like.user_fingerprint)
        .maybeSingle();

      if (listener) {
        await supabase
          .from('radio_milestones')
          .insert({
            user_id: listener.user_id,
            nickname: listener.nickname,
            avatar_url: listener.avatar_url,
            milestone_type: 'track_liked',
            metadata: {
              track_name: like.track_name,
              artist_name: like.artist_name
            },
            created_at: like.created_at
          });

        totalInserted++;
      }
    }
    console.log(`✅ Added ${recentLikes.length} recent like events\n`);
  }

  console.log(`\n🎉 Done! Total milestones inserted: ${totalInserted}`);
  console.log('The activity feed should now have historical data.\n');
}

populateMilestones().catch(console.error);
