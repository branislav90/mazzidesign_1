"use client";

/* eslint-disable react/no-unknown-property */
// Live parametric 3D viewport. No network assets: manual lighting only
// (ambient + key directional with soft shadows + fill), warm-white backdrop,
// OrbitControls with limits + damping, slow auto-rotate when idle (>3 s),
// disabled on prefers-reduced-motion. dpr capped at 1.5, frameloop on demand.

import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { ContactShadows, OrbitControls } from "@react-three/drei";
import { getItem } from "@/lib/catalog";
import { useConfigurator } from "@/lib/configurator/store";
import { CONFIGURATOR_DICT } from "@/lib/configurator/i18n";
import { ConfigModel, useModelDims } from "./ConfigModel";
import { snapshotBridge } from "./snapshot";

interface ControlsLike {
  target: THREE.Vector3;
  getAzimuthalAngle(): number;
  setAzimuthalAngle(angle: number): void;
  update(): void;
  addEventListener(type: string, listener: () => void): void;
  removeEventListener(type: string, listener: () => void): void;
}

function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);
  return reduced;
}

/** Registers the snapshot capture function (downscaled PNG). */
function SnapshotBridge() {
  const gl = useThree((s) => s.gl);
  const scene = useThree((s) => s.scene);
  const camera = useThree((s) => s.camera);
  useEffect(() => {
    snapshotBridge.capture = () => {
      gl.render(scene, camera);
      const src = gl.domElement;
      const scale = Math.min(1, 900 / src.width);
      if (scale >= 1) return src.toDataURL("image/png");
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(src.width * scale);
      canvas.height = Math.round(src.height * scale);
      const ctx = canvas.getContext("2d");
      if (!ctx) return src.toDataURL("image/png");
      ctx.drawImage(src, 0, 0, canvas.width, canvas.height);
      return canvas.toDataURL("image/png");
    };
    return () => {
      snapshotBridge.capture = null;
    };
  }, [gl, scene, camera]);
  return null;
}

/** Re-frames the camera when the model footprint changes meaningfully. */
function CameraRig({ radius, targetY }: { radius: number; targetY: number }) {
  const camera = useThree((s) => s.camera);
  const controls = useThree((s) => s.controls) as unknown as ControlsLike | null;
  const invalidate = useThree((s) => s.invalidate);
  useEffect(() => {
    const dist = radius * 2.3 + 0.6;
    const dir = new THREE.Vector3(1, 0.62, 1.3).normalize().multiplyScalar(dist);
    camera.position.set(dir.x, dir.y + targetY, dir.z);
    if (controls) {
      controls.target.set(0, targetY, 0);
      controls.update();
    } else {
      camera.lookAt(0, targetY, 0);
    }
    invalidate();
  }, [radius, targetY, camera, controls, invalidate]);
  return null;
}

/** Slow auto-rotate after 3 s of inactivity; stops on interaction. */
function IdleAutoRotate({ enabled }: { enabled: boolean }) {
  const controls = useThree((s) => s.controls) as unknown as ControlsLike | null;
  const invalidate = useThree((s) => s.invalidate);
  const idleRef = useRef(false);

  useEffect(() => {
    if (!controls || !enabled) {
      idleRef.current = false;
      return;
    }
    let timer = window.setTimeout(() => {
      idleRef.current = true;
      invalidate();
    }, 3000);
    const onStart = () => {
      idleRef.current = false;
      window.clearTimeout(timer);
      timer = window.setTimeout(() => {
        idleRef.current = true;
        invalidate();
      }, 3000);
    };
    controls.addEventListener("start", onStart);
    return () => {
      window.clearTimeout(timer);
      controls.removeEventListener("start", onStart);
    };
  }, [controls, enabled, invalidate]);

  useFrame((_, delta) => {
    if (enabled && idleRef.current && controls) {
      controls.setAzimuthalAngle(controls.getAzimuthalAngle() + delta * 0.12);
      controls.update();
      invalidate();
    }
  });
  return null;
}

export default function ConfiguratorCanvas() {
  const category = useConfigurator((s) => s.category);
  const itemType = useConfigurator((s) => s.itemType);
  const showSilhouette = useConfigurator((s) => s.showSilhouette);
  const toggleSilhouette = useConfigurator((s) => s.toggleSilhouette);
  const locale = useConfigurator((s) => s.locale);
  const reducedMotion = usePrefersReducedMotion();
  const dict = CONFIGURATOR_DICT[locale];

  const item = getItem(category, itemType);
  const { extents } = useModelDims(item);

  // Quantize so the camera only re-frames on meaningful size changes.
  const radius = Math.round(extents.radius * 4) / 4;
  const targetY = Math.round((extents.y / 2) * 4) / 4;
  const shadowScale = useMemo(() => Math.max(3, radius * 3.4), [radius]);

  return (
    <div className="relative h-full w-full">
      <div className="absolute inset-0" aria-hidden="true">
      <Canvas
        shadows
        dpr={[1, 1.5]}
        frameloop="demand"
        gl={{ preserveDrawingBuffer: true, antialias: true }}
        camera={{ fov: 32, near: 0.05, far: 80, position: [3, 2.2, 4] }}
      >
        <color attach="background" args={["#F1ECE3"]} />
        <fog attach="fog" args={["#F1ECE3", radius * 8 + 8, radius * 22 + 30]} />

        {/* manual lighting — no environment presets, no network assets */}
        <ambientLight intensity={0.85} color="#FFF6E8" />
        <directionalLight
          castShadow
          position={[4, 7, 3]}
          intensity={2.1}
          color="#FFEEDA"
          shadow-mapSize={[2048, 2048]}
          shadow-bias={-0.0002}
          shadow-camera-left={-8}
          shadow-camera-right={8}
          shadow-camera-top={8}
          shadow-camera-bottom={-8}
          shadow-camera-far={30}
        />
        <directionalLight position={[-5, 3, -4]} intensity={0.6} color="#EDE5FF" />

        {/* warm-white ground */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.001, 0]} receiveShadow>
          <circleGeometry args={[Math.max(12, radius * 10), 48]} />
          <meshStandardMaterial color="#EFE9DE" roughness={1} metalness={0} />
        </mesh>
        <ContactShadows
          position={[0, 0.002, 0]}
          opacity={0.32}
          scale={shadowScale}
          blur={2.4}
          far={2.5}
          resolution={512}
        />

        <ConfigModel />

        <OrbitControls
          makeDefault
          enableDamping
          dampingFactor={0.08}
          enablePan={false}
          minPolarAngle={0.2}
          maxPolarAngle={Math.PI / 2 - 0.04}
          minDistance={Math.max(0.5, radius * 0.9)}
          maxDistance={radius * 6 + 4}
          target={[0, targetY, 0]}
        />
        <CameraRig radius={radius} targetY={targetY} />
        <IdleAutoRotate enabled={!reducedMotion} />
        <SnapshotBridge />
      </Canvas>
      </div>

      {/* viewport overlay: human-scale toggle */}
      <button
        type="button"
        onClick={toggleSilhouette}
        aria-pressed={showSilhouette}
        aria-label={dict.viewport.silhouetteAria}
        className={`absolute bottom-4 left-4 rounded-full border px-4 py-2 text-[10.5px] font-semibold uppercase tracking-caps transition-colors duration-300 ease-hrast ${
          showSilhouette
            ? "border-ink bg-ink text-white"
            : "border-line bg-white/85 text-soft hover:text-ink"
        }`}
      >
        {dict.viewport.silhouette}
      </button>
    </div>
  );
}
