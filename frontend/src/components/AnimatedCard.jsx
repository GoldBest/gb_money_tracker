import { motion } from 'framer-motion'
import { useState } from 'react'

const AnimatedCard = ({ 
  children, 
  className = '',
  variant = 'default', // 'default', 'elevated', 'glass', 'gradient'
  hoverEffect = 'lift', // 'lift', 'glow', 'scale', 'tilt'
  onClick,
  disabled = false,
  loading = false,
  icon,
  title,
  subtitle,
  actions,
  footer,
  fullWidth = false,
  ...props 
}) => {
  const [isHovered, setIsHovered] = useState(false)
  const [isPressed, setIsPressed] = useState(false)

  const getVariantStyles = () => {
    switch (variant) {
      case 'elevated':
        return 'bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl border border-gray-100 dark:border-gray-700'
      case 'glass':
        return 'bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border border-white/20 dark:border-gray-700/50 shadow-lg'
      case 'gradient':
        return 'bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-800 dark:to-gray-900 border border-blue-200/50 dark:border-gray-600/50'
      default:
        return 'bg-white dark:bg-gray-800 shadow-md hover:shadow-lg border border-gray-200 dark:border-gray-700'
    }
  }

  const getHoverEffect = () => {
    switch (hoverEffect) {
      case 'glow':
        return {
          whileHover: {
            boxShadow: '0 0 30px rgba(59, 130, 246, 0.3)',
            scale: 1.02,
            transition: { duration: 0.3 }
          }
        }
      case 'scale':
        return {
          whileHover: {
            scale: 1.05,
            transition: { duration: 0.2 }
          }
        }
      case 'tilt':
        return {
          whileHover: {
            rotateY: 5,
            rotateX: 2,
            scale: 1.02,
            transition: { duration: 0.3 }
          }
        }
      default: // lift
        return {
          whileHover: {
            y: -8,
            scale: 1.02,
            transition: { duration: 0.3 }
          }
        }
    }
  }

  const handleClick = (e) => {
    if (disabled || loading) return
    onClick?.(e)
  }

  const handleMouseDown = () => {
    if (disabled || loading) return
    setIsPressed(true)
  }

  const handleMouseUp = () => {
    setIsPressed(false)
  }

  const handleMouseLeave = () => {
    setIsHovered(false)
    setIsPressed(false)
  }

  return (
    <motion.div
      className={`
        relative overflow-hidden rounded-xl transition-all duration-300
        ${getVariantStyles()}
        ${fullWidth ? 'w-full' : ''}
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        ${className}
      `}
      onClick={handleClick}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      animate={{
        scale: isPressed ? 0.98 : 1,
        y: isPressed ? 0 : undefined
      }}
      transition={{
        type: "spring",
        stiffness: 400,
        damping: 25
      }}
      {...getHoverEffect()}
      {...props}
    >
      {/* Градиентный фон для hover эффекта */}
      {variant === 'gradient' && (
        <motion.div
          className="absolute inset-0 bg-gradient-to-br from-blue-400/10 to-indigo-500/10 opacity-0"
          animate={{ opacity: isHovered ? 1 : 0 }}
          transition={{ duration: 0.3 }}
        />
      )}

      {/* Loading состояние */}
      {loading && (
        <motion.div
          className="absolute inset-0 flex items-center justify-center bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm z-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <motion.div
            className="w-8 h-8 border-4 border-blue-200 border-t-blue-500 rounded-full"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
        </motion.div>
      )}

      {/* Заголовок карточки */}
      {(title || icon) && (
        <div className="p-4 pb-2">
          <div className="flex items-center gap-3">
            {icon && (
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.1, duration: 0.3 }}
                className="text-2xl"
              >
                {icon}
              </motion.div>
            )}
            <div className="flex-1">
              {title && (
                <motion.h3 
                  className="text-lg font-semibold text-gray-900 dark:text-white"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, duration: 0.3 }}
                >
                  {title}
                </motion.h3>
              )}
              {subtitle && (
                <motion.p 
                  className="text-sm text-gray-600 dark:text-gray-400 mt-1"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.3 }}
                >
                  {subtitle}
                </motion.p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Основной контент */}
      <div className="px-4 pb-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.3 }}
        >
          {children}
        </motion.div>
      </div>

      {/* Действия */}
      {actions && (
        <motion.div 
          className="px-4 pb-4 flex gap-2"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.3 }}
        >
          {actions}
        </motion.div>
      )}

      {/* Подвал */}
      {footer && (
        <motion.div 
          className="px-4 py-3 border-t border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-700/50"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.3 }}
        >
          {footer}
        </motion.div>
      )}

      {/* Hover индикатор */}
      {isHovered && !disabled && (
        <motion.div
          className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-indigo-500"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.3 }}
        />
      )}
    </motion.div>
  )
}

export default AnimatedCard
