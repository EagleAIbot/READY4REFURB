import { useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Points, PointMaterial, Line } from '@react-three/drei'
import * as THREE from 'three'

// Diagonal drifting star field
function StarField() {
  const ref = useRef()
  const count = 3000

  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      arr[i * 3]     = (Math.random() - 0.5) * 40
      arr[i * 3 + 1] = (Math.random() - 0.5) * 40
      arr[i * 3 + 2] = (Math.random() - 0.5) * 20
    }
    return arr
  }, [])

  useFrame((state) => {
    const t = state.clock.getElapsedTime()
    // Diagonal drift - rotate on both axes at different speeds
    ref.current.rotation.x = t * 0.012
    ref.current.rotation.z = t * 0.007
  })

  return (
    <Points ref={ref} positions={positions} stride={3} frustumCulled>
      <PointMaterial
        transparent
        color="#ffffff"
        size={0.025}
        sizeAttenuation
        depthWrite={false}
        opacity={0.55}
      />
    </Points>
  )
}

// Single neural network node cluster
function NeuralNetwork({ position, nodeCount = 10, spread = 2.5, speed = 0.15 }) {
  const groupRef = useRef()

  // Generate stable node positions
  const nodes = useMemo(() => {
    const pts = []
    for (let i = 0; i < nodeCount; i++) {
      pts.push([
        (Math.random() - 0.5) * spread,
        (Math.random() - 0.5) * spread,
        (Math.random() - 0.5) * spread * 0.5,
      ])
    }
    return pts
  }, [nodeCount, spread])

  // Build edges between nearby nodes
  const edges = useMemo(() => {
    const lines = []
    const threshold = spread * 0.7
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
    groupRef.current.rotation.x = Math.sin(t * speed * 0.6) * 0.3
    groupRef.current.position.y = position[1] + Math.sin(t * speed * 0.8) * 0.4
  })

  return (
    <group ref={groupRef} position={position}>
      {/* Connection lines */}
      {edges.map((pts, i) => (
        <Line
          key={i}
          points={pts}
          color="#a855f7"
          lineWidth={0.4}
          transparent
          opacity={0.25}
        />
      ))}
      {/* Nodes */}
      {nodes.map((pos, i) => (
        <mesh key={i} position={pos}>
          <sphereGeometry args={[0.055, 8, 8]} />
          <meshStandardMaterial
            color="#c084fc"
            transparent
            opacity={0.8}
            emissive="#7c3aed"
            emissiveIntensity={0.6}
          />
        </mesh>
      ))}
    </group>
  )
}

// Floating data ring (like a satellite dish / AI processor)
function DataRing({ position, speed = 0.2 }) {
  const outer = useRef()
  const inner = useRef()

  useFrame((state) => {
    const t = state.clock.getElapsedTime()
    outer.current.rotation.z = t * speed
    outer.current.rotation.x = t * speed * 0.4
    inner.current.rotation.z = -t * speed * 1.5
    outer.current.position.y = position[1] + Math.sin(t * 0.5) * 0.3
  })

  return (
    <group position={position}>
      {/* Outer ring */}
      <mesh ref={outer}>
        <torusGeometry args={[1, 0.015, 8, 80]} />
        <meshStandardMaterial
          color="#a855f7"
          transparent
          opacity={0.35}
          emissive="#7c3aed"
          emissiveIntensity={0.4}
        />
      </mesh>
      {/* Inner ring tilted */}
      <mesh ref={inner} rotation={[Math.PI / 3, 0, 0]}>
        <torusGeometry args={[0.6, 0.01, 8, 60]} />
        <meshStandardMaterial
          color="#818cf8"
          transparent
          opacity={0.3}
          emissive="#4f46e5"
          emissiveIntensity={0.3}
        />
      </mesh>
    </group>
  )
}

// Slowly rotating camera rig - gentle diagonal drift
function CameraRig() {
  useFrame((state) => {
    const t = state.clock.getElapsedTime()
    state.camera.position.x = Math.sin(t * 0.08) * 0.6
    state.camera.position.y = Math.cos(t * 0.06) * 0.3
    state.camera.lookAt(0, 0, 0)
  })
  return null
}

export default function HeroScene() {
  return (
    <Canvas
      camera={{ position: [0, 0, 7], fov: 70 }}
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
      dpr={[1, 2]}
    >
      <ambientLight intensity={0.3} />
      <pointLight position={[5, 5, 5]} intensity={2} color="#a855f7" />
      <pointLight position={[-5, -3, 2]} intensity={1} color="#3b82f6" />
      <pointLight position={[0, 0, 4]} intensity={0.5} color="#ffffff" />

      <StarField />

      {/* Two neural network clusters - spread out, not crowded */}
      <NeuralNetwork position={[-3.5, 1, -1]} nodeCount={9} spread={2.2} speed={0.12} />
      <NeuralNetwork position={[3.5, -1, -2]} nodeCount={8} spread={2} speed={0.1} />

      {/* Two data rings */}
      <DataRing position={[2.5, 1.5, -3]} speed={0.18} />
      <DataRing position={[-2, -2, -2]} speed={0.14} />

      <CameraRig />
    </Canvas>
  )
}
