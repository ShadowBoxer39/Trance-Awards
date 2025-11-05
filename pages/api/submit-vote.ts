// pages/api/submit-vote.ts
import type { NextApiRequest, NextApiResponse } from "next";
import crypto from "crypto";
import supabase from "../../lib/supabaseServer";

// 🔹 Helper to extract client IP
function getClientIP(req: NextApiRequest): string {
  const xf = (req.headers["x-forwarded-for"] as string) || "";
  const real = (req.headers["x-real-ip"] as string) || "";
  return xf.split(",")[0]?.trim() || real || (req.socket?.remoteAddress || "") || "0.0.0.0";
}

// 🔹 Hash IP with pepper
function hashIP(ip: string, pepper: string) {
  return crypto.createHash("sha256").update(ip + "|" + pepper).digest("hex");
}

// 🔹 Simple country check
async function isFromIsrael(ip: string): Promise<boolean> {
  try {
    const res = await fetch(`http://ip-api.com/json/${encodeURIComponent(ip)}?fields=status,countryCode`);
    const data = await res.json();
    return data?.status === "success" && data.countryCode === "IL";
  } catch (err) {
    console.error("Geo check failed:", err);
    // Safer default: block on lookup failure
    return false;
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ ok: false, error: "method_not_allowed" });

  try {
  const { selections, captchaToken } = req.body || {};
  
  if (!selections || typeof selections !== "object") {
    return res.status(400).json({ ok: false, error: "bad_request" });
  }

  // Verify captcha
  if (!captchaToken) {
    return res.status(400).json({ ok: false, error: "captcha_missing" });
  }

  const captchaSecret = process.env.HCAPTCHA_SECRET;
  if (!captchaSecret) {
    console.error("HCAPTCHA_SECRET not configured");
    return res.status(500).json({ ok: false, error: "server_config" });
  }

  // Verify with hCaptcha
  const captchaRes = await fetch("https://hcaptcha.com/siteverify", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      secret: captchaSecret,
      response: captchaToken,
    }).toString(),
  });

  const captchaData = await captchaRes.json();
  if (!captchaData.success) {
    console.error("Captcha verification failed:", captchaData);
    return res.status(400).json({ ok: false, error: "captcha_failed" });
  }

    const season = "2025";
    const ip = getClientIP(req);

    // 🛑 Block users not from Israel
    const allowed = await isFromIsrael(ip);
    if (!allowed) {
      return res.status(403).json({ ok: false, error: "invalid_region" });
    }

    const pepper = process.env.VOTE_PEPPER || "dev-pepper";
    const ip_hash = hashIP(ip, pepper);
    const ua = req.headers["user-agent"] || "";

    const { error } = await supabase.from("votes").insert([
      {
        season,
        ip_hash,
        ua,
        selections,
      },
    ]);

    if (error) {
      if ((error as any)?.code === "23505") {
        return res.status(409).json({ ok: false, error: "duplicate_vote" });
      }
      console.error("insert error:", error);
      return res.status(500).json({ ok: false, error: "db_error" });
    }

    return res.status(200).json({ ok: true });
  } catch (e) {
    console.error("submit-vote server error:", e);
    return res.status(500).json({ ok: false, error: "server_error" });
  }
}
