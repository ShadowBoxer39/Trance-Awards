// pages/api/admin/import-episodes.ts
// Visit this URL to import episodes: https://tracktrip.co.il/api/admin/import-episodes
// Add ?password=your_secret_password for security
 
import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

// ==========================================
// SECURITY: Change this password!
// ==========================================
const IMPORT_PASSWORD = process.env.ADMIN_IMPORT_PASSWORD || 'tracktrip2025'; // Change this!

// ==========================================
// CONFIGURATION
// ==========================================
const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;
const YOUTUBE_PLAYLIST_ID = 'PLKCB7UQ2dSpoIw7g9Mys-jw4yK7fOfU3d';
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// ==========================================
// HELPER FUNCTIONS
// ==========================================

function extractEpisodeNumber(title: string): number | null {
  const patterns = [
    /#(\d+)/,
    /פרק\s*(\d+)/,
    /episode\s*(\d+)/i,
    /ep\s*(\d+)/i,
    /\[(\d+)\]/,
    /^(\d+)\s*[-–—]/,
  ];

  for (const pattern of patterns) {
    const match = title.match(pattern);
    if (match && match[1]) {
      const num = parseInt(match[1], 10);
      if (num > 0 && num < 1000) return num;
    }
  }
  return null;
}

function cleanTitle(title: string): string {
  let cleaned = title;
  cleaned = cleaned.replace(/#\d+\s*[-–—]?\s*/g, '');
  cleaned = cleaned.replace(/פרק\s*\d+\s*[-–—]?\s*/g, '');
  cleaned = cleaned.replace(/episode\s*\d+\s*[-–—]?\s*/i, '');
  cleaned = cleaned.replace(/ep\s*\d+\s*[-–—]?\s*/i, '');
  cleaned = cleaned.replace(/^\d+\s*[-–—]\s*/, '');
  cleaned = cleaned.replace(/\[\d+\]\s*/, '');
  cleaned = cleaned.replace(/יוצאים לטראק\s*[-–—]?\s*/gi, '');
  cleaned = cleaned.replace(/track\s*trip\s*[-–—]?\s*/gi, '');
  cleaned = cleaned.replace(/\s+/g, ' ').trim();
  return cleaned;
}

function detectSpecialEpisode(title: string, description: string): {
  isSpecial: boolean;
  specialType: string | null;
} {
  const combinedText = `${title} ${description}`.toLowerCase();
  
  const specialKeywords = {
    interview: ['ראיון', 'interview', 'שיחה עם', 'talk with'],
    live: ['live', 'לייב', 'הופעה', 'set'],
    mix: ['mix', 'מיקס'],
    special: ['מיוחד', 'special', 'ספיישל'],
    celebration: ['חגיגה', 'celebration', 'יום הולדת', 'birthday'],
    collab: ['collab', 'קולאב', 'featuring', 'feat', 'ft'],
  };

  for (const [type, keywords] of Object.entries(specialKeywords)) {
    for (const keyword of keywords) {
      if (combinedText.includes(keyword)) {
        return { isSpecial: true, specialType: type };
      }
    }
  }
  return { isSpecial: false, specialType: null };
}

function generateSlug(title: string, episodeNumber: number | null): string {
  let slug = cleanTitle(title);

  const hebrewToEnglish: { [key: string]: string } = {
    'א': 'a', 'ב': 'b', 'ג': 'g', 'ד': 'd', 'ה': 'h', 'ו': 'v',
    'ז': 'z', 'ח': 'h', 'ט': 't', 'י': 'y', 'כ': 'k', 'ך': 'k',
    'ל': 'l', 'מ': 'm', 'ם': 'm', 'נ': 'n', 'ן': 'n', 'ס': 's',
    'ע': 'a', 'פ': 'p', 'ף': 'p', 'צ': 'ts', 'ץ': 'ts', 'ק': 'k',
    'ר': 'r', 'ש': 'sh', 'ת': 't'
  };

  slug = slug.split('').map(char => hebrewToEnglish[char] || char).join('');
  slug = slug.toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

  if (episodeNumber) {
    slug = `episode-${episodeNumber}-${slug}`;
  }

  if (slug.length > 100) {
    slug = slug.substring(0, 100).replace(/-[^-]*$/, '');
  }

  return slug || 'episode';
}

function parseDuration(isoDuration: string): number | null {
  if (!isoDuration) return null;
  const match = isoDuration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return null;

  const hours = parseInt(match[1] || '0', 10);
  const minutes = parseInt(match[2] || '0', 10);
  const seconds = parseInt(match[3] || '0', 10);

  return hours * 3600 + minutes * 60 + seconds;
}

// ==========================================
// MAIN HANDLER
// ==========================================

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Security check
  const { password } = req.query;
  if (password !== IMPORT_PASSWORD) {
    return res.status(401).json({ 
      error: 'Unauthorized',
      message: 'Add ?password=YOUR_PASSWORD to the URL'
    });
  }

  // Validate environment variables
  if (!YOUTUBE_API_KEY) {
    return res.status(500).json({ error: 'Missing YOUTUBE_API_KEY' });
  }
  if (!SUPABASE_URL) {
    return res.status(500).json({ error: 'Missing NEXT_PUBLIC_SUPABASE_URL' });
  }
  if (!SUPABASE_SERVICE_KEY) {
    return res.status(500).json({ error: 'Missing SUPABASE_SERVICE_ROLE_KEY' });
  }

  const logs: string[] = [];
  const log = (message: string) => {
    console.log(message);
    logs.push(message);
  };

  try {
    log('🚀 Starting YouTube to Supabase Import');
    log('='.repeat(60));

    // Step 1: Fetch playlist videos
    log('📺 Fetching videos from YouTube playlist...');
    const videos: any[] = [];
    let pageToken: string | undefined;
    let pageCount = 0;

    do {
      pageCount++;
      log(`   Fetching page ${pageCount}...`);

      const params = new URLSearchParams({
        part: 'snippet',
        playlistId: YOUTUBE_PLAYLIST_ID,
        maxResults: '50',
        key: YOUTUBE_API_KEY,
      });

      if (pageToken) {
        params.append('pageToken', pageToken);
      }

      const response = await fetch(
        `https://www.googleapis.com/youtube/v3/playlistItems?${params.toString()}`
      );

      if (!response.ok) {
        throw new Error(`YouTube API error: ${response.status}`);
      }

      const data = await response.json();

      const batch = (data.items || [])
        .filter((item: any) => item.snippet?.resourceId?.videoId)
        .map((item: any) => ({
          videoId: item.snippet.resourceId.videoId,
          title: item.snippet.title,
          description: item.snippet.description || '',
          publishedAt: item.snippet.publishedAt,
          thumbnailUrl: item.snippet.thumbnails?.high?.url ||
                        item.snippet.thumbnails?.medium?.url ||
                        item.snippet.thumbnails?.default?.url ||
                        '',
        }));

      videos.push(...batch);
      pageToken = data.nextPageToken;

      log(`   ✓ Got ${batch.length} videos (total: ${videos.length})`);

      await new Promise(resolve => setTimeout(resolve, 100));

    } while (pageToken);

    log(`✅ Fetched ${videos.length} videos total`);

    // Step 2: Fetch video details
    log('📊 Fetching video statistics...');
    const detailsMap = new Map<string, any>();
    const videoIds = videos.map(v => v.videoId);
    const batchSize = 50;

    for (let i = 0; i < videoIds.length; i += batchSize) {
      const batch = videoIds.slice(i, i + batchSize);
      
      log(`   Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(videoIds.length / batchSize)}...`);

      const params = new URLSearchParams({
        part: 'contentDetails,statistics',
        id: batch.join(','),
        key: YOUTUBE_API_KEY,
      });

      const response = await fetch(
        `https://www.googleapis.com/youtube/v3/videos?${params.toString()}`
      );

      if (response.ok) {
        const data = await response.json();
        for (const item of data.items || []) {
          detailsMap.set(item.id, {
            duration: item.contentDetails?.duration,
            viewCount: parseInt(item.statistics?.viewCount || '0', 10),
            likeCount: parseInt(item.statistics?.likeCount || '0', 10),
            commentCount: parseInt(item.statistics?.commentCount || '0', 10),
          });
        }
      }

      await new Promise(resolve => setTimeout(resolve, 100));
    }

    log(`✅ Fetched details for ${detailsMap.size} videos`);

    // Step 3: Prepare episodes data
    log('💾 Preparing episodes data...');
    const episodes = videos.map(video => {
      const details = detailsMap.get(video.videoId);
      const episodeNumber = extractEpisodeNumber(video.title);
      const cleanedTitle = cleanTitle(video.title);
      const { isSpecial, specialType } = detectSpecialEpisode(video.title, video.description);
      const slug = generateSlug(cleanedTitle, episodeNumber);

      return {
        youtube_video_id: video.videoId,
        youtube_playlist_id: YOUTUBE_PLAYLIST_ID,
        episode_number: episodeNumber,
        title: video.title,
        clean_title: cleanedTitle,
        description: video.description,
        published_at: video.publishedAt,
        thumbnail_url: video.thumbnailUrl,
        duration: details ? parseDuration(details.duration) : null,
        view_count: details?.viewCount || null,
        like_count: details?.likeCount || null,
        comment_count: details?.commentCount || null,
        is_special: isSpecial,
        special_type: specialType,
        slug: slug,
        is_published: true,
      };
    });

    // Sort by episode number
    episodes.sort((a, b) => {
      if (a.episode_number && b.episode_number) {
        return a.episode_number - b.episode_number;
      }
      if (a.episode_number && !b.episode_number) return -1;
      if (!a.episode_number && b.episode_number) return 1;
      return new Date(a.published_at).getTime() - new Date(b.published_at).getTime();
    });

    // Step 4: Import to Supabase
    log('📥 Importing to Supabase...');
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

    const { data, error } = await supabase
      .from('episodes')
      .upsert(episodes, { 
        onConflict: 'youtube_video_id',
        ignoreDuplicates: false 
      })
      .select();

    if (error) {
      throw new Error(`Supabase error: ${error.message}`);
    }

    log(`✅ Imported ${episodes.length} episodes successfully!`);

    // Step 5: Generate statistics
    const stats = {
      total: episodes.length,
      withNumbers: episodes.filter(e => e.episode_number !== null).length,
      withoutNumbers: episodes.filter(e => e.episode_number === null).length,
      special: episodes.filter(e => e.is_special).length,
      totalViews: episodes.reduce((sum, e) => sum + (e.view_count || 0), 0),
      totalLikes: episodes.reduce((sum, e) => sum + (e.like_count || 0), 0),
    };

    log('='.repeat(60));
    log('📊 STATISTICS');
    log(`Total episodes: ${stats.total}`);
    log(`With episode numbers: ${stats.withNumbers}`);
    log(`Without episode numbers: ${stats.withoutNumbers}`);
    log(`Special episodes: ${stats.special}`);
    log(`Total views: ${stats.totalViews.toLocaleString()}`);
    log(`Total likes: ${stats.totalLikes.toLocaleString()}`);
    log('='.repeat(60));

    // Return success response
    return res.status(200).json({
      success: true,
      message: 'Import completed successfully!',
      stats,
      episodes: episodes.slice(0, 5), // Show first 5 as sample
      logs,
    });

  } catch (error: any) {
    log(`❌ Error: ${error.message}`);
    return res.status(500).json({
      success: false,
      error: error.message,
      logs,
    });
  }
}

// Increase timeout for this endpoint (Vercel limit is 10s for hobby plan)
export const config = {
  api: {
    responseLimit: false,
  },
};
