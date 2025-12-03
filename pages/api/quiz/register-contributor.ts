import type { NextApiRequest, NextApiResponse } from "next";
import supabase from "../../../lib/supabaseServer";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, error: "method_not_allowed" });
  }

  try {
    const { inviteCode, userId, name, photoUrl } = req.body;

    if (!inviteCode || !userId || !name) {
      return res.status(400).json({ ok: false, error: "missing_fields" });
    }

    // Find the invite
    const { data: contributor, error: findError } = await supabase
      .from("quiz_contributors")
      .select("*")
      .eq("invite_code", inviteCode)
      .single();

    if (findError || !contributor) {
      return res.status(404).json({ ok: false, error: "invalid_invite_code" });
    }

    if (!contributor.is_active) {
      return res.status(400).json({ ok: false, error: "invite_deactivated" });
    }

    // Check if already registered
    if (contributor.user_id) {
      if (contributor.user_id === userId) {
        return res.status(200).json({ ok: true, alreadyRegistered: true, contributor });
      }
      return res.status(400).json({ ok: false, error: "invite_already_used" });
    }

    // Register the contributor
    const { data: updated, error: updateError } = await supabase
      .from("quiz_contributors")
      .update({
        user_id: userId,
        name: name,
        photo_url: photoUrl || null,
      })
      .eq("id", contributor.id)
      .select()
      .single();

    if (updateError) throw updateError;

    return res.status(200).json({ ok: true, contributor: updated });

  } catch (error) {
    console.error("Register contributor error:", error);
    return res.status(500).json({ ok: false, error: "server_error" });
  }
}
