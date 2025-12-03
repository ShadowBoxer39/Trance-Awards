import React, { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import { useRouter } from "next/router";
import Head from "next/head";
import Link from "next/link";
import Navigation from "../../components/Navigation";
import GoogleLoginButton from "../../components/GoogleLoginButton";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface Contributor {
  id: number;
  name: string;
  photo_url: string | null;
  is_active: boolean;
}

export default function ContributePage() {
  const router = useRouter();
  const { code } = router.query;

  const [user, setUser] = useState<any>(null);
  const [userName, setUserName] = useState("");
  const [userPhoto, setUserPhoto] = useState<string | null>(null);
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
    checkUser();

    const { data: authListener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      if (currentUser) {
        const { getGoogleUserInfo } = await import("../../lib/googleAuthHelpers");
        const userInfo = getGoogleUserInfo(currentUser);
        if (userInfo) {
          setUserName(userInfo.name);
          setUserPhoto(userInfo.photoUrl);
        }
      } else {
        setUserName("");
        setUserPhoto(null);
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (user && code && !contributor && !registering) {
      registerContributor();
    } else if (!code && !loading) {
      setError("קוד הזמנה חסר");
      setLoading(false);
    }
  }, [user, code]);

  const checkUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    const currentUser = session?.user ?? null;
    setUser(currentUser);

    if (currentUser) {
      const { getGoogleUserInfo } = await import("../../lib/googleAuthHelpers");
      const userInfo = getGoogleUserInfo(currentUser);
      if (userInfo) {
        setUserName(userInfo.name);
        setUserPhoto(userInfo.photoUrl);
      }
    }

    if (!router.query.code) {
      // Wait for router to be ready
      setTimeout(() => {
        if (!router.query.code) {
          setError("קוד הזמנה חסר");
        }
        setLoading(false);
      }, 500);
    } else {
      setLoading(false);
    }
  };

  const registerContributor = async () => {
    if (!user || !code) return;

    setRegistering(true);
    try {
      const res = await fetch("/api/quiz/register-contributor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          inviteCode: code,
          userId: user.id,
          name: userName,
          photoUrl: userPhoto,
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
  if (loading || registering) {
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
  if (!user) {
    return (
      <>
        <Head><title>יוצאים לטראק - תורמי שאלות</title></Head>
        <div className="trance-backdrop min-h-screen text-gray-100">
          <Navigation currentPage="quiz" />
          <div className="max-w-4xl mx-auto px-6 py-20 text-center">
            <span className="text-6xl mb-6 block">🎵</span>
            <h1 className="text-3xl font-bold mb-4">הצטרפות כתורם שאלות</h1>
            <p className="text-gray-400 mb-8">התחבר עם Google כדי להמשיך</p>
            <div className="flex justify-center">
              <GoogleLoginButton />
            </div>
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
