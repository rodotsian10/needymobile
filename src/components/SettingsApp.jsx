import React from 'react';
import useAppStore from '../store/useAppStore';

export default function SettingsApp() {
  const { settings, updateSettings } = useAppStore();

  const handleToggle = (key) => {
    updateSettings({ [key]: !settings[key] });
  };

  return (
    <div className="settings-container" >
      <h2 className="settings-title">시스템 설정</h2>
      
      <div className="settings-list" >
        
        {/* SFX Toggle */}
        <div className="setting-item" >
          <span>효과음 (SFX)</span>
          <button 
            className={`toggle-btn \${settings.sfxEnabled ? 'on' : 'off'}`}
            onClick={() => handleToggle('sfxEnabled')}
            
          >
            {settings.sfxEnabled ? 'ON' : 'OFF'}
          </button>
        </div>

        {/* BGM Toggle & Select */}
        <div className="setting-item col">
          <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
            <span>배경음악 (BGM)</span>
            <button 
              className={`toggle-btn ${settings.bgmEnabled ? 'on' : 'off'}`}
              onClick={() => handleToggle('bgmEnabled')}
            >
              {settings.bgmEnabled ? 'ON' : 'OFF'}
            </button>
          </div>
          <select 
            className="setting-input" 
            value={settings.bgmTrack}
            onChange={(e) => updateSettings({ bgmTrack: e.target.value })}
            style={{ marginTop: '5px', fontFamily: 'PixelMplus10' }}
          >
            <option value="19 Angel rests.mp3">19 Angel rests (디폴트)</option>
            <option value="bgmtest.wav">Needy Girl Overdose (메인)</option>
            <option value="event_happy.wav">Happy Event</option>
            <option value="event_kincho.wav">Tension Event</option>
            <option value="85.2.wav">85.2 (로파이)</option>
            <option value="desire.wav">Desire (인터넷 엔젤)</option>
          </select>
        </div>

        {/* Gemini API Key */}
        <div className="setting-item col">
          <span style={{ marginBottom: '5px' }}>JINE AI 채팅 API 키 (Gemini)</span>
          <input 
            type="password" 
            className="setting-input" 
            placeholder="AI Studio에서 발급받은 키 입력"
            value={settings.apiKey || ''}
            onChange={(e) => updateSettings({ apiKey: e.target.value })}
            style={{ width: '100%', boxSizing: 'border-box' }}
          />
        </div>

        {/* Director App Visible Toggle */}
        <div className="setting-item" >
          <span>디렉터 바탕화면 아이콘 표시</span>
          <button 
            className={`toggle-btn ${settings.directorEnabled ? 'on' : 'off'}`}
            onClick={() => handleToggle('directorEnabled')}
            
          >
            {settings.directorEnabled ? 'ON' : 'OFF'}
          </button>
        </div>

        {/* Auto Motion Toggle */}
        <div className="setting-item" >
          <span>모션 자동변경</span>
          <button 
            className={`toggle-btn \${settings.autoMotionEnabled ? 'on' : 'off'}`}
            onClick={() => handleToggle('autoMotionEnabled')}
            
          >
            {settings.autoMotionEnabled ? 'ON' : 'OFF'}
          </button>
        </div>

        {/* API Key Input */}
        <div className="setting-item col">
          <span>JINE API Key (OpenAI)</span>
          <input 
            type="password" 
            placeholder="sk-..." 
            className="setting-input"
          />
        </div>

      </div>
    </div>
  );
}
