import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect } from 'react'
import { X, CheckCircle, AlertCircle, Info, XCircle } from 'lucide-react'

const AnimatedToast = ({ 
  message, 
  type = 'info', // 'success', 'error', 'warning', 'info'
  duration = 5000,
  onClose,
  position = 'top-right', // 'top-right', 'top-left', 'bottom-right', 'bottom-left', 'top-center', 'bottom-center'
  showProgress = true,
  className = '',
  ...props 
}) => {
  const [isVisible, setIsVisible] = useState(true)
  const [progress, setProgress] = useState(100)

  useEffect(() => {
    if (duration === Infinity) return

    const timer = setTimeout(() => {
      setIsVisible(false)
      setTimeout(() => onClose?.(), 300)
    }, duration)

    return () => clearTimeout(timer)
  }, [duration, onClose])

  useEffect(() => {
    if (!showProgress || duration === Infinity) return

    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev <= 0) return 0
        return prev - (100 / (duration / 100))
      })
    }, 100)

    return () => clearInterval(interval)
  }, [showProgress, duration])

  const getTypeStyles = () => {
    switch (type) {
      case 'success':
        return {
          bg: 'bg-green-50 dark:bg-green-900/20',
          border: 'border-green-200 dark:border-green-700',
          text: 'text-green-800 dark:text-green-200',
          icon: <CheckCircle className="w-5 h-5 text-green-500" />,
          progress: 'bg-green-500'
        }
      case 'error':
        return {
          bg: 'bg-red-50 dark:bg-red-900/20',
          border: 'border-red-200 dark:border-red-700',
          text: 'text-red-800 dark:text-red-200',
          icon: <XCircle className="w-5 h-5 text-red-500" />,
          progress: 'bg-red-500'
        }
      case 'warning':
        return {
          bg: 'bg-yellow-50 dark:bg-yellow-900/20',
          border: 'border-yellow-200 dark:border-yellow-700',
          text: 'text-yellow-800 dark:text-yellow-800',
          icon: <AlertCircle className="w-5 h-5 text-yellow-500" />,
          progress: 'bg-yellow-500'
        }
      default:
        return {
          bg: 'bg-blue-50 dark:bg-blue-900/20',
          border: 'border-blue-200 dark:border-blue-700',
          text: 'text-blue-800 dark:text-blue-200',
          icon: <Info className="w-5 h-5 text-blue-500" />,
          progress: 'bg-blue-500'
        }
    }
  }

  const getPositionStyles = () => {
    switch (position) {
      case 'top-left':
        return 'top-4 left-4'
      case 'top-center':
        return 'top-4 left-1/2 transform -translate-x-1/2'
      case 'top-right':
        return 'top-4 right-4'
      case 'bottom-left':
        return 'bottom-4 left-4'
      case 'bottom-center':
        return 'bottom-4 left-1/2 transform -translate-x-1/2'
      case 'bottom-right':
        return 'bottom-4 right-4'
      default:
        return 'top-4 right-4'
    }
  }

  const typeStyles = getTypeStyles()
  const positionStyles = getPositionStyles()

  const handleClose = () => {
    setIsVisible(false)
    setTimeout(() => onClose?.(), 300)
  }

  const toastVariants = {
    initial: {
      opacity: 0,
      scale: 0.8,
      y: position.includes('top') ? -50 : 50,
      x: position.includes('left') ? -50 : position.includes('right') ? 50 : 0
    },
    animate: {
      opacity: 1,
      scale: 1,
      y: 0,
      x: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 25,
        duration: 0.3
      }
    },
    exit: {
      opacity: 0,
      scale: 0.8,
      y: position.includes('top') ? -50 : 50,
      x: position.includes('left') ? -50 : position.includes('right') ? 50 : 0,
      transition: {
        duration: 0.2
      }
    }
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className={`
            fixed z-50 max-w-sm w-full shadow-2xl rounded-lg border
            ${typeStyles.bg} ${typeStyles.border} ${positionStyles}
            ${className}
          `}
          variants={toastVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          layout
          {...props}
        >
          {/* Прогресс бар */}
          {showProgress && duration !== Infinity && (
            <motion.div
              className={`h-1 ${typeStyles.progress} rounded-t-lg`}
              initial={{ scaleX: 1 }}
              animate={{ scaleX: progress / 100 }}
              transition={{ duration: 0.1 }}
            />
          )}

          {/* Содержимое уведомления */}
          <div className="p-4">
            <div className="flex items-start gap-3">
              {/* Иконка */}
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.1, duration: 0.3 }}
                className="flex-shrink-0 mt-0.5"
              >
                {typeStyles.icon}
              </motion.div>

              {/* Сообщение */}
              <div className="flex-1 min-w-0">
                <motion.p
                  className={`text-sm font-medium ${typeStyles.text}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, duration: 0.3 }}
                >
                  {message}
                </motion.p>
              </div>

              {/* Кнопка закрытия */}
              <motion.button
                onClick={handleClose}
                className="flex-shrink-0 p-1 rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3, duration: 0.3 }}
              >
                <X className="w-4 h-4 text-gray-400" />
              </motion.button>
            </div>
          </div>

          {/* Hover эффект */}
          <motion.div
            className="absolute inset-0 rounded-lg border-2 border-transparent"
            whileHover={{ borderColor: 'rgba(59, 130, 246, 0.2)' }}
            transition={{ duration: 0.2 }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default AnimatedToast
