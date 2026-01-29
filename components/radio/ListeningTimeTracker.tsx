// components/radio/ListeningTimeTracker.tsx
import { useEffect, useRef } from 'react';

interface ListeningTimeTrackerProps {
  userId: string | null;
  isPlaying: boolean;
}

export default function ListeningTimeTracker({ userId, isPlaying }: ListeningTimeTrackerProps) {
  const lastPingRef = useRef<number>(Date.now());
  const accumulatedSecondsRef = useRef<number>(0);

  useEffect(() => {
    // Only track for logged-in users
    if (!userId) return;

    // Reset on play state change
    if (isPlaying) {
      lastPingRef.current = Date.now();
      accumulatedSecondsRef.current = 0;
    }

    if (!isPlaying) return;

    const sendPing = async () => {
      const now = Date.now();
      const secondsSinceLastPing = Math.floor((now - lastPingRef.current) / 1000);
      
      // Add to accumulated time
      accumulatedSecondsRef.current += secondsSinceLastPing;
      lastPingRef.current = now;

      // Only send if we have accumulated time
      if (accumulatedSecondsRef.current > 0) {
        try {
          await fetch('/api/radio/listening-time', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              user_id: userId,
              seconds: accumulatedSecondsRef.current
            })
          });
          // Reset accumulated after successful send
          accumulatedSecondsRef.current = 0;
        } catch (err) {
          console.error('Failed to update listening time:', err);
          // Keep accumulated time for next ping
        }
      }
    };

    // Ping every 2 minutes while playing
    const interval = setInterval(sendPing, 2 * 60 * 1000);

    // Also ping on unmount/pause to capture remaining time
    return () => {
      clearInterval(interval);
      
      // Calculate final seconds before cleanup
      const now = Date.now();
      const secondsSinceLastPing = Math.floor((now - lastPingRef.current) / 1000);
      const totalSeconds = accumulatedSecondsRef.current + secondsSinceLastPing;

      // Send final ping if we have time accumulated
      if (totalSeconds > 0 && userId) {
        // Use sendBeacon for reliability on page unload
        const data = JSON.stringify({
          user_id: userId,
          seconds: totalSeconds
        });

        if (navigator.sendBeacon) {
          navigator.sendBeacon('/api/radio/listening-time', new Blob([data], { type: 'application/json' }));
        } else {
          // Fallback to fetch
          fetch('/api/radio/listening-time', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: data,
            keepalive: true
          }).catch(() => {});
        }
      }
    };
  }, [userId, isPlaying]);

  // This component doesn't render anything
  return null;
}