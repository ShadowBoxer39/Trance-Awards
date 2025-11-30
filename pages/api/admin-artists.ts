import type { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

type AdminArtistPayload = {
  id?: number;
  slug: string;
  name: string;
  stage_name: string;
  short_bio: string | null;
  profile_photo_url: string | null;
  started_year: number | null;
  spotify_artist_id: string | null;
  spotify_url: string | null;
  youtube_url: string | null;
  soundcloud_profile_url: string | null;
  instagram_url: string | null;
  tiktok_url: string | null;
  website_url: string | null;
  primary_color: string | null;
  festival_sets: any[] | null;
  instagram_reels: string[] | null;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { key } = req.query;

  if (!process.env.ADMIN_KEY) {
    return res
      .status(500)
      .json({ ok: false, error: "ADMIN_KEY env var is missing" });
  }

  if (key !== process.env.ADMIN_KEY) {
    return res.status(401).json({ ok: false, error: "unauthorized" });
  }

  if (req.method === "GET") {
    // list artists + their primary episode link
    const { data, error } = await supabase
      .from("artists")
      .select(
        `
        *,
        artist_episodes (
          episode_id,
          is_primary
        )
      `
      )
      .order("id", { ascending: true });

   if (error) {
  console.error(error);
  return res.status(500).json({ ok: false, error: error.message });
}

// map DB "bio" → UI field "short_bio"
const artists = (data || []).map((a: any) => ({
  ...a,
  short_bio: a.bio ?? null,
}));

return res.status(200).json({ ok: true, artists });


  if (req.method === "POST") {
  const { artist, primaryEpisodeId } = req.body as {
    artist: AdminArtistPayload & { artist_episodes?: any; short_bio?: string | null };
    primaryEpisodeId?: number | null;
  };

  if (!artist?.slug || !artist.stage_name) {
    return res.status(400).json({
      ok: false,
      error: "slug and stage_name are required",
    });
  }

  // Build payload for upsert – start from artist object
  const payload: any = { ...artist };

  // remove relation field
  delete payload.artist_episodes;

  // map short_bio -> bio (DB column) and then drop short_bio
  if (typeof payload.short_bio !== "undefined") {
    payload.bio = payload.short_bio;
  }
  delete payload.short_bio;

  // for new artists we don't send id so Supabase will insert
  if (!payload.id || payload.id === 0) {
    delete payload.id;
  }

  // normalize JSON fields
  if (!Array.isArray(payload.festival_sets)) {
    payload.festival_sets = [];
  }
  if (!Array.isArray(payload.instagram_reels)) {
    payload.instagram_reels = [];
  }

  const { data, error } = await supabase
    .from("artists")
    .upsert(payload)
    .select()
    .single();

  ...
}


    if (error) {
      console.error(error);
      return res.status(500).json({ ok: false, error: error.message });
    }

    // Handle primary episode mapping (artist_episodes)
    if (primaryEpisodeId) {
      // remove previous primary links
      await supabase
        .from("artist_episodes")
        .delete()
        .eq("artist_id", data.id)
        .eq("is_primary", true);

      // insert new link
      await supabase.from("artist_episodes").insert({
        artist_id: data.id,
        episode_id: primaryEpisodeId,
        role: "Guest",
        is_primary: true,
      });
    }

    return res.status(200).json({ ok: true, artist: data });
  }


  return res.status(405).json({ ok: false, error: "method not allowed" });
}
