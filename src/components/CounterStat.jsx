import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

// Parses "4×", "< 4wks", "100%", "24/7", "UAE", "GPT-4o +"
// Animates the numeric part if one exists
function parseValue(str) {
  const match = str.match(/[\d.]+/)
  if (!match) return { numeric: null, prefix: '', suffix: str }
  const num    = parseFloat(match[0])
  const idx    = str.indexOf(match[0])
  return {
    numeric: num,
    prefix:  str.slice(0, idx),
    suffix:  str.slice(idx + match[0].length),
    isInt:   !str.includes('.'),
  }
}

export function CounterStat({ value, label }) {
  const numRef = useRef()
  const parsed = parseValue(value)

  useEffect(() => {
    if (!parsed.numeric || !numRef.current) return

    const obj = { val: 0 }

    ScrollTrigger.create({
      trigger: numRef.current,
      start: 'top 85%',
      once: true,
      onEnter: () => {
        gsap.to(obj, {
          val: parsed.numeric,
          duration: 1.8,
          ease: 'power2.out',
          onUpdate: () => {
            const display = parsed.isInt
              ? Math.round(obj.val)
              : obj.val.toFixed(1)
            numRef.current.textContent = `${parsed.prefix}${display}${parsed.suffix}`
          },
        })
      },
    })
  }, [value])

  return (
    <div ref={numRef} className="stat-value">
      {value}
    </div>
  )
}
