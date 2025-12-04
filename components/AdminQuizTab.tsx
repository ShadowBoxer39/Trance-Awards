import React, { useState, useEffect } from "react";

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

  useEffect(() => {
    if (subTab === "questions") fetchQuestions();
    else if (subTab === "schedule") fetchSchedule();
    else if (subTab === "contributors") fetchContributors();
    else if (subTab === "leaderboard") fetchLeaderboard();
  }, [subTab]);

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
                onClick={() => { setQuestionsFilter(filter); setTimeout(fetchQuestions, 0); }}
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
          {/* Explanation box */}
          <div className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-4 text-sm">
            <p className="text-purple-300 font-medium mb-2">📅 איך זה עובד?</p>
            <ul className="text-white/70 space-y-1">
              <li>• <span className="text-cyan-400">יום שני</span> = חידון Snippet (נחשו את הטראק)</li>
              <li>• <span className="text-purple-400">יום חמישי</span> = חידון Trivia (שאלת טריוויה)</li>
              <li>• לחץ "מלא אוטומטית" כדי לתזמן שאלות לשבועיים הקרובים</li>
              <li>• לחץ "הפעל חידון היום" כדי להפעיל את החידון של היום</li>
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

          <h3 className="text-lg font-semibold border-b border-white/10 pb-2">📆 לו״ז קרוב</h3>
          {schedule.length === 0 ? (
            <div className="text-center py-4 text-white/50">
              <p>אין חידונים מתוזמנים</p>
              <p className="text-sm mt-2">לחץ "מלא אוטומטית" כדי לתזמן</p>
            </div>
          ) : (
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
          )}

          <h3 className="text-lg font-semibold border-b border-white/10 pb-2 mt-6">📦 שאלות זמינות לתזמון</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="glass rounded-xl p-4 text-center">
              <span className="text-3xl">🎵</span>
              <p className="text-2xl font-bold text-cyan-400 mt-2">{availableQuestions.filter(q => q.type === "snippet").length}</p>
              <p className="text-sm text-white/60">שאלות Snippet</p>
            </div>
            <div className="glass rounded-xl p-4 text-center">
              <span className="text-3xl">🧠</span>
              <p className="text-2xl font-bold text-purple-400 mt-2">{availableQuestions.filter(q => q.type === "trivia").length}</p>
              <p className="text-sm text-white/60">שאלות Trivia</p>
            </div>
          </div>
        </div>
      )}

      {/* CONTRIBUTORS TAB */}
      {subTab === "contributors" && !loading && (
        <div className="space-y-4">
          <div className="glass rounded-xl p-4 flex gap-3">
            <input
              type="text"
              value={newInviteName}
              onChange={(e) => setNewInviteName(e.target.value)}
              placeholder="שם התורם החדש"
              className="flex-1 bg-black/50 border border-white/20 rounded-lg px-3 py-2 text-white"
            />
            <button
              onClick={createInvite}
              className="px-4 py-2 bg-cyan-500 text-white rounded-lg font-medium"
            >
              צור הזמנה
            </button>
          </div>

          {contributors.length === 0 ? (
            <div className="text-center py-8 text-white/50">אין תורמים</div>
          ) : (
            <div className="space-y-3">
              {contributors.map(c => (
                <div key={c.id} className="glass rounded-xl p-4 flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    {c.photo_url ? (
                      <img src={c.photo_url} alt={c.name} className="w-10 h-10 rounded-full object-cover" />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-purple-500/30 flex items-center justify-center">👤</div>
                    )}
                    <div>
                      <p className="font-medium">{c.name}</p>
                      <p className="text-xs text-white/40">
                        {c.user_id ? "רשום" : "ממתין לרישום"} • קוד: {c.invite_code}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {c.is_active ? (
                      <button
                        onClick={() => manageContributor(c.id, "deactivate")}
                        className="px-3 py-1 bg-yellow-500/20 text-yellow-400 rounded-lg text-sm"
                      >
                        השבת
                      </button>
                    ) : (
                      <button
                        onClick={() => manageContributor(c.id, "activate")}
                        className="px-3 py-1 bg-green-500/20 text-green-400 rounded-lg text-sm"
                      >
                        הפעל
                      </button>
                    )}
                    <button
                      onClick={() => manageContributor(c.id, "delete")}
                      className="px-3 py-1 bg-red-500/20 text-red-400 rounded-lg text-sm"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* LEADERBOARD TAB */}
      {subTab === "leaderboard" && !loading && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">לידרבורד</h3>
            <button
              onClick={() => {
                if (confirm("לאפס את הלידרבורד? פעולה זו בלתי הפיכה!")) {
                  alert("פונקציית איפוס עדיין לא מוכנה");
                }
              }}
              className="px-3 py-1 bg-red-500/20 text-red-400 rounded-lg text-sm"
            >
              🔄 אפס לידרבורד
            </button>
          </div>

          {leaderboard.length === 0 ? (
            <div className="text-center py-8 text-white/50">אין נתונים</div>
          ) : (
            <div className="space-y-2">
              {leaderboard.map((entry, idx) => (
                <div key={entry.userId} className="glass rounded-xl p-4 flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <span className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                      idx === 0 ? "bg-yellow-500/30 text-yellow-400" :
                      idx === 1 ? "bg-gray-400/30 text-gray-300" :
                      idx === 2 ? "bg-orange-500/30 text-orange-400" :
                      "bg-white/10 text-white/60"
                    }`}>
                      {idx + 1}
                    </span>
                    {entry.photoUrl ? (
                      <img src={entry.photoUrl} alt={entry.displayName} className="w-10 h-10 rounded-full object-cover" />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-purple-500/30 flex items-center justify-center">👤</div>
                    )}
                    <div>
                      <p className="font-medium">{entry.displayName}</p>
                      <p className="text-xs text-white/40">{entry.questionsAnswered} שאלות</p>
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-cyan-400">{entry.totalPoints}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ADD QUESTION TAB */}
      {subTab === "add" && !loading && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => setFormType("snippet")}
              className={`p-4 rounded-xl border-2 transition-all ${
                formType === "snippet" ? "border-cyan-500 bg-cyan-500/10" : "border-white/10"
              }`}
            >
              <span className="text-2xl block mb-2">🎵</span>
              <span>Snippet</span>
            </button>
            <button
              onClick={() => setFormType("trivia")}
              className={`p-4 rounded-xl border-2 transition-all ${
                formType === "trivia" ? "border-purple-500 bg-purple-500/10" : "border-white/10"
              }`}
            >
              <span className="text-2xl block mb-2">🧠</span>
              <span>Trivia</span>
            </button>
          </div>

          {formType === "snippet" ? (
            <div className="space-y-4">
              <input
                type="url"
                value={youtubeUrl}
                onChange={(e) => setYoutubeUrl(e.target.value)}
                placeholder="קישור YouTube"
                className="w-full bg-black/50 border border-white/20 rounded-xl px-4 py-3 text-white"
              />
       
<div className="bg-black/30 rounded-xl p-4 border border-cyan-500/20 mb-4">
  <p className="text-cyan-400 font-medium mb-3">⏱️ בחירת קטע מהשיר</p>
  <div className="grid grid-cols-2 gap-4">
    <div>
      <label className="block text-sm text-white/60 mb-1">מתחיל בשנייה</label>
      <input
        type="number"
        value={startSeconds}
        onChange={(e) => setStartSeconds(Number(e.target.value))}
        placeholder="0"
        className="w-full bg-black/50 border border-white/20 rounded-xl px-4 py-3 text-white"
      />
    </div>
    <div>
      <label className="block text-sm text-white/60 mb-1">משך הקטע (שניות)</label>
      <input
        type="number"
        value={duration}
        onChange={(e) => setDuration(Number(e.target.value))}
        placeholder="10"
        className="w-full bg-black/50 border border-white/20 rounded-xl px-4 py-3 text-white"
      />
    </div>
  </div>
  <div className="mt-3 p-3 bg-cyan-500/10 rounded-lg text-sm">
    <p className="text-cyan-300 font-medium">📍 הקטע שיתנגן:</p>
    <p className="text-white mt-1">
      מ-<span className="text-cyan-400 font-bold">{Math.floor(startSeconds / 60)}:{(startSeconds % 60).toString().padStart(2, '0')}</span>
      {" "}עד{" "}
      <span className="text-cyan-400 font-bold">{Math.floor((startSeconds + duration) / 60)}:{((startSeconds + duration) % 60).toString().padStart(2, '0')}</span>
      {" "}({duration} שניות)
    </p>
  </div>
  <p className="text-xs text-white/40 mt-2">💡 טיפ: 1:45 = 105 שניות (60+45)</p>
</div>
              <textarea
                value={acceptedArtists}
                onChange={(e) => setAcceptedArtists(e.target.value)}
                placeholder="שמות אמנים (שורה לכל וריאציה)"
                className="w-full bg-black/50 border border-white/20 rounded-xl px-4 py-3 text-white min-h-[80px]"
              />
              <textarea
                value={acceptedTracks}
                onChange={(e) => setAcceptedTracks(e.target.value)}
                placeholder="שמות טראק (שורה לכל וריאציה)"
                className="w-full bg-black/50 border border-white/20 rounded-xl px-4 py-3 text-white min-h-[80px]"
              />
            </div>
          ) : (
            <div className="space-y-4">
              <textarea
                value={questionText}
                onChange={(e) => setQuestionText(e.target.value)}
                placeholder="השאלה"
                className="w-full bg-black/50 border border-white/20 rounded-xl px-4 py-3 text-white min-h-[80px]"
              />
              <input
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="קישור לתמונה (אופציונלי)"
                className="w-full bg-black/50 border border-white/20 rounded-xl px-4 py-3 text-white"
              />
              <textarea
                value={acceptedAnswers}
                onChange={(e) => setAcceptedAnswers(e.target.value)}
                placeholder="תשובות מקובלות (שורה לכל וריאציה)"
                className="w-full bg-black/50 border border-white/20 rounded-xl px-4 py-3 text-white min-h-[80px]"
              />
            </div>
          )}

          <button
            onClick={submitQuestion}
            disabled={loading}
            className="w-full btn-primary py-4 rounded-xl font-semibold disabled:opacity-50"
          >
            {loading ? "שומר..." : "הוסף שאלה (מאושרת אוטומטית)"}
          </button>
        </div>
      )}
    </div>
  );
}
