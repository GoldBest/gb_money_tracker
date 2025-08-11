// Утилиты для безопасного вызова Telegram функций

export const showAlert = (message) => {
  if (window.showTelegramAlert) {
    window.showTelegramAlert(message)
  } else {
    // Fallback для разработки
    console.log('Telegram Alert:', message)
    alert(message)
  }
}

export const showConfirm = (message, callback) => {
  if (window.showTelegramConfirm) {
    window.showTelegramConfirm(message, callback)
  } else {
    // Fallback для разработки
    const result = confirm(message)
    if (callback) callback(result)
    return result
  }
}

export const isTelegramAvailable = () => {
  return !!(window.Telegram?.WebApp && window.showTelegramAlert)
}
