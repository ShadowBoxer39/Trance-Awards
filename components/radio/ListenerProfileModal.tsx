// components/radio/ListenerProfileModal.tsx
import { useState, useEffect } from 'react';
import { FaTimes, FaCamera, FaCheck, FaCrown, FaCommentAlt, FaHeart, FaTrophy } from 'react-icons/fa';
import { HiSparkles } from 'react-icons/hi';

interface ListenerProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (nickname: string, avatarUrl: string) => Promise<{ success: boolean; error?: string }>;
  initialNickname?: string;
  initialAvatar?: string;
  googleAvatar?: string;
  isNewUser?: boolean;
}

const AVATAR_OPTIONS = [
  '🎧', '🎵', '🎹', '🎸', '🎤', '🎷', '🎺', '🪘',
  '🦉', '🐺', '🦊', '🐱', '🐯', '🦁', '🐸', '🦋',
  '🌊', '🔥', '⚡', '🌙', '☀️', '🌈', '💫', '✨',
  '💜', '💙', '💚', '💛', '🧡', '❤️', '🖤', '🤍'
];

export default function ListenerProfileModal({
  isOpen,
  onClose,
  onSave,
  initialNickname = '',
  initialAvatar = '',
  googleAvatar = '',
  isNewUser = false
}: ListenerProfileModalProps) {
  const [nickname, setNickname] = useState(initialNickname);
  const [avatarUrl, setAvatarUrl] = useState(initialAvatar || googleAvatar);
  const [useEmoji, setUseEmoji] = useState(!initialAvatar && !googleAvatar);
  const [selectedEmoji, setSelectedEmoji] = useState('🎧');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setNickname(initialNickname);
      setAvatarUrl(initialAvatar || googleAvatar);
      setUseEmoji(!initialAvatar && !googleAvatar);
      setError('');
    }
  }, [isOpen, initialNickname, initialAvatar, googleAvatar]);

  const handleSave = async () => {
    if (!nickname.trim()) {
      setError('יש לבחור כינוי');
      return;
    }
    if (nickname.length < 2 || nickname.length > 20) {
      setError('הכינוי חייב להיות בין 2-20 תווים');
      return;
    }

    setSaving(true);
    setError('');

    const finalAvatar = useEmoji ? selectedEmoji : avatarUrl;
    const result = await onSave(nickname.trim(), finalAvatar);

    if (!result.success) {
      if (result.error === 'nickname_taken') {
        setError('הכינוי הזה כבר תפוס, נסה אחר');
      } else {
        setError('שגיאה בשמירה, נסה שוב');
      }
      setSaving(false);
      return;
    }

    setSaving(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-[#12121a] border border-purple-500/20 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl shadow-purple-500/10">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 left-4 text-gray-500 hover:text-white transition p-2"
        >
          <FaTimes />
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-purple-500/20 mb-4">
            <HiSparkles className="text-2xl text-purple-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">
            {isNewUser ? 'ברוכים הבאים! 🎉' : 'עריכת פרופיל'}
          </h2>
          <p className="text-gray-400 text-sm">
            {isNewUser ? 'בחרו כינוי ותמונה לצ׳אט' : 'עדכנו את הפרטים שלכם'}
          </p>
        </div>

        {/* Benefits for new users */}
        {isNewUser && (
          <div className="bg-purple-500/10 border border-purple-500/20 rounded-2xl p-4 mb-6">
            <p className="text-xs text-purple-300 font-bold mb-3">✨ היתרונות שלך כמשתמש רשום:</p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex items-center gap-2 text-gray-300">
                <FaCrown className="text-yellow-500" />
                <span>שם צבעוני + תג ✓</span>
              </div>
              <div className="flex items-center gap-2 text-gray-300">
                <FaCommentAlt className="text-purple-400" />
                <span>אימוג׳י בצ׳אט</span>
              </div>
              <div className="flex items-center gap-2 text-gray-300">
                <FaHeart className="text-pink-500" />
                <span>לייקים נשמרים</span>
              </div>
              <div className="flex items-center gap-2 text-gray-300">
                <FaTrophy className="text-amber-500" />
                <span>טבלת המאזינים</span>
              </div>
            </div>
          </div>
        )}

        {/* Avatar Selection */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-400 mb-3">תמונת פרופיל</label>

          {/* Toggle between Google photo and emoji */}
          {googleAvatar && (
            <div className="flex gap-2 mb-4">
              <button
                onClick={() => { setUseEmoji(false); setAvatarUrl(googleAvatar); }}
                className={`flex-1 py-2 px-4 rounded-xl text-sm font-medium transition ${
                  !useEmoji ? 'bg-purple-500 text-white' : 'bg-white/5 text-gray-400 hover:bg-white/10'
                }`}
              >
                תמונת Google
              </button>
              <button
                onClick={() => setUseEmoji(true)}
                className={`flex-1 py-2 px-4 rounded-xl text-sm font-medium transition ${
                  useEmoji ? 'bg-purple-500 text-white' : 'bg-white/5 text-gray-400 hover:bg-white/10'
                }`}
              >
                אימוג׳י
              </button>
            </div>
          )}

          {/* Preview */}
          <div className="flex justify-center mb-4">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-500/20 to-pink-500/20 border-2 border-purple-500/30 flex items-center justify-center overflow-hidden">
              {useEmoji ? (
                <span className="text-4xl">{selectedEmoji}</span>
              ) : avatarUrl ? (
                <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <FaCamera className="text-2xl text-gray-500" />
              )}
            </div>
          </div>

          {/* Emoji grid */}
          {useEmoji && (
            <div className="grid grid-cols-8 gap-2 bg-white/5 rounded-xl p-3">
              {AVATAR_OPTIONS.map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => setSelectedEmoji(emoji)}
                  className={`text-2xl p-1 rounded-lg transition ${
                    selectedEmoji === emoji ? 'bg-purple-500/30 scale-110' : 'hover:bg-white/10'
                  }`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Nickname */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-400 mb-2">כינוי</label>
          <input
            type="text"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            placeholder="הכינוי שלך בצ׳אט..."
            maxLength={20}
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:border-purple-500 focus:outline-none transition"
          />
          <p className="text-xs text-gray-500 mt-1 mr-1">{nickname.length}/20 תווים</p>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 mb-4 text-red-400 text-sm text-center">
            {error}
          </div>
        )}

        {/* Save button */}
        <button
          onClick={handleSave}
          disabled={saving || !nickname.trim()}
          className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-4 rounded-xl transition flex items-center justify-center gap-2"
        >
          {saving ? (
            <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              <FaCheck />
              <span>שמירה</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}