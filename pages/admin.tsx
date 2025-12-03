// shadowboxer39/trance-awards/Trance-Awards-main/pages/admin.tsx

// ... (omitting existing imports and interfaces for brevity) ...

export default function Admin() {
  // ... (omitting existing state declarations) ...

  // NOTE: visits now stores the full response object { visits: [...], artistPageVisits: {...} } 
  const [visits, setVisits] = React.useState<any>([]);
  const [analyticsLoading, setAnalyticsLoading] = React.useState(false);
  
  // ... (omitting other state declarations) ...

  // ============================================
  // ANALYTICS CALCULATION
  // ============================================
  const analytics = React.useMemo(() => {
    // Determine the actual list of visits array, accommodating both array and object storage
    const allVisitsList: VisitData[] = Array.isArray(visits) ? visits : (visits as any).visits || [];
    const rawArtistPageVisits = (visits as any).artistPageVisits || {};

    if (allVisitsList.length === 0) return null;
    
    const now = new Date();
    
    const filterByRange = (rangeType: "today" | "7d" | "30d" | "all", offset: number = 0) => {
      return allVisitsList.filter(v => {
        const visitDate = new Date(v.timestamp);
        // ... (rest of filtering logic using allVisitsList) ...
        if (rangeType === "today") {
          const targetDay = new Date(now);
          targetDay.setDate(targetDay.getDate() - offset);
          targetDay.setHours(0, 0, 0, 0);
          const nextDay = new Date(targetDay);
          nextDay.setDate(nextDay.getDate() + 1);
          return visitDate >= targetDay && visitDate < nextDay;
        }
        if (rangeType === "7d") {
          const startDate = new Date(now.getTime() - (7 + offset * 7) * 24 * 60 * 60 * 1000);
          const endDate = new Date(now.getTime() - offset * 7 * 24 * 60 * 60 * 1000);
          return visitDate >= startDate && visitDate < endDate;
        }
        if (rangeType === "30d") {
          const startDate = new Date(now.getTime() - (30 + offset * 30) * 24 * 60 * 60 * 1000);
          const endDate = new Date(now.getTime() - offset * 30 * 24 * 60 * 60 * 1000);
          return visitDate >= startDate && visitDate < endDate;
        }
        return true;
      });
    };

    const filtered = filterByRange(dateRange, 0);
    const previousPeriod = filterByRange(dateRange, 1);

    // ... (omitting calculations for brevity, they remain the same) ...

    // Unique visitors
    const uniqueVisitorIds = new Set<string>();
    filtered.forEach(v => { if (v.visitor_id) uniqueVisitorIds.add(v.visitor_id); });
    
    const prevUniqueVisitorIds = new Set<string>();
    previousPeriod.forEach(v => { if (v.visitor_id) prevUniqueVisitorIds.add(v.visitor_id); });

    // Returning vs New
    const visitorFirstSeen: Record<string, Date> = {};
    allVisitsList.forEach(v => {
      if (v.visitor_id) {
        const visitDate = new Date(v.timestamp);
        if (!visitorFirstSeen[v.visitor_id] || visitDate < visitorFirstSeen[v.visitor_id]) {
          visitorFirstSeen[v.visitor_id] = visitDate;
        }
      }
    });

    const periodStart = dateRange === "today" 
      ? (() => { const d = new Date(now); d.setHours(0,0,0,0); return d; })()
      : dateRange === "7d" ? new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      : dateRange === "30d" ? new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      : new Date(0);

    let returningInPeriod = 0, newInPeriod = 0;
    uniqueVisitorIds.forEach(visitorId => {
      const firstSeen = visitorFirstSeen[visitorId];
      if (firstSeen && firstSeen < periodStart) returningInPeriod++;
      else newInPeriod++;
    });

    // Device breakdown
    const devices = { mobile: 0, desktop: 0, tablet: 0 };
    filtered.forEach(v => { devices[getDeviceType(v.user_agent)]++; });
    const deviceData = [
      { name: '📱 מובייל', value: devices.mobile, color: DEVICE_COLORS.mobile },
      { name: '💻 דסקטופ', value: devices.desktop, color: DEVICE_COLORS.desktop },
      { name: '📟 טאבלט', value: devices.tablet, color: DEVICE_COLORS.tablet },
    ].filter(d => d.value > 0);

    // Daily trends
    const dailyData: Record<string, number> = {};
    const prevDailyData: Record<string, number> = {};
    const daysToShow = dateRange === "today" ? 1 : dateRange === "7d" ? 7 : dateRange === "30d" ? 30 : 30;
    
    for (let i = daysToShow - 1; i >= 0; i--) {
      const date = new Date(now); date.setDate(date.getDate() - i);
      dailyData[date.toISOString().split('T')[0]] = 0;
      if (showComparison) {
        const prevDate = new Date(now); prevDate.setDate(prevDate.getDate() - i - daysToShow);
        prevDailyData[prevDate.toISOString().split('T')[0]] = 0;
      }
    }
    filtered.forEach(v => {
      const dateKey = new Date(v.timestamp).toISOString().split('T')[0];
      if (dailyData.hasOwnProperty(dateKey)) dailyData[dateKey]++;
    });
    if (showComparison) {
      previousPeriod.forEach(v => {
        const dateKey = new Date(v.timestamp).toISOString().split('T')[0];
        if (prevDailyData.hasOwnProperty(dateKey)) prevDailyData[dateKey]++;
      });
    }

    const trendData = Object.entries(dailyData).map(([date, count], idx) => ({
      date: new Date(date).toLocaleDateString('he-IL', { day: 'numeric', month: 'short' }),
      visits: count,
      previousVisits: showComparison ? Object.values(prevDailyData)[idx] || 0 : undefined,
    }));

    // Landing pages
    const visitorLandingPage: Record<string, { page: string; time: Date }> = {};
    filtered.forEach(v => {
      if (v.visitor_id) {
        const visitTime = new Date(v.timestamp);
        if (!visitorLandingPage[v.visitor_id] || visitTime < visitorLandingPage[v.visitor_id].time) {
          visitorLandingPage[v.visitor_id] = { page: v.page, time: visitTime };
        }
      }
    });
    const landingPages: Record<string, number> = {};
    Object.values(visitorLandingPage).forEach(({ page }) => {
      landingPages[page] = (landingPages[page] || 0) + 1;
    });

    const pageNames: Record<string, string> = {
      '/': '🏠 דף הבית', '/episodes': '🎧 פרקים', '/track-of-the-week': '🎵 הטראק השבועי',
      '/featured-artist': '⭐ האמן המומלץ', '/young-artists': '🌟 אמנים צעירים',
      '/vote': '🗳️ הצבעה', '/awards': '🏆 פרסים', '/artists': '🎤 אמנים', '/legends': '👑 אגדות',
    };

    const topLandingPages = Object.entries(landingPages)
      .sort(([,a], [,b]) => b - a).slice(0, 5)
      .map(([page, count]) => ({
        page: pageNames[page] || page, count,
        percentage: uniqueVisitorIds.size ? ((count / uniqueVisitorIds.size) * 100).toFixed(1) : "0.0"
      }));

    // Regular metrics
    const pageVisits: Record<string, number> = {};
    const sources: Record<string, number> = {};
    const hourlyTraffic: Record<number, number> = {};
    let totalDuration = 0, validDurations = 0, bounces = 0, israelVisits = 0;
    const countries: Record<string, number> = {};

    filtered.forEach(v => {
      pageVisits[v.page] = (pageVisits[v.page] || 0) + 1;
      hourlyTraffic[new Date(v.timestamp).getHours()] = (hourlyTraffic[new Date(v.timestamp).getHours()] || 0) + 1;
      if (v.duration && v.duration > 0) { totalDuration += v.duration; validDurations++; if (v.duration < 5) bounces++; }
      if (v.is_israel) israelVisits++;
      if (v.country_code) countries[v.country_code] = (countries[v.country_code] || 0) + 1;
      
      if (v.referrer) {
        try {
          const host = new URL(v.referrer).hostname.replace('www.', '');
          if (host.includes('instagram')) sources['📸 Instagram'] = (sources['📸 Instagram'] || 0) + 1;
          else if (host.includes('facebook')) sources['👥 Facebook'] = (sources['👥 Facebook'] || 0) + 1;
          else if (host.includes('google')) sources['🔍 Google'] = (sources['🔍 Google'] || 0) + 1;
          else if (host.includes('youtube')) sources['📺 YouTube'] = (sources['📺 YouTube'] || 0) + 1;
          else sources['🏠 ישיר'] = (sources['🏠 ישיר'] || 0) + 1;
        } catch { sources['🏠 ישיר'] = (sources['🏠 ישיר'] || 0) + 1; }
      } else { sources['🏠 ישיר'] = (sources['🏠 ישיר'] || 0) + 1; }
    });

    const avgDuration = validDurations > 0 ? totalDuration / validDurations : 0;
    const bounceRate = validDurations > 0 ? (bounces / validDurations) * 100 : 0;

    // Previous period for comparison
    let prevTotalDuration = 0, prevValidDurations = 0;
    previousPeriod.forEach(v => { if (v.duration && v.duration > 0) { prevTotalDuration += v.duration; prevValidDurations++; }});
    const prevAvgDuration = prevValidDurations > 0 ? prevTotalDuration / prevValidDurations : 0;

    const calcChange = (current: number, previous: number): number => {
      if (previous === 0) return current > 0 ? 100 : 0;
      return ((current - previous) / previous) * 100;
    };

    const topPages = Object.entries(pageVisits).sort(([,a], [,b]) => b - a).slice(0, 5)
      .map(([page, count]) => ({ page: pageNames[page] || page, count, percentage: filtered.length ? ((count / filtered.length) * 100).toFixed(1) : "0.0" }));

    const topSources = Object.entries(sources).sort(([,a], [,b]) => b - a).slice(0, 5)
      .map(([source, count]) => ({ source, count, percentage: filtered.length ? ((count / filtered.length) * 100).toFixed(1) : "0.0" }));

    const peakHours = Object.entries(hourlyTraffic).sort(([,a], [,b]) => b - a).slice(0, 5)
      .map(([hour, count]) => ({ hour: `${hour}:00`, count }));
      
    // --- NEW: Top Artist Pages ---
    // The raw 'visits' object has the 'artistPageVisits' property from the API response
    const rawArtistPageVisits = (visits as any).artistPageVisits || {};

    const topArtistPages = Object.entries(rawArtistPageVisits)
      .sort(([, a], [, b]) => (b as any).visits - (a as any).visits)
      .slice(0, 7)
      .map(([slug, data]) => ({
        slug,
        visits: (data as any).visits,
        page: (data as any).page,
      }));
    // --- END NEW LOGIC ---

    return {
      totalVisits: filtered.length,
      uniqueVisitors: uniqueVisitorIds.size,
      returningVisitors: returningInPeriod,
      newVisitors: newInPeriod,
      avgDuration: Math.round(avgDuration),
      bounceRate: bounceRate.toFixed(1),
      israelVisits,
      israelPercentage: filtered.length ? ((israelVisits / filtered.length) * 100).toFixed(1) : "0.0",
      topPages, topSources, topLandingPages, peakHours,
      countriesCount: Object.keys(countries).length,
      deviceData, trendData,
      comparison: {
        prevTotalVisits: previousPeriod.length,
        prevUniqueVisitors: prevUniqueVisitorIds.size,
        prevAvgDuration: Math.round(prevAvgDuration),
        visitsChange: calcChange(filtered.length, previousPeriod.length),
        uniqueChange: calcChange(uniqueVisitorIds.size, prevUniqueVisitorIds.size),
        durationChange: calcChange(avgDuration, prevAvgDuration),
      },
      artistPageVisits: topArtistPages, // <-- NEW DATA POINT
    };
  }, [visits, dateRange, showComparison]);

  // ... (omitting existing fetchStats/delete logic) ...

  // ============================================
  // FETCH FUNCTIONS - CORRECTION APPLIED HERE
  // ============================================
  const fetchStats = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!key) return;
    setLoading(true); setError(null);
    try {
      const r = await fetch(`/api/stats?key=${encodeURIComponent(key)}&_t=${Date.now()}`);
      const j = await r.json();
      if (!r.ok || !j?.ok) throw new Error(j?.error || "שגיאה");
      setTally(j.tally); setTotalVotes(j.totalVotes || 0);
      localStorage.setItem("ADMIN_KEY", key);
    } catch (err: any) { setError(err.message); }
    finally { setLoading(false); }
  };

  const fetchAnalytics = async () => {
    if (!key) return;
    setAnalyticsLoading(true);
    try {
      const r = await fetch(`/api/analytics-data?key=${encodeURIComponent(key)}&_t=${Date.now()}`);
      const j = await r.json();
      if (!r.ok || !j?.ok) throw new Error(j?.error);
      
      // *** CORRECTION APPLIED HERE ***
      // Store the entire successful JSON response object (j) in state.
      setVisits(j); 
      // *** END CORRECTION ***

    } catch { alert("שגיאה בטעינת סטטיסטיקות"); }
    finally { setAnalyticsLoading(false); }
  };
  
  const fetchSignups = async () => {
    if (!key) return;
    setSignupsLoading(true);
    try {
      const r = await fetch(`/api/artist-signups?key=${encodeURIComponent(key)}&_t=${Date.now()}`);
      const j = await r.json();
      if (!r.ok || !j?.ok) throw new Error(j?.error);
      setSignups(j.signups);
    } catch { alert("שגיאה בטעינת הרשמות"); }
    finally { setSignupsLoading(false); }
  };

  const fetchTrackSubmissions = async () => {
    if (!key) return;
    setTrackSubsLoading(true);
    try {
      const r = await fetch(`/api/track-submissions?key=${encodeURIComponent(key)}&_t=${Date.now()}`);
      const j = await r.json();
      if (!r.ok || !j?.ok) throw new Error(j?.error);
      setTrackSubs(j.submissions);
    } catch (err: any) { alert("שגיאה: " + err.message); }
    finally { setTrackSubsLoading(false); }
  };

  const fetchArtists = async () => {
    if (!key) return;
    setArtistsLoading(true);
    try {
      const r = await fetch(`/api/admin-artists?key=${encodeURIComponent(key)}&_t=${Date.now()}`);
      const j = await r.json();
      if (!r.ok || !j?.ok) throw new Error(j?.error);
      setAdminArtists(j.artists || []);
      if (j.artists?.length && !currentArtist) {
        setCurrentArtist(j.artists[0]);
        const primary = j.artists[0].artist_episodes?.find((e: any) => e.is_primary);
        setPrimaryEpisodeId(primary ? String(primary.episode_id) : "");
      }
    } catch (err: any) { alert("שגיאה: " + err.message); }
    finally { setArtistsLoading(false); }
  };
  // ... (omitting rest of file content - rendering logic remains as last updated)
}
