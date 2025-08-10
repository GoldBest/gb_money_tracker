import { motion } from 'framer-motion'

const Skeleton = ({ 
  type = 'text', 
  lines = 1, 
  className = '',
  height,
  width,
  rounded = true,
  ...props 
}) => {
  const getSkeletonType = () => {
    switch (type) {
      case 'text':
        return {
          height: height || '1rem',
          width: width || '100%',
          className: 'mb-2 last:mb-0'
        }
      case 'title':
        return {
          height: height || '1.5rem',
          width: width || '60%',
          className: 'mb-3'
        }
      case 'avatar':
        return {
          height: height || '3rem',
          width: width || '3rem',
          className: 'rounded-full'
        }
      case 'button':
        return {
          height: height || '2.5rem',
          width: width || '8rem',
          className: 'rounded-lg'
        }
      case 'card':
        return {
          height: height || '12rem',
          width: width || '100%',
          className: 'rounded-xl'
        }
      case 'image':
        return {
          height: height || '12rem',
          width: width || '100%',
          className: 'rounded-lg'
        }
      default:
        return {
          height: height || '1rem',
          width: width || '100%',
          className: ''
        }
    }
  }

  const skeletonConfig = getSkeletonType()
  const baseClasses = `bg-gray-200 dark:bg-gray-700 loading-shimmer ${skeletonConfig.className} ${className}`

  if (type === 'text' && lines > 1) {
    return (
      <div className="w-full">
        {Array.from({ length: lines }).map((_, index) => (
          <motion.div
            key={index}
            className={`${baseClasses} ${index === lines - 1 ? 'w-3/4' : 'w-full'}`}
            style={{ height: skeletonConfig.height }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: index * 0.1 }}
            {...props}
          />
        ))}
      </div>
    )
  }

  return (
    <motion.div
      className={baseClasses}
      style={{ 
        height: skeletonConfig.height, 
        width: skeletonConfig.width,
        borderRadius: rounded ? undefined : 0
      }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      {...props}
    />
  )
}

// Специализированные компоненты
export const SkeletonText = ({ lines = 3, className = '', ...props }) => (
  <Skeleton type="text" lines={lines} className={className} {...props} />
)

export const SkeletonTitle = ({ className = '', ...props }) => (
  <Skeleton type="title" className={className} {...props} />
)

export const SkeletonAvatar = ({ size = '3rem', className = '', ...props }) => (
  <Skeleton type="avatar" height={size} width={size} className={className} {...props} />
)

export const SkeletonButton = ({ className = '', ...props }) => (
  <Skeleton type="button" className={className} {...props} />
)

export const SkeletonCard = ({ className = '', ...props }) => (
  <Skeleton type="card" className={className} {...props} />
)

export const SkeletonImage = ({ className = '', ...props }) => (
  <Skeleton type="image" className={className} {...props} />
)

// Компонент для карточки с несколькими элементами
export const SkeletonCardContent = ({ className = '', ...props }) => (
  <div className={`p-6 ${className}`} {...props}>
    <div className="flex items-center space-x-4 mb-4">
      <SkeletonAvatar size="3rem" />
      <div className="flex-1">
        <SkeletonTitle width="70%" />
        <SkeletonText lines={2} />
      </div>
    </div>
    <SkeletonText lines={3} />
    <div className="flex space-x-2 mt-4">
      <SkeletonButton width="6rem" />
      <SkeletonButton width="6rem" />
    </div>
  </div>
)

// Компонент для списка
export const SkeletonList = ({ items = 5, className = '', ...props }) => (
  <div className={`space-y-4 ${className}`} {...props}>
    {Array.from({ length: items }).map((_, index) => (
      <div key={index} className="flex items-center space-x-4 p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
        <SkeletonAvatar size="2.5rem" />
        <div className="flex-1">
          <SkeletonTitle width="60%" />
          <SkeletonText lines={1} />
        </div>
        <SkeletonButton width="4rem" />
      </div>
    ))}
  </div>
)

// Компонент для таблицы
export const SkeletonTable = ({ rows = 5, columns = 4, className = '', ...props }) => (
  <div className={`overflow-hidden border border-gray-200 dark:border-gray-700 rounded-lg ${className}`} {...props}>
    {/* Заголовок таблицы */}
    <div className="bg-gray-50 dark:bg-gray-800 px-6 py-3 border-b border-gray-200 dark:border-gray-700">
      <div className="flex space-x-4">
        {Array.from({ length: columns }).map((_, index) => (
          <SkeletonTitle key={index} width="100px" height="1rem" />
        ))}
      </div>
    </div>
    
    {/* Строки таблицы */}
    <div className="divide-y divide-gray-200 dark:divide-gray-700">
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="px-6 py-4">
          <div className="flex space-x-4">
            {Array.from({ length: columns }).map((_, colIndex) => (
              <SkeletonText key={colIndex} width="80px" height="1rem" />
            ))}
          </div>
        </div>
      ))}
    </div>
  </div>
)

export default Skeleton
