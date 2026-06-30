import React, { useState, useRef, useEffect } from 'react';
import { Rnd } from 'react-rnd';
import useAppStore from '../store/useAppStore';

const PLAYLIST = [
  { id: 1, title: 'cubism', file: 'cubism.mp3', cover: 'cubism.png' },
  { id: 2, title: 'cubibibibism', file: 'cubibibibism.mp3', cover: 'cubism.png' },
  { id: 3, title: 'INTERNET YAMERO', file: 'INTERNET YAMERO.mp3', cover: 'yamero.jpg' },
  { id: 4, title: 'INTERNET OVERDOSE feat. KOTOKO', file: 'INTERNET OVERDOSE feat. KOTOKO.mp3', cover: 'overdose.jpg' },
  { id: 5, title: 'Moon rainbow butterfly', file: 'Moon rainbow butterfly.mp3', cover: 'moon.png' }
];

export default function MusicApp() {
  const { windows, closeWindow, focusWindow, updateSettings, setIsMusicPlaying } = useAppStore();
  const isOpen = windows.music?.isOpen;
  const zIndex = windows.music?.zIndex;

  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(50);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef(null);

  const formatTime = (time) => {
    if (isNaN(time) || time < 0) return '0:00';
    const m = Math.floor(time / 60);
    const s = Math.floor(time % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  // Sync external state
  useEffect(() => {
    if (isPlaying) {
      updateSettings({ bgmEnabled: false });
    }
    setIsMusicPlaying(isPlaying);
  }, [isPlaying, updateSettings, setIsMusicPlaying]);

  // Audio Lifecycle
  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
    }
    const audio = audioRef.current;
    
    const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
    const handleLoadedMetadata = () => setDuration(audio.duration);
    const handleEnded = () => {
      setCurrentTrackIndex(prev => (prev + 1) % PLAYLIST.length);
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('ended', handleEnded);
    };
  }, []);

  const skipPlayRef = useRef(false);

  // Handle Track Change — set new src and play if needed
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.src = `/assets/audio/${PLAYLIST[currentTrackIndex].file}`;
      if (isPlaying) {
        skipPlayRef.current = true; // Tell isPlaying effect to skip this round
        audioRef.current.play().catch(e => {
          console.warn('트랙 전환 재생 실패:', e);
          setIsPlaying(false);
        });
      }
    }
  }, [currentTrackIndex]);

  // Handle Play/Pause — skip if track change already handled it
  useEffect(() => {
    if (skipPlayRef.current) {
      skipPlayRef.current = false;
      return;
    }
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.play().catch(e => {
          console.warn('재생 실패:', e);
          setIsPlaying(false);
        });
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying]);

  // Handle Volume
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume / 100;
    }
  }, [volume]);

  if (!isOpen) {
    if (isPlaying) setIsPlaying(false);
    return null;
  }

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handlePrev = () => {
    setCurrentTrackIndex((prev) => (prev - 1 + PLAYLIST.length) % PLAYLIST.length);
    setIsPlaying(true);
  };

  const handleNext = () => {
    setCurrentTrackIndex((prev) => (prev + 1) % PLAYLIST.length);
    setIsPlaying(true);
  };

  return (
    <Rnd
      scale={0.7}
      bounds="parent"
      default={{ x: 100, y: 100, width: 340, height: 180 }}
      enableResizing={false}
      style={{ zIndex }}
      className="os-window"
      onMouseDown={() => focusWindow('music')}
      dragHandleClassName="window-drag-area"
    >
      <img src="/assets/images/border/window-jinesmall.png" alt="bg" style={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0, zIndex: -1, pointerEvents: 'none' }} />
      <div className="window-drag-area" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '24px', cursor: 'pointer' }}></div>
      
      {/* Title */}
      <div style={{ position: 'absolute', top: '4px', left: '10px', color: '#fff', fontSize: '12px', fontFamily: 'DinkieBitmap, sans-serif' }}>Media Player</div>
      <button 
        className="window-close-btn" 
        style={{ right: '12px', top: '14px' }} 
        onClick={() => closeWindow('music')}
      ></button>

      {/* Content Area */}
      <div style={{ position: 'absolute', top: '30px', left: '8px', right: '8px', bottom: '8px', backgroundColor: '#fff', display: 'flex', flexDirection: 'column', padding: '6px', gap: '6px', border: '2px inset #dfdfdf' }}>
          
          {/* Top Row: Album Art + Title/Artist */}
          <div style={{ display: 'flex', flexDirection: 'row', gap: '10px', alignItems: 'flex-start' }}>
            {/* Album Art */}
            <div style={{ flexShrink: 0, width: '64px', height: '64px', backgroundColor: '#ccc', border: '1px solid #000080', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
              <img src={`/assets/images/music/${PLAYLIST[currentTrackIndex].cover}`} alt="album" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>

            {/* Track Info */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', overflow: 'hidden', minWidth: 0, height: '64px' }}>
              <div style={{ color: '#5c22c7', fontFamily: 'PixelMplus10', fontSize: '16px', fontWeight: 'bold', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {PLAYLIST[currentTrackIndex].title}
              </div>
              <div style={{ color: '#5c22c7', fontFamily: 'PixelMplus10', fontSize: '12px' }}>
                Needy Streamer Overload
              </div>
            </div>
          </div>

          {/* Bottom Area: Controls & Progress */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'flex-start' }}>
            
            {/* Controls */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button onClick={handlePrev} style={{ background: 'none', border: 'none', color: '#5c22c7', fontSize: '24px', cursor: 'pointer', padding: 0, lineHeight: 1 }}>⏮</button>
              <button onClick={handlePlayPause} style={{ background: 'none', border: 'none', color: '#5c22c7', fontSize: '24px', cursor: 'pointer', padding: 0, lineHeight: 1 }}>{isPlaying ? '⏸' : '▶'}</button>
              <button onClick={handleNext} style={{ background: 'none', border: 'none', color: '#5c22c7', fontSize: '24px', cursor: 'pointer', padding: 0, lineHeight: 1 }}>⏭</button>
            </div>

            {/* Progress & Volume Bars */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '4px' }}>
              
              {/* Progress */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '10px', fontFamily: 'PixelMplus10', color: '#5c22c7' }}>
                <span style={{ width: '28px' }}>{formatTime(currentTime)}</span>
                <div 
                  style={{ flex: 1, height: '8px', border: '1px solid #5c22c7', backgroundColor: '#dfdfdf', cursor: 'pointer', display: 'flex' }}
                  onClick={(e) => {
                    if (!audioRef.current || !duration) return;
                    const rect = e.currentTarget.getBoundingClientRect();
                    const newTime = ((e.clientX - rect.left) / rect.width) * duration;
                    audioRef.current.currentTime = newTime;
                    setCurrentTime(newTime);
                  }}
                >
                  <div style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%`, backgroundColor: '#ff88dd', borderRight: '1px solid #5c22c7' }}></div>
                </div>
                <span style={{ width: '28px', textAlign: 'right' }}>{formatTime(duration)}</span>
              </div>

              {/* Volume */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '10px', fontFamily: 'PixelMplus10', color: '#5c22c7' }}>
                <span style={{ width: '28px' }}>VOL</span>
                <div 
                  style={{ flex: 1, height: '6px', border: '1px solid #5c22c7', backgroundColor: '#dfdfdf', cursor: 'pointer', display: 'flex' }}
                  onMouseDown={(e) => {
                    const updateVol = (clientX, rect) => {
                      const newVol = Math.max(0, Math.min(100, ((clientX - rect.left) / rect.width) * 100));
                      setVolume(newVol);
                    };
                    const rect = e.currentTarget.getBoundingClientRect();
                    updateVol(e.clientX, rect);
                    
                    const onMouseMove = (moveEvent) => updateVol(moveEvent.clientX, rect);
                    const onMouseUp = () => {
                      window.removeEventListener('mousemove', onMouseMove);
                      window.removeEventListener('mouseup', onMouseUp);
                    };
                    window.addEventListener('mousemove', onMouseMove);
                    window.addEventListener('mouseup', onMouseUp);
                  }}
                >
                  <div style={{ width: `${volume}%`, backgroundColor: '#5c22c7' }}></div>
                </div>
                <span style={{ width: '28px', textAlign: 'right' }}>{Math.round(volume)}</span>
              </div>
            </div>
          </div>
      </div>
    </Rnd>
  );
}
