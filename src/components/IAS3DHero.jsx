import React, { useRef, useEffect, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { MeshDistortMaterial, Float, Text3D, Center } from '@react-three/drei';
import * as THREE from 'three';

/**
 * IASCoin - A spinning 3D coin/badge with IAS branding
 * Uses cursor-based parallax for an interactive feel.
 * Falls back gracefully if WebGL is not available.
 */

const IASBadge3D = ({ mouse }) => {
  const meshRef = useRef();
  const ringRef = useRef();
  const outerRef = useRef();

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();

    if (meshRef.current) {
      // Base auto-rotation
      meshRef.current.rotation.y = t * 0.4;
      // Cursor parallax tilt
      meshRef.current.rotation.x = THREE.MathUtils.lerp(
        meshRef.current.rotation.x,
        mouse.y * 0.4,
        0.05
      );
      meshRef.current.rotation.z = THREE.MathUtils.lerp(
        meshRef.current.rotation.z,
        -mouse.x * 0.15,
        0.05
      );
    }

    if (ringRef.current) {
      ringRef.current.rotation.z = t * 0.8;
      ringRef.current.rotation.x = Math.sin(t * 0.3) * 0.2;
    }

    if (outerRef.current) {
      outerRef.current.rotation.z = -t * 0.3;
    }
  });

  return (
    <Float speed={1.5} rotationIntensity={0.1} floatIntensity={0.3}>
      <group>
        {/* Main coin body */}
        <mesh ref={meshRef} castShadow>
          <cylinderGeometry args={[1.6, 1.6, 0.22, 64]} />
          <MeshDistortMaterial
            color="#00D26A"
            emissive="#00D26A"
            emissiveIntensity={0.15}
            metalness={0.9}
            roughness={0.1}
            distort={0.05}
            speed={2}
          />
        </mesh>

        {/* Coin face - front circle */}
        <mesh position={[0, 0.12, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[1.55, 64]} />
          <meshStandardMaterial color="#051a0f" metalness={0.6} roughness={0.3} />
        </mesh>

        {/* Coin face - back circle */}
        <mesh position={[0, -0.12, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <circleGeometry args={[1.55, 64]} />
          <meshStandardMaterial color="#051a0f" metalness={0.6} roughness={0.3} />
        </mesh>

        {/* Decorative outer ring */}
        <mesh ref={outerRef}>
          <torusGeometry args={[2.0, 0.04, 16, 100]} />
          <meshStandardMaterial color="#00D26A" emissive="#00D26A" emissiveIntensity={0.4} metalness={1} roughness={0} />
        </mesh>

        {/* Inner ring */}
        <mesh ref={ringRef}>
          <torusGeometry args={[1.7, 0.025, 16, 80]} />
          <meshStandardMaterial color="#00D26A" emissive="#00D26A" emissiveIntensity={0.2} metalness={1} roughness={0} />
        </mesh>

        {/* Particle dots orbiting */}
        {[0, 1, 2, 3, 4, 5].map((i) => {
          const angle = (i / 6) * Math.PI * 2;
          const x = Math.cos(angle) * 1.85;
          const z = Math.sin(angle) * 1.85;
          return (
            <mesh key={i} position={[x, 0, z]}>
              <sphereGeometry args={[0.045, 8, 8]} />
              <meshStandardMaterial color="#00FF87" emissive="#00FF87" emissiveIntensity={1} />
            </mesh>
          );
        })}
      </group>
    </Float>
  );
};

const Scene = ({ mouse }) => (
  <>
    <ambientLight intensity={0.3} />
    <pointLight position={[5, 5, 5]} intensity={1.5} color="#00D26A" />
    <pointLight position={[-5, -3, 2]} intensity={0.8} color="#00B050" />
    <pointLight position={[0, 0, 6]} intensity={0.5} color="#ffffff" />
    <IASBadge3D mouse={mouse} />
  </>
);

const IAS3DHero = ({ className = '' }) => {
  const [mouse, setMouse] = useState({ x: 0, y: 0 });
  const [webGLSupported, setWebGLSupported] = useState(true);
  const containerRef = useRef(null);

  useEffect(() => {
    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      if (!ctx) setWebGLSupported(false);
    } catch {
      setWebGLSupported(false);
    }
  }, []);

  const handleMouseMove = (e) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
    const y = -((e.clientY - rect.top) / rect.height - 0.5) * 2;
    setMouse({ x, y });
  };

  if (!webGLSupported) {
    // CSS fallback badge
    return (
      <div className={`flex items-center justify-center ${className}`}>
        <div className="relative w-32 h-32">
          <div className="w-full h-full rounded-full bg-linear-to-br from-ias-green/30 to-ias-green/5 border-2 border-ias-green/40 flex items-center justify-center animate-spin-slow">
            <span className="font-display text-4xl text-ias-green">IAS</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className={`cursor-none ${className}`}
      style={{ touchAction: 'none' }}
    >
      <Canvas
        camera={{ position: [0, 0, 5], fov: 45 }}
        gl={{ antialias: true, alpha: true }}
        style={{ background: 'transparent' }}
      >
        <Scene mouse={mouse} />
      </Canvas>
    </div>
  );
};

export default IAS3DHero;
