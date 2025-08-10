import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Eye, EyeOff, CheckCircle, XCircle, AlertCircle } from 'lucide-react'

const AnimatedInput = ({
  label,
  type = 'text',
  value = '',
  onChange,
  onBlur,
  onFocus,
  placeholder,
  error,
  success,
  warning,
  disabled = false,
  required = false,
  autoComplete,
  className = '',
  leftIcon,
  rightIcon,
  showPasswordToggle = false,
  floatingLabel = true,
  autoSave = false,
  autoSaveDelay = 1000,
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [isDirty, setIsDirty] = useState(false)
  const [autoSaveTimer, setAutoSaveTimer] = useState(null)
  const [isAutoSaving, setIsAutoSaving] = useState(false)
  const inputRef = useRef(null)

  const inputType = type === 'password' && showPassword ? 'text' : type
  const hasValue = value && value.length > 0
  const showFloatingLabel = floatingLabel && (isFocused || hasValue)

  useEffect(() => {
    if (autoSave && isDirty && value) {
      // Очищаем предыдущий таймер
      if (autoSaveTimer) {
        clearTimeout(autoSaveTimer)
      }

      // Устанавливаем новый таймер
      const timer = setTimeout(() => {
        setIsAutoSaving(true)
        // Здесь можно добавить логику автосохранения
        setTimeout(() => setIsAutoSaving(false), 1000)
      }, autoSaveDelay)

      setAutoSaveTimer(timer)

      return () => clearTimeout(timer)
    }
  }, [value, autoSave, autoSaveDelay, isDirty])

  const handleChange = (e) => {
    if (!isDirty) setIsDirty(true)
    onChange?.(e)
  }

  const handleFocus = (e) => {
    setIsFocused(true)
    onFocus?.(e)
  }

  const handleBlur = (e) => {
    setIsFocused(false)
    onBlur?.(e)
  }

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword)
    // Фокусируемся на поле ввода после переключения
    setTimeout(() => inputRef.current?.focus(), 0)
  }

  const getStatusIcon = () => {
    if (error) return <XCircle className="w-5 h-5 text-red-500" />
    if (success) return <CheckCircle className="w-5 h-5 text-green-500" />
    if (warning) return <AlertCircle className="w-5 h-5 text-yellow-500" />
    if (isAutoSaving) return <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
    return null
  }

  const getStatusColor = () => {
    if (error) return 'border-red-300 focus:border-red-500 focus:ring-red-500'
    if (success) return 'border-green-300 focus:border-green-500 focus:ring-green-500'
    if (warning) return 'border-yellow-300 focus:border-yellow-500 focus:ring-yellow-500'
    return 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
  }

  const getStatusTextColor = () => {
    if (error) return 'text-red-600 dark:text-red-400'
    if (success) return 'text-green-600 dark:text-green-400'
    if (warning) return 'text-yellow-600 dark:text-yellow-400'
    return 'text-gray-500 dark:text-gray-400'
  }

  return (
    <div className={`relative ${className}`}>
      {/* Floating Label */}
      {floatingLabel && (
        <AnimatePresence>
          {showFloatingLabel && (
            <motion.label
              className="absolute left-3 top-2 text-xs font-medium text-blue-600 dark:text-blue-400 bg-white dark:bg-gray-800 px-1 z-10"
              initial={{ opacity: 0, y: 10, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.8 }}
              transition={{ duration: 0.2 }}
            >
              {label}
              {required && <span className="text-red-500 ml-1">*</span>}
            </motion.label>
          )}
        </AnimatePresence>
      )}

      {/* Основное поле ввода */}
      <div className="relative">
        {/* Левая иконка */}
        {leftIcon && (
          <motion.div
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 z-10"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1, duration: 0.2 }}
          >
            {leftIcon}
          </motion.div>
        )}

        {/* Поле ввода */}
        <motion.input
          ref={inputRef}
          type={inputType}
          value={value}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={!floatingLabel ? placeholder : undefined}
          autoComplete={autoComplete}
          disabled={disabled}
          required={required}
          className={`
            w-full px-3 py-3 border rounded-lg transition-all duration-200
            bg-white dark:bg-gray-800 text-gray-900 dark:text-white
            placeholder-gray-400 dark:placeholder-gray-500
            disabled:opacity-50 disabled:cursor-not-allowed
            ${leftIcon ? 'pl-10' : ''}
            ${rightIcon || showPasswordToggle || getStatusIcon() ? 'pr-10' : ''}
            ${floatingLabel ? 'pt-4' : ''}
            ${getStatusColor()}
            focus:ring-2 focus:ring-opacity-20
          `}
          whileFocus={{ scale: 1.01 }}
          transition={{ duration: 0.2 }}
          {...props}
        />

        {/* Правая иконка или статус */}
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
          {/* Статус иконка */}
          {getStatusIcon() && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.2 }}
            >
              {getStatusIcon()}
            </motion.div>
          )}

          {/* Переключатель пароля */}
          {type === 'password' && showPasswordToggle && (
            <motion.button
              type="button"
              onClick={togglePasswordVisibility}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </motion.button>
          )}

          {/* Правая иконка */}
          {rightIcon && !getStatusIcon() && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1, duration: 0.2 }}
              className="text-gray-400"
            >
              {rightIcon}
            </motion.div>
          )}
        </div>

        {/* Focus индикатор */}
        <motion.div
          className="absolute inset-0 rounded-lg border-2 border-transparent pointer-events-none"
          animate={{
            borderColor: isFocused ? 'rgba(59, 130, 246, 0.3)' : 'transparent'
          }}
          transition={{ duration: 0.2 }}
        />
      </div>

      {/* Статус сообщение */}
      <AnimatePresence>
        {(error || success || warning) && (
          <motion.div
            className={`mt-2 text-sm ${getStatusTextColor()}`}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {error || success || warning}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Auto-save индикатор */}
      <AnimatePresence>
        {isAutoSaving && (
          <motion.div
            className="mt-2 text-xs text-blue-600 dark:text-blue-400"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            Автосохранение...
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default AnimatedInput
