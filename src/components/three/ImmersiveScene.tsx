import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, Float, Lightformer } from "@react-three/drei";
import { Suspense, useEffect, useMemo, useRef } from "react";
import * as THREE from "three";

const VOID = "#050816";
const CYAN = "#60f4ff";
const VIOLET = "#8b7cff";
const LIME = "#b8ff6a";

function pathSeed(pathname: string) {
  return pathname.split("").reduce((sum, char) => sum + char.charCodeAt(0), 0) % 11;
}

function ParticleVolume({ seed }: { seed: number }) {
  const ref = useRef<THREE.Points>(null);
  const count = 1250;
  const positions = useMemo(() => {
    const random = mulberry32(seed + 71);
    const values = new Float32Array(count * 3);
    for (let i = 0; i < count; i += 1) {
      values[i * 3] = (random() - 0.5) * 34;
      values[i * 3 + 1] = (random() - 0.5) * 22;
      values[i * 3 + 2] = (random() - 0.5) * 22 - 5;
    }
    return values;
  }, [seed]);

  useFrame((state, delta) => {
    if (!ref.current) return;
    ref.current.rotation.y += Math.min(delta, 0.04) * 0.012;
    ref.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.08) * 0.035;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.025}
        color={CYAN}
        transparent
        opacity={0.58}
        depthWrite={false}
        sizeAttenuation
      />
    </points>
  );
}

function InterfaceShard({
  position,
  rotation,
  scale,
  accent,
  delay,
}: {
  position: [number, number, number];
  rotation: [number, number, number];
  scale: [number, number, number];
  accent: string;
  delay: number;
}) {
  return (
    <Float
      speed={0.65 + delay * 0.05}
      rotationIntensity={0.18}
      floatIntensity={0.45 + delay * 0.04}
    >
      <group position={position} rotation={rotation} scale={scale}>
        <mesh>
          <boxGeometry args={[1, 0.63, 0.028]} />
          <meshPhysicalMaterial
            color="#101a32"
            emissive={accent}
            emissiveIntensity={0.055}
            metalness={0.34}
            roughness={0.12}
            transmission={0.36}
            thickness={0.6}
            transparent
            opacity={0.82}
            clearcoat={1}
            clearcoatRoughness={0.08}
          />
        </mesh>
        <mesh position={[0, 0, 0.022]}>
          <planeGeometry args={[0.78, 0.02]} />
          <meshBasicMaterial color={accent} transparent opacity={0.45} />
        </mesh>
        <mesh position={[-0.28, 0.12, 0.023]}>
          <planeGeometry args={[0.16, 0.16]} />
          <meshBasicMaterial color={accent} transparent opacity={0.17} />
        </mesh>
      </group>
    </Float>
  );
}

function TransformationCore({ seed }: { seed: number }) {
  const knot = useRef<THREE.Mesh>(null);
  const cage = useRef<THREE.Mesh>(null);
  const ringA = useRef<THREE.Mesh>(null);
  const ringB = useRef<THREE.Mesh>(null);

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.05);
    if (knot.current) {
      knot.current.rotation.x += dt * 0.08;
      knot.current.rotation.y += dt * 0.14;
    }
    if (cage.current) {
      cage.current.rotation.x -= dt * 0.025;
      cage.current.rotation.z += dt * 0.035;
    }
    if (ringA.current) ringA.current.rotation.z += dt * 0.075;
    if (ringB.current) ringB.current.rotation.x -= dt * 0.055;
    const pulse = 1 + Math.sin(state.clock.elapsedTime * 0.65 + seed) * 0.025;
    if (knot.current) knot.current.scale.setScalar(pulse);
  });

  return (
    <group position={[1.25, 0.1, -5.4]} rotation={[0.12, seed * 0.035, -0.16]}>
      <mesh ref={cage}>
        <icosahedronGeometry args={[2.75, 2]} />
        <meshBasicMaterial color={VIOLET} wireframe transparent opacity={0.085} />
      </mesh>
      <mesh ref={knot}>
        <torusKnotGeometry args={[1.34, 0.34, 180, 28, 2, 3]} />
        <meshPhysicalMaterial
          color="#10162c"
          emissive={CYAN}
          emissiveIntensity={0.075}
          metalness={0.78}
          roughness={0.15}
          clearcoat={1}
          clearcoatRoughness={0.05}
        />
      </mesh>
      <mesh ref={ringA} rotation={[1.18, 0.15, 0.1]}>
        <torusGeometry args={[3.55, 0.018, 8, 180]} />
        <meshBasicMaterial color={CYAN} transparent opacity={0.6} />
      </mesh>
      <mesh ref={ringB} rotation={[0.4, 1.3, 0.2]}>
        <torusGeometry args={[3.08, 0.012, 8, 160]} />
        <meshBasicMaterial color={LIME} transparent opacity={0.32} />
      </mesh>
      <pointLight color={CYAN} intensity={24} distance={11} />
    </group>
  );
}

function DataHelix({ seed }: { seed: number }) {
  const accents = [CYAN, VIOLET, LIME];
  const shards = useMemo(
    () =>
      Array.from({ length: 14 }, (_, index) => {
        const angle = index * 0.64 + seed * 0.13;
        const radius = 4.7 + (index % 3) * 0.34;
        return {
          position: [
            Math.cos(angle) * radius,
            -4.8 + index * 0.76,
            -6.5 + Math.sin(angle) * 2.6,
          ] as [number, number, number],
          rotation: [0.04 * (index % 3), -angle + Math.PI / 2, index % 2 ? 0.08 : -0.08] as [
            number,
            number,
            number,
          ],
          scale: [1.3 + (index % 4) * 0.12, 1.3 + (index % 2) * 0.18, 1] as [
            number,
            number,
            number,
          ],
          accent: accents[index % accents.length]!,
        };
      }),
    [seed],
  );

  return (
    <group>
      {shards.map((shard, index) => (
        <InterfaceShard key={index} {...shard} delay={index} />
      ))}
    </group>
  );
}

function PerspectiveGrid() {
  return (
    <group position={[0, -5.25, -7]} rotation={[0, 0, 0]}>
      <gridHelper args={[38, 38, "#233a5c", "#101d34"]} />
      <mesh position={[0, 0.015, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[38, 38]} />
        <meshBasicMaterial color={VOID} transparent opacity={0.58} />
      </mesh>
    </group>
  );
}

function ScrollRig({ children, seed }: { children: React.ReactNode; seed: number }) {
  const group = useRef<THREE.Group>(null);
  const scroll = useRef(0);
  const velocity = useRef(0);
  const lastY = useRef(0);

  useEffect(() => {
    const update = () => {
      const y = window.scrollY;
      const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      scroll.current = Math.min(1, y / max);
      velocity.current = THREE.MathUtils.clamp((y - lastY.current) / 110, -1, 1);
      lastY.current = y;
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);

  useFrame((state, delta) => {
    if (!group.current) return;
    const dt = Math.min(delta, 0.05);
    const ease = 1 - Math.exp(-3.6 * dt);
    const targetY = -scroll.current * 5.2 + Math.sin(seed) * 0.18;
    const targetZ = scroll.current * 1.65;
    const targetRotY = state.pointer.x * 0.16 + scroll.current * 0.72;
    const targetRotX = -state.pointer.y * 0.1 + velocity.current * 0.035;
    group.current.position.y += (targetY - group.current.position.y) * ease;
    group.current.position.z += (targetZ - group.current.position.z) * ease;
    group.current.position.x += (state.pointer.x * 0.6 - group.current.position.x) * ease * 0.55;
    group.current.rotation.y += (targetRotY - group.current.rotation.y) * ease;
    group.current.rotation.x += (targetRotX - group.current.rotation.x) * ease;
    velocity.current *= 0.93;
  });

  return <group ref={group}>{children}</group>;
}

function Scene({ pathname }: { pathname: string }) {
  const seed = pathSeed(pathname);

  return (
    <>
      <fog attach="fog" args={[VOID, 10, 31]} />
      <ambientLight intensity={0.18} />
      <directionalLight position={[4, 9, 6]} intensity={1.5} color="#e7f8ff" />
      <pointLight position={[-7, 1, -1]} intensity={20} distance={18} color={VIOLET} />
      <pointLight position={[6, -2, 1]} intensity={13} distance={16} color={LIME} />

      <Suspense fallback={null}>
        <Environment resolution={128}>
          <Lightformer intensity={2.8} position={[0, 8, 2]} scale={[12, 4, 1]} color="#dffbff" />
          <Lightformer
            intensity={2}
            position={[-7, 0, -1]}
            scale={[14, 2, 1]}
            color={CYAN}
            rotation-y={Math.PI / 2}
          />
          <Lightformer
            intensity={1.6}
            position={[7, -1, -2]}
            scale={[14, 3, 1]}
            color={VIOLET}
            rotation-y={-Math.PI / 2}
          />
        </Environment>

        <PerspectiveGrid />
        <ParticleVolume seed={seed} />
        <ScrollRig seed={seed}>
          <TransformationCore seed={seed} />
          <DataHelix seed={seed} />
        </ScrollRig>
      </Suspense>
    </>
  );
}

export default function ImmersiveScene({ pathname = "/" }: { pathname?: string }) {
  return (
    <Canvas
      dpr={[1, 1.65]}
      camera={{ position: [0, 0.45, 10.5], fov: 46, near: 0.1, far: 70 }}
      gl={{ antialias: true, alpha: false, powerPreference: "high-performance" }}
      performance={{ min: 0.55 }}
    >
      <color attach="background" args={[VOID]} />
      <Scene pathname={pathname} />
    </Canvas>
  );
}

function mulberry32(seed: number) {
  let value = seed >>> 0;
  return () => {
    value += 0x6d2b79f5;
    let t = value;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
