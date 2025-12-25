// components/AnalyticsDashboard.tsx
// Redesigned Analytics Dashboard - Only affects the stats tab in admin
import React, { useState, useEffect } from 'react';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, BarChart, Bar, CartesianGrid 
} from 'recharts';

// ============================================
// TYPES
// ============================================

type DateRange = 'today' | '7d' | '30d' | 'all';

interface AnalyticsData {
  totalVisits: number;
  uniqueVisitors: number;
  returningVisitors: number;
  newVisitors: number;
  avgDuration: number;
  bounceRate: string;
  israelVisits: number;
  israelPercentage: string;
  topPages: Array<{ page: string; count: number; percentage: string }>;
  topLandingPages: Array<{ page: string; count: number; percentage: string }>;
  topSources: Array<{ source: string; count: number; percentage: string }>;
  peakHours: Array<{ hour: string; count: number }>;
  trendData: Array<{ date: string; visits: number }>;
  deviceData: Array<{ name: string; value: number; color: string }>;
  topArtists: Array<{ slug: string; visits: number }>;
  comparison: {
    prevTotalVisits: number;
    prevUniqueVisitors: number;
    prevAvgDuration: number;
    visitsChange: number;
    uniqueChange: number;
    durationChange: number;
  };
}

interface Props {
  adminKey: string;
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

function formatDuration(seconds: number): string {
  if (!seconds || seconds < 0) return '0:00';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

// ============================================
// SUB-COMPONENTS
// ============================================

// Metric Card
function MetricCard({ 
  label, 
  value, 
  change,
  icon 
}: { 
  label: string; 
  value: string | number; 
  change?: number;
  icon?: string;
}) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-5 hover:bg-white/[0.07] transition-all">
      <div className="flex items-center justify-between mb-2">
        <span className="text-white/50 text-sm">{label}</span>
        {icon && <span className="text-xl">{icon}</span>}
      </div>
      <div className="text-3xl font-bold text-white mb-1">{value}</div>
      {change !== undefined && (
        <div className={`text-sm font-medium ${
          change > 0 ? 'text-emerald-400' : change < 0 ? 'text-red-400' : 'text-white/40'
        }`}>
          {change > 0 ? '↑' : change < 0 ? '↓' : '='} {Math.abs(change).toFixed(1)}% מהתקופה הקודמת
        </div>
      )}
    </div>
  );
}

// Section wrapper
function Section({ title, icon, children, className = '' }: { 
  title: string; 
  icon: string; 
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`bg-white/5 border border-white/10 rounded-2xl p-5 ${className}`}>
      <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
        <span>{icon}</span> {title}
      </h3>
      {children}
    </div>
  );
}

// Custom tooltip for charts
function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-gray-900 border border-white/20 rounded-lg p-3 shadow-xl">
      <p className="text-cyan-400 font-medium mb-1">{label}</p>
      {payload.map((entry: any, i: number) => (
        <p key={i} className="text-sm text-white">
          {entry.name}: <span className="font-bold">{entry.value}</span>
        </p>
      ))}
    </div>
  );
}

// Traffic source/page row
function DataRow({ label, count, percentage, rank }: { 
  label: string; 
  count: number; 
  percentage: string;
  rank: number;
}) {
  return (
    <div className="flex items-center gap-3 py-2 border-b border-white/5 last:border-0">
      <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
        rank === 1 ? 'bg-yellow-500/20 text-yellow-400' :
        rank === 2 ? 'bg-gray-400/20 text-gray-300' :
        rank === 3 ? 'bg-orange-500/20 text-orange-400' :
        'bg-white/10 text-white/50'
      }`}>
        {rank}
      </span>
      <span className="flex-1 text-white/80 truncate">{label}</span>
      <span className="text-cyan-400 font-medium">{count}</span>
      <span className="text-white/40 text-sm w-12 text-right">{percentage}%</span>
    </div>
  );
}

// ============================================
// MAIN COMPONENT
// ============================================

export default function AnalyticsDashboard({ adminKey }: Props) {
  const [dateRange, setDateRange] = useState<DateRange>('today');
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = async (range?: DateRange) => {
    setLoading(true);
    setError(null);
    try {
      const rangeToUse = range || dateRange;
      const res = await fetch(
        `/api/analytics-data?key=${encodeURIComponent(adminKey)}&range=${rangeToUse}&_t=${Date.now()}`
      );
      const data = await res.json();
      if (!res.ok || !data?.ok) throw new Error(data?.error || 'Failed to fetch');
      setAnalytics(data.analytics);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [dateRange, adminKey]);

  // Date range options
  const dateRanges: { key: DateRange; label: string }[] = [
    { key: 'today', label: 'היום' },
    { key: '7d', label: 'השבוע' },
    { key: '30d', label: 'החודש' },
    { key: 'all', label: 'הכל' },
  ];

  if (loading && !analytics) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-4xl animate-spin">⏳</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-20">
        <p className="text-red-400 mb-4">{error}</p>
        <button onClick={() => fetchAnalytics()} className="btn-primary px-4 py-2 rounded-xl">
          נסה שוב
        </button>
      </div>
    );
  }

  if (!analytics) return null;

  return (
    <div className="space-y-6">
      {/* Header with date range selector */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-2xl font-bold text-white">סטטיסטיקות אתר</h2>
        
        <div className="flex items-center gap-2">
          {/* Date range tabs */}
          <div className="flex bg-white/5 rounded-xl p-1 border border-white/10">
            {dateRanges.map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setDateRange(key)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  dateRange === key
                    ? 'bg-gradient-to-r from-cyan-500 to-purple-500 text-white'
                    : 'text-white/60 hover:text-white'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
          
          {/* Refresh button */}
          <button
            onClick={() => fetchAnalytics()}
            className="p-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-colors"
            title="רענן"
          >
            🔄
          </button>
        </div>
      </div>

      {/* Key Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard
          label="סה״כ ביקורים"
          value={analytics.totalVisits.toLocaleString()}
          change={analytics.comparison.visitsChange}
          icon="👥"
        />
        <MetricCard
          label="מבקרים ייחודיים"
          value={analytics.uniqueVisitors.toLocaleString()}
          change={analytics.comparison.uniqueChange}
          icon="🧑‍💻"
        />
        <MetricCard
          label="זמן שהייה ממוצע"
          value={formatDuration(analytics.avgDuration)}
          change={analytics.comparison.durationChange}
          icon="⏱️"
        />
        <MetricCard
          label="מישראל"
          value={`${analytics.israelPercentage}%`}
          icon="🇮🇱"
        />
      </div>

      {/* Secondary Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-4 text-center">
          <div className="text-2xl mb-1">✨</div>
          <div className="text-2xl font-bold text-emerald-400">{analytics.newVisitors}</div>
          <div className="text-sm text-white/60">מבקרים חדשים</div>
        </div>
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-2xl p-4 text-center">
          <div className="text-2xl mb-1">🔁</div>
          <div className="text-2xl font-bold text-blue-400">{analytics.returningVisitors}</div>
          <div className="text-sm text-white/60">מבקרים חוזרים</div>
        </div>
        <div className="bg-orange-500/10 border border-orange-500/20 rounded-2xl p-4 text-center">
          <div className="text-2xl mb-1">📉</div>
          <div className="text-2xl font-bold text-orange-400">{analytics.bounceRate}%</div>
          <div className="text-sm text-white/60">שיעור נטישה</div>
        </div>
        <div className="bg-purple-500/10 border border-purple-500/20 rounded-2xl p-4 text-center">
          <div className="text-2xl mb-1">🇮🇱</div>
          <div className="text-2xl font-bold text-purple-400">{analytics.israelVisits}</div>
          <div className="text-sm text-white/60">ביקורים מישראל</div>
        </div>
      </div>

      {/* Traffic Over Time Chart */}
      {analytics.trendData && analytics.trendData.length > 0 && (
        <Section title="ביקורים לאורך זמן" icon="📈">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={analytics.trendData}>
                <defs>
                  <linearGradient id="visitGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                <XAxis dataKey="date" stroke="#6b7280" fontSize={12} />
                <YAxis stroke="#6b7280" fontSize={12} />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="visits"
                  stroke="#06b6d4"
                  strokeWidth={2}
                  fill="url(#visitGradient)"
                  name="ביקורים"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Section>
      )}

      {/* Charts Row - Sources & Devices */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Traffic Sources */}
        <Section title="מקורות תנועה" icon="🔗">
          <div className="space-y-1">
            {analytics.topSources?.slice(0, 5).map((source, i) => (
              <DataRow
                key={i}
                rank={i + 1}
                label={source.source}
                count={source.count}
                percentage={source.percentage}
              />
            ))}
            {(!analytics.topSources || analytics.topSources.length === 0) && (
              <p className="text-white/40 text-center py-4">אין נתונים</p>
            )}
          </div>
        </Section>

        {/* Devices */}
        <Section title="מכשירים" icon="📱">
          <div className="flex items-center gap-6">
            <div className="w-32 h-32">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={analytics.deviceData}
                    cx="50%"
                    cy="50%"
                    innerRadius={30}
                    outerRadius={50}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {analytics.deviceData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex-1 space-y-2">
              {analytics.deviceData.map((device, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: device.color }} />
                  <span className="text-sm text-white/70 flex-1">{device.name}</span>
                  <span className="text-sm font-medium text-white">{device.value}</span>
                </div>
              ))}
            </div>
          </div>
        </Section>
      </div>

      {/* Peak Hours */}
      <Section title="שעות פעילות" icon="🕐">
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={analytics.peakHours}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
              <XAxis dataKey="hour" stroke="#6b7280" fontSize={11} />
              <YAxis stroke="#6b7280" fontSize={11} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="count" fill="#8b5cf6" radius={[4, 4, 0, 0]} name="ביקורים" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Section>

      {/* Tables Row - Pages */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Popular Pages */}
        <Section title="דפים פופולריים" icon="📄">
          <div className="space-y-1">
            {analytics.topPages?.slice(0, 5).map((page, i) => (
              <DataRow
                key={i}
                rank={i + 1}
                label={page.page}
                count={page.count}
                percentage={page.percentage}
              />
            ))}
            {(!analytics.topPages || analytics.topPages.length === 0) && (
              <p className="text-white/40 text-center py-4">אין נתונים</p>
            )}
          </div>
        </Section>

        {/* Landing Pages */}
        <Section title="דפי נחיתה" icon="🚪">
          <div className="space-y-1">
            {analytics.topLandingPages?.slice(0, 5).map((page, i) => (
              <DataRow
                key={i}
                rank={i + 1}
                label={page.page}
                count={page.count}
                percentage={page.percentage}
              />
            ))}
            {(!analytics.topLandingPages || analytics.topLandingPages.length === 0) && (
              <p className="text-white/40 text-center py-4">אין נתונים</p>
            )}
          </div>
        </Section>
      </div>

      {/* Top Artists (if exists) */}
      {analytics.topArtists && analytics.topArtists.length > 0 && (
        <Section title="עמודי אמנים פופולריים" icon="🔥">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            {analytics.topArtists.slice(0, 10).map((artist, i) => (
              <div
                key={i}
                className={`p-3 rounded-xl text-center ${
                  i < 3 ? 'bg-purple-500/10 border border-purple-500/20' : 'bg-white/5'
                }`}
              >
                <div className="text-lg mb-1">
                  {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`}
                </div>
                <div className="text-sm font-medium text-cyan-300 truncate">{artist.slug}</div>
                <div className="text-xs text-white/50">{artist.visits} ביקורים</div>
              </div>
            ))}
          </div>
        </Section>
      )}
    </div>
  );
}
