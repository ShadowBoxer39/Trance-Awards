// pages/api/admin/radio-stats.ts
import { createClient } from '@supabase/supabase-js';
import type { NextApiRequest, NextApiResponse } from 'next';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { key } = req.query;
  if (key !== process.env.ADMIN_KEY) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    // Get total listeners and their stats
    const { data: listeners, error: listenersError } = await supabase
      .from('radio_listeners')
      .select('user_id, total_seconds, last_listened_at, created_at');

    if (listenersError) throw listenersError;

    // Calculate stats
    const totalListeners = listeners?.length || 0;

    // For now, estimate PWA installs based on milestones (we'll add proper tracking later)
    const { data: pwaInstallMilestones } = await supabase
      .from('radio_milestones')
      .select('user_id')
      .eq('milestone_type', 'pwa_installed');

    const pwaInstalls = pwaInstallMilestones?.length || 0;

    // Calculate average listening time (in hours)
    const totalListeningSeconds = listeners?.reduce((sum, l) => sum + (l.total_seconds || 0), 0) || 0;
    const avgListeningHours = totalListeners > 0 ? (totalListeningSeconds / totalListeners / 3600).toFixed(1) : '0';

    // Active listeners (listened in last 7 days)
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const activeListeners = listeners?.filter(l =>
      l.last_listened_at && new Date(l.last_listened_at) > new Date(sevenDaysAgo)
    ).length || 0;

    // Active listeners (listened in last 30 days)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    const activeListeners30d = listeners?.filter(l =>
      l.last_listened_at && new Date(l.last_listened_at) > new Date(thirtyDaysAgo)
    ).length || 0;

    // Get milestone stats
    const { data: milestones, error: milestonesError } = await supabase
      .from('radio_milestones')
      .select('milestone_type, metadata, created_at')
      .order('created_at', { ascending: false });

    if (milestonesError) throw milestonesError;

    // Count milestone types
    const listeningMilestones = milestones?.filter(m => m.milestone_type === 'listening_hours') || [];
    const voteMilestones = milestones?.filter(m => m.milestone_type === 'votes_cast') || [];

    // Get top listening milestones reached
    const topListeningMilestones = listeningMilestones
      .map(m => m.metadata?.hours || 0)
      .sort((a, b) => b - a)
      .slice(0, 5);

    // Recent activity (last 30 days)
    const recentMilestones = milestones?.filter(m =>
      new Date(m.created_at) > new Date(thirtyDaysAgo)
    ).length || 0;

    // Get top listeners
    const topListeners = listeners
      ?.sort((a, b) => (b.total_seconds || 0) - (a.total_seconds || 0))
      .slice(0, 10)
      .map(l => ({
        user_id: l.user_id,
        hours: ((l.total_seconds || 0) / 3600).toFixed(1),
        last_active: l.last_listened_at
      })) || [];

    // New listeners in last 30 days
    const newListeners = listeners?.filter(l =>
      l.created_at && new Date(l.created_at) > new Date(thirtyDaysAgo)
    ).length || 0;

    // PWA adoption rate
    const pwaAdoptionRate = totalListeners > 0 ? ((pwaInstalls / totalListeners) * 100).toFixed(1) : '0';

    // Calculate retention (listeners who came back after first session)
    const retention = listeners?.filter(l =>
      l.total_seconds && l.total_seconds > 300 // more than 5 minutes
    ).length || 0;
    const retentionRate = totalListeners > 0 ? ((retention / totalListeners) * 100).toFixed(1) : '0';

    return res.status(200).json({
      ok: true,
      stats: {
        totalListeners,
        pwaInstalls,
        pwaAdoptionRate: parseFloat(pwaAdoptionRate),
        avgListeningHours: parseFloat(avgListeningHours),
        activeListeners7d: activeListeners,
        activeListeners30d: activeListeners30d,
        newListeners30d: newListeners,
        totalMilestones: milestones?.length || 0,
        listeningMilestones: listeningMilestones.length,
        voteMilestones: voteMilestones.length,
        topListeningMilestones,
        recentActivity30d: recentMilestones,
        topListeners,
        totalListeningHours: (totalListeningSeconds / 3600).toFixed(0),
        retentionRate: parseFloat(retentionRate)
      }
    });
  } catch (error: any) {
    console.error('Error fetching radio stats:', error);
    return res.status(500).json({ error: error.message });
  }
}
