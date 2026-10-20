import { Suspense, useEffect, useRef, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { ContactShadows, Float, Sparkles } from '@react-three/drei'
import * as THREE from 'three'

const GOLD = '#d8b66b'
const SAND = '#b66b4f'
const PALE = '#f5dba0'
const MAROON = '#45101f'

function Pillar({ x = 0, z = 0, height = 3.05, color = GOLD, scale = 1 }) {
  return (
    <group position={[x, -0.06, z]} scale={scale}>
      <mesh position={[0, -height / 2, 0]} castShadow>
        <cylinderGeometry args={[0.23, 0.28, 0.18, 12]} />
        <meshStandardMaterial color={color} metalness={0.68} roughness={0.28} />
      </mesh>
      <mesh position={[0, 0, 0]} castShadow>
        <cylinderGeometry args={[0.13, 0.2, height, 16]} />
        <meshStandardMaterial color={SAND} roughness={0.48} metalness={0.18} />
      </mesh>
      {[ -height * 0.38, -height * 0.29, height * 0.3, height * 0.37 ].map((y, i) => (
        <mesh key={i} position={[0, y, 0]}>
          <cylinderGeometry args={[i % 2 ? 0.17 : 0.19, i % 2 ? 0.17 : 0.19, 0.065, 16]} />
          <meshStandardMaterial color={GOLD} metalness={0.75} roughness={0.24} />
        </mesh>
      ))}
      <mesh position={[0, height / 2, 0]} castShadow>
        <cylinderGeometry args={[0.29, 0.18, 0.2, 12]} />
        <meshStandardMaterial color={color} metalness={0.65} roughness={0.3} />
      </mesh>
      <mesh position={[0, height / 2 + 0.13, 0]}>
        <sphereGeometry args={[0.15, 12, 12]} />
        <meshStandardMaterial color={PALE} metalness={0.45} roughness={0.25} />
      </mesh>
    </group>
  )
}

function Arch({ radius = 1.52, tube = 0.13, y = 1.42, z = 0.03, color = GOLD }) {
  return (
    <mesh position={[0, y, z]} castShadow>
      <torusGeometry args={[radius, tube, 14, 80, Math.PI]} />
      <meshStandardMaterial color={color} metalness={0.72} roughness={0.24} />
    </mesh>
  )
}

function Jharokha({ x, y, z = -0.45, size = 0.7 }) {
  return (
    <group position={[x, y, z]} scale={size}>
      <mesh position={[0, 0, -0.1]}>
        <boxGeometry args={[1.1, 1.35, 0.14]} />
        <meshStandardMaterial color={MAROON} roughness={0.66} />
      </mesh>
      <mesh position={[0, 0.62, 0]}>
        <torusGeometry args={[0.54, 0.075, 10, 48, Math.PI]} />
        <meshStandardMaterial color={GOLD} metalness={0.65} roughness={0.3} />
      </mesh>
      {[-0.42, 0, 0.42].map((px, i) => (
        <mesh key={i} position={[px, -0.05, 0.015]}>
          <boxGeometry args={[0.045, 0.95, 0.05]} />
          <meshStandardMaterial color={GOLD} metalness={0.6} roughness={0.3} />
        </mesh>
      ))}
      <mesh position={[0, -0.55, 0.02]}>
        <boxGeometry args={[1.28, 0.12, 0.18]} />
        <meshStandardMaterial color={GOLD} metalness={0.62} roughness={0.27} />
      </mesh>
      <mesh position={[0, -0.75, -0.12]} rotation={[0, 0, Math.PI]}>
        <coneGeometry args={[0.18, 0.36, 4]} />
        <meshStandardMaterial color={SAND} roughness={0.48} />
      </mesh>
    </group>
  )
}

function Diya({ position, delay = 0 }) {
  const flame = useRef()
  useFrame(({ clock }) => {
    if (flame.current) {
      flame.current.scale.y = 0.86 + Math.sin(clock.elapsedTime * 5 + delay) * 0.16
      flame.current.rotation.z = Math.sin(clock.elapsedTime * 4 + delay) * 0.08
    }
  })
  return (
    <group position={position}>
      <mesh position={[0, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <sphereGeometry args={[0.16, 18, 10]} />
        <meshStandardMaterial color={GOLD} metalness={0.82} roughness={0.2} />
      </mesh>
      <mesh ref={flame} position={[0, 0.17, 0]}>
        <coneGeometry args={[0.07, 0.24, 12]} />
        <meshStandardMaterial color="#ffb44d" emissive="#ff6c18" emissiveIntensity={2.1} roughness={0.35} />
      </mesh>
      <pointLight position={[0, 0.21, 0.1]} color="#ff9b43" intensity={0.55} distance={1.5} />
    </group>
  )
}

function Toran() {
  const flowers = Array.from({ length: 17 }, (_, i) => {
    const x = -1.7 + i * 0.2125
    const y = 2.55 - Math.sin((i / 16) * Math.PI) * 0.32
    return { x, y, color: i % 3 === 0 ? '#f3a747' : i % 3 === 1 ? '#c65b3f' : '#f4d48c' }
  })
  return (
    <group>
      <mesh position={[0, 2.57, 0.2]}>
        <torusGeometry args={[1.58, 0.025, 8, 64, Math.PI]} />
        <meshStandardMaterial color="#4e7c3f" roughness={0.9} />
      </mesh>
      {flowers.map((f, i) => (
        <group key={i} position={[f.x, f.y, 0.2]}>
          <mesh>
            <sphereGeometry args={[0.09, 10, 10]} />
            <meshStandardMaterial color={f.color} roughness={0.66} />
          </mesh>
          <mesh position={[0, -0.09, 0]} rotation={[0, 0, i % 2 ? 0.45 : -0.45]}>
            <sphereGeometry args={[0.045, 8, 8]} />
            <meshStandardMaterial color="#5e7839" roughness={0.9} />
          </mesh>
        </group>
      ))}
      {[-1.3, -0.65, 0, 0.65, 1.3].map((x, i) => (
        <group key={i} position={[x, 2.28 - Math.sin((i / 4) * Math.PI) * 0.12, 0.2]}>
          <mesh rotation={[0, 0, Math.PI]}>
            <coneGeometry args={[0.12, 0.27, 8]} />
            <meshStandardMaterial color="#f0c65d" roughness={0.65} />
          </mesh>
        </group>
      ))}
    </group>
  )
}

function PalaceModel() {
  const group = useRef()
  useFrame(({ clock, pointer }) => {
    if (group.current) {
      group.current.rotation.y = Math.sin(clock.elapsedTime * 0.16) * 0.045 + pointer.x * 0.06
      group.current.rotation.x = -pointer.y * 0.018
    }
  })

  return (
    <group ref={group} position={[0, -0.08, 0]}>
      {/* Backdrop walls and carved haveli wings */}
      <mesh position={[0, 0.25, -0.72]} receiveShadow>
        <boxGeometry args={[5.35, 3.7, 0.3]} />
        <meshStandardMaterial color="#7b3540" roughness={0.78} />
      </mesh>
      <mesh position={[-2.22, 0.2, -0.5]} castShadow>
        <boxGeometry args={[0.9, 3.85, 0.22]} />
        <meshStandardMaterial color="#a95743" roughness={0.62} />
      </mesh>
      <mesh position={[2.22, 0.2, -0.5]} castShadow>
        <boxGeometry args={[0.9, 3.85, 0.22]} />
        <meshStandardMaterial color="#a95743" roughness={0.62} />
      </mesh>
      <mesh position={[0, -0.02, -0.5]}>
        <boxGeometry args={[2.78, 2.95, 0.17]} />
        <meshStandardMaterial color="#37101c" roughness={0.86} />
      </mesh>
      <mesh position={[0, 1.58, -0.38]}>
        <boxGeometry args={[3.5, 0.18, 0.3]} />
        <meshStandardMaterial color={GOLD} metalness={0.68} roughness={0.3} />
      </mesh>

      {/* Main ceremonial arch */}
      <Pillar x={-1.52} height={3.12} />
      <Pillar x={1.52} height={3.12} />
      <Arch radius={1.51} tube={0.16} y={1.46} z={0.04} />
      <Arch radius={1.28} tube={0.045} y={1.46} z={0.09} color={PALE} />
      <mesh position={[0, -1.12, 0.15]}>
        <boxGeometry args={[3.38, 0.15, 0.5]} />
        <meshStandardMaterial color={GOLD} metalness={0.68} roughness={0.28} />
      </mesh>
      <Toran />

      {/* Haveli jharokhas */}
      <Jharokha x={-2.23} y={0.82} size={0.72} />
      <Jharokha x={2.23} y={0.82} size={0.72} />
      <Jharokha x={-2.2} y={2.05} size={0.42} />
      <Jharokha x={2.2} y={2.05} size={0.42} />

      {/* Roofline, chhatris and miniature spires */}
      {[-2.15, -1.45, -0.72, 0, 0.72, 1.45, 2.15].map((x, i) => (
        <group key={i} position={[x, 2.26 + (Math.abs(x) < 0.1 ? 0.25 : 0), -0.5]}>
          <mesh position={[0, 0.18, 0]}>
            <cylinderGeometry args={[0.2, 0.27, 0.26, 8]} />
            <meshStandardMaterial color={GOLD} metalness={0.65} roughness={0.3} />
          </mesh>
          <mesh position={[0, 0.4, 0]}>
            <coneGeometry args={[0.22, 0.33, 8]} />
            <meshStandardMaterial color={SAND} roughness={0.5} />
          </mesh>
          <mesh position={[0, 0.62, 0]}>
            <sphereGeometry args={[0.055, 10, 10]} />
            <meshStandardMaterial color={PALE} metalness={0.65} roughness={0.25} />
          </mesh>
        </group>
      ))}

      {/* Small lotus emblem */}
      <group position={[0, 0.7, 0.15]}>
        {Array.from({ length: 8 }, (_, i) => (
          <mesh key={i} rotation={[0, 0, (Math.PI * 2 * i) / 8]} position={[Math.cos((Math.PI * 2 * i) / 8) * 0.18, Math.sin((Math.PI * 2 * i) / 8) * 0.18, 0]}>
            <sphereGeometry args={[0.115, 12, 10]} />
            <meshStandardMaterial color={i % 2 ? '#e9bb6c' : '#f4d79b'} metalness={0.42} roughness={0.28} />
          </mesh>
        ))}
        <mesh>
          <sphereGeometry args={[0.09, 12, 12]} />
          <meshStandardMaterial color="#8c2e38" roughness={0.45} />
        </mesh>
      </group>

      <Diya position={[-1.42, -1.05, 0.55]} delay={0.3} />
      <Diya position={[1.42, -1.05, 0.55]} delay={1.7} />
      <Diya position={[-2.42, -1.18, 0.08]} delay={0.9} />
      <Diya position={[2.42, -1.18, 0.08]} delay={2.3} />

      {/* Foreground rangoli-inspired discs */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.53, 0.2]} receiveShadow>
        <cylinderGeometry args={[2.15, 2.15, 0.055, 64]} />
        <meshStandardMaterial color="#692332" roughness={0.8} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.49, 0.2]}>
        <torusGeometry args={[1.77, 0.025, 8, 64]} />
        <meshStandardMaterial color={GOLD} metalness={0.75} roughness={0.28} />
      </mesh>
      {Array.from({ length: 12 }, (_, i) => (
        <mesh key={i} rotation={[-Math.PI / 2, 0, (Math.PI * 2 * i) / 12]} position={[Math.cos((Math.PI * 2 * i) / 12) * 1.35, -1.48, 0.2 + Math.sin((Math.PI * 2 * i) / 12) * 1.35]}>
          <sphereGeometry args={[0.075, 10, 10]} />
          <meshStandardMaterial color={i % 2 ? '#f4cc78' : '#d96e50'} roughness={0.48} />
        </mesh>
      ))}
    </group>
  )
}

function FloatingPetals({ count = 24, reducedMotion = false }) {
  const petals = Array.from({ length: count }, (_, i) => ({
    position: [((i * 37) % 55) / 10 - 2.75, ((i * 19) % 38) / 10 - 1.3, ((i * 13) % 20) / 10 - 0.5],
    color: i % 3 === 0 ? '#e7a16a' : i % 3 === 1 ? '#f2c76f' : '#bd5a52',
    speed: reducedMotion ? 0 : 0.6 + (i % 5) * 0.18,
  }))
  return (
    <group>
      {petals.map((petal, i) => (
        <Float key={i} speed={petal.speed} rotationIntensity={reducedMotion ? 0 : 1.1} floatIntensity={reducedMotion ? 0 : 0.65} floatingRange={[-0.3, 0.3]}>
          <mesh position={petal.position} rotation={[0.4, 0, i * 0.6]} scale={[0.07, 0.025, 0.012]}>
            <sphereGeometry args={[1, 8, 6]} />
            <meshStandardMaterial color={petal.color} roughness={0.85} side={THREE.DoubleSide} />
          </mesh>
        </Float>
      ))}
    </group>
  )
}

export default function PalaceScene() {
  const [isMobile, setIsMobile] = useState(() => (typeof window !== 'undefined' ? window.innerWidth < 768 : false))
  const [reducedMotion, setReducedMotion] = useState(() => (typeof window !== 'undefined' ? window.matchMedia('(prefers-reduced-motion: reduce)').matches : false))

  useEffect(() => {
    if (typeof window === 'undefined') return
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768)
    }
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    const handleMotionChange = (e) => setReducedMotion(e.matches)

    window.addEventListener('resize', handleResize)
    motionQuery.addEventListener?.('change', handleMotionChange)
    return () => {
      window.removeEventListener('resize', handleResize)
      motionQuery.removeEventListener?.('change', handleMotionChange)
    }
  }, [])

  // Mobile portrait orientation requires further camera Z and wider FOV to frame pillars & toran
  const cameraConfig = isMobile
    ? { position: [0, 0.75, 11.4], fov: 46 }
    : { position: [0, 0.9, 8.6], fov: 39 }

  return (
    <div
      className="palace-canvas"
      aria-label="सुनहरी रोशनी में राजस्थानी हवेली का त्रिआयामी दृश्य"
      role="img"
      style={{
        pointerEvents: 'none', // Prevents Three.js canvas from swallowing mobile touch scroll events
        touchAction: 'pan-y',
      }}
    >
      <Canvas
        shadows={!isMobile} // Disable heavy dynamic shadow maps on mobile devices for battery/performance
        dpr={isMobile ? [1, 1.25] : [1, 1.6]}
        camera={cameraConfig}
        gl={{ antialias: true, alpha: true, powerPreference: 'low-power' }}
        fallback={
          <div className="canvas-fallback" style={{ display: 'grid', placeContent: 'center', height: '100%', color: '#f3dfaa' }}>
            <div style={{ fontSize: 24, fontFamily: 'Cinzel, serif', color: '#ffd700' }}>॥ शुभ विवाह ॥</div>
            <p style={{ fontSize: 12, letterSpacing: '.12em', color: '#c49a38' }}>राजसी विरासत एवं आशीर्वाद</p>
          </div>
        }
      >
        <fog attach="fog" args={['#4c1826', isMobile ? 10 : 8, isMobile ? 18 : 15]} />
        <ambientLight intensity={1.3} />
        <directionalLight position={[3, 6, 5]} intensity={isMobile ? 1.8 : 2.2} color="#ffdeb0" castShadow={!isMobile} />
        <pointLight position={[-3, 1.5, 3]} intensity={1.5} color="#f5a36a" distance={8} />
        {!isMobile && <pointLight position={[3, 2.8, -2]} intensity={1.5} color="#e8c16c" distance={7} />}
        <Suspense fallback={null}>
          <PalaceModel />
          <FloatingPetals count={isMobile ? 12 : 24} reducedMotion={reducedMotion} />
          <Sparkles
            count={isMobile ? 18 : 52}
            scale={[6.5, 5, 3]}
            size={isMobile ? 1.8 : 2.2}
            speed={reducedMotion ? 0.05 : 0.23}
            color="#ffd987"
            opacity={0.7}
          />
          {!isMobile && <ContactShadows position={[0, -1.52, 0]} opacity={0.43} scale={8} blur={2.8} far={4.5} />}
        </Suspense>
      </Canvas>
    </div>
  )
}
