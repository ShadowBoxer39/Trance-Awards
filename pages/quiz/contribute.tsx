import React, { useState, useEffect } from "react";
import { useSession, signIn } from "next-auth/react";
import { useRouter } from "next/router";
import Head from "next/head";
import Link from "next/link";
import Navigation from "../../components/Navigation";

interface Contributor {
  id: number;
  name: string;
  photo_url: string | null;
  is_active: boolean;
}

export default function ContributePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { code } = router.query;

  const [contributor, setContributor] = useState<Contributor | null>(null);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [formType, setFormType] = useState<"snippet" | "trivia">("snippet");
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [startSeconds, setStartSeconds] = useState(0);
  const [duration, setDuration] = useState(10);
  const [acceptedArtists, setAcceptedArtists] = useState("");
  const [acceptedTracks, setAcceptedTracks] = useState("");
  const [questionText, setQuestionText] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [acceptedAnswers, setAcceptedAnswers] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  useEffect(() => {
    document.documentElement.setAttribute("dir", "rtl");
  }, []);

  useEffect(() => {
    if (status === "loading") return;
    if (!code) {
      setError("קוד הזמנה חסר");
      setLoading(false);
      return;
    }
    if (!session) {
      setLoading(false);
      return;
    }
    registerContributor();
  }, [session, status, code]);

  const registerContributor = async () => {
    if (!session || !code) return;

    setRegistering(true);
    try {
      const res = await fetch("/api/quiz/register-contributor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          inviteCode: code,
          userId: (session as any).odau,
          name: session.user?.name,
          photoUrl: session.user?.image,
        }),
      });

      const data = await res.json();
      if (data.ok) {
        setContributor(data.contributor);
      } else {
        setError(
          data.error === "invalid_invite_code" ? "קוד הזמנה לא תקין" :
          data.error === "invite_already_used" ? "קוד ההזמנה כבר נוצל" :
          data.error === "invite_deactivated" ? "קוד ההזמנה לא פעיל" :
          "שגיאה ברישום"
        );
      }
    } catch (err) {
      setError("שגיאה בחיבור לשרת");
    } finally {
      setLoading(false);
      setRegistering(false);
    }
  };

  const submitQuestion = async () => {
    setSubmitting(true);
    setSubmitSuccess(false);

    try {
      const body: any = {
        type: formType,
        contributorId: contributor?.id,
      };

      if (formType === "snippet") {
        body.youtubeUrl = youtubeUrl;
        body.youtubeStartSeconds = startSeconds;
        body.youtubeDurationSeconds = duration;
        body.acceptedArtists = acceptedArtists.split("\n").map(s => s.trim()).filter(Boolean);
        body.acceptedTracks = acceptedTracks.split("\n").map(s => s.trim()).filter(Boolean);
      } else {
        body.questionText = questionText;
        body.imageUrl = imageUrl || null;
        body.acceptedAnswers = acceptedAnswers.split("\n").map(s => s.trim()).filter(Boolean);
      }

      const res = await fetch("/api/quiz/add-question", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (data.ok) {
        setSubmitSuccess(true);
        // Reset form
        setYoutubeUrl("");
        setStartSeconds(0);
        setDuration(10);
        setAcceptedArtists("");
        setAcceptedTracks("");
        setQuestionText("");
        setImageUrl("");
        setAcceptedAnswers("");
      } else {
        alert("שגיאה: " + data.error);
      }
    } catch (err) {
      alert("שגיאה בשליחה");
    } finally {
      setSubmitting(false);
    }
  };

  // Loading
  if (loading || status === "loading" || registering) {
    return (
      <>
        <Head><title>יוצאים לטראק - תורמי שאלות</title></Head>
        <div className="trance-backdrop min-h-screen text-gray-100">
          <Navigation currentPage="quiz" />
          <div className="max-w-4xl mx-auto px-6 py-20 text-center">
            <div className="w-12 h-12 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin mx-auto" />
            <p className="mt-4 text-gray-400">טוען...</p>
          </div>
        </div>
      </>
    );
  }

  // Error
  if (error) {
    return (
      <>
        <Head><title>יוצאים לטראק - שגיאה</title></Head>
        <div className="trance-backdrop min-h-screen text-gray-100">
          <Navigation currentPage="quiz" />
          <div className="max-w-4xl mx-auto px-6 py-20 text-center">
            <span className="text-6xl mb-6 block">❌</span>
            <h1 className="text-3xl font-bold text-red-400 mb-4">{error}</h1>
            <Link href="/" className="btn-primary px-6 py-3 rounded-xl inline-block">
              חזרה לדף הבית
            </Link>
          </div>
        </div>
      </>
    );
  }

  // Not logged in
  if (!session) {
    return (
      <>
        <Head><title>יוצאים לטראק - תורמי שאלות</title></Head>
        <div className="trance-backdrop min-h-screen text-gray-100">
          <Navigation currentPage="quiz" />
          <div className="max-w-4xl mx-auto px-6 py-20 text-center">
            <span className="text-6xl mb-6 block">🎵</span>
            <h1 className="text-3xl font-bold mb-4">הצטרפות כתורם שאלות</h1>
            <p className="text-gray-400 mb-8">התחבר עם Google כדי להמשיך</p>
            <button
              onClick={() => signIn("google")}
              className="btn-primary px-8 py-4 rounded-xl font-semibold flex items-center gap-3 mx-auto"
            >
              <svg className="w-6 h-6" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              התחבר עם Google
            </button>
          </div>
        </div>
      </>
    );
  }

  // Contributor dashboard
  return (
    <>
      <Head><title>יוצאים לטראק - תורמי שאלות</title></Head>
      <div className="trance-backdrop min-h-screen text-gray-100">
        <Navigation currentPage="quiz" />

        <div className="max-w-4xl mx-auto px-6 py-12">
          {/* Header */}
          <div className="glass-card rounded-xl p-6 mb-8 flex items-center gap-4">
            {contributor?.photo_url ? (
              <img
                src={contributor.photo_url}
                alt={contributor.name}
                className="w-16 h-16 rounded-full object-cover"
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-purple-500/30 flex items-center justify-center">
                <span className="text-2xl">👤</span>
              </div>
            )}
            <div>
              <h1 className="text-2xl font-bold">שלום, {contributor?.name}!</h1>
              <p className="text-gray-400">תורם שאלות לחידון יוצאים לטראק</p>
            </div>
          </div>

          {/* Success message */}
          {submitSuccess && (
            <div className="glass-card rounded-xl p-6 mb-8 border-2 border-green-500/30 text-center">
              <span className="text-4xl mb-3 block">✅</span>
              <h2 className="text-xl font-bold text-green-400 mb-2">השאלה נשלחה בהצלחה!</h2>
              <p className="text-gray-400">השאלה ממתינה לאישור מנהל</p>
            </div>
          )}

          {/* Form type selector */}
          <div className="glass-card rounded-xl p-6 mb-8">
            <h2 className="text-xl font-bold mb-4">בחר סוג שאלה</h2>
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => setFormType("snippet")}
                className={`p-6 rounded-xl border-2 transition-all ${
                  formType === "snippet"
                    ? "border-cyan-500 bg-cyan-500/10"
                    : "border-white/10 hover:border-white/30"
                }`}
              >
                <span className="text-4xl mb-3 block">🎵</span>
                <h3 className="font-bold mb-1">נחשו את הטראק</h3>
                <p className="text-sm text-gray-400">קטע מיוטיוב + תשובה</p>
                <p className="text-xs text-cyan-400 mt-2">ליום שני</p>
              </button>
              <button
                onClick={() => setFormType("trivia")}
                className={`p-6 rounded-xl border-2 transition-all ${
                  formType === "trivia"
                    ? "border-purple-500 bg-purple-500/10"
                    : "border-white/10 hover:border-white/30"
                }`}
              >
                <span className="text-4xl mb-3 block">🧠</span>
                <h3 className="font-bold mb-1">טריוויה</h3>
                <p className="text-sm text-gray-400">שאלה + תשובה</p>
                <p className="text-xs text-purple-400 mt-2">ליום חמישי</p>
              </button>
            </div>
          </div>

          {/* Snippet form */}
          {formType === "snippet" && (
            <div className="glass-card rounded-xl p-6">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                <span>🎵</span> יצירת שאלת "נחשו את הטראק"
              </h2>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">קישור YouTube</label>
                  <input
                    type="url"
                    value={youtubeUrl}
                    onChange={(e) => setYoutubeUrl(e.target.value)}
                    className="w-full bg-black/50 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:border-cyan-500 focus:outline-none"
                    placeholder="https://www.youtube.com/watch?v=..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">שנייה התחלה</label>
                    <input
                      type="number"
                      min="0"
                      value={startSeconds}
                      onChange={(e) => setStartSeconds(Number(e.target.value))}
                      className="w-full bg-black/50 border border-white/20 rounded-xl px-4 py-3 text-white focus:border-cyan-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">אורך (שניות)</label>
                    <input
                      type="number"
                      min="5"
                      max="15"
                      value={duration}
                      onChange={(e) => setDuration(Number(e.target.value))}
                      className="w-full bg-black/50 border border-white/20 rounded-xl px-4 py-3 text-white focus:border-cyan-500 focus:outline-none"
                    />
                    <p className="text-xs text-gray-500 mt-1">5-15 שניות</p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-2">
                    שמות אמנים מקובלים (שורה לכל וריאציה)
                  </label>
                  <textarea
                    value={acceptedArtists}
                    onChange={(e) => setAcceptedArtists(e.target.value)}
                    className="w-full bg-black/50 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:border-cyan-500 focus:outline-none min-h-[100px]"
                    placeholder={"Vini Vici\nvini vici\nויני ויצ'י"}
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-2">
                    שמות טראק מקובלים (שורה לכל וריאציה)
                  </label>
                  <textarea
                    value={acceptedTracks}
                    onChange={(e) => setAcceptedTracks(e.target.value)}
                    className="w-full bg-black/50 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:border-cyan-500 focus:outline-none min-h-[100px]"
                    placeholder={"Great Spirit\ngreat spirit\nגרייט ספיריט"}
                  />
                </div>

                <button
                  onClick={submitQuestion}
                  disabled={submitting || !youtubeUrl || !acceptedArtists || !acceptedTracks}
                  className="w-full btn-primary py-4 rounded-xl font-semibold disabled:opacity-50"
                >
                  {submitting ? "שולח..." : "שלח שאלה לאישור"}
                </button>
              </div>
            </div>
          )}

          {/* Trivia form */}
          {formType === "trivia" && (
            <div className="glass-card rounded-xl p-6">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                <span>🧠</span> יצירת שאלת טריוויה
              </h2>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">השאלה</label>
                  <textarea
                    value={questionText}
                    onChange={(e) => setQuestionText(e.target.value)}
                    className="w-full bg-black/50 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none min-h-[100px]"
                    placeholder="באיזו שנה יצא האלבום הראשון של..."
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-2">קישור לתמונה (אופציונלי)</label>
                  <input
                    type="url"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    className="w-full bg-black/50 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none"
                    placeholder="https://..."
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-2">
                    תשובות מקובלות (שורה לכל וריאציה)
                  </label>
                  <textarea
                    value={acceptedAnswers}
                    onChange={(e) => setAcceptedAnswers(e.target.value)}
                    className="w-full bg-black/50 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none min-h-[100px]"
                    placeholder={"2015\n2015"}
                  />
                </div>

                <button
                  onClick={submitQuestion}
                  disabled={submitting || !questionText || !acceptedAnswers}
                  className="w-full btn-primary py-4 rounded-xl font-semibold disabled:opacity-50"
                >
                  {submitting ? "שולח..." : "שלח שאלה לאישור"}
                </button>
              </div>
            </div>
          )}

          {/* Tips */}
          <div className="glass-card rounded-xl p-6 mt-8">
            <h3 className="font-bold mb-4">💡 טיפים ליצירת שאלות טובות</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>• הוסף מספר וריאציות של התשובה (עברית, אנגלית, שגיאות כתיב נפוצות)</li>
              <li>• לשאלות snippet - בחר קטע מזוהה אבל לא טריוויאלי מדי</li>
              <li>• לטריוויה - ודא שיש תשובה חד משמעית</li>
              <li>• השאלות יעברו אישור לפני פרסום</li>
            </ul>
          </div>
        </div>
      </div>
    </>
  );
}
