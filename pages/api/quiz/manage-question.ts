import type { NextApiRequest, NextApiResponse } from "next";
import supabase from "../../../lib/supabaseServer";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, error: "method_not_allowed" });
  }

  const { key, questionId, action } = req.body;

  if (key !== process.env.ADMIN_KEY) {
    return res.status(401).json({ ok: false, error: "unauthorized" });
  }

  if (!questionId || !action) {
    return res.status(400).json({ ok: false, error: "missing_fields" });
  }

  try {
    if (action === "approve") {
      const { error } = await supabase
        .from("quiz_questions")
        .update({
          status: "approved",
          approved_at: new Date().toISOString(),
        })
        .eq("id", questionId);

      if (error) throw error;

      return res.status(200).json({ ok: true, action: "approved" });
    }

    if (action === "reject") {
      const { error } = await supabase
        .from("quiz_questions")
        .update({ status: "rejected" })
        .eq("id", questionId);

      if (error) throw error;

      return res.status(200).json({ ok: true, action: "rejected" });
    }

    if (action === "delete") {
      const { error } = await supabase
        .from("quiz_questions")
        .delete()
        .eq("id", questionId);

      if (error) throw error;

      return res.status(200).json({ ok: true, action: "deleted" });
    }

    return res.status(400).json({ ok: false, error: "invalid_action" });

  } catch (error) {
    console.error("Manage question error:", error);
    return res.status(500).json({ ok: false, error: "server_error" });
  }
}
