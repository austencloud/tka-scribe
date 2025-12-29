<script lang="ts">
  /**
   * FallingParticles Primitive
   *
   * Generic particle emitter for atmospheric effects.
   * Supports leaves, snow, petals, embers, and stars.
   * Uses GPU-accelerated Points geometry with custom shaders.
   */

  import { T, useTask } from "@threlte/core";
  import { onMount, onDestroy } from "svelte";
  import {
    Vector3,
    BufferGeometry,
    Float32BufferAttribute,
    ShaderMaterial,
    AdditiveBlending,
    NormalBlending,
    Color,
  } from "three";
  import type { ParticleType } from "../domain/models/environment-models";

  interface Props {
    /** Particle behavior type */
    type?: ParticleType;
    /** Maximum particle count */
    count?: number;
    /** Emission area dimensions */
    area?: { width: number; height: number; depth: number };
    /** Fall/drift speed */
    speed?: number;
    /** Particle colors (randomly selected) */
    colors?: string[];
    /** Size range [min, max] */
    sizeRange?: [number, number];
    /** Whether particles should spin */
    spin?: boolean;
    /** Whether emitter is active */
    enabled?: boolean;
  }

  let {
    type = "leaves",
    count = 80,
    area = { width: 800, height: 600, depth: 800 },
    speed = 30,
    colors = ["#d97706", "#dc2626", "#ea580c"],
    sizeRange = [8, 16],
    spin = true,
    enabled = true,
  }: Props = $props();

  // Particle data
  interface Particle {
    position: Vector3;
    velocity: Vector3;
    rotation: number;
    rotationSpeed: number;
    size: number;
    colorIndex: number;
    swayPhase: number;
    swaySpeed: number;
  }

  let particles: Particle[] = [];
  let geometry: BufferGeometry | null = null;
  let material: ShaderMaterial | null = null;

  // Pre-allocated buffers
  const positions = new Float32Array(count * 3);
  const sizes = new Float32Array(count);
  const rotations = new Float32Array(count);
  const colorIndices = new Float32Array(count);

  // Type-specific behavior
  const typeConfigs = {
    leaves: {
      gravity: 20,
      swayAmount: 40,
      blending: NormalBlending,
      shape: "diamond",
    },
    snow: {
      gravity: 15,
      swayAmount: 20,
      blending: AdditiveBlending,
      shape: "circle",
    },
    petals: {
      gravity: 12,
      swayAmount: 50,
      blending: NormalBlending,
      shape: "petal",
    },
    embers: {
      gravity: -25, // Rise up
      swayAmount: 15,
      blending: AdditiveBlending,
      shape: "circle",
    },
    stars: {
      gravity: 5, // Very slow drift
      swayAmount: 10,
      blending: AdditiveBlending,
      shape: "star",
    },
  };

  const config = $derived(typeConfigs[type]);

  // Vertex shader
  const vertexShader = `
    attribute float size;
    attribute float rotation;
    attribute float colorIndex;

    varying float vRotation;
    varying float vColorIndex;

    void main() {
      vRotation = rotation;
      vColorIndex = colorIndex;

      vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
      gl_PointSize = size * (300.0 / -mvPosition.z);
      gl_Position = projectionMatrix * mvPosition;
    }
  `;

  // Fragment shader with shape support
  const fragmentShader = `
    uniform vec3 uColors[4];
    uniform float uShape; // 0=circle, 1=diamond, 2=petal, 3=star

    varying float vRotation;
    varying float vColorIndex;

    void main() {
      vec2 center = gl_PointCoord - 0.5;

      // Apply rotation
      float c = cos(vRotation);
      float s = sin(vRotation);
      vec2 rotated = vec2(
        center.x * c - center.y * s,
        center.x * s + center.y * c
      );

      float dist = length(rotated);
      float alpha = 0.0;

      if (uShape < 0.5) {
        // Circle (snow, embers)
        alpha = 1.0 - smoothstep(0.3, 0.5, dist);
      } else if (uShape < 1.5) {
        // Diamond (leaves)
        float diamond = abs(rotated.x) + abs(rotated.y);
        alpha = 1.0 - smoothstep(0.35, 0.5, diamond);
      } else if (uShape < 2.5) {
        // Petal
        float petal = dist + 0.3 * abs(rotated.x);
        alpha = 1.0 - smoothstep(0.3, 0.45, petal);
      } else {
        // Star
        float angle = atan(rotated.y, rotated.x);
        float star = dist * (1.0 + 0.3 * sin(angle * 5.0));
        alpha = 1.0 - smoothstep(0.25, 0.4, star);
      }

      if (alpha < 0.01) discard;

      // Select color based on index
      int idx = int(floor(vColorIndex));
      vec3 color = uColors[min(idx, 3)];

      gl_FragColor = vec4(color, alpha);
    }
  `;

  function spawnParticle(): Particle {
    const x = (Math.random() - 0.5) * area.width;
    const y = area.height / 2 + Math.random() * 100;
    const z = (Math.random() - 0.5) * area.depth;

    return {
      position: new Vector3(x, y, z),
      velocity: new Vector3(
        (Math.random() - 0.5) * 10,
        -speed * (0.5 + Math.random() * 0.5) * (type === "embers" ? -1 : 1),
        (Math.random() - 0.5) * 10
      ),
      rotation: Math.random() * Math.PI * 2,
      rotationSpeed: spin ? (Math.random() - 0.5) * 3 : 0,
      size: sizeRange[0] + Math.random() * (sizeRange[1] - sizeRange[0]),
      colorIndex: Math.floor(Math.random() * colors.length),
      swayPhase: Math.random() * Math.PI * 2,
      swaySpeed: 1 + Math.random() * 2,
    };
  }

  function getShapeIndex(): number {
    switch (config.shape) {
      case "circle": return 0;
      case "diamond": return 1;
      case "petal": return 2;
      case "star": return 3;
      default: return 0;
    }
  }

  onMount(() => {
    geometry = new BufferGeometry();
    geometry.setAttribute("position", new Float32BufferAttribute(positions, 3));
    geometry.setAttribute("size", new Float32BufferAttribute(sizes, 1));
    geometry.setAttribute("rotation", new Float32BufferAttribute(rotations, 1));
    geometry.setAttribute("colorIndex", new Float32BufferAttribute(colorIndices, 1));

    // Convert color strings to Color objects
    const colorArray = colors.slice(0, 4).map((c) => new Color(c));
    while (colorArray.length < 4) {
      colorArray.push(colorArray[0] || new Color("#ffffff"));
    }

    material = new ShaderMaterial({
      uniforms: {
        uColors: { value: colorArray },
        uShape: { value: getShapeIndex() },
      },
      vertexShader,
      fragmentShader,
      blending: config.blending,
      depthWrite: false,
      transparent: true,
    });

    // Initialize particles
    for (let i = 0; i < count; i++) {
      const p = spawnParticle();
      // Distribute vertically for initial state
      p.position.y = (Math.random() - 0.5) * area.height;
      particles.push(p);
    }
  });

  onDestroy(() => {
    geometry?.dispose();
    material?.dispose();
    particles = [];
  });

  // Update colors when they change
  $effect(() => {
    if (material?.uniforms?.uColors) {
      const colorArray = colors.slice(0, 4).map((c) => new Color(c));
      while (colorArray.length < 4) {
        colorArray.push(colorArray[0] || new Color("#ffffff"));
      }
      material.uniforms.uColors.value = colorArray;
    }
  });

  // Update shape when type changes
  $effect(() => {
    if (material?.uniforms?.uShape) {
      material.uniforms.uShape.value = getShapeIndex();
    }
  });

  // Animation loop
  useTask((delta) => {
    if (!geometry || !material || !enabled) return;

    const time = performance.now() / 1000;

    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];

      // Apply gravity
      p.velocity.y -= config.gravity * delta * (type === "embers" ? -1 : 1);

      // Apply sway
      const sway = Math.sin(time * p.swaySpeed + p.swayPhase) * config.swayAmount * delta;
      p.position.x += sway;

      // Update position
      p.position.add(p.velocity.clone().multiplyScalar(delta));

      // Update rotation
      p.rotation += p.rotationSpeed * delta;

      // Respawn if out of bounds
      const halfHeight = area.height / 2;
      const halfWidth = area.width / 2;
      const halfDepth = area.depth / 2;

      if (
        p.position.y < -halfHeight ||
        p.position.y > halfHeight + 100 ||
        Math.abs(p.position.x) > halfWidth ||
        Math.abs(p.position.z) > halfDepth
      ) {
        const newP = spawnParticle();
        p.position.copy(newP.position);
        p.velocity.copy(newP.velocity);
        p.rotation = newP.rotation;
        p.rotationSpeed = newP.rotationSpeed;
        p.size = newP.size;
        p.colorIndex = newP.colorIndex;
        p.swayPhase = newP.swayPhase;
        p.swaySpeed = newP.swaySpeed;
      }

      // Write to buffers
      positions[i * 3] = p.position.x;
      positions[i * 3 + 1] = p.position.y;
      positions[i * 3 + 2] = p.position.z;
      sizes[i] = p.size;
      rotations[i] = p.rotation;
      colorIndices[i] = p.colorIndex;
    }

    // Update geometry
    const attrs = geometry.attributes;
    if (attrs.position) attrs.position.needsUpdate = true;
    if (attrs.size) attrs.size.needsUpdate = true;
    if (attrs.rotation) attrs.rotation.needsUpdate = true;
    if (attrs.colorIndex) attrs.colorIndex.needsUpdate = true;
  });
</script>

{#if geometry && material}
  <T.Points {geometry} {material} />
{/if}
