import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'

const AnimatedList = ({ 
  items = [], 
  renderItem, 
  keyExtractor,
  staggerDelay = 0.1,
  animationType = 'fade', // 'fade', 'slide', 'scale', 'slideUp'
  containerVariants = {},
  itemVariants = {},
  className = '',
  emptyMessage = 'Список пуст',
  loading = false,
  onItemClick,
  selectable = false,
  selectedItems = [],
  onSelectionChange
}) => {
  const [hoveredItem, setHoveredItem] = useState(null)

  const getContainerVariants = () => {
    const baseVariants = {
      hidden: { opacity: 0 },
      visible: {
        opacity: 1,
        transition: {
          staggerChildren: staggerDelay,
          delayChildren: 0.1
        }
      }
    }
    return { ...baseVariants, ...containerVariants }
  }

  const getItemVariants = () => {
    const baseVariants = {
      hidden: { opacity: 0 },
      visible: { opacity: 1 }
    }

    switch (animationType) {
      case 'slide':
        baseVariants.hidden = { 
          opacity: 0, 
          x: -50,
          scale: 0.9
        }
        baseVariants.visible = { 
          opacity: 1, 
          x: 0,
          scale: 1,
          transition: {
            type: "spring",
            stiffness: 300,
            damping: 25
          }
        }
        break
      
      case 'scale':
        baseVariants.hidden = { 
          opacity: 0, 
          scale: 0.8,
          rotateY: -15
        }
        baseVariants.visible = { 
          opacity: 1, 
          scale: 1,
          rotateY: 0,
          transition: {
            type: "spring",
            stiffness: 300,
            damping: 25
          }
        }
        break
      
      case 'slideUp':
        baseVariants.hidden = { 
          opacity: 0, 
          y: 30,
          scale: 0.95
        }
        baseVariants.visible = { 
          opacity: 1, 
          y: 0,
          scale: 1,
          transition: {
            type: "spring",
            stiffness: 300,
            damping: 25
          }
        }
        break
      
      default: // fade
        baseVariants.hidden = { 
          opacity: 0, 
          scale: 0.95
        }
        baseVariants.visible = { 
          opacity: 1, 
          scale: 1,
          transition: {
            duration: 0.3,
            ease: "easeOut"
          }
        }
    }

    return { ...baseVariants, ...itemVariants }
  }

  const handleItemClick = (item, index) => {
    if (selectable && onSelectionChange) {
      const newSelection = selectedItems.includes(item)
        ? selectedItems.filter(i => i !== item)
        : [...selectedItems, item]
      onSelectionChange(newSelection)
    }
    onItemClick?.(item, index)
  }

  const isItemSelected = (item) => {
    return selectable && selectedItems.includes(item)
  }

  if (loading) {
    return (
      <div className={`flex items-center justify-center py-8 ${className}`}>
        <motion.div
          className="flex flex-col items-center gap-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <motion.div
            className="w-8 h-8 border-4 border-blue-200 border-t-blue-500 rounded-full"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
          <span className="text-gray-500">Загрузка...</span>
        </motion.div>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <motion.div 
        className={`flex items-center justify-center py-8 text-gray-500 ${className}`}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        {emptyMessage}
      </motion.div>
    )
  }

  return (
    <motion.div
      className={className}
      variants={getContainerVariants()}
      initial="hidden"
      animate="visible"
    >
      <AnimatePresence mode="popLayout">
        {items.map((item, index) => {
          const key = keyExtractor ? keyExtractor(item, index) : index
          const isSelected = isItemSelected(item)
          
          return (
            <motion.div
              key={key}
              layout
              variants={getItemVariants()}
              whileHover={{ 
                scale: 1.02,
                y: -2,
                transition: { duration: 0.2 }
              }}
              whileTap={{ 
                scale: 0.98,
                transition: { duration: 0.1 }
              }}
              onHoverStart={() => setHoveredItem(key)}
              onHoverEnd={() => setHoveredItem(null)}
              onClick={() => handleItemClick(item, index)}
              className={`
                cursor-pointer transition-all duration-200
                ${isSelected ? 'ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-900/20' : ''}
                ${hoveredItem === key ? 'shadow-lg' : 'shadow-sm'}
              `}
              style={{
                transformOrigin: 'center'
              }}
            >
              {renderItem(item, index, {
                isSelected,
                isHovered: hoveredItem === key,
                isFirst: index === 0,
                isLast: index === items.length - 1
              })}
            </motion.div>
          )
        })}
      </AnimatePresence>
    </motion.div>
  )
}

export default AnimatedList
