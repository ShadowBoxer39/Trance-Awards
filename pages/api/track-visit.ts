// pages/api/track-visit.ts
import type { NextApiRequest, NextApiResponse } from "next";
import supabase from "../../lib/supabaseServer";
import { getClientIp, isFromIsrael } from "../../lib/geo"; // Using existing geo utilities

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, error: "method_not_allowed" });
  }

  const { type, data } = req.body; // 'type' can be 'entry' or 'exit'

  if (!type || !data) {
    return res.status(400).json({ ok: false, error: "missing_payload" });
  }

  const ip = getClientIp(req);
  const userAgent = req.headers["user-agent"] || "";
  
  try {
    if (type === "entry") {
      // --- HANDLE PAGE ENTRY ---
      const geoResult = await isFromIsrael(ip);
      const isIsrael = geoResult; // Assuming isFromIsrael returns boolean directly

      const { error } = await supabase
        .from("site_visits")
        .insert([
          {
            visitor_id: data.id,
            page: data.page,
            referrer: data.referrer,
            user_agent: userAgent,
            entry_time: data.entryTime,
            client_ip: ip,
            is_israel: isIsrael,
          },
        ]);

      if (error) throw error;
      return res.status(200).json({ ok: true, message: "Entry recorded" });

    } else if (type === "exit") {
      // --- HANDLE PAGE EXIT (Update duration) ---
      if (!data.duration) {
        return res.status(400).json({ ok: false, error: "missing_duration" });
      }

      // Find the existing entry using the unique visitor ID provided by the client
      const { error } = await supabase
        .from("site_visits")
        .update({
          exit_time: data.exitTime,
          duration: data.duration, // in seconds
        })
        .eq("visitor_id", data.id); // Match the unique ID

      if (error) throw error;
      return res.status(200).json({ ok: true, message: "Exit recorded" });
    }

    return res.status(400).json({ ok: false, error: "invalid_type" });
  } catch (e) {
    console.error("Tracking error:", e);
    return res.status(500).json({ ok: false, error: "server_db_error" });
  }
}
