
import React, { useState, useRef, useEffect } from 'react';
import { Icons } from '../constants';

interface VideoPlayerProps {
  src: string;
  className?: string;
  muted?: boolean;
  loop?: boolean;
}

const FILTERS = [
  { name: 'None', class: '' },
  { name: 'Sepia', class: 'sepia(0.8)' },
  { name: 'B&W', class: 'grayscale(1)' },
  { name: 'Invert', class: 'invert(1)' },
  { name: 'Warm', class: 'sepia(0.3) saturate(1.5) hue-rotate(-10deg)' },
  { name: 'Cool', class: 'saturate(1.2) hue-rotate(180deg) brightness(1.1)' },
];

const VideoPlayer: React.FC<VideoPlayerProps> = ({ src, className = '', muted = false, loop = true }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(muted ? 0 : 1);
  const [isMuted, setIsMuted] = useState(muted);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [showControls, setShowControls] = useState(false);
  const [showFxMenu, setShowFxMenu] = useState(false);
  const [activeFilter, setActiveFilter] = useState(FILTERS[0]);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const controlsTimeoutRef = useRef<number | null>(null);

  const togglePlay = () => {
    if (videoRef.current) {
      if (videoRef.current.paused) {
        videoRef.current.play();
      } else {
        videoRef.current.pause();
      }
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = Number(e.target.value);
    if (videoRef.current) {
      videoRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const vol = Number(e.target.value);
    setVolume(vol);
    setIsMuted(vol === 0);
    if (videoRef.current) {
      videoRef.current.volume = vol;
      videoRef.current.muted = vol === 0;
    }
  };

  const toggleMute = () => {
    const newMuted = !isMuted;
    setIsMuted(newMuted);
    const newVol = newMuted ? 0 : (volume === 0 ? 1 : volume);
    setVolume(newVol);
    if (videoRef.current) {
      videoRef.current.muted = newMuted;
      videoRef.current.volume = newVol;
    }
  };

  const handlePlaybackRateChange = (rate: number) => {
    setPlaybackRate(rate);
    if (videoRef.current) {
      videoRef.current.playbackRate = rate;
    }
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

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) {
      window.clearTimeout(controlsTimeoutRef.current);
    }
    controlsTimeoutRef.current = window.setTimeout(() => {
      if (isPlaying && !showFxMenu) setShowControls(false);
    }, 2500);
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    document.addEventListener('MSFullscreenChange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
      document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
      if (controlsTimeoutRef.current) window.clearTimeout(controlsTimeoutRef.current);
    };
  }, [isPlaying, showFxMenu]);

  return (
    <div 
      ref={containerRef}
      className={`relative group overflow-hidden bg-black flex items-center justify-center ${className} ${isFullscreen ? 'w-screen h-screen' : ''}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => isPlaying && !showFxMenu && setShowControls(false)}
    >
      <video
        ref={videoRef}
        src={src}
        style={{ filter: activeFilter.class }}
        className="max-w-full max-h-full object-contain cursor-pointer transition-[filter] duration-500"
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onClick={togglePlay}
        loop={loop}
        playsInline
        muted={isMuted}
      />

      {/* Visual FX Menu Overlay */}
      {showFxMenu && (
        <div className="absolute inset-0 bg-black/60 backdrop-blur-md flex flex-col items-center justify-center p-6 z-40 animate-in fade-in zoom-in-95">
          <button 
            onClick={() => setShowFxMenu(false)}
            className="absolute top-4 right-4 text-white hover:text-red-400 p-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
          
          <h3 className="text-white font-bold text-lg mb-6 flex items-center gap-2">
            <Icons.Sparkles /> Video Effects
          </h3>

          <div className="w-full max-w-sm space-y-8">
            {/* Filter Selection */}
            <div>
              <p className="text-white/60 text-[10px] font-bold uppercase tracking-widest mb-3">Color Filters</p>
              <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                {FILTERS.map((f) => (
                  <button
                    key={f.name}
                    onClick={() => setActiveFilter(f)}
                    className={`flex-shrink-0 px-4 py-2 rounded-xl text-xs font-bold transition-all border ${activeFilter.name === f.name ? 'bg-red-500 text-white border-red-400 shadow-lg scale-105' : 'bg-white/10 text-white/70 border-white/10 hover:bg-white/20'}`}
                  >
                    {f.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Speed Ramps / Slow-Mo Selection */}
            <div>
              <p className="text-white/60 text-[10px] font-bold uppercase tracking-widest mb-3">Playback Speed & Ramps</p>
              <div className="grid grid-cols-3 gap-3">
                {[0.5, 0.75, 1, 1.25, 1.5, 2].map((rate) => (
                  <button
                    key={rate}
                    onClick={() => handlePlaybackRateChange(rate)}
                    className={`py-3 rounded-2xl text-xs font-bold transition-all border ${playbackRate === rate ? 'bg-white text-gray-900 border-white shadow-lg' : 'bg-white/5 text-white/50 border-white/5 hover:bg-white/10'}`}
                  >
                    {rate}x {rate < 1 ? '🐢' : rate > 1 ? '⚡' : ''}
                  </button>
                ))}
              </div>
            </div>

            <button 
              onClick={() => setShowFxMenu(false)}
              className="w-full bg-red-500 text-white py-4 rounded-2xl font-bold text-sm shadow-xl hover:bg-red-600 transition-all active:scale-95"
            >
              Apply & Close
            </button>
          </div>
        </div>
      )}

      {/* Custom Controls Overlay */}
      <div className={`absolute inset-0 flex flex-col justify-end p-4 bg-gradient-to-t from-black/70 via-transparent to-transparent transition-opacity duration-300 ${showControls || !isPlaying ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        
        {/* Progress Bar */}
        <div className="w-full mb-3 flex items-center gap-2">
          <span className="text-white text-[10px] font-bold tabular-nums w-8">{formatTime(currentTime)}</span>
          <input
            type="range"
            min="0"
            max={duration || 0}
            step="0.01"
            value={currentTime}
            onChange={handleSeek}
            className="flex-1 h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-red-500 hover:h-2 transition-all"
            aria-label="Seek Video"
          />
          <span className="text-white text-[10px] font-bold tabular-nums w-8">{formatTime(duration)}</span>
        </div>

        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            {/* Play/Pause */}
            <button onClick={togglePlay} className="text-white hover:text-red-400 transition-colors" aria-label={isPlaying ? "Pause" : "Play"}>
              {isPlaying ? <Icons.Pause /> : <Icons.Play />}
            </button>

            {/* Volume */}
            <div className="flex items-center gap-2 group/volume">
              <button onClick={toggleMute} className="text-white hover:text-red-400 transition-colors" aria-label={isMuted ? "Unmute" : "Mute"}>
                {isMuted || volume === 0 ? <Icons.VolumeMuted /> : <Icons.Volume />}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={volume}
                onChange={handleVolumeChange}
                className="w-0 group-hover/volume:w-20 h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-white transition-all duration-300 opacity-0 group-hover/volume:opacity-100"
                aria-label="Volume Slider"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* FX Menu Button */}
            <button 
              onClick={(e) => { e.stopPropagation(); setShowFxMenu(true); }}
              className="text-white hover:text-yellow-400 transition-colors flex items-center gap-1 bg-white/10 px-2 py-1 rounded-lg border border-white/10"
              aria-label="Effects"
            >
              <Icons.Sparkles />
              <span className="text-[10px] font-bold uppercase tracking-widest hidden sm:inline">FX</span>
            </button>

            {/* Playback Speed Display */}
            <button 
              onClick={(e) => { e.stopPropagation(); setShowFxMenu(true); }}
              className="text-white text-xs font-bold border border-white/30 px-2 py-1 rounded hover:bg-white/10 transition-colors"
            >
              {playbackRate}x
            </button>

            {/* Fullscreen Toggle */}
            <button onClick={toggleFullscreen} className="text-white hover:text-red-400 transition-colors" aria-label={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}>
              {isFullscreen ? <Icons.Minimize /> : <Icons.Maximize />}
            </button>
          </div>
        </div>
      </div>
      
      {/* Big Central Play Button (When Paused) */}
      {!isPlaying && !showFxMenu && (
        <button 
          onClick={togglePlay}
          className="absolute inset-0 m-auto w-16 h-16 flex items-center justify-center bg-black/40 backdrop-blur-sm rounded-full text-white scale-110 hover:scale-125 transition-transform"
        >
          <Icons.Play />
        </button>
      )}
    </div>
  );
};

export default VideoPlayer;
