'use client'

// CSS-based Mini Globe with Realistic 2D Earth - for sidebar
import React from 'react'
import { motion } from 'framer-motion'
import { mockSubjects } from '@/lib/mock-data'
import { useDashboardStore } from '@/lib/store'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

// Realistic continent paths (simplified for mini view but recognizable shapes)
const miniContinents = {
  // North America - recognizable shape with Canada, USA, Mexico
  northAmerica: 'M 12,18 L 14,14 L 18,12 L 24,13 L 28,16 L 30,14 L 32,16 L 30,20 L 28,22 L 26,26 L 22,30 L 18,28 L 16,24 L 14,22 L 12,20 Z',
  // South America - distinctive elongated shape
  southAmerica: 'M 22,34 L 26,32 L 30,34 L 32,38 L 30,44 L 28,50 L 24,54 L 22,52 L 20,46 L 20,40 Z',
  // Europe - compact landmass
  europe: 'M 44,14 L 48,12 L 52,14 L 54,16 L 52,20 L 48,22 L 44,20 L 42,16 Z',
  // Africa - large distinctive shape
  africa: 'M 42,26 L 48,24 L 54,26 L 56,32 L 54,40 L 50,48 L 46,50 L 42,46 L 40,38 L 40,30 Z',
  // Asia - largest continent spanning wide
  asia: 'M 52,10 L 58,8 L 66,10 L 72,14 L 76,18 L 74,24 L 70,28 L 64,30 L 58,28 L 54,24 L 52,18 L 54,14 Z',
  // Australia/Oceania
  oceania: 'M 68,40 L 74,38 L 78,42 L 76,48 L 72,50 L 68,48 L 66,44 Z',
}

// Map subjects to continents - each subject becomes a "land"
const continentSubjects = [
  { key: 'northAmerica', subjectId: '1', label: 'DSA' },      // Data Structures
  { key: 'europe', subjectId: '2', label: 'Physics' },        // Physics
  { key: 'asia', subjectId: '3', label: 'Math' },             // Mathematics (largest)
  { key: 'africa', subjectId: '4', label: 'Chem' },           // Chemistry
  { key: 'southAmerica', subjectId: '5', label: 'Bio' },      // Biology
  { key: 'oceania', subjectId: '6', label: 'Eng' },           // English
]

function getColorFromScore(score: number): string {
  if (score < 35) return '#ef4444'
  if (score < 75) return '#f59e0b'
  return '#22c55e'
}

// Fixed star positions to avoid hydration mismatch
const starPositions = [
  { left: '15%', top: '20%' },
  { left: '75%', top: '15%' },
  { left: '85%', top: '45%' },
  { left: '25%', top: '70%' },
  { left: '60%', top: '80%' },
  { left: '40%', top: '25%' },
  { left: '70%', top: '65%' },
  { left: '20%', top: '45%' },
]

export function MiniGlobe() {
  const { setCurrentView } = useDashboardStore()

  return (
    <TooltipProvider delayDuration={0}>
      <Tooltip>
        <TooltipTrigger asChild>
          <motion.button
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setCurrentView('subject-health')}
            className="w-14 h-14 mx-auto rounded-full overflow-hidden border-2 border-cyan-500/40 hover:border-cyan-400/60 transition-all cursor-pointer relative"
            style={{
              background: 'linear-gradient(135deg, #0c1929 0%, #1a365d 50%, #0f172a 100%)',
              boxShadow: '0 0 20px rgba(6, 182, 212, 0.3), inset 0 0 30px rgba(0, 0, 0, 0.5)',
            }}
          >
            {/* Stars - using fixed positions to avoid hydration mismatch */}
            <div className="absolute inset-0">
              {starPositions.map((pos, i) => (
                <motion.div
                  key={i}
                  className="absolute rounded-full bg-white"
                  style={{
                    left: pos.left,
                    top: pos.top,
                    width: i % 3 === 0 ? 2 : 1,
                    height: i % 3 === 0 ? 2 : 1,
                    opacity: 0.4 + (i % 3) * 0.2,
                  }}
                  animate={{
                    opacity: [0.3, 0.8, 0.3],
                  }}
                  transition={{
                    duration: 2 + i * 0.3,
                    repeat: Infinity,
                    delay: i * 0.2,
                  }}
                />
              ))}
            </div>

            {/* Ocean base */}
            <div 
              className="absolute inset-1 rounded-full"
              style={{
                background: `
                  radial-gradient(ellipse at 30% 20%, 
                    #0ea5e9 0%,
                    #0284c7 20%, 
                    #0369a1 40%,
                    #075985 60%,
                    #0c4a6e 80%,
                    #164e63 100%
                  )
                `,
                boxShadow: 'inset -3px -3px 10px rgba(0,0,0,0.4), inset 2px 2px 6px rgba(125, 211, 252, 0.15)',
              }}
            >
              {/* Realistic continent SVG */}
              <svg
                viewBox="0 0 80 60"
                className="absolute inset-0 w-full h-full"
                style={{ padding: '4px' }}
              >
                {/* Ocean texture lines */}
                <defs>
                  <pattern id="oceanWaves" patternUnits="userSpaceOnUse" width="20" height="20">
                    <path d="M0,10 Q5,5 10,10 T20,10" stroke="rgba(125,211,252,0.1)" fill="none" strokeWidth="0.5"/>
                  </pattern>
                </defs>
                <rect width="80" height="60" fill="url(#oceanWaves)" opacity="0.5"/>
                
                {/* Continents as subject lands */}
                {continentSubjects.map(({ key, subjectId }) => {
                  const subject = mockSubjects.find(s => s.id === subjectId)
                  const baseColor = subject?.color || '#22c55e'
                  const score = subject?.marks || 0
                  const healthColor = getColorFromScore(score)
                  const path = miniContinents[key as keyof typeof miniContinents]
                  
                  return (
                    <g key={key}>
                      {/* Land shadow */}
                      <path
                        d={path}
                        fill="rgba(0,0,0,0.3)"
                        transform="translate(1, 1)"
                      />
                      {/* Main land with gradient effect */}
                      <path
                        d={path}
                        fill={healthColor}
                        opacity={0.9}
                        stroke={baseColor}
                        strokeWidth="0.5"
                        style={{
                          filter: `drop-shadow(0 0 2px ${healthColor})`,
                        }}
                      />
                      {/* Land highlight */}
                      <path
                        d={path}
                        fill="url(#landHighlight)"
                        opacity={0.3}
                      />
                    </g>
                  )
                })}
                
                {/* Land highlight gradient */}
                <defs>
                  <linearGradient id="landHighlight" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="white" stopOpacity="0.4"/>
                    <stop offset="50%" stopColor="white" stopOpacity="0"/>
                    <stop offset="100%" stopColor="black" stopOpacity="0.2"/>
                  </linearGradient>
                </defs>
              </svg>

              {/* Atmosphere rim light */}
              <div
                className="absolute inset-0 rounded-full pointer-events-none"
                style={{
                  background: `
                    radial-gradient(circle at 30% 20%, rgba(255,255,255,0.2) 0%, transparent 40%),
                    radial-gradient(circle at 70% 80%, rgba(6, 182, 212, 0.15) 0%, transparent 40%)
                  `,
                }}
              />
              
              {/* Specular highlight */}
              <div
                className="absolute inset-0 rounded-full pointer-events-none"
                style={{
                  background: 'radial-gradient(ellipse 40% 30% at 25% 25%, rgba(255,255,255,0.35) 0%, transparent 100%)',
                }}
              />
            </div>
            
            {/* Outer glow */}
            <div
              className="absolute -inset-1 rounded-full pointer-events-none"
              style={{
                background: 'radial-gradient(circle, transparent 45%, rgba(6, 182, 212, 0.15) 100%)',
              }}
            />
          </motion.button>
        </TooltipTrigger>
        <TooltipContent side="right" sideOffset={8}>
          <div className="text-center">
            <span className="font-medium">Subject Grade Map</span>
            <div className="text-xs text-muted-foreground mt-1">Click to view details</div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
