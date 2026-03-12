import { useRef, useEffect } from 'react'

export function HeroRainOverlay() {
  const canvasRef = useRef()

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx    = canvas.getContext('2d')
    let W = 0, H = 0
    let animId

    const getZones = () => {
      const canvasRect = canvas.getBoundingClientRect()
      return ['.hero-title', '.hero-subtitle', '.hero-cta-wrap']
        .map(sel => document.querySelector(sel))
        .filter(Boolean)
        .map(el => {
          const r = el.getBoundingClientRect()
          return { x: r.left - canvasRect.left, y: r.top - canvasRect.top, w: r.width, h: r.height }
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
        this.x     = Math.random() * W
        this.y     = stagger ? -Math.random() * H * 1.2 : -(20 + Math.random() * 120)
        this.vy    = 2.5 + Math.random() * 2.5   // slow fall
        this.r     = 1.8 + Math.random() * 1.4   // droplet radius
        this.alpha = 0.4 + Math.random() * 0.4
        this.zone  = null
        this.slideY = 0
      }

      checkHit(zones) {
        for (const z of zones) {
          if (this.x >= z.x && this.x <= z.x + z.w &&
              this.y + this.vy >= z.y && this.y < z.y) return z
        }
        return null
      }

      startSlide(zone) {
        this.state      = 'slide'
        this.zone       = zone
        this.slideY     = zone.y
        this.slideDir   = Math.random() < 0.5 ? -1 : 1
        this.slideVx    = 0.6 + Math.random() * 1.2   // slow slide
        this.slideAlpha = 0.7 + Math.random() * 0.25
        this.slideEnd   = this.x + this.slideDir * (20 + Math.random() * 55)
        this.trail      = []
      }

      startDrip() {
        this.state       = 'drip'
        this.dripX       = this.x
        this.dripY       = this.slideY
        this.dripVy      = 0.3 + Math.random() * 0.5   // slow drip
        this.dripAcc     = 0.018 + Math.random() * 0.022
        this.dripR       = 2.2 + Math.random() * 2.2   // bigger droplet
        this.dripTail    = 0
        this.dripMaxTail = 18 + Math.random() * 18
        this.dripAlpha   = 0.9
      }

      // Draw a nice teardrop shape
      drawTeardrop(ctx, x, y, r, tail, alpha) {
        ctx.save()
        ctx.shadowColor = 'rgba(190,228,255,0.6)'
        ctx.shadowBlur  = 6

        // Tail (thin line going up)
        if (tail > 2) {
          const grad = ctx.createLinearGradient(x, y - tail, x, y)
          grad.addColorStop(0, `rgba(200,232,255,0)`)
          grad.addColorStop(1, `rgba(200,232,255,${alpha * 0.4})`)
          ctx.beginPath()
          ctx.moveTo(x - r * 0.3, y - r * 0.6)
          ctx.quadraticCurveTo(x, y - tail, x + r * 0.3, y - r * 0.6)
          ctx.fillStyle = grad
          ctx.fill()
        }

        // Round blob — slightly taller than wide (teardrop)
        ctx.beginPath()
        ctx.ellipse(x, y, r * 0.85, r, 0, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(215,240,255,${alpha})`
        ctx.fill()

        // Specular highlight
        ctx.beginPath()
        ctx.ellipse(x - r * 0.28, y - r * 0.28, r * 0.25, r * 0.18, -0.5, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(255,255,255,${alpha * 0.55})`
        ctx.fill()

        ctx.restore()
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
          this.trail.push({ x: this.x, y: this.slideY })
          if (this.trail.length > 12) this.trail.shift()
          const pastEnd = this.slideDir > 0 ? this.x >= this.slideEnd : this.x <= this.slideEnd
          const offZone = this.x < this.zone.x - 6 || this.x > this.zone.x + this.zone.w + 6
          if (pastEnd || offZone) this.startDrip()

        } else if (this.state === 'drip') {
          this.dripVy  += this.dripAcc
          this.dripY   += this.dripVy
          this.dripTail = Math.min(this.dripTail + this.dripVy * 0.5, this.dripMaxTail)
          this.dripAlpha -= 0.003
          if (this.dripAlpha <= 0 || this.dripY > H + 30) this.reset()
        }
      }

      draw(ctx) {
        if (this.state === 'fall') {
          // Small falling droplet (no streak — just a tiny oval)
          ctx.save()
          ctx.shadowColor = 'rgba(190,228,255,0.5)'
          ctx.shadowBlur  = 4
          ctx.beginPath()
          ctx.ellipse(this.x, this.y, this.r * 0.6, this.r, 0, 0, Math.PI * 2)
          ctx.fillStyle = `rgba(210,238,255,${this.alpha})`
          ctx.fill()
          ctx.restore()

        } else if (this.state === 'slide') {
          // Fading trail
          for (let i = 0; i < this.trail.length; i++) {
            const t = this.trail[i]
            const a = (i / this.trail.length) * this.slideAlpha * 0.35
            ctx.beginPath()
            ctx.arc(t.x, t.y, this.r * 0.5, 0, Math.PI * 2)
            ctx.fillStyle = `rgba(210,238,255,${a})`
            ctx.fill()
          }
          // Droplet at front
          this.drawTeardrop(ctx, this.x, this.slideY, this.r * 1.1, 0, this.slideAlpha)

        } else if (this.state === 'drip') {
          this.drawTeardrop(ctx, this.dripX, this.dripY, this.dripR, this.dripTail, this.dripAlpha)
        }
      }
    }

    let drops = []

    const start = () => {
      resize()
      // 55 drops total — sparse and calm
      drops = Array.from({ length: 55 }, (_, i) => new Drop(i < 30))

      const draw = () => {
        const zones = getZones()
        ctx.clearRect(0, 0, W, H)
        for (const d of drops) { d.update(zones); d.draw(ctx) }
        animId = requestAnimationFrame(draw)
      }
      draw()
    }

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
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 4 }}
    />
  )
}
