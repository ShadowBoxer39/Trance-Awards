import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "method_not_allowed" });

  const { token } = req.body ?? {};
  if (!token) return res.status(400).json({ error: "missing_token" });

  const secret = process.env.HCAPTCHA_SECRET;
  if (!secret) return res.status(500).json({ error: "server_config_missing" });

  // Optional: get requester IP
  const remoteip =
    (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() ||
    (req.socket as any)?.remoteAddress ||
    undefined;

  const form = new URLSearchParams({ secret, response: token });
  if (remoteip) form.append("remoteip", remoteip);

  const resp = await fetch("https://hcaptcha.com/siteverify", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: form.toString(),
  });
  const result = await resp.json();

  if (result.success) return res.status(200).json({ ok: true });
  return res.status(400).json({ error: "captcha_failed", details: result["error-codes"] ?? null });
}
