import { useRef, useEffect } from 'react'

// ── Three-state particle: FALL → SLIDE along text top → DRIP down ─────────────

export function HeroRainOverlay() {
  const canvasRef = useRef()

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx    = canvas.getContext('2d')
    let W = 0, H = 0
    let animId

    // Measure actual DOM text elements relative to the canvas each frame
    const getZones = () => {
      const canvasRect = canvas.getBoundingClientRect()
      return ['.hero-title', '.hero-subtitle', '.hero-cta-wrap']
        .map(sel => document.querySelector(sel))
        .filter(Boolean)
        .map(el => {
          const r = el.getBoundingClientRect()
          return {
            x: r.left - canvasRect.left,
            y: r.top  - canvasRect.top,
            w: r.width,
            h: r.height,
          }
        })
        .filter(z => z.w > 0 && z.h > 0)
    }

    const resize = () => {
      W = canvas.width  = canvas.offsetWidth
      H = canvas.height = canvas.offsetHeight
    }

    class Drop {
      constructor(stagger = false) { this.reset(stagger) }

      reset(stagger = false) {
        this.state = 'fall'
        this.x   = Math.random() * W
        this.y   = stagger ? -Math.random() * H : -(10 + Math.random() * 80)
        this.vy  = 7 + Math.random() * 9
        this.len = 12 + Math.random() * 22
        this.alpha = 0.15 + Math.random() * 0.3
        this.lw    = 0.5 + Math.random() * 0.6
        this.zone  = null
      }

      // When a falling drop crosses the top of a text zone, start sliding
      checkHit(zones) {
        for (const z of zones) {
          if (this.x >= z.x && this.x <= z.x + z.w &&
              this.y + this.vy >= z.y && this.y < z.y) {
            return z
          }
        }
        return null
      }

      startSlide(zone) {
        this.state      = 'slide'
        this.zone       = zone
        this.slideY     = zone.y
        this.slideDir   = Math.random() < 0.5 ? -1 : 1
        this.slideVx    = 1.2 + Math.random() * 2.8
        this.slideAlpha = 0.75 + Math.random() * 0.25
        // Slide between 25–90 px then drip
        const travel    = 25 + Math.random() * 65
        this.slideEnd   = this.x + this.slideDir * travel
      }

      startDrip() {
        this.state       = 'drip'
        this.dripX       = this.x
        this.dripY       = this.slideY ?? (this.zone?.y ?? this.y)
        this.dripVy      = 0.4 + Math.random() * 0.8
        this.dripAcc     = 0.035 + Math.random() * 0.05
        this.dripR       = 1.4 + Math.random() * 2.0
        this.dripTail    = 2
        this.dripMaxTail = 14 + Math.random() * 22
        this.dripAlpha   = 0.85 + Math.random() * 0.15
      }

      update(zones) {
        if (this.state === 'fall') {
          const hit = this.checkHit(zones)
          if (hit) {
            this.startSlide(hit)
          } else {
            this.y += this.vy
            if (this.y > H + 40) this.reset()
          }

        } else if (this.state === 'slide') {
          this.x += this.slideDir * this.slideVx
          const pastEnd  = this.slideDir > 0 ? this.x >= this.slideEnd : this.x <= this.slideEnd
          const offZone  = this.x < this.zone.x - 8 || this.x > this.zone.x + this.zone.w + 8
          if (pastEnd || offZone) this.startDrip()

        } else if (this.state === 'drip') {
          this.dripVy    += this.dripAcc
          this.dripY     += this.dripVy
          this.dripTail   = Math.min(this.dripTail + this.dripVy * 0.38, this.dripMaxTail)
          this.dripAlpha -= 0.004
          if (this.dripAlpha <= 0 || this.dripY > H + 30) this.reset()
        }
      }

      draw(ctx) {
        if (this.state === 'fall') {
          ctx.beginPath()
          ctx.moveTo(this.x, this.y)
          ctx.lineTo(this.x, this.y + this.len)
          ctx.strokeStyle = `rgba(200,228,255,${this.alpha})`
          ctx.lineWidth   = this.lw
          ctx.stroke()

        } else if (this.state === 'slide') {
          // horizontal smear trail behind the drop
          const trail = 10
          ctx.beginPath()
          ctx.moveTo(this.x, this.slideY)
          ctx.lineTo(this.x - this.slideDir * trail, this.slideY)
          ctx.strokeStyle = `rgba(200,228,255,${this.slideAlpha * 0.55})`
          ctx.lineWidth   = 1
          ctx.stroke()
          // dot at front
          ctx.beginPath()
          ctx.arc(this.x, this.slideY, 1.6, 0, Math.PI * 2)
          ctx.fillStyle = `rgba(225,242,255,${this.slideAlpha})`
          ctx.fill()

        } else if (this.state === 'drip') {
          ctx.save()
          ctx.shadowColor = 'rgba(180,225,255,0.7)'
          ctx.shadowBlur  = 5
          // round blob head
          ctx.beginPath()
          ctx.arc(this.dripX, this.dripY, this.dripR, 0, Math.PI * 2)
          ctx.fillStyle = `rgba(215,240,255,${this.dripAlpha})`
          ctx.fill()
          // thin teardrop tail stretching upward
          if (this.dripTail > 3) {
            const grad = ctx.createLinearGradient(this.dripX, this.dripY - this.dripTail, this.dripX, this.dripY)
            grad.addColorStop(0, `rgba(200,230,255,0)`)
            grad.addColorStop(1, `rgba(200,230,255,${this.dripAlpha * 0.45})`)
            ctx.beginPath()
            ctx.moveTo(this.dripX - this.dripR * 0.45, this.dripY)
            ctx.lineTo(this.dripX, this.dripY - this.dripTail)
            ctx.lineTo(this.dripX + this.dripR * 0.45, this.dripY)
            ctx.fillStyle = grad
            ctx.fill()
          }
          ctx.restore()
        }
      }
    }

    let drops = []

    const start = () => {
      resize()
      drops = Array.from({ length: 130 }, (_, i) => new Drop(i < 65))

      const draw = () => {
        const zones = getZones()
        ctx.clearRect(0, 0, W, H)
        for (const d of drops) { d.update(zones); d.draw(ctx) }
        animId = requestAnimationFrame(draw)
      }
      draw()
    }

    // Short delay so GSAP can finish animating text into position
    const t = setTimeout(start, 600)
    const onResize = () => { resize(); drops.forEach(d => d.reset()) }
    window.addEventListener('resize', onResize)

    return () => {
      clearTimeout(t)
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', onResize)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      style={{
        position:      'absolute',
        inset:         0,
        width:         '100%',
        height:        '100%',
        pointerEvents: 'none',
        zIndex:        4,
      }}
    />
  )
}
