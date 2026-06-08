'use client';

import { Float, MeshDistortMaterial, PerspectiveCamera, Sphere, useDetectGPU } from '@react-three/drei';
import { Canvas, useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';

import { useDeviceTier } from '@/hooks/useDeviceTier';

function Particles({ count = 1500 }: { count?: number }) {
  const ref = useRef<THREE.Points>(null);
  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      arr[i * 3 + 0] = (Math.random() - 0.5) * 20;
      arr[i * 3 + 1] = (Math.random() - 0.5) * 20;
      arr[i * 3 + 2] = (Math.random() - 0.5) * 20;
    }
    return arr;
  }, [count]);

  useFrame((state) => {
    if (!ref.current) return;
    ref.current.rotation.y = state.clock.elapsedTime * 0.04;
    ref.current.rotation.x = state.clock.elapsedTime * 0.02;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.025} color="#00D9FF" sizeAttenuation transparent opacity={0.7} />
    </points>
  );
}

function FloatingShape({ position, color, speed = 1, distort = 0.4 }: {
  position: [number, number, number];
  color: string;
  speed?: number;
  distort?: number;
}) {
  const ref = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!ref.current) return;
    ref.current.rotation.x = state.clock.elapsedTime * 0.2 * speed;
    ref.current.rotation.y = state.clock.elapsedTime * 0.3 * speed;
  });

  return (
    <Float speed={speed} rotationIntensity={0.5} floatIntensity={1.2}>
      <Sphere ref={ref} args={[1, 64, 64]} position={position}>
        <MeshDistortMaterial
          color={color}
          attach="material"
          distort={distort}
          speed={2}
          roughness={0.2}
          metalness={0.8}
        />
      </Sphere>
    </Float>
  );
}

function Scene({ tier }: { tier: 'high' | 'mid' }) {
  const isHigh = tier === 'high';
  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 0, 8]} fov={45} />
      <ambientLight intensity={0.4} />
      <pointLight position={[10, 10, 10]} intensity={2} color="#00D9FF" />
      <pointLight position={[-10, -10, -5]} intensity={1.5} color="#0066FF" />
      <directionalLight position={[5, 5, 5]} intensity={1} color="#ffffff" />

      <FloatingShape position={[-3, 1, -2]} color="#0066FF" speed={0.6} distort={0.5} />
      <FloatingShape position={[3.5, -0.5, -1]} color="#00D9FF" speed={0.8} distort={0.4} />
      <FloatingShape position={[0, 2, -4]} color="#0066FF" speed={0.5} distort={0.6} />

      <Particles count={isHigh ? 2000 : 800} />
    </>
  );
}

export function HeroScene() {
  const { tier, ready, hasWebGL } = useDeviceTier();

  if (!ready || tier === 'low' || !hasWebGL) {
    // CSS fallback for low-tier / no-WebGL
    return (
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-radial from-electric-cyan/15 via-transparent to-transparent" />
        <div className="absolute top-1/2 left-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-plasma-blue/20 blur-[120px] animate-glow-pulse" />
        <div className="absolute top-1/4 right-1/4 h-[400px] w-[400px] rounded-full bg-electric-cyan/15 blur-[100px] animate-float" />
      </div>
    );
  }

  return (
    <div className="absolute inset-0 -z-10">
      <Canvas
        dpr={tier === 'high' ? [1, 2] : [1, 1.5]}
        gl={{ antialias: tier === 'high', alpha: true, powerPreference: 'high-performance' }}
        performance={{ min: 0.5 }}
      >
        <Scene tier={tier} />
      </Canvas>
    </div>
  );
}
