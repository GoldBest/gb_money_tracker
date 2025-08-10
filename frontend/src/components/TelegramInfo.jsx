import React, { useState, useEffect } from 'react';
const TelegramInfo = () => {
  const [versionInfo, setVersionInfo] = useState(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (window.Telegram?.WebApp) {
      const info = {
        version: window.Telegram.WebApp.version,
        platform: window.Telegram.WebApp.platform,
        hapticSupported: false
      };
      setVersionInfo(info);
    }
  }, []);

  const toggleVisibility = () => {
    setIsVisible(!isVisible);
  };

  if (!versionInfo) return null;

  return (
    <div style={{
      position: 'fixed',
      top: '10px',
      right: '10px',
      zIndex: 1000,
      background: 'rgba(0, 0, 0, 0.8)',
      color: 'white',
      padding: '8px',
      borderRadius: '8px',
      fontSize: '12px',
      cursor: 'pointer',
      userSelect: 'none'
    }}>
      <div onClick={toggleVisibility} style={{ textAlign: 'center' }}>
        📱 v{versionInfo.version}
      </div>
      
      {isVisible && (
        <div style={{
          marginTop: '8px',
          padding: '8px',
          background: 'rgba(255, 255, 255, 0.1)',
          borderRadius: '4px',
          fontSize: '10px'
        }}>
          <div>Platform: {versionInfo.platform}</div>
          <div>Haptic: {versionInfo.hapticSupported ? '✅' : '❌'}</div>
          <div style={{ marginTop: '4px' }}>
            <button 
              onClick={() => {}}
              style={{
                background: 'rgba(255, 255, 255, 0.2)',
                border: 'none',
                color: 'white',
                padding: '2px 6px',
                borderRadius: '4px',
                fontSize: '10px',
                marginRight: '4px'
              }}
            >
              Test
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TelegramInfo;
