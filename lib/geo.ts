// lib/geo.ts
export function getClientIp(req: any): string {
  const xf = (req.headers["x-forwarded-for"] || "").toString();
  const ip = (xf.split(",")[0] || req.socket?.remoteAddress || "").trim();
  return ip.replace(/^::ffff:/, ""); // unwrap IPv4-in-IPv6
}

export async function isFromIsrael(ip: string): Promise<boolean> {
  if (!ip) return false; // no IP? deny
  try {
    // Free, no key: ip-api.com
    const r = await fetch(
      `http://ip-api.com/json/${encodeURIComponent(ip)}?fields=status,countryCode,message`
    );
    const j = await r.json();
    if (j?.status !== "success") return false; // failed lookup -> deny
    return j.countryCode === "IL";
  } catch {
    return false; // network error -> deny
  }
}
