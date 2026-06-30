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
  const { windows, closeWindow, focusWindow, updateSettings } = useAppStore();
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

  // Stop global BGM when music app plays something
  useEffect(() => {
    if (isPlaying) {
      updateSettings({ bgmEnabled: false });
    }
  }, [isPlaying, updateSettings]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume / 100;
    }
  }, [volume]);

  // Handle play/pause logic when track changes or play state toggles
  useEffect(() => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.play().catch(e => console.warn('오디오 재생 실패:', e));
    } else {
      audioRef.current.pause();
    }
  }, [isPlaying, currentTrackIndex]);

  if (!isOpen) {
    // When closed, stop playback
    if (isPlaying) setIsPlaying(false);
    return null;
  }

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleStop = () => {
    setIsPlaying(false);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  };

  const handleNext = () => {
    setCurrentTrackIndex((prev) => (prev + 1) % PLAYLIST.length);
    setIsPlaying(true);
  };

  const handlePrev = () => {
    setCurrentTrackIndex((prev) => (prev - 1 + PLAYLIST.length) % PLAYLIST.length);
    setIsPlaying(true);
  };

  const handleTrackEnded = () => {
    handleNext();
  };

  return (
    <Rnd
      default={{ x: 100, y: 100, width: 340, height: 180 }}
      minWidth={340}
      minHeight={180}
      bounds="parent"
      style={{ zIndex, display: 'flex', flexDirection: 'column' }}
      className="os-window"
      onMouseDown={() => focusWindow('music')}
      dragHandleClassName="title-bar"
    >
      <div style={{ backgroundColor: '#4df9df', padding: '2px', height: '100%', boxSizing: 'border-box', border: '2px solid #000080', display: 'flex', flexDirection: 'column' }}>
        
        {/* Title Bar */}
        <div className="title-bar" style={{ backgroundColor: '#dfccff', display: 'flex', alignItems: 'center', padding: '2px 4px', border: '2px solid #000080', borderBottom: 'none' }}>
          <div style={{ width: '12px', height: '12px', backgroundColor: '#5c22c7', marginRight: '6px' }}></div>
          <span style={{ color: '#5c22c7', fontSize: '14px', fontFamily: 'DinkieBitmap, sans-serif', fontWeight: 'bold' }}>Media Player</span>
          <div style={{ marginLeft: 'auto', display: 'flex', gap: '2px' }}>
            <button
              style={{
                width: '18px', height: '18px', backgroundColor: '#dfccff', border: '2px solid #5c22c7',
                color: '#5c22c7', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', padding: 0
              }}
            >
              ⚙
            </button>
            <button
              onClick={() => closeWindow('music')}
              style={{
                width: '18px', height: '18px', backgroundColor: '#dfccff', border: '2px solid #5c22c7',
                color: '#5c22c7', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', padding: 0
              }}
            >
              X
            </button>
          </div>
        </div>

        {/* Main Content Area */}
        <div style={{ flex: 1, backgroundColor: '#fff', border: '2px solid #000080', display: 'flex', padding: '6px', gap: '10px' }}>
          {/* Album Art */}
          <div style={{ width: '64px', height: '64px', backgroundColor: '#ccc', border: '1px solid #000080', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
            <img src={`/assets/images/music/${PLAYLIST[currentTrackIndex].cover}`} alt="album" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>

          {/* Track Info & Controls */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <div style={{ color: '#5c22c7', fontFamily: 'PixelMplus10', fontSize: '16px', fontWeight: 'bold', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {PLAYLIST[currentTrackIndex].title}
            </div>
            <div style={{ color: '#5c22c7', fontFamily: 'PixelMplus10', fontSize: '12px', marginBottom: '8px' }}>
              Needy Streamer Overload
            </div>
            
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

        {/* Bottom Progress Bar */}
        <div style={{ height: '12px', backgroundColor: '#4df9df', display: 'flex', alignItems: 'center', gap: '2px', marginTop: '2px' }}>
          <div style={{ width: '25%', height: '8px', backgroundColor: '#ff88dd', border: '1px solid #5c22c7' }}></div>
          <div style={{ width: '8px', height: '8px', backgroundColor: '#5c22c7', borderRadius: '50%' }}></div>
          <div style={{ width: '8px', height: '8px', backgroundColor: '#5c22c7', borderRadius: '50%' }}></div>
          <div style={{ width: '8px', height: '8px', backgroundColor: '#5c22c7', borderRadius: '50%' }}></div>
        </div>

      </div>

      <audio 
        ref={audioRef}
        src={`/assets/audio/${PLAYLIST[currentTrackIndex].file}`}
        onEnded={handleTrackEnded}
        onTimeUpdate={(e) => setCurrentTime(e.target.currentTime)}
        onLoadedMetadata={(e) => setDuration(e.target.duration)}
      />
    </Rnd>
  );
}
