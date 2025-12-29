<script lang="ts">
  /**
   * SparkleEmitter Component
   *
   * Creates magical glitter/sparkle effects around a position in 3D space.
   * Uses GPU-accelerated Points geometry with a custom shader for:
   * - Twinkling opacity animation (sin wave with per-particle phase)
   * - Star/cross-shaped sprites with glow
   * - Additive blending for brightness
   */

  import { T, useTask } from "@threlte/core";
  import { onMount, onDestroy } from "svelte";
  import {
    Vector3,
    BufferGeometry,
    Float32BufferAttribute,
    ShaderMaterial,
    AdditiveBlending,
    Color,
  } from "three";

  interface Props {
    /** Emission center position */
    position: Vector3;
    /** Whether particles are emitting */
    enabled?: boolean;
    /** Emission intensity (0-1), affects spawn rate */
    intensity?: number;
    /** Base color for sparkles */
    color?: string;
    /** Emission radius around position */
    spread?: number;
  }

  let {
    position,
    enabled = true,
    intensity = 1.0,
    color = "#fffacd", // Light gold/white default
    spread = 15,
  }: Props = $props();

  // Particle configuration
  const MAX_PARTICLES = 150;
  const BASE_SPAWN_RATE = 30; // particles per second at intensity=1
  const GRAVITY = 8; // slight downward drift

  // Particle data structure
  interface SparkleParticle {
    position: Vector3;
    velocity: Vector3;
    life: number;
    maxLife: number;
    size: number;
    twinklePhase: number;
    twinkleSpeed: number;
  }

  // Active particles pool
  let particles: SparkleParticle[] = [];
  let spawnAccumulator = 0;

  // Three.js objects
  let geometry: BufferGeometry | null = null;
  let material: ShaderMaterial | null = null;

  // Buffer arrays (pre-allocated for performance)
  const positions = new Float32Array(MAX_PARTICLES * 3);
  const sizes = new Float32Array(MAX_PARTICLES);
  const phases = new Float32Array(MAX_PARTICLES);
  const speeds = new Float32Array(MAX_PARTICLES);
  const lifetimes = new Float32Array(MAX_PARTICLES); // 0-1 normalized life

  // Vertex shader - handles position and passes attributes to fragment
  const vertexShader = `
    attribute float size;
    attribute float phase;
    attribute float speed;
    attribute float lifetime;

    varying float vPhase;
    varying float vSpeed;
    varying float vLifetime;

    void main() {
      vPhase = phase;
      vSpeed = speed;
      vLifetime = lifetime;

      vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
      gl_PointSize = size * (300.0 / -mvPosition.z);
      gl_Position = projectionMatrix * mvPosition;
    }
  `;

  // Fragment shader - creates star shape with twinkle
  const fragmentShader = `
    uniform float uTime;
    uniform vec3 uColor;

    varying float vPhase;
    varying float vSpeed;
    varying float vLifetime;

    void main() {
      // Distance from center of point sprite
      vec2 center = gl_PointCoord - 0.5;
      float dist = length(center);

      // Discard pixels outside circular bounds
      if (dist > 0.5) discard;

      // Create star/cross pattern
      // Cross arms along x and y axes
      float crossX = abs(center.x);
      float crossY = abs(center.y);
      float cross = min(crossX, crossY);

      // Radial glow
      float glow = 1.0 - smoothstep(0.0, 0.5, dist);

      // Star shape: bright at center and along cross arms
      float starIntensity = glow * 0.6 + (1.0 - smoothstep(0.0, 0.15, cross)) * 0.4;

      // Twinkle effect using sin wave with per-particle phase
      float twinkle = 0.4 + 0.6 * sin(uTime * vSpeed + vPhase);

      // Fade out at end of life
      float lifeFade = 1.0 - smoothstep(0.7, 1.0, vLifetime);
      // Fade in at start
      float fadeIn = smoothstep(0.0, 0.15, vLifetime);

      float alpha = starIntensity * twinkle * lifeFade * fadeIn;

      // Slight color variation based on lifetime
      vec3 finalColor = uColor * (0.9 + 0.1 * sin(vLifetime * 3.14159));

      gl_FragColor = vec4(finalColor, alpha);
    }
  `;

  // Initialize geometry and material
  onMount(() => {
    geometry = new BufferGeometry();

    // Initialize all buffer attributes
    geometry.setAttribute("position", new Float32BufferAttribute(positions, 3));
    geometry.setAttribute("size", new Float32BufferAttribute(sizes, 1));
    geometry.setAttribute("phase", new Float32BufferAttribute(phases, 1));
    geometry.setAttribute("speed", new Float32BufferAttribute(speeds, 1));
    geometry.setAttribute("lifetime", new Float32BufferAttribute(lifetimes, 1));

    material = new ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uColor: { value: new Color(color) },
      },
      vertexShader,
      fragmentShader,
      blending: AdditiveBlending,
      depthWrite: false,
      transparent: true,
    });
  });

  onDestroy(() => {
    geometry?.dispose();
    material?.dispose();
    particles = [];
  });

  // Update color uniform when prop changes
  $effect(() => {
    if (material?.uniforms?.uColor) {
      material.uniforms.uColor.value.set(color);
    }
  });

  // Spawn a new particle
  function spawnParticle(): SparkleParticle {
    // Random position within spread sphere
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    const r = Math.random() * spread;

    const spawnPos = new Vector3(
      position.x + r * Math.sin(phi) * Math.cos(theta),
      position.y + r * Math.sin(phi) * Math.sin(theta),
      position.z + r * Math.cos(phi)
    );

    // Velocity: slight outward drift from center
    const outward = spawnPos.clone().sub(position).normalize();
    const velocity = outward.multiplyScalar(5 + Math.random() * 10);
    // Add slight upward bias then gravity pulls down
    velocity.y += 3;

    return {
      position: spawnPos,
      velocity,
      life: 0,
      maxLife: 0.5 + Math.random() * 1.0, // 0.5-1.5 seconds
      size: 4 + Math.random() * 6, // 4-10 units
      twinklePhase: Math.random() * Math.PI * 2,
      twinkleSpeed: 3 + Math.random() * 4, // 3-7 Hz twinkle
    };
  }

  // Animation update loop
  useTask((delta) => {
    if (!geometry || !material) return;

    // Update time uniform
    if (material.uniforms.uTime) {
      material.uniforms.uTime.value += delta;
    }

    // Spawn new particles if enabled
    if (enabled && particles.length < MAX_PARTICLES) {
      spawnAccumulator += delta * BASE_SPAWN_RATE * intensity;

      while (spawnAccumulator >= 1 && particles.length < MAX_PARTICLES) {
        particles.push(spawnParticle());
        spawnAccumulator -= 1;
      }
    }

    // Update existing particles
    let writeIndex = 0;
    const survivingParticles: SparkleParticle[] = [];

    for (const p of particles) {
      // Update life
      p.life += delta / p.maxLife;

      // Remove dead particles
      if (p.life >= 1) continue;

      // Update physics
      p.velocity.y -= GRAVITY * delta;
      p.position.add(p.velocity.clone().multiplyScalar(delta));

      // Write to buffers
      positions[writeIndex * 3] = p.position.x;
      positions[writeIndex * 3 + 1] = p.position.y;
      positions[writeIndex * 3 + 2] = p.position.z;
      sizes[writeIndex] = p.size;
      phases[writeIndex] = p.twinklePhase;
      speeds[writeIndex] = p.twinkleSpeed;
      lifetimes[writeIndex] = p.life;

      survivingParticles.push(p);
      writeIndex++;
    }

    // Zero out unused slots
    for (let i = writeIndex; i < MAX_PARTICLES; i++) {
      positions[i * 3] = 0;
      positions[i * 3 + 1] = 0;
      positions[i * 3 + 2] = 0;
      sizes[i] = 0;
    }

    particles = survivingParticles;

    // Update geometry attributes (safely access with null checks)
    const attrs = geometry.attributes;
    if (attrs.position) attrs.position.needsUpdate = true;
    if (attrs.size) attrs.size.needsUpdate = true;
    if (attrs.phase) attrs.phase.needsUpdate = true;
    if (attrs.speed) attrs.speed.needsUpdate = true;
    if (attrs.lifetime) attrs.lifetime.needsUpdate = true;

    // Update draw range to only render active particles
    geometry.setDrawRange(0, particles.length);
  });
</script>

{#if geometry && material}
  <T.Points {geometry} {material} />
{/if}
