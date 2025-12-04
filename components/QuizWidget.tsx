import React, { useState, useEffect, useRef } from "react";
import { createClient } from "@supabase/supabase-js";
import GoogleLoginButton from "./GoogleLoginButton";

const supabase = createClient( 
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY! 
);

interface QuizData {
  id: number;
  type: "snippet" | "trivia";
  questionText: string | null;
  imageUrl: string | null;
  youtubeUrl: string | null;
  youtubeStart: number | null;
  youtubeDuration: number | null;
  contributor: {
    name: string;
    photo_url: string | null;
  } | null;
}

interface AttemptData {
  used: number;
  remaining: number;
  hasCorrectAnswer: boolean;
  history: any[];
}

interface PreviousAnswer {
  type: "snippet" | "trivia";
  question: string | null;
  answer: { artist: string; track: string } | string;
  contributor: { name: string; photo_url: string | null } | null;
}

export default function QuizWidget() {
  const [user, setUser] = useState<any>(null);
  const [userName, setUserName] = useState("");
  const [userPhoto, setUserPhoto] = useState<string | null>(null);
  
  const [loading, setLoading] = useState(true);
  const [quiz, setQuiz] = useState<QuizData | null>(null);
  const [attempts, setAttempts] = useState<AttemptData | null>(null);
  const [previousAnswer, setPreviousAnswer] = useState<PreviousAnswer | null>(null);
  const [nextQuizDay, setNextQuizDay] = useState<string | null>(null);

  // Form state
  const [artistAnswer, setArtistAnswer] = useState("");
  const [trackAnswer, setTrackAnswer] = useState("");
  const [triviaAnswer, setTriviaAnswer] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ isCorrect: boolean; pointsEarned: number } | null>(null);
  const [scoreSaved, setScoreSaved] = useState(false);

  // Audio player state
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const playerRef = useRef<YT.Player | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

 useEffect(() => {
    checkUser();
    fetchQuiz();
    loadYouTubeAPI();

    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        const { getGoogleUserInfo } = await import("../lib/googleAuthHelpers");
        const userInfo = getGoogleUserInfo(session.user);
        if (userInfo) {
          setUserName(userInfo.name);
          setUserPhoto(userInfo.photoUrl);
        }
        
    // If user just signed in, scroll to quiz section and re-fetch quiz
        if (event === 'SIGNED_IN') {
          // Re-fetch quiz to check if score was saved
          setTimeout(() => {
            fetchQuiz();
            const quizSection = document.getElementById('quiz-widget-section');
            if (quizSection) {
              quizSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
          }, 500);
        }
      } else {
        setUserName("");
        setUserPhoto(null);
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const checkUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    const user = session?.user ?? null;
    setUser(user);

    if (user) {
      const { getGoogleUserInfo } = await import("../lib/googleAuthHelpers");
      const userInfo = getGoogleUserInfo(user);
      if (userInfo) {
        setUserName(userInfo.name);
        setUserPhoto(userInfo.photoUrl);
      }
    }
  };

  const loadYouTubeAPI = () => {
    if (window.YT) return;
    const tag = document.createElement("script");
    tag.src = "https://www.youtube.com/iframe_api";
    const firstScriptTag = document.getElementsByTagName("script")[0];
    firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);
  };

const fetchQuiz = async () => {
    try {
      const url = user?.id 
        ? `/api/quiz/current?userId=${user.id}` 
        : "/api/quiz/current";
      const res = await fetch(url);
      const data = await res.json();
      if (data.ok) {
        setQuiz(data.quiz);
        setAttempts(data.attempts);
        setPreviousAnswer(data.previousAnswer);
        setNextQuizDay(data.nextQuizDay);
        
        // Check if score already saved
        if (data.scoreSaved) {
          setScoreSaved(true);
        }
      }
    } catch (error) {
      console.error("Failed to fetch quiz:", error);
    } finally {
      setLoading(false);
    }
  };

  const initPlayer = () => {
    if (!quiz?.youtubeUrl || playerRef.current) return;

    const videoId = extractVideoId(quiz.youtubeUrl);
    if (!videoId) return;

    playerRef.current = new window.YT.Player("quiz-player", {
      height: "0",
      width: "0",
      videoId,
      playerVars: {
        start: quiz.youtubeStart || 0,
        autoplay: 0,
        controls: 0,
        disablekb: 1,
        fs: 0,
        modestbranding: 1,
      },
      events: {
        onReady: () => console.log("Player ready"),
        onStateChange: (event: YT.OnStateChangeEvent) => {
          if (event.data === window.YT.PlayerState.ENDED) {
            stopPlayback();
          }
        },
      },
    });
  };

  useEffect(() => {
    if (quiz?.youtubeUrl && window.YT) {
      initPlayer();
    } else if (quiz?.youtubeUrl) {
      (window as any).onYouTubeIframeAPIReady = initPlayer;
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [quiz]);

  const extractVideoId = (url: string): string | null => {
    const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const match = url.match(regex);
    return match ? match[1] : null;
  };

  const playSnippet = () => {
    if (!playerRef.current || !quiz) return;

    const startTime = quiz.youtubeStart || 0;
    const duration = quiz.youtubeDuration || 10;

    playerRef.current.seekTo(startTime, true);
    playerRef.current.playVideo();
    setIsPlaying(true);
    setProgress(0);

    const startTs = Date.now();
    intervalRef.current = setInterval(() => {
      const elapsed = (Date.now() - startTs) / 1000;
      const progressPct = Math.min((elapsed / duration) * 100, 100);
      setProgress(progressPct);

      if (elapsed >= duration) {
        stopPlayback();
      }
    }, 100);
  };

  const stopPlayback = () => {
    if (playerRef.current) {
      playerRef.current.pauseVideo();
    }
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    setIsPlaying(false);
    setProgress(100);
  };

  const submitAnswer = async () => {
    if (!quiz) return;
    setSubmitting(true);

    try {
      const body: any = { questionId: quiz.id };
      if (quiz.type === "snippet") {
        body.artistAnswer = artistAnswer;
        body.trackAnswer = trackAnswer;
      } else {
        body.answer = triviaAnswer;
      }

      const res = await fetch("/api/quiz/answer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (data.ok) {
        setResult({ isCorrect: data.isCorrect, pointsEarned: data.pointsEarned });
        setAttempts((prev) =>
          prev
            ? {
                ...prev,
                used: data.attemptNumber,
                remaining: data.attemptsRemaining,
                hasCorrectAnswer: data.isCorrect || prev.hasCorrectAnswer,
              }
            : null
        );
      } else {
        alert(data.error === "max_attempts_reached" ? "נגמרו הניסיונות!" : "שגיאה, נסה שוב");
      }
    } catch (error) {
      console.error("Submit error:", error);
      alert("שגיאה בשליחה");
    } finally {
      setSubmitting(false);
    }
  };

  const saveScore = async () => {
    if (!user || !quiz) return;

    try {
      const res = await fetch("/api/quiz/save-score", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          questionId: quiz.id,
          odau: user.id,
          displayName: userName,
          photoUrl: userPhoto,
          isArchive: false,
        }),
      });

      const data = await res.json();
      if (data.ok) {
        setScoreSaved(true);
      } else if (data.error === "score_already_saved") {
        setScoreSaved(true);
      }
    } catch (error) {
      console.error("Save score error:", error);
    }
  };

  const shareWhatsApp = () => {
    const text = result?.isCorrect
      ? `🎵 ניחשתי נכון ב-${attempts?.used} ${attempts?.used === 1 ? "ניסיון" : "ניסיונות"}! הצטרפו לחידון יוצאים לטראק`
      : `🎵 לא הצלחתי הפעם 😅 נסו אתם! חידון יוצאים לטראק`;
    const url = "https://tracktrip.co.il";
    window.open(`https://wa.me/?text=${encodeURIComponent(text + " " + url)}`, "_blank");
  };

  // Loading state
  if (loading) {
    return (
     <div id="quiz-widget-section" className="glass-card rounded-xl p-8 border-2 border-red-500/30">
        <div className="flex items-center justify-center gap-3">
          <div className="w-8 h-8 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin" />
          <span className="text-gray-400">טוען חידון...</span>
        </div>
      </div>
    );
  }

// No quiz today
  if (!quiz) {
    return (
      <div id="quiz-widget-section" className="glass-card rounded-xl p-8 border-2 border-white/10">
        <div className="text-center">
          <div className="relative inline-block mb-6">
            <div className="absolute inset-0 bg-purple-500/20 rounded-full blur-xl animate-pulse" />
            <span className="relative text-6xl block">🎵</span>
          </div>
          
          <h3 className="text-2xl font-bold text-white mb-3">אין חידון היום</h3>
          
          <div className="bg-gradient-to-r from-cyan-500/10 to-purple-500/10 rounded-xl p-4 border border-white/10 mb-6">
            <p className="text-gray-300">
              {nextQuizDay === "Monday" 
                ? "🎵 החידון הבא יום שני - נחשו את הטראק!" 
                : nextQuizDay === "Thursday"
                ? "🧠 החידון הבא יום חמישי - טריוויה!"
                : "החידון הבא בקרוב!"}
            </p>
          </div>
          
          {previousAnswer && (
            <div className="bg-black/30 rounded-xl p-4 border border-white/10 text-right">
              <p className="text-sm text-gray-400 mb-2">✨ התשובה מהחידון הקודם:</p>
              <p className="text-lg font-semibold text-cyan-400">
                {typeof previousAnswer.answer === "string"
                  ? previousAnswer.answer
                  : `${previousAnswer.answer.artist} - ${previousAnswer.answer.track}`}
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

 // Already answered correctly
  if (attempts?.hasCorrectAnswer || result?.isCorrect) {
    return (
      <div id="quiz-widget-section" className="glass-card rounded-xl p-8 border-2 border-green-500/30 bg-gradient-to-b from-green-500/5 to-transparent">
        <div className="text-center">
          {/* Success animation */}
          <div className="relative inline-block mb-6">
            <div className="absolute inset-0 bg-green-500/20 rounded-full blur-xl animate-pulse" />
            <span className="relative text-6xl block">🎉</span>
          </div>
          
          <h3 className="text-3xl font-bold text-green-400 mb-3">כל הכבוד!</h3>
          
          <p className="text-gray-300 text-lg mb-2">
            ענית נכון ב-{attempts?.used || (result?.pointsEarned === 3 ? 1 : result?.pointsEarned === 2 ? 2 : 3)}{" "}
            {(attempts?.used || 1) === 1 ? "ניסיון" : "ניסיונות"}
          </p>
          
          {result && (
            <div className="inline-block bg-cyan-500/20 border border-cyan-500/30 rounded-full px-6 py-2 mb-6">
              <span className="text-cyan-400 font-bold text-xl">+{result.pointsEarned} נקודות!</span>
            </div>
          )}

          {/* Leaderboard section */}
          {!scoreSaved && (
            <div className="bg-gradient-to-r from-purple-500/10 to-cyan-500/10 border-2 border-purple-500/30 rounded-2xl p-6 mt-6">
              <div className="flex items-center justify-center gap-2 mb-3">
                <span className="text-2xl">🏆</span>
                <h4 className="text-xl font-bold text-white">רוצה להיכנס ללידרבורד?</h4>
              </div>
              
              <p className="text-gray-400 mb-4">
                התחבר עם Google כדי לשמור את הניקוד שלך ולהתחרות מול אחרים!
              </p>
              
              {user ? (
                <button
                  onClick={saveScore}
                  className="w-full bg-gradient-to-r from-purple-500 to-cyan-500 hover:from-purple-600 hover:to-cyan-600 text-white font-bold py-4 px-8 rounded-xl transition-all shadow-lg hover:shadow-purple-500/25"
                >
                  💾 שמור את הניקוד שלי ללידרבורד
                </button>
              ) : (
                <GoogleLoginButton />
              )}
            </div>
          )}

          {scoreSaved && (
            <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4 mt-6">
              <div className="flex items-center justify-center gap-2">
                <span className="text-2xl">✅</span>
                <p className="text-green-400 font-semibold text-lg">הניקוד נשמר בלידרבורד!</p>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

 // Out of attempts
  if (attempts && attempts.remaining === 0) {
    return (
      <div id="quiz-widget-section" className="glass-card rounded-xl p-8 border-2 border-red-500/30 bg-gradient-to-b from-red-500/5 to-transparent">
        <div className="text-center">
          <div className="relative inline-block mb-6">
            <div className="absolute inset-0 bg-red-500/20 rounded-full blur-xl" />
            <span className="relative text-6xl block">😅</span>
          </div>
          
          <h3 className="text-3xl font-bold text-red-400 mb-3">נגמרו הניסיונות</h3>
          <p className="text-gray-400 text-lg mb-6">לא נורא! נסה שוב בחידון הבא</p>
          
          <div className="bg-white/5 rounded-xl p-4 border border-white/10">
            <p className="text-sm text-gray-400">
              החידון הבא: {" "}
              <span className="text-cyan-400 font-medium">
                {new Date().getDay() < 4 ? "יום חמישי (טריוויה)" : "יום שני (נחשו את הטראק)"}
              </span>
            </p>
          </div>
        </div>
      </div>
    );
  }

 
 // Active quiz - ready to answer
  return (
    <div id="quiz-widget-section" className="glass-card rounded-xl overflow-hidden border-2 border-cyan-500/30">
      {/* Header */}
      <div className={`p-4 ${quiz.type === "snippet" ? "bg-gradient-to-r from-cyan-500/20 to-purple-500/20" : "bg-gradient-to-r from-purple-500/20 to-pink-500/20"}`}>
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <span className="text-4xl">{quiz.type === "snippet" ? "🎵" : "🧠"}</span>
            <div>
              <h2 className="text-xl md:text-2xl font-bold text-white">
                {quiz.type === "snippet" ? "נחשו את הטראק" : "טריוויית טראנס"}
              </h2>
              <p className="text-sm text-white/60">
                {quiz.type === "snippet" ? "הקשיבו לקטע ונחשו את השיר" : "ענו על השאלה"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-black/30 rounded-full px-4 py-2">
            <span className="text-sm text-gray-400">ניסיונות:</span>
            <div className="flex gap-1">
              {[1, 2, 3].map((n) => (
                <div
                  key={n}
                  className={`w-3 h-3 rounded-full transition-all ${
                    n <= (attempts?.used || 0) ? "bg-gray-600" : "bg-cyan-400 shadow-lg shadow-cyan-400/50"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 md:p-8">
        {/* Contributor attribution */}
        {quiz.contributor && (
          <div className="flex items-center gap-3 mb-6 p-3 bg-white/5 rounded-lg border border-white/10">
            {quiz.contributor.photo_url ? (
              <img
                src={quiz.contributor.photo_url}
                alt={quiz.contributor.name}
                className="w-10 h-10 rounded-full object-cover"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-purple-500/30 flex items-center justify-center">
                <span className="text-lg">👤</span>
              </div>
            )}
            <div>
              <p className="text-xs text-gray-400">שאלה מאת</p>
              <p className="text-sm font-medium text-purple-400">{quiz.contributor.name}</p>
            </div>
          </div>
        )}

        {/* Snippet player */}
        {quiz.type === "snippet" && quiz.youtubeUrl && (
          <div className="mb-6">
            <div id="quiz-player" className="hidden" />

            <div className="bg-gradient-to-b from-black/60 to-black/40 rounded-2xl p-6 border border-cyan-500/20">
              {/* Visualizer bars */}
              <div className="flex items-end justify-center gap-1 h-20 mb-6">
                {[...Array(24)].map((_, i) => (
                  <div
                    key={i}
                    className={`w-2 rounded-full transition-all duration-150 ${
                      isPlaying 
                        ? "bg-gradient-to-t from-cyan-500 to-purple-500" 
                        : "bg-white/20"
                    }`}
                    style={{
                      height: isPlaying ? `${20 + Math.random() * 80}%` : "30%",
                      animationDelay: `${i * 50}ms`,
                    }}
                  />
                ))}
              </div>

              {/* Progress bar */}
              <div className="w-full bg-white/10 rounded-full h-2 mb-6">
                <div
                  className="bg-gradient-to-r from-cyan-400 to-purple-500 h-2 rounded-full transition-all duration-100 shadow-lg shadow-cyan-500/30"
                  style={{ width: `${progress}%` }}
                />
              </div>

              {/* Play button */}
              <button
                onClick={isPlaying ? stopPlayback : playSnippet}
                className={`w-full py-4 rounded-xl font-bold flex items-center justify-center gap-3 transition-all ${
                  isPlaying 
                    ? "bg-white/10 text-white border-2 border-white/20" 
                    : "bg-gradient-to-r from-cyan-500 to-purple-500 text-white shadow-lg hover:shadow-cyan-500/25 hover:scale-[1.02]"
                }`}
              >
                {isPlaying ? (
                  <>
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                    </svg>
                    עצור
                  </>
                ) : (
                  <>
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                    נגן קטע ({quiz.youtubeDuration || 10} שניות)
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Trivia question */}
        {quiz.type === "trivia" && quiz.questionText && (
          <div className="mb-6 p-6 bg-gradient-to-b from-purple-500/10 to-transparent rounded-2xl border border-purple-500/20">
            {quiz.imageUrl && (
              <img
                src={quiz.imageUrl}
                alt="Quiz"
                className="w-full max-h-64 object-contain rounded-lg mb-4"
              />
            )}
            <p className="text-xl md:text-2xl text-center font-medium text-white">{quiz.questionText}</p>
          </div>
        )}

        {/* Answer form */}
        <div className="space-y-4">
          {quiz.type === "snippet" ? (
            <>
              <div>
                <label className="block text-sm text-gray-400 mb-2 font-medium">שם האמן</label>
                <input
                  type="text"
                  value={artistAnswer}
                  onChange={(e) => setArtistAnswer(e.target.value)}
                  className="w-full bg-black/50 border-2 border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:border-cyan-500 focus:outline-none transition-all"
                  placeholder="הקלידו את שם האמן..."
                  disabled={submitting}
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2 font-medium">שם הטראק</label>
                <input
                  type="text"
                  value={trackAnswer}
                  onChange={(e) => setTrackAnswer(e.target.value)}
                  className="w-full bg-black/50 border-2 border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:border-cyan-500 focus:outline-none transition-all"
                  placeholder="הקלידו את שם הטראק..."
                  disabled={submitting}
                />
              </div>
            </>
          ) : (
            <div>
              <label className="block text-sm text-gray-400 mb-2 font-medium">התשובה שלך</label>
              <input
                type="text"
                value={triviaAnswer}
                onChange={(e) => setTriviaAnswer(e.target.value)}
                className="w-full bg-black/50 border-2 border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none transition-all"
                placeholder="הקלידו את התשובה..."
                disabled={submitting}
              />
            </div>
          )}

          {/* Wrong answer feedback */}
          {result && !result.isCorrect && (
            <div className="p-4 bg-red-500/10 border-2 border-red-500/30 rounded-xl text-center">
              <p className="text-red-400 font-bold text-lg">❌ לא נכון, נסה שוב!</p>
              <p className="text-sm text-gray-400 mt-1">נשארו {attempts?.remaining} ניסיונות</p>
            </div>
          )}

          <button
            onClick={submitAnswer}
            disabled={
              submitting ||
              (quiz.type === "snippet" ? !artistAnswer || !trackAnswer : !triviaAnswer)
            }
            className="w-full bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 disabled:from-gray-600 disabled:to-gray-600 text-white py-4 rounded-xl font-bold disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-cyan-500/25 hover:scale-[1.01]"
          >
            {submitting ? (
              <span className="flex items-center justify-center gap-2">
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                בודק...
              </span>
            ) : (
              "שלח תשובה"
            )}
          </button>
        </div>

        {/* Points info */}
        <div className="mt-6 pt-4 border-t border-white/10 text-center">
          <p className="text-sm text-gray-500">
            <span className="text-cyan-400">ניסיון ראשון</span> = 3 נקודות • 
            <span className="text-purple-400"> שני</span> = 2 נקודות • 
            <span className="text-pink-400"> שלישי</span> = 1 נקודה
          </p>
      </div>
      </div>
    </div>
  );
}
