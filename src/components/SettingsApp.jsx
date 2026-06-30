import React from 'react';
import useAppStore from '../store/useAppStore';
import { LocalNotifications } from '@capacitor/local-notifications';
import { Capacitor } from '@capacitor/core';

export default function SettingsApp() {
  const { settings, updateSettings, clearJineMessages, notificationQueue } = useAppStore();
  const [localApiKey, setLocalApiKey] = React.useState(settings.apiKey || '');
  const [localApiProvider, setLocalApiProvider] = React.useState(settings.apiProvider || 'gemini');
  const [showAlert, setShowAlert] = React.useState(false);
  const [notifCountdown, setNotifCountdown] = React.useState(null); // null | number

  const handleSaveApi = () => {
    updateSettings({ apiKey: localApiKey, apiProvider: localApiProvider });
    setShowAlert(true);
    setTimeout(() => setShowAlert(false), 2500);
  };

  const handleToggle = (key) => {
    updateSettings({ [key]: !settings[key] });
  };

  const handleNotifTest = async () => {
    if (notifCountdown !== null) return; // already counting
    
    // Check permission
    if (Capacitor.isNativePlatform()) {
      const perm = await LocalNotifications.checkPermissions();
      if (perm.display !== 'granted') {
        const req = await LocalNotifications.requestPermissions();
        if (req.display !== 'granted') {
          alert('알림 권한이 거부되었습니다.');
          return;
        }
      }
    } else {
      const perm = await Notification.requestPermission();
      if (perm !== 'granted') {
        alert('알림 권한이 거부되었습니다.');
        return;
      }
    }

    // Pick a notification message
    const store = useAppStore.getState();
    const queue = store.notificationQueue;
    const fallback = settings.menheraMode
      ? '피짱 어디야ㅠ 나 버린거야? 죽어버릴거야'
      : '피짱~ 나 보고싶지 않아? 빨리 들어와ㅠ';
    const msg = queue.length > 0 ? queue[0] : fallback;
    if (queue.length > 0) store.popNotification();

    // Countdown and schedule
    let count = 5;
    setNotifCountdown(count);
    const tick = setInterval(() => {
      count--;
      if (count <= 0) {
        clearInterval(tick);
        setNotifCountdown(null);
        
        if (Capacitor.isNativePlatform()) {
          LocalNotifications.schedule({
            notifications: [
              {
                title: '아메쨩 💌 (테스트)',
                body: msg,
                id: Date.now(),
                schedule: { at: new Date(Date.now() + 100) },
                smallIcon: 'ic_launcher'
              }
            ]
          });
        } else {
          // Web fallback
          navigator.serviceWorker.ready.then(sw => {
            sw.active.postMessage({
              type: 'SCHEDULE_NOTIFICATION',
              delayMs: 100,
              title: '아메쨩 💌 (테스트)',
              body: msg,
              tag: 'ame-test-notification'
            });
          });
        }
      } else {
        setNotifCountdown(count);
      }
    }, 1000);
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
        
        {/* Menhera Mode Toggle */}
        <div className="setting-item" style={{ border: '2px solid #ff4488', backgroundColor: '#ffddf0' }}>
          <span style={{ color: '#ff0066', fontWeight: 'bold' }}>멘헤라 모드 (주의)</span>
          <button 
            className={`toggle-btn ${settings.menheraMode ? 'on' : 'off'}`}
            onClick={() => handleToggle('menheraMode')}
            style={settings.menheraMode ? { backgroundColor: '#ff0066', color: 'white' } : {}}
          >
            {settings.menheraMode ? 'ON' : 'OFF'}
          </button>
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
          <button 
            style={{ marginTop: '10px', fontFamily: 'PixelMplus10', padding: '5px 10px', backgroundColor: '#ffcccc', border: '1px solid #fff', borderBottomColor: '#000', borderRightColor: '#000', cursor: 'pointer', color: '#000' }}
            onClick={() => {
              if (window.confirm('모든 JINE 대화 기록을 지우시겠습니까?')) {
                clearJineMessages();
                alert('대화 기록이 삭제되었습니다.');
              }
            }}
          >
            대화 기록 초기화
          </button>
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

        {/* Notification Test */}
        <div className="setting-item" style={{ backgroundColor: (0,0,0,0), border: '0px solid #4488ff' }}>
          <span>알림 테스트</span>
          <button
            className={`toggle-btn ${notifCountdown !== null ? 'off' : 'on'}`}
            onClick={handleNotifTest}
            style={{ minWidth: '48px', fontWeight: 'bold', fontSize: '14px' }}
          >
            {notifCountdown !== null ? notifCountdown : 'TEST'}
          </button>
        </div>
        
        {/* Notification Permission Toggle */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#dfdfdf', padding: '6px' }}>
          <span style={{ fontSize: '14px', fontWeight: 'bold' }}>Push 알림 수신 동의</span>
          <button
            className="retro-btn"
            onClick={async () => {
              // ── Capacitor Native App (Android APK) ──
              if (Capacitor.isNativePlatform()) {
                try {
                  let permStatus = await LocalNotifications.checkPermissions();
                  if (permStatus.display === 'prompt' || permStatus.display === 'prompt-with-rationale') {
                    permStatus = await LocalNotifications.requestPermissions();
                  }
                  if (permStatus.display === 'granted') {
                    alert('✅ 알림 권한이 허용되었습니다!');
                  } else {
                    alert('❌ 알림 권한이 거부되었습니다. 설정에서 직접 허용해 주세요.');
                  }
                } catch (e) {
                  alert('알림 설정 중 오류가 발생했습니다: ' + e.message);
                }
                return;
              }

              // ── Web Browser Fallback ──
              if (!('Notification' in window)) {
                alert('이 브라우저는 푸시 알림을 지원하지 않습니다.');
                return;
              }
              if (Notification.permission === 'granted') {
                alert('이미 알림 권한이 허용되어 있습니다.');
              } else if (Notification.permission === 'denied') {
                alert('브라우저 설정에서 알림 권한이 차단되어 있습니다. 설정에서 해제해주세요.');
              } else {
                const p = await Notification.requestPermission();
                if (p === 'granted') alert('알림 권한이 허용되었습니다!');
                else alert('알림 권한이 거부되었습니다.');
              }
            }}
            style={{ minWidth: '48px', padding: '2px 8px', fontSize: '12px' }}
          >
            허용하기
          </button>
        </div>

        {/* Version Info */}
        <div style={{ textAlign: 'center', marginTop: '10px', marginBottom: '5px', color: '#666', fontSize: '11px', fontFamily: 'PixelMplus10, sans-serif' }}>
          Version beta 1.0.1
        </div>



      </div>

      {showAlert && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999
        }}>
          <div className="os-window" style={{ width: '250px', backgroundColor: '#dfdfdf', border: '2px solid #dfdfdf', borderTopColor: '#fff', borderLeftColor: '#fff', borderRightColor: '#000', borderBottomColor: '#000', padding: '2px' }}>
            <div style={{ backgroundColor: '#000080', height: '20px', width: '100%', display: 'flex', alignItems: 'center', paddingLeft: '5px' }}>
              <span style={{ color: '#fff', fontSize: '12px', fontFamily: 'DinkieBitmap, sans-serif' }}>Information</span>
              <button 
                style={{ marginLeft: 'auto', marginRight: '2px', width: '16px', height: '16px', backgroundColor: '#dfdfdf', border: '1px solid #fff', borderBottomColor: '#000', borderRightColor: '#000', fontSize: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                onClick={() => setShowAlert(false)}
              >X</button>
            </div>
            <div style={{ padding: '15px 10px', display: 'flex', alignItems: 'center', gap: '15px' }}>
              <img src="/assets/images/task_manager/icon_status_yami.png" alt="Saved" style={{ width: '32px', height: '32px' }} />
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '14px', fontFamily: 'PixelMplus10', color: '#000' }}>저장되었습니다!</span>
                <span style={{ fontSize: '12px', color: '#666', marginTop: '5px', fontFamily: 'PixelMplus10' }}>피짱.. 잊지마!</span>
              </div>
            </div>
            <div style={{ padding: '10px', display: 'flex', justifyContent: 'center' }}>
              <button 
                onClick={() => setShowAlert(false)}
                style={{ width: '60px', height: '24px', fontFamily: 'PixelMplus10', backgroundColor: '#dfdfdf', border: '1px solid #fff', borderBottomColor: '#000', borderRightColor: '#000', cursor: 'pointer' }}
              >OK</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
