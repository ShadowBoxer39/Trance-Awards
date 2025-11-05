// lib/verifyCaptcha.ts
export async function verifyHCaptcha(token: string, remoteip?: string) {
  const secret = process.env.HCAPTCHA_SECRET;
  if (!secret) throw new Error("HCAPTCHA_SECRET missing");

  const form = new URLSearchParams({ secret, response: token });
  if (remoteip) form.append("remoteip", remoteip);

  const resp = await fetch("https://hcaptcha.com/siteverify", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: form.toString(),
  });

  const data = await resp.json();
  return { ok: !!data.success, details: data["error-codes"] ?? null };
}
