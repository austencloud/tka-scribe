## Deep Ocean Background Refresh - Research Notes

### Goal

Evolve the TKA "Deep Ocean" background from playful placeholder art into an ambient, modern scene that supports focus, aligns with motion-accessibility expectations, and delivers believable underwater life.

---

### Reference Sources

| Topic                                        | Key takeaways                                                                                                                                       | Source                                                                                                                                                |
| -------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| Underwater lighting, particulate, and motion | Realistic scenes depend on layered light falloff, refraction, volumetric caustics, and ever-present drifting particles/vegetation sway.             | [Palos Publishing - _Creating Underwater Animation Effects_](https://palospublishing.com/creating-underwater-animation-effects/)                      |
| Fish body mechanics                          | Convincing fish motion comes from cascading rotations down the spine, offset by phase delays; the body leads and the tail follows.                  | [Animation Apprentice - _Fish Swim Free Animation Tutorial_](https://animationapprentice.blogspot.com/2024/05/fish-swim-free-animation-tutorial.html) |
| UX animation best practices                  | Decorative loops must support the experience, land in the 200-500 ms readability window, and honor reduced-motion preferences to avoid distraction. | [Gapsy Studio - _UI Animation Best Practices_](https://gapsystudio.com/blog/ui-animation-best-practices/)                                             |

Additional inspiration links (noted for future deep dives):

- Canvas-based fish schools with bezier spines (CreateJS plugin demo): `https://demonisblack.com/code/2016/fishanimation/canvas/index.html`
- Dribbble / Behance underwater UI moodboards for palette cues: `https://dribbble.com/tags/underwater`

---

### Actionable Principles

1. **Believability > Quantity**  
   Few well-crafted marine actors (fish / jelly) beat many flat sprites. Each asset needs distinct silhouettes and motion profiles.
2. **Directional Motion**  
   Fish must travel head-first; spine segments animate with progressive phase offsets to avoid "moonwalking."
3. **Light & Depth**  
   Use layered gradients and volumetric highlights that fade with depth, plus gentle caustic sweeps. Color shifts (teal -> navy) reinforce depth.
4. **Ambient Particles**  
   Maintain sparse background and foreground particle passes with varied sizes, opacity falloff, and occasional bubble trails.
5. **Respect Accessibility**  
   Tie all oscillations into the existing reduced-motion flag; throttle or disable non-essential loops when motion is minimized.
6. **Performance & Restraint**  
   Keep loops around 20-30 s with easing transitions. Limit simultaneous animated objects based on quality settings to prevent frame drops.

---

### Implementation Plan (Next Steps)

1. **Refactor marine life models**
   - Rework `createMarineLife` into structured fish segments (head, mid-body, tail) with per-segment control points.
   - Introduce new draw routines for fish and jellyfish using bezier curves / arcs for organic silhouettes.
2. **Revise motion system**
   - Update `updateMarineLife` to drive phase-offset sine waves, directional velocities, and viewport wrapping without reversing sprites.
   - Add per-type animation tuning (e.g., jelly pulse frequency).
3. **Enhance rendering layers**
   - Insert a caustic light layer (broad gradient beams with slow parallax).
   - Rebalance particle layers (density, size, opacity) to avoid grain while keeping depth cues.
4. **Quality & accessibility tuning**
   - Scale counts and animation intensity by quality setting (minimal -> high).
   - Ensure `reducedMotion` bypasses non-essential oscillation and lowers particle drift speed.
5. **Validation**
   - Manual review across quality tiers.
   - Snapshot comparisons before/after to confirm readability of foreground UI elements.
   - Optional usability gut-check with team for motion comfort.

---

### Open Questions / To Investigate

- Should we introduce subtle bioluminescent accents for interest (e.g., rare glowing fish) or keep palette strictly monochrome?
- Do we need parallax between multiple background layers to reinforce depth, or is a single gradient + caustics sufficient?
- Would integrating SVG or Lottie assets for marine life add value versus pure Canvas drawing?

_Prepared by Codex (GPT-5) - 2025-11-18_
