import React, { useState, useEffect, useRef } from 'react';
import {
  Maximize2,
  Minimize2,
  Volume2,
  VolumeX,
  Radio,
  Clock,
  CloudSun,
  AlertTriangle,
  QrCode,
  Tv,
  ArrowLeft,
  RefreshCw,
  Sparkles,
  Info
} from 'lucide-react';
import { Playlist, PlaylistItem, ScreenDevice } from '../types';

interface PlayerViewProps {
  initialScreenId?: string;
  onExit: () => void;
  allScreens: ScreenDevice[];
  allPlaylists: Playlist[];
}

export const PlayerView: React.FC<PlayerViewProps> = ({
  initialScreenId,
  onExit,
  allScreens,
  allPlaylists,
}) => {
  const [selectedScreenId, setSelectedScreenId] = useState<string>(
    initialScreenId || allScreens[0]?.id || ''
  );
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [currentTimeStr, setCurrentTimeStr] = useState('');
  const [currentDateStr, setCurrentDateStr] = useState('');
  const [showControls, setShowControls] = useState(true);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [emergencyAlert, setEmergencyAlert] = useState<{
    active: boolean;
    title: string;
    message: string;
    severity: string;
  } | null>(null);

  const controlsTimeoutRef = useRef<any>(null);
  const slideTimerRef = useRef<any>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const currentScreen = allScreens.find(s => s.id === selectedScreenId) || allScreens[0];
  const activePlaylist = allPlaylists.find(p => p.id === currentScreen?.currentPlaylistId) || allPlaylists[0];
  const items = activePlaylist?.items || [];
  const currentItem: PlaylistItem | undefined = items[currentSlideIndex];
  const currentAsset = currentItem?.asset;

  // Real-time Clock updater
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTimeStr(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
      setCurrentDateStr(now.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Emergency Alert Synchronization
  useEffect(() => {
    if (currentScreen?.emergencyAlert?.active) {
      setEmergencyAlert(currentScreen.emergencyAlert);
    } else {
      setEmergencyAlert(null);
    }
  }, [currentScreen?.emergencyAlert]);

  // Slideshow advance logic
  const advanceToNextSlide = () => {
    if (items.length <= 1) return;
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentSlideIndex(prev => (prev + 1) % items.length);
      setIsTransitioning(false);
    }, 400);
  };

  // Timer for Image slide duration
  useEffect(() => {
    if (!currentItem) return;

    if (currentAsset?.type === 'image') {
      const durationMs = (currentItem.durationSeconds || 10) * 1000;
      if (slideTimerRef.current) clearTimeout(slideTimerRef.current);
      slideTimerRef.current = setTimeout(() => {
        advanceToNextSlide();
      }, durationMs);
    }

    return () => {
      if (slideTimerRef.current) clearTimeout(slideTimerRef.current);
    };
  }, [currentSlideIndex, currentItem, currentAsset?.type]);

  // Handle Video end or error
  const handleVideoEnded = () => {
    advanceToNextSlide();
  };

  // Mouse move hud visibility
  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    controlsTimeoutRef.current = setTimeout(() => {
      setShowControls(false);
    }, 4000);
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen?.();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.();
      setIsFullscreen(false);
    }
  };

  // Keyboard shortcuts (F for Fullscreen, M for Mute, Esc to exit)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'f' || e.key === 'F') {
        toggleFullscreen();
      } else if (e.key === 'm' || e.key === 'M') {
        setIsMuted(prev => !prev);
      } else if (e.key === 'Escape' && !document.fullscreenElement) {
        onExit();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className="fixed inset-0 bg-black text-white select-none overflow-hidden flex flex-col justify-between z-50 font-sans"
    >
      {/* ---------------------------------------------------- */}
      {/* 1. UNPAIRED SCREEN STATE                             */}
      {/* ---------------------------------------------------- */}
      {!currentScreen?.isPaired ? (
        <div className="relative w-full h-full flex flex-col items-center justify-center p-8 bg-gradient-to-b from-zinc-950 via-zinc-900 to-zinc-950">
          {/* Subtle Ambient Grid Background */}
          <div className="absolute inset-0 bg-[radial-gradient(#312e81_1px,transparent_1px)] [background-size:24px_24px] opacity-20 pointer-events-none" />

          {/* Top Status */}
          <div className="absolute top-8 left-8 flex items-center space-x-3 text-sm">
            <div className="h-10 w-10 rounded-xl bg-indigo-600 flex items-center justify-center shadow-lg">
              <Radio className="h-5 w-5 text-white animate-pulse" />
            </div>
            <div>
              <span className="font-bold text-white tracking-wider uppercase text-base">Signboard Client</span>
              <div className="text-xs text-zinc-400">Firmware {currentScreen?.appVersion || 'v2.4.1'} • Awaiting Gateway Enrollment</div>
            </div>
          </div>

          <div className="absolute top-8 right-8 text-right font-mono">
            <div className="text-xl font-bold text-white">{currentTimeStr}</div>
            <div className="text-xs text-zinc-400">{currentDateStr}</div>
          </div>

          {/* Center Pairing Code Display */}
          <div className="max-w-md w-full bg-zinc-900/90 border border-zinc-800 rounded-3xl p-8 text-center space-y-6 shadow-2xl relative backdrop-blur-md">
            <div className="inline-flex p-3 rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <Tv className="h-8 w-8 animate-pulse" />
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-white tracking-tight">Enroll This Display</h2>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Connect this PC to your centralized digital signage network by entering the pairing code below in the central management dashboard.
              </p>
            </div>

            {/* Prominent Pairing Code */}
            <div className="bg-zinc-950 border-2 border-indigo-500/50 rounded-2xl p-4 shadow-inner">
              <span className="text-xs text-zinc-400 uppercase tracking-widest font-mono block mb-1">
                PAIRING CODE
              </span>
              <span className="font-mono text-4xl sm:text-5xl font-black text-indigo-400 tracking-widest drop-shadow-md">
                {currentScreen?.pairingCode || 'SGN-842'}
              </span>
            </div>

            {/* Instruction Steps */}
            <div className="text-left bg-zinc-950/60 rounded-xl p-3.5 space-y-2 text-xs text-zinc-300 border border-zinc-800">
              <div className="flex items-center space-x-2">
                <span className="h-4 w-4 rounded-full bg-indigo-600 text-[10px] font-bold flex items-center justify-center text-white shrink-0">1</span>
                <span>Open central dashboard on administrator PC</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="h-4 w-4 rounded-full bg-indigo-600 text-[10px] font-bold flex items-center justify-center text-white shrink-0">2</span>
                <span>Click <strong className="text-white">+ Pair Screen</strong> in the top navigation</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="h-4 w-4 rounded-full bg-indigo-600 text-[10px] font-bold flex items-center justify-center text-white shrink-0">3</span>
                <span>Enter code <strong className="font-mono text-indigo-300">{currentScreen?.pairingCode || 'SGN-842'}</strong> to start playback</span>
              </div>
            </div>

            {/* IP and Diagnostics */}
            <div className="flex items-center justify-between text-[11px] font-mono text-zinc-500 pt-2 border-t border-zinc-800">
              <span>IP: {currentScreen?.ipAddress || '192.168.1.205'}</span>
              <span>Res: {currentScreen?.resolution || '1920x1080'}</span>
            </div>
          </div>

          {/* Bottom Back Button */}
          <div className="absolute bottom-8 left-8">
            <button
              onClick={onExit}
              className="flex items-center space-x-2 bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 px-4 py-2 rounded-xl text-xs backdrop-blur-xs transition"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Management Dashboard</span>
            </button>
          </div>
        </div>
      ) : (
        /* ---------------------------------------------------- */
        /* 2. PAIRED SIGNAGE MEDIA PLAYBACK                     */
        /* ---------------------------------------------------- */
        <div className="relative w-full h-full flex flex-col justify-between overflow-hidden bg-black">
          {/* Main Media Visual Surface */}
          <div className="absolute inset-0 w-full h-full flex items-center justify-center bg-black overflow-hidden">
            {currentAsset?.type === 'video' ? (
              <video
                key={currentAsset.url + currentSlideIndex}
                ref={videoRef}
                src={currentAsset.url}
                autoPlay
                playsInline
                muted={isMuted || (currentScreen?.volume === 0)}
                onEnded={handleVideoEnded}
                onError={advanceToNextSlide}
                className={`w-full h-full object-cover transition-opacity duration-500 ${
                  isTransitioning ? 'opacity-0' : 'opacity-100'
                }`}
              />
            ) : currentAsset?.type === 'image' ? (
              <img
                key={currentAsset.url + currentSlideIndex}
                src={currentAsset.url}
                alt={currentAsset.name}
                className={`w-full h-full object-cover transition-all duration-700 ${
                  isTransitioning ? 'opacity-0 scale-105' : 'opacity-100 scale-100'
                }`}
              />
            ) : (
              <div className="text-zinc-600 flex flex-col items-center">
                <Tv className="h-16 w-16 mb-4 text-zinc-500 animate-pulse" />
                <span className="text-base font-semibold text-zinc-400">Connecting to Signboard Media Stream...</span>
              </div>
            )}
          </div>

          {/* Top Widgets Bar (Clock, Weather, Network Status) */}
          <div className="relative z-20 flex items-center justify-between p-6 bg-gradient-to-b from-black/80 via-black/40 to-transparent pointer-events-none">
            {/* Top Left: Screen Location Badge */}
            <div className="flex items-center space-x-3">
              <div className="bg-black/60 backdrop-blur-md border border-white/10 px-3.5 py-1.5 rounded-full flex items-center space-x-2 text-xs text-white shadow-xl">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="font-semibold">{currentScreen.name}</span>
                <span className="text-zinc-400">•</span>
                <span className="text-zinc-300">{currentScreen.location}</span>
              </div>
            </div>

            {/* Top Right: Clock & Weather */}
            <div className="flex items-center space-x-3 font-mono">
              {activePlaylist?.showWeather && (
                <div className="bg-black/60 backdrop-blur-md border border-white/10 px-3.5 py-1.5 rounded-full flex items-center space-x-2 text-xs text-zinc-200 shadow-xl">
                  <CloudSun className="h-4 w-4 text-amber-400" />
                  <span>72°F Sunny</span>
                </div>
              )}

              {activePlaylist?.showClock && (
                <div className="bg-black/60 backdrop-blur-md border border-white/10 px-4 py-1.5 rounded-full flex items-center space-x-3 text-xs text-white shadow-xl">
                  <Clock className="h-3.5 w-3.5 text-indigo-400" />
                  <span className="font-bold text-sm tracking-wider">{currentTimeStr}</span>
                  <span className="text-zinc-400 text-[11px] font-sans">{currentDateStr}</span>
                </div>
              )}
            </div>
          </div>

          {/* Emergency Alert Overlay Banner */}
          {emergencyAlert?.active && (
            <div className="relative z-30 mx-8 my-auto bg-rose-950/95 border-4 border-rose-500 rounded-3xl p-8 text-center shadow-2xl backdrop-blur-md animate-pulse">
              <div className="h-16 w-16 bg-rose-600 rounded-full flex items-center justify-center mx-auto mb-4 text-white shadow-lg">
                <AlertTriangle className="h-10 w-10 animate-bounce" />
              </div>
              <h2 className="text-3xl sm:text-4xl font-black text-white uppercase tracking-wider mb-2 drop-shadow">
                {emergencyAlert.title}
              </h2>
              <p className="text-lg sm:text-xl text-rose-100 max-w-2xl mx-auto font-medium leading-relaxed">
                {emergencyAlert.message}
              </p>
              <div className="mt-4 text-xs font-mono text-rose-300">
                DISPATCHED FROM CENTRAL GATEWAY • ALL NETWORK DISPLAYS LOCKED
              </div>
            </div>
          )}

          {/* Bottom Headline News Ticker Banner */}
          {activePlaylist?.tickerText && (
            <div className="relative z-20 bg-zinc-950/90 border-t border-white/10 py-2.5 px-4 backdrop-blur-md flex items-center overflow-hidden">
              <div className="bg-indigo-600 text-white font-bold text-xs uppercase tracking-wider px-3 py-1 rounded-md shrink-0 mr-4 shadow-sm flex items-center space-x-1.5">
                <span className="h-2 w-2 rounded-full bg-white animate-ping" />
                <span>NOTICE</span>
              </div>
              <div className="overflow-hidden whitespace-nowrap w-full">
                <div className="animate-marquee text-sm font-medium text-zinc-100 tracking-wide">
                  {activePlaylist.tickerText} ••• {activePlaylist.tickerText}
                </div>
              </div>
            </div>
          )}

          {/* Floating On-Screen Controls HUD (reveals on mouse move) */}
          <div
            className={`fixed bottom-14 left-1/2 -translate-x-1/2 z-40 bg-zinc-900/90 border border-zinc-700/60 rounded-2xl px-5 py-3 shadow-2xl backdrop-blur-md flex items-center space-x-4 transition-all duration-300 ${
              showControls ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
            }`}
          >
            {/* Screen Selector */}
            <div className="flex items-center space-x-2 text-xs">
              <span className="text-zinc-400">Display:</span>
              <select
                value={selectedScreenId}
                onChange={e => {
                  setSelectedScreenId(e.target.value);
                  setCurrentSlideIndex(0);
                }}
                className="bg-zinc-950 border border-zinc-700 text-white text-xs px-2.5 py-1.5 rounded-lg focus:outline-none focus:border-indigo-500"
              >
                {allScreens.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.isPaired ? 'Paired' : 'Unpaired'})
                  </option>
                ))}
              </select>
            </div>

            <div className="h-4 w-px bg-zinc-700" />

            {/* Slide Index indicator */}
            <div className="text-xs text-zinc-300 font-mono">
              Slide {currentSlideIndex + 1} of {items.length || 1}
            </div>

            <div className="h-4 w-px bg-zinc-700" />

            {/* Next Slide Manual */}
            <button
              onClick={advanceToNextSlide}
              className="p-1.5 text-zinc-300 hover:text-white hover:bg-zinc-800 rounded-lg transition"
              title="Next Slide"
            >
              <RefreshCw className="h-4 w-4" />
            </button>

            {/* Audio Toggle */}
            <button
              onClick={() => setIsMuted(prev => !prev)}
              className={`p-1.5 rounded-lg transition ${
                !isMuted ? 'bg-indigo-600 text-white' : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
              }`}
              title="Toggle Audio (M key)"
            >
              {!isMuted ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
            </button>

            {/* Fullscreen Toggle */}
            <button
              onClick={toggleFullscreen}
              className="p-1.5 text-zinc-300 hover:text-white hover:bg-zinc-800 rounded-lg transition"
              title="Toggle Fullscreen (F key)"
            >
              {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            </button>

            <div className="h-4 w-px bg-zinc-700" />

            {/* Exit Player Button */}
            <button
              onClick={onExit}
              className="px-3 py-1.5 text-xs font-semibold bg-zinc-800 hover:bg-zinc-700 text-zinc-200 hover:text-white rounded-lg transition"
            >
              Exit to Dashboard
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
