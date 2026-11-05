import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

interface DandelionFieldProps {
  className?: string;
  seedCount?: number;
  dustCount?: number;
}

interface SeedPhysics {
  group: THREE.Group;
  velocity: THREE.Vector3;
  scatterVel: THREE.Vector3;
  rotSpeed: THREE.Vector3;
  wobbleSpeed: number;
  wobbleAmp: number;
  phase: number;
  mass: number;
}

/**
 * Creates a soft glowing radial particle texture for golden dream dust
 */
function createGlowTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext('2d')!;

  const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
  gradient.addColorStop(0, 'rgba(251, 191, 36, 1)');      // #FBBF24 golden glow center
  gradient.addColorStop(0.35, 'rgba(245, 158, 11, 0.85)'); // #F59E0B amber
  gradient.addColorStop(0.7, 'rgba(217, 119, 6, 0.3)');    // #D97706 deep edge
  gradient.addColorStop(1, 'rgba(255, 251, 240, 0)');      // transparent

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 64, 64);

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

/**
 * Builds a high-contrast, beautiful 3D dandelion seed with seed kernel,
 * slender amber stem, and radiating umbrella filaments (pappus).
 */
function createSeedGeometry(): THREE.Group {
  const group = new THREE.Group();

  // 1. Seed kernel (achene) at bottom - rich dark amber/brown
  const seedGeo = new THREE.ConeGeometry(0.12, 0.7, 8);
  seedGeo.rotateX(Math.PI); // Point downwards
  seedGeo.translate(0, -0.35, 0);

  const seedMat = new THREE.MeshStandardMaterial({
    color: 0x92400e, // Rich amber-brown for strong contrast on cream
    roughness: 0.5,
    metalness: 0.15,
  });
  const seedMesh = new THREE.Mesh(seedGeo, seedMat);
  group.add(seedMesh);

  // 2. Slender stem (rachis) - warm amber
  const stemHeight = 1.8;
  const stemGeo = new THREE.CylinderGeometry(0.02, 0.025, stemHeight, 6);
  stemGeo.translate(0, stemHeight / 2 - 0.35, 0);

  const stemMat = new THREE.MeshStandardMaterial({
    color: 0xd97706, // Golden amber stem
    roughness: 0.4,
  });
  const stemMesh = new THREE.Mesh(stemGeo, stemMat);
  group.add(stemMesh);

  // 3. Umbrella radiating filaments (pappus rays)
  const rayCount = 22;
  const positions: number[] = [];
  const colors: number[] = [];

  const crownY = stemHeight - 0.35;
  const raySpreadAngle = 0.65; // Wide umbrella spread
  const rayLength = 1.05;

  // Filaments have distinct amber/gold contrast so they are clearly visible on cream
  const baseColor = new THREE.Color(0xb45309); // dark amber base
  const tipColor = new THREE.Color(0xd97706);  // bright golden tip

  for (let i = 0; i < rayCount; i++) {
    const theta = (i / rayCount) * Math.PI * 2 + (Math.random() - 0.5) * 0.2;
    const phi = raySpreadAngle + (Math.random() - 0.5) * 0.25;

    // Ray origin at top of stem
    positions.push(0, crownY, 0);
    colors.push(baseColor.r, baseColor.g, baseColor.b);

    // Ray tip
    const tx = Math.sin(phi) * Math.cos(theta) * rayLength;
    const ty = crownY + Math.cos(phi) * rayLength;
    const tz = Math.sin(phi) * Math.sin(theta) * rayLength;

    positions.push(tx, ty, tz);
    colors.push(tipColor.r, tipColor.g, tipColor.b);
  }

  const rayGeo = new THREE.BufferGeometry();
  rayGeo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  rayGeo.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));

  const rayMat = new THREE.LineBasicMaterial({
    vertexColors: true,
    transparent: true,
    opacity: 0.95,
  });
  const rays = new THREE.LineSegments(rayGeo, rayMat);
  group.add(rays);

  // 4. Soft golden tuft center sphere
  const tuftGeo = new THREE.SphereGeometry(0.09, 8, 8);
  tuftGeo.translate(0, crownY, 0);
  const tuftMat = new THREE.MeshStandardMaterial({
    color: 0xf59e0b,
    roughness: 0.3,
  });
  const tuft = new THREE.Mesh(tuftGeo, tuftMat);
  group.add(tuft);

  return group;
}

export function DandelionField({
  className = '',
  seedCount = 55,
  dustCount = 140,
}: DandelionFieldProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let width = canvas.parentElement?.clientWidth || window.innerWidth;
    let height = canvas.parentElement?.clientHeight || window.innerHeight;

    // 1. Scene & Camera
    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 100);
    camera.position.set(0, 0, 15);

    // 2. WebGL Renderer directly attached to the canvas
    const renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // 3. Lighting setup
    const ambientLight = new THREE.AmbientLight(0xfff7ed, 1.8);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xfde68a, 2.5);
    sunLight.position.set(5, 12, 10);
    scene.add(sunLight);

    const fillLight = new THREE.DirectionalLight(0xf59e0b, 1.2);
    fillLight.position.set(-8, -4, -4);
    scene.add(fillLight);

    // 4. 3D Volume Bounds
    const xRange = 18;
    const yRange = 14;
    const zRange = 10;

    // 5. Build Dandelion Seeds
    const seeds: SeedPhysics[] = [];
    const seedGroup = new THREE.Group();
    scene.add(seedGroup);

    for (let i = 0; i < seedCount; i++) {
      const seedMesh = createSeedGeometry();

      const px = (Math.random() - 0.5) * xRange * 1.5;
      const py = (Math.random() - 0.5) * yRange * 1.5;
      const pz = (Math.random() - 0.5) * zRange;
      seedMesh.position.set(px, py, pz);

      const scale = 0.65 + Math.random() * 0.7; // Generous size so clearly visible
      seedMesh.scale.set(scale, scale, scale);

      seedMesh.rotation.x = (Math.random() - 0.5) * 0.6;
      seedMesh.rotation.y = Math.random() * Math.PI * 2;
      seedMesh.rotation.z = (Math.random() - 0.5) * 0.5;

      seedGroup.add(seedMesh);

      seeds.push({
        group: seedMesh,
        velocity: new THREE.Vector3(
          0.009 + Math.random() * 0.015,
          0.014 + Math.random() * 0.018,
          (Math.random() - 0.5) * 0.008
        ),
        scatterVel: new THREE.Vector3(0, 0, 0),
        rotSpeed: new THREE.Vector3(
          (Math.random() - 0.5) * 0.01,
          (Math.random() - 0.5) * 0.014,
          (Math.random() - 0.5) * 0.01
        ),
        wobbleSpeed: 0.8 + Math.random() * 1.4,
        wobbleAmp: 0.012 + Math.random() * 0.018,
        phase: Math.random() * Math.PI * 2,
        mass: 0.8 + Math.random() * 0.5,
      });
    }

    // 6. Golden Dream Dust Particles
    const dustGeo = new THREE.BufferGeometry();
    const dustPositions = new Float32Array(dustCount * 3);

    for (let i = 0; i < dustCount; i++) {
      dustPositions[i * 3] = (Math.random() - 0.5) * xRange * 1.6;
      dustPositions[i * 3 + 1] = (Math.random() - 0.5) * yRange * 1.6;
      dustPositions[i * 3 + 2] = (Math.random() - 0.5) * zRange * 1.2;
    }
    dustGeo.setAttribute('position', new THREE.BufferAttribute(dustPositions, 3));

    const glowTexture = createGlowTexture();
    const dustMat = new THREE.PointsMaterial({
      size: 0.55,
      map: glowTexture,
      transparent: true,
      opacity: 0.85,
      blending: THREE.NormalBlending,
      depthWrite: false,
    });
    const dustPoints = new THREE.Points(dustGeo, dustMat);
    scene.add(dustPoints);

    // 7. Mouse / Pointer Interaction
    const mouse = new THREE.Vector2(-9999, -9999);
    const mouseTarget = new THREE.Vector2(-9999, -9999);
    const mouse3D = new THREE.Vector3(0, 0, 0);
    const plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
    const raycaster = new THREE.Raycaster();

    const handlePointerMove = (e: MouseEvent) => {
      const parentRect = canvas.parentElement?.getBoundingClientRect() || {
        left: 0,
        top: 0,
        width: window.innerWidth,
        height: window.innerHeight,
      };

      const clientX = e.clientX - parentRect.left;
      const clientY = e.clientY - parentRect.top;

      mouseTarget.x = (clientX / width) * 2 - 1;
      mouseTarget.y = -(clientY / height) * 2 + 1;
    };

    const handlePointerLeave = () => {
      mouseTarget.set(-9999, -9999);
    };

    window.addEventListener('mousemove', handlePointerMove, { passive: true });
    window.addEventListener('mouseleave', handlePointerLeave);

    // 8. Responsive Resize
    const handleResize = () => {
      if (!canvas || !canvas.parentElement) return;
      width = canvas.parentElement.clientWidth || window.innerWidth;
      height = canvas.parentElement.clientHeight || window.innerHeight;

      camera.aspect = width / height;
      camera.updateProjectionMatrix();

      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    };
    window.addEventListener('resize', handleResize);

    // 9. Animation Loop
    let animationFrameId: number;
    const clock = new THREE.Clock();

    setIsLoaded(true);

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      const elapsed = clock.getElapsedTime();

      // Smooth mouse follow
      mouse.lerp(mouseTarget, 0.2);

      // Project mouse to 3D world space
      if (mouse.x > -100) {
        raycaster.setFromCamera(mouse, camera);
        raycaster.ray.intersectPlane(plane, mouse3D);
      } else {
        mouse3D.set(-9999, -9999, 0);
      }

      const halfX = (xRange * 1.5) / 2;
      const halfY = (yRange * 1.5) / 2;
      const scatterRadius = 3.8;
      const scatterStrength = 0.28;

      // Animate Seeds
      for (let i = 0; i < seeds.length; i++) {
        const seed = seeds[i];
        const g = seed.group;

        // Upward floating drift + sinusoidal wobble
        const wobble = Math.sin(elapsed * seed.wobbleSpeed + seed.phase) * seed.wobbleAmp;
        g.position.x += seed.velocity.x + wobble * 0.5;
        g.position.y += seed.velocity.y + wobble;
        g.position.z += seed.velocity.z;

        // Interactive mouse scattering
        if (mouse3D.x > -5000) {
          const dx = g.position.x - mouse3D.x;
          const dy = g.position.y - mouse3D.y;
          const distSq = dx * dx + dy * dy;
          const dist = Math.sqrt(distSq);

          if (dist < scatterRadius && dist > 0.01) {
            const force = (1 - dist / scatterRadius) * scatterStrength * (1 / seed.mass);
            seed.scatterVel.x += (dx / dist) * force;
            seed.scatterVel.y += (dy / dist) * force + force * 0.4;
            seed.scatterVel.z += (Math.random() - 0.5) * force * 0.5;

            // Extra tumbling
            seed.rotSpeed.x += (Math.random() - 0.5) * 0.06;
            seed.rotSpeed.z += (Math.random() - 0.5) * 0.06;
          }
        }

        // Apply scatter with smooth friction damping
        g.position.add(seed.scatterVel);
        seed.scatterVel.multiplyScalar(0.92);

        // Rotation
        g.rotation.x += seed.rotSpeed.x;
        g.rotation.y += seed.rotSpeed.y;
        g.rotation.z += seed.rotSpeed.z + Math.sin(elapsed * 0.7 + seed.phase) * 0.003;

        seed.rotSpeed.x *= 0.98;
        seed.rotSpeed.z *= 0.98;

        // Loop boundaries
        if (g.position.y > halfY + 1.8) {
          g.position.y = -halfY - 1.8;
          g.position.x = (Math.random() - 0.5) * xRange * 1.4;
        }
        if (g.position.x > halfX + 1.8) {
          g.position.x = -halfX - 1.8;
        } else if (g.position.x < -halfX - 1.8) {
          g.position.x = halfX + 1.8;
        }
      }

      // Animate Golden Dust
      const posArray = dustGeo.attributes.position.array as Float32Array;
      for (let i = 0; i < dustCount; i++) {
        posArray[i * 3 + 1] += 0.006;
        posArray[i * 3] += Math.sin(elapsed * 0.6 + i) * 0.003;

        if (posArray[i * 3 + 1] > halfY + 1.2) {
          posArray[i * 3 + 1] = -halfY - 1.2;
        }
      }
      dustGeo.attributes.position.needsUpdate = true;

      // Parallax camera tilt
      if (mouse.x > -100) {
        camera.position.x += (mouse.x * 1.2 - camera.position.x) * 0.04;
        camera.position.y += (mouse.y * 0.8 - camera.position.y) * 0.04;
        camera.lookAt(0, 0, 0);
      }

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handlePointerMove);
      window.removeEventListener('mouseleave', handlePointerLeave);
      renderer.dispose();
      glowTexture.dispose();
      dustGeo.dispose();
      dustMat.dispose();
    };
  }, [seedCount, dustCount]);

  return (
    <div
      className={`absolute inset-0 w-full h-full overflow-hidden pointer-events-none select-none z-0 ${className}`}
      aria-hidden="true"
    >
      {/* Three.js Canvas */}
      <canvas
        ref={canvasRef}
        className={`w-full h-full block transition-opacity duration-700 ${
          isLoaded ? 'opacity-100' : 'opacity-0'
        }`}
      />
    </div>
  );
}
