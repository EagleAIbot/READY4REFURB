import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'

export function MagneticCursor() {
  const ringRef = useRef()
  const dotRef  = useRef()

  useEffect(() => {
    const ring = ringRef.current
    const dot  = dotRef.current
    if (!ring || !dot) return

    if (window.matchMedia('(pointer: coarse)').matches) {
      ring.style.display = 'none'
      dot.style.display  = 'none'
      return
    }

    const onMove = (e) => {
      gsap.to(ring, { x: e.clientX, y: e.clientY, duration: 0.55, ease: 'power3.out' })
      gsap.to(dot,  { x: e.clientX, y: e.clientY, duration: 0.08 })
    }

    const onEnter = () => gsap.to(ring, {
      scale: 2.8,
      borderColor: '#3FB8E0',
      backgroundColor: 'rgba(63,184,224,0.08)',
      duration: 0.35,
      ease: 'power2.out'
    })

    const onLeave = () => gsap.to(ring, {
      scale: 1,
      borderColor: 'rgba(63,184,224,0.5)',
      backgroundColor: 'transparent',
      duration: 0.35,
      ease: 'power2.out'
    })

    const onDown = () => gsap.to(ring, { scale: 0.8, duration: 0.15 })
    const onUp   = () => gsap.to(ring, { scale: 1,   duration: 0.25 })

    window.addEventListener('mousemove', onMove)
    window.addEventListener('mousedown', onDown)
    window.addEventListener('mouseup',   onUp)

    const addListeners = () => {
      document.querySelectorAll('a, button, .magnetic').forEach((el) => {
        el.addEventListener('mouseenter', onEnter)
        el.addEventListener('mouseleave', onLeave)
      })
    }

    addListeners()
    const observer = new MutationObserver(addListeners)
    observer.observe(document.body, { childList: true, subtree: true })

    return () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mousedown', onDown)
      window.removeEventListener('mouseup',   onUp)
      observer.disconnect()
    }
  }, [])

  return (
    <>
      <div ref={ringRef} className="cursor-ring" />
      <div ref={dotRef}  className="cursor-dot"  />
    </>
  )
}
