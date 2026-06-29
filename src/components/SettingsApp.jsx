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

        {/* BGM Toggle */}
        <div className="setting-item" >
          <span>배경음악 (BGM)</span>
          <button 
            className={`toggle-btn \${settings.bgmEnabled ? 'on' : 'off'}`}
            onClick={() => handleToggle('bgmEnabled')}
            
          >
            {settings.bgmEnabled ? 'ON' : 'OFF'}
          </button>
        </div>

        {/* Director App Visible Toggle */}
        <div className="setting-item" >
          <span>디렉터 바탕화면 아이콘 표시</span>
          <button 
            className={`toggle-btn \${settings.directorEnabled ? 'on' : 'off'}`}
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
