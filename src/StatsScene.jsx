import { useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Points, PointMaterial, Line } from '@react-three/drei'
import * as THREE from 'three'

// Slower, more spread diagonal stars
function StarField() {
  const ref = useRef()
  const count = 2000

  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      arr[i * 3]     = (Math.random() - 0.5) * 50
      arr[i * 3 + 1] = (Math.random() - 0.5) * 50
      arr[i * 3 + 2] = (Math.random() - 0.5) * 20
    }
    return arr
  }, [])

  useFrame((state) => {
    const t = state.clock.getElapsedTime()
    ref.current.rotation.x = t * 0.008
    ref.current.rotation.z = t * 0.005
  })

  return (
    <Points ref={ref} positions={positions} stride={3} frustumCulled>
      <PointMaterial
        transparent
        color="#ffffff"
        size={0.02}
        sizeAttenuation
        depthWrite={false}
        opacity={0.4}
      />
    </Points>
  )
}

// Wider, flatter neural network spread across the whole section
function NeuralNetwork({ position, nodeCount = 12, spread = 3, speed = 0.08 }) {
  const groupRef = useRef()

  const nodes = useMemo(() => {
    const pts = []
    for (let i = 0; i < nodeCount; i++) {
      pts.push([
        (Math.random() - 0.5) * spread,
        (Math.random() - 0.5) * spread * 0.5,
        (Math.random() - 0.5) * spread * 0.3,
      ])
    }
    return pts
  }, [nodeCount, spread])

  const edges = useMemo(() => {
    const lines = []
    const threshold = spread * 0.6
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const dx = nodes[i][0] - nodes[j][0]
        const dy = nodes[i][1] - nodes[j][1]
        const dz = nodes[i][2] - nodes[j][2]
        const dist = Math.sqrt(dx * dx + dy * dy + dz * dz)
        if (dist < threshold) {
          lines.push([
            new THREE.Vector3(...nodes[i]),
            new THREE.Vector3(...nodes[j]),
          ])
        }
      }
    }
    return lines
  }, [nodes, spread])

  useFrame((state) => {
    const t = state.clock.getElapsedTime()
    groupRef.current.rotation.y = t * speed
    groupRef.current.rotation.x = Math.sin(t * speed * 0.5) * 0.2
    groupRef.current.position.y = position[1] + Math.sin(t * speed * 0.7) * 0.25
  })

  return (
    <group ref={groupRef} position={position}>
      {edges.map((pts, i) => (
        <Line
          key={i}
          points={pts}
          color="#a855f7"
          lineWidth={0.4}
          transparent
          opacity={0.2}
        />
      ))}
      {nodes.map((pos, i) => (
        <mesh key={i} position={pos}>
          <sphereGeometry args={[0.05, 8, 8]} />
          <meshStandardMaterial
            color="#c084fc"
            transparent
            opacity={0.75}
            emissive="#7c3aed"
            emissiveIntensity={0.5}
          />
        </mesh>
      ))}
    </group>
  )
}

// Data ring - same as hero but slightly different sizes
function DataRing({ position, speed = 0.15 }) {
  const outer = useRef()
  const inner = useRef()

  useFrame((state) => {
    const t = state.clock.getElapsedTime()
    outer.current.rotation.z = t * speed
    outer.current.rotation.x = t * speed * 0.4
    inner.current.rotation.z = -t * speed * 1.5
    outer.current.position.y = position[1] + Math.sin(t * 0.45) * 0.25
  })

  return (
    <group position={position}>
      <mesh ref={outer}>
        <torusGeometry args={[0.9, 0.013, 8, 80]} />
        <meshStandardMaterial
          color="#a855f7"
          transparent
          opacity={0.3}
          emissive="#7c3aed"
          emissiveIntensity={0.35}
        />
      </mesh>
      <mesh ref={inner} rotation={[Math.PI / 3, 0, 0]}>
        <torusGeometry args={[0.55, 0.009, 8, 60]} />
        <meshStandardMaterial
          color="#818cf8"
          transparent
          opacity={0.25}
          emissive="#4f46e5"
          emissiveIntensity={0.25}
        />
      </mesh>
    </group>
  )
}

function CameraRig() {
  useFrame((state) => {
    const t = state.clock.getElapsedTime()
    state.camera.position.x = Math.sin(t * 0.07) * 0.5
    state.camera.position.y = Math.cos(t * 0.05) * 0.2
    state.camera.lookAt(0, 0, 0)
  })
  return null
}

export default function StatsScene() {
  return (
    <Canvas
      camera={{ position: [0, 0, 8], fov: 75 }}
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
      dpr={[1, 2]}
    >
      <ambientLight intensity={0.3} />
      <pointLight position={[5, 5, 5]} intensity={2} color="#a855f7" />
      <pointLight position={[-5, -3, 2]} intensity={1} color="#3b82f6" />
      <pointLight position={[0, 0, 4]} intensity={0.4} color="#ffffff" />

      <StarField />

      {/* Spread across the full width of the section */}
      <NeuralNetwork position={[-5, 0, -2]} nodeCount={10} spread={2.5} speed={0.09} />
      <NeuralNetwork position={[5, 0, -2]} nodeCount={10} spread={2.5} speed={0.11} />
      <NeuralNetwork position={[0, 0.5, -3]} nodeCount={8} spread={2} speed={0.07} />

      <DataRing position={[-7.5, 0.5, -4]} speed={0.16} />
      <DataRing position={[7.5, -0.5, -4]} speed={0.13} />

      <CameraRig />
    </Canvas>
  )
}
