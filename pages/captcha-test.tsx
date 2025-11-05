import { useEffect, useRef, useState } from "react";
import Script from "next/script";

// Let TypeScript know about window.hcaptcha
declare global {
  interface Window {
    hcaptcha: {
      render: (el: HTMLElement, opts: { sitekey: string }) => number;
      getResponse: (id: number) => string;
      reset: (id?: number) => void;
    };
  }
}

export default function CaptchaTestPage() {
  const [status, setStatus] = useState<string | null>(null);
  const captchaRef = useRef<HTMLDivElement | null>(null);
  const widgetId = useRef<number | null>(null);
  const sitekey = process.env.NEXT_PUBLIC_HCAPTCHA_SITEKEY as string;

  // Render the widget when the script is ready
  useEffect(() => {
    const i = setInterval(() => {
      if (typeof window !== "undefined" && window.hcaptcha && captchaRef.current && widgetId.current === null) {
        widgetId.current = window.hcaptcha.render(captchaRef.current, { sitekey });
        clearInterval(i);
      }
    }, 200);
    return () => clearInterval(i);
  }, [sitekey]);

  const onSubmit = async () => {
    if (widgetId.current === null) return setStatus("CAPTCHA not ready. Try again in a second.");
    const token = window.hcaptcha.getResponse(widgetId.current);
    if (!token) return setStatus("Please complete the CAPTCHA.");

    setStatus("Verifying…");
    const res = await fetch("/api/captcha-test", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    });
    const data = await res.json();
    if (res.ok && data.ok) setStatus("✅ CAPTCHA verified!");
    else setStatus(`❌ Verification failed: ${data.error ?? "unknown_error"}`);

    window.hcaptcha.reset(widgetId.current);
  };

  return (
    <main className="min-h-screen neon-backdrop text-white flex flex-col items-center justify-center gap-6 p-6">
      {/* Load hCaptcha */}
      <Script src="https://js.hcaptcha.com/1/api.js" strategy="afterInteractive" />

      <h1 className="text-2xl font-bold">hCaptcha — test</h1>
      <div ref={captchaRef} className="bg-black/20 p-4 rounded-xl" />

      <button onClick={onSubmit} className="btn-primary rounded-2xl px-6 py-3">
        Test Verify
      </button>

      {status && <p className="text-sm opacity-90">{status}</p>}
    </main>
  );
}
