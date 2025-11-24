// pages/api/dev-clear.ts (Current version - UNCHANGED)
import type { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";

const supabase = createClient(
  process.env.SUPABASE_URL as string,
  process.env.SUPABASE_SERVICE_ROLE_KEY as string
);

const ADMIN_KEY =
  process.env.ADMIN_KEY || process.env.AdminKey || process.env.Admin_Key;

function getClientIp(req: NextApiRequest) {
  const xf = (req.headers["x-forwarded-for"] || "") as string;
  if (xf) return xf.split(",")[0].trim();
  // fallback (Node)
  // @ts-ignore
  return (req.socket?.remoteAddress as string) || "0.0.0.0";
}

function ipHash(ip: string) {
  return crypto.createHash("sha256").update(ip).digest("hex").slice(0, 32);
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
    // build the delete query and attach a filter
    let q = supabase.from("votes").delete({ count: "exact" });

    if (mode === "me") {
      const ip = getClientIp(req);
      const pepper = process.env.VOTE_PEPPER || "dev-pepper"; // Using pepper for consistency
      const hash = crypto.createHash("sha256").update(ip + "|" + pepper).digest("hex");

      q = q.eq("ip_hash", hash);
    } else {
      // PostgREST requires *some* filter for DELETE; this matches all rows.
      q = q.not("id", "is", null);
    }

    const { error, count } = await q;
    if (error) throw error;

    return res.status(200).json({ ok: true, deleted: count ?? 0 });
  } catch (err: any) {
    return res.status(500).json({ ok: false, error: err.message || "error" });
  }
}
