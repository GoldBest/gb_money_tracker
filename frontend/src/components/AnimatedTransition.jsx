import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const AnimatedTransition = ({ 
  children, 
  isVisible, 
  direction = 'right',
  animationType = 'slide', // 'slide', 'fade', 'scale', 'parallax'
  duration = 0.3,
  delay = 0
}) => {
  const getVariants = (type, dir) => {
    switch (type) {
      case 'fade':
        return {
          enter: {
            opacity: 0,
            scale: 0.95
          },
          center: {
            opacity: 1,
            scale: 1
          },
          exit: {
            opacity: 0,
            scale: 0.95
          }
        }
      
      case 'scale':
        return {
          enter: {
            opacity: 0,
            scale: 0.5,
            rotateY: dir === 'right' ? 15 : -15
          },
          center: {
            opacity: 1,
            scale: 1,
            rotateY: 0
          },
          exit: {
            opacity: 0,
            scale: 0.5,
            rotateY: dir === 'right' ? -15 : 15
          }
        }
      
      case 'parallax':
        return {
          enter: {
            opacity: 0,
            y: dir === 'down' ? 100 : -100,
            scale: 0.9,
            rotateX: dir === 'down' ? 10 : -10
          },
          center: {
            opacity: 1,
            y: 0,
            scale: 1,
            rotateX: 0
          },
          exit: {
            opacity: 0,
            y: dir === 'down' ? -100 : 100,
            scale: 0.9,
            rotateX: dir === 'down' ? -10 : 10
          }
        }
      
      case 'slide':
      default:
        return {
          enter: (direction) => ({
            x: direction === 'right' ? 300 : -300,
            opacity: 0,
            scale: 0.8,
            rotateY: direction === 'right' ? 5 : -5
          }),
          center: {
            x: 0,
            opacity: 1,
            scale: 1,
            rotateY: 0
          },
          exit: (direction) => ({
            x: direction === 'right' ? -300 : 300,
            opacity: 0,
            scale: 0.8,
            rotateY: direction === 'right' ? -5 : 5
          })
        }
    }
  }

  const variants = getVariants(animationType, direction)

  return (
    <AnimatePresence mode="wait">
      {isVisible && (
        <motion.div
          key={`${animationType}-${direction}`}
          custom={direction}
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{
            type: "spring",
            stiffness: 300,
            damping: 30,
            duration: duration,
            delay: delay
          }}
          style={{ 
            width: '100%',
            perspective: animationType === 'parallax' ? '1000px' : 'none'
          }}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default AnimatedTransition
