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
  audioUrl: string | null;
  contributor: { name: string; photo_url: string | null } | null;
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

interface LeaderboardEntry {
  userId: string;
  displayName: string;
  photoUrl: string | null;
  totalPoints: number;
  questionsAnswered: number;
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

  const [artistAnswer, setArtistAnswer] = useState("");
  const [trackAnswer, setTrackAnswer] = useState("");
  const [triviaAnswer, setTriviaAnswer] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ isCorrect: boolean; pointsEarned: number } | null>(null);
  const [scoreSaved, setScoreSaved] = useState(false);
  
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loadingLeaderboard, setLoadingLeaderboard] = useState(false);
  const [isProcessingAuth, setIsProcessingAuth] = useState(false);

  // Player State
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [useAudioPlayer, setUseAudioPlayer] = useState(false); // Controls Fallback
  
  const youtubePlayerRef = useRef<YT.Player | null>(null);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const authProcessed = useRef(false);

  // 1. Init
  useEffect(() => {
    loadYouTubeAPI();
    const initAuth = async () => {
      const url = window.location.href;
      const hasCode = window.location.search && window.location.search.includes('code=');
      const hasHash = window.location.hash && window.location.hash.includes('access_token');

      if ((hasCode || hasHash) && !authProcessed.current) {
        setIsProcessingAuth(true);
        authProcessed.current = true;
        try {
          const { data } = await supabase.auth.exchangeCodeForSession(url);
          if (data.session) {
            window.history.replaceState({}, document.title, window.location.pathname);
            await updateUserState(data.session.user);
          }
        } catch (e) { console.error(e); } 
        finally { setIsProcessingAuth(false); }
      } else {
        const { data } = await supabase.auth.getSession();
        if (data.session?.user) await updateUserState(data.session.user);
      }
      fetchQuiz();
    };
    initAuth();
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) await updateUserState(session.user);
      else if (event === 'SIGNED_OUT') { setUser(null); setUserName(""); setUserPhoto(null); setScoreSaved(false); }
    });
    return () => { authListener.subscription.unsubscribe(); stopPlayback(); };
  }, []);

  useEffect(() => { if (user?.id) fetchQuiz(); }, [user?.id]); 
  useEffect(() => { if (attempts?.hasCorrectAnswer || result?.isCorrect || scoreSaved) fetchLeaderboard(); }, [attempts?.hasCorrectAnswer, result?.isCorrect, scoreSaved]);

  const fetchLeaderboard = async () => {
    setLoadingLeaderboard(true);
    try {
      const res = await fetch("/api/quiz/leaderboard?limit=10");
      const data = await res.json();
      if (data.ok) setLeaderboard(data.leaderboard || []);
    } catch (e) { console.error(e); } 
    finally { setLoadingLeaderboard(false); }
  };

  const updateUserState = async (currentUser: any) => {
    setUser(currentUser);
    const { getGoogleUserInfo } = await import("../lib/googleAuthHelpers");
    const userInfo = getGoogleUserInfo(currentUser);
    if (userInfo) { setUserName(userInfo.name); setUserPhoto(userInfo.photoUrl); }
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
      const { data: sessionData } = await supabase.auth.getSession();
      const currentUserId = sessionData.session?.user?.id;
      const url = currentUserId ? `/api/quiz/current?userId=${currentUserId}` : "/api/quiz/current";
      const res = await fetch(url);
      const data = await res.json();
      if (data.ok) {
        setQuiz(data.quiz);
        setAttempts(data.attempts);
        setPreviousAnswer(data.previousAnswer);
        setNextQuizDay(data.nextQuizDay);
        if (data.scoreSaved) setScoreSaved(true);
        
        // Prefer Audio Player if available
        setUseAudioPlayer(!!data.quiz.audioUrl);
      }
    } catch (error) { console.error("Failed to fetch quiz:", error); } 
    finally { setLoading(false); }
  };

  const extractVideoId = (url: string): string | null => {
    const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const match = url.match(regex);
    return match ? match[1] : null;
  };

  // --- PLAYER LOGIC ---
  
  // Initialize YouTube fallback
  const initYouTubePlayer = () => {
    if (useAudioPlayer || !quiz?.youtubeUrl || youtubePlayerRef.current) return;
    const videoId = extractVideoId(quiz.youtubeUrl);
    if (!videoId) return;
    youtubePlayerRef.current = new window.YT.Player("quiz-player", {
      height: "0", width: "0", videoId,
      playerVars: { start: quiz.youtubeStart || 0, autoplay: 0, controls: 0, disablekb: 1, fs: 0, modestbranding: 1 },
      events: {
        onReady: () => console.log("Player ready"),
        onStateChange: (event: YT.OnStateChangeEvent) => { if (event.data === window.YT.PlayerState.ENDED) stopPlayback(); },
      },
    });
  };

  useEffect(() => {
    // If audio player is disabled or unavailable, try YouTube
    if (!useAudioPlayer && quiz?.youtubeUrl) {
       if (window.YT) initYouTubePlayer(); 
       else (window as any).onYouTubeIframeAPIReady = initYouTubePlayer; 
    }
    return () => stopPlayback();
  }, [quiz, useAudioPlayer]);

  // --- AUDIO HANDLERS ---
  const handleAudioMetadata = () => {
    // When audio loads, seek to start time
    if (audioPlayerRef.current && quiz?.youtubeStart) {
        audioPlayerRef.current.currentTime = quiz.youtubeStart;
    }
  };

  const handleAudioTimeUpdate = () => { // Fixed Name
    if (!audioPlayerRef.current || !quiz) return;
    const current = audioPlayerRef.current.currentTime;
    const start = quiz.youtubeStart || 0;
    const duration = quiz.youtubeDuration || 10;
    
    const elapsed = current - start;
    const pct = Math.min((elapsed / duration) * 100, 100);
    setProgress(pct);

    if (elapsed >= duration) stopPlayback();
  };

const handleAudioError = (e: any) => {
    console.error("Audio Stream Failed. Falling back to YouTube.", e);
    setUseAudioPlayer(false); // Switch to YouTube
    setIsPlaying(false);
    setProgress(0);
    
    // Force YouTube player initialization if not ready
    if (!youtubePlayerRef.current && quiz?.youtubeUrl) {
        initYouTubePlayer();
    }
};

 const playSnippet = () => {
    if (!quiz) return;
    
    // 1. Try Audio Player first
    if (useAudioPlayer && quiz.audioUrl && audioPlayerRef.current) {
        const start = quiz.youtubeStart || 0;
        
        // Set the start time
        audioPlayerRef.current.currentTime = start;
        
        // Try to play
        audioPlayerRef.current.play()
            .then(() => {
                console.log("Audio playing successfully");
                setIsPlaying(true);
            })
            .catch(e => {
                console.error("Audio Play failed, switching to YouTube:", e);
                // Switch to YouTube and try again
                setUseAudioPlayer(false);
                // Wait a bit for YouTube player to initialize, then play
                setTimeout(() => {
                    if (youtubePlayerRef.current && youtubePlayerRef.current.playVideo) {
                        playYouTubeVideo();
                    } else {
                        console.error("YouTube player not ready");
                        alert("נכשל בניגון השמע. נסה שוב בעוד כמה שניות.");
                    }
                }, 500);
            });
    } 
    // 2. YouTube Player (Fallback)
    else if (youtubePlayerRef.current && youtubePlayerRef.current.playVideo) {
        playYouTubeVideo();
    } else {
        console.error("No player available");
        alert("הנגן לא מוכן. נסה שוב בעוד רגע.");
    }
};

// Separate function for YouTube playback
const playYouTubeVideo = () => {
    if (!quiz || !youtubePlayerRef.current) return;
    
    const start = quiz.youtubeStart || 0;
    const duration = quiz.youtubeDuration || 10;
    
    youtubePlayerRef.current.seekTo(start, true);
    youtubePlayerRef.current.playVideo();
    setIsPlaying(true);
    
    const startTs = Date.now();
    if (intervalRef.current) clearInterval(intervalRef.current);
    
    intervalRef.current = setInterval(() => {
        const elapsed = (Date.now() - startTs) / 1000;
        setProgress(Math.min((elapsed / duration) * 100, 100));
        if (elapsed >= duration) stopPlayback();
    }, 100);
};

  const stopPlayback = () => {
    setIsPlaying(false); 
    setProgress(100);

    if (audioPlayerRef.current) { 
        audioPlayerRef.current.pause(); 
        // Reset to start time for next play
        if(quiz?.youtubeStart) audioPlayerRef.current.currentTime = quiz.youtubeStart;
    }
    if (youtubePlayerRef.current && youtubePlayerRef.current.pauseVideo) {
        youtubePlayerRef.current.pauseVideo();
    }
    if (intervalRef.current) clearInterval(intervalRef.current);
  };

  const submitAnswer = async () => {
    if (!quiz) return;
    setSubmitting(true);
    try {
      const body: any = { questionId: quiz.id };
      if (quiz.type === "snippet") { body.artistAnswer = artistAnswer; body.trackAnswer = trackAnswer; } 
      else { body.answer = triviaAnswer; }
      const res = await fetch("/api/quiz/answer", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const data = await res.json();
      if (data.ok) {
        setResult({ isCorrect: data.isCorrect, pointsEarned: data.pointsEarned });
        setAttempts((prev) => prev ? { ...prev, used: data.attemptNumber, remaining: data.attemptsRemaining, hasCorrectAnswer: data.isCorrect || prev.hasCorrectAnswer } : null);
      } else { alert(data.error === "max_attempts_reached" ? "נגמרו הניסיונות!" : "שגיאה, נסה שוב"); }
    } catch (error) { alert("שגיאה בשליחה"); } finally { setSubmitting(false); }
  };

  const saveScore = async () => {
    if (!user || !quiz) return;
    try {
      const res = await fetch("/api/quiz/save-score", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ questionId: quiz.id, odau: user.id, displayName: userName, photoUrl: userPhoto, isArchive: false }) });
      const data = await res.json();
      if (data.ok || data.error === "score_already_saved") { setScoreSaved(true); fetchLeaderboard(); }
    } catch (error) { console.error("Save score error:", error); }
  };

  const shareWhatsApp = () => {
    const text = result?.isCorrect
      ? `🎵 ניחשתי נכון ב-${attempts?.used} ${attempts?.used === 1 ? "ניסיון" : "ניסיונות"}! הצטרפו לחידון יוצאים לטראק`
      : `🎵 לא הצלחתי הפעם 😅 נסו אתם! חידון יוצאים לטראק`;
    const url = "https://tracktrip.co.il";
    window.open(`https://wa.me/?text=${encodeURIComponent(text + " " + url)}`, "_blank");
  };

  // --- RENDER ---
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

  // SUCCESS STATE
  if (attempts?.hasCorrectAnswer || result?.isCorrect || scoreSaved) {
    return (
      <div id="quiz-widget-section" className="glass-card rounded-xl p-8 border-2 border-green-500/30 bg-gradient-to-b from-green-500/5 to-transparent">
        <div className="text-center">
          
          <div className="mb-8">
            <div className="relative inline-block mb-4">
              <div className="absolute inset-0 bg-green-500/20 rounded-full blur-xl animate-pulse" />
              <span className="relative text-6xl block">🎉</span>
            </div>
            
            <h3 className="text-3xl font-bold text-green-400 mb-2">כל הכבוד!</h3>
            
            <p className="text-gray-300 mb-4">
              {scoreSaved 
                ? "הניקוד שלך שמור במערכת!" 
                : `ענית נכון ב-${attempts?.used || (result?.pointsEarned === 3 ? 1 : result?.pointsEarned === 2 ? 2 : 3)} ניסיונות`
              }
            </p>
            
            {result && !scoreSaved && (
              <div className="inline-block bg-cyan-500/20 border border-cyan-500/30 rounded-full px-4 py-1 mb-4">
                <span className="text-cyan-400 font-bold">+{result.pointsEarned} נקודות!</span>
              </div>
            )}

            <button
              onClick={shareWhatsApp}
              className="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-3 px-6 rounded-xl transition-all flex items-center justify-center gap-2 mb-6"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
              שתף בווצאפ
            </button>
          </div>

          {!scoreSaved && (
            <div className="bg-black/30 border border-white/10 rounded-xl p-6 mb-8">
              <div className="flex items-center justify-center gap-2 mb-3">
                <span className="text-2xl">🏆</span>
                <h4 className="text-lg font-bold text-white">שמור ניקוד בטבלה</h4>
              </div>
              
              <p className="text-sm text-gray-400 mb-4">
                התחבר כדי להופיע בטבלת המובילים ולהתחרות עם חברים!
              </p>
              
              {isProcessingAuth ? (
                 <div className="w-full py-3 px-6 bg-white/5 rounded-lg text-white flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>מתחבר...</span>
                 </div>
              ) : user ? (
                <button
                  onClick={saveScore}
                  className="w-full bg-gradient-to-r from-purple-500 to-cyan-500 hover:from-purple-600 hover:to-cyan-600 text-white font-bold py-3 px-6 rounded-lg transition-all shadow-lg hover:shadow-purple-500/25"
                >
                  💾 שמור ללידרבורד
                </button>
              ) : (
                <div className="flex justify-center">
                  <GoogleLoginButton />
                </div>
              )}
            </div>
          )}

          {scoreSaved && (
            <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-3 mb-8 flex items-center justify-center gap-2">
              <span className="text-xl">✅</span>
              <p className="text-green-400 font-medium">הניקוד נשמר בלידרבורד!</p>
            </div>
          )}

          {/* LEADERBOARD LIST */}
          <div className="text-right border-t border-white/10 pt-6">
            <h4 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <span>🏆</span> טבלת המובילים
            </h4>
            
            {loadingLeaderboard ? (
              <div className="text-center py-4 text-gray-500">טוען טבלה...</div>
            ) : leaderboard.length === 0 ? (
              <div className="text-center py-4 text-gray-500">אין עדיין מובילים. הייה הראשון!</div>
            ) : (
              <div className="space-y-2 max-h-80 overflow-y-auto pr-1 custom-scrollbar">
                {leaderboard.map((entry, idx) => (
                  <div 
                    key={entry.userId} 
                    className={`flex items-center justify-between p-3 rounded-lg transition-colors ${
                      entry.userId === user?.id 
                        ? "bg-purple-500/20 border border-purple-500/50" 
                        : "bg-white/5 hover:bg-white/10"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold ${
                        idx === 0 ? "bg-yellow-500 text-black" :
                        idx === 1 ? "bg-gray-300 text-black" :
                        idx === 2 ? "bg-orange-400 text-black" :
                        "bg-white/10 text-gray-400"
                      }`}>
                        {idx + 1}
                      </div>
                      
                      {entry.photoUrl ? (
                        <img 
                          src={entry.photoUrl} 
                          alt={entry.displayName} 
                          className="w-8 h-8 rounded-full object-cover border border-white/20"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-sm">👤</div>
                      )}
                      
                      <div className="flex flex-col">
                        <span className={`text-sm font-medium ${entry.userId === user?.id ? "text-purple-300" : "text-gray-200"}`}>
                          {entry.displayName}
                        </span>
                        <span className="text-[10px] text-gray-500">
                          ענה על {entry.questionsAnswered} שאלות
                        </span>
                      </div>
                    </div>
                    
                    <div className="font-bold text-cyan-400 tabular-nums">
                      {entry.totalPoints} נק׳
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

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
        {quiz.type === "snippet" && (quiz.youtubeUrl || quiz.audioUrl) && (
          <div className="mb-6">
            <div id="quiz-player" className="hidden" />
            
            {/* Audio Element */}
            {useAudioPlayer && quiz.audioUrl && (
                <audio 
                    ref={audioPlayerRef} 
                    src={quiz.audioUrl} 
                    preload="auto" 
                    onLoadedMetadata={handleAudioMetadata}
                    onTimeUpdate={handleAudioTimeUpdate}
                    onError={handleAudioError}
                    onEnded={stopPlayback}
                />
            )}

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
