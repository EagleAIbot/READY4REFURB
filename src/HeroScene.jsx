import { useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Points, PointMaterial, MeshDistortMaterial, Sphere } from '@react-three/drei'
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing'
import * as THREE from 'three'

// ── Star field drifting diagonally ───────────────────────────────────────────
function Stars() {
  const ref = useRef()
  const count = 3500

  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      arr[i * 3]     = (Math.random() - 0.5) * 60
      arr[i * 3 + 1] = (Math.random() - 0.5) * 60
      arr[i * 3 + 2] = (Math.random() - 0.5) * 30
    }
    return arr
  }, [])

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()
    ref.current.rotation.x = t * 0.01
    ref.current.rotation.z = t * 0.006
  })

  return (
    <Points ref={ref} positions={positions} stride={3} frustumCulled>
      <PointMaterial transparent color="#ffffff" size={0.018} sizeAttenuation depthWrite={false} opacity={0.7} />
    </Points>
  )
}

// ── Core planet — centred, pushed back so text floats in front ───────────────
function Planet() {
  const mesh    = useRef()
  const atmRef  = useRef()

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()
    mesh.current.rotation.y   =  t * 0.035
    mesh.current.rotation.x   =  Math.sin(t * 0.018) * 0.06
    const pulse = 1 + Math.sin(t * 0.6) * 0.01
    atmRef.current.scale.setScalar(pulse * 1.22)
  })

  return (
    <group position={[0, -0.3, -3]}>
      {/* Outer atmosphere — BackSide so it only shows around the edge */}
      <mesh ref={atmRef}>
        <sphereGeometry args={[1.22, 64, 64]} />
        <meshStandardMaterial
          color="#7c3aed"
          emissive="#7c3aed"
          emissiveIntensity={3}
          transparent
          opacity={0.07}
          side={THREE.BackSide}
        />
      </mesh>

      {/* Second softer atmosphere layer */}
      <mesh scale={1.12}>
        <sphereGeometry args={[1.22, 32, 32]} />
        <meshStandardMaterial
          color="#4f46e5"
          emissive="#4f46e5"
          emissiveIntensity={1.5}
          transparent
          opacity={0.04}
          side={THREE.BackSide}
        />
      </mesh>

      {/* Planet body */}
      <mesh ref={mesh}>
        <sphereGeometry args={[1, 128, 128]} />
        <MeshDistortMaterial
          color="#0f0320"
          emissive="#6d28d9"
          emissiveIntensity={0.35}
          distort={0.18}
          speed={0.7}
          roughness={0.85}
          metalness={0.05}
        />
      </mesh>

      {/* Lighting centred on planet */}
      <pointLight position={[0,  2,  1]} intensity={5}   color="#a855f7" distance={7} />
      <pointLight position={[0, -2,  1]} intensity={2.5} color="#3b82f6" distance={5} />
    </group>
  )
}

// ── Rings centred on planet ───────────────────────────────────────────────────
function Ring({ radius, tubeRadius, tilt, speed, color, opacity }) {
  const mesh = useRef()
  useFrame(({ clock }) => {
    mesh.current.rotation.z = clock.getElapsedTime() * speed
  })
  return (
    <mesh ref={mesh} position={[0, -0.3, -3]} rotation={[tilt, 0, 0]}>
      <torusGeometry args={[radius, tubeRadius, 3, 220]} />
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={2} transparent opacity={opacity} />
    </mesh>
  )
}

// ── Particle dust cloud orbiting planet ──────────────────────────────────────
function PlanetDust() {
  const ref   = useRef()
  const count = 800

  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      const r     = 1.45 + Math.random() * 1.4
      const theta = Math.random() * Math.PI * 2
      const phi   = (Math.random() - 0.5) * 0.55
      arr[i * 3]     = r * Math.cos(theta) * Math.cos(phi)
      arr[i * 3 + 1] = r * Math.sin(phi) - 0.3
      arr[i * 3 + 2] = r * Math.sin(theta) * Math.cos(phi) - 3
    }
    return arr
  }, [])

  useFrame(({ clock }) => {
    ref.current.rotation.y =  clock.getElapsedTime() * 0.05
    ref.current.rotation.x =  clock.getElapsedTime() * 0.015
  })

  return (
    <Points ref={ref} positions={positions} stride={3} frustumCulled>
      <PointMaterial transparent color="#c084fc" size={0.022} sizeAttenuation depthWrite={false} opacity={0.55} />
    </Points>
  )
}

// ── Small glowing debris scattered around the whole scene ────────────────────
function Debris({ position, scale, speed, color = "#a855f7" }) {
  const mesh = useRef()
  const startY = position[1]
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()
    mesh.current.rotation.x = t * speed * 0.8
    mesh.current.rotation.y = t * speed
    mesh.current.position.y = startY + Math.sin(t * speed * 0.5) * 0.35
  })
  return (
    <mesh ref={mesh} position={position} scale={scale}>
      <icosahedronGeometry args={[1, 0]} />
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={2} wireframe transparent opacity={0.6} />
    </mesh>
  )
}

// ── Gentle camera drift ───────────────────────────────────────────────────────
function Camera() {
  useFrame(({ clock, camera }) => {
    const t = clock.getElapsedTime()
    camera.position.x = Math.sin(t * 0.06) * 0.5
    camera.position.y = Math.cos(t * 0.04) * 0.25
    camera.lookAt(0, -0.3, -3)
  })
  return null
}

// ── Main export ───────────────────────────────────────────────────────────────
export default function HeroScene() {
  return (
    <Canvas
      camera={{ position: [0, 0, 6], fov: 72 }}
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
      gl={{ antialias: true, alpha: false }}
      dpr={[1, 2]}
    >
      <ambientLight intensity={0.08} />
      <pointLight position={[-10, 6, 4]} intensity={3}   color="#a855f7" />
      <pointLight position={[ 10,-4, 2]} intensity={1.5} color="#3b82f6" />
      <pointLight position={[  0, 0, 5]} intensity={0.4} color="#ffffff" />

      <Stars />
      <Planet />

      {/* Three rings at varying tilts orbiting the centre */}
      <Ring radius={1.6}  tubeRadius={0.005} tilt={Math.PI * 0.44} speed={ 0.22}  color="#a855f7" opacity={0.75} />
      <Ring radius={1.95} tubeRadius={0.003} tilt={Math.PI * 0.37} speed={-0.16} color="#818cf8" opacity={0.45} />
      <Ring radius={2.3}  tubeRadius={0.002} tilt={Math.PI * 0.51} speed={ 0.11}  color="#7c3aed" opacity={0.28} />

      <PlanetDust />

      {/* Debris spread all around so it frames the text from all sides */}
      <Debris position={[-4.5,  1.8, -1.5]} scale={0.09}  speed={0.55} color="#a855f7" />
      <Debris position={[ 4.2,  2.2, -2]}   scale={0.07}  speed={0.4}  color="#818cf8" />
      <Debris position={[-3.8, -2.2, -1]}   scale={0.08}  speed={0.65} color="#7c3aed" />
      <Debris position={[ 3.5, -1.8, -1.5]} scale={0.06}  speed={0.5}  color="#c084fc" />
      <Debris position={[-1.5,  3,   -2.5]} scale={0.055} speed={0.45} color="#a855f7" />
      <Debris position={[ 1.8, -3,   -2]}   scale={0.065} speed={0.6}  color="#6d28d9" />

      <EffectComposer>
        <Bloom intensity={2.2} luminanceThreshold={0.08} luminanceSmoothing={0.9} mipmapBlur />
        <Vignette eskil={false} offset={0.25} darkness={0.75} />
      </EffectComposer>

      <Camera />
    </Canvas>
  )
}
