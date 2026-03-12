import { useRef, useMemo, useEffect, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Points, PointMaterial } from '@react-three/drei'
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing'
import { useAppStore } from './store/useAppStore'
import * as THREE from 'three'

// ─────────────────────────────────────────────────────────────────────────────
// Shared shader chunks
// ─────────────────────────────────────────────────────────────────────────────
const NOISE_GLSL = `
  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
  }
  float noise(vec2 p) {
    vec2 i = floor(p); vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    return mix(
      mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x),
      mix(hash(i + vec2(0.0,1.0)), hash(i + vec2(1.0,1.0)), f.x), f.y
    );
  }
  float fbm(vec2 p) {
    float v = 0.0, a = 0.5;
    for (int i = 0; i < 6; i++) { v += a * noise(p); p = p * 2.1 + vec2(3.1, 1.7); a *= 0.5; }
    return v;
  }
`

const VERT = `varying vec2 vUv; void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`

// ── Black marble (walls) ──────────────────────────────────────────────────────
const blackMarbleFrag = `
  uniform float uTime;
  varying vec2 vUv;
  ${NOISE_GLSL}
  void main() {
    vec2 uv = vUv * vec2(2.2, 3.0);
    float t  = uTime * 0.007;
    float n1 = fbm(uv + t);
    float n2 = fbm(uv * 1.7 - t * 0.45 + vec2(n1 * 2.2, n1 * 0.7));
    float n3 = fbm(uv * 0.4 + vec2(8.1, 3.5));

    float vp1 = pow(max(sin(uv.x * 3.2 + n2 * 9.0 + n1 * 4.5) * 0.5 + 0.5, 0.0), 3.2);
    float vp2 = pow(max(sin(uv.y * 2.1 + n1 * 5.5 + n3 * 2.8) * 0.5 + 0.5, 0.0), 4.5) * 0.5;
    float veins = vp1 + vp2;

    vec3 base   = vec3(0.040, 0.042, 0.048);
    vec3 midV   = vec3(0.22,  0.24,  0.27);
    vec3 brightV= vec3(0.72,  0.75,  0.80);

    vec3 col = mix(base, midV, min(veins * 0.6, 1.0));
    col = mix(col, brightV, pow(vp1, 2.2) * 0.40);
    col += (fbm(uv * 9.0 + 2.0) - 0.5) * 0.018;

    gl_FragColor = vec4(col, 1.0);
  }
`

// ── White / cream marble (floor) ──────────────────────────────────────────────
const whiteMarbleFrag = `
  uniform float uTime;
  varying vec2 vUv;
  ${NOISE_GLSL}
  void main() {
    vec2 uv = vUv * vec2(1.8, 1.8) + vec2(12.0, 7.0);
    float t  = uTime * 0.005;
    float n1 = fbm(uv + t);
    float n2 = fbm(uv * 1.5 - t * 0.38 + vec2(n1 * 1.8, n1 * 0.9));

    float vp1 = pow(max(sin(uv.x * 2.8 + n2 * 7.5 + n1 * 3.8) * 0.5 + 0.5, 0.0), 3.5);
    float vp2 = pow(max(sin(uv.y * 2.2 + n1 * 5.0) * 0.5 + 0.5, 0.0), 5.0) * 0.38;
    float veins = vp1 + vp2;

    vec3 base   = vec3(0.93, 0.91, 0.87);
    vec3 vein1c = vec3(0.66, 0.63, 0.59);
    vec3 vein2c = vec3(0.42, 0.40, 0.38);

    vec3 col = mix(base, vein1c, min(veins * 0.55, 1.0));
    col = mix(col, vein2c, pow(vp1, 2.5) * 0.28);
    col += (fbm(uv * 6.5 + 1.3) - 0.5) * 0.012;

    gl_FragColor = vec4(col, 1.0);
  }
`

// ── Marble wall component (reused for back / left / right) ────────────────────
function MarbleWall({ position, rotation, size = [20, 14], isFloor = false }) {
  const matRef   = useRef()
  const uniforms = useMemo(() => ({ uTime: { value: 0 } }), [])
  useFrame(({ clock }) => {
    if (matRef.current) matRef.current.uniforms.uTime.value = clock.getElapsedTime()
  })
  return (
    <mesh position={position} rotation={rotation}>
      <planeGeometry args={[...size, 1, 1]} />
      <shaderMaterial
        ref={matRef}
        vertexShader={VERT}
        fragmentShader={isFloor ? whiteMarbleFrag : blackMarbleFrag}
        uniforms={uniforms}
        side={THREE.DoubleSide}
      />
    </mesh>
  )
}

// ── Rain particles ─────────────────────────────────────────────────────────────
function Rain() {
  const ref      = useRef()
  const count    = 3000
  const OX = 0, OZ = -1.2, R = 2.0
  const TOP = 3.8, BOT = -3.8

  const pos = useMemo(() => {
    const arr = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      const r = Math.random() * R, a = Math.random() * Math.PI * 2
      arr[i * 3]     = OX + Math.cos(a) * r
      arr[i * 3 + 1] = BOT + Math.random() * (TOP - BOT)
      arr[i * 3 + 2] = OZ + Math.sin(a) * r * 0.35
    }
    return arr
  }, [])

  const spd = useMemo(() => {
    const arr = new Float32Array(count)
    for (let i = 0; i < count; i++) arr[i] = 0.05 + Math.random() * 0.04
    return arr
  }, [])

  useFrame(() => {
    for (let i = 0; i < count; i++) {
      pos[i * 3 + 1] -= spd[i]
      if (pos[i * 3 + 1] < BOT) {
        const r = Math.random() * R, a = Math.random() * Math.PI * 2
        pos[i * 3]     = OX + Math.cos(a) * r
        pos[i * 3 + 1] = TOP
        pos[i * 3 + 2] = OZ + Math.sin(a) * r * 0.35
      }
    }
    ref.current.geometry.attributes.position.needsUpdate = true
  })

  return (
    <Points ref={ref} stride={3} frustumCulled>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" array={pos} count={count} itemSize={3} />
      </bufferGeometry>
      <PointMaterial transparent color="#d8eef8" size={0.015} sizeAttenuation depthWrite={false} opacity={0.72} />
    </Points>
  )
}

// ── Floor ripple rings — water landing in a circle ────────────────────────────
const RING_COUNT = 7

function FloorRipples() {
  const rings   = useRef([])
  const phases  = useMemo(() => Array.from({ length: RING_COUNT }, (_, i) => i / RING_COUNT), [])
  const glowRef = useRef()

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()
    rings.current.forEach((mesh, i) => {
      if (!mesh) return
      const phase   = (t * 0.42 + phases[i]) % 1
      const scale   = 0.05 + phase * 5.5
      const opacity = Math.max(0, 0.7 - phase * 0.75)
      mesh.scale.setScalar(scale)
      if (mesh.material) mesh.material.opacity = opacity
    })
    if (glowRef.current) {
      glowRef.current.intensity = 5 + Math.sin(t * 3.0) * 2
    }
  })

  return (
    <group position={[0, -3.72, -1.2]} rotation={[-Math.PI / 2, 0, 0]}>
      {phases.map((_, i) => (
        <mesh key={i} ref={el => { rings.current[i] = el }}>
          <ringGeometry args={[0.75, 1.0, 64]} />
          <meshStandardMaterial
            color="#88d8f4"
            emissive="#88d8f4"
            emissiveIntensity={3}
            transparent opacity={0.6}
            depthWrite={false}
          />
        </mesh>
      ))}

      {/* Glowing centre drain */}
      <mesh>
        <circleGeometry args={[0.28, 48]} />
        <meshStandardMaterial color="#3FB8E0" emissive="#3FB8E0" emissiveIntensity={6} transparent opacity={1} />
      </mesh>
      <mesh>
        <ringGeometry args={[0.28, 0.42, 48]} />
        <meshStandardMaterial color="#c8eeff" emissive="#c8eeff" emissiveIntensity={4} transparent opacity={0.8} depthWrite={false} />
      </mesh>

      <pointLight ref={glowRef} position={[0, 0.3, 0]} intensity={6} color="#3FB8E0" distance={5} />
    </group>
  )
}

// ── Steam mist ─────────────────────────────────────────────────────────────────
function Steam() {
  const ref    = useRef()
  const count  = 400
  const origin = useMemo(() => {
    const arr = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      arr[i * 3]     = (Math.random() - 0.5) * 4
      arr[i * 3 + 1] = Math.random() * 7 - 4
      arr[i * 3 + 2] = (Math.random() - 0.5) * 2.5 - 1
    }
    return arr
  }, [])
  const pos = useMemo(() => Float32Array.from(origin), [origin])

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()
    for (let i = 0; i < count; i++) {
      pos[i * 3 + 1] += 0.002
      if (pos[i * 3 + 1] > 4.5) pos[i * 3 + 1] = -4
      pos[i * 3] = origin[i * 3] + Math.sin(t * 0.22 + i * 0.7) * 0.12
    }
    ref.current.geometry.attributes.position.needsUpdate = true
  })

  return (
    <Points ref={ref} stride={3} frustumCulled>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" array={pos} count={count} itemSize={3} />
      </bufferGeometry>
      <PointMaterial transparent color="#dde8ee" size={0.05} sizeAttenuation depthWrite={false} opacity={0.10} />
    </Points>
  )
}

// ── Scene ready ────────────────────────────────────────────────────────────────
function SceneReady() {
  const setSceneLoaded = useAppStore((s) => s.setSceneLoaded)
  useEffect(() => { setSceneLoaded() }, [])
  return null
}

// ── Responsive camera — desktop looks into room, mobile sees wall not floor ────
function Camera() {
  const { camera } = useThree()

  useEffect(() => {
    const update = () => {
      const mob = window.innerWidth < 768
      camera.fov      = mob ? 78 : 68
      camera.position.set(0, mob ? 1.5 : 0, mob ? 9.5 : 7.5)
      camera.updateProjectionMatrix()
    }
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [camera])

  useFrame(({ clock, camera }) => {
    const t   = clock.getElapsedTime()
    const mob = window.innerWidth < 768
    camera.position.x = Math.sin(t * 0.03) * 0.18
    camera.position.y = (mob ? 1.5 : 0) + Math.cos(t * 0.025) * 0.08 + 0.2
    camera.lookAt(0, mob ? 1.0 : 0.1, -1.5)
  })
  return null
}

// ── Main export — skip WebGL entirely on mobile ────────────────────────────────
export default function HeroScene() {
  const [isDesktop, setIsDesktop] = useState(() => window.innerWidth >= 768)

  useEffect(() => {
    const check = () => setIsDesktop(window.innerWidth >= 768)
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  if (!isDesktop) return null

  return (
    <Canvas
      camera={{ position: [0, 0, 7.5], fov: 68 }}
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
      gl={{ antialias: true, alpha: false }}
      dpr={[1, 2]}
    >
      <color attach="background" args={['#080a0d']} />
      <ambientLight intensity={0.06} color="#b8ccda" />

      {/* Overhead shower spotlight - illuminates the falling rain */}
      <spotLight
        position={[0, 7, -1]}
        angle={0.50}
        penumbra={0.55}
        intensity={35}
        color="#c8e8f5"
        castShadow={false}
      />
      {/* Warm fill from floor level - bounces off white floor */}
      <pointLight position={[0, -4, 1]}   intensity={3.5} color="#f0ece4" distance={10} />
      {/* Side fills */}
      <pointLight position={[-5, 1, -1]}  intensity={1.5} color="#c8d8e0" distance={8} />
      <pointLight position={[ 5, 1, -1]}  intensity={1.5} color="#c8d8e0" distance={8} />

      <SceneReady />

      {/* ── Room walls ── */}
      <MarbleWall position={[0, 0.5, -5.5]} rotation={[0, 0, 0]}              size={[20, 14]} />
      <MarbleWall position={[-5.5, 0.5, -2]} rotation={[0,  Math.PI / 2, 0]}  size={[12, 14]} />
      <MarbleWall position={[ 5.5, 0.5, -2]} rotation={[0, -Math.PI / 2, 0]}  size={[12, 14]} />
      <MarbleWall position={[0, -3.8, -2]}   rotation={[-Math.PI / 2, 0, 0]}  size={[14, 12]} isFloor />
      <mesh position={[0, 5.2, -2]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[14, 12]} />
        <meshStandardMaterial color="#e8eef2" roughness={0.9} metalness={0} side={THREE.DoubleSide} />
      </mesh>

      {/* ── Water ── */}
      <Rain />
      <Steam />
      <FloorRipples />

      <EffectComposer>
        <Bloom intensity={1.8} luminanceThreshold={0.10} luminanceSmoothing={0.88} mipmapBlur />
        <Vignette eskil={false} offset={0.25} darkness={0.65} />
      </EffectComposer>

      <Camera />
    </Canvas>
  )
}
