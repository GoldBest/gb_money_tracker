import { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'

const ApplePageTransition = ({ 
  children, 
  isVisible, 
  direction = 'right',
  duration = 300,
  onTransitionComplete,
  className = '',
  style = {}
}) => {
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [shouldRender, setShouldRender] = useState(isVisible)
  const timeoutRef = useRef(null)
  const elementRef = useRef(null)

  useEffect(() => {
    if (isVisible) {
      setShouldRender(true)
      // Небольшая задержка для начала анимации
      requestAnimationFrame(() => {
        setIsTransitioning(true)
      })
    } else {
      setIsTransitioning(false)
      // Ждем завершения анимации выхода
      timeoutRef.current = setTimeout(() => {
        setShouldRender(false)
        onTransitionComplete?.()
      }, duration)
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [isVisible, duration, onTransitionComplete])

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  if (!shouldRender) return null

  const getTransitionClass = () => {
    const baseClass = 'apple-page-transition'
    const directionClass = `apple-page-transition-${direction}`
    const stateClass = isTransitioning ? 'apple-page-transition-visible' : 'apple-page-transition-hidden'
    
    return `${baseClass} ${directionClass} ${stateClass} ${className}`.trim()
  }

  const getTransitionStyle = () => {
    return {
      '--apple-transition-duration': `${duration}ms`,
      ...style
    }
  }

  return (
    <div
      ref={elementRef}
      className={getTransitionClass()}
      style={getTransitionStyle()}
    >
      {children}
    </div>
  )
}

// Компонент для анимированного перехода между табами
export const AppleTabTransition = ({ 
  children, 
  activeTab, 
  tabId, 
  direction = 'right',
  duration = 300 
}) => {
  const [isVisible, setIsVisible] = useState(false)
  const [isLeaving, setIsLeaving] = useState(false)
  const timeoutRef = useRef(null)

  useEffect(() => {
    if (activeTab === tabId) {
      setIsLeaving(false)
      setIsVisible(true)
    } else if (isVisible) {
      setIsLeaving(true)
      timeoutRef.current = setTimeout(() => {
        setIsVisible(false)
        setIsLeaving(false)
      }, duration)
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [activeTab, tabId, duration, isVisible])

  if (!isVisible) return null

  const getTransitionClass = () => {
    const baseClass = 'apple-tab-transition'
    const directionClass = `apple-tab-transition-${direction}`
    const stateClass = isLeaving ? 'apple-tab-transition-leaving' : 'apple-tab-transition-entering'
    
    return `${baseClass} ${directionClass} ${stateClass}`.trim()
  }

  return (
    <div
      className={getTransitionClass()}
      style={{ '--apple-transition-duration': `${duration}ms` }}
    >
      {children}
    </div>
  )
}

// Компонент для анимированного списка с staggered анимациями
export const AppleStaggeredList = ({ 
  children, 
  staggerDelay = 100,
  className = '',
  style = {}
}) => {
  const childrenArray = Array.isArray(children) ? children : [children]

  return (
    <div className={`apple-staggered-list ${className}`} style={style}>
      {childrenArray.map((child, index) => (
        <div
          key={index}
          className="apple-staggered-item"
          style={{
            '--apple-stagger-delay': `${index * staggerDelay}ms`
          }}
        >
          {child}
        </div>
      ))}
    </div>
  )
}

// Компонент для анимированного появления элементов
export const AppleFadeIn = ({ 
  children, 
  delay = 0,
  duration = 300,
  className = '',
  style = {}
}) => {
  const [isVisible, setIsVisible] = useState(false)
  const elementRef = useRef(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => {
            setIsVisible(true)
          }, delay)
          observer.unobserve(entry.target)
        }
      },
      {
        threshold: 0.1,
        rootMargin: '50px'
      }
    )

    if (elementRef.current) {
      observer.observe(elementRef.current)
    }

    return () => {
      if (elementRef.current) {
        observer.unobserve(elementRef.current)
      }
    }
  }, [delay])

  const getTransitionClass = () => {
    const baseClass = 'apple-fade-in'
    const stateClass = isVisible ? 'apple-fade-in-visible' : 'apple-fade-in-hidden'
    
    return `${baseClass} ${stateClass} ${className}`.trim()
  }

  const getTransitionStyle = () => {
    return {
      '--apple-fade-duration': `${duration}ms`,
      '--apple-fade-delay': `${delay}ms`,
      ...style
    }
  }

  return (
    <div
      ref={elementRef}
      className={getTransitionClass()}
      style={getTransitionStyle()}
    >
      {children}
    </div>
  )
}

// Компонент для анимированного счетчика
export const AppleAnimatedCounter = ({ 
  value, 
  duration = 1000,
  className = '',
  style = {}
}) => {
  const [displayValue, setDisplayValue] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)
  const animationRef = useRef(null)

  useEffect(() => {
    if (displayValue !== value) {
      setIsAnimating(true)
      
      const startValue = displayValue
      const endValue = value
      const startTime = performance.now()
      
      const animate = (currentTime) => {
        const elapsed = currentTime - startTime
        const progress = Math.min(elapsed / duration, 1)
        
        // Easing function для плавной анимации
        const easeOutQuart = 1 - Math.pow(1 - progress, 4)
        const currentValue = startValue + (endValue - startValue) * easeOutQuart
        
        setDisplayValue(Math.round(currentValue))
        
        if (progress < 1) {
          animationRef.current = requestAnimationFrame(animate)
        } else {
          setIsAnimating(false)
        }
      }
      
      animationRef.current = requestAnimationFrame(animate)
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [value, duration, displayValue])

  const getTransitionClass = () => {
    const baseClass = 'apple-animated-counter'
    const stateClass = isAnimating ? 'apple-animated-counter-animating' : 'apple-animated-counter-idle'
    
    return `${baseClass} ${stateClass} ${className}`.trim()
  }

  return (
    <span
      className={getTransitionClass()}
      style={{
        '--apple-counter-duration': `${duration}ms`,
        ...style
      }}
    >
      {displayValue.toLocaleString()}
    </span>
  )
}

// Хук для управления анимациями
export const useAppleAnimation = (initialState = false) => {
  const [isAnimating, setIsAnimating] = useState(initialState)
  const [animationType, setAnimationType] = useState('')

  const triggerAnimation = (type, duration = 300) => {
    setAnimationType(type)
    setIsAnimating(true)
    
    setTimeout(() => {
      setIsAnimating(false)
      setAnimationType('')
    }, duration)
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

export default ApplePageTransition
