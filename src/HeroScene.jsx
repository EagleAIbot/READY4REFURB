import { useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Points, PointMaterial, MeshDistortMaterial, Line } from '@react-three/drei'
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing'
import * as THREE from 'three'

// ── Stars ─────────────────────────────────────────────────────────────────────
function Stars() {
  const ref = useRef()
  const positions = useMemo(() => {
    const arr = new Float32Array(4000 * 3)
    for (let i = 0; i < 4000; i++) {
      arr[i * 3]     = (Math.random() - 0.5) * 70
      arr[i * 3 + 1] = (Math.random() - 0.5) * 70
      arr[i * 3 + 2] = (Math.random() - 0.5) * 30
    }
    return arr
  }, [])
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()
    ref.current.rotation.x = t * 0.009
    ref.current.rotation.z = t * 0.005
  })
  return (
    <Points ref={ref} positions={positions} stride={3} frustumCulled>
      <PointMaterial transparent color="#ffffff" size={0.016} sizeAttenuation depthWrite={false} opacity={0.65} />
    </Points>
  )
}

// ── Big planet — right side ───────────────────────────────────────────────────
function BigPlanet() {
  const mesh   = useRef()
  const atmRef = useRef()

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()
    mesh.current.rotation.y = t * 0.03
    const p = 1 + Math.sin(t * 0.5) * 0.008
    atmRef.current.scale.setScalar(p * 1.2)
  })

  return (
    <group position={[3.8, 0.3, -2]}>
      {/* Atmosphere */}
      <mesh ref={atmRef}>
        <sphereGeometry args={[1.2, 64, 64]} />
        <meshStandardMaterial color="#7c3aed" emissive="#7c3aed" emissiveIntensity={2.5}
          transparent opacity={0.07} side={THREE.BackSide} />
      </mesh>
      <mesh scale={1.1}>
        <sphereGeometry args={[1.2, 32, 32]} />
        <meshStandardMaterial color="#4f46e5" emissive="#4f46e5" emissiveIntensity={1}
          transparent opacity={0.04} side={THREE.BackSide} />
      </mesh>

      {/* Surface */}
      <mesh ref={mesh}>
        <sphereGeometry args={[1, 128, 128]} />
        <MeshDistortMaterial color="#0f0320" emissive="#6d28d9" emissiveIntensity={0.4}
          distort={0.2} speed={0.7} roughness={0.8} metalness={0.05} />
      </mesh>

      {/* AI "city" lights on surface */}
      {[
        [0.6, 0.7, 0.4], [-0.5, 0.8, 0.3], [0.8, -0.4, 0.5],
        [-0.7, -0.6, 0.3], [0.3, 0.9, 0.3], [-0.9, 0.2, 0.4],
        [0.5, -0.8, 0.3], [-0.3, -0.9, 0.3],
      ].map((pos, i) => (
        <mesh key={i} position={pos}>
          <sphereGeometry args={[0.022, 6, 6]} />
          <meshStandardMaterial color="#e879f9" emissive="#e879f9" emissiveIntensity={6} />
        </mesh>
      ))}

      <pointLight position={[0, 2, 1]} intensity={6}   color="#a855f7" distance={8} />
      <pointLight position={[0,-2, 1]} intensity={3}   color="#3b82f6" distance={6} />
    </group>
  )
}

// ── Small planet — bottom left ────────────────────────────────────────────────
function SmallPlanet() {
  const mesh = useRef()
  const atmRef = useRef()

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()
    mesh.current.rotation.y = t * 0.055
    const p = 1 + Math.sin(t * 0.6 + 1) * 0.01
    atmRef.current.scale.setScalar(p * 1.22)
  })

  return (
    <group position={[-3.5, -2.4, -1.5]}>
      <mesh ref={atmRef}>
        <sphereGeometry args={[0.65, 32, 32]} />
        <meshStandardMaterial color="#06b6d4" emissive="#06b6d4" emissiveIntensity={2.5}
          transparent opacity={0.07} side={THREE.BackSide} />
      </mesh>

      <mesh ref={mesh}>
        <sphereGeometry args={[0.52, 64, 64]} />
        <MeshDistortMaterial color="#031a1f" emissive="#0e7490" emissiveIntensity={0.5}
          distort={0.25} speed={1} roughness={0.75} metalness={0.1} />
      </mesh>

      {/* City lights */}
      {[
        [0.3, 0.35, 0.3], [-0.3, 0.38, 0.2], [0.4, -0.25, 0.3],
        [-0.38, -0.3, 0.2], [0.1, 0.5, 0.1],
      ].map((pos, i) => (
        <mesh key={i} position={pos}>
          <sphereGeometry args={[0.016, 6, 6]} />
          <meshStandardMaterial color="#67e8f9" emissive="#67e8f9" emissiveIntensity={7} />
        </mesh>
      ))}

      <pointLight position={[0, 1, 0.5]} intensity={3}   color="#06b6d4" distance={4} />
      <pointLight position={[0,-1, 0.5]} intensity={1.5} color="#7c3aed" distance={3} />
    </group>
  )
}

// ── Ring orbiting a planet ────────────────────────────────────────────────────
function Ring({ pos, radius, tubeRadius, tilt, speed, color, opacity }) {
  const mesh = useRef()
  useFrame(({ clock }) => {
    mesh.current.rotation.z = clock.getElapsedTime() * speed
  })
  return (
    <mesh ref={mesh} position={pos} rotation={[tilt, 0, 0]}>
      <torusGeometry args={[radius, tubeRadius, 3, 200]} />
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={2}
        transparent opacity={opacity} />
    </mesh>
  )
}

// ── AI agent signal beam between planets ─────────────────────────────────────
function AgentBeam() {
  const ref    = useRef()
  const count  = 120
  const origin = new THREE.Vector3(3.8, 0.3, -2)
  const target = new THREE.Vector3(-3.5, -2.4, -1.5)

  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      const t = i / count
      const x = origin.x + (target.x - origin.x) * t + (Math.random() - 0.5) * 0.12
      const y = origin.y + (target.y - origin.y) * t + (Math.random() - 0.5) * 0.12
      const z = origin.z + (target.z - origin.z) * t + (Math.random() - 0.5) * 0.12
      arr[i * 3]     = x
      arr[i * 3 + 1] = y
      arr[i * 3 + 2] = z
    }
    return arr
  }, [])

  useFrame(({ clock }) => {
    // Shift the beam particles to animate data flow
    const t = clock.getElapsedTime()
    ref.current.rotation.z = Math.sin(t * 0.3) * 0.02
  })

  return (
    <Points ref={ref} positions={positions} stride={3} frustumCulled>
      <PointMaterial transparent color="#e879f9" size={0.018} sizeAttenuation depthWrite={false} opacity={0.4} />
    </Points>
  )
}

// ── Neural node clusters near each planet ────────────────────────────────────
function AgentNodes({ center, count = 5, radius = 1.7, color = "#c084fc" }) {
  const groupRef = useRef()
  const nodes = useMemo(() =>
    Array.from({ length: count }, () => {
      const theta = Math.random() * Math.PI * 2
      const phi   = (Math.random() - 0.5) * Math.PI
      return [
        center[0] + radius * Math.cos(theta) * Math.cos(phi),
        center[1] + radius * Math.sin(phi),
        center[2] + radius * Math.sin(theta) * Math.cos(phi),
      ]
    }), [center, count, radius])

  const edges = useMemo(() => {
    const lines = []
    for (let i = 0; i < nodes.length; i++)
      for (let j = i + 1; j < nodes.length; j++) {
        const d = Math.hypot(...nodes[i].map((v, k) => v - nodes[j][k]))
        if (d < radius * 1.4)
          lines.push([new THREE.Vector3(...nodes[i]), new THREE.Vector3(...nodes[j])])
      }
    return lines
  }, [nodes, radius])

  useFrame(({ clock }) => {
    groupRef.current.rotation.y = clock.getElapsedTime() * 0.08
  })

  return (
    <group ref={groupRef}>
      {edges.map((pts, i) => (
        <Line key={i} points={pts} color={color} lineWidth={0.3} transparent opacity={0.2} />
      ))}
      {nodes.map((pos, i) => (
        <mesh key={i} position={pos}>
          <sphereGeometry args={[0.04, 8, 8]} />
          <meshStandardMaterial color={color} emissive={color} emissiveIntensity={3} transparent opacity={0.9} />
        </mesh>
      ))}
    </group>
  )
}

// ── Small floating debris ─────────────────────────────────────────────────────
function Debris({ position, scale, speed, color = "#a855f7" }) {
  const mesh = useRef()
  const startY = position[1]
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()
    mesh.current.rotation.x = t * speed * 0.8
    mesh.current.rotation.y = t * speed
    mesh.current.position.y = startY + Math.sin(t * speed * 0.5) * 0.3
  })
  return (
    <mesh ref={mesh} position={position} scale={scale}>
      <icosahedronGeometry args={[1, 0]} />
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={2.5}
        wireframe transparent opacity={0.55} />
    </mesh>
  )
}

// ── Camera drift ──────────────────────────────────────────────────────────────
function Camera() {
  useFrame(({ clock, camera }) => {
    const t = clock.getElapsedTime()
    camera.position.x = Math.sin(t * 0.06) * 0.4
    camera.position.y = Math.cos(t * 0.04) * 0.2
    camera.lookAt(0.5, -0.5, -2)
  })
  return null
}

// ── Scene ─────────────────────────────────────────────────────────────────────
export default function HeroScene() {
  return (
    <Canvas
      camera={{ position: [0, 0, 7], fov: 72 }}
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
      gl={{ antialias: true, alpha: false }}
      dpr={[1, 2]}
    >
      <ambientLight intensity={0.07} />
      <pointLight position={[-8,  5,  5]} intensity={3}   color="#a855f7" />
      <pointLight position={[ 8, -4,  3]} intensity={1.5} color="#06b6d4" />
      <pointLight position={[ 0,  0,  6]} intensity={0.3} color="#ffffff" />

      <Stars />

      {/* Big planet — right */}
      <BigPlanet />
      <Ring pos={[3.8, 0.3, -2]} radius={1.55} tubeRadius={0.005} tilt={Math.PI * 0.44} speed={ 0.22}  color="#a855f7" opacity={0.7} />
      <Ring pos={[3.8, 0.3, -2]} radius={1.9}  tubeRadius={0.003} tilt={Math.PI * 0.37} speed={-0.15} color="#818cf8" opacity={0.4} />

      {/* Small planet — bottom left */}
      <SmallPlanet />
      <Ring pos={[-3.5, -2.4, -1.5]} radius={0.8}  tubeRadius={0.004} tilt={Math.PI * 0.4}  speed={ 0.3}   color="#06b6d4" opacity={0.6} />
      <Ring pos={[-3.5, -2.4, -1.5]} radius={1.05} tubeRadius={0.002} tilt={Math.PI * 0.52} speed={-0.2}  color="#67e8f9" opacity={0.3} />

      {/* AI agent nodes orbiting each planet */}
      <AgentNodes center={[3.8, 0.3, -2]}   count={6} radius={1.8} color="#c084fc" />
      <AgentNodes center={[-3.5, -2.4, -1.5]} count={4} radius={0.95} color="#67e8f9" />

      {/* Data beam between the two planets */}
      <AgentBeam />

      {/* Scattered debris */}
      <Debris position={[-4.5,  2,   -1]} scale={0.08}  speed={0.5}  color="#a855f7" />
      <Debris position={[ 5.5, -1.5, -2]} scale={0.065} speed={0.4}  color="#818cf8" />
      <Debris position={[ 1.5,  3,   -2]} scale={0.055} speed={0.55} color="#c084fc" />
      <Debris position={[-1,   -3.5, -1]} scale={0.07}  speed={0.45} color="#06b6d4" />
      <Debris position={[ 0.5,  2.5, -3]} scale={0.05}  speed={0.6}  color="#7c3aed" />

      <EffectComposer>
        <Bloom intensity={2.5} luminanceThreshold={0.08} luminanceSmoothing={0.9} mipmapBlur />
        <Vignette eskil={false} offset={0.25} darkness={0.7} />
      </EffectComposer>

      <Camera />
    </Canvas>
  )
}
