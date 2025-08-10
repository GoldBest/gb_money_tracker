// Telegram Web App API Integration
// Этот файл загружается в Telegram Web App для интеграции

(function() {
  'use strict';

  // Инициализация Telegram Web App
  if (window.Telegram && window.Telegram.WebApp) {
    const tg = window.Telegram.WebApp;
    
    // Проверяем версию Telegram WebApp
    const version = tg.version || '6.0';
    const isVersion6 = version.startsWith('6.');
    
    console.log('Telegram WebApp version:', version);
    
    // Готовим приложение
    tg.ready();
    
    // Раскрываем на полный экран (если поддерживается)
    if (tg.expand) {
      tg.expand();
    }
    
    // Устанавливаем основной цвет (если поддерживается)
    if (tg.setHeaderColor) {
      tg.setHeaderColor('#667eea');
    }
    
    // Устанавливаем цвет фона (если поддерживается)
    if (tg.setBackgroundColor) {
      tg.setBackgroundColor('#f8fafc');
    }
    
    // Обработка событий (если поддерживается)
    if (tg.onEvent) {
      tg.onEvent('viewportChanged', function() {
        console.log('Viewport changed');
      });
    }
    
    // Функция для отправки данных в Telegram
    window.sendToTelegram = function(data) {
      if (tg.sendData) {
        tg.sendData(JSON.stringify(data));
      }
    };
    
    // Функция для закрытия Web App
    window.closeTelegramApp = function() {
      if (tg.close) {
        tg.close();
      }
    };
    
    // Функция для показа алерта в Telegram
    window.showTelegramAlert = function(message) {
      // В версии 6.0 showAlert может не поддерживаться
      if (tg.showAlert && !isVersion6) {
        tg.showAlert(message);
      } else if (tg.showPopup && !isVersion6) {
        // Попробуем showPopup как альтернативу
        tg.showPopup({
          title: 'Уведомление',
          message: message,
          buttons: [{ type: 'ok' }]
        });
      } else {
        // Fallback на обычный alert
        console.log('Telegram Alert (fallback):', message);
        alert(message);
      }
    };
    
    // Функция для показа подтверждения в Telegram
    window.showTelegramConfirm = function(message, callback) {
      if (tg.showConfirm && !isVersion6) {
        tg.showConfirm(message, callback);
      } else if (tg.showPopup && !isVersion6) {
        // Попробуем showPopup как альтернативу
        tg.showPopup({
          title: 'Подтверждение',
          message: message,
          buttons: [
            { type: 'cancel', text: 'Отмена' },
            { type: 'ok', text: 'OK' }
          ]
        }, function(buttonId) {
          if (callback) callback(buttonId === 'ok');
        });
      } else {
        // Fallback на обычный confirm
        const result = confirm(message);
        if (callback) callback(result);
      }
    };
    
    console.log('Telegram Web App initialized');
  } else {
    console.log('Telegram Web App not available, running in browser mode');
    
    // Fallback для разработки в браузере
    window.sendToTelegram = function(data) {
      console.log('Telegram data:', data);
    };
    
    window.closeTelegramApp = function() {
      console.log('Close app requested');
    };
    
    window.showTelegramAlert = function(message) {
      alert(message);
    };
    
    window.showTelegramConfirm = function(message, callback) {
      const result = confirm(message);
      if (callback) callback(result);
    };
  }
})();
