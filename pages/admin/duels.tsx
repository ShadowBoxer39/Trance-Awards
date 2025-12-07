// pages/admin/duels.tsx
import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';

interface Duel {
  id: number;
  publish_date: string;
  type: 'track' | 'artist' | 'album';
  title_a: string;
  image_a: string;
  media_url_a?: string;
  title_b: string;
  image_b: string;
  media_url_b?: string;
  votes_a: number;
  votes_b: number;
}

export default function DuelsAdmin() {
  const [key, setKey] = useState("");
  const [loading, setLoading] = useState(false);
  const [duels, setDuels] = useState<Duel[]>([]);
  
  // Form State
  const [formData, setFormData] = useState({
    type: 'track',
    publish_date: '',
    title_a: '',
    image_a: '',
    media_url_a: '',
    title_b: '',
    image_b: '',
    media_url_b: '',
  });

  useEffect(() => {
    document.documentElement.setAttribute("dir", "rtl");
    const savedKey = localStorage.getItem("ADMIN_KEY");
    if (savedKey) {
      setKey(savedKey);
      fetchDuels(savedKey);
    }
    
    // Set default date to tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(10, 0, 0, 0); // 10:00 AM
    setFormData(prev => ({ 
        ...prev, 
        publish_date: tomorrow.toISOString().slice(0, 16) // Format for datetime-local
    }));
  }, []);

  const fetchDuels = async (apiKey: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/duels?key=${apiKey}`);
      const data = await res.json();
      if (data.ok) {
        setDuels(data.duels);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!key) return;

    try {
      const res = await fetch('/api/admin/duels', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key, ...formData }),
      });
      const data = await res.json();
      
      if (data.ok) {
        alert("הדו-קרב נוסף בהצלחה!");
        fetchDuels(key);
        // Reset only content fields, keep date for next input
        setFormData(prev => ({
           ...prev,
           title_a: '', image_a: '', media_url_a: '',
           title_b: '', image_b: '', media_url_b: ''
        }));
      } else {
        alert("שגיאה: " + data.error);
      }
    } catch (e) {
      alert("שגיאה ברשת");
    }
  };

  const handleDelete = async (id: number) => {
      if(!confirm("למחוק את הדו-קרב הזה?")) return;
      
      await fetch('/api/admin/duels', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ key, id }),
      });
      fetchDuels(key);
  };

  if (!key) {
    return (
      <div className="min-h-screen neon-backdrop flex items-center justify-center">
        <div className="glass-card p-8 rounded-xl">
           <input 
             type="password" 
             placeholder="Admin Key" 
             className="bg-black/50 border border-white/20 p-2 rounded text-white"
             onChange={e => {
                 setKey(e.target.value);
                 localStorage.setItem("ADMIN_KEY", e.target.value);
                 fetchDuels(e.target.value);
             }}
           />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen neon-backdrop text-white p-6" dir="rtl">
      <Head><title>ניהול דו-קרב יומי</title></Head>
      
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold gradient-title">ניהול דו-קרב יומי</h1>
            <Link href="/admin" className="text-gray-400 hover:text-white">← חזרה לראשי</Link>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
            {/* --- ADD NEW FORM --- */}
            <div className="lg:col-span-1">
                <form onSubmit={handleSubmit} className="glass-card p-6 rounded-2xl sticky top-6">
                    <h2 className="text-xl font-bold mb-4 text-cyan-400">הוסף דו-קרב חדש</h2>
                    
                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs text-gray-400 mb-1">תאריך פרסום</label>
                            <input 
                                type="datetime-local" 
                                required
                                className="w-full bg-black/40 border border-white/10 rounded p-2 text-sm"
                                value={formData.publish_date}
                                onChange={e => setFormData({...formData, publish_date: e.target.value})}
                            />
                        </div>

                        <div>
                            <label className="block text-xs text-gray-400 mb-1">סוג</label>
                            <select 
                                className="w-full bg-black/40 border border-white/10 rounded p-2 text-sm"
                                value={formData.type}
                                onChange={e => setFormData({...formData, type: e.target.value})}
                            >
                                <option value="track">טראק</option>
                                <option value="artist">אמן</option>
                                <option value="album">אלבום</option>
                            </select>
                        </div>

                        {/* Side A */}
                        <div className="p-3 border border-red-500/30 rounded-xl bg-red-500/5">
                            <h3 className="text-red-400 font-bold mb-2">צד א' (שמאל)</h3>
                            <input 
                                placeholder="כותרת (שם האמן - טראק)" 
                                className="w-full bg-black/40 border border-white/10 rounded p-2 mb-2 text-sm"
                                value={formData.title_a}
                                onChange={e => setFormData({...formData, title_a: e.target.value})}
                            />
                            <input 
                                placeholder="לינק לתמונה" 
                                className="w-full bg-black/40 border border-white/10 rounded p-2 mb-2 text-sm"
                                value={formData.image_a}
                                onChange={e => setFormData({...formData, image_a: e.target.value})}
                            />
                             {formData.type !== 'artist' && (
                                <input 
                                    placeholder="לינק ליוטיוב (לא חובה)" 
                                    className="w-full bg-black/40 border border-white/10 rounded p-2 text-sm"
                                    value={formData.media_url_a}
                                    onChange={e => setFormData({...formData, media_url_a: e.target.value})}
                                />
                             )}
                        </div>

                        {/* Side B */}
                        <div className="p-3 border border-blue-500/30 rounded-xl bg-blue-500/5">
                            <h3 className="text-blue-400 font-bold mb-2">צד ב' (ימין)</h3>
                            <input 
                                placeholder="כותרת (שם האמן - טראק)" 
                                className="w-full bg-black/40 border border-white/10 rounded p-2 mb-2 text-sm"
                                value={formData.title_b}
                                onChange={e => setFormData({...formData, title_b: e.target.value})}
                            />
                            <input 
                                placeholder="לינק לתמונה" 
                                className="w-full bg-black/40 border border-white/10 rounded p-2 mb-2 text-sm"
                                value={formData.image_b}
                                onChange={e => setFormData({...formData, image_b: e.target.value})}
                            />
                            {formData.type !== 'artist' && (
                                <input 
                                    placeholder="לינק ליוטיוב (לא חובה)" 
                                    className="w-full bg-black/40 border border-white/10 rounded p-2 text-sm"
                                    value={formData.media_url_b}
                                    onChange={e => setFormData({...formData, media_url_b: e.target.value})}
                                />
                             )}
                        </div>

                        <button type="submit" className="w-full btn-primary py-3 rounded-xl font-bold">
                            שמור והוסף לתור
                        </button>
                    </div>
                </form>
            </div>

            {/* --- LIST EXISTING --- */}
            <div className="lg:col-span-2 space-y-4">
                <h2 className="text-xl font-bold text-white/80">היסטוריית דואלים ({duels.length})</h2>
                {duels.map(duel => {
                    const isFuture = new Date(duel.publish_date) > new Date();
                    return (
                        <div key={duel.id} className={`glass-card p-4 rounded-xl flex gap-4 items-center ${isFuture ? 'border-l-4 border-green-500' : 'opacity-70'}`}>
                            <div className="text-center min-w-[80px]">
                                <div className="text-xs text-gray-400">{new Date(duel.publish_date).toLocaleDateString('he-IL')}</div>
                                <div className="text-lg font-bold">{new Date(duel.publish_date).toLocaleTimeString('he-IL', {hour: '2-digit', minute:'2-digit'})}</div>
                                {isFuture && <span className="text-[10px] bg-green-500 text-black px-2 rounded-full">עתידי</span>}
                            </div>

                            <div className="flex-1 grid grid-cols-2 gap-4">
                                <div className="flex items-center gap-2">
                                    <img src={duel.image_a} className="w-10 h-10 rounded object-cover" />
                                    <div className="overflow-hidden">
                                        <div className="text-sm font-bold truncate text-red-300">{duel.title_a}</div>
                                        <div className="text-xs text-gray-500">{duel.votes_a} הצבעות</div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <img src={duel.image_b} className="w-10 h-10 rounded object-cover" />
                                    <div className="overflow-hidden">
                                        <div className="text-sm font-bold truncate text-blue-300">{duel.title_b}</div>
                                        <div className="text-xs text-gray-500">{duel.votes_b} הצבעות</div>
                                    </div>
                                </div>
                            </div>
                            
                            <button onClick={() => handleDelete(duel.id)} className="text-red-500 hover:bg-red-500/20 p-2 rounded">
                                🗑️
                            </button>
                        </div>
                    );
                })}
            </div>
        </div>
      </div>
    </div>
  );
}
