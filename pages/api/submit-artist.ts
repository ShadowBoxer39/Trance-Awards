// pages/api/submit-artist.ts - NEW API ROUTE
import type { NextApiRequest, NextApiResponse } from "next";
import supabase from "../../lib/supabaseServer"; // Reuse Supabase client

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, error: "method_not_allowed" });
  }

  // Ensure you collect all fields sent by the client (pages/young-artists.tsx)
  const { 
    fullName, 
    stageName, 
    age, 
    phone, 
    experienceYears, 
    inspirations, 
    trackLink 
  } = req.body;

  // Basic validation (you should add more)
  if (!fullName || !stageName || !phone || !trackLink) {
    return res.status(400).json({ ok: false, error: "missing_required_fields" });
  }

  try {
    const { data, error } = await supabase
      .from("young_artists") // <-- ASSUMES YOU HAVE A TABLE NAMED 'young_artists'
      .insert([
        {
          full_name: fullName,
          stage_name: stageName,
          age: age || null, // Allow age to be optional/null if not provided
          phone: phone,
          experience_years: experienceYears,
          inspirations: inspirations,
          track_link: trackLink,
          submitted_at: new Date().toISOString(),
        },
      ])
      .select();

    if (error) {
      console.error("Supabase insert error:", error);
      return res.status(500).json({ ok: false, error: "db_error" });
    }

    // Success! Send a response back to the client
    return res.status(200).json({ ok: true, id: data?.[0]?.id });
  } catch (e) {
    console.error("submit-artist server error:", e);
    return res.status(500).json({ ok: false, error: "server_error" });
  }
}
