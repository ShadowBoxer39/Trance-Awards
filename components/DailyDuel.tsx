// ... inside DailyDuel.tsx ...

// Compact Vinyl with inline seek bar
function CompactVinyl({ 
  isPlaying, 
  isActive,
  progress, 
  color,
  onPlayPause,
  onSeek
}: { 
  imageUrl?: string;
  isPlaying: boolean;
  isActive: boolean;
  progress: number;
  color: 'red' | 'blue';
  onPlayPause: () => void;
  onSeek: (progress: number) => void;
}) {
  const [rotation, setRotation] = useState(0);
  const [localProgress, setLocalProgress] = useState(progress);
  const [isDragging, setIsDragging] = useState(false);
  
  const animationRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(0);
  const seekBarRef = useRef<HTMLDivElement>(null);
  const dragProgressRef = useRef(progress);

  // Sync external progress when not dragging
  useEffect(() => {
    if (!isDragging) {
      setLocalProgress(progress);
      dragProgressRef.current = progress;
    }
  }, [progress, isDragging]);

  // ... (Rotation animation code remains the same) ...

  const calculateProgress = useCallback((clientX: number) => {
    if (!seekBarRef.current) return 0;
    const rect = seekBarRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    // Ensure we send a clean 0.0 - 1.0 float
    const val = Math.max(0, Math.min(1, x / rect.width));
    return parseFloat(val.toFixed(4)); 
  }, []);

  const handleSeekStart = (clientX: number) => {
    if (!isActive) return;
    setIsDragging(true);
    const newProgress = calculateProgress(clientX);
    setLocalProgress(newProgress);
    dragProgressRef.current = newProgress;
  };

  const handleSeekMove = useCallback((clientX: number) => {
    if (isDragging) {
      const newProgress = calculateProgress(clientX);
      setLocalProgress(newProgress);
      dragProgressRef.current = newProgress;
    }
  }, [isDragging, calculateProgress]);

  const handleSeekEnd = useCallback(() => {
    if (isDragging) {
      setIsDragging(false);
      // Ensure we trigger the seek with the final value
      onSeek(dragProgressRef.current);
    }
  }, [isDragging, onSeek]);

  // ... (Global listeners remain the same) ...

  const handleBarClick = (e: React.MouseEvent) => {
    if (!isActive) return;
    e.stopPropagation(); // Stop bubbling
    const newProgress = calculateProgress(e.clientX);
    setLocalProgress(newProgress);
    onSeek(newProgress);
  };

  const accentColor = color === 'red' ? 'from-red-500 to-orange-500' : 'from-blue-500 to-cyan-500';
  const glowColor = color === 'red' ? 'shadow-red-500/50' : 'shadow-blue-500/50';

  return (
    <div className="flex items-center gap-3 w-full mt-auto pt-2" dir="ltr"> {/* Force LTR for Controls */}
      
      {/* Vinyl Play Button */}
      <div 
        className={`relative w-12 h-12 flex-shrink-0 cursor-pointer group`}
        onClick={(e) => {
          e.stopPropagation();
          onPlayPause();
        }}
      >
        {/* ... (Vinyl visual code remains the same) ... */}
         <div className={`relative w-full h-full rounded-full bg-black shadow-lg ${isActive ? glowColor : ''} border border-white/10 flex items-center justify-center overflow-hidden`} style={{ transform: `rotate(${rotation}deg)` }}>
            <div className="absolute inset-0 flex items-center justify-center">
               <div className={`w-4 h-4 text-white z-10 ${isPlaying ? '' : 'pl-0.5'}`}>
                 {isPlaying ? (
                   <svg fill="currentColor" viewBox="0 0 24 24"><path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/></svg>
                 ) : (
                   <svg fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                 )}
               </div>
            </div>
        </div>
      </div>

      {/* Seek Bar */}
      <div 
        ref={seekBarRef}
        className={`relative flex-1 h-8 flex items-center cursor-pointer group ${!isActive ? 'opacity-50 cursor-not-allowed' : ''}`}
        onClick={handleBarClick}
        onMouseDown={(e) => handleSeekStart(e.clientX)}
        onTouchStart={(e) => handleSeekStart(e.touches[0].clientX)}
      >
        <div className="relative w-full h-1.5 bg-black/40 backdrop-blur-md rounded-full overflow-hidden border border-white/5">
          <div 
            className={`absolute inset-y-0 left-0 bg-gradient-to-r ${accentColor} transition-all ${isDragging ? 'duration-0' : 'duration-300 ease-out'}`}
            style={{ width: `${localProgress * 100}%` }}
          />
        </div>
        
        {isActive && (
            <div 
              className={`absolute top-1/2 -translate-y-1/2 h-4 w-4 bg-white rounded-full shadow-md pointer-events-none transition-transform duration-75 ${isDragging ? 'scale-125' : 'scale-0 group-hover:scale-100'}`}
              style={{ left: `${localProgress * 100}%`, marginLeft: '-6px' }} 
            />
        )}
      </div>
    </div>
  );
}
