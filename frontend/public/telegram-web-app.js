// Telegram Web App API Integration
// Этот файл загружается в Telegram Web App для интеграции

(function() {
  'use strict';

  // Инициализация Telegram Web App
  if (window.Telegram && window.Telegram.WebApp) {
    const tg = window.Telegram.WebApp;
    
    // Готовим приложение
    tg.ready();
    
    // Раскрываем на полный экран
    tg.expand();
    
    // Устанавливаем основной цвет
    tg.setHeaderColor('#667eea');
    
    // Устанавливаем цвет фона
    tg.setBackgroundColor('#f8fafc');
    
    // Обработка событий
    tg.onEvent('viewportChanged', function() {
      console.log('Viewport changed');
    });
    
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
      if (tg.showAlert) {
        tg.showAlert(message);
      } else {
        alert(message);
      }
    };
    
    // Функция для показа подтверждения в Telegram
    window.showTelegramConfirm = function(message, callback) {
      if (tg.showConfirm) {
        tg.showConfirm(message, callback);
      } else {
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
