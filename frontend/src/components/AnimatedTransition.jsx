import { useState, useEffect } from 'react'

const AnimatedTransition = ({ 
  children, 
  isVisible = true, 
  direction = 'right',
  animationType = 'fade',
  duration = 0.3,
  delay = 0
}) => {
  const [isRendered, setIsRendered] = useState(false)

  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        setIsRendered(true)
      }, delay * 1000)
      
      return () => clearTimeout(timer)
    } else {
      setIsRendered(false)
    }
  }, [isVisible, delay])

  if (!isVisible || !isRendered) {
    return null
  }

  // Простые CSS анимации без внешних библиотек
  const getAnimationStyle = () => {
    const baseStyle = {
      transition: `all ${duration}s ease-in-out`,
      opacity: 1,
      transform: 'translateX(0) scale(1)'
    }

    switch (animationType) {
      case 'fade':
        return {
          ...baseStyle,
          animation: `fadeIn ${duration}s ease-in-out`
        }
      case 'slide':
        return {
          ...baseStyle,
          animation: `slideIn${direction === 'right' ? 'Right' : 'Left'} ${duration}s ease-in-out`
        }
      case 'scale':
        return {
          ...baseStyle,
          animation: `scaleIn ${duration}s ease-in-out`
        }
      default:
        return baseStyle
    }
  }

  return (
    <div style={getAnimationStyle()}>
      {children}
    </div>
  )
}

export default AnimatedTransition
