import React from 'react';
import useAppStore from '../store/useAppStore';

export default function SettingsApp() {
  const { settings, updateSettings } = useAppStore();

  const handleToggle = (key) => {
    updateSettings({ [key]: !settings[key] });
  };

  return (
    <div className="settings-container" style={{ padding: '20px', color: '#fff', height: '100%', boxSizing: 'border-box' }}>
      <h2 style={{ textAlign: 'center', marginBottom: '20px', textShadow: '2px 2px 0 #000' }}>시스템 설정</h2>
      
      <div className="settings-list" style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        
        {/* SFX Toggle */}
        <div className="setting-item" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>효과음 (SFX)</span>
          <button 
            className={`toggle-btn \${settings.sfxEnabled ? 'on' : 'off'}`}
            onClick={() => handleToggle('sfxEnabled')}
            style={{ padding: '5px 15px', background: settings.sfxEnabled ? '#ff66aa' : '#555', color: '#fff', border: '2px solid #fff', cursor: 'pointer' }}
          >
            {settings.sfxEnabled ? 'ON' : 'OFF'}
          </button>
        </div>

        {/* BGM Toggle */}
        <div className="setting-item" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>배경음악 (BGM)</span>
          <button 
            className={`toggle-btn \${settings.bgmEnabled ? 'on' : 'off'}`}
            onClick={() => handleToggle('bgmEnabled')}
            style={{ padding: '5px 15px', background: settings.bgmEnabled ? '#ff66aa' : '#555', color: '#fff', border: '2px solid #fff', cursor: 'pointer' }}
          >
            {settings.bgmEnabled ? 'ON' : 'OFF'}
          </button>
        </div>

        {/* Director App Visible Toggle */}
        <div className="setting-item" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>디렉터 바탕화면 아이콘 표시</span>
          <button 
            className={`toggle-btn \${settings.directorEnabled ? 'on' : 'off'}`}
            onClick={() => handleToggle('directorEnabled')}
            style={{ padding: '5px 15px', background: settings.directorEnabled ? '#ff66aa' : '#555', color: '#fff', border: '2px solid #fff', cursor: 'pointer' }}
          >
            {settings.directorEnabled ? 'ON' : 'OFF'}
          </button>
        </div>

        {/* Auto Motion Toggle */}
        <div className="setting-item" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>모션 자동변경</span>
          <button 
            className={`toggle-btn \${settings.autoMotionEnabled ? 'on' : 'off'}`}
            onClick={() => handleToggle('autoMotionEnabled')}
            style={{ padding: '5px 15px', background: settings.autoMotionEnabled ? '#ff66aa' : '#555', color: '#fff', border: '2px solid #fff', cursor: 'pointer' }}
          >
            {settings.autoMotionEnabled ? 'ON' : 'OFF'}
          </button>
        </div>

        {/* API Key Input */}
        <div className="setting-item" style={{ display: 'flex', flexDirection: 'column', gap: '5px', marginTop: '10px' }}>
          <span>JINE API Key (OpenAI)</span>
          <input 
            type="password" 
            placeholder="sk-..." 
            style={{ padding: '8px', background: '#222', color: '#fff', border: '1px solid #fff', outline: 'none' }}
          />
        </div>

      </div>
    </div>
  );
}
