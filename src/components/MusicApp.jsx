import React, { useState, useRef, useEffect } from 'react';
import { Rnd } from 'react-rnd';
import useAppStore from '../store/useAppStore';

const PLAYLIST = [
  { id: 1, title: '큐비즘 (Qvism)', file: 'cubism.mp3' },
  { id: 2, title: '큐비비비비즘', file: 'cubibibibism.mp3' },
  { id: 3, title: '인터넷 야메로', file: 'INTERNET YAMERO.mp3' },
  { id: 4, title: '인터넷 오버도즈', file: 'INTERNET OVERDOSE feat. KOTOKO.mp3' },
  { id: 5, title: '문 레인보우 버터플라이', file: 'Moon rainbow butterfly.mp3' }
];

export default function MusicApp() {
  const { windows, closeWindow, focusWindow, updateSettings } = useAppStore();
  const isOpen = windows.music?.isOpen;
  const zIndex = windows.music?.zIndex;

  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(50);
  const audioRef = useRef(null);

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
      default={{ x: 100, y: 100, width: 300, height: 350 }}
      minWidth={300}
      minHeight={250}
      bounds="parent"
      style={{ zIndex, display: 'flex', flexDirection: 'column' }}
      className="os-window"
      onMouseDown={() => focusWindow('music')}
      dragHandleClassName="title-bar"
    >
      {/* Title Bar */}
      <div className="title-bar" style={{ backgroundColor: '#000080', display: 'flex', alignItems: 'center', padding: '2px 3px' }}>
        <img src="/assets/images/icons/media.png" alt="icon" style={{ width: '16px', height: '16px', marginRight: '4px' }} />
        <span style={{ color: '#fff', fontSize: '12px', fontFamily: 'DinkieBitmap, sans-serif' }}>Media Player</span>
        <button
          onClick={() => closeWindow('music')}
          style={{
            marginLeft: 'auto', width: '16px', height: '16px',
            backgroundColor: '#dfdfdf', border: '1px solid #fff',
            borderBottomColor: '#000', borderRightColor: '#000',
            fontSize: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
            padding: 0
          }}
        >
          X
        </button>
      </div>

      {/* Main Content */}
      <div className="window-content" style={{ flex: 1, backgroundColor: '#dfdfdf', padding: '10px', display: 'flex', flexDirection: 'column', gap: '10px', border: '2px solid #dfdfdf', borderTopColor: '#fff', borderLeftColor: '#fff', borderRightColor: '#000', borderBottomColor: '#000' }}>
        
        {/* LCD Screen */}
        <div style={{ backgroundColor: '#000', color: '#0f0', padding: '10px', border: '2px inset #dfdfdf', fontFamily: 'PixelMplus10', textAlign: 'center', textShadow: '0 0 5px #0f0' }}>
          <div style={{ fontSize: '12px', marginBottom: '5px' }}>{isPlaying ? '▶ PLAYING' : '⏸ PAUSED'}</div>
          <div style={{ fontSize: '16px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {PLAYLIST[currentTrackIndex].title}
          </div>
        </div>

        {/* Controls */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '5px' }}>
          <button className="media-btn" onClick={handlePrev} title="이전 곡">⏮</button>
          <button className="media-btn" onClick={handlePlayPause} style={{ fontWeight: 'bold' }}>
            {isPlaying ? '⏸' : '▶'}
          </button>
          <button className="media-btn" onClick={handleStop} title="정지">⏹</button>
          <button className="media-btn" onClick={handleNext} title="다음 곡">⏭</button>
        </div>

        {/* Volume */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '12px', fontFamily: 'DinkieBitmap, sans-serif' }}>
          <span>VOL</span>
          <input 
            type="range" 
            min="0" 
            max="100" 
            value={volume}
            onChange={(e) => setVolume(e.target.value)}
            style={{ flex: 1 }}
          />
        </div>

        {/* Playlist */}
        <div style={{ flex: 1, backgroundColor: '#fff', border: '2px inset #dfdfdf', overflowY: 'auto' }}>
          {PLAYLIST.map((track, idx) => (
            <div 
              key={track.id}
              onClick={() => {
                setCurrentTrackIndex(idx);
                setIsPlaying(true);
              }}
              style={{
                padding: '5px',
                fontSize: '12px',
                fontFamily: 'PixelMplus10',
                cursor: 'pointer',
                backgroundColor: currentTrackIndex === idx ? '#000080' : 'transparent',
                color: currentTrackIndex === idx ? '#fff' : '#000'
              }}
            >
              {idx + 1}. {track.title}
            </div>
          ))}
        </div>

      </div>

      <audio 
        ref={audioRef}
        src={`/assets/audio/${PLAYLIST[currentTrackIndex].file}`}
        onEnded={handleTrackEnded}
      />
    </Rnd>
  );
}
