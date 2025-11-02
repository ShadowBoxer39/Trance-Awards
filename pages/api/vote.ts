import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ ok: false, error: "Method not allowed" });

  // just echo back what we received (no database yet)
  const { selections, ballotVersion, userAgent } = req.body || {};
  if (!selections) return res.status(400).json({ ok: false, error: "Missing selections" });

  res.status(200).json({
    ok: true,
    received: { selections, ballotVersion: ballotVersion ?? 1, userAgent: userAgent ?? req.headers["user-agent"] }
  });
}
