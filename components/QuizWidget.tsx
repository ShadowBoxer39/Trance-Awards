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
        
        // If user just signed in, scroll to quiz section
        if (event === 'SIGNED_IN') {
          setTimeout(() => {
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
      const res = await fetch("/api/quiz/current");
      const data = await res.json();
      if (data.ok) {
        setQuiz(data.quiz);
        setAttempts(data.attempts);
        setPreviousAnswer(data.previousAnswer);
        setNextQuizDay(data.nextQuizDay);
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
      <div id="quiz-widget-section" className="glass-card rounded-xl p-8 border-2 border-cyan-500/30">
        <div className="text-center">
          <span className="text-5xl mb-4 block">🎵</span>
          <h3 className="text-xl font-bold mb-2">אין חידון היום</h3>
          <p className="text-gray-400 mb-4">
            {nextQuizDay === "Monday"
              ? "החידון הבא יום שני - נחשו את הטראק!"
              : nextQuizDay === "Thursday"
              ? "החידון הבא יום חמישי - טריוויה!"
              : "החידון הבא בקרוב!"}
          </p>
          {previousAnswer && (
            <div className="mt-6 p-4 bg-black/30 rounded-lg text-right">
              <p className="text-sm text-gray-400 mb-2">התשובה מהחידון הקודם:</p>
              <p className="text-cyan-400 font-semibold">
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
     <div id="quiz-widget-section" className="glass-card rounded-xl p-8 border-2 border-green-500/30">
        <div className="text-center">
          <span className="text-5xl mb-4 block">🎉</span>
          <h3 className="text-2xl font-bold text-green-400 mb-2">כל הכבוד!</h3>
          <p className="text-gray-300 mb-4">
            ענית נכון ב-{attempts?.used || (result?.pointsEarned === 3 ? 1 : result?.pointsEarned === 2 ? 2 : 3)}{" "}
            {(attempts?.used || 1) === 1 ? "ניסיון" : "ניסיונות"}
          </p>
          {result && (
            <p className="text-cyan-400 font-semibold mb-6">+{result.pointsEarned} נקודות!</p>
          )}

          {!scoreSaved && user ? (
            <button
              onClick={saveScore}
              className="btn-primary px-6 py-3 rounded-xl font-medium mb-4"
            >
              💾 שמור ללידרבורד
            </button>
          ) : !user && !scoreSaved ? (
            <div className="mb-4">
              <p className="text-gray-400 mb-3">התחבר לשמירת הניקוד</p>
              <GoogleLoginButton />
            </div>
          ) : scoreSaved ? (
            <p className="text-green-400 mb-4">✓ הניקוד נשמר!</p>
          ) : null}

          <button
            onClick={shareWhatsApp}
            className="btn-secondary px-6 py-3 rounded-xl font-medium flex items-center gap-2 mx-auto"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
            שתף בוואטסאפ
          </button>
        </div>
      </div>
    );
  }

  // Out of attempts
  if (attempts && attempts.remaining === 0) {
    return (
     <div id="quiz-widget-section" className="glass-card rounded-xl p-8 border-2 border-red-500/30">
        <div className="text-center">
          <span className="text-5xl mb-4 block">😅</span>
          <h3 className="text-2xl font-bold text-red-400 mb-2">נגמרו הניסיונות</h3>
          <p className="text-gray-400 mb-6">נסה שוב בחידון הבא!</p>
          <button
            onClick={shareWhatsApp}
            className="btn-secondary px-6 py-3 rounded-xl font-medium flex items-center gap-2 mx-auto"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
            שתף בוואטסאפ
          </button>
        </div>
      </div>
    );
  }

 
 // Active quiz - ready to answer
  return (
    <div id="quiz-widget-section" className="glass-card rounded-xl p-6 md:p-8 border-2 border-cyan-500/30">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <span className="text-3xl">{quiz.type === "snippet" ? "🎵" : "🧠"}</span>
          <h2 className="text-2xl md:text-3xl font-semibold text-white">
            {quiz.type === "snippet" ? "נחשו את הטראק" : "טריוויית טראנס"}
          </h2>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <span className="text-gray-400">ניסיונות:</span>
          <div className="flex gap-1">
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                className={`w-3 h-3 rounded-full ${
                  n <= (attempts?.used || 0) ? "bg-gray-600" : "bg-cyan-500"
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Contributor attribution */}
      {quiz.contributor && (
        <div className="flex items-center gap-3 mb-6 p-3 bg-black/30 rounded-lg">
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

          <div className="bg-black/40 rounded-xl p-6 border border-cyan-500/20">
            {/* Visualizer bars */}
            <div className="flex items-end justify-center gap-1 h-16 mb-4">
              {[...Array(20)].map((_, i) => (
                <div
                  key={i}
                  className={`w-2 bg-gradient-to-t from-cyan-500 to-purple-500 rounded-full transition-all duration-150 ${
                    isPlaying ? "animate-pulse" : ""
                  }`}
                  style={{
                    height: isPlaying ? `${Math.random() * 100}%` : "20%",
                    animationDelay: `${i * 50}ms`,
                  }}
                />
              ))}
            </div>

            {/* Progress bar */}
            <div className="w-full bg-gray-700 rounded-full h-2 mb-4">
              <div
                className="bg-gradient-to-r from-cyan-500 to-purple-500 h-2 rounded-full transition-all duration-100"
                style={{ width: `${progress}%` }}
              />
            </div>

            {/* Play button */}
            <button
              onClick={isPlaying ? stopPlayback : playSnippet}
              className="w-full btn-primary py-4 rounded-xl font-semibold flex items-center justify-center gap-2"
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
        <div className="mb-6 p-6 bg-black/40 rounded-xl border border-purple-500/20">
          {quiz.imageUrl && (
            <img
              src={quiz.imageUrl}
              alt="Quiz"
              className="w-full max-h-64 object-contain rounded-lg mb-4"
            />
          )}
          <p className="text-xl text-center font-medium">{quiz.questionText}</p>
        </div>
      )}

      {/* Answer form */}
      <div className="space-y-4">
        {quiz.type === "snippet" ? (
          <>
            <div>
              <label className="block text-sm text-gray-400 mb-2">שם האמן</label>
              <input
                type="text"
                value={artistAnswer}
                onChange={(e) => setArtistAnswer(e.target.value)}
                className="w-full bg-black/50 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:border-cyan-500 focus:outline-none transition"
                placeholder="הקלידו את שם האמן..."
                disabled={submitting}
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-2">שם הטראק</label>
              <input
                type="text"
                value={trackAnswer}
                onChange={(e) => setTrackAnswer(e.target.value)}
                className="w-full bg-black/50 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:border-cyan-500 focus:outline-none transition"
                placeholder="הקלידו את שם הטראק..."
                disabled={submitting}
              />
            </div>
          </>
        ) : (
          <div>
            <label className="block text-sm text-gray-400 mb-2">התשובה שלך</label>
            <input
              type="text"
              value={triviaAnswer}
              onChange={(e) => setTriviaAnswer(e.target.value)}
              className="w-full bg-black/50 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:border-cyan-500 focus:outline-none transition"
              placeholder="הקלידו את התשובה..."
              disabled={submitting}
            />
          </div>
        )}

        {/* Wrong answer feedback */}
        {result && !result.isCorrect && (
          <div className="p-4 bg-red-500/20 border border-red-500/30 rounded-xl text-center">
            <p className="text-red-400 font-medium">❌ לא נכון, נסה שוב!</p>
            <p className="text-sm text-gray-400">נשארו {attempts?.remaining} ניסיונות</p>
          </div>
        )}

        <button
          onClick={submitAnswer}
          disabled={
            submitting ||
            (quiz.type === "snippet" ? !artistAnswer || !trackAnswer : !triviaAnswer)
          }
          className="w-full btn-primary py-4 rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
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
      <div className="mt-6 text-center text-sm text-gray-500">
        <p>ניסיון ראשון = 3 נקודות | שני = 2 נקודות | שלישי = 1 נקודה</p>
      </div>
    </div>
  );
}
