import React, { useState, useEffect, useRef } from "react";
import { createClient } from "@supabase/supabase-js";
import { useRouter } from "next/router";
import Navigation from "../../components/Navigation";
import SEO from "../../components/SEO";
import GoogleLoginButton from "../../components/GoogleLoginButton";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Helper to extract ID from various YouTube URL formats
const getYouTubeID = (url: string) => {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
};

export default function ContributePage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isContributor, setIsContributor] = useState(false);
  const [inviteCode, setInviteCode] = useState<string | null>(null);
  const [status, setStatus] = useState<"loading" | "registering" | "idle" | "success" | "error">("loading");
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Question Form State
  const [type, setType] = useState<"snippet" | "trivia">("snippet");
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [startSeconds, setStartSeconds] = useState(0);
  const [duration, setDuration] = useState(10);
  const [artistAnswer, setArtistAnswer] = useState("");
  const [trackAnswer, setTrackAnswer] = useState("");
  const [triviaQuestion, setTriviaQuestion] = useState("");
  const [triviaAnswer, setTriviaAnswer] = useState("");
  const [triviaImage, setTriviaImage] = useState("");

  // Preview Player State
  const [isPlaying, setIsPlaying] = useState(false);
  const playerRef = useRef<any>(null);
  const [previewReady, setPreviewReady] = useState(false);

  useEffect(() => {
    // Load YouTube API for preview
    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = "https://www.youtube.com/iframe_api";
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);
    }
    
    checkUser();
    
    // Capture invite code
    const queryCode = new URLSearchParams(window.location.search).get("code");
    if (queryCode) {
      setInviteCode(queryCode);
      localStorage.setItem("quiz_invite_code", queryCode);
    } else {
      const storedCode = localStorage.getItem("quiz_invite_code");
      if (storedCode) setInviteCode(storedCode);
    }
  }, []);

  const checkUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    const currentUser = session?.user ?? null;
    setUser(currentUser);

    if (currentUser) {
      await checkContributorStatus(currentUser.id);
    } else {
      setLoading(false);
    }
  };

  const checkContributorStatus = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("quiz_contributors")
        .select("id, is_active")
        .eq("user_id", userId)
        .single();

      if (data && data.is_active) {
        setIsContributor(true);
        setStatus("idle");
        localStorage.removeItem("quiz_invite_code");
      } else {
        const code = new URLSearchParams(window.location.search).get("code") || localStorage.getItem("quiz_invite_code");
        if (code) {
          registerContributor(userId, code);
        } else {
          setStatus("idle");
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const registerContributor = async (userId: string, code: string) => {
    setStatus("registering");
    try {
      const res = await fetch("/api/quiz/register-contributor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, inviteCode: code }),
      });
      const data = await res.json();
      
      if (data.ok) {
        setIsContributor(true);
        localStorage.removeItem("quiz_invite_code");
        setSuccessMsg("ברוך הבא לצוות התורמים!");
      } else {
        setErrorMsg(data.error === "invalid_code" ? "קוד הזמנה לא תקין" : "שגיאה ברישום");
      }
    } catch (e) {
      setErrorMsg("שגיאה בתקשורת");
    } finally {
      setStatus("idle");
    }
  };

  // --- PREVIEW LOGIC ---
  const loadPreview = () => {
    const videoId = getYouTubeID(youtubeUrl);
    if (!videoId) return alert("קישור לא תקין");
    
    if (playerRef.current) {
      playerRef.current.loadVideoById({
        videoId: videoId,
        startSeconds: startSeconds,
        endSeconds: startSeconds + duration
      });
    } else {
      playerRef.current = new window.YT.Player('preview-player', {
        height: '200',
        width: '100%',
        videoId: videoId,
        playerVars: {
          start: startSeconds,
          end: startSeconds + duration,
          autoplay: 1,
          controls: 1,
        },
        events: {
          onStateChange: (e: any) => {
            if (e.data === window.YT.PlayerState.ENDED) {
               // Loop preview? or just stop
            }
          }
        }
      });
    }
    setPreviewReady(true);
  };

  const submitQuestion = async () => {
    if (!user) return;
    
    // Basic Validation
    if (type === "snippet") {
      if (!getYouTubeID(youtubeUrl)) return alert("אנא הכנס קישור תקין ליוטיוב");
      if (!artistAnswer.trim() || !trackAnswer.trim()) return alert("חובה למלא שם אמן וטראק");
    } else {
      if (!triviaQuestion.trim() || !triviaAnswer.trim()) return alert("חובה למלא שאלה ותשובה");
    }

    setStatus("loading");
    setErrorMsg("");
    setSuccessMsg("");
    
    try {
      const body: any = { 
        userId: user.id,
        type 
      };

      if (type === "snippet") {
        body.youtubeUrl = youtubeUrl;
        body.youtubeStartSeconds = Number(startSeconds);
        body.youtubeDurationSeconds = Number(duration);
        body.acceptedArtists = artistAnswer.split("\n").map(s => s.trim()).filter(Boolean);
        body.acceptedTracks = trackAnswer.split("\n").map(s => s.trim()).filter(Boolean);
      } else {
        body.questionText = triviaQuestion;
        body.acceptedAnswers = triviaAnswer.split("\n").map(s => s.trim()).filter(Boolean);
        body.imageUrl = triviaImage;
      }

      const res = await fetch("/api/quiz/add-question", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (data.ok) {
        setSuccessMsg("השאלה נשלחה בהצלחה וממתינה לאישור! תודה רבה 🎵");
        // Reset form
        setYoutubeUrl("");
        setArtistAnswer("");
        setTrackAnswer("");
        setTriviaQuestion("");
        setTriviaAnswer("");
        setTriviaImage("");
        setPreviewReady(false);
        if (playerRef.current) {
            playerRef.current.destroy();
            playerRef.current = null;
        }
      } else {
        setErrorMsg("שגיאה: " + data.error);
      }
    } catch (e) {
      setErrorMsg("שגיאה בשליחה");
    } finally {
      setStatus("idle");
    }
  };

  if (loading) return <div className="min-h-screen bg-black text-white p-8 text-center">טוען...</div>;

  return (
    <div className="min-h-screen bg-black text-white pb-20">
      <SEO title="הוספת שאלה לחידון" description="הצטרפו לצוות התורמים של טראנס אוורדס" />
      <Navigation />

      <div className="max-w-2xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-purple-500">
          הוספת שאלה לחידון
        </h1>
        <p className="text-gray-400 mb-8">עזרו לנו לאתגר את הקהילה עם שאלות חדשות!</p>

        {/* Global Messages */}
        {successMsg && (
            <div className="bg-green-500/20 border border-green-500/50 p-4 rounded-xl mb-6 text-green-300 text-center animate-pulse">
                {successMsg}
            </div>
        )}
        {errorMsg && (
            <div className="bg-red-500/20 border border-red-500/50 p-4 rounded-xl mb-6 text-red-300 text-center">
                {errorMsg}
            </div>
        )}

        {!user ? (
          <div className="glass-card p-8 text-center border border-white/10 rounded-xl">
            <p className="mb-6 text-lg">יש להתחבר כדי להוסיף שאלות</p>
            <div className="flex justify-center">
              <GoogleLoginButton />
            </div>
            {inviteCode && <p className="mt-4 text-sm text-green-400">✅ קוד הזמנה זוהה ויישמר לאחר ההתחברות</p>}
          </div>
        ) : !isContributor ? (
          <div className="glass-card p-8 text-center border border-red-500/30 rounded-xl">
            <h3 className="text-xl font-bold text-red-400 mb-2">אין הרשאה</h3>
            <p className="text-gray-300 mb-4">
              דף זה מיועד לתורמים רשומים בלבד.
            </p>
            <div className="bg-white/5 p-4 rounded-lg inline-block text-right">
              <p className="text-sm font-bold mb-2">יש לך קוד הזמנה?</p>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  placeholder="הדבק קוד כאן" 
                  className="bg-black/50 border border-white/20 rounded px-3 py-1"
                  onChange={(e) => setInviteCode(e.target.value)}
                  value={inviteCode || ""}
                />
                <button 
                  onClick={() => registerContributor(user.id, inviteCode || "")}
                  className="bg-cyan-500 px-4 py-1 rounded text-sm font-bold"
                >
                  הפעל
                </button>
              </div>
            </div>
          </div>
        ) : (
          // CONTRIBUTOR FORM
          <div className="space-y-8">
            {/* Type Selector */}
            <div className="flex bg-white/5 p-1 rounded-xl">
              <button
                onClick={() => setType("snippet")}
                className={`flex-1 py-3 rounded-lg font-bold transition-all ${
                  type === "snippet" ? "bg-cyan-500 text-white shadow-lg" : "text-gray-400 hover:text-white"
                }`}
              >
                🎵 זיהוי טראק (Snippet)
              </button>
              <button
                onClick={() => setType("trivia")}
                className={`flex-1 py-3 rounded-lg font-bold transition-all ${
                  type === "trivia" ? "bg-purple-500 text-white shadow-lg" : "text-gray-400 hover:text-white"
                }`}
              >
                🧠 שאלת טריוויה
              </button>
            </div>

            <div className="glass-card p-6 border border-white/10 rounded-xl space-y-5">
              {type === "snippet" ? (
                <>
                  <div>
                    <label className="block text-cyan-400 font-bold mb-2">לינק ליוטיוב</label>
                    <input
                      type="url"
                      value={youtubeUrl}
                      onChange={(e) => setYoutubeUrl(e.target.value)}
                      className="w-full bg-black/50 border border-white/20 rounded-lg p-3 text-white focus:border-cyan-500 outline-none dir-ltr"
                      placeholder="https://www.youtube.com/watch?v=..."
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-gray-400 text-sm mb-1">התחלה (שניות)</label>
                      <input
                        type="number"
                        value={startSeconds}
                        onChange={(e) => setStartSeconds(Number(e.target.value))}
                        className="w-full bg-black/50 border border-white/20 rounded-lg p-3 text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-400 text-sm mb-1">משך (שניות)</label>
                      <input
                        type="number"
                        value={duration}
                        onChange={(e) => setDuration(Number(e.target.value))}
                        className="w-full bg-black/50 border border-white/20 rounded-lg p-3 text-white"
                      />
                    </div>
                  </div>

                  {/* PREVIEW BUTTON */}
                  <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                     <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-bold">בדיקת הקטע:</span>
                        <button 
                            onClick={loadPreview}
                            className="bg-white/20 hover:bg-white/30 px-3 py-1 rounded text-sm transition"
                        >
                            ▶️ נגן תצוגה מקדימה
                        </button>
                     </div>
                     <div id="preview-player" className="rounded-lg overflow-hidden bg-black aspect-video"></div>
                  </div>

                  <div>
                    <label className="block text-cyan-400 font-bold mb-2">שם האמן (תשובות מקובלות)</label>
                    <textarea
                      value={artistAnswer}
                      onChange={(e) => setArtistAnswer(e.target.value)}
                      className="w-full bg-black/50 border border-white/20 rounded-lg p-3 text-white h-24"
                      placeholder="Infected Mushroom&#10;אינפקטד&#10;אינפקטד מאשרום"
                    />
                    <p className="text-xs text-gray-500 mt-1">כל שורה היא וריאציה שתתקבל כנכונה</p>
                  </div>

                  <div>
                    <label className="block text-cyan-400 font-bold mb-2">שם הטראק (תשובות מקובלות)</label>
                    <textarea
                      value={trackAnswer}
                      onChange={(e) => setTrackAnswer(e.target.value)}
                      className="w-full bg-black/50 border border-white/20 rounded-lg p-3 text-white h-24"
                      placeholder="Becoming Insane&#10;Insane"
                    />
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label className="block text-purple-400 font-bold mb-2">השאלה</label>
                    <textarea
                      value={triviaQuestion}
                      onChange={(e) => setTriviaQuestion(e.target.value)}
                      className="w-full bg-black/50 border border-white/20 rounded-lg p-3 text-white h-24"
                      placeholder="באיזו שנה יצא האלבום Classical Mushroom?"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-purple-400 font-bold mb-2">תמונה (אופציונלי)</label>
                    <input
                      type="url"
                      value={triviaImage}
                      onChange={(e) => setTriviaImage(e.target.value)}
                      className="w-full bg-black/50 border border-white/20 rounded-lg p-3 text-white dir-ltr"
                      placeholder="https://..."
                    />
                  </div>

                  <div>
                    <label className="block text-purple-400 font-bold mb-2">תשובות נכונות</label>
                    <textarea
                      value={triviaAnswer}
                      onChange={(e) => setTriviaAnswer(e.target.value)}
                      className="w-full bg-black/50 border border-white/20 rounded-lg p-3 text-white h-24"
                      placeholder="2000&#10;שנת 2000"
                    />
                    <p className="text-xs text-gray-500 mt-1">כל שורה היא וריאציה שתתקבל כנכונה</p>
                  </div>
                </>
              )}

              <button
                onClick={submitQuestion}
                disabled={status === "loading"}
                className={`w-full py-4 rounded-xl font-bold text-lg transition-all ${
                  type === "snippet" 
                    ? "bg-gradient-to-r from-cyan-600 to-cyan-400 hover:shadow-cyan-500/25" 
                    : "bg-gradient-to-r from-purple-600 to-purple-400 hover:shadow-purple-500/25"
                } shadow-lg text-white`}
              >
                {status === "loading" ? "שולח..." : "🚀 שלח שאלה לאישור"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
