import React, { useEffect, useState } from 'react';
import { Rnd } from 'react-rnd';
import useAppStore from './store/useAppStore';
import AnimatedPet from './components/AnimatedPet';
import './index.css';

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
    messages, addMessage,
    petState, setPetState
  } = useAppStore();

  const [input, setInput] = useState('');

  // Start BGM after boot
  useEffect(() => {
    if (!isBooting) {
      const bgm = new Audio('/assets/audio/bgm.wav');
      bgm.loop = true;
      bgm.volume = 0.3;
      bgm.play().catch(() => {});
      return () => { bgm.pause(); };
    }
  }, [isBooting]);

  const handleSend = () => {
    if (!input.trim()) return;
    addMessage({ id: Date.now(), text: input, sender: 'user' });
    setInput('');
    const audio = new Audio('/assets/audio/jine_send_stamp.wav');
    audio.play().catch(()=>{});
    setTimeout(() => {
      addMessage({ id: Date.now() + 1, text: "알았어!", sender: 'ame' });
    }, 1000);
  };

  const handleTransform = () => {
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
    <div className="desktop">
      {/* Desktop Icons */}
      <div className="desktop-icons">
        <div className="icon" onClick={() => openWindow('ameCam')}>
          <img src="/assets/images/icons/ame.png" alt="icon" style={{width: 60, height: 60}}/><br/>Ame
        </div>
        <div className="icon" onClick={() => openWindow('jine')}>
          <img src="/assets/images/icons/jine.png" alt="icon" style={{width: 60, height: 60}}/><br/>JINE
        </div>
        <div className="icon" onClick={() => openWindow('status')}>
          <img src="/assets/images/icons/task.png" alt="icon" style={{width: 60, height: 60}}/><br/>Task Manager
        </div>
      </div>

      {/* Ame Webcam Window */}
      {windows.ameCam.isOpen && (
        <Rnd
          default={{ x: 50, y: 50, width: 387, height: 350 }}
          style={{ zIndex: windows.ameCam.zIndex }}
          onMouseDown={() => focusWindow('ameCam')}
          enableResizing={false}
          className="os-window ame-window"
        >
          <img src="/assets/images/border/window-ame.png" className="ame-window-bg" alt="border" onError={(e) => { e.target.src = '/assets/images/border/window-jinebig.png' }} />
          <div className="window-drag-area"></div>
          {/* Window Title */}
          <div className="window-title-text">■ webcam</div>
          <button className="window-close-btn" style={{ right: '5px', top: '5px' }} onClick={() => closeWindow('ameCam')}></button>
          <div className="window-content ame-content">
            <AnimatedPet />
            {petState !== 'kangel' && petState !== 'transforming' && (
              <button className="transform-btn" onClick={handleTransform}>
                on Air
              </button>
            )}
            {petState === 'kangel' && (
              <button className="transform-btn revert-btn" onClick={() => setPetState('idle')}>
                off Air
              </button>
            )}
          </div>
        </Rnd>
      )}

      {/* JINE Window */}
      {windows.jine.isOpen && (
        <Rnd
          default={{ x: 600, y: 50, width: 342, height: 500 }}
          style={{ zIndex: windows.jine.zIndex }}
          onMouseDown={() => focusWindow('jine')}
          enableResizing={false}
          className="os-window jine-window"
        >
          <div className="window-drag-area"></div>
          {/* Window Title */}
          <div className="window-title-text">■ JINE</div>
          <button className="window-close-btn" style={{ right: '5px', top: '5px' }} onClick={() => closeWindow('jine')}></button>
          <div className="window-content jine-content">
            <div className="jine-chat">
              {messages.map(msg => (
                <div key={msg.id} className={`jine-bubble ${msg.sender}`}>
                  {msg.text}
                </div>
              ))}
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

      {/* Status (Task Manager) Window */}
      {windows.status.isOpen && (
        <Rnd
          default={{ x: 950, y: 50, width: 350, height: 280 }}
          style={{ zIndex: windows.status.zIndex }}
          onMouseDown={() => focusWindow('status')}
          enableResizing={false}
          className="os-window task-manager-window"
        >
          <img src="/assets/images/task_manager/window.png" className="task-manager-bg" alt="Task Manager Border" onError={(e) => { e.target.style.display = 'none'; e.target.parentNode.style.backgroundColor = '#fff'; e.target.parentNode.style.border = '2px solid #dfdfdf'; }} />
          <div className="window-drag-area"></div>
          {/* Window Title */}
          <div className="window-title-text" style={{ color: '#fff', top: '4px' }}>■ 작업 관리자</div>
          {/* Close button relative to Task Manager layout */}
          <button className="window-close-btn" style={{ right: '5px', top: '5px' }} onClick={() => closeWindow('status')}></button>
          
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
            {/* Stress */}
            <div className="status-row">
              <img src="/assets/images/task_manager/icon_status_stress.png" alt="Stress" className="status-icon" />
              <div className="status-info" style={{ flex: 1 }}>
                <div className="status-label">Stress</div>
                <div className="status-value" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                  <div>50<span className="status-slash">/100</span></div>
                  <div className="progress-bar-container"><div className="progress-bar-fill stress-fill" style={{ width: '50%' }}></div></div>
                </div>
              </div>
            </div>
            {/* Affection */}
            <div className="status-row">
              <img src="/assets/images/task_manager/icon_status_love.png" alt="Affection" className="status-icon" />
              <div className="status-info" style={{ flex: 1 }}>
                <div className="status-label">Affection</div>
                <div className="status-value" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                  <div>50<span className="status-slash">/100</span></div>
                  <div className="progress-bar-container"><div className="progress-bar-fill affection-fill" style={{ width: '50%' }}></div></div>
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
    </div>
  );
}
