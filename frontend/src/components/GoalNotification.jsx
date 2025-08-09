import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Trophy, X, TrendingUp, Target, Star } from 'lucide-react'
import { hapticFeedback } from '../utils/haptic'

const GoalNotification = ({ goal, onClose, onDismiss }) => {
  const [isVisible, setIsVisible] = useState(true)
  const [showDetails, setShowDetails] = useState(false)

  useEffect(() => {
    // Автоматически скрыть через 10 секунд
    const timer = setTimeout(() => {
      setIsVisible(false)
      setTimeout(() => onDismiss(goal.id), 500)
    }, 10000)

    return () => clearTimeout(timer)
  }, [goal.id, onDismiss])

  const handleClose = () => {
    setIsVisible(false)
    hapticFeedback.light()
    setTimeout(() => onDismiss(goal.id), 500)
  }

  const getProgressColor = (progress) => {
    if (progress >= 100) return '#10B981' // Зеленый
    if (progress >= 75) return '#F59E0B' // Желтый
    if (progress >= 50) return '#F97316' // Оранжевый
    return '#EF4444' // Красный
  }

  const getGoalIcon = (type) => {
    switch (type) {
      case 'savings':
        return <Trophy className="goal-icon" />
      case 'income':
        return <TrendingUp className="goal-icon" />
      case 'spending':
        return <Target className="goal-icon" />
      default:
        return <Star className="goal-icon" />
    }
  }

  const getGoalMessage = (type, progress) => {
    if (progress >= 100) {
      switch (type) {
        case 'savings':
          return '🎉 Цель по накоплениям достигнута!'
        case 'income':
          return '🎉 Цель по доходам достигнута!'
        case 'spending':
          return '🎉 Цель по расходам достигнута!'
        default:
          return '🎉 Цель достигнута!'
      }
    } else if (progress >= 75) {
      return '🔥 Почти достигли цели! Осталось совсем немного!'
    } else if (progress >= 50) {
      return '📈 Отличный прогресс! Продолжайте в том же духе!'
    } else {
      return '💪 Начинаем путь к цели! Каждый шаг важен!'
    }
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="goal-notification"
          initial={{ opacity: 0, y: -100, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -100, scale: 0.8 }}
          transition={{
            type: "spring",
            stiffness: 300,
            damping: 30
          }}
        >
          <div className="notification-header">
            <div className="goal-info">
              {getGoalIcon(goal.type)}
              <div className="goal-title">
                <h4>{goal.name}</h4>
                <span className="goal-type">{goal.type === 'savings' ? 'Накопления' : 
                  goal.type === 'income' ? 'Доходы' : 'Расходы'}</span>
              </div>
            </div>
            <button
              className="close-notification haptic-trigger"
              onClick={handleClose}
            >
              <X size={18} />
            </button>
          </div>

          <div className="notification-content">
            <p className="goal-message">
              {getGoalMessage(goal.type, goal.progress)}
            </p>
            
            <div className="progress-section">
              <div className="progress-info">
                <span>Прогресс: {goal.progress.toFixed(1)}%</span>
                <span>{goal.current_amount.toLocaleString('ru-RU')} ₽ / {goal.target_amount.toLocaleString('ru-RU')} ₽</span>
              </div>
              <div className="progress-bar">
                <motion.div
                  className="progress-fill"
                  style={{ backgroundColor: getProgressColor(goal.progress) }}
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(goal.progress, 100)}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                />
              </div>
            </div>

            {goal.deadline && (
              <div className="deadline-info">
                <span>Дедлайн: {new Date(goal.deadline).toLocaleDateString('ru-RU')}</span>
                {goal.progress < 100 && (
                  <span className="days-left">
                    Осталось дней: {Math.ceil((new Date(goal.deadline) - new Date()) / (1000 * 60 * 60 * 24))}
                  </span>
                )}
              </div>
            )}
          </div>

          <div className="notification-actions">
            <button
              className="action-button secondary haptic-trigger"
              onClick={() => setShowDetails(!showDetails)}
            >
              {showDetails ? 'Скрыть детали' : 'Показать детали'}
            </button>
            {goal.progress >= 100 && (
              <button className="action-button primary haptic-trigger">
                🎉 Отпраздновать!
              </button>
            )}
          </div>

          {showDetails && (
            <motion.div
              className="goal-details"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="detail-item">
                <strong>Описание:</strong> {goal.description || 'Описание не указано'}
              </div>
              <div className="detail-item">
                <strong>Создана:</strong> {new Date(goal.created_at).toLocaleDateString('ru-RU')}
              </div>
              <div className="detail-item">
                <strong>Статус:</strong> 
                <span className={`status ${goal.progress >= 100 ? 'completed' : 'in-progress'}`}>
                  {goal.progress >= 100 ? 'Завершена' : 'В процессе'}
                </span>
              </div>
            </motion.div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default GoalNotification
