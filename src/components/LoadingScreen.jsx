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
      <img
        src="/images/r4r-logo.png"
        alt="Ready For Refurb"
        className="loading-icon"
        style={{ width: 90, height: 90, borderRadius: '50%' }}
      />
      <p className="loading-label">Ready For Refurb</p>
    </div>
  )
}
