import React from 'react';
import useAppStore from '../store/useAppStore';

export default function SettingsApp() {
  const { settings, updateSettings } = useAppStore();
  const [localApiKey, setLocalApiKey] = React.useState(settings.apiKey || '');
  const [localApiProvider, setLocalApiProvider] = React.useState(settings.apiProvider || 'gemini');
  const [showAlert, setShowAlert] = React.useState(false);

  const handleSaveApi = () => {
    updateSettings({ apiKey: localApiKey, apiProvider: localApiProvider });
    setShowAlert(true);
    setTimeout(() => setShowAlert(false), 2500);
  };

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

        {/* AI Provider & API Key */}
        <div className="setting-item col">
          <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
            <span>JINE AI 채팅 제공자</span>
            <select 
              className="setting-input" 
              value={localApiProvider}
              onChange={(e) => setLocalApiProvider(e.target.value)}
              style={{ fontFamily: 'PixelMplus10', width: '120px' }}
            >
              <option value="gemini">Gemini</option>
              <option value="openai">OpenAI</option>
            </select>
          </div>
          
          <span style={{ marginTop: '10px', marginBottom: '5px' }}>API Key ({localApiProvider === 'gemini' ? 'AI Studio' : 'OpenAI Platform'})</span>
          <div style={{ display: 'flex', gap: '5px' }}>
            <input 
              type="password" 
              className="setting-input" 
              placeholder="발급받은 키 입력"
              value={localApiKey}
              onChange={(e) => setLocalApiKey(e.target.value)}
              style={{ flex: 1, boxSizing: 'border-box' }}
            />
            <button 
              style={{ fontFamily: 'PixelMplus10', padding: '0 10px', backgroundColor: '#dfdfdf', border: '1px solid #fff', borderBottomColor: '#000', borderRightColor: '#000', cursor: 'pointer' }}
              onClick={handleSaveApi}
            >
              저장
            </button>
          </div>
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

      {showAlert && (
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100
        }}>
          <div style={{
            backgroundColor: '#000', color: '#fff', border: '2px solid #ff00ff', padding: '20px', 
            display: 'flex', flexDirection: 'column', alignItems: 'center', fontFamily: 'DinkieBitmap'
          }}>
            <img src="/assets/images/task_manager/icon_status_yami.png" alt="Saved" style={{ width: '32px', marginBottom: '10px' }} />
            <span style={{ fontSize: '14px' }}>저장되었습니다!</span>
            <span style={{ fontSize: '10px', color: '#aaa', marginTop: '5px' }}>피짱.. 잊지마!</span>
          </div>
        </div>
      )}
    </div>
  );
}
