import type { NextApiRequest, NextApiResponse } from "next";
import supabase from "../../lib/supabaseServer";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ ok: false, error: "method_not_allowed" });
  }

  try {
    const body = req.body ?? {};
    const selections = (body as any).selections;

    if (!selections || typeof selections !== "object") {
      return res.status(400).json({ ok: false, error: "invalid_payload" });
    }

    const { error } = await supabase.from("votes").insert({
      selections, // JSONB column
    });

    if (error) {
      console.error("DB insert error:", error);
      return res.status(500).json({ ok: false, error: "db_error", details: error.message });
    }

    return res.status(200).json({ ok: true });
  } catch (e: any) {
    console.error("submit-vote server error:", e);
    return res.status(500).json({ ok: false, error: "server_error", details: e?.message });
  }
}
