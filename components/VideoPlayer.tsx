
import React, { useState, useRef, useEffect } from 'react';
import { Icons } from '../constants';

interface VideoPlayerProps {
  src: string;
  className?: string;
  muted?: boolean;
  loop?: boolean;
}

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
      containerRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
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
      if (isPlaying) setShowControls(false);
    }, 2500);
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      if (controlsTimeoutRef.current) window.clearTimeout(controlsTimeoutRef.current);
    };
  }, [isPlaying]);

  return (
    <div 
      ref={containerRef}
      className={`relative group overflow-hidden bg-black flex items-center justify-center ${className}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => isPlaying && setShowControls(false)}
    >
      <video
        ref={videoRef}
        src={src}
        className="max-w-full max-h-full object-contain cursor-pointer"
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onClick={togglePlay}
        loop={loop}
        playsInline
        muted={isMuted}
      />

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
            {/* Playback Speed */}
            <div className="relative group/speed">
              <button className="text-white text-xs font-bold border border-white/30 px-2 py-1 rounded hover:bg-white/10 transition-colors">
                {playbackRate}x
              </button>
              <div className="absolute bottom-full right-0 mb-2 bg-black/90 rounded-lg py-1 shadow-xl opacity-0 translate-y-2 group-hover/speed:opacity-100 group-hover/speed:translate-y-0 transition-all duration-200 border border-white/10">
                {[0.5, 1, 1.25, 1.5, 2].map(rate => (
                  <button
                    key={rate}
                    onClick={() => handlePlaybackRateChange(rate)}
                    className={`block w-full text-left px-4 py-1 text-xs font-bold transition-colors hover:bg-red-500 ${playbackRate === rate ? 'text-red-500' : 'text-white'}`}
                  >
                    {rate}x
                  </button>
                ))}
              </div>
            </div>

            {/* Fullscreen */}
            <button onClick={toggleFullscreen} className="text-white hover:text-red-400 transition-colors" aria-label="Toggle Fullscreen">
              <Icons.Maximize />
            </button>
          </div>
        </div>
      </div>
      
      {/* Big Central Play Button (When Paused) */}
      {!isPlaying && (
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
