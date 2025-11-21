// lib/analytics.ts (REWRITTEN FOR SERVER TRACKING)

export interface VisitorData {
  id: string; // Unique ID per session
  timestamp: string;
  page: string;
  referrer: string;
  userAgent: string;
  entryTime: number; // Unix timestamp ms
  exitTime?: number;
  duration?: number; // In seconds
}

// Helper to generate a session ID (saved locally for continuity)
const generateVisitorId = () => {
  let id = localStorage.getItem('visitorId');
  if (!id) {
    id = `visit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem('visitorId', id);
  }
  return id;
};

// Map of active visits by ID (in memory only, since we write to DB on entry)
const activeVisits = new Map<string, VisitorData>();

export const trackPageVisit = (page: string) => {
  const newVisit: VisitorData = {
    id: generateVisitorId(), // Reuses ID on same browser, but logs a new entry per page
    timestamp: new Date().toISOString(),
    page,
    referrer: document.referrer,
    userAgent: navigator.userAgent,
    entryTime: Date.now(),
  };

  // 1. Send Entry Ping to Server
  fetch('/api/track-visit', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ type: 'entry', data: newVisit }),
    keepalive: true, // Crucial for reliable exit pings
  }).catch(e => console.error("Entry tracking failed:", e));
  
  activeVisits.set(newVisit.id, newVisit);
  return newVisit.id;
};

export const trackPageExit = (visitId: string) => {
  const visit = activeVisits.get(visitId);
  if (!visit || visit.exitTime) return; // Already exited

  visit.exitTime = Date.now();
  visit.duration = Math.round((visit.exitTime - visit.entryTime) / 1000); // in seconds
  activeVisits.delete(visitId);

  // 2. Send Exit Ping to Server
  fetch('/api/track-visit', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ type: 'exit', data: visit }),
    // Use sendBeacon or keepalive for reliability on page close
    keepalive: true, 
  }).catch(e => console.error("Exit tracking failed:", e));
};

// NOTE: getVisits is no longer functional on the client and is being removed/commented out.
export const getVisits = (): VisitorData[] => {
  // THIS FUNCTION IS NO LONGER VALID FOR GETTING ALL SITE VISITS
  // Data must now be fetched from the server via an authenticated API route.
  return [];
};
