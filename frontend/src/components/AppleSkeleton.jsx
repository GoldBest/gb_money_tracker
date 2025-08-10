import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'

// Базовый skeleton элемент
export const AppleSkeleton = ({ 
  width = '100%', 
  height = '20px', 
  borderRadius = '4px',
  className = '',
  style = {},
  ...props 
}) => {
  return (
    <motion.div
      className={`apple-skeleton ${className}`}
      style={{
        width,
        height,
        borderRadius,
        background: 'linear-gradient(90deg, var(--apple-bg-secondary) 25%, var(--apple-bg-tertiary) 50%, var(--apple-bg-secondary) 75%)',
        backgroundSize: '200% 100%',
        ...style
      }}
      animate={{
        backgroundPosition: ['200% 0', '-200% 0']
      }}
      transition={{
        duration: 1.5,
        repeat: Infinity,
        ease: 'linear'
      }}
      {...props}
    />
  )
}

// Skeleton для карточки баланса
export const AppleSkeletonBalance = ({ className = '', style = {} }) => {
  return (
    <div className={`apple-skeleton-balance ${className}`} style={style}>
      <AppleSkeleton width="60%" height="16px" style={{ marginBottom: '12px' }} />
      <AppleSkeleton width="80%" height="32px" style={{ marginBottom: '8px' }} />
      <AppleSkeleton width="40%" height="14px" />
    </div>
  )
}

// Skeleton для статистических карточек
export const AppleSkeletonStats = ({ count = 4, className = '', style = {} }) => {
  return (
    <div className={`apple-skeleton-stats ${className}`} style={style}>
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="stat-skeleton-item">
          <AppleSkeleton width="32px" height="32px" borderRadius="50%" style={{ marginBottom: '12px' }} />
          <AppleSkeleton width="60%" height="20px" style={{ marginBottom: '8px' }} />
          <AppleSkeleton width="40%" height="14px" />
        </div>
      ))}
    </div>
  )
}

// Skeleton для списка транзакций
export const AppleSkeletonTransactions = ({ count = 5, className = '', style = {} }) => {
  return (
    <div className={`apple-skeleton-transactions ${className}`} style={style}>
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="transaction-skeleton-item">
          <div className="transaction-skeleton-left">
            <AppleSkeleton width="24px" height="24px" borderRadius="50%" style={{ marginRight: '12px' }} />
            <div className="transaction-skeleton-content">
              <AppleSkeleton width="120px" height="16px" style={{ marginBottom: '8px' }} />
              <AppleSkeleton width="80px" height="14px" />
            </div>
          </div>
          <AppleSkeleton width="80px" height="16px" />
        </div>
      ))}
    </div>
  )
}

// Skeleton для формы
export const AppleSkeletonForm = ({ fields = 4, className = '', style = {} }) => {
  return (
    <div className={`apple-skeleton-form ${className}`} style={style}>
      {Array.from({ length: fields }).map((_, index) => (
        <div key={index} className="form-field-skeleton">
          <AppleSkeleton width="80px" height="16px" style={{ marginBottom: '8px' }} />
          <AppleSkeleton width="100%" height="40px" borderRadius="6px" />
        </div>
      ))}
      <div className="form-buttons-skeleton">
        <AppleSkeleton width="120px" height="40px" borderRadius="6px" />
        <AppleSkeleton width="80px" height="40px" borderRadius="6px" />
      </div>
    </div>
  )
}

// Skeleton для таблицы
export const AppleSkeletonTable = ({ rows = 5, columns = 4, className = '', style = {} }) => {
  return (
    <div className={`apple-skeleton-table ${className}`} style={style}>
      {/* Заголовок таблицы */}
      <div className="table-header-skeleton">
        {Array.from({ length: columns }).map((_, index) => (
          <AppleSkeleton key={index} width="100%" height="20px" />
        ))}
      </div>
      
      {/* Строки таблицы */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="table-row-skeleton">
          {Array.from({ length: columns }).map((_, colIndex) => (
            <AppleSkeleton key={colIndex} width="100%" height="16px" />
          ))}
        </div>
      ))}
    </div>
  )
}

// Skeleton для графика
export const AppleSkeletonChart = ({ className = '', style = {} }) => {
  return (
    <div className={`apple-skeleton-chart ${className}`} style={style}>
      <AppleSkeleton width="100%" height="200px" borderRadius="8px" />
      <div className="chart-legend-skeleton" style={{ marginTop: '16px' }}>
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="legend-item-skeleton" style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
            <AppleSkeleton width="12px" height="12px" borderRadius="50%" style={{ marginRight: '8px' }} />
            <AppleSkeleton width="80px" height="14px" />
          </div>
        ))}
      </div>
    </div>
  )
}

// Skeleton для навигации
export const AppleSkeletonNavigation = ({ tabs = 4, className = '', style = {} }) => {
  return (
    <div className={`apple-skeleton-navigation ${className}`} style={style}>
      {Array.from({ length: tabs }).map((_, index) => (
        <div key={index} className="nav-tab-skeleton">
          <AppleSkeleton width="20px" height="20px" style={{ marginBottom: '4px' }} />
          <AppleSkeleton width="40px" height="12px" />
        </div>
      ))}
    </div>
  )
}

// Skeleton для модального окна
export const AppleSkeletonModal = ({ className = '', style = {} }) => {
  return (
    <div className={`apple-skeleton-modal ${className}`} style={style}>
      <div className="modal-header-skeleton">
        <AppleSkeleton width="60%" height="24px" style={{ marginBottom: '16px' }} />
        <AppleSkeleton width="24px" height="24px" style={{ alignSelf: 'flex-end' }} />
      </div>
      <div className="modal-body-skeleton">
        <AppleSkeleton width="100%" height="16px" style={{ marginBottom: '12px' }} />
        <AppleSkeleton width="80%" height="16px" style={{ marginBottom: '12px' }} />
        <AppleSkeleton width="90%" height="16px" style={{ marginBottom: '20px' }} />
        <AppleSkeleton width="100%" height="40px" borderRadius="6px" style={{ marginBottom: '12px' }} />
        <AppleSkeleton width="100%" height="40px" borderRadius="6px" />
      </div>
      <div className="modal-footer-skeleton">
        <AppleSkeleton width="80px" height="40px" borderRadius="6px" />
        <AppleSkeleton width="100px" height="40px" borderRadius="6px" />
      </div>
    </div>
  )
}

// Skeleton для пустого состояния
export const AppleSkeletonEmptyState = ({ className = '', style = {} }) => {
  return (
    <div className={`apple-skeleton-empty-state ${className}`} style={style}>
      <AppleSkeleton width="64px" height="64px" borderRadius="50%" style={{ marginBottom: '16px' }} />
      <AppleSkeleton width="200px" height="20px" style={{ marginBottom: '8px' }} />
      <AppleSkeleton width="300px" height="16px" />
    </div>
  )
}

// Хук для управления skeleton состоянием
export const useSkeleton = (isLoading = false, delay = 0) => {
  const [showSkeleton, setShowSkeleton] = useState(isLoading)

  useEffect(() => {
    if (isLoading) {
      setShowSkeleton(true)
    } else {
      const timer = setTimeout(() => {
        setShowSkeleton(false)
      }, delay)
      
      return () => clearTimeout(timer)
    }
  }, [isLoading, delay])

  return showSkeleton
}

export default {
  AppleSkeleton,
  AppleSkeletonBalance,
  AppleSkeletonStats,
  AppleSkeletonTransactions,
  AppleSkeletonForm,
  AppleSkeletonTable,
  AppleSkeletonChart,
  AppleSkeletonNavigation,
  AppleSkeletonModal,
  AppleSkeletonEmptyState,
  useSkeleton
}
