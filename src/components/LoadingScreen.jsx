import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { useAppStore } from '../store/useAppStore'

export function LoadingScreen() {
  const isFinished = useAppStore((s) => s.isFinished)
  const ref        = useRef()

  useEffect(() => {
    if (!isFinished) return
    gsap.to(ref.current, {
      opacity: 0,
      duration: 0.9,
      ease: 'power2.out',
      onComplete: () => {
        if (ref.current) ref.current.style.display = 'none'
      },
    })
  }, [isFinished])

  return (
    <div ref={ref} className="loading-screen">
      {/* Orbital logo mark — same as nav */}
      <svg width="48" height="48" viewBox="0 0 32 32" fill="none" className="loading-icon">
        <defs>
          <linearGradient id="llg" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%"   stopColor="#a855f7"/>
            <stop offset="100%" stopColor="#06b6d4"/>
          </linearGradient>
        </defs>
        <ellipse cx="16" cy="16" rx="14" ry="6"  stroke="url(#llg)" strokeWidth="1.2" fill="none" opacity="0.9"/>
        <ellipse cx="16" cy="16" rx="6"  ry="14" stroke="url(#llg)" strokeWidth="1.2" fill="none" opacity="0.7"/>
        <circle  cx="16" cy="16" r="2.5" fill="url(#llg)"/>
        <circle  cx="30" cy="16" r="1.5" fill="#a855f7" opacity="0.9"/>
        <circle  cx="16" cy="2"  r="1.2" fill="#06b6d4" opacity="0.8"/>
      </svg>
      <p className="loading-label">Shift AI</p>
    </div>
  )
}
