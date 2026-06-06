import React, { useRef, useEffect, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { MeshDistortMaterial, Float, Trail, Sparkles } from '@react-three/drei';
import * as THREE from 'three';

/**
 * Scene.jsx
 * Standalone export for the IAS 3D hero element.
 * Uses @react-three/fiber + drei.
 *
 * Usage:
 *   import IASScene from './components/Scene';
 *   <IASScene className="w-full h-64" />
 */

/* ── IAS Coin + orbiting rings ────────────────────────────────────────────── */
const IASCoin = ({ mouse }) => {
  const coinRef  = useRef();
  const ring1Ref = useRef();
  const ring2Ref = useRef();
  const outerRef = useRef();

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();

    if (coinRef.current) {
      coinRef.current.rotation.y = t * 0.5;
      // Smooth parallax tilt from mouse
      coinRef.current.rotation.x = THREE.MathUtils.lerp(
        coinRef.current.rotation.x,
        mouse.current.y * 0.45,
        0.06
      );
      coinRef.current.rotation.z = THREE.MathUtils.lerp(
        coinRef.current.rotation.z,
        -mouse.current.x * 0.18,
        0.06
      );
    }
    if (ring1Ref.current) {
      ring1Ref.current.rotation.z = t * 0.9;
      ring1Ref.current.rotation.x = Math.sin(t * 0.4) * 0.25;
    }
    if (ring2Ref.current) {
      ring2Ref.current.rotation.z = -t * 0.55;
      ring2Ref.current.rotation.y = Math.cos(t * 0.3) * 0.2;
    }
    if (outerRef.current) {
      outerRef.current.rotation.z = -t * 0.22;
    }
  });

  return (
    <Float speed={1.6} rotationIntensity={0.08} floatIntensity={0.35}>
      <group>
        {/* Main coin cylinder */}
        <mesh ref={coinRef} castShadow receiveShadow>
          <cylinderGeometry args={[1.6, 1.6, 0.25, 80]} />
          <MeshDistortMaterial
            color="#00D26A"
            emissive="#00D26A"
            emissiveIntensity={0.18}
            metalness={0.95}
            roughness={0.08}
            distort={0.04}
            speed={1.8}
          />
        </mesh>

        {/* Front face (dark inlay) */}
        <mesh position={[0, 0.13, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[1.54, 80]} />
          <meshStandardMaterial color="#041209" metalness={0.5} roughness={0.4} />
        </mesh>

        {/* Back face */}
        <mesh position={[0, -0.13, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <circleGeometry args={[1.54, 80]} />
          <meshStandardMaterial color="#041209" metalness={0.5} roughness={0.4} />
        </mesh>

        {/* 
          TO ADD REAL LOGO TO COIN FACE:
          1. Import 'useTexture' and 'Decal' from '@react-three/drei':
             import { useTexture, Decal } from '@react-three/drei';
          2. Inside IASCoin component, load the texture:
             const logoTex = useTexture('/assets/logos/ias-logo.png');
          3. Uncomment the Decal logic below on the front face mesh:
             <mesh position={[0, 0.131, 0]} rotation={[-Math.PI / 2, 0, 0]}>
               <circleGeometry args={[1.54, 80]} />
               <meshStandardMaterial color="#041209" metalness={0.5} roughness={0.4} />
               <Decal position={[0, 0, 0]} rotation={[0, 0, 0]} scale={2.5} map={logoTex} />
             </mesh>
          4. Delete the "IAS" embossed geometry below.
        */}

        {/* "IAS" text represented as embossed geometry (3 raised bars) */}
        {[-0.45, 0, 0.45].map((x, i) => (
          <mesh key={i} position={[x, 0.14, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[0.1, 0.55]} />
            <meshStandardMaterial color="#00D26A" emissive="#00D26A" emissiveIntensity={0.6} metalness={1} roughness={0} />
          </mesh>
        ))}

        {/* Outer decorative ring */}
        <mesh ref={outerRef}>
          <torusGeometry args={[2.05, 0.035, 16, 120]} />
          <meshStandardMaterial color="#00D26A" emissive="#00D26A" emissiveIntensity={0.5} metalness={1} roughness={0} />
        </mesh>

        {/* Inner spinning ring 1 */}
        <mesh ref={ring1Ref}>
          <torusGeometry args={[1.75, 0.022, 16, 100]} />
          <meshStandardMaterial color="#00FF87" emissive="#00FF87" emissiveIntensity={0.35} metalness={1} roughness={0} />
        </mesh>

        {/* Inner ring 2 — tilted plane */}
        <mesh ref={ring2Ref} rotation={[Math.PI / 6, 0, 0]}>
          <torusGeometry args={[1.85, 0.015, 16, 100]} />
          <meshStandardMaterial color="#00D26A" emissive="#00D26A" emissiveIntensity={0.2} metalness={1} roughness={0} transparent opacity={0.5} />
        </mesh>

        {/* Orbiting glow dots */}
        {Array.from({ length: 8 }, (_, i) => {
          const angle = (i / 8) * Math.PI * 2;
          return (
            <mesh key={i} position={[Math.cos(angle) * 1.88, 0, Math.sin(angle) * 1.88]}>
              <sphereGeometry args={[0.04, 8, 8]} />
              <meshStandardMaterial color="#00FF87" emissive="#00FF87" emissiveIntensity={1.5} />
            </mesh>
          );
        })}

        {/* Sparkle particles */}
        <Sparkles
          count={40}
          scale={5}
          size={1.2}
          speed={0.3}
          color="#00D26A"
          opacity={0.6}
        />
      </group>
    </Float>
  );
};

/* ── Scene wrapper with lights ─────────────────────────────────────────────── */
const SceneInner = ({ mouse }) => (
  <>
    <ambientLight intensity={0.25} />
    <pointLight position={[5, 5, 5]}   intensity={1.8} color="#00D26A" />
    <pointLight position={[-5, -3, 3]} intensity={0.9} color="#00B050" />
    <pointLight position={[0, 2, 6]}   intensity={0.6} color="#ffffff" />
    <IASCoin mouse={mouse} />
  </>
);

/* ── Exported component ────────────────────────────────────────────────────── */
const IASScene = ({ className = '' }) => {
  const [webGLOk, setWebGLOk] = useState(true);
  const containerRef = useRef(null);
  const mouse = useRef({ x: 0, y: 0 });

  useEffect(() => {
    try {
      const c = document.createElement('canvas');
      if (!c.getContext('webgl') && !c.getContext('experimental-webgl')) setWebGLOk(false);
    } catch { setWebGLOk(false); }
  }, []);

  const handleMouseMove = (e) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    mouse.current = {
      x:  ((e.clientX - rect.left) / rect.width  - 0.5) * 2,
      y: -((e.clientY - rect.top)  / rect.height - 0.5) * 2,
    };
  };

  if (!webGLOk) {
    return (
      <div className={`flex items-center justify-center ${className}`}>
        <div className="w-32 h-32 rounded-full bg-linear-to-br from-ias-green/30 to-ias-green/5 border-2 border-ias-green/40 flex items-center justify-center">
          <span className="font-display text-4xl text-ias-green">IAS</span>
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
        camera={{ position: [0, 0, 5.5], fov: 42 }}
        gl={{ antialias: true, alpha: true }}
        style={{ background: 'transparent' }}
      >
        <SceneInner mouse={mouse} />
      </Canvas>
    </div>
  );
};

export default IASScene;
