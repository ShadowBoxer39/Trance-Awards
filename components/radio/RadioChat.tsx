// components/radio/RadioChat.tsx
import { useState, useEffect, useRef } from 'react';
import { createClient } from '@supabase/supabase-js';
import { FaPaperPlane, FaCrown, FaCheck, FaSignInAlt } from 'react-icons/fa';
import { HiSparkles } from 'react-icons/hi';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Hebrew guest name generator
const HEBREW_ADJECTIVES = [
  'סגול', 'ניאון', 'קוסמי', 'זוהר', 'חשמלי', 'פסיכדלי', 'קסום', 'לילי',
  'שמימי', 'מיסתורי', 'היפנוטי', 'אנרגטי', 'רוחני', 'עמוק', 'צבעוני', 'זורם'
];

const HEBREW_NOUNS = [
  { name: 'ינשוף', emoji: '🦉' },
  { name: 'זאב', emoji: '🐺' },
  { name: 'שועל', emoji: '🦊' },
  { name: 'נמר', emoji: '🐯' },
  { name: 'אריה', emoji: '🦁' },
  { name: 'פרפר', emoji: '🦋' },
  { name: 'גל', emoji: '🌊' },
  { name: 'להבה', emoji: '🔥' },
  { name: 'ברק', emoji: '⚡' },
  { name: 'ירח', emoji: '🌙' },
  { name: 'כוכב', emoji: '⭐' },
  { name: 'עננה', emoji: '☁️' },
  { name: 'צליל', emoji: '🎵' },
  { name: 'קצב', emoji: '🎧' },
  { name: 'הד', emoji: '🔮' },
  { name: 'חלום', emoji: '💫' }
];

const REACTION_EMOJIS = ['❤️', '🔥', '🚀', '✨', '🎵', '💜', '🙌', '😍'];

interface ChatMessage {
  id: string;
  message: string;
  is_reaction: boolean;
  created_at: string;
  guest_name: string | null;
  guest_fingerprint: string | null;
  listener: {
    id: string;
    nickname: string;
    avatar_url: string;
    total_seconds: number;
  } | null;
}

interface ListenerProfile {
  id: string;
  user_id: string;
  nickname: string;
  avatar_url: string;
  total_seconds: number;
}

interface RadioChatProps {
  listenerProfile: ListenerProfile | null;
  onLoginClick: () => void;
  fingerprint: string;
}

// Get listener level based on total seconds
const getListenerLevel = (totalSeconds: number) => {
  const hours = totalSeconds / 3600;
  if (hours >= 100) return { badge: '💎', title: 'אגדה' };
  if (hours >= 50) return { badge: '🥇', title: 'תותח' };
  if (hours >= 10) return { badge: '🥈', title: 'רגיל' };
  return { badge: '🥉', title: 'חדש' };
};

// Generate consistent guest name from fingerprint
const generateGuestName = (fingerprint: string): string => {
  // Create a simple hash from fingerprint
  let hash = 0;
  for (let i = 0; i < fingerprint.length; i++) {
    hash = ((hash << 5) - hash) + fingerprint.charCodeAt(i);
    hash = hash & hash;
  }
  hash = Math.abs(hash);

  const adjIndex = hash % HEBREW_ADJECTIVES.length;
  const nounIndex = (hash >> 8) % HEBREW_NOUNS.length;

  const adj = HEBREW_ADJECTIVES[adjIndex];
  const noun = HEBREW_NOUNS[nounIndex];

  return `${noun.name} ${adj} ${noun.emoji}`;
};

export default function RadioChat({ listenerProfile, onLoginClick, fingerprint }: RadioChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [showReactions, setShowReactions] = useState(false);
  const [floatingReactions, setFloatingReactions] = useState<{ id: string; emoji: string; x: number }[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const guestName = generateGuestName(fingerprint);

  // Fetch initial messages
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const res = await fetch('/api/radio/chat-messages?limit=50');
        if (res.ok) {
          const data = await res.json();
          setMessages(data);
        }
      } catch (err) {
        console.error('Failed to fetch messages:', err);
      }
    };
    fetchMessages();
  }, []);

  // Subscribe to new messages
  useEffect(() => {
    const channel = supabase
      .channel('radio_chat')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'radio_chat_messages'
        },
        async (payload) => {
          // Fetch the full message with listener data
          const res = await fetch(`/api/radio/chat-messages?limit=1`);
          if (res.ok) {
            const data = await res.json();
            const newMsg = data.find((m: ChatMessage) => m.id === payload.new.id);
            if (newMsg) {
              setMessages(prev => {
                // Avoid duplicates
                if (prev.some(m => m.id === newMsg.id)) return prev;
                return [...prev, newMsg];
              });

              // Show floating reaction if it's a reaction
              if (newMsg.is_reaction) {
                const reactionId = `${newMsg.id}-${Date.now()}`;
                const x = 20 + Math.random() * 60; // Random horizontal position
                setFloatingReactions(prev => [...prev, { id: reactionId, emoji: newMsg.message, x }]);
                setTimeout(() => {
                  setFloatingReactions(prev => prev.filter(r => r.id !== reactionId));
                }, 2000);
              }
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

 // Auto-scroll to bottom
useEffect(() => {
  if (chatContainerRef.current) {
    chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
  }
}, [messages]);

  const sendMessage = async (message: string, isReaction = false) => {
    if (!message.trim() || sending) return;

    // Guests can't send reactions
    if (isReaction && !listenerProfile) return;

    setSending(true);

    try {
      const body: any = {
        message: message.trim(),
        is_reaction: isReaction
      };

      if (listenerProfile) {
        body.listener_id = listenerProfile.id;
      } else {
        body.guest_fingerprint = fingerprint;
        body.guest_name = guestName;
      }

      const res = await fetch('/api/radio/chat-messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      if (res.ok && !isReaction) {
        setNewMessage('');
      }
    } catch (err) {
      console.error('Failed to send message:', err);
    }

    setSending(false);
    setShowReactions(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(newMessage);
    }
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="flex flex-col h-full bg-black/20 rounded-2xl border border-white/5 overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <HiSparkles className="text-purple-400" />
          <span className="font-bold text-white text-sm">צ׳אט חי</span>
          <span className="text-xs text-gray-500">({messages.filter(m => !m.is_reaction).length})</span>
        </div>
        {!listenerProfile && (
          <button
            onClick={onLoginClick}
            className="flex items-center gap-1.5 text-xs bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 px-3 py-1.5 rounded-full transition"
          >
            <FaSignInAlt className="text-[10px]" />
            <span>התחברות</span>
          </button>
        )}
      </div>

      {/* Messages */}
      <div
        ref={chatContainerRef}
      className="flex-1 overflow-y-auto overflow-x-hidden p-4 space-y-3 relative"
style={{ minHeight: '250px', maxHeight: '350px' }}
      >
        {/* Floating reactions */}
        {floatingReactions.map((reaction) => (
          <div
            key={reaction.id}
            className="absolute text-3xl animate-float-up pointer-events-none"
            style={{ left: `${reaction.x}%`, bottom: '20px' }}
          >
            {reaction.emoji}
          </div>
        ))}

        {messages.length === 0 ? (
          <div className="text-center text-gray-500 text-sm py-8">
            <p>אין הודעות עדיין</p>
            <p className="text-xs mt-1">תהיו הראשונים לכתוב! 💬</p>
          </div>
        ) : (
          messages.filter(m => !m.is_reaction).map((msg) => {
            const isLoggedIn = !!msg.listener;
            const displayName = isLoggedIn ? msg.listener!.nickname : msg.guest_name || 'אורח';
            const avatar = isLoggedIn ? msg.listener!.avatar_url : null;
            const level = isLoggedIn ? getListenerLevel(msg.listener!.total_seconds) : null;
            const isEmojiAvatar = avatar && avatar.length <= 4;

            return (
              <div key={msg.id} className="flex items-start gap-2 group animate-fade-in">
                {/* Avatar */}
                <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center overflow-hidden ${
                  isLoggedIn 
                    ? 'bg-gradient-to-br from-purple-500/30 to-pink-500/30 border border-purple-500/30' 
                    : 'bg-white/10'
                }`}>
                  {isEmojiAvatar ? (
                    <span className="text-lg">{avatar}</span>
                  ) : avatar ? (
                    <img src={avatar} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-xs">👤</span>
                  )}
                </div>

                {/* Message bubble */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className={`text-sm font-medium truncate ${
                      isLoggedIn 
                        ? 'bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent' 
                        : 'text-gray-400'
                    }`}>
                      {displayName}
                    </span>
                    {isLoggedIn && (
                      <>
                        <FaCheck className="text-[10px] text-purple-400" title="מאומת" />
                        {level && <span className="text-xs" title={level.title}>{level.badge}</span>}
                      </>
                    )}
                    <span className="text-[10px] text-gray-600 opacity-0 group-hover:opacity-100 transition">
                      {formatTime(msg.created_at)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-200 break-words">{msg.message}</p>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Login prompt for guests */}
      {!listenerProfile && (
        <div className="px-4 py-2 bg-purple-500/10 border-t border-purple-500/20">
          <button
            onClick={onLoginClick}
            className="w-full text-xs text-purple-300 hover:text-purple-200 transition flex items-center justify-center gap-2"
          >
            <FaCrown className="text-yellow-500" />
            <span>התחברו לשם צבעוני, תג מאומת, ואימוג׳י בצ׳אט!</span>
          </button>
        </div>
      )}

      {/* Input area */}
      <div className="p-3 border-t border-white/5">
        <div className="flex items-center gap-2">
          {/* Reaction button (logged in only) */}
          {listenerProfile && (
            <div className="relative">
              <button
                onClick={() => setShowReactions(!showReactions)}
                className="p-2 text-gray-400 hover:text-purple-400 transition rounded-lg hover:bg-white/5"
              >
                ✨
              </button>
              {showReactions && (
                <div className="absolute bottom-full right-0 mb-2 bg-[#1a1a2e] border border-white/10 rounded-xl p-2 flex gap-1 shadow-xl">
                  {REACTION_EMOJIS.map((emoji) => (
                    <button
                      key={emoji}
                      onClick={() => sendMessage(emoji, true)}
                      className="text-xl hover:scale-125 transition p-1"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Message input */}
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={listenerProfile ? 'כתבו הודעה...' : `כתבו כ-${guestName}...`}
            maxLength={200}
            className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-gray-500 focus:border-purple-500/50 focus:outline-none transition"
          />

          {/* Send button */}
          <button
            onClick={() => sendMessage(newMessage)}
            disabled={!newMessage.trim() || sending}
            className="p-2.5 bg-purple-500 hover:bg-purple-400 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl transition"
          >
            <FaPaperPlane className="text-white text-sm" />
          </button>
        </div>
      </div>

      {/* CSS for floating reactions */}
      <style jsx>{`
        @keyframes float-up {
          0% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
          100% {
            opacity: 0;
            transform: translateY(-100px) scale(1.5);
          }
        }
        .animate-float-up {
          animation: float-up 2s ease-out forwards;
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}