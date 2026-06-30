import React, { useEffect, useState } from 'react';
import { Rnd } from 'react-rnd';
import useAppStore from './store/useAppStore';
import AnimatedPet from './components/AnimatedPet';
import SettingsApp from './components/SettingsApp';
import NotepadApp from './components/NotepadApp';
import './index.css';
import { playOpenSound, playCloseSound, playExecuteSound, playJineSendSound, playTransformSound, stopTransformSound, playEndHaishinSound } from './utils/audio';

const BootScreen = () => {
  const { finishBoot } = useAppStore();
  const [text, setText] = useState('');
  
  useEffect(() => {
    const audio = new Audio('/assets/audio/boot.wav');
    audio.play().catch(() => {});

    const lines = [
      'DOSE OS (C) 2026',
      'Memory Test: 640K OK',
      'Loading system drivers...',
      'Starting network services...',
      'Welcome to DOSE OS.'
    ];
    
    let currentLine = 0;
    const interval = setInterval(() => {
      if (currentLine < lines.length) {
        setText(prev => prev + lines[currentLine] + '\n');
        currentLine++;
      } else {
        clearInterval(interval);
        setTimeout(finishBoot, 1000);
      }
    }, 500);

    return () => clearInterval(interval);
  }, [finishBoot]);

  return (
    <div className="boot-screen">
      <pre>{text}</pre>
    </div>
  );
};

export default function App() {
  const { 
    isBooting, windows, 
    openWindow, closeWindow, focusWindow,
    jineMessages, addJineMessage,
    petState, petAction, setPetState, setPetAction, settings, updateSettings } = useAppStore();

  const [input, setInput] = useState('');
  const [isAiTyping, setIsAiTyping] = useState(false);

  const AME_MOTIONS = [
    { label: '평온 (기본)', path: '0/0/0/0' },
    { label: '기분 좋음 (방긋)', path: '0/0/0/1' },
    { label: '평온 (호감도 보통)', path: '0/1/0/0' },
    { label: '기분 좋음 (호감도 보통)', path: '0/1/0/1' },
    { label: '평온 (호감도 최고)', path: '0/2/0/0' },
    { label: '기분 좋음 (호감도 최고)', path: '0/2/0/1' },
    { label: '평온 (우울함)', path: '0/0/1/0' },
    { label: '기분 좋음 (우울함)', path: '0/0/1/1' },
    { label: '평온 (죽은 눈)', path: '0/0/2/0' },
    { label: '불안 (다리떨기)', path: '1/0/0/0' },
    { label: '짜증 (화냄)', path: '1/0/0/1' },
    { label: '불안 (호감도 보통)', path: '1/1/0/0' },
    { label: '짜증 (호감도 보통)', path: '1/1/0/1' },
    { label: '불안 (호감도 최고)', path: '1/2/0/0' },
    { label: '짜증 (호감도 최고)', path: '1/2/0/1' },
    { label: '불안 (우울함)', path: '1/0/1/0' },
    { label: '짜증 (우울함)', path: '1/0/1/1' },
    { label: '불안 (죽은 눈)', path: '1/0/2/0' },
    { label: '짜증 (죽은 눈)', path: '1/0/2/1' },
    { label: '헤드폰 (음악)', path: '-1/-1/-1/0' },
    { label: '광기 (발작)', path: '1/-1/-1/0' },
    { label: '구토', path: '1/-1/-1/1' },
    { label: '게임 중', path: '-1/0/0/0' },
    { label: '영화 감상', path: '-1/0/0/1' },
    { label: '게임 중 (호감도 보통)', path: '-1/1/0/0' },
    { label: '영화 감상 (호감도 보통)', path: '-1/1/0/1' },
    { label: '게임 중 (호감도 최고)', path: '-1/2/0/0' },
    { label: '게임 중 (죽은 눈)', path: '-1/0/2/0' },
    { label: '붉은 변신 (특수)', path: 'transformation_dark' }
  ];

  const KANGEL_MOTIONS = [
    { label: '방송 대기 (1)', path: 'stream/0/0' },
    { label: '게임 중', path: 'stream/18/0' },
    { label: '멍때리기', path: 'stream/1/0' },
    { label: '메이크업준비', path: 'stream/6/0' },
    { label: '제품소개', path: 'stream/6/1' },
    { label: '화장중', path: 'stream/6/2' },
    { label: 'ASMR (속삭임)', path: 'stream/7/0' },
    { label: '마이크 핥기', path: 'stream/7/2' },
    { label: '노래 방송', path: 'stream/8/0' },
    { label: '방방이', path: 'stream/9/0' },
    { label: '인사', path: 'stream/51/0' },
    { label: '입꼬리내리기', path: 'stream/52/0' },
    { label: '입꼬리올리기', path: 'stream/53/0' },
    { label: '진정해', path: 'stream/54/0' },
    { label: '아닙니다!', path: 'stream/57/0' },
    { label: '기도', path: 'stream/44/1' },
    { label: '박사!', path: 'stream/32/0' },
    { label: '콜라뿜기', path: 'stream/5/2' },
    { label: '거기 너!', path: 'stream/14/0' },
    { label: '아이스크림 먹방', path: 'stream/27/0' },
    { label: '공포 방송 (1)', path: 'stream/_dame/horror/0' },
    { label: '음모론', path: 'stream/_dame/horror/1' },
    { label: '교주', path: 'stream/_dame/kyouso/0' },
    { label: '광기 폭주', path: 'stream/_dame/craziness/0' },
    { label: '구토', path: 'stream/_dame/vomiting/0' },
    { label: '은버튼 리액션', path: 'stream/_dame/100ksliver/0' },
    { label: '멘붕 (방송사고)', path: 'stream/_dame/b/0' }
  ];

  const bgmRef = React.useRef(null);

  // Start and handle BGM track change
  useEffect(() => {
    if (isBooting) return;
    
    if (bgmRef.current) {
      bgmRef.current.pause();
    }
    
    const audio = new Audio(`/assets/audio/${settings.bgmTrack}`);
    audio.loop = true;
    bgmRef.current = audio;
    
    if (settings.bgmEnabled) {
      let targetVolume = (settings.volume / 100) * 0.3;
      if (settings.bgmTrack === 'desire.wav') targetVolume = Math.min((settings.volume / 100) * 0.8, 1);
      audio.volume = targetVolume;
      audio.play().catch(() => {});
    }

    return () => {
      if (bgmRef.current) bgmRef.current.pause();
    };
  }, [isBooting, settings.bgmTrack]);

  // Handle volume and play/pause dynamically
  useEffect(() => {
    if (!bgmRef.current) return;
    let targetVolume = (settings.volume / 100) * 0.3;
    if (settings.bgmTrack === 'desire.wav') targetVolume = Math.min((settings.volume / 100) * 0.8, 1);
    bgmRef.current.volume = targetVolume;
    
    if (settings.bgmEnabled) {
      bgmRef.current.play().catch(() => {});
    } else {
      bgmRef.current.pause();
    }
  }, [settings.bgmEnabled, settings.volume]);

    useEffect(() => {
    if (petState === 'kangel' || petState === 'idle') {
      stopTransformSound();
    }
  }, [petState]);

  useEffect(() => {
    document.documentElement.style.setProperty('--window-scale', (settings.windowScale || 100) / 100);
  }, [settings.windowScale]);

  const handleSend = async () => {
    if (!input.trim() || isAiTyping) return;
    const userMsg = input.trim();
    addJineMessage({ id: Date.now(), text: userMsg, sender: 'user' });
    setInput('');
    playJineSendSound();
    
    setIsAiTyping(true);
    
    try {
      const { fetchAIChat } = await import('./utils/ai');
      const response = await fetchAIChat(userMsg, jineMessages, petState);
      
      const audio = new Audio('/assets/audio/jine_send_stamp.wav');
      audio.play().catch(()=>{});
      addJineMessage({ id: Date.now() + 1, text: response, sender: 'ame' });
    } catch (error) {
      addJineMessage({ id: Date.now() + 1, text: `[시스템 에러] ${error.message}`, sender: 'ame' });
    } finally {
      setIsAiTyping(false);
    }
  };

  const handleTransform = () => {
    playExecuteSound();
    playTransformSound();
    setPetState('transforming');
  };

  const getDayOfYear = () => {
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 0);
    const diff = now - start;
    const oneDay = 1000 * 60 * 60 * 24;
    return Math.floor(diff / oneDay);
  };

  if (isBooting) {
    return <BootScreen />;
  }

  return (
    <div className="desktop" style={{ transform: 'scale(0.7)', transformOrigin: 'top left', width: '142.85vw', height: '142.85vh' }}>
      {/* Desktop Icons */}
      <div className="desktop-icons">
        <div className="icon" onClick={() => { playOpenSound(); openWindow('ameCam'); }}>
          <img src="/assets/images/icons/ame.png" alt="icon" style={{width: 60, height: 60}}/><br/>Ame
        </div>
        <div className="icon" onClick={() => { playOpenSound(); openWindow('jine'); }}>
          <img src="/assets/images/icons/jine.png" alt="icon" style={{width: 60, height: 60}}/><br/>JINE
        </div>
        <div className="icon" onClick={() => { playOpenSound(); openWindow('status'); }}>
          <img src="/assets/images/icons/task.png" alt="icon" style={{width: 60, height: 60}}/><br/>Task Manager
        </div>
        {settings.directorEnabled && (
          <div className="icon" onClick={() => { playOpenSound(); openWindow('director'); }}>
            <img src="/assets/images/icons/calendar.png" alt="icon" style={{width: 60, height: 60}}/><br/>Director
          </div>
        )}
        <div className="icon" onClick={() => { playOpenSound(); openWindow('notepad'); }}>
          <img src="/assets/images/icons/text.png" alt="icon" style={{width: 60, height: 60, imageRendering: 'pixelated' }}/><br/>Notepad
        </div>
        <div className="icon" onClick={() => { playOpenSound(); openWindow('settings'); }}>
          <img src="/assets/images/jine/button_gear.png" alt="icon" style={{width: 60, height: 60, imageRendering: 'pixelated' }}/><br/>Settings
        </div>
      </div>

      {/* Ame Webcam Window */}
      {windows.ameCam.isOpen && (
        <Rnd
          scale={0.7}
          bounds="parent"
          default={{ x: 10, y: 10, width: 387, height: 350 }}
          style={{ zIndex: windows.ameCam.zIndex }}
          onMouseDown={() => focusWindow('ameCam')}
          enableResizing={false}
          dragHandleClassName="window-drag-area"
          className="os-window ame-window"
        >
          <img src="/assets/images/border/window-ame.png" className="ame-window-bg" alt="border" onError={(e) => { e.target.src = '/assets/images/border/window-jinebig.png' }} />
          <div className="window-drag-area"></div>
          {/* Window Title */}
          <div className="window-title-text">■ webcam</div>
          <button className="window-close-btn" style={{ right: '12px', top: '14px' }} onClick={() => { playCloseSound(); if (petState.startsWith('transforming')) { stopTransformSound(); setPetState('idle'); } closeWindow('ameCam'); }}></button>
          <div className="window-content ame-content">
            <AnimatedPet />
            {petState === 'idle' && (
              <button className="transform-btn" onClick={handleTransform}>
                on Air
              </button>
            )}
            {petState === 'kangel' && (
              <button className="transform-btn revert-btn" onClick={() => { playEndHaishinSound(); stopTransformSound(); setPetState('idle'); }}>
                off Air
              </button>
            )}
          </div>
        </Rnd>
      )}

      {/* JINE Window */}
      {windows.jine.isOpen && (
        <Rnd
          scale={0.7}
          bounds="parent"
          default={{ x: 20, y: 20, width: 342, height: 500 }}
          style={{ zIndex: windows.jine.zIndex }}
          onMouseDown={() => focusWindow('jine')}
          enableResizing={false}
          dragHandleClassName="window-drag-area"
          className="os-window jine-window"
        >
          <div className="window-drag-area"></div>
          {/* Window Title */}
          <div className="window-title-text">■ JINE</div>
          <button className="window-close-btn" style={{ right: '12px', top: '14px' }} onClick={() => { playCloseSound(); closeWindow('jine'); }}></button>
          <div className="window-content jine-content">
            <div className="jine-chat">
              {jineMessages && jineMessages.map(msg => (
                <div key={msg.id} className={`jine-bubble ${msg.sender}`}>
                  {msg.text}
                </div>
              ))}
              {isAiTyping && (
                <div className="jine-bubble ame" style={{ fontStyle: 'italic', opacity: 0.7 }}>
                  입력 중...
                </div>
              )}
            </div>
            <div className="jine-input">
              <input 
                type="text" 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              />
              <button onClick={handleSend}>전송</button>
            </div>
          </div>
        </Rnd>
      )}

      {/* Settings Window */}
      {windows.settings.isOpen && (
        <Rnd
          scale={0.7}
          bounds="parent"
          default={{ x: 30, y: 30, width: 342, height: 500 }}
          style={{ zIndex: windows.settings.zIndex }}
          onMouseDown={() => focusWindow('settings')}
          enableResizing={false}
          dragHandleClassName="window-drag-area"
          className="os-window jine-window"
        >
          <div className="window-drag-area"></div>
          {/* Window Title */}
          <div className="window-title-text">■ Settings</div>
          <button className="window-close-btn" style={{ right: '12px', top: '14px' }} onClick={() => { playCloseSound(); closeWindow('settings'); }}></button>
          
          <div className="window-content jine-content settings-content-wrapper">
            <SettingsApp />
          </div>
        </Rnd>
      )}

      {/* Notepad Window */}
      {windows.notepad && windows.notepad.isOpen && (
        <Rnd
          scale={0.7}
          bounds="parent"
          default={{ x: 40, y: 40, width: 400, height: 400 }}
          style={{ zIndex: windows.notepad.zIndex, backgroundColor: '#fff', border: '2px solid #dfdfdf', borderTopColor: '#fff', borderLeftColor: '#fff', borderRightColor: '#000', borderBottomColor: '#000' }}
          onMouseDown={() => focusWindow('notepad')}
          enableResizing={true}
          dragHandleClassName="window-drag-area"
          className="os-window"
        >
          {/* Classic Windows Title Bar */}
          <div className="window-drag-area" style={{ backgroundColor: '#000080', height: '24px', width: '100%', position: 'relative' }}>
            <span style={{ color: '#fff', marginLeft: '5px', fontSize: '12px', lineHeight: '24px', fontFamily: 'DinkieBitmap, sans-serif' }}>Notepad</span>
            <button 
              className="cancel"
              style={{ position: 'absolute', right: '2px', top: '2px', width: '20px', height: '20px', backgroundColor: '#dfdfdf', border: '1px solid #fff', borderBottomColor: '#000', borderRightColor: '#000', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px' }}
              onClick={() => { playCloseSound(); closeWindow('notepad'); }}
              onTouchEnd={(e) => { e.stopPropagation(); playCloseSound(); closeWindow('notepad'); }}
            >
              X
            </button>
          </div>
          
          <div className="window-content" style={{ height: 'calc(100% - 24px)', boxSizing: 'border-box' }}>
            <NotepadApp />
          </div>
        </Rnd>
      )}

      {/* Status (Task Manager) Window */}
      {windows.status.isOpen && (
        <Rnd
          scale={0.7}
          bounds="parent"
          default={{ x: 50, y: 50, width: 350, height: 280 }}
          style={{ zIndex: windows.status.zIndex }}
          onMouseDown={() => focusWindow('status')}
          enableResizing={false}
          dragHandleClassName="window-drag-area"
          className="os-window task-manager-window"
        >
          <img src="/assets/images/task_manager/window.png" className="task-manager-bg" alt="Task Manager Border" onError={(e) => { e.target.style.display = 'none'; e.target.parentNode.style.backgroundColor = '#fff'; e.target.parentNode.style.border = '2px solid #dfdfdf'; }} />
          <div className="window-drag-area"></div>
          {/* Window Title */}
          <div className="window-title-text" style={{ color: '#fff', top: '4px' }}>■ 작업 관리자</div>
          {/* Close button relative to Task Manager layout */}
          <button className="window-close-btn" style={{ right: '10px', top: '4px' }} onClick={() => { playCloseSound(); closeWindow('status'); }}></button>
          
          <div className="window-content task-manager-content">
            {/* Date (replaces Followers) */}
            <div className="status-row">
              <img src="/assets/images/task_manager/icon_status_follower.png" alt="Date" className="status-icon" />
              <div className="status-info" style={{ flex: 1 }}>
                <div className="status-label">DAY {getDayOfYear()}</div>
                <div className="status-value" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', fontSize: '18px' }}>
                  {new Date().toLocaleDateString('ko-KR', { year: '2-digit', month: 'numeric', day: 'numeric' }).replace(/\./g, '/').replace(/ /g, '').replace(/\/$/, '')} ({['SUN','MON','TUE','WED','THU','FRI','SAT'][new Date().getDay()]})
                </div>
              </div>
            </div>
            {/* Volume */}
            <div className="status-row">
              <img src="/assets/images/task_manager/icon_status_stress.png" alt="Volume" className="status-icon" />
              <div className="status-info" style={{ flex: 1 }}>
                <div className="status-label">BGM Vol</div>
                <div className="status-value" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                  <div>{settings.volume}<span className="status-slash">/100</span></div>
                  <div 
                    className="progress-bar-container" 
                    style={{ cursor: 'pointer' }}
                    onMouseDown={(e) => {
                      const rect = e.currentTarget.getBoundingClientRect();
                      const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
                      const newVolume = Math.round((x / rect.width) * 100);
                      updateSettings({ volume: newVolume });
                      
                      const onMouseMove = (moveEvent) => {
                        const moveX = Math.max(0, Math.min(moveEvent.clientX - rect.left, rect.width));
                        updateSettings({ volume: Math.round((moveX / rect.width) * 100) });
                      };
                      const onMouseUp = () => {
                        window.removeEventListener('mousemove', onMouseMove);
                        window.removeEventListener('mouseup', onMouseUp);
                      };
                      window.addEventListener('mousemove', onMouseMove);
                      window.addEventListener('mouseup', onMouseUp);
                    }}
                    onTouchStart={(e) => {
                      const rect = e.currentTarget.getBoundingClientRect();
                      const touch = e.touches[0];
                      const x = Math.max(0, Math.min(touch.clientX - rect.left, rect.width));
                      updateSettings({ volume: Math.round((x / rect.width) * 100) });
                      
                      const onTouchMove = (moveEvent) => {
                        const moveTouch = moveEvent.touches[0];
                        const moveX = Math.max(0, Math.min(moveTouch.clientX - rect.left, rect.width));
                        updateSettings({ volume: Math.round((moveX / rect.width) * 100) });
                      };
                      const onTouchEnd = () => {
                        window.removeEventListener('touchmove', onTouchMove);
                        window.removeEventListener('touchend', onTouchEnd);
                      };
                      window.addEventListener('touchmove', onTouchMove);
                      window.addEventListener('touchend', onTouchEnd);
                    }}
                  >
                    <div className="progress-bar-fill stress-fill" style={{ width: `${settings.volume}%` }}></div>
                  </div>
                </div>
              </div>
            </div>
            {/* SFX Volume */}
            <div className="status-row">
              <img src="/assets/images/task_manager/icon_status_love.png" alt="SFX Volume" className="status-icon" />
              <div className="status-info" style={{ flex: 1 }}>
                <div className="status-label">SFX Vol</div>
                <div className="status-value" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                  <div>{settings.sfxVolume}<span className="status-slash">/100</span></div>
                  <div 
                    className="progress-bar-container" 
                    style={{ cursor: 'pointer' }}
                    onMouseDown={(e) => {
                      const rect = e.currentTarget.getBoundingClientRect();
                      const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
                      const newVolume = Math.round((x / rect.width) * 100);
                      updateSettings({ sfxVolume: newVolume });
                      
                      const onMouseMove = (moveEvent) => {
                        const moveX = Math.max(0, Math.min(moveEvent.clientX - rect.left, rect.width));
                        updateSettings({ sfxVolume: Math.round((moveX / rect.width) * 100) });
                      };
                      const onMouseUp = () => {
                        window.removeEventListener('mousemove', onMouseMove);
                        window.removeEventListener('mouseup', onMouseUp);
                      };
                      window.addEventListener('mousemove', onMouseMove);
                      window.addEventListener('mouseup', onMouseUp);
                    }}
                    onTouchStart={(e) => {
                      const rect = e.currentTarget.getBoundingClientRect();
                      const touch = e.touches[0];
                      const x = Math.max(0, Math.min(touch.clientX - rect.left, rect.width));
                      updateSettings({ sfxVolume: Math.round((x / rect.width) * 100) });
                      
                      const onTouchMove = (moveEvent) => {
                        const moveTouch = moveEvent.touches[0];
                        const moveX = Math.max(0, Math.min(moveTouch.clientX - rect.left, rect.width));
                        updateSettings({ sfxVolume: Math.round((moveX / rect.width) * 100) });
                      };
                      const onTouchEnd = () => {
                        window.removeEventListener('touchmove', onTouchMove);
                        window.removeEventListener('touchend', onTouchEnd);
                      };
                      window.addEventListener('touchmove', onTouchMove);
                      window.addEventListener('touchend', onTouchEnd);
                    }}
                  >
                    <div className="progress-bar-fill affection-fill" style={{ width: `${settings.sfxVolume}%` }}></div>
                  </div>
                </div>
              </div>
            </div>
            {/* Darkness */}
            <div className="status-row">
              <img src="/assets/images/task_manager/icon_status_yami.png" alt="Darkness" className="status-icon" />
              <div className="status-info" style={{ flex: 1 }}>
                <div className="status-label">Darkness</div>
                <div className="status-value" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                  <div>50<span className="status-slash">/100</span></div>
                  <div className="progress-bar-container"><div className="progress-bar-fill darkness-fill" style={{ width: '50%' }}></div></div>
                </div>
              </div>
            </div>
          </div>
        </Rnd>
      )}

      {/* Director Window */}
      {windows.director.isOpen && (
        <Rnd
          scale={0.7}
          bounds="parent"
          default={{ x: 60, y: 60, width: 400, height: 500 }}
          style={{ zIndex: windows.director.zIndex }}
          onMouseDown={() => focusWindow('director')}
          enableResizing={false}
          dragHandleClassName="window-drag-area"
          className="os-window director-window"
        >
          <img src="/assets/images/border/window-jinebig.png" className="director-bg" alt="director-bg" style={{ width: '100%', height: '100%', objectFit: 'fill' }} />
          <div className="window-drag-area" style={{ background: 'transparent', height: '24px' }}></div>
          {/* Window Title */}
          <div className="window-title-text" style={{ color: '#fff', top: '4px', left: '10px' }}>모션 디렉터</div>
          <button className="window-close-btn" style={{ right: '6px', top: '4px', color: '#fff' }} onClick={() => { playCloseSound(); closeWindow('director'); }}></button>
          
          <div className="director-content">
            <h3 style={{ margin: '0 0 10px 0', fontSize: '16px', color: '#a372f5', background: 'rgba(255,255,255,0.7)', padding: '5px' }}>
              {petState === 'idle' ? '아메쨩 모션' : petState === 'kangel' ? '초텐쨩 모션' : '대기 중'}
            </h3>
            
            {petState.startsWith('transforming') ? (
              <div style={{ padding: '20px', textAlign: 'center', color: '#666' }}>
                <p>변신 중입니다...</p>
                <p>조작할 수 없습니다.</p>
                <button 
                  className="retro-btn" 
                  style={{ marginTop: '15px', color: '#000' }}
                  onClick={() => { stopTransformSound(); setPetState('kangel'); }}
                >
                  변신 스킵
                </button>
              </div>
            ) : (
              <div className="motion-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                {(petState === 'idle' ? AME_MOTIONS : KANGEL_MOTIONS).map(motion => (
                  <button 
                    key={motion.path}
                    className={`retro-btn ${petAction === motion.path ? 'active' : ''}`}
                    onClick={() => {
                      playExecuteSound();
                      if (motion.path === 'transformation_dark') {
                        playTransformSound();
                        setPetState('transforming_dark');
                      } else {
                        setPetAction(motion.path);
                      }
                    }}
                  >
                    {motion.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </Rnd>
      )}
    </div>
  );
}
