import type { NextApiRequest, NextApiResponse } from "next";
import supabase from "../../../lib/supabaseServer";
import { randomBytes } from "crypto";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const adminKey = req.query.key || req.body?.key;

  if (adminKey !== process.env.ADMIN_KEY) {
    return res.status(401).json({ ok: false, error: "unauthorized" });
  }

  // GET - List all contributors
  if (req.method === "GET") {
    try {
      const { data: contributors, error } = await supabase
        .from("quiz_contributors")
        .select("*")
        .order("invited_at", { ascending: false });

      if (error) throw error;

      return res.status(200).json({ ok: true, contributors: contributors || [] });

    } catch (error) {
      console.error("Contributors GET error:", error);
      return res.status(500).json({ ok: false, error: "server_error" });
    }
  }

  // POST - Create invite or manage contributor
  if (req.method === "POST") {
    try {
      const { action, contributorId, name } = req.body;

      // Create new invite code
      if (action === "create-invite") {
        const inviteCode = randomBytes(8).toString("hex");

        const { data: contributor, error } = await supabase
          .from("quiz_contributors")
          .insert({
            name: name || "ממתין לרישום",
            invite_code: inviteCode,
            is_active: true,
          })
          .select()
          .single();

        if (error) throw error;

        return res.status(200).json({
          ok: true,
          contributor,
          inviteLink: `/quiz/contribute?code=${inviteCode}`,
        });
      }

      // Deactivate contributor
      if (action === "deactivate" && contributorId) {
        const { error } = await supabase
          .from("quiz_contributors")
          .update({ is_active: false })
          .eq("id", contributorId);

        if (error) throw error;

        return res.status(200).json({ ok: true, action: "deactivated" });
      }

      // Reactivate contributor
      if (action === "activate" && contributorId) {
        const { error } = await supabase
          .from("quiz_contributors")
          .update({ is_active: true })
          .eq("id", contributorId);

        if (error) throw error;

        return res.status(200).json({ ok: true, action: "activated" });
      }

      // Delete contributor
      if (action === "delete" && contributorId) {
        const { error } = await supabase
          .from("quiz_contributors")
          .delete()
          .eq("id", contributorId);

        if (error) throw error;

        return res.status(200).json({ ok: true, action: "deleted" });
      }

      return res.status(400).json({ ok: false, error: "invalid_action" });

    } catch (error) {
      console.error("Contributors POST error:", error);
      return res.status(500).json({ ok: false, error: "server_error" });
    }
  }

  return res.status(405).json({ ok: false, error: "method_not_allowed" });
}
