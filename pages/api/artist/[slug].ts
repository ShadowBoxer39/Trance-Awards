// pages/api/artist/[slug].ts
import type { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).json({
      ok: false,
      error: `Method ${req.method} Not Allowed`,
    });
  }

  const { slug } = req.query;

  if (!slug || typeof slug !== "string") {
    return res.status(400).json({
      ok: false,
      error: "Missing or invalid slug parameter",
    });
  }

  try {
    // Fetch artist by artist_id (slug)
    const { data: artist, error } = await supabase
      .from("featured_artists")
      .select("*")
      .eq("artist_id", slug.toLowerCase())
      .single();

    if (error && error.code !== "PGRST116") {
      console.error("Supabase error:", error);
      return res.status(500).json({
        ok: false,
        error: "Failed to fetch artist",
        details: error.message,
      });
    }

    if (!artist) {
      return res.status(404).json({
        ok: false,
        error: "Artist not found",
      });
    }

    return res.status(200).json({
      ok: true,
      artist,
    });
  } catch (error: any) {
    console.error("Unexpected error:", error);
    return res.status(500).json({
      ok: false,
      error: "Internal server error",
      details: error.message,
    });
  }
}
