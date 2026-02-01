// pages/api/process-signups.ts
// Marks signups as processed up to and including a specific stage name
import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }

  const { key, stageName, processAll } = req.body;
  const ADMIN_KEY = process.env.ADMIN_KEY;

  if (!key || key !== ADMIN_KEY) {
    return res.status(401).json({ ok: false, error: 'Unauthorized' });
  }

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    return res.status(500).json({ ok: false, error: 'Supabase config missing' });
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  try {
    // First, get all unprocessed signups ordered by submission date
    const { data: allSignups, error: fetchError } = await supabase
      .from('young_artists')
      .select('*')
      .or('processed.is.null,processed.eq.false')
      .order('submitted_at', { ascending: false });

    if (fetchError) throw fetchError;
    if (!allSignups) {
      return res.status(404).json({ ok: false, error: 'No signups found' });
    }

    let idsToProcess: string[];

    // If processAll is true, process all except the last 2
    if (processAll) {
      if (allSignups.length <= 2) {
        return res.status(200).json({
          ok: true,
          message: 'Only 2 or fewer signups remaining, nothing to process',
          processedCount: 0,
          remainingCount: allSignups.length
        });
      }
      // Process all except the last 2 (most recent)
      const signupsToProcess = allSignups.slice(2);
      idsToProcess = signupsToProcess.map(s => s.id);
    } else {
      // Find the index of the specified stage name (case-insensitive)
      const targetIndex = allSignups.findIndex(s =>
        s.stage_name?.toLowerCase() === stageName?.toLowerCase()
      );

      if (targetIndex === -1) {
        return res.status(404).json({
          ok: false,
          error: `Stage name "${stageName}" not found. Available names: ${allSignups.slice(0, 5).map(s => s.stage_name).join(', ')}...`
        });
      }

      // Get all signups from the target onwards (including it)
      const signupsToProcess = allSignups.slice(targetIndex);
      idsToProcess = signupsToProcess.map(s => s.id);
    }

    if (idsToProcess.length === 0) {
      return res.status(200).json({ ok: true, message: 'No signups to process', processedCount: 0 });
    }

    // Mark all these signups as processed
    const { error: updateError } = await supabase
      .from('young_artists')
      .update({ processed: true })
      .in('id', idsToProcess);

    if (updateError) throw updateError;

    return res.status(200).json({
      ok: true,
      message: `Marked ${idsToProcess.length} signups as processed up to and including "${stageName}"`,
      processedCount: idsToProcess.length,
      remainingCount: allSignups.length - idsToProcess.length
    });

  } catch (error: any) {
    console.error('Process signups error:', error);
    return res.status(500).json({ ok: false, error: error?.message || 'Error processing signups' });
  }
}
