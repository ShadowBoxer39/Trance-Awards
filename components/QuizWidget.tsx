import React, { useState, useEffect, useRef } from "react";
import { useSession, signIn } from "next-auth/react";

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
  const { data: session } = useSession();
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
    fetchQuiz();
    loadYouTubeAPI();
  }, []);

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
    if (!session?.user || !quiz) return;

    try {
      const res = await fetch("/api/quiz/save-score", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          questionId: quiz.id,
          odau: (session as any).odau,
          displayName: session.user.name,
          photoUrl: session.user.image,
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
      <div className="glass-card rounded-xl p-8 border-2 border-cyan-500/30">
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
      <div className="glass-card rounded-xl p-8 border-2 border-cyan-500/30">
        <div className="text-center">
          <span className="text-5xl mb-4 block">🎵</span>
          <h3 className="text-xl
