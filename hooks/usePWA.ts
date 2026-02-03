import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function usePWA() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Register service worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          console.log('✅ Service Worker registered:', registration);
        })
        .catch((error) => {
          console.error('❌ Service Worker registration failed:', error);
        });
    }

    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    // Listen for install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setIsInstallable(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Listen for app installed
    window.addEventListener('appinstalled', () => {
      setIsInstalled(true);
      setIsInstallable(false);
      setDeferredPrompt(null);

      // Track PWA installation
      trackPWAInstall();
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const trackPWAInstall = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();

      // Track with user info if logged in, otherwise track as anonymous
      const user = session?.user;

      // Also get listener profile if available
      let nickname = 'אנונימי';
      let avatarUrl = null;

      if (user) {
        const { data: profile } = await supabase
          .from('radio_listener_profiles')
          .select('nickname, avatar_url')
          .eq('user_id', user.id)
          .maybeSingle();

        if (profile) {
          nickname = profile.nickname;
          avatarUrl = profile.avatar_url;
        }
      }

      await fetch('/api/radio/track-pwa-install', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user?.id || `anon_${Date.now()}`,
          nickname,
          avatar_url: avatarUrl
        })
      });
    } catch (err) {
      console.error('Failed to track PWA install:', err);
    }
  };

  const installApp = async () => {
    if (!deferredPrompt) return false;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      setDeferredPrompt(null);
      setIsInstallable(false);
      return true;
    }

    return false;
  };

  return {
    isInstallable,
    isInstalled,
    installApp,
  };
}
