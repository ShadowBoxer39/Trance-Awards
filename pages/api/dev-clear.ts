// pages/api/dev-clear.ts (CLEAN VERSION)
import type { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";

const ADMIN_KEY = process.env.ADMIN_KEY;

function getClientIp(req: NextApiRequest) {
  const xf = (req.headers["x-forwarded-for"] || "") as string;
  const real = (req.headers["x-real-ip"] as string) || "";
  return xf.split(",")[0]?.trim() || real || (req.socket?.remoteAddress || "") || "0.0.0.0";
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, error: "method_not_allowed" });
  }

  let body: any = req.body;
  if (typeof body === "string") {
    try {
      body = JSON.parse(body);
    } catch {
      body = {};
    }
  }

  const key = body?.key as string | undefined;
  const mode = (body?.mode as "all" | "me" | undefined) || "all";

  if (!key || key !== ADMIN_KEY) {
    return res.status(401).json({ ok: false, error: "unauthorized" });
  }

  try {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
        throw new Error("SUPABASE_CONFIG_ERROR: Missing credentials.");
    }
    
    // Create client locally for this action
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // build the delete query and attach a filter
    let q = supabase.from("votes").delete({ count: "exact" });

    if (mode === "me") {
      const ip = getClientIp(req);
      const pepper = process.env.VOTE_PEPPER || "dev-pepper";
      const hash = crypto.createHash("sha256").update(ip + "|" + pepper).digest("hex");

      q = q.eq("ip_hash", hash);
    } else {
      // Deletes all votes
      q = q.not("id", "is", null);
    }

    const { error, count } = await q;
    if (error) throw error;

    return res.status(200).json({ ok: true, deleted: count ?? 0 });
  } catch (err: any) {
    return res.status(500).json({ ok: false, error: err.message || "error" });
  }
}
