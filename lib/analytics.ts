// lib/analytics.ts
export interface VisitorData {
  id: string;
  timestamp: string;
  page: string;
  referrer: string;
  userAgent: string;
  country?: string;
  city?: string;
  entryTime: number;
  exitTime?: number;
  duration?: number;
}

export const trackPageVisit = (page: string) => {
  const visitorData: VisitorData = {
    id: generateVisitorId(),
    timestamp: new Date().toISOString(),
    page,
    referrer: document.referrer,
    userAgent: navigator.userAgent,
    entryTime: Date.now(),
  };

  // Save to localStorage
  const visits = getVisits();
  visits.push(visitorData);
  localStorage.setItem('siteVisits', JSON.stringify(visits));
  
  // Track exit
  window.addEventListener('beforeunload', () => {
    trackPageExit(visitorData.id);
  });

  return visitorData.id;
};

export const trackPageExit = (visitId: string) => {
  const visits = getVisits();
  const visit = visits.find(v => v.id === visitId);
  
  if (visit) {
    visit.exitTime = Date.now();
    visit.duration = Math.round((visit.exitTime - visit.entryTime) / 1000); // in seconds
    localStorage.setItem('siteVisits', JSON.stringify(visits));
  }
};

export const getVisits = (): VisitorData[] => {
  const data = localStorage.getItem('siteVisits');
  return data ? JSON.parse(data) : [];
};

const generateVisitorId = () => {
  return `visit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};
