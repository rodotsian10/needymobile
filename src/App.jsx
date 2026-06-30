import React, { useEffect, useState, useRef } from 'react';
import { Rnd } from 'react-rnd';
import useAppStore from './store/useAppStore';
import AnimatedPet from './components/AnimatedPet';
import SettingsApp from './components/SettingsApp';
import NotepadApp from './components/NotepadApp';
import MusicApp from './components/MusicApp';
import './index.css';
import { playOpenSound, playCloseSound, playExecuteSound, playJineSendSound, playTransformSound, stopTransformSound, playEndHaishinSound } from './utils/audio';
import { Capacitor } from '@capacitor/core';
import { PushNotifications } from '@capacitor/push-notifications';

// Module-level flag: persists across StrictMode remounts, ensuring boot audio plays only once
let _bootAudioStarted = false;

const BootScreen = () => {
  const { finishBoot } = useAppStore();
  const [text, setText] = useState('');
  const audioRef = useRef(null);
  const finishedTypingRef = useRef(false);
  
  useEffect(() => {
    // Module-level flag prevents double-play in React StrictMode (which remounts components in dev)
    if (!_bootAudioStarted) {
      _bootAudioStarted = true;
      const audio = new Audio('/assets/audio/boot.wav');
      audioRef.current = audio;

      // Wait for audio to fully finish before transitioning
      audio.addEventListener('ended', () => {
        if (finishedTypingRef.current) {
          finishBoot();
        } else {
          finishedTypingRef.current = 'audio_done';
        }
      });

      audio.play().catch(() => {
        // Autoplay blocked: fall through to typing-based finish
        finishedTypingRef.current = 'audio_done';
      });
    }

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
        // Typing done — only finish if audio is also done
        if (finishedTypingRef.current === 'audio_done') {
          finishBoot();
        } else {
          finishedTypingRef.current = true;
        }
      }
    }, 600);

    return () => {
      clearInterval(interval);
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
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
    notificationQueue, addNotifications, popNotification,
    petState, petAction, setPetState, setPetAction, settings, updateSettings,
    isMusicPlaying } = useAppStore();

  const swRef = useRef(null);

  const [input, setInput] = useState('');
  const [isAiTyping, setIsAiTyping] = useState(false);
  const [isAiResponding, setIsAiResponding] = useState(false); // true from first AI reply until last message shown
  const [isCooldown, setIsCooldown] = useState(false);
  const [jineTypingTimeout, setJineTypingTimeout] = useState(null);
  const prevJineActionRef = useRef(null);
  const jineChatRef = useRef(null);
  const anxietyStreakRef = useRef(0); // Tracks consecutive anxiety/negative emotions
  const currentEmotionActionRef = useRef(null); // Tracks which motion is active during AI response
  const isSendingRef = useRef(false); // Synchronous lock for handleSend

  // Maps emotion string from AI to petAction path
  const getEmotionAction = (emotion) => {
    const menheraMode = settings.menheraMode;
    if (!emotion) return null;
    if (menheraMode) {
      // 멘헤라 모드: 행복→평온(호감도 최고), 불안→불안(죽은 눈), 짜증→짜증(죽은 눈), 역거움→구토
      const map = { '행복': '0/2/0/0', '불안': '1/0/2/0', '짜증': '1/0/2/1', '역거움': '1/-1/-1/1' };
      return map[emotion] || null;
    } else {
      // 일반 모드: 웃음→기분좋음(호감도 보통), 불안→불안(호감도 보통), 호감→평온(호감도 보통), 우울→짜증(화냄)
      const map = { '웃음': '0/1/0/1', '불안': '1/1/0/0', '호감': '0/1/0/0', '우울': '1/0/0/1' };
      return map[emotion] || null;
    }
  };

  // AI response motion for Ame: persists until isAiTyping ends
  // Tracks consecutive negative emotions → triggers 구토 at streak >= 3
  const triggerAmeEmotionMotion = (emotion) => {
    if (!settings.autoMotionEnabled || petState !== 'idle') return;

    // Track anxiety/negative streak
    const isNegative = ['불안', '우울', '짜증', '역거움'].includes(emotion);
    if (isNegative) {
      anxietyStreakRef.current += 1;
    } else {
      anxietyStreakRef.current = 0;
    }

    // Trigger vomit if anxiety streak reaches 3+
    let action;
    if (anxietyStreakRef.current >= 3) {
      action = '1/-1/-1/1'; // 구토 (vomit)
    } else {
      action = getEmotionAction(emotion);
    }

    if (!action) return;
    currentEmotionActionRef.current = action;
    setPetAction(action);
    // Motion will revert in the isAiTyping useEffect when AI finishes
  };

  // Kangel AI response motion: show phone typing, persists until AI done
  const triggerKangelChatMotion = () => {
    if (!settings.autoMotionEnabled || petState !== 'kangel') return;
    prevJineActionRef.current = prevJineActionRef.current || petAction;
    setPetAction('stream/56/0');
    currentEmotionActionRef.current = 'stream/56/0';
    // Motion will revert in the isAiTyping useEffect when AI finishes
  };

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
    { label: '멘붕 (방송사고)', path: 'stream/_dame/b/0' },
    { label: '핸드폰', path: 'stream/56/0' },
    { label: '어흥', path: 'stream/22/0' },
    { label: '손가락물고하트', path: 'stream/24/0' },
    { label: '츄~', path: 'stream/24/1' }
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
    
    const isTransforming = petState === 'transforming' || petState === 'transforming_dark';
    
    if (settings.bgmEnabled && !isTransforming) {
      bgmRef.current.play().catch(() => {});
    } else {
      bgmRef.current.pause();
    }
  }, [settings.bgmEnabled, settings.volume, petState]);

    useEffect(() => {
    if (petState === 'kangel' || petState === 'idle') {
      stopTransformSound();
    }
  }, [petState]);

  useEffect(() => {
    document.documentElement.style.setProperty('--window-scale', (settings.windowScale || 100) / 100);
  }, [settings.windowScale]);

  // Music listening motion: headphone for Ame, ASMR for Kangel
  useEffect(() => {
    if (!settings.autoMotionEnabled) return;
    const isTypingActive = jineTypingTimeout !== null;
    if (isTypingActive) return; // Chat motion takes priority

    if (isMusicPlaying) {
      if (petState === 'idle') {
        setPetAction('-1/-1/-1/0'); // Headphone (music)
      } else if (petState === 'kangel') {
        setPetAction('stream/7/0'); // ASMR (whisper)
      }
    } else {
      // Music stopped - revert to base
      if (petState === 'idle') {
        setPetAction('0/0/0/0');
      } else if (petState === 'kangel') {
        setPetAction('stream/0/0');
      }
    }
  }, [isMusicPlaying]);

  // When ALL AI messages are displayed, revert emotion motion back to base / music motion
  useEffect(() => {
    if (isAiResponding) return; // Still showing messages
    if (!currentEmotionActionRef.current) return; // No emotion motion was active
    currentEmotionActionRef.current = null;

    if (petState === 'idle') {
      if (isMusicPlaying) {
        setPetAction('-1/-1/-1/0');
      } else {
        setPetAction('0/0/0/0');
      }
    } else if (petState === 'kangel') {
      if (isMusicPlaying) {
        setPetAction('stream/7/0');
      } else {
        setPetAction(prevJineActionRef.current || 'stream/0/0');
        prevJineActionRef.current = null;
      }
    }
  }, [isAiResponding]);

  useEffect(() => {
    if (jineChatRef.current) {
      jineChatRef.current.scrollTop = jineChatRef.current.scrollHeight;
    }
  }, [jineMessages, isAiTyping, windows.jine.isOpen]);

  // ── Service Worker Registration ──────────────────────────────────
  useEffect(() => {
    if (!isBooting && 'serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js')
        .then(reg => {
          swRef.current = reg;
          console.log('[SW] 등록 성공');
        })
        .catch(err => console.warn('[SW] 등록 실패:', err));
    }
  }, [isBooting]);

  // ── (Removed harmful JS scroll lock here) ──────────────────────

  // ── Global interaction listener for Mobile BGM Autoplay ──────────
  useEffect(() => {
    const handleInteraction = () => {
      if (bgmRef.current && bgmRef.current.paused && settings.bgmEnabled && !isBooting && petState !== 'transforming' && petState !== 'transforming_dark') {
        bgmRef.current.play().catch(() => {});
      }
    };
    window.addEventListener('click', handleInteraction, { once: true });
    window.addEventListener('touchstart', handleInteraction, { once: true });
    return () => {
      window.removeEventListener('click', handleInteraction);
      window.removeEventListener('touchstart', handleInteraction);
    };
  }, [settings.bgmEnabled, isBooting, petState]);

  // ── BGM: pause when hidden, resume when visible ──────────────────
  useEffect(() => {
    const handleVisibility = () => {
      if (!bgmRef.current) return;
      if (document.hidden) {
        bgmRef.current.pause();
      } else {
        if (settings.bgmEnabled) bgmRef.current.play().catch(() => {});
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, [settings.bgmEnabled]);

  // ── Notification Queue: refill when low and online ───────────────
  useEffect(() => {
    if (isBooting || !settings.apiKey) return;
    if (notificationQueue.length < 10 && navigator.onLine) {
      const fetchCount = 20 - notificationQueue.length;
      import('./utils/ai').then(({ fetchAiNotification }) => {
        fetchAiNotification(settings.menheraMode, settings.apiKey, settings.apiProvider, fetchCount)
          .then(lines => {
            if (lines.length > 0) addNotifications(lines);
          });
      });
    }
  }, [isBooting, settings.apiKey]);

  // ── Schedule away-notification when user leaves the app ──────────
  useEffect(() => {
    let poppedMsg = null;

    const handleAwayNotification = () => {
      if (document.hidden) {
        const currentSettings = useAppStore.getState().settings;
        if (!currentSettings.notificationsEnabled) return;

        const queue = useAppStore.getState().notificationQueue;
        const fallback = currentSettings.menheraMode
          ? '피짱 어디야ㅠ 왜 안와 나 버린거야'
          : '피짱~ 나 보고싶지 않아? 빨리 들어와ㅠ';
        
        const isMenhera = currentSettings.menheraMode;
        const intervalMs = isMenhera ? 10 * 60 * 1000 : 60 * 60 * 1000; // 10분 or 1시간

        if (Capacitor.isNativePlatform()) {
          import('@capacitor/local-notifications').then(({ LocalNotifications }) => {
            LocalNotifications.createChannel({
              id: 'ame-jine-channel',
              name: 'Ame Jine Notifications',
              description: 'Notifications from Ame',
              importance: 5,
              visibility: 1
            }).catch(() => {});

            const notifsToSchedule = [];
            for (let i = 1; i <= 10; i++) {
              const qMsg = queue.length > i - 1 ? queue[i - 1] : fallback;
              notifsToSchedule.push({
                title: '아메쨩 💌',
                body: qMsg,
                id: 9990 + i, // 9991 ~ 10000
                schedule: { at: new Date(Date.now() + intervalMs * i) },
                smallIcon: 'ic_launcher',
                channelId: 'ame-jine-channel'
              });
            }

            LocalNotifications.schedule({
              notifications: notifsToSchedule
            });
          });
        } else {
          // Web fallback (only schedules 1 for simplicity)
          poppedMsg = queue.length > 0 ? queue[0] : null;
          const msg = poppedMsg || fallback;
          if (poppedMsg) useAppStore.getState().popNotification();

          const sw = swRef.current;
          if (sw && sw.active) {
            sw.active.postMessage({
              type: 'SCHEDULE_NOTIFICATION',
              delayMs: intervalMs,
              title: '아메쨩 💌',
              body: msg,
              tag: 'ame-away'
            });
          }
        }
      } else {
        // Cancel the scheduled notifications because user came back early
        if (Capacitor.isNativePlatform()) {
          import('@capacitor/local-notifications').then(({ LocalNotifications }) => {
            const idsToCancel = [];
            for (let i = 1; i <= 10; i++) {
              idsToCancel.push({ id: 9990 + i });
            }
            LocalNotifications.cancel({ notifications: idsToCancel });
          });
        } else {
          const sw = swRef.current;
          if (sw && sw.active) {
            sw.active.postMessage({
              type: 'CANCEL_NOTIFICATION',
              tag: 'ame-away'
            });
          }
        }
        
        // Put the message back into the queue for web fallback
        if (poppedMsg) {
          useAppStore.getState().unshiftNotification(poppedMsg);
          poppedMsg = null;
        }
      }
    };

    document.addEventListener('visibilitychange', handleAwayNotification);
    return () => document.removeEventListener('visibilitychange', handleAwayNotification);
  }, []);

  const handleSend = async () => {
    // Check both React state (for UI) and synchronous ref (for double-click/Enter spam)
    if (!input.trim() || isAiResponding || isCooldown || isSendingRef.current) return;
    
    isSendingRef.current = true; // Synchronous lock immediately
    
    const userMsg = input.trim();
    addJineMessage({ id: Date.now(), text: userMsg, sender: 'user' });
    setInput('');
    playJineSendSound();
    
    setIsAiTyping(true);
    setIsAiResponding(true);
    setIsCooldown(true);
    setTimeout(() => {
      setIsCooldown(false);
    }, 4000);
    
    try {
      const { fetchAIChat } = await import('./utils/ai');
      const { text: response, emotion } = await fetchAIChat(userMsg, jineMessages, petState);
      
      // Trigger motion when AI starts responding
      if (petState === 'idle') {
        triggerAmeEmotionMotion(emotion);
      } else if (petState === 'kangel') {
        triggerKangelChatMotion();
      }
      
      const lines = response.split('\n').map(line => line.trim()).filter(line => line.length > 0);
      
      for (let i = 0; i < lines.length; i++) {
        setIsAiTyping(true);
        const delay = Math.min(2000, 500 + lines[i].length * 50);
        if (i > 0) {
          await new Promise(r => setTimeout(r, delay));
        } else {
          await new Promise(r => setTimeout(r, 500));
        }
        
        setIsAiTyping(false);
        const audio = new Audio('/assets/audio/jine_send_stamp.wav');
        audio.play().catch(()=>{});
        addJineMessage({ id: Date.now() + Math.random(), text: lines[i], sender: 'ame' });
        if (i < lines.length - 1) {
          await new Promise(r => setTimeout(r, 300));
        }
      }
    } catch (error) {
      addJineMessage({ id: Date.now() + 1, text: error.message, sender: 'ame' });
    } finally {
      setIsAiTyping(false);
      setIsAiResponding(false); // All messages shown → trigger motion revert
      isSendingRef.current = false; // Release synchronous lock
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
    <div className="desktop" style={{ transform: 'scale(0.7)', transformOrigin: 'top left', width: '142.85vw', height: 'max(142.85vh, 142.85lvh)' }}>
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
        <div className="icon" onClick={() => { playOpenSound(); openWindow('music'); }}>
          <img src="/assets/images/icons/media.png" alt="icon" style={{width: 60, height: 60, imageRendering: 'pixelated' }}/><br/>Media
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
            <div className="jine-chat" ref={jineChatRef}>
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
                onChange={(e) => { setInput(e.target.value); handleJineTyping(); }}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                disabled={isCooldown}
                placeholder={isCooldown ? "잠시 대기 중..." : ""}
              />
              <button onClick={handleSend} disabled={isCooldown}>전송</button>
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
          default={{ x: 40, y: 40, width: 400, height: 440 }}
          style={{ zIndex: windows.notepad.zIndex }}
          onMouseDown={() => focusWindow('notepad')}
          enableResizing={false}
          dragHandleClassName="window-drag-area"
          className="os-window"
        >
          <img src="/assets/images/border/window-jinebig.png" alt="bg" style={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0, zIndex: -1, pointerEvents: 'none', objectFit: 'fill' }} />
          <div className="window-drag-area" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '24px', cursor: 'pointer' }}></div>
          
          {/* Title */}
          <div style={{ position: 'absolute', top: '4px', left: '10px', color: '#fff', fontSize: '12px', fontFamily: 'DinkieBitmap, sans-serif' }}>Notepad</div>
          <button 
            className="window-close-btn" 
            style={{ right: '12px', top: '14px' }} 
            onClick={() => { playCloseSound(); closeWindow('notepad'); }}
            onTouchEnd={(e) => { e.stopPropagation(); playCloseSound(); closeWindow('notepad'); }}
          ></button>
          
          {/* Content Area */}
          <div style={{ position: 'absolute', top: '30px', left: '8px', right: '8px', bottom: '8px', backgroundColor: '#dfdfdf', overflow: 'hidden', padding: '0px' }}>
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

      {/* Music App Window */}
      <MusicApp />
    </div>
  );
}
