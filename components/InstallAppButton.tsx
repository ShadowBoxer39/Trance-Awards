import { useState } from 'react';
import { usePWA } from '@/hooks/usePWA';
import { FaDownload, FaCheck } from 'react-icons/fa';

export default function InstallAppButton() {
  const { isInstallable, isInstalled, installApp } = usePWA();
  const [isInstalling, setIsInstalling] = useState(false);

  const handleInstall = async () => {
    setIsInstalling(true);
    await installApp();
    setIsInstalling(false);
  };

  // Don't show if already installed
  if (isInstalled) {
    return (
      <div className="flex items-center gap-2 px-4 py-2 bg-green-500/10 border border-green-500/20 rounded-full text-green-500 text-sm">
        <FaCheck />
        <span>האפליקציה מותקנת</span>
      </div>
    );
  }

  // Don't show if not installable
  if (!isInstallable) {
    return null;
  }

  return (
    <button
      onClick={handleInstall}
      disabled={isInstalling}
      className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold rounded-full transition-all shadow-lg shadow-purple-500/30 disabled:opacity-50"
    >
      <FaDownload className={isInstalling ? 'animate-bounce' : ''} />
      <span>{isInstalling ? 'מתקין...' : 'התקן כאפליקציה'}</span>
    </button>
  );
}
