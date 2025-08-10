// Утилита для haptic feedback в Telegram Web App
// Совместима с версиями 6.0+ и имеет fallback для старых версий

// Проверяем доступность haptic feedback
const isHapticSupported = () => {
  return window.Telegram?.WebApp?.HapticFeedback && 
         typeof window.Telegram.WebApp.HapticFeedback.impactOccurred === 'function';
};

// Fallback для устройств без haptic feedback
const fallbackHaptic = () => {
  // Пытаемся использовать нативную вибрацию, если доступна
  if (navigator.vibrate) {
    navigator.vibrate(50);
  }
};

export const hapticFeedback = {
  // Легкая вибрация
  light: () => {
    if (isHapticSupported()) {
      try {
        window.Telegram.WebApp.HapticFeedback.impactOccurred('light');
      } catch (error) {
        console.warn('Haptic feedback light failed:', error);
        fallbackHaptic();
      }
    } else {
      fallbackHaptic();
    }
  },

  // Средняя вибрация
  medium: () => {
    if (isHapticSupported()) {
      try {
        window.Telegram.WebApp.HapticFeedback.impactOccurred('medium');
      } catch (error) {
        console.warn('Haptic feedback medium failed:', error);
        fallbackHaptic();
      }
    } else {
      fallbackHaptic();
    }
  },

  // Сильная вибрация
  heavy: () => {
    if (isHapticSupported()) {
      try {
        window.Telegram.WebApp.HapticFeedback.impactOccurred('heavy');
      } catch (error) {
        console.warn('Haptic feedback heavy failed:', error);
        fallbackHaptic();
      }
    } else {
      fallbackHaptic();
    }
  },

  // Успешная операция
  success: () => {
    if (isHapticSupported()) {
      try {
        window.Telegram.WebApp.HapticFeedback.notificationOccurred('success');
      } catch (error) {
        console.warn('Haptic feedback success failed:', error);
        fallbackHaptic();
      }
    } else {
      fallbackHaptic();
    }
  },

  // Предупреждение
  warning: () => {
    if (isHapticSupported()) {
      try {
        window.Telegram.WebApp.HapticFeedback.notificationOccurred('warning');
      } catch (error) {
        console.warn('Haptic feedback warning failed:', error);
        fallbackHaptic();
      }
    } else {
      fallbackHaptic();
    }
  },

  // Ошибка
  error: () => {
    if (isHapticSupported()) {
      try {
        window.Telegram.WebApp.HapticFeedback.notificationOccurred('error');
      } catch (error) {
        console.warn('Haptic feedback error failed:', error);
        fallbackHaptic();
      }
    } else {
      fallbackHaptic();
    }
  },

  // Проверка поддержки
  isSupported: () => isHapticSupported(),

  // Получение информации о версии
  getVersionInfo: () => {
    if (window.Telegram?.WebApp) {
      return {
        version: window.Telegram.WebApp.version,
        platform: window.Telegram.WebApp.platform,
        hapticSupported: isHapticSupported()
      };
    }
    return null;
  }
};

export default hapticFeedback;
