import { useRef, useEffect } from 'react'

// Approximate text block edges as fractions of canvas width (centre-aligned text)
// Each entry: { yFrac, leftFrac, rightFrac } — the bottom edge of that text line
const TEXT_EDGES = [
  { yFrac: 0.37, leftFrac: 0.18, rightFrac: 0.82 }, // "Bathrooms built"
  { yFrac: 0.47, leftFrac: 0.32, rightFrac: 0.68 }, // "to last"
  { yFrac: 0.56, leftFrac: 0.28, rightFrac: 0.72 }, // subtitle line
  { yFrac: 0.65, leftFrac: 0.36, rightFrac: 0.64 }, // CTA button
]

// ── Background rain drop ───────────────────────────────────────────────────────
function makeDrop(canvas) {
  const startX = canvas.width * 0.5 + (Math.random() - 0.5) * canvas.width * 0.08
  const angle  = (Math.random() - 0.5) * 0.6
  const speed  = 9 + Math.random() * 10
  return {
    type: 'rain',
    x:    startX,
    y:    -20 - Math.random() * canvas.height,
    vx:   Math.sin(angle) * speed * 0.18,
    vy:   speed,
    len:  12 + Math.random() * 22,
    op:   0.2 + Math.random() * 0.35,
    glow: Math.random() > 0.85,
  }
}

// ── Drip that runs down the side of a text line ────────────────────────────────
function makeDrip(canvas) {
  const edge    = TEXT_EDGES[Math.floor(Math.random() * TEXT_EDGES.length)]
  const onLeft  = Math.random() > 0.5
  // Start at the left or right edge of the text bounding box
  const x       = canvas.width * (onLeft ? edge.leftFrac : edge.rightFrac)
            + (Math.random() - 0.5) * canvas.width * 0.06
  return {
    type:   'drip',
    x,
    y:      canvas.height * edge.yFrac,
    vy:     0.3 + Math.random() * 0.5,   // starts slow
    acc:    0.012 + Math.random() * 0.018, // gravity
    tail:   3 + Math.random() * 6,
    maxTail: 18 + Math.random() * 22,
    r:      1.2 + Math.random() * 1.4,   // blob radius
    op:     0.65 + Math.random() * 0.3,
    glow:   Math.random() > 0.45,
  }
}

export function HeroRainOverlay() {
  const canvasRef = useRef()

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx    = canvas.getContext('2d')
    let animId

    const RAIN_N = 110
    const DRIP_N = 45

    let drops = []

    const resize = () => {
      canvas.width  = canvas.offsetWidth
      canvas.height = canvas.offsetHeight
      drops = [
        ...Array.from({ length: RAIN_N }, () => makeDrop(canvas)),
        ...Array.from({ length: DRIP_N }, () => {
          const d = makeDrip(canvas)
          d.y += Math.random() * canvas.height * 0.5 // stagger starts
          return d
        }),
      ]
    }

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      for (let i = 0; i < drops.length; i++) {
        const d = drops[i]

        if (d.type === 'rain') {
          // ── Straight falling drop ──────────────────────────────────────────
          ctx.save()
          if (d.glow) { ctx.shadowColor = 'rgba(180,230,255,0.9)'; ctx.shadowBlur = 5 }
          ctx.beginPath()
          ctx.moveTo(d.x, d.y)
          ctx.lineTo(d.x + d.vx * 1.5, d.y + d.len)
          ctx.strokeStyle = `rgba(200,230,248,${d.op})`
          ctx.lineWidth   = d.glow ? 1.1 : 0.75
          ctx.stroke()
          ctx.restore()

          d.y += d.vy
          d.x += d.vx
          if (d.y - d.len > canvas.height || d.x < -30 || d.x > canvas.width + 30) {
            Object.assign(d, makeDrop(canvas))
            d.y = -d.len
          }

        } else {
          // ── Text-edge drip ─────────────────────────────────────────────────
          ctx.save()
          if (d.glow) { ctx.shadowColor = 'rgba(180,230,255,1)'; ctx.shadowBlur = 7 }

          // Blob head (teardrop bottom)
          ctx.beginPath()
          ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2)
          ctx.fillStyle = `rgba(210,238,255,${d.op})`
          ctx.fill()

          // Tail trailing upward
          if (d.tail > 2) {
            const grad = ctx.createLinearGradient(d.x, d.y - d.tail, d.x, d.y)
            grad.addColorStop(0, `rgba(200,230,248,0)`)
            grad.addColorStop(1, `rgba(200,230,248,${d.op * 0.55})`)
            ctx.beginPath()
            ctx.moveTo(d.x - d.r * 0.4, d.y)
            ctx.lineTo(d.x, d.y - d.tail)
            ctx.lineTo(d.x + d.r * 0.4, d.y)
            ctx.fillStyle = grad
            ctx.fill()
          }
          ctx.restore()

          // Accelerate under gravity
          d.vy  += d.acc
          d.y   += d.vy
          d.tail = Math.min(d.tail + d.vy * 0.35, d.maxTail)

          if (d.y - d.tail > canvas.height + 20) {
            Object.assign(d, makeDrip(canvas))
          }
        }
      }

      animId = requestAnimationFrame(draw)
    }

    resize()
    window.addEventListener('resize', resize)
    draw()

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute',
        inset:    0,
        width:    '100%',
        height:   '100%',
        pointerEvents: 'none',
        zIndex:   4,
      }}
    />
  )
}
