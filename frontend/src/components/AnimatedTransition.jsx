import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const AnimatedTransition = ({ children, isVisible, direction = 'right' }) => {
  const variants = {
    enter: (direction) => ({
      x: direction === 'right' ? 300 : -300,
      opacity: 0,
      scale: 0.8
    }),
    center: {
      x: 0,
      opacity: 1,
      scale: 1
    },
    exit: (direction) => ({
      x: direction === 'right' ? -300 : 300,
      opacity: 0,
      scale: 0.8
    })
  }

  return (
    <AnimatePresence mode="wait">
      {isVisible && (
        <motion.div
          key={direction}
          custom={direction}
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{
            type: "spring",
            stiffness: 300,
            damping: 30,
            duration: 0.3
          }}
          style={{ width: '100%' }}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default AnimatedTransition
