"use client";

import { useEffect, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Float, MeshDistortMaterial } from "@react-three/drei";
import type { Mesh } from "three";

function FloatingKnot({ segments, spin }: { segments: number; spin: boolean }) {
  const meshRef = useRef<Mesh>(null);

  useFrame((_, delta) => {
    if (!meshRef.current || !spin) return;
    meshRef.current.rotation.x += delta * 0.15;
    meshRef.current.rotation.y += delta * 0.2;
  });

  return (
    <Float speed={spin ? 2 : 0} rotationIntensity={0.6} floatIntensity={1.2}>
      <mesh ref={meshRef} scale={1.6}>
        <torusKnotGeometry args={[1, 0.32, segments, Math.max(12, Math.round(segments / 7.5))]} />
        <MeshDistortMaterial
          color="#d1000c"
          distort={0.25}
          speed={1.5}
          roughness={0.2}
          metalness={0.4}
        />
      </mesh>
    </Float>
  );
}

// R3F depende de un ResizeObserver sobre el contenedor para dimensionar el canvas;
// en algunos navegadores/entornos no llega a dispararse a tiempo, así que forzamos
// el tamaño manualmente a partir del contenedor real (además del respaldo por CSS
// en globals.css que garantiza que el canvas nunca se vea diminuto).
function ForceCanvasSize() {
  const { gl, camera, size } = useThree();

  useEffect(() => {
    const container = gl.domElement.parentElement;
    if (!container) return;

    const apply = () => {
      const { width, height } = container.getBoundingClientRect();
      if (width === 0 || height === 0) return;
      gl.setSize(width, height);
      // Mutar `camera.aspect` es el patrón estándar de three.js/R3F para reajustar
      // la cámara en un resize; no hay una API inmutable equivalente.
      // eslint-disable-next-line react-hooks/immutability
      const cam = camera as unknown as { aspect?: number; updateProjectionMatrix: () => void };
      if (typeof cam.aspect === "number") {
        cam.aspect = width / height;
        cam.updateProjectionMatrix();
      }
    };

    apply();
    const observer = new ResizeObserver(apply);
    observer.observe(container);
    return () => observer.disconnect();
  }, [gl, camera, size]);

  return null;
}

export function HeroScene({
  lowFidelity = false,
  paused = false,
}: {
  lowFidelity?: boolean;
  paused?: boolean;
}) {
  return (
    <Canvas
      camera={{ position: [0, 0, 5.5], fov: 42 }}
      dpr={lowFidelity ? 1 : [1, 1.5]}
      gl={{ antialias: !lowFidelity, alpha: true, powerPreference: "high-performance" }}
      style={{ width: "100%", height: "100%" }}
      frameloop={paused ? "never" : "always"}
    >
      <ForceCanvasSize />
      <ambientLight intensity={0.7} />
      <directionalLight position={[3, 3, 3]} intensity={1.4} />
      <directionalLight position={[-3, -2, 2]} intensity={0.5} color="#ffffff" />
      <FloatingKnot segments={lowFidelity ? 80 : 180} spin={!paused} />
    </Canvas>
  );
}
