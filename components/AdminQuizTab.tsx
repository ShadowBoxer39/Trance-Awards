import React, { useState, useEffect, useRef } from "react";

interface QuizQuestion {
  id: number;
  type: "snippet" | "trivia";
  question_text: string | null;
  youtube_url: string | null;
  youtube_start_seconds: number | null;
  youtube_duration_seconds: number | null;
  accepted_artists: string[] | null;
  accepted_tracks: string[] | null;
  accepted_answers: string[] | null;
  status: string;
  created_at: string;
  contributor: { name: string } | null;
}

interface QuizContributor {
  id: number;
  name: string;
  photo_url: string | null;
  invite_code: string;
  is_active: boolean;
  user_id: string | null;
  invited_at: string;
}

interface ScheduleItem {
  id: number;
  scheduled_for: string;
  type: "snippet" | "trivia";
  is_active: boolean;
  question: QuizQuestion | null;
}

interface LeaderboardEntry {
  userId: string;
  displayName: string;
  photoUrl: string | null;
  totalPoints: number;
  questionsAnswered: number;
}

// --- HELPERS ---

const getYouTubeID = (url: string) => {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
};

const getYouTubeTimestamp = (url: string) => {
  try {
    const urlObj = new URL(url);
    const params = new URLSearchParams(urlObj.search);
    const t = params.get('t');
    if (t) {
      const seconds = t.replace('s', ''); 
      return parseInt(seconds, 10);
    }
    return null;
  } catch (e) {
    return null;
  }
};

const formatTime = (seconds: number) => {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
};

export default function AdminQuizTab({ adminKey }: { adminKey: string }) {
  const [subTab, setSubTab] = useState<"questions" | "schedule" | "contributors" | "leaderboard" | "add">("questions");
  const [loading, setLoading] = useState(false);

  // Questions state
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [questionsFilter, setQuestionsFilter] = useState<"pending" | "approved" | "all">("pending");

  // Schedule state
  const [schedule, setSchedule] = useState<ScheduleItem[]>([]);
  const [availableQuestions, setAvailableQuestions] = useState<QuizQuestion[]>([]);

  // Contributors state
  const [contributors, setContributors] = useState<QuizContributor[]>([]);
  const [newInviteName, setNewInviteName] = useState("");

  // Leaderboard state
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);

  // Add question form state
  const [formType, setFormType] = useState<"snippet" | "trivia">("snippet");
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [startSeconds, setStartSeconds] = useState(0);
  const [duration, setDuration] = useState(10);
  const [acceptedArtists, setAcceptedArtists] = useState("");
  const [acceptedTracks, setAcceptedTracks] = useState("");
  const [questionText, setQuestionText] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [acceptedAnswers, setAcceptedAnswers] = useState("");

  // Preview Player
  const playerRef = useRef<any>(null);

  useEffect(() => {
    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = "https://www.youtube.com/iframe_api";
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);
    }
    
    if (subTab === "questions") fetchQuestions();
    else if (subTab === "schedule") fetchSchedule();
    else if (subTab === "contributors") fetchContributors();
    else if (subTab === "leaderboard") fetchLeaderboard();
  }, [subTab, questionsFilter]);

  // Smart URL Handler
  const handleUrlChange = (val: string) => {
    setYoutubeUrl(val);
    const t = getYouTubeTimestamp(val);
    if (t && !isNaN(t)) {
      setStartSeconds(t);
    }
  };

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
      playerRef.current = new window.YT.Player('admin-preview-player', {
        height: '200',
        width: '100%',
        videoId: videoId,
        playerVars: {
          start: startSeconds,
          end: startSeconds + duration,
          autoplay: 1,
          controls: 1,
        },
      });
    }
  };

  const fetchQuestions = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/quiz/admin-questions?key=${adminKey}&filter=${questionsFilter}`);
      const data = await res.json();
      if (data.ok) setQuestions(data.questions || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const fetchSchedule = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/quiz/schedule?key=${adminKey}`);
      const data = await res.json();
      if (data.ok) {
        setSchedule(data.schedule || []);
        setAvailableQuestions(data.availableQuestions || []);
      }
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const fetchContributors = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/quiz/contributors?key=${adminKey}`);
      const data = await res.json();
      if (data.ok) setContributors(data.contributors || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const fetchLeaderboard = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/quiz/leaderboard?limit=50`);
      const data = await res.json();
      if (data.ok) setLeaderboard(data.leaderboard || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const manageQuestion = async (questionId: number, action: "approve" | "reject" | "delete") => {
    if (action === "delete" && !confirm("למחוק שאלה זו?")) return;
    try {
      const res = await fetch("/api/quiz/manage-question", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: adminKey, questionId, action }),
      });
      const data = await res.json();
      if (data.ok) fetchQuestions();
      else alert("שגיאה: " + data.error);
    } catch (e) { alert("שגיאה"); }
  };

  const createInvite = async () => {
    if (!newInviteName.trim()) return alert("הכנס שם");
    try {
      const res = await fetch("/api/quiz/contributors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: adminKey, action: "create-invite", name: newInviteName }),
      });
      const data = await res.json();
      if (data.ok) {
        alert(`קוד הזמנה נוצר!\n${window.location.origin}${data.inviteLink}`);
        setNewInviteName("");
        fetchContributors();
      } else alert("שגיאה: " + data.error);
    } catch (e) { alert("שגיאה"); }
  };

  const manageContributor = async (contributorId: number, action: "activate" | "deactivate" | "delete") => {
    if (action === "delete" && !confirm("למחוק תורם זה?")) return;
    try {
      const res = await fetch("/api/quiz/contributors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: adminKey, action, contributorId }),
      });
      const data = await res.json();
      if (data.ok) fetchContributors();
      else alert("שגיאה: " + data.error);
    } catch (e) { alert("שגיאה"); }
  };

  const activateToday = async () => {
    try {
      const res = await fetch("/api/quiz/schedule", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: adminKey, action: "activate-today" }),
      });
      const data = await res.json();
      if (data.ok) {
        alert("החידון של היום הופעל!");
        fetchSchedule();
      } else alert("שגיאה: " + data.error);
    } catch (e) { alert("שגיאה"); }
  };

  const autoFillSchedule = async () => {
    try {
      const res = await fetch("/api/quiz/schedule", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: adminKey, action: "auto-fill" }),
      });
      const data = await res.json();
      if (data.ok) {
        alert(`נוספו ${data.scheduled} חידונים ללוח הזמנים!`);
        fetchSchedule();
      } else alert("שגיאה: " + data.error);
    } catch (e) { alert("שגיאה"); }
  };

  const submitQuestion = async () => {
    if (formType === "snippet") {
        if (!getYouTubeID(youtubeUrl)) return alert("קישור יוטיוב לא תקין");
    }

    setLoading(true);
    try {
      const body: any = {
        type: formType,
        adminKey,
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
        alert("השאלה נוספה ואושרה!");
        setYoutubeUrl("");
        setStartSeconds(0);
        setDuration(10);
        setAcceptedArtists("");
        setAcceptedTracks("");
        setQuestionText("");
        setImageUrl("");
        setAcceptedAnswers("");
        if (playerRef.current) {
            playerRef.current.destroy();
            playerRef.current = null;
        }
      } else {
        alert("שגיאה: " + data.error);
      }
    } catch (e) { alert("שגיאה"); }
    finally { setLoading(false); }
  };

  return (
    <div className="space-y-6">
      {/* Sub-tabs */}
      <div className="glass rounded-xl p-1 flex gap-1 overflow-x-auto">
        {[
          { id: "questions", label: "📝 שאלות" },
          { id: "schedule", label: "📅 לו״ז" },
          { id: "contributors", label: "👥 תורמים" },
          { id: "leaderboard", label: "🏆 לידרבורד" },
          { id: "add", label: "➕ הוסף שאלה" },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setSubTab(tab.id as any)}
            className={`flex-1 rounded-lg px-4 py-2 text-sm font-medium transition whitespace-nowrap ${
              subTab === tab.id
                ? "bg-gradient-to-r from-cyan-500 to-purple-500 text-white"
                : "text-white/60 hover:text-white"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {loading && (
        <div className="text-center py-8">
          <div className="w-8 h-8 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin mx-auto" />
        </div>
      )}

      {/* QUESTIONS TAB */}
      {subTab === "questions" && !loading && (
        <div className="space-y-4">
          <div className="flex gap-2 mb-4">
            {(["pending", "approved", "all"] as const).map(filter => (
              <button
                key={filter}
                onClick={() => setQuestionsFilter(filter)}
                className={`px-4 py-2 rounded-lg text-sm ${
                  questionsFilter === filter
                    ? "bg-cyan-500 text-white"
                    : "bg-white/10 text-white/60"
                }`}
              >
                {filter === "pending" ? "ממתינות" : filter === "approved" ? "מאושרות" : "הכל"}
              </button>
            ))}
          </div>

          {questions.length === 0 ? (
            <div className="text-center py-8 text-white/50">אין שאלות</div>
          ) : (
            <div className="space-y-3">
              {questions.map(q => (
                <div key={q.id} className="glass rounded-xl p-4">
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`px-2 py-0.5 rounded text-xs ${
                          q.type === "snippet" ? "bg-cyan-500/20 text-cyan-400" : "bg-purple-500/20 text-purple-400"
                        }`}>
                          {q.type === "snippet" ? "🎵 Snippet" : "🧠 Trivia"}
                        </span>
                        <span className={`px-2 py-0.5 rounded text-xs ${
                          q.status === "pending" ? "bg-yellow-500/20 text-yellow-400" :
                          q.status === "approved" ? "bg-green-500/20 text-green-400" :
                          "bg-red-500/20 text-red-400"
                        }`}>
                          {q.status}
                        </span>
                      </div>
                      {q.type === "snippet" ? (
                        <div className="text-sm">
                          <p className="text-white/70">YouTube: {q.youtube_url}</p>
                          <p className="text-white/70">שניות: {q.youtube_start_seconds} - {(q.youtube_start_seconds || 0) + (q.youtube_duration_seconds || 10)}</p>
                          <p className="text-cyan-400">אמן: {q.accepted_artists?.join(", ")}</p>
                          <p className="text-cyan-400">טראק: {q.accepted_tracks?.join(", ")}</p>
                        </div>
                      ) : (
                        <div className="text-sm">
                          <p className="text-white">{q.question_text}</p>
                          <p className="text-purple-400 mt-1">תשובות: {q.accepted_answers?.join(", ")}</p>
                        </div>
                      )}
                      {q.contributor && (
                        <p className="text-xs text-white/40 mt-2">מאת: {q.contributor.name}</p>
                      )}
                    </div>
                    <div className="flex flex-col gap-2">
                      {q.status === "pending" && (
                        <>
                          <button
                            onClick={() => manageQuestion(q.id, "approve")}
                            className="px-3 py-1 bg-green-500/20 text-green-400 rounded-lg text-sm hover:bg-green-500/30"
                          >
                            ✓ אשר
                          </button>
                          <button
                            onClick={() => manageQuestion(q.id, "reject")}
                            className="px-3 py-1 bg-red-500/20 text-red-400 rounded-lg text-sm hover:bg-red-500/30"
                          >
                            ✗ דחה
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => manageQuestion(q.id, "delete")}
                        className="px-3 py-1 bg-white/10 text-white/60 rounded-lg text-sm hover:bg-white/20"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

     {/* SCHEDULE TAB */}
      {subTab === "schedule" && !loading && (
        <div className="space-y-4">
          <div className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-4 text-sm">
            <p className="text-purple-300 font-medium mb-2">📅 איך זה עובד?</p>
            <ul className="text-white/70 space-y-1">
              <li>• <span className="text-cyan-400">יום שני</span> = חידון Snippet</li>
              <li>• <span className="text-purple-400">יום חמישי</span> = חידון Trivia</li>
            </ul>
          </div>

          <div className="flex gap-3 mb-4">
            <button
              onClick={activateToday}
              className="px-4 py-2 bg-green-500/20 text-green-400 rounded-lg text-sm hover:bg-green-500/30 flex items-center gap-2"
            >
              ▶️ הפעל חידון היום
            </button>
            <button
              onClick={autoFillSchedule}
              className="px-4 py-2 bg-cyan-500/20 text-cyan-400 rounded-lg text-sm hover:bg-cyan-500/30 flex items-center gap-2"
            >
              🔄 מלא אוטומטית (שבועיים)
            </button>
          </div>

          <div className="space-y-2">
              {schedule.map(s => {
                const dateObj = new Date(s.scheduled_for);
                const dayName = dateObj.toLocaleDateString('he-IL', { weekday: 'long' });
                const dateStr = dateObj.toLocaleDateString('he-IL', { day: 'numeric', month: 'short' });
                
                return (
                  <div key={s.id} className={`glass rounded-xl p-4 ${s.is_active ? "border-2 border-green-500/50 bg-green-500/5" : ""}`}>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-2xl ${
                          s.type === "snippet" ? "bg-cyan-500/20" : "bg-purple-500/20"
                        }`}>
                          {s.type === "snippet" ? "🎵" : "🧠"}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold">{dayName}</span>
                            <span className="text-white/50 text-sm">{dateStr}</span>
                            {s.is_active && (
                              <span className="px-2 py-0.5 rounded text-xs bg-green-500/20 text-green-400 animate-pulse">
                                🟢 פעיל עכשיו
                              </span>
                            )}
                          </div>
                          {s.question ? (
                            <p className="text-sm text-white/60 mt-1">
                              {s.question.type === "snippet"
                                ? `${s.question.accepted_artists?.[0]} - ${s.question.accepted_tracks?.[0]}`
                                : s.question.question_text?.substring(0, 40) + "..."}
                            </p>
                          ) : (
                            <p className="text-sm text-red-400 mt-1">⚠️ אין שאלה מקושרת</p>
                          )}
                        </div>
                      </div>
                      <span className={`px-3 py-1 rounded-lg text-xs font-medium ${
                        s.type === "snippet" ? "bg-cyan-500/20 text-cyan-400" : "bg-purple-500/20 text-purple-400"
                      }`}>
                        {s.type === "snippet" ? "Snippet" : "Trivia"}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
        </div>
      )}

      {/* CONTRIBUTORS TAB - RESTORED */}
      {subTab === "contributors" && !loading && (
        <div className="space-y-4">
          {/* Explanation box */}
          <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-xl p-4 text-sm">
            <p className="text-cyan-300 font-medium mb-2">👥 איך להזמין תורמים?</p>
            <ol className="text-white/70 space-y-1 list-decimal list-inside">
              <li>הכנס שם לתורם החדש למטה</li>
              <li>לחץ "צור הזמנה" - יופיע לינק</li>
              <li>שלח את הלינק לתורם בוואטסאפ/מייל</li>
              <li>התורם נכנס ללינק ומתחבר עם Google</li>
              <li>התורם יכול להוסיף שאלות (ממתינות לאישורך)</li>
            </ol>
          </div>

          {/* Create invite form */}
          <div className="glass rounded-xl p-4">
            <p className="font-medium mb-3">➕ יצירת הזמנה חדשה</p>
            <div className="flex gap-3">
              <input type="text" value={newInviteName} onChange={(e) => setNewInviteName(e.target.value)} placeholder="שם התורם (למשל: יוסי כהן)" className="flex-1 bg-black/50 border border-white/20 rounded-lg px-4 py-3 text-white"/>
              <button onClick={createInvite} disabled={!newInviteName.trim()} className="px-6 py-3 bg-cyan-500 text-white rounded-lg font-medium hover:bg-cyan-600 transition">צור הזמנה</button>
            </div>
          </div>
          
          {/* Contributors list */}
          <div className="space-y-3">
            {contributors.map(c => (
              <div key={c.id} className={`glass rounded-xl p-4 ${!c.is_active ? 'opacity-50' : ''}`}>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    {c.photo_url ? <img src={c.photo_url} alt={c.name} className="w-12 h-12 rounded-full object-cover"/> : <div className="w-12 h-12 rounded-full bg-purple-500/30 flex items-center justify-center text-xl">👤</div>}
                    <div>
                      <p className="font-medium text-lg">{c.name}</p>
                      <div className="flex items-center gap-2 mt-1">
                          {c.user_id ? <span className="px-2 py-0.5 rounded text-xs bg-green-500/20 text-green-400">✓ רשום</span> : <span className="px-2 py-0.5 rounded text-xs bg-yellow-500/20 text-yellow-400">⏳ ממתין</span>}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                       <button onClick={() => {navigator.clipboard.writeText(`${window.location.origin}/quiz/contribute?code=${c.invite_code}`); alert("הועתק");}} className="px-3 py-1 bg-cyan-500/20 text-cyan-400 rounded-lg text-sm">📋 העתק לינק</button>
                       {c.is_active ? (
                        <button onClick={() => manageContributor(c.id, "deactivate")} className="px-3 py-1 bg-yellow-500/20 text-yellow-400 rounded-lg text-sm">השבת</button>
                      ) : (
                        <button onClick={() => manageContributor(c.id, "activate")} className="px-3 py-1 bg-green-500/20 text-green-400 rounded-lg text-sm">הפעל</button>
                      )}
                      <button onClick={() => manageContributor(c.id, "delete")} className="px-3 py-1 bg-red-500/20 text-red-400 rounded-lg text-sm">🗑️</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* LEADERBOARD TAB - RESTORED */}
      {subTab === "leaderboard" && !loading && (
         <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">לידרבורד (Top 50)</h3>
                <button
                    onClick={() => { if (confirm("לאפס את הלידרבורד? פעולה זו בלתי הפיכה!")) alert("פונקציית איפוס עדיין לא מוכנה"); }}
                    className="px-3 py-1 bg-red-500/20 text-red-400 rounded-lg text-sm"
                >
                    🔄 אפס לידרבורד
                </button>
            </div>

            {leaderboard.length === 0 ? <div className="text-center py-8 text-white/50">אין נתונים</div> : (
                <div className="space-y-2">
                    {leaderboard.map((entry, idx) => (
                        <div key={entry.userId} className="glass rounded-xl p-4 flex justify-between items-center">
                            <div className="flex items-center gap-3">
                                <span className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${idx === 0 ? "bg-yellow-500/30 text-yellow-400" : idx === 1 ? "bg-gray-400/30 text-gray-300" : idx === 2 ? "bg-orange-500/30 text-orange-400" : "bg-white/10 text-white/60"}`}>{idx + 1}</span>
                                {entry.photoUrl ? <img src={entry.photoUrl} alt={entry.displayName} className="w-10 h-10 rounded-full object-cover"/> : <div className="w-10 h-10 rounded-full bg-purple-500/30 flex items-center justify-center">👤</div>}
                                <div>
                                    <p className="font-medium">{entry.displayName}</p>
                                    <p className="text-xs text-white/40">{entry.questionsAnswered} שאלות</p>
                                </div>
                            </div>
                            <span className="text-2xl font-bold text-cyan-400">{entry.totalPoints}</span>
                        </div>
                    ))}
                </div>
            )}
         </div>
      )}

      {/* ADD QUESTION TAB (UPDATED) */}
      {subTab === "add" && !loading && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <button onClick={() => setFormType("snippet")} className={`p-4 rounded-xl border-2 transition-all ${formType === "snippet" ? "border-cyan-500 bg-cyan-500/10" : "border-white/10"}`}>
              <span className="text-2xl block mb-2">🎵</span><span>Snippet</span>
            </button>
            <button onClick={() => setFormType("trivia")} className={`p-4 rounded-xl border-2 transition-all ${formType === "trivia" ? "border-purple-500 bg-purple-500/10" : "border-white/10"}`}>
              <span className="text-2xl block mb-2">🧠</span><span>Trivia</span>
            </button>
          </div>

          {formType === "snippet" ? (
            <div className="space-y-4">
              <input type="url" value={youtubeUrl} onChange={(e) => handleUrlChange(e.target.value)} placeholder="קישור YouTube" className="w-full bg-black/50 border border-white/20 rounded-xl px-4 py-3 text-white dir-ltr"/>
              <p className="text-xs text-gray-500 mt-1">💡 טיפ: ניתן להדביק לינק עם זמן (t=120) וזה יתמלא אוטומטית</p>
       
              <div className="bg-black/30 rounded-xl p-4 border border-cyan-500/20 mb-4">
                <p className="text-cyan-400 font-medium mb-3">⏱️ בחירת קטע</p>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                    <label className="block text-sm text-white/60 mb-1">מתחיל בשנייה</label>
                    <input type="number" value={startSeconds} onChange={(e) => setStartSeconds(Number(e.target.value))} className="w-full bg-black/50 border border-white/20 rounded-xl px-4 py-3 text-white"/>
                    </div>
                    <div>
                    <label className="block text-sm text-white/60 mb-1">משך (שניות)</label>
                    <input type="number" value={duration} onChange={(e) => setDuration(Number(e.target.value))} className="w-full bg-black/50 border border-white/20 rounded-xl px-4 py-3 text-white"/>
                    </div>
                </div>

                {/* VISUAL CALCULATOR / EXPLANATION BOX */}
                <div className="bg-cyan-500/10 border border-cyan-500/20 rounded-lg p-4 mt-4">
                     <p className="text-sm text-cyan-200 font-medium mb-1">⏱️ חישוב זמנים:</p>
                     <p className="text-gray-200 text-sm">
                        הקטע יתנגן מ-
                        <span className="text-cyan-400 font-bold mx-1">{formatTime(Number(startSeconds))}</span>
                        ועד
                        <span className="text-cyan-400 font-bold mx-1">{formatTime(Number(startSeconds) + Number(duration))}</span>
                     </p>
                     <p className="text-xs text-gray-500 mt-2">
                        משך הקטע הוא <strong>{duration} שניות</strong> (ולא נקודת סיום).
                     </p>
                </div>

                {/* PREVIEW BUTTON */}
                <div className="mt-4 bg-white/5 p-3 rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-bold">בדיקה:</span>
                        <button onClick={loadPreview} className="bg-cyan-500 hover:bg-cyan-600 px-3 py-1 rounded text-sm transition">▶️ נגן</button>
                    </div>
                    <div id="admin-preview-player" className="rounded-lg overflow-hidden bg-black aspect-video"></div>
                </div>
              </div>

              <textarea value={acceptedArtists} onChange={(e) => setAcceptedArtists(e.target.value)} placeholder="אמנים (שורה לכל וריאציה)" className="w-full bg-black/50 border border-white/20 rounded-xl px-4 py-3 text-white min-h-[80px]"/>
              <textarea value={acceptedTracks} onChange={(e) => setAcceptedTracks(e.target.value)} placeholder="טראקים (שורה לכל וריאציה)" className="w-full bg-black/50 border border-white/20 rounded-xl px-4 py-3 text-white min-h-[80px]"/>
            </div>
          ) : (
            <div className="space-y-4">
              <textarea value={questionText} onChange={(e) => setQuestionText(e.target.value)} placeholder="השאלה" className="w-full bg-black/50 border border-white/20 rounded-xl px-4 py-3 text-white min-h-[80px]"/>
              <input type="url" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="קישור לתמונה (אופציונלי)" className="w-full bg-black/50 border border-white/20 rounded-xl px-4 py-3 text-white dir-ltr"/>
              <textarea value={acceptedAnswers} onChange={(e) => setAcceptedAnswers(e.target.value)} placeholder="תשובות מקובלות (שורה לכל וריאציה)" className="w-full bg-black/50 border border-white/20 rounded-xl px-4 py-3 text-white min-h-[80px]"/>
            </div>
          )}

          <button onClick={submitQuestion} disabled={loading} className="w-full btn-primary py-4 rounded-xl font-semibold disabled:opacity-50">
            {loading ? "שומר..." : "הוסף שאלה (מאושרת אוטומטית)"}
          </button>
        </div>
      )}
    </div>
  );
}
