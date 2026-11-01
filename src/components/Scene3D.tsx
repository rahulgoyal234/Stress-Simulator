import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { ROLE_CONFIG, RoleName, StressTestResult } from '../types/stress';

interface Scene3DProps {
  status: 'idle' | 'running' | 'result';
  result: StressTestResult | null;
}

const ROLES: RoleName[] = ['Judge', 'Advocate', 'Businessperson', 'Journalist', 'Police'];

// Pre-allocated math objects to avoid garbage collection inside animation loop
const _tempPos = new THREE.Vector3();
const _coreCenter = new THREE.Vector3();
const _targetScenePos = new THREE.Vector3();
const _targetCamPos = new THREE.Vector3();

export const Scene3D: React.FC<Scene3DProps> = ({ status, result }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const stateRef = useRef<{
    status: 'idle' | 'running' | 'result';
    result: StressTestResult | null;
    reducedMotion: boolean;
    mouse: { x: number; y: number; targetX: number; targetY: number };
    scroll: { current: number; target: number };
  }>({
    status,
    result,
    reducedMotion: false,
    mouse: { x: 0, y: 0, targetX: 0, targetY: 0 },
    scroll: { current: 0, target: 0 }
  });

  // Keep stateRef in sync with props without re-initializing WebGL
  useEffect(() => {
    stateRef.current.status = status;
    stateRef.current.result = result;
  }, [status, result]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // Check prefers-reduced-motion
    const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    stateRef.current.reducedMotion = reducedMotionQuery.matches;
    const handleMotionChange = (e: MediaQueryListEvent) => {
      stateRef.current.reducedMotion = e.matches;
    };
    reducedMotionQuery.addEventListener('change', handleMotionChange);

    // Probe WebGL availability
    let gl: WebGL2RenderingContext | null = null;
    try {
      const probeCanvas = document.createElement('canvas');
      gl = probeCanvas.getContext('webgl2') || (probeCanvas.getContext('webgl') as any);
    } catch {
      // Fallback cleanly
    }

    if (!gl) {
      console.warn('WebGL not available in browser. Running with 3D canvas disabled.');
      return;
    }

    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(
      45,
      window.innerWidth / window.innerHeight,
      0.1,
      100
    );
    camera.position.set(0, 0, 7.5);

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance'
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    container.appendChild(renderer.domElement);

    // Root group for the entire stress apparatus
    const worldGroup = new THREE.Group();
    scene.add(worldGroup);

    // 1. Core Apparatus Group
    const coreGroup = new THREE.Group();
    worldGroup.add(coreGroup);

    // Outer wireframe icosahedron (radius 1.25, detail 1, opacity 0.5)
    const outerGeom = new THREE.IcosahedronGeometry(1.25, 1);
    const outerMat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      wireframe: true,
      transparent: true,
      opacity: 0.45
    });
    const outerMesh = new THREE.Mesh(outerGeom, outerMat);
    coreGroup.add(outerMesh);

    // Inner translucent icosahedron (radius 0.95, detail 2, opacity 0.4)
    const innerGeom = new THREE.IcosahedronGeometry(0.95, 2);
    const innerMat = new THREE.MeshStandardMaterial({
      color: 0x818cf8,
      roughness: 0.3,
      metalness: 0.1,
      transparent: true,
      opacity: 0.4,
      depthWrite: false
    });
    const innerMesh = new THREE.Mesh(innerGeom, innerMat);
    coreGroup.add(innerMesh);

    // Faint violet torus ring
    const torusGeom = new THREE.TorusGeometry(3.6, 0.02, 16, 120);
    const torusMat = new THREE.MeshBasicMaterial({
      color: 0x8b5cf6,
      transparent: true,
      opacity: 0.22
    });
    const torusMesh = new THREE.Mesh(torusGeom, torusMat);
    torusMesh.rotation.x = Math.PI / 3.2;
    torusMesh.rotation.y = Math.PI / 8;
    worldGroup.add(torusMesh);

    // Starfield of ~600 points
    const starCount = 600;
    const starPositions = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount; i++) {
      const radius = 12 + Math.random() * 24;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);
      starPositions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      starPositions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      starPositions[i * 3 + 2] = radius * Math.cos(phi);
    }
    const starGeom = new THREE.BufferGeometry();
    starGeom.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    const starMat = new THREE.PointsMaterial({
      size: 1.4,
      color: 0xa5b4fc,
      transparent: true,
      opacity: 0.55,
      blending: THREE.AdditiveBlending
    });
    const starField = new THREE.Points(starGeom, starMat);
    scene.add(starField);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0xffffff, 1.2);
    dirLight1.position.set(5, 8, 6);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0xa78bfa, 0.9);
    dirLight2.position.set(-6, -4, -4);
    scene.add(dirLight2);

    // 2. Five glowing orbs with additive halos and tether lines
    interface OrbData {
      role: RoleName;
      group: THREE.Group;
      coreSphere: THREE.Mesh;
      haloSphere: THREE.Mesh;
      line: THREE.Line;
      lineGeom: THREE.BufferGeometry;
      linePosAttr: THREE.BufferAttribute;
      tiltAngle: number;
      phaseOffset: number;
      baseRadius: number;
    }

    const orbs: OrbData[] = [];
    const tiltAngles = [-0.35, -0.15, 0.05, 0.25, 0.42];

    ROLES.forEach((role, idx) => {
      const cfg = ROLE_CONFIG[role];
      const orbGroup = new THREE.Group();
      worldGroup.add(orbGroup);

      // Core sphere (radius 0.2)
      const coreSphereGeom = new THREE.SphereGeometry(0.2, 20, 20);
      const coreSphereMat = new THREE.MeshStandardMaterial({
        color: cfg.hexColor,
        emissive: cfg.hexColor,
        emissiveIntensity: 0.6,
        roughness: 0.2
      });
      const coreSphere = new THREE.Mesh(coreSphereGeom, coreSphereMat);
      orbGroup.add(coreSphere);

      // Additive halo sphere (radius 0.4)
      const haloGeom = new THREE.SphereGeometry(0.4, 18, 18);
      const haloMat = new THREE.MeshBasicMaterial({
        color: cfg.hexColor,
        transparent: true,
        opacity: 0.35,
        blending: THREE.AdditiveBlending,
        depthWrite: false
      });
      const haloSphere = new THREE.Mesh(haloGeom, haloMat);
      orbGroup.add(haloSphere);

      // Line connecting orb to core
      const linePositions = new Float32Array([0, 0, 0, 0, 0, 0]);
      const lineGeom = new THREE.BufferGeometry();
      const linePosAttr = new THREE.BufferAttribute(linePositions, 3);
      lineGeom.setAttribute('position', linePosAttr);

      const lineMat = new THREE.LineBasicMaterial({
        color: cfg.hexColor,
        transparent: true,
        opacity: 0.35
      });
      const line = new THREE.Line(lineGeom, lineMat);
      worldGroup.add(line);

      orbs.push({
        role,
        group: orbGroup,
        coreSphere,
        haloSphere,
        line,
        lineGeom,
        linePosAttr,
        tiltAngle: tiltAngles[idx],
        phaseOffset: (idx * (Math.PI * 2)) / 5,
        baseRadius: 3.3
      });
    });

    // Event listeners
    const handlePointerMove = (e: MouseEvent) => {
      // Normalized between -1 and 1
      stateRef.current.mouse.targetX = (e.clientX / window.innerWidth) * 2 - 1;
      stateRef.current.mouse.targetY = -(e.clientY / window.innerHeight) * 2 + 1;
    };

    const handleScroll = () => {
      const maxScroll = Math.max(
        document.documentElement.scrollHeight - window.innerHeight,
        1
      );
      stateRef.current.scroll.target = Math.min(
        Math.max(window.scrollY / maxScroll, 0),
        1
      );
    };

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleResize);

    // Initial trigger
    handleScroll();

    let animationFrameId = 0;
    let clock = new THREE.Clock();
    let currentOrbitAngle = 0;
    const baseCoreColor = new THREE.Color(0x818cf8);
    const stressColor = new THREE.Color(0xff2222);
    const targetCoreColor = new THREE.Color();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      const delta = Math.min(clock.getDelta(), 0.1);
      const elapsedTime = clock.getElapsedTime();
      const { status: currentStatus, result: currentResult, reducedMotion, mouse, scroll } =
        stateRef.current;

      // Mouse smoothing
      mouse.x += (mouse.targetX - mouse.x) * (reducedMotion ? 0.05 : 0.08);
      mouse.y += (mouse.targetY - mouse.y) * (reducedMotion ? 0.05 : 0.08);

      // Scroll smoothing
      scroll.current += (scroll.target - scroll.current) * 0.1;

      // Parallax & camera scroll transitions:
      // On screens wider than 800px, whole scene slides from right (offset x ~ +2.0) to center (0)
      const isWide = window.innerWidth > 800;
      const initialOffsetX = isWide ? 2.1 : 0;
      const targetSceneX = THREE.MathUtils.lerp(initialOffsetX, 0, Math.min(scroll.current * 2.2, 1));
      worldGroup.position.x += (targetSceneX - worldGroup.position.x) * 0.08;

      // Camera dips down and moves closer as page scrolls
      const targetCamY = THREE.MathUtils.lerp(0, -0.9, scroll.current) + (reducedMotion ? 0 : mouse.y * 0.25);
      const targetCamZ = THREE.MathUtils.lerp(7.5, 6.2, scroll.current);
      const targetCamX = reducedMotion ? 0 : mouse.x * 0.35;

      camera.position.x += (targetCamX - camera.position.x) * 0.08;
      camera.position.y += (targetCamY - camera.position.y) * 0.08;
      camera.position.z += (targetCamZ - camera.position.z) * 0.08;
      camera.lookAt(worldGroup.position.x * 0.4, -0.2, 0);

      // Determine stress state parameters
      let orbitSpeed = 0.45;
      let tumbleSpeed = 0.35 + scroll.current * 0.8;
      let jitterMagnitude = 0;

      if (currentStatus === 'running') {
        targetCoreColor.copy(stressColor);
        orbitSpeed = reducedMotion ? 0.8 : 1.6;
        tumbleSpeed = reducedMotion ? 0.8 : 2.2;
        jitterMagnitude = reducedMotion ? 0 : 0.06;
      } else if (currentStatus === 'result' && currentResult) {
        // HSL hue from red (score 0, hue 0) to green (score 100, hue 120/360 ≈ 0.33)
        const score = Math.max(0, Math.min(currentResult.score, 100));
        const hue = (score * 1.2) / 360; // 0 to 0.33
        targetCoreColor.setHSL(hue, 0.88, 0.52);

        // Jitter and spin proportional to (100 - score)
        const strainFactor = (100 - score) / 100;
        orbitSpeed = 0.4 + strainFactor * (reducedMotion ? 0.3 : 1.0);
        tumbleSpeed = 0.35 + strainFactor * (reducedMotion ? 0.3 : 1.2) + scroll.current * 0.6;
        jitterMagnitude = reducedMotion ? 0 : strainFactor * 0.045;
      } else {
        // Idle
        targetCoreColor.copy(baseCoreColor);
        orbitSpeed = reducedMotion ? 0.25 : 0.45;
        tumbleSpeed = (reducedMotion ? 0.2 : 0.35) + scroll.current * 0.5;
        jitterMagnitude = 0;
      }

      // Smooth color transition for inner core
      (innerMesh.material as THREE.MeshStandardMaterial).color.lerp(targetCoreColor, 0.06);

      // Core rotation & tumbling
      coreGroup.rotation.y += tumbleSpeed * delta;
      coreGroup.rotation.x += tumbleSpeed * 0.65 * delta;
      coreGroup.rotation.z += tumbleSpeed * 0.3 * delta;

      // Jitter application
      if (jitterMagnitude > 0) {
        coreGroup.position.set(
          (Math.random() - 0.5) * jitterMagnitude,
          (Math.random() - 0.5) * jitterMagnitude,
          (Math.random() - 0.5) * jitterMagnitude
        );
      } else {
        coreGroup.position.set(0, 0, 0);
      }

      // Subtle pulse on wireframe outer mesh
      const outerPulse = 1.25 + (reducedMotion ? 0 : Math.sin(elapsedTime * 2) * 0.03);
      outerMesh.scale.set(outerPulse, outerPulse, outerPulse);

      // Torus gentle spin
      torusMesh.rotation.z += delta * 0.15;

      // Advance orbital angle
      currentOrbitAngle += orbitSpeed * delta;

      // Update the 5 role orbs
      orbs.forEach((orb) => {
        let orbRadius = orb.baseRadius;
        let orbScale = 1.0;

        if (currentStatus === 'running') {
          // Orbs pull inward when running
          orbRadius = 2.2 + (reducedMotion ? 0 : Math.sin(elapsedTime * 5 + orb.phaseOffset) * 0.15);
          orbScale = 0.9;
        } else if (currentStatus === 'result' && currentResult) {
          // Look up holds score for this role
          const roleResult = currentResult.roles.find((r) => r.role === orb.role);
          const holds = roleResult ? Math.max(0, Math.min(roleResult.holds, 100)) : 50;

          // Strong holds = larger and closer; Weak holds = smaller and farther
          // Radius: 90 holds -> ~2.4, 10 holds -> ~4.0
          orbRadius = 3.9 - (holds / 100) * 1.5;
          // Scale: 90 holds -> 1.35x, 10 holds -> 0.7x
          orbScale = 0.65 + (holds / 100) * 0.7;
        }

        const angle = currentOrbitAngle + orb.phaseOffset;
        const cosTilt = Math.cos(orb.tiltAngle);
        const sinTilt = Math.sin(orb.tiltAngle);

        const x = orbRadius * Math.cos(angle);
        const z = orbRadius * Math.sin(angle) * cosTilt;
        const y = orbRadius * Math.sin(angle) * sinTilt + (reducedMotion ? 0 : Math.sin(elapsedTime * 1.5 + orb.phaseOffset) * 0.08);

        orb.group.position.set(x, y, z);
        orb.group.scale.set(orbScale, orbScale, orbScale);

        // Update connection line coordinates from core (0,0,0) to orb position
        const positions = orb.linePosAttr.array as Float32Array;
        positions[0] = 0;
        positions[1] = 0;
        positions[2] = 0;
        positions[3] = x;
        positions[4] = y;
        positions[5] = z;
        orb.linePosAttr.needsUpdate = true;
      });

      // Subtle starfield drift
      starField.rotation.y = elapsedTime * 0.02;

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
      reducedMotionQuery.removeEventListener('change', handleMotionChange);

      // Clean up geometries and materials
      outerGeom.dispose();
      outerMat.dispose();
      innerGeom.dispose();
      innerMat.dispose();
      torusGeom.dispose();
      torusMat.dispose();
      starGeom.dispose();
      starMat.dispose();

      orbs.forEach((orb) => {
        orb.coreSphere.geometry.dispose();
        (orb.coreSphere.material as THREE.Material).dispose();
        orb.haloSphere.geometry.dispose();
        (orb.haloSphere.material as THREE.Material).dispose();
        orb.lineGeom.dispose();
        (orb.line.material as THREE.Material).dispose();
      });

      renderer.dispose();
      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div
      ref={mountRef}
      className="fixed inset-0 pointer-events-none -z-10 overflow-hidden"
      aria-hidden="true"
    />
  );
};
