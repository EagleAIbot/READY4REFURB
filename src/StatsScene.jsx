import { useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Points, PointMaterial } from '@react-three/drei'
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing'
import * as THREE from 'three'

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

const blackMarbleFrag = `
  uniform float uTime;
  varying vec2 vUv;
  ${NOISE_GLSL}
  void main() {
    vec2 uv = vUv * vec2(2.4, 2.8) + vec2(5.0, 2.5);
    float t  = uTime * 0.006;
    float n1 = fbm(uv + t);
    float n2 = fbm(uv * 1.6 - t * 0.42 + vec2(n1 * 2.0, n1 * 0.75));
    float n3 = fbm(uv * 0.38 + vec2(6.2, 4.1));
    float vp1 = pow(max(sin(uv.x * 3.0 + n2 * 8.5 + n1 * 4.0) * 0.5 + 0.5, 0.0), 3.0);
    float vp2 = pow(max(sin(uv.y * 2.0 + n1 * 5.2 + n3 * 2.5) * 0.5 + 0.5, 0.0), 4.2) * 0.48;
    float veins = vp1 + vp2;
    vec3 base    = vec3(0.038, 0.040, 0.046);
    vec3 midV    = vec3(0.21,  0.23,  0.26);
    vec3 brightV = vec3(0.70,  0.73,  0.78);
    vec3 col = mix(base, midV, min(veins * 0.58, 1.0));
    col = mix(col, brightV, pow(vp1, 2.0) * 0.38);
    col += (fbm(uv * 8.5 + 1.8) - 0.5) * 0.016;
    gl_FragColor = vec4(col, 1.0);
  }
`

const whiteMarbleFrag = `
  uniform float uTime;
  varying vec2 vUv;
  ${NOISE_GLSL}
  void main() {
    vec2 uv = vUv * vec2(1.6, 1.6) + vec2(9.0, 4.5);
    float t  = uTime * 0.005;
    float n1 = fbm(uv + t);
    float n2 = fbm(uv * 1.45 - t * 0.36 + vec2(n1 * 1.7, n1 * 0.85));
    float vp1 = pow(max(sin(uv.x * 2.6 + n2 * 7.2 + n1 * 3.6) * 0.5 + 0.5, 0.0), 3.4);
    float vp2 = pow(max(sin(uv.y * 2.0 + n1 * 4.8) * 0.5 + 0.5, 0.0), 4.8) * 0.36;
    float veins = vp1 + vp2;
    vec3 base   = vec3(0.93, 0.91, 0.87);
    vec3 vein1c = vec3(0.65, 0.62, 0.58);
    vec3 vein2c = vec3(0.41, 0.39, 0.37);
    vec3 col = mix(base, vein1c, min(veins * 0.52, 1.0));
    col = mix(col, vein2c, pow(vp1, 2.4) * 0.26);
    col += (fbm(uv * 6.0 + 2.1) - 0.5) * 0.010;
    gl_FragColor = vec4(col, 1.0);
  }
`

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

function Rain() {
  const ref   = useRef()
  const count = 1600
  const TOP = 4.5, BOT = -5.0

  const pos = useMemo(() => {
    const arr = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      arr[i * 3]     = (Math.random() - 0.5) * 10
      arr[i * 3 + 1] = BOT + Math.random() * (TOP - BOT)
      arr[i * 3 + 2] = (Math.random() - 0.5) * 4 - 2
    }
    return arr
  }, [])

  const spd = useMemo(() => {
    const arr = new Float32Array(count)
    for (let i = 0; i < count; i++) arr[i] = 0.038 + Math.random() * 0.026
    return arr
  }, [])

  useFrame(() => {
    for (let i = 0; i < count; i++) {
      pos[i * 3 + 1] -= spd[i]
      if (pos[i * 3 + 1] < BOT) pos[i * 3 + 1] = TOP
    }
    ref.current.geometry.attributes.position.needsUpdate = true
  })

  return (
    <Points ref={ref} stride={3} frustumCulled>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" array={pos} count={count} itemSize={3} />
      </bufferGeometry>
      <PointMaterial transparent color="#c8e4f4" size={0.012} sizeAttenuation depthWrite={false} opacity={0.45} />
    </Points>
  )
}

function Steam() {
  const ref    = useRef()
  const count  = 320
  const origin = useMemo(() => {
    const arr = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      arr[i * 3]     = (Math.random() - 0.5) * 10
      arr[i * 3 + 1] = Math.random() * 9 - 5
      arr[i * 3 + 2] = (Math.random() - 0.5) * 4 - 2
    }
    return arr
  }, [])
  const pos = useMemo(() => Float32Array.from(origin), [origin])

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()
    for (let i = 0; i < count; i++) {
      pos[i * 3 + 1] += 0.0018
      if (pos[i * 3 + 1] > 4.5) pos[i * 3 + 1] = -5
      pos[i * 3] = origin[i * 3] + Math.sin(t * 0.20 + i * 0.6) * 0.11
    }
    ref.current.geometry.attributes.position.needsUpdate = true
  })

  return (
    <Points ref={ref} stride={3} frustumCulled>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" array={pos} count={count} itemSize={3} />
      </bufferGeometry>
      <PointMaterial transparent color="#d8e6ee" size={0.04} sizeAttenuation depthWrite={false} opacity={0.09} />
    </Points>
  )
}

function Camera() {
  useFrame(({ clock, camera }) => {
    const t = clock.getElapsedTime()
    camera.position.x = Math.sin(t * 0.028) * 0.25
    camera.position.y = Math.cos(t * 0.022) * 0.10
    camera.lookAt(0, 0, 0)
  })
  return null
}

export default function StatsScene() {
  return (
    <Canvas
      camera={{ position: [0, 0, 7], fov: 78 }}
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
      gl={{ antialias: true, alpha: false }}
      dpr={[1, 2]}
    >
      <color attach="background" args={['#080a0d']} />
      <ambientLight intensity={0.06} color="#b8ccda" />
      <spotLight position={[1, 8, 0]} angle={0.55} penumbra={0.5} intensity={28} color="#c8e8f5" castShadow={false} />
      <pointLight position={[0, -5, 1]}  intensity={3}   color="#ece8e0" distance={12} />
      <pointLight position={[-6, 1, -1]} intensity={1.2} color="#c0d0da" distance={9} />
      <pointLight position={[ 6, 1, -1]} intensity={1.2} color="#c0d0da" distance={9} />

      {/* Room */}
      <MarbleWall position={[0, 0.5, -6]}    rotation={[0, 0, 0]}              size={[22, 15]} />
      <MarbleWall position={[-6, 0.5, -2.5]} rotation={[0,  Math.PI / 2, 0]}  size={[14, 15]} />
      <MarbleWall position={[ 6, 0.5, -2.5]} rotation={[0, -Math.PI / 2, 0]}  size={[14, 15]} />
      <MarbleWall position={[0, -4.2, -2.5]} rotation={[-Math.PI / 2, 0, 0]}  size={[15, 14]} isFloor />
      <mesh position={[0, 5.6, -2.5]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[15, 14]} />
        <meshStandardMaterial color="#e5edf2" roughness={0.92} metalness={0} side={THREE.DoubleSide} />
      </mesh>

      <Rain />
      <Steam />

      <EffectComposer>
        <Bloom intensity={1.6} luminanceThreshold={0.10} luminanceSmoothing={0.88} mipmapBlur />
        <Vignette eskil={false} offset={0.28} darkness={0.60} />
      </EffectComposer>

      <Camera />
    </Canvas>
  )
}
