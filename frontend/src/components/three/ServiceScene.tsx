'use client';

import { Float, MeshDistortMaterial, PerspectiveCamera, Torus, Sphere, Box, TorusKnot, Cylinder } from '@react-three/drei';
import { Canvas, useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import * as THREE from 'three';

import { useDeviceTier } from '@/hooks/useDeviceTier';

/**
 * Per-service hero scene. Geometry chosen from slug.
 * High = full mesh; mid = simpler; low = CSS fallback.
 */

function SceneGeometry({ slug, tier }: { slug: string; tier: 'high' | 'mid' }) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    if (!ref.current) return;
    ref.current.rotation.x = state.clock.elapsedTime * 0.2;
    ref.current.rotation.y = state.clock.elapsedTime * 0.3;
  });

  const detail = tier === 'high' ? 1 : 0;
  const segments = tier === 'high' ? 128 : 48;

  // Map slug to mesh
  const lower = slug.toLowerCase();
  if (lower.includes('cybersecurity')) {
    return (
      <Float floatIntensity={1.2} rotationIntensity={0.5}>
        <mesh ref={ref}>
          <icosahedronGeometry args={[1.6, detail]} />
          <MeshDistortMaterial color="#FF3366" distort={0.5} speed={2} roughness={0.2} metalness={0.8} />
        </mesh>
      </Float>
    );
  }
  if (lower.includes('cloud')) {
    return (
      <Float floatIntensity={1.5} rotationIntensity={0.4}>
        <Sphere ref={ref} args={[1.6, segments, segments]}>
          <MeshDistortMaterial color="#0066FF" distort={0.4} speed={1.5} roughness={0.1} metalness={0.9} />
        </Sphere>
      </Float>
    );
  }
  if (lower.includes('mobile')) {
    return (
      <Float floatIntensity={1.0} rotationIntensity={0.4}>
        <Box ref={ref} args={[1.2, 2.2, 0.3]}>
          <MeshDistortMaterial color="#00D9FF" distort={0.2} speed={1} roughness={0.3} metalness={0.7} />
        </Box>
      </Float>
    );
  }
  if (lower.includes('ecommerce') || lower.includes('e-commerce')) {
    return (
      <Float floatIntensity={1.2} rotationIntensity={0.5}>
        <TorusKnot ref={ref} args={[1.0, 0.3, segments, 16]}>
          <MeshDistortMaterial color="#00FF88" distort={0.3} speed={2} roughness={0.2} metalness={0.8} />
        </TorusKnot>
      </Float>
    );
  }
  if (lower.includes('seo') || lower.includes('marketing')) {
    return (
      <Float floatIntensity={1.5} rotationIntensity={0.6}>
        <Torus ref={ref} args={[1.4, 0.4, 32, segments]}>
          <MeshDistortMaterial color="#FFA500" distort={0.3} speed={2} roughness={0.2} metalness={0.8} />
        </Torus>
      </Float>
    );
  }
  if (lower.includes('design')) {
    return (
      <Float floatIntensity={1.2} rotationIntensity={0.7}>
        <mesh ref={ref}>
          <octahedronGeometry args={[1.8, detail]} />
          <MeshDistortMaterial color="#FF6B35" distort={0.4} speed={2.5} roughness={0.1} metalness={0.9} />
        </mesh>
      </Float>
    );
  }
  if (lower.includes('hardware') || lower.includes('pos')) {
    return (
      <Float floatIntensity={0.8} rotationIntensity={0.3}>
        <Cylinder ref={ref} args={[1.0, 1.0, 1.8, segments]}>
          <MeshDistortMaterial color="#94A3B8" distort={0.1} speed={1} roughness={0.4} metalness={0.7} />
        </Cylinder>
      </Float>
    );
  }
  // Default: software / website / saas / maintenance
  return (
    <Float floatIntensity={1.3} rotationIntensity={0.5}>
      <Sphere ref={ref} args={[1.6, segments, segments]}>
        <MeshDistortMaterial color="#00D9FF" distort={0.4} speed={2} roughness={0.2} metalness={0.85} />
      </Sphere>
    </Float>
  );
}

export function ServiceScene({ slug }: { slug: string }) {
  const { tier, ready, hasWebGL } = useDeviceTier();

  if (!ready || tier === 'low' || !hasWebGL) {
    return (
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/2 right-1/4 -translate-y-1/2 h-80 w-80 rounded-full blur-[100px] animate-glow-pulse" style={{ background: 'rgba(0, 217, 255, 0.2)' }} />
      </div>
    );
  }

  return (
    <div className="absolute inset-0 -z-10">
      <Canvas
        dpr={tier === 'high' ? [1, 2] : [1, 1.5]}
        gl={{ antialias: tier === 'high', alpha: true, powerPreference: 'high-performance' }}
      >
        <PerspectiveCamera makeDefault position={[0, 0, 5]} fov={45} />
        <ambientLight intensity={0.5} />
        <pointLight position={[5, 5, 5]} intensity={2} color="#00D9FF" />
        <pointLight position={[-5, -5, -3]} intensity={1.5} color="#0066FF" />
        <SceneGeometry slug={slug} tier={tier} />
      </Canvas>
    </div>
  );
}
