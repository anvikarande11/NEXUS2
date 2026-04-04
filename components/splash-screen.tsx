'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'

interface SplashScreenProps {
  onComplete: () => void
}

// Cute animated loading messages
const loadingMessages = [
  "Defeating Stress Monster...",
  "Powering up Nexus...",
  "Loading brain cells...",
  "Syncing neural networks...",
  "Calibrating focus beam...",
]

// Deterministic particle positions to avoid hydration mismatch
const particlePositions = [
  { left: 5, top: 10 },
  { left: 15, top: 85 },
  { left: 25, top: 30 },
  { left: 35, top: 60 },
  { left: 45, top: 15 },
  { left: 55, top: 75 },
  { left: 65, top: 40 },
  { left: 75, top: 90 },
  { left: 85, top: 25 },
  { left: 95, top: 55 },
  { left: 10, top: 50 },
  { left: 20, top: 20 },
  { left: 30, top: 80 },
  { left: 40, top: 45 },
  { left: 50, top: 70 },
  { left: 60, top: 5 },
  { left: 70, top: 65 },
  { left: 80, top: 35 },
  { left: 90, top: 95 },
  { left: 98, top: 50 },
]

const particleDurations = [2.5, 3.2, 2.8, 3.5, 2.2, 3.8, 2.6, 3.1, 2.9, 3.4, 2.3, 3.6, 2.7, 3.3, 2.4, 3.7, 2.1, 3.0, 2.5, 3.2]
const particleDelays = [0.2, 1.5, 0.8, 1.2, 0.5, 1.8, 0.3, 1.0, 0.7, 1.4, 0.1, 1.6, 0.9, 1.3, 0.4, 1.9, 0.6, 1.1, 0.2, 1.7]

export const SplashScreen: React.FC<SplashScreenProps> = ({ onComplete }) => {
  const [progress, setProgress] = useState(0)
  const [messageIndex, setMessageIndex] = useState(0)
  const [showParticles, setShowParticles] = useState(true)
  const [mounted, setMounted] = useState(false)
  
  // Only show particles after mounting to avoid hydration issues
  useEffect(() => {
    setMounted(true)
  }, [])

  // Progress animation
  useEffect(() => {
    const duration = 5000 // 5 seconds
    const interval = 20 // Update every 20ms
    const steps = duration / interval
    const increment = 100 / steps

    const progressInterval = setInterval(() => {
      setProgress(prev => {
        const next = prev + increment
        if (next >= 100) {
          clearInterval(progressInterval)
          // Small delay before completing
          setTimeout(() => {
            setShowParticles(false)
            setTimeout(onComplete, 300)
          }, 200)
          return 100
        }
        return next
      })
    }, interval)

    return () => clearInterval(progressInterval)
  }, [onComplete])

  // Cycle through loading messages
  useEffect(() => {
    const messageInterval = setInterval(() => {
      setMessageIndex(prev => (prev + 1) % loadingMessages.length)
    }, 400)

    return () => clearInterval(messageInterval)
  }, [])

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[100] flex flex-col items-center justify-center overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #1a0a2e 0%, #16213e 50%, #0f0c29 100%)',
        }}
        initial={{ opacity: 1 }}
        exit={{
          opacity: 0,
          scale: 1.05,
          transition: { duration: 0.5, ease: 'easeInOut' },
        }}
      >
        {/* Animated background particles */}
        {mounted && showParticles && (
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {particlePositions.map((pos, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 rounded-full"
                style={{
                  background: i % 2 === 0 ? '#00f5ff' : '#ff6b6b',
                  left: `${pos.left}%`,
                  top: `${pos.top}%`,
                }}
                animate={{
                  y: [0, -30, 0],
                  opacity: [0.3, 0.8, 0.3],
                  scale: [1, 1.5, 1],
                }}
                transition={{
                  duration: particleDurations[i],
                  repeat: Infinity,
                  delay: particleDelays[i],
                }}
              />
            ))}
          </div>
        )}

        {/* Purple vortex glow effect */}
        <motion.div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'radial-gradient(circle at center, rgba(128, 0, 255, 0.15) 0%, transparent 60%)',
          }}
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.5, 0.8, 0.5],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />

        {/* Main Image Container */}
        <motion.div
          className="relative w-full max-w-4xl aspect-video mx-auto px-4"
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        >
          {/* Glow effect behind image */}
          <div className="absolute inset-0 rounded-2xl" 
            style={{
              background: 'linear-gradient(45deg, rgba(255, 107, 107, 0.3) 0%, transparent 50%, rgba(0, 245, 255, 0.3) 100%)',
              filter: 'blur(40px)',
              transform: 'scale(1.1)',
            }}
          />
          
          {/* The STRESS vs NEXAS Image */}
          <div className="relative rounded-2xl overflow-hidden border-2 border-white/10 shadow-2xl">
            <Image
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/STRESS-fg4xxcT2Wdz9vqzauNHZkbv5D0CQOw.png"
              alt="STRESS vs NEXAS - Epic battle between stress and your study companion"
              width={1200}
              height={675}
              className="w-full h-auto object-cover"
              priority
            />
            
            {/* Animated scan line effect */}
            <motion.div
              className="absolute inset-0 pointer-events-none"
              style={{
                background: 'linear-gradient(transparent 0%, rgba(0, 245, 255, 0.1) 50%, transparent 100%)',
                backgroundSize: '100% 4px',
              }}
              animate={{
                backgroundPosition: ['0% 0%', '0% 100%'],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'linear',
              }}
            />
          </div>
        </motion.div>

        {/* Cute Funky Loading Section */}
        <motion.div
          className="mt-8 w-full max-w-md px-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          {/* Loading message with typewriter effect */}
          <div className="text-center mb-4">
            <motion.span
              key={messageIndex}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="text-sm font-mono"
              style={{
                color: '#00f5ff',
                textShadow: '0 0 10px rgba(0, 245, 255, 0.5)',
              }}
            >
              {loadingMessages[messageIndex]}
            </motion.span>
          </div>

          {/* Funky Progress Bar Container */}
          <div className="relative">
            {/* Background track */}
            <div 
              className="h-3 rounded-full overflow-hidden"
              style={{
                background: 'rgba(255, 255, 255, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.3)',
              }}
            >
              {/* Animated gradient fill */}
              <motion.div
                className="h-full rounded-full relative overflow-hidden"
                style={{
                  width: `${progress}%`,
                  background: 'linear-gradient(90deg, #ff6b6b 0%, #feca57 25%, #48dbfb 50%, #ff9ff3 75%, #00f5ff 100%)',
                  backgroundSize: '200% 100%',
                  boxShadow: '0 0 20px rgba(0, 245, 255, 0.5), 0 0 40px rgba(255, 107, 107, 0.3)',
                }}
                animate={{
                  backgroundPosition: ['0% 0%', '200% 0%'],
                }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                  ease: 'linear',
                }}
              >
                {/* Shine effect */}
                <motion.div
                  className="absolute inset-0"
                  style={{
                    background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.4) 50%, transparent 100%)',
                  }}
                  animate={{
                    x: ['-100%', '200%'],
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                />
              </motion.div>
            </div>

            {/* Bouncing emoji indicator */}
            <motion.div
              className="absolute -top-6 text-lg"
              style={{ left: `calc(${progress}% - 12px)` }}
              animate={{
                y: [0, -8, 0],
                rotate: [0, 10, -10, 0],
              }}
              transition={{
                duration: 0.5,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            >
              <span className="drop-shadow-lg">
                {progress < 33 ? '💫' : progress < 66 ? '✨' : '🚀'}
              </span>
            </motion.div>
          </div>

          {/* Progress percentage */}
          <div className="flex justify-between items-center mt-3">
            <span 
              className="text-xs font-bold"
              style={{ color: '#ff6b6b', textShadow: '0 0 10px rgba(255, 107, 107, 0.5)' }}
            >
              STRESS: {Math.max(0, 99 - Math.floor(progress))}%
            </span>
            <motion.span 
              className="text-xs font-mono"
              style={{ color: 'rgba(255, 255, 255, 0.6)' }}
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1, repeat: Infinity }}
            >
              {Math.floor(progress)}%
            </motion.span>
            <span 
              className="text-xs font-bold"
              style={{ color: '#00f5ff', textShadow: '0 0 10px rgba(0, 245, 255, 0.5)' }}
            >
              NEXUS: {Math.floor(progress)}%
            </span>
          </div>

          {/* Cute decorative dots */}
          <div className="flex justify-center gap-2 mt-4">
            {[0, 1, 2, 3, 4].map((i) => (
              <motion.div
                key={i}
                className="w-2 h-2 rounded-full"
                style={{
                  background: progress > (i + 1) * 20 ? '#00f5ff' : 'rgba(255, 255, 255, 0.2)',
                  boxShadow: progress > (i + 1) * 20 ? '0 0 10px #00f5ff' : 'none',
                }}
                animate={progress > (i + 1) * 20 ? {
                  scale: [1, 1.3, 1],
                } : {}}
                transition={{
                  duration: 0.3,
                }}
              />
            ))}
          </div>
        </motion.div>

        {/* Bottom tagline */}
        <motion.p
          className="absolute bottom-8 text-center text-xs"
          style={{ color: 'rgba(255, 255, 255, 0.4)' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          Your study companion is powering up...
        </motion.p>
      </motion.div>
    </AnimatePresence>
  )
}
