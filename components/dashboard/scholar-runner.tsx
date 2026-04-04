'use client'

import { useRef, useEffect, useCallback, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

// Game constants
const GAME_WIDTH = 800
const GAME_HEIGHT = 400
const GROUND_Y = 320
const PLAYER_WIDTH = 50
const PLAYER_HEIGHT = 60
const GRAVITY = 0.8
const JUMP_FORCE = -15
const HIGH_JUMP_FORCE = -20
const BASE_SPEED = 5
const OBSTACLE_GAP_MIN = 150
const OBSTACLE_GAP_MAX = 300

// Types
interface Player {
  x: number
  y: number
  vy: number
  isJumping: boolean
  isDucking: boolean
}

interface Obstacle {
  x: number
  y: number
  width: number
  height: number
  type: 'books' | 'binary' | 'clock' | 'spike'
}

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  life: number
  color: string
}

interface Star {
  x: number
  y: number
  size: number
  opacity: number
  blinkSpeed: number
}

// Obstacle types with emojis and styling
const obstacleTypes = [
  { type: 'books' as const, emoji: '\uD83D\uDCDA', width: 40, height: 50 },
  { type: 'binary' as const, emoji: '01', width: 35, height: 45 },
  { type: 'clock' as const, emoji: '\u23F0', width: 35, height: 45 },
  { type: 'spike' as const, emoji: '\u26A0\uFE0F', width: 30, height: 40 },
]

export function ScholarRunner() {
  // Game state refs (for 60fps performance)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const gameLoopRef = useRef<number | null>(null)
  const playerRef = useRef<Player>({
    x: 100,
    y: GROUND_Y - PLAYER_HEIGHT,
    vy: 0,
    isJumping: false,
    isDucking: false,
  })
  const obstaclesRef = useRef<Obstacle[]>([])
  const particlesRef = useRef<Particle[]>([])
  const starsRef = useRef<Star[]>([])
  const gameSpeedRef = useRef(BASE_SPEED)
  const scoreRef = useRef(0)
  const comboRef = useRef(0)
  const lastJumpTimeRef = useRef(0)
  const isGameOverRef = useRef(false)
  const isPausedRef = useRef(false)
  const frameCountRef = useRef(0)
  const shakeRef = useRef({ x: 0, y: 0, duration: 0 })
  const deepFocusRef = useRef(false)
  const nextObstacleDistRef = useRef(OBSTACLE_GAP_MAX)
  
  // React state for UI updates
  const [score, setScore] = useState(0)
  const [milestone, setMilestone] = useState(0)
  const [combo, setCombo] = useState(0)
  const [isDeepFocus, setIsDeepFocus] = useState(false)
  const [gameOver, setGameOver] = useState(false)
  const [won, setWon] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [shake, setShake] = useState(false)

  // Initialize stars
  useEffect(() => {
    const stars: Star[] = []
    for (let i = 0; i < 50; i++) {
      stars.push({
        x: Math.random() * GAME_WIDTH,
        y: Math.random() * (GROUND_Y - 100),
        size: Math.random() * 2 + 1,
        opacity: Math.random() * 0.5 + 0.3,
        blinkSpeed: Math.random() * 0.02 + 0.01,
      })
    }
    starsRef.current = stars
  }, [])

  // Spawn obstacle
  const spawnObstacle = useCallback(() => {
    const type = obstacleTypes[Math.floor(Math.random() * obstacleTypes.length)]
    const obstacle: Obstacle = {
      x: GAME_WIDTH + 50,
      y: GROUND_Y - type.height,
      width: type.width,
      height: type.height,
      type: type.type,
    }
    obstaclesRef.current.push(obstacle)
  }, [])

  // Add particles
  const addParticles = useCallback((x: number, y: number, color: string, count: number) => {
    for (let i = 0; i < count; i++) {
      particlesRef.current.push({
        x,
        y,
        vx: (Math.random() - 0.5) * 8,
        vy: (Math.random() - 0.5) * 8 - 3,
        life: 1,
        color,
      })
    }
  }, [])

  // AABB Collision detection
  const checkCollision = useCallback((player: Player, obstacle: Obstacle): boolean => {
    const playerBox = {
      x: player.x + 10,
      y: player.y + (player.isDucking ? 30 : 10),
      width: PLAYER_WIDTH - 20,
      height: player.isDucking ? PLAYER_HEIGHT - 30 : PLAYER_HEIGHT - 20,
    }
    return (
      playerBox.x < obstacle.x + obstacle.width &&
      playerBox.x + playerBox.width > obstacle.x &&
      playerBox.y < obstacle.y + obstacle.height &&
      playerBox.y + playerBox.height > obstacle.y
    )
  }, [])

  // Game loop
  const gameLoop = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    if (isPausedRef.current || isGameOverRef.current) {
      gameLoopRef.current = requestAnimationFrame(gameLoop)
      return
    }

    frameCountRef.current++
    const player = playerRef.current

    // Update shake
    if (shakeRef.current.duration > 0) {
      shakeRef.current.duration--
      shakeRef.current.x = (Math.random() - 0.5) * 10
      shakeRef.current.y = (Math.random() - 0.5) * 10
    } else {
      shakeRef.current.x = 0
      shakeRef.current.y = 0
    }

    // Clear canvas
    ctx.save()
    ctx.translate(shakeRef.current.x, shakeRef.current.y)

    // Draw parallax background layers
    // Far layer - deep navy with binary stars
    const gradient1 = ctx.createLinearGradient(0, 0, 0, GAME_HEIGHT)
    gradient1.addColorStop(0, '#0A192F')
    gradient1.addColorStop(1, '#0D1B2A')
    ctx.fillStyle = gradient1
    ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT)

    // Draw twinkling binary stars
    starsRef.current.forEach(star => {
      star.opacity += star.blinkSpeed * (Math.sin(frameCountRef.current * 0.05 + star.x) > 0 ? 1 : -1)
      star.opacity = Math.max(0.2, Math.min(0.8, star.opacity))
      
      ctx.fillStyle = `rgba(100, 200, 255, ${star.opacity})`
      ctx.font = `${star.size * 6}px monospace`
      ctx.fillText(Math.random() > 0.5 ? '0' : '1', star.x, star.y)
    })

    // Mid layer - purple skyline silhouettes
    ctx.fillStyle = '#1A0A2E'
    const skylineHeight = 150
    for (let i = 0; i < 8; i++) {
      const x = (i * 120 - (frameCountRef.current * 0.3) % 120 + GAME_WIDTH) % GAME_WIDTH - 60
      const height = 80 + Math.sin(i * 1.5) * 40
      ctx.fillRect(x, GROUND_Y - skylineHeight - height + 50, 100, height + skylineHeight)
      // Windows
      ctx.fillStyle = 'rgba(100, 80, 200, 0.3)'
      for (let j = 0; j < 3; j++) {
        for (let k = 0; k < 4; k++) {
          if (Math.random() > 0.3) {
            ctx.fillRect(x + 10 + j * 30, GROUND_Y - skylineHeight - height + 60 + k * 30, 15, 20)
          }
        }
      }
      ctx.fillStyle = '#1A0A2E'
    }

    // Near layer - pulsing electric blue floor
    const pulseIntensity = 0.5 + Math.sin(frameCountRef.current * 0.1) * 0.3
    const floorGradient = ctx.createLinearGradient(0, GROUND_Y - 10, 0, GAME_HEIGHT)
    floorGradient.addColorStop(0, `rgba(0, 119, 255, ${pulseIntensity})`)
    floorGradient.addColorStop(0.1, `rgba(0, 119, 255, ${pulseIntensity * 0.5})`)
    floorGradient.addColorStop(1, 'rgba(0, 50, 100, 0.3)')
    ctx.fillStyle = floorGradient
    ctx.fillRect(0, GROUND_Y - 5, GAME_WIDTH, GAME_HEIGHT - GROUND_Y + 5)

    // Pulsing floor line
    ctx.strokeStyle = `rgba(0, 200, 255, ${pulseIntensity})`
    ctx.lineWidth = 3
    ctx.shadowColor = '#0077FF'
    ctx.shadowBlur = 15
    ctx.beginPath()
    ctx.moveTo(0, GROUND_Y)
    ctx.lineTo(GAME_WIDTH, GROUND_Y)
    ctx.stroke()
    ctx.shadowBlur = 0

    // Update and draw player
    player.vy += GRAVITY
    player.y += player.vy

    // Ground collision
    const groundLevel = GROUND_Y - (player.isDucking ? PLAYER_HEIGHT * 0.6 : PLAYER_HEIGHT)
    if (player.y >= groundLevel) {
      player.y = groundLevel
      player.vy = 0
      if (player.isJumping) {
        player.isJumping = false
        // Squash effect on landing
        addParticles(player.x + PLAYER_WIDTH / 2, GROUND_Y, '#0077FF', 5)
      }
    }

    // Draw player - Cute graduation cap with sneakers
    const isInAir = player.y < groundLevel
    const squash = player.vy > 5 ? 0.8 : (player.vy < -5 ? 1.2 : 1)
    const stretch = player.vy > 5 ? 1.2 : (player.vy < -5 ? 0.8 : 1)

    ctx.save()
    ctx.translate(player.x + PLAYER_WIDTH / 2, player.y + PLAYER_HEIGHT / 2)
    ctx.scale(squash, stretch)

    // Deep Focus glow effect
    if (deepFocusRef.current) {
      ctx.shadowColor = '#FFD700'
      ctx.shadowBlur = 30
    }

    // Body - cute bouncy shape
    const bodyColor = deepFocusRef.current ? '#FFD700' : '#4FD1C5'
    ctx.fillStyle = bodyColor
    ctx.beginPath()
    ctx.ellipse(0, 10, 18, 22, 0, 0, Math.PI * 2)
    ctx.fill()

    // Graduation cap
    ctx.fillStyle = '#1A1A2E'
    ctx.beginPath()
    ctx.moveTo(-25, -15)
    ctx.lineTo(25, -15)
    ctx.lineTo(20, -5)
    ctx.lineTo(-20, -5)
    ctx.closePath()
    ctx.fill()

    // Cap top
    ctx.fillStyle = '#2D3748'
    ctx.fillRect(-18, -25, 36, 12)

    // Tassel
    ctx.strokeStyle = '#FFD700'
    ctx.lineWidth = 3
    ctx.beginPath()
    ctx.moveTo(0, -25)
    ctx.quadraticCurveTo(20 + Math.sin(frameCountRef.current * 0.2) * 5, -15, 25, 0)
    ctx.stroke()
    ctx.fillStyle = '#FFD700'
    ctx.beginPath()
    ctx.arc(25, 0, 5, 0, Math.PI * 2)
    ctx.fill()

    // Cute eyes
    ctx.fillStyle = '#FFF'
    ctx.beginPath()
    ctx.ellipse(-8, 5, 6, 7, 0, 0, Math.PI * 2)
    ctx.ellipse(8, 5, 6, 7, 0, 0, Math.PI * 2)
    ctx.fill()
    ctx.fillStyle = '#1A1A2E'
    ctx.beginPath()
    ctx.arc(-8, 6, 3, 0, Math.PI * 2)
    ctx.arc(8, 6, 3, 0, Math.PI * 2)
    ctx.fill()

    // Blush
    ctx.fillStyle = 'rgba(255, 150, 150, 0.5)'
    ctx.beginPath()
    ctx.ellipse(-15, 12, 5, 3, 0, 0, Math.PI * 2)
    ctx.ellipse(15, 12, 5, 3, 0, 0, Math.PI * 2)
    ctx.fill()

    // Cute smile
    ctx.strokeStyle = '#1A1A2E'
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.arc(0, 10, 8, 0.2, Math.PI - 0.2)
    ctx.stroke()

    // Tiny futuristic sneakers
    ctx.fillStyle = '#0077FF'
    ctx.fillRect(-15, 28, 12, 8)
    ctx.fillRect(3, 28, 12, 8)
    // Shoe glow
    ctx.fillStyle = 'rgba(0, 200, 255, 0.8)'
    ctx.fillRect(-13, 34, 8, 2)
    ctx.fillRect(5, 34, 8, 2)

    ctx.shadowBlur = 0
    ctx.restore()

    // Motion trail when in air
    if (isInAir && frameCountRef.current % 3 === 0) {
      addParticles(player.x + PLAYER_WIDTH / 2, player.y + PLAYER_HEIGHT / 2, 
        deepFocusRef.current ? '#FFD700' : '#4FD1C5', 2)
    }

    // Deep focus particles
    if (deepFocusRef.current && frameCountRef.current % 5 === 0) {
      addParticles(player.x + PLAYER_WIDTH / 2, player.y + PLAYER_HEIGHT, '#FFD700', 3)
    }

    // Update and draw obstacles
    nextObstacleDistRef.current -= gameSpeedRef.current
    if (nextObstacleDistRef.current <= 0) {
      spawnObstacle()
      nextObstacleDistRef.current = OBSTACLE_GAP_MIN + Math.random() * (OBSTACLE_GAP_MAX - OBSTACLE_GAP_MIN)
    }

    obstaclesRef.current = obstaclesRef.current.filter(obstacle => {
      obstacle.x -= gameSpeedRef.current

      // Draw obstacle with glassmorphism card
      ctx.save()
      
      // Glass card background
      ctx.fillStyle = 'rgba(30, 30, 60, 0.6)'
      ctx.strokeStyle = 'rgba(100, 100, 255, 0.5)'
      ctx.lineWidth = 2
      ctx.shadowColor = 'rgba(100, 100, 255, 0.5)'
      ctx.shadowBlur = 10
      
      const cardPadding = 8
      ctx.beginPath()
      ctx.roundRect(
        obstacle.x - cardPadding, 
        obstacle.y - cardPadding, 
        obstacle.width + cardPadding * 2, 
        obstacle.height + cardPadding * 2, 
        8
      )
      ctx.fill()
      ctx.stroke()
      ctx.shadowBlur = 0

      // Draw emoji/text
      ctx.font = `${obstacle.height * 0.6}px Arial`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      
      const emoji = obstacleTypes.find(t => t.type === obstacle.type)?.emoji || '\uD83D\uDCDA'
      ctx.fillStyle = '#FFF'
      ctx.fillText(emoji, obstacle.x + obstacle.width / 2, obstacle.y + obstacle.height / 2)

      ctx.restore()

      // Check collision
      if (checkCollision(player, obstacle)) {
        // Hit!
        shakeRef.current.duration = 15
        setShake(true)
        setTimeout(() => setShake(false), 200)
        comboRef.current = 0
        setCombo(0)
        deepFocusRef.current = false
        setIsDeepFocus(false)
        addParticles(player.x + PLAYER_WIDTH / 2, player.y + PLAYER_HEIGHT / 2, '#FF4444', 15)
        return false
      }

      // Cleared obstacle
      if (obstacle.x + obstacle.width < player.x && !('cleared' in obstacle)) {
        (obstacle as any).cleared = true
        scoreRef.current++
        setScore(scoreRef.current)
        
        // Check for rapid jumps (combo)
        const now = Date.now()
        if (now - lastJumpTimeRef.current < 1500) {
          comboRef.current++
          setCombo(comboRef.current)
          if (comboRef.current >= 3 && !deepFocusRef.current) {
            deepFocusRef.current = true
            setIsDeepFocus(true)
            addParticles(player.x + PLAYER_WIDTH / 2, player.y + PLAYER_HEIGHT / 2, '#FFD700', 30)
          }
        } else {
          comboRef.current = 1
          setCombo(1)
        }
        lastJumpTimeRef.current = now

        // Update milestone
        const newMilestone = Math.min(10, scoreRef.current)
        setMilestone(newMilestone)

        // Increase speed every 3 obstacles
        if (scoreRef.current % 3 === 0) {
          gameSpeedRef.current *= 1.15
        }

        // Win condition
        if (scoreRef.current >= 10) {
          isGameOverRef.current = true
          setWon(true)
          setGameOver(true)
        }

        addParticles(obstacle.x, obstacle.y, '#4FD1C5', 8)
      }

      return obstacle.x > -100
    })

    // Update and draw particles
    particlesRef.current = particlesRef.current.filter(particle => {
      particle.x += particle.vx
      particle.y += particle.vy
      particle.vy += 0.2
      particle.life -= 0.03

      if (particle.life > 0) {
        ctx.fillStyle = particle.color
        ctx.globalAlpha = particle.life
        ctx.beginPath()
        ctx.arc(particle.x, particle.y, 3, 0, Math.PI * 2)
        ctx.fill()
        ctx.globalAlpha = 1
      }

      return particle.life > 0
    })

    ctx.restore()

    gameLoopRef.current = requestAnimationFrame(gameLoop)
  }, [spawnObstacle, addParticles, checkCollision])

  // Input handlers
  const jump = useCallback((highJump = false) => {
    const player = playerRef.current
    if (!player.isJumping && !isGameOverRef.current) {
      player.vy = highJump ? HIGH_JUMP_FORCE : JUMP_FORCE
      player.isJumping = true
      player.isDucking = false
      addParticles(player.x + PLAYER_WIDTH / 2, GROUND_Y, '#0077FF', 5)
    }
  }, [addParticles])

  const duck = useCallback((isDucking: boolean) => {
    const player = playerRef.current
    if (!player.isJumping) {
      player.isDucking = isDucking
    }
    // Fast fall when in air
    if (player.isJumping && isDucking) {
      player.vy = Math.max(player.vy, 10)
    }
  }, [])

  // Keyboard controls
  useEffect(() => {
    if (!isPlaying) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'ArrowUp') {
        e.preventDefault()
        jump()
      } else if (e.code === 'KeyW') {
        e.preventDefault()
        jump(true)
      } else if (e.code === 'KeyS' || e.code === 'ArrowDown') {
        e.preventDefault()
        duck(true)
      }
    }

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'KeyS' || e.code === 'ArrowDown') {
        duck(false)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [isPlaying, jump, duck])

  // Touch controls
  const handleTouch = useCallback(() => {
    if (!isGameOverRef.current) {
      jump()
    }
  }, [jump])

  // Start game
  const startGame = useCallback(() => {
    // Reset all state
    playerRef.current = {
      x: 100,
      y: GROUND_Y - PLAYER_HEIGHT,
      vy: 0,
      isJumping: false,
      isDucking: false,
    }
    obstaclesRef.current = []
    particlesRef.current = []
    gameSpeedRef.current = BASE_SPEED
    scoreRef.current = 0
    comboRef.current = 0
    isGameOverRef.current = false
    deepFocusRef.current = false
    nextObstacleDistRef.current = OBSTACLE_GAP_MAX
    frameCountRef.current = 0

    setScore(0)
    setMilestone(0)
    setCombo(0)
    setIsDeepFocus(false)
    setGameOver(false)
    setWon(false)
    setIsPlaying(true)

    // Start game loop
    if (gameLoopRef.current) {
      cancelAnimationFrame(gameLoopRef.current)
    }
    gameLoopRef.current = requestAnimationFrame(gameLoop)
  }, [gameLoop])

  // Cleanup
  useEffect(() => {
    return () => {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current)
      }
    }
  }, [])

  // Scroll to dashboard on win
  const handleLaunchDashboard = useCallback(() => {
    setWon(false)
    setGameOver(false)
    setIsPlaying(false)
  }, [])

  return (
    <div className="flex flex-col items-center">
      {/* Scholar Progress Bar */}
      <div className="w-full max-w-[800px] mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-muted-foreground">Scholar Progress</span>
          <div className="flex items-center gap-4">
            {isDeepFocus && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="text-sm font-bold text-yellow-400 flex items-center gap-1"
              >
                <span className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse" />
                Deep Focus!
              </motion.span>
            )}
            {combo >= 2 && (
              <span className="text-sm font-bold text-primary">
                x{combo} Combo!
              </span>
            )}
            <span className="text-sm font-bold text-foreground">{milestone}/10</span>
          </div>
        </div>
        <div className="h-3 bg-muted/30 rounded-full overflow-hidden border border-border">
          <motion.div
            className="h-full bg-gradient-to-r from-primary to-accent"
            initial={{ width: 0 }}
            animate={{ width: `${(milestone / 10) * 100}%` }}
            transition={{ type: 'spring', stiffness: 100 }}
          />
        </div>
      </div>

      {/* Game Canvas */}
      <div 
        className={cn(
          "relative rounded-xl overflow-hidden border border-border shadow-lg",
          shake && "animate-pulse"
        )}
        style={{ 
          boxShadow: isDeepFocus ? '0 0 30px rgba(255, 215, 0, 0.5)' : '0 0 20px rgba(0, 119, 255, 0.3)'
        }}
      >
        <canvas
          ref={canvasRef}
          width={GAME_WIDTH}
          height={GAME_HEIGHT}
          className="block max-w-full h-auto"
          style={{ imageRendering: 'pixelated' }}
          onClick={handleTouch}
          onTouchStart={handleTouch}
        />

        {/* Start Screen */}
        <AnimatePresence>
          {!isPlaying && !gameOver && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-background/80 backdrop-blur-sm flex flex-col items-center justify-center"
            >
              <motion.div
                initial={{ scale: 0.8, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                className="text-center"
              >
                <div className="text-6xl mb-4">\uD83C\uDF93</div>
                <h3 className="text-2xl font-bold text-foreground mb-2">Grad Race</h3>
                <p className="text-sm text-muted-foreground mb-6 max-w-[300px]">
                  Jump over academic hazards! Clear 10 obstacles to prove you&apos;re ready for Nexus!
                </p>
                <div className="flex flex-col gap-2 items-center mb-4">
                  <div className="text-xs text-muted-foreground">
                    <span className="font-mono bg-muted px-2 py-1 rounded">SPACE</span> / 
                    <span className="font-mono bg-muted px-2 py-1 rounded ml-1">UP</span> Jump
                  </div>
                  <div className="text-xs text-muted-foreground">
                    <span className="font-mono bg-muted px-2 py-1 rounded">W</span> High Jump
                  </div>
                  <div className="text-xs text-muted-foreground">
                    <span className="font-mono bg-muted px-2 py-1 rounded">S</span> / 
                    <span className="font-mono bg-muted px-2 py-1 rounded ml-1">DOWN</span> Duck / Fast Fall
                  </div>
                </div>
                <Button onClick={startGame} className="px-8 animate-pulse">
                  Start Game
                </Button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Win Modal */}
        <AnimatePresence>
          {won && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex items-center justify-center"
            >
              {/* Confetti burst effect */}
              <div className="absolute inset-0 overflow-hidden">
                {Array.from({ length: 50 }).map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-3 h-3 rounded-sm"
                    style={{
                      background: ['#FFD700', '#FF6B6B', '#4FD1C5', '#A855F7', '#0077FF'][i % 5],
                      left: `${Math.random() * 100}%`,
                    }}
                    initial={{ y: -20, opacity: 1, rotate: 0 }}
                    animate={{
                      y: GAME_HEIGHT + 50,
                      opacity: 0,
                      rotate: 360 * (Math.random() > 0.5 ? 1 : -1),
                      x: (Math.random() - 0.5) * 200,
                    }}
                    transition={{
                      duration: 2 + Math.random(),
                      delay: Math.random() * 0.5,
                      ease: 'easeOut',
                    }}
                  />
                ))}
              </div>

              {/* Win card */}
              <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', delay: 0.3 }}
                className="relative z-10 bg-card/90 backdrop-blur-xl rounded-2xl p-8 border border-primary/30 shadow-2xl text-center"
                style={{ boxShadow: '0 0 60px rgba(0, 119, 255, 0.4)' }}
              >
                <div className="text-5xl mb-4">\uD83C\uDF93</div>
                <h3 className="text-2xl font-bold text-foreground mb-2">
                  You Are Ready For Nexus!
                </h3>
                <p className="text-sm text-muted-foreground mb-6">
                  Your semester survival instincts are activated.
                </p>
                <Button 
                  onClick={handleLaunchDashboard}
                  className="px-8 animate-pulse"
                  style={{ boxShadow: '0 0 20px rgba(0, 119, 255, 0.5)' }}
                >
                  Play Again
                </Button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Game Over (without winning) */}
        <AnimatePresence>
          {gameOver && !won && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-background/80 backdrop-blur-sm flex flex-col items-center justify-center"
            >
              <motion.div
                initial={{ scale: 0.8, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                className="text-center"
              >
                <div className="text-5xl mb-4">\uD83D\uDCDA</div>
                <h3 className="text-xl font-bold text-foreground mb-2">Study Session Over!</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  You cleared {score} obstacles. Keep practicing!
                </p>
                <Button onClick={startGame}>
                  Try Again
                </Button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <p className="text-xs text-muted-foreground mt-4">
        Tap or use keyboard to jump over obstacles
      </p>
    </div>
  )
}
