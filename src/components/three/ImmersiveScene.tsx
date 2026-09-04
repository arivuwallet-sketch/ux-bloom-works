import { Canvas, useFrame, type ThreeElements } from "@react-three/fiber";
import { Environment, Lightformer, Float } from "@react-three/drei";
import { Suspense, useMemo, useRef } from "react";
import * as THREE from "three";

const INK = "#12102A";
const AMBER = "#A78BFA";
const JADE = "#4ADE80";
const ROSE = "#7C6BF5";

/** Floating glass slabs — abstract "screens" being revised. */
function Slab({
  position,
  rotation,
  scale,
  tint,
}: {
  position: [number, number, number];
  rotation: [number, number, number];
  scale: [number, number, number];
  tint: string;
}) {
  return (
    <Float speed={1.1} rotationIntensity={0.35} floatIntensity={0.9}>
      <mesh position={position} rotation={rotation} scale={scale}>
        <boxGeometry args={[1, 1, 0.035]} />
        <meshPhysicalMaterial
          color={tint}
          roughness={0.12}
          metalness={0.1}
          transmission={0.6}
          thickness={0.7}
          ior={1.35}
          clearcoat={1}
          clearcoatRoughness={0.15}
          transparent
          opacity={0.98}
        />
      </mesh>
    </Float>
  );
}

function Dust({ count = 700 }: { count?: number }) {
  const ref = useRef<THREE.Points>(null);
  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      arr[i * 3] = (Math.random() - 0.5) * 26;
      arr[i * 3 + 1] = (Math.random() - 0.5) * 16;
      arr[i * 3 + 2] = (Math.random() - 0.5) * 14 - 2;
    }
    return arr;
  }, [count]);

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.05);
    if (ref.current) {
      ref.current.rotation.y += dt * 0.02;
      ref.current.position.y = Math.sin(state.clock.elapsedTime * 0.15) * 0.35;
    }
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.045}
        color={AMBER}
        transparent
        opacity={0.7}
        sizeAttenuation
        depthWrite={false}
      />
    </points>
  );
}

/** Thin editorial rules drifting through space. */
function Rules() {
  const group = useRef<THREE.Group>(null);
  useFrame((state) => {
    if (group.current) {
      group.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.08) * 0.06;
    }
  });
  const lines = useMemo(
    () =>
      Array.from({ length: 9 }, (_, i) => ({
        y: -6 + i * 1.5,
        w: 6 + ((i * 37) % 9),
        z: -5 - (i % 3),
        o: 0.05 + (i % 4) * 0.03,
      })),
    [],
  );
  return (
    <group ref={group}>
      {lines.map((l, i) => (
        <mesh key={i} position={[0, l.y, l.z]}>
          <planeGeometry args={[l.w, 0.012]} />
          <meshBasicMaterial color="#E7E4FF" transparent opacity={l.o} depthWrite={false} />
        </mesh>
      ))}
    </group>
  );
}

function Rig({ children }: { children: React.ReactNode }) {
  const group = useRef<THREE.Group>(null);
  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.05);
    if (!group.current) return;
    const tx = state.pointer.x * 0.55;
    const ty = state.pointer.y * 0.35;
    const k = 1 - Math.exp(-2.5 * dt);
    group.current.rotation.y += (tx * 0.25 - group.current.rotation.y) * k;
    group.current.rotation.x += (-ty * 0.18 - group.current.rotation.x) * k;
    group.current.position.x += (tx - group.current.position.x) * k * 0.6;
    group.current.position.y += (ty - group.current.position.y) * k * 0.6;
  });
  return <group ref={group}>{children}</group>;
}

type GroupProps = ThreeElements["group"];

export default function ImmersiveScene(props: GroupProps) {
  return (
    <Canvas
      dpr={[1, 1.75]}
      gl={{ antialias: true, alpha: false }}
      camera={{ position: [0, 0, 9], fov: 50 }}
    >
      <color attach="background" args={[INK]} />
      <fog attach="fog" args={[INK, 12, 26]} />
      <ambientLight intensity={0.35} />
      <directionalLight position={[6, 8, 6]} intensity={1.1} color="#EDE9FE" />
      <pointLight position={[-6, -3, 2]} intensity={18} color={JADE} distance={16} />
      <pointLight position={[7, 4, -2]} intensity={16} color={ROSE} distance={18} />

      <Suspense fallback={null}>
        <Environment resolution={128}>
          <Lightformer intensity={2.4} position={[0, 6, 2]} scale={[12, 6, 1]} color="#D9FBE7" />
          <Lightformer
            intensity={1.4}
            color={JADE}
            position={[-7, 0, -1]}
            rotation-y={Math.PI / 2}
            scale={[18, 3, 1]}
          />
          <Lightformer
            intensity={1.2}
            color={ROSE}
            position={[7, -1, -1]}
            rotation-y={-Math.PI / 2}
            scale={[18, 3, 1]}
          />
        </Environment>

        <Rig {...props}>
          <Rules />
          <Dust />
          <Slab position={[-3.4, 1.1, 0]} rotation={[0.18, 0.5, -0.12]} scale={[3.1, 2, 1]} tint="#C9F5DD" />
          <Slab position={[3.2, -0.7, -1.6]} rotation={[-0.2, -0.55, 0.1]} scale={[2.6, 3.4, 1]} tint="#D8CFFB" />
          <Slab position={[0.4, 2.6, -3.2]} rotation={[0.1, 0.15, 0.28]} scale={[2.2, 1.4, 1]} tint="#BFEFD8" />
          <Slab position={[-1.4, -2.7, -2.2]} rotation={[-0.12, 0.35, -0.3]} scale={[1.8, 1.2, 1]} tint="#CBD8FB" />
        </Rig>
      </Suspense>
    </Canvas>
  );
}
