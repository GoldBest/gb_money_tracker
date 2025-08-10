import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

// Haptic feedback для мобильных устройств
const triggerHaptic = (type = 'light') => {
  if ('vibrate' in navigator) {
    switch (type) {
      case 'light':
        navigator.vibrate(10)
        break
      case 'medium':
        navigator.vibrate(20)
        break
      case 'heavy':
        navigator.vibrate(30)
        break
      case 'success':
        navigator.vibrate([10, 20, 10])
        break
      case 'error':
        navigator.vibrate([20, 10, 20])
        break
      default:
        navigator.vibrate(10)
    }
  }
}

// Улучшенная кнопка с Apple-стилем анимациями
export const AppleButton = ({ 
  children, 
  variant = 'primary',
  size = 'medium',
  fullWidth = false,
  disabled = false,
  loading = false,
  icon,
  iconPosition = 'left',
  onClick,
  className = '',
  style = {},
  haptic = true,
  ...props 
}) => {
  const [isPressed, setIsPressed] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const buttonRef = useRef(null)

  const handlePressStart = () => {
    if (!disabled && !loading) {
      setIsPressed(true)
      if (haptic) triggerHaptic('light')
    }
  }

  const handlePressEnd = () => {
    setIsPressed(false)
  }

  const handleClick = (e) => {
    if (!disabled && !loading && onClick) {
      if (haptic) triggerHaptic('medium')
      onClick(e)
    }
  }

  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
        return {
          background: 'var(--apple-accent-blue)',
          color: 'var(--apple-text-inverse)',
          border: 'none'
        }
      case 'secondary':
        return {
          background: 'var(--apple-bg-secondary)',
          color: 'var(--apple-text-primary)',
          border: '1px solid var(--apple-border-primary)'
        }
      case 'success':
        return {
          background: 'var(--apple-accent-green)',
          color: 'var(--apple-text-inverse)',
          border: 'none'
        }
      case 'danger':
        return {
          background: 'var(--apple-accent-red)',
          color: 'var(--apple-text-inverse)',
          border: 'none'
        }
      case 'ghost':
        return {
          background: 'transparent',
          color: 'var(--apple-accent-blue)',
          border: 'none'
        }
      default:
        return {}
    }
  }

  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return { padding: '8px 16px', fontSize: '14px', minHeight: '32px' }
      case 'medium':
        return { padding: '12px 20px', fontSize: '16px', minHeight: '40px' }
      case 'large':
        return { padding: '16px 24px', fontSize: '17px', minHeight: '48px' }
      default:
        return {}
    }
  }

  return (
    <motion.button
      ref={buttonRef}
      className={`apple-button apple-button-${variant} ${fullWidth ? 'full-width' : ''} ${className}`}
      style={{
        ...getVariantStyles(),
        ...getSizeStyles(),
        width: fullWidth ? '100%' : 'auto',
        ...style
      }}
      disabled={disabled || loading}
      onMouseDown={handlePressStart}
      onMouseUp={handlePressEnd}
      onMouseLeave={handlePressEnd}
      onTouchStart={handlePressStart}
      onTouchEnd={handlePressEnd}
      onClick={handleClick}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      whileHover={!disabled && !loading ? { scale: 1.02 } : {}}
      whileTap={!disabled && !loading ? { scale: 0.98 } : {}}
      animate={{
        scale: isPressed ? 0.98 : 1,
        y: isPressed ? 1 : 0
      }}
      transition={{
        type: "spring",
        stiffness: 400,
        damping: 25
      }}
      {...props}
    >
      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="loading-spinner"
            style={{ width: '16px', height: '16px' }}
          />
        ) : (
          <motion.div
            key="content"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            {icon && iconPosition === 'left' && (
              <motion.span
                initial={{ x: -5, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.1 }}
              >
                {icon}
              </motion.span>
            )}
            <span>{children}</span>
            {icon && iconPosition === 'right' && (
              <motion.span
                initial={{ x: 5, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.1 }}
              >
                {icon}
              </motion.span>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.button>
  )
}

// Улучшенный input с floating label и анимациями
export const AppleInput = ({ 
  label,
  value,
  onChange,
  type = 'text',
  placeholder,
  error,
  success,
  disabled = false,
  required = false,
  className = '',
  style = {},
  ...props 
}) => {
  const [isFocused, setIsFocused] = useState(false)
  const [hasValue, setHasValue] = useState(!!value)
  const inputRef = useRef(null)

  useEffect(() => {
    setHasValue(!!value)
  }, [value])

  const handleFocus = () => {
    setIsFocused(true)
    if (props.onFocus) props.onFocus()
  }

  const handleBlur = () => {
    setIsFocused(false)
    if (props.onBlur) props.onBlur()
  }

  const handleChange = (e) => {
    setHasValue(!!e.target.value)
    if (onChange) onChange(e)
  }

  const isActive = isFocused || hasValue

  return (
    <div className={`apple-input-container ${className}`} style={style}>
      <motion.div
        className="apple-input-wrapper"
        animate={{
          borderColor: error 
            ? 'var(--apple-accent-red)' 
            : success 
            ? 'var(--apple-accent-green)' 
            : isActive 
            ? 'var(--apple-accent-blue)' 
            : 'var(--apple-border-primary)'
        }}
        transition={{ duration: 0.2 }}
      >
        <motion.label
          className="apple-input-label"
          animate={{
            y: isActive ? -20 : 0,
            scale: isActive ? 0.85 : 1,
            color: isActive 
              ? (error ? 'var(--apple-accent-red)' : 'var(--apple-accent-blue)')
              : 'var(--apple-text-secondary)'
          }}
          transition={{ duration: 0.2 }}
        >
          {label}
          {required && <span className="required">*</span>}
        </motion.label>
        
        <input
          ref={inputRef}
          type={type}
          value={value}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={isActive ? placeholder : ''}
          disabled={disabled}
          className="apple-input-field"
          {...props}
        />
        
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="input-error"
            >
              {error}
            </motion.div>
          )}
          
          {success && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="input-success"
            >
              ✓
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  )
}

// Анимированная карточка с hover эффектами
export const AppleCard = ({ 
  children, 
  variant = 'default',
  size = 'medium',
  hoverable = true,
  clickable = false,
  onClick,
  className = '',
  style = {},
  ...props 
}) => {
  const [isHovered, setIsHovered] = useState(false)
  const [isPressed, setIsPressed] = useState(false)

  const handleClick = () => {
    if (clickable && onClick) {
      triggerHaptic('light')
      onClick()
    }
  }

  const getVariantStyles = () => {
    switch (variant) {
      case 'elevated':
        return { boxShadow: 'var(--apple-shadow-lg)' }
      case 'outlined':
        return { border: '2px solid var(--apple-border-primary)' }
      case 'gradient':
        return { 
          background: 'linear-gradient(135deg, var(--apple-accent-blue) 0%, var(--apple-accent-purple) 100%)',
          color: 'var(--apple-text-inverse)'
        }
      default:
        return {}
    }
  }

  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return { padding: '16px' }
      case 'medium':
        return { padding: '20px' }
      case 'large':
        return { padding: '28px' }
      default:
        return {}
    }
  }

  return (
    <motion.div
      className={`apple-card apple-card-${variant} ${className}`}
      style={{
        ...getVariantStyles(),
        ...getSizeStyles(),
        cursor: clickable ? 'pointer' : 'default',
        ...style
      }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      onMouseDown={() => setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
      onMouseLeave={() => setIsPressed(false)}
      onClick={handleClick}
      whileHover={hoverable ? { 
        y: -2, 
        scale: 1.01,
        transition: { duration: 0.2 }
      } : {}}
      animate={{
        y: isPressed ? 0 : isHovered ? -2 : 0,
        scale: isPressed ? 0.98 : isHovered ? 1.01 : 1
      }}
      transition={{
        type: "spring",
        stiffness: 300,
        damping: 25
      }}
      {...props}
    >
      {children}
    </motion.div>
  )
}

// Анимированный список с stagger эффектами
export const AppleStaggeredList = ({ 
  children, 
  staggerDelay = 0.1,
  className = '',
  style = {},
  ...props 
}) => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: staggerDelay,
        delayChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { 
      opacity: 0, 
      y: 20,
      scale: 0.95
    },
    visible: { 
      opacity: 1, 
      y: 0,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 25
      }
    }
  }

  return (
    <motion.div
      className={`apple-staggered-list ${className}`}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      style={style}
      {...props}
    >
      {Array.isArray(children) 
        ? children.map((child, index) => (
            <motion.div key={index} variants={itemVariants}>
              {child}
            </motion.div>
          ))
        : children
      }
    </motion.div>
  )
}

// Анимированный счетчик с плавным изменением
export const AppleAnimatedCounter = ({ 
  value, 
  duration = 1000,
  className = '',
  style = {},
  ...props 
}) => {
  const [displayValue, setDisplayValue] = useState(value)

  useEffect(() => {
    const startValue = displayValue
    const endValue = value
    const startTime = performance.now()

    const animate = (currentTime) => {
      const elapsed = currentTime - startTime
      const progress = Math.min(elapsed / duration, 1)
      
      // Easing function для плавности
      const easeOutQuart = 1 - Math.pow(1 - progress, 4)
      const currentValue = startValue + (endValue - startValue) * easeOutQuart
      
      setDisplayValue(Math.round(currentValue))
      
      if (progress < 1) {
        requestAnimationFrame(animate)
      }
    }

    requestAnimationFrame(animate)
  }, [value, duration])

  return (
    <motion.span
      className={`apple-animated-counter ${className}`}
      style={style}
      key={value}
      initial={{ scale: 1.1, opacity: 0.8 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.3 }}
      {...props}
    >
      {displayValue.toLocaleString()}
    </motion.span>
  )
}

// Хук для Apple-стиля анимаций
export const useAppleAnimation = (initialState = false) => {
  const [isAnimating, setIsAnimating] = useState(initialState)
  const [animationType, setAnimationType] = useState('')

  const triggerAnimation = (type, duration = 300) => {
    setAnimationType(type)
    setIsAnimating(true)
    
    if (duration > 0) {
      setTimeout(() => {
        setIsAnimating(false)
      }, duration)
    }
  }

  const stopAnimation = () => {
    setIsAnimating(false)
    setAnimationType('')
  }

  return {
    isAnimating,
    animationType,
    triggerAnimation,
    stopAnimation
  }
}

export default {
  AppleButton,
  AppleInput,
  AppleCard,
  AppleStaggeredList,
  AppleAnimatedCounter,
  useAppleAnimation
}
