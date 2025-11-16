<!--
GridConceptExperience - Simple 3-page grid learning flow
Page 1: Side-by-side Box and Diamond grids
Page 2: Grids overlay to show 8-point
Page 3: Location labels (N/E/S/W for Diamond, NE/SE/SW/NW for Box)
-->
<script lang="ts">
  import { resolve, TYPES, type IHapticFeedbackService } from "$shared";

  let { onComplete } = $props<{
    onComplete?: () => void;
  }>();

  const hapticService = resolve<IHapticFeedbackService>(
    TYPES.IHapticFeedbackService
  );

  let currentPage = $state(1);

  function handleNext() {
    hapticService?.trigger("selection");
    if (currentPage < 3) {
      currentPage++;
    } else {
      onComplete?.();
    }
  }

  // Simple grid point data
  const diamondPoints = [
    { x: 50, y: 15 }, // N
    { x: 85, y: 50 }, // E
    { x: 50, y: 85 }, // S
    { x: 15, y: 50 }, // W
    { x: 50, y: 50 }, // Center
  ];

  const boxPoints = [
    { x: 25, y: 25 }, // NW
    { x: 75, y: 25 }, // NE
    { x: 75, y: 75 }, // SE
    { x: 25, y: 75 }, // SW
    { x: 50, y: 50 }, // Center
  ];
</script>

<div class="grid-experience">
  {#if currentPage === 1}
    <!-- Page 1: Side-by-side grids -->
    <div class="page">
      <h2>The Grid</h2>

      <p>The Kinetic Alphabet is based on a 4-point grid.</p>
      <p>
        There are two 4-point grids: <strong>box mode</strong> and
        <strong>diamond mode</strong>.
      </p>
      <p>This guide is written in diamond, but everything translates to box.</p>

      <div class="grids-container">
        <!-- Diamond Grid -->
        <div class="grid-item">
          <h3>Diamond</h3>
          <svg viewBox="0 0 100 100" class="grid-svg">
            <line
              x1="50"
              y1="15"
              x2="50"
              y2="85"
              stroke="white"
              stroke-width="0.5"
              opacity="0.3"
            />
            <line
              x1="15"
              y1="50"
              x2="85"
              y2="50"
              stroke="white"
              stroke-width="0.5"
              opacity="0.3"
            />
            {#each diamondPoints.slice(0, -1) as point}
              <circle
                cx={point.x}
                cy={point.y}
                r="2.5"
                fill="white"
                opacity="0.9"
              >
                <animate
                  attributeName="r"
                  values="2.5;3;2.5"
                  dur="2s"
                  repeatCount="indefinite"
                />
              </circle>
            {/each}
            <!-- Center point with glow -->
            <circle cx="50" cy="50" r="3" fill="#FFD700" opacity="0.3">
              <animate
                attributeName="r"
                values="3;5;3"
                dur="2s"
                repeatCount="indefinite"
              />
            </circle>
            <circle cx="50" cy="50" r="2.5" fill="#FFD700">
              <animate
                attributeName="opacity"
                values="0.8;1;0.8"
                dur="2s"
                repeatCount="indefinite"
              />
            </circle>
          </svg>
        </div>

        <!-- Box Grid -->
        <div class="grid-item">
          <h3>Box</h3>
          <svg viewBox="0 0 100 100" class="grid-svg">
            <line
              x1="25"
              y1="25"
              x2="75"
              y2="75"
              stroke="white"
              stroke-width="0.5"
              opacity="0.3"
            />
            <line
              x1="75"
              y1="25"
              x2="25"
              y2="75"
              stroke="white"
              stroke-width="0.5"
              opacity="0.3"
            />
            {#each boxPoints.slice(0, -1) as point}
              <circle
                cx={point.x}
                cy={point.y}
                r="2.5"
                fill="white"
                opacity="0.9"
              >
                <animate
                  attributeName="r"
                  values="2.5;3;2.5"
                  dur="2s"
                  repeatCount="indefinite"
                />
              </circle>
            {/each}
            <!-- Center point with glow -->
            <circle cx="50" cy="50" r="3" fill="#FFD700" opacity="0.3">
              <animate
                attributeName="r"
                values="3;5;3"
                dur="2s"
                repeatCount="indefinite"
              />
            </circle>
            <circle cx="50" cy="50" r="2.5" fill="#FFD700">
              <animate
                attributeName="opacity"
                values="0.8;1;0.8"
                dur="2s"
                repeatCount="indefinite"
              />
            </circle>
          </svg>
        </div>
      </div>

      <button class="next-button" onclick={handleNext}>Next</button>
    </div>
  {:else if currentPage === 2}
    <!-- Page 2: Overlay animation -->
    <div class="page">
      <h2>The 8-Point Grid</h2>

      <p>Together, diamond and box form an <strong>8-point grid</strong>:</p>

      <div class="merged-grid-container">
        <svg viewBox="0 0 100 100" class="grid-svg merged">
          <!-- Diamond lines -->
          <line
            x1="50"
            y1="15"
            x2="50"
            y2="85"
            stroke="white"
            stroke-width="0.5"
            opacity="0.3"
          />
          <line
            x1="15"
            y1="50"
            x2="85"
            y2="50"
            stroke="white"
            stroke-width="0.5"
            opacity="0.3"
          />
          <!-- Box lines -->
          <line
            x1="25"
            y1="25"
            x2="75"
            y2="75"
            stroke="white"
            stroke-width="0.5"
            opacity="0.3"
          />
          <line
            x1="75"
            y1="25"
            x2="25"
            y2="75"
            stroke="white"
            stroke-width="0.5"
            opacity="0.3"
          />
          <!-- Outer points with subtle pulse -->
          <circle cx="50" cy="15" r="2.5" fill="white" opacity="0.9">
            <animate
              attributeName="r"
              values="2.5;3;2.5"
              dur="2s"
              repeatCount="indefinite"
            />
          </circle>
          <circle cx="75" cy="25" r="2.5" fill="white" opacity="0.9">
            <animate
              attributeName="r"
              values="2.5;3;2.5"
              dur="2s"
              begin="0.25s"
              repeatCount="indefinite"
            />
          </circle>
          <circle cx="85" cy="50" r="2.5" fill="white" opacity="0.9">
            <animate
              attributeName="r"
              values="2.5;3;2.5"
              dur="2s"
              begin="0.5s"
              repeatCount="indefinite"
            />
          </circle>
          <circle cx="75" cy="75" r="2.5" fill="white" opacity="0.9">
            <animate
              attributeName="r"
              values="2.5;3;2.5"
              dur="2s"
              begin="0.75s"
              repeatCount="indefinite"
            />
          </circle>
          <circle cx="50" cy="85" r="2.5" fill="white" opacity="0.9">
            <animate
              attributeName="r"
              values="2.5;3;2.5"
              dur="2s"
              begin="1s"
              repeatCount="indefinite"
            />
          </circle>
          <circle cx="25" cy="75" r="2.5" fill="white" opacity="0.9">
            <animate
              attributeName="r"
              values="2.5;3;2.5"
              dur="2s"
              begin="1.25s"
              repeatCount="indefinite"
            />
          </circle>
          <circle cx="15" cy="50" r="2.5" fill="white" opacity="0.9">
            <animate
              attributeName="r"
              values="2.5;3;2.5"
              dur="2s"
              begin="1.5s"
              repeatCount="indefinite"
            />
          </circle>
          <circle cx="25" cy="25" r="2.5" fill="white" opacity="0.9">
            <animate
              attributeName="r"
              values="2.5;3;2.5"
              dur="2s"
              begin="1.75s"
              repeatCount="indefinite"
            />
          </circle>
          <!-- Center point with enhanced glow -->
          <circle cx="50" cy="50" r="4" fill="#FFD700" opacity="0.2">
            <animate
              attributeName="r"
              values="4;7;4"
              dur="2s"
              repeatCount="indefinite"
            />
          </circle>
          <circle cx="50" cy="50" r="3" fill="#FFD700">
            <animate
              attributeName="opacity"
              values="0.7;1;0.7"
              dur="2s"
              repeatCount="indefinite"
            />
          </circle>
        </svg>
      </div>

      <p>We'll use <strong>diamond mode</strong> to learn each concept.</p>

      <button class="next-button" onclick={handleNext}>Next</button>
    </div>
  {:else if currentPage === 3}
    <!-- Page 3: Location labels -->
    <div class="page">
      <h2>Grid Locations</h2>

      <div class="grids-container">
        <!-- Diamond with N/E/S/W -->
        <div class="grid-item">
          <h3>Diamond</h3>
          <svg viewBox="0 0 100 100" class="grid-svg">
            <line
              x1="50"
              y1="15"
              x2="50"
              y2="85"
              stroke="white"
              stroke-width="0.5"
              opacity="0.3"
            />
            <line
              x1="15"
              y1="50"
              x2="85"
              y2="50"
              stroke="white"
              stroke-width="0.5"
              opacity="0.3"
            />
            {#each diamondPoints.slice(0, -1) as point}
              <circle
                cx={point.x}
                cy={point.y}
                r="2.5"
                fill="white"
                opacity="0.9"
              >
                <animate
                  attributeName="r"
                  values="2.5;3;2.5"
                  dur="2s"
                  repeatCount="indefinite"
                />
              </circle>
            {/each}
            <!-- Center point -->
            <circle cx="50" cy="50" r="3" fill="#FFD700" opacity="0.3">
              <animate
                attributeName="r"
                values="3;5;3"
                dur="2s"
                repeatCount="indefinite"
              />
            </circle>
            <circle cx="50" cy="50" r="2.5" fill="#FFD700">
              <animate
                attributeName="opacity"
                values="0.8;1;0.8"
                dur="2s"
                repeatCount="indefinite"
              />
            </circle>
            <!-- Labels -->
            <text
              x="50"
              y="10"
              text-anchor="middle"
              fill="white"
              font-size="8"
              class="label">N</text
            >
            <text
              x="90"
              y="52"
              text-anchor="start"
              fill="white"
              font-size="8"
              class="label">E</text
            >
            <text
              x="50"
              y="95"
              text-anchor="middle"
              fill="white"
              font-size="8"
              class="label">S</text
            >
            <text
              x="10"
              y="52"
              text-anchor="end"
              fill="white"
              font-size="8"
              class="label">W</text
            >
          </svg>
        </div>

        <!-- Box with NE/SE/SW/NW -->
        <div class="grid-item">
          <h3>Box</h3>
          <svg viewBox="0 0 100 100" class="grid-svg">
            <line
              x1="25"
              y1="25"
              x2="75"
              y2="75"
              stroke="white"
              stroke-width="0.5"
              opacity="0.3"
            />
            <line
              x1="75"
              y1="25"
              x2="25"
              y2="75"
              stroke="white"
              stroke-width="0.5"
              opacity="0.3"
            />
            {#each boxPoints.slice(0, -1) as point}
              <circle
                cx={point.x}
                cy={point.y}
                r="2.5"
                fill="white"
                opacity="0.9"
              >
                <animate
                  attributeName="r"
                  values="2.5;3;2.5"
                  dur="2s"
                  repeatCount="indefinite"
                />
              </circle>
            {/each}
            <!-- Center point -->
            <circle cx="50" cy="50" r="3" fill="#FFD700" opacity="0.3">
              <animate
                attributeName="r"
                values="3;5;3"
                dur="2s"
                repeatCount="indefinite"
              />
            </circle>
            <circle cx="50" cy="50" r="2.5" fill="#FFD700">
              <animate
                attributeName="opacity"
                values="0.8;1;0.8"
                dur="2s"
                repeatCount="indefinite"
              />
            </circle>
            <!-- Labels -->
            <text
              x="75"
              y="20"
              text-anchor="middle"
              fill="white"
              font-size="8"
              class="label">NE</text
            >
            <text
              x="80"
              y="77"
              text-anchor="start"
              fill="white"
              font-size="8"
              class="label">SE</text
            >
            <text
              x="25"
              y="83"
              text-anchor="middle"
              fill="white"
              font-size="8"
              class="label">SW</text
            >
            <text
              x="20"
              y="27"
              text-anchor="end"
              fill="white"
              font-size="8"
              class="label">NW</text
            >
          </svg>
        </div>
      </div>

      <button class="next-button" onclick={handleNext}>Done</button>
    </div>
  {/if}
</div>

<style>
  .grid-experience {
    display: flex;
    flex-direction: column;
    height: 100%;
    padding: var(--spacing-xl, 2rem);
    overflow-y: auto;
    overflow-x: hidden;
  }

  .page {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-lg, 1.5rem);
    max-width: 900px;
    margin: 0 auto;
    width: 100%;
    animation: slideInUp 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  }

  @keyframes slideInUp {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  h2 {
    font-size: var(--font-size-3xl, 1.875rem);
    font-weight: 700;
    color: var(--text-primary-current, #ffffff);
    margin: 0;
    text-align: center;
    background: linear-gradient(135deg, #ffffff 0%, rgba(255, 255, 255, 0.8) 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  h3 {
    font-size: var(--font-size-xl, 1.25rem);
    font-weight: 600;
    color: var(--text-primary-current, #ffffff);
    margin: 0;
    text-align: center;
    letter-spacing: 0.5px;
  }

  p {
    font-size: var(--font-size-lg, 1.125rem);
    line-height: 1.7;
    color: var(--text-secondary-current, rgba(255, 255, 255, 0.85));
    margin: 0;
    text-align: center;
  }

  strong {
    color: var(--text-primary-current, #ffffff);
    font-weight: 700;
  }

  .grids-container {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: var(--spacing-xl, 2rem);
    margin: var(--spacing-lg, 1.5rem) 0;
  }

  .grid-item {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-md, 1rem);
    background: var(--surface-glass, rgba(255, 255, 255, 0.05));
    backdrop-filter: var(--glass-backdrop, blur(20px));
    border: var(--glass-border, 1px solid rgba(255, 255, 255, 0.1));
    border-radius: var(--sheet-radius-medium, 20px);
    padding: var(--spacing-lg, 1.5rem);
    transition: all var(--transition-normal, 0.3s cubic-bezier(0.4, 0, 0.2, 1));
  }

  .grid-item:hover {
    background: var(--surface-hover, rgba(255, 255, 255, 0.12));
    border-color: rgba(255, 255, 255, 0.2);
    transform: translateY(-4px);
    box-shadow: var(--shadow-glass-hover);
  }

  .grid-svg {
    width: 100%;
    max-width: 280px;
    height: auto;
    aspect-ratio: 1;
    margin: 0 auto;
    background: rgba(0, 0, 0, 0.2);
    border-radius: var(--sheet-radius-small, 16px);
    border: 2px solid rgba(255, 255, 255, 0.15);
    padding: var(--spacing-md, 1rem);
    transition: all var(--transition-normal, 0.3s);
  }

  .grid-svg.merged {
    max-width: 380px;
    background: linear-gradient(
      135deg,
      rgba(99, 102, 241, 0.1) 0%,
      rgba(168, 85, 247, 0.1) 100%
    );
  }

  .merged-grid-container {
    display: flex;
    justify-content: center;
    margin: var(--spacing-lg, 1.5rem) 0;
    padding: var(--spacing-lg, 1.5rem);
    background: var(--surface-glass, rgba(255, 255, 255, 0.05));
    backdrop-filter: var(--glass-backdrop, blur(20px));
    border: var(--glass-border, 1px solid rgba(255, 255, 255, 0.1));
    border-radius: var(--sheet-radius-medium, 20px);
  }

  .label {
    animation: fadeIn 0.6s ease-in-out;
    font-weight: 700;
    filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: scale(0.8);
    }
    to {
      opacity: 1;
      transform: scale(1);
    }
  }

  .next-button {
    align-self: center;
    padding: var(--spacing-md, 1rem) var(--spacing-2xl, 3rem);
    background: linear-gradient(
      135deg,
      rgba(99, 102, 241, 0.3) 0%,
      rgba(168, 85, 247, 0.3) 100%
    );
    backdrop-filter: var(--glass-backdrop, blur(20px));
    border: 2px solid rgba(99, 102, 241, 0.5);
    border-radius: var(--sheet-radius-button, 12px);
    color: white;
    font-size: var(--font-size-lg, 1.125rem);
    font-weight: 700;
    cursor: pointer;
    transition: all var(--transition-normal, 0.3s);
    min-height: 56px;
    margin-top: var(--spacing-lg, 1.5rem);
    box-shadow: var(--shadow-glass);
  }

  .next-button:hover {
    background: linear-gradient(
      135deg,
      rgba(99, 102, 241, 0.4) 0%,
      rgba(168, 85, 247, 0.4) 100%
    );
    border-color: rgba(99, 102, 241, 0.8);
    transform: translateY(-2px);
    box-shadow: var(--shadow-glass-hover);
  }

  .next-button:active {
    transform: translateY(0);
    box-shadow: var(--shadow-glass);
  }

  /* Responsive Design - Tablet */
  @media (max-width: 768px) {
    .grid-experience {
      padding: var(--spacing-lg, 1.5rem);
    }

    .page {
      gap: var(--spacing-md, 1rem);
    }

    .grids-container {
      grid-template-columns: 1fr;
      gap: var(--spacing-lg, 1.5rem);
    }

    h2 {
      font-size: var(--font-size-2xl, 1.5rem);
    }

    h3 {
      font-size: var(--font-size-lg, 1.125rem);
    }

    p {
      font-size: var(--font-size-base, 1rem);
    }

    .grid-svg {
      max-width: 100%;
    }

    .grid-svg.merged {
      max-width: 100%;
    }

    .next-button {
      width: 100%;
      max-width: 300px;
    }
  }

  /* Responsive Design - Mobile */
  @media (max-width: 480px) {
    .grid-experience {
      padding: var(--spacing-md, 1rem);
    }

    .page {
      gap: var(--spacing-sm, 0.75rem);
    }

    h2 {
      font-size: var(--font-size-xl, 1.25rem);
    }

    h3 {
      font-size: var(--font-size-base, 1rem);
    }

    p {
      font-size: var(--font-size-sm, 0.875rem);
      line-height: 1.6;
    }

    .grid-item {
      padding: var(--spacing-md, 1rem);
    }

    .grids-container {
      gap: var(--spacing-md, 1rem);
    }

    .merged-grid-container {
      padding: var(--spacing-md, 1rem);
    }

    .next-button {
      padding: var(--spacing-sm, 0.75rem) var(--spacing-xl, 2rem);
      font-size: var(--font-size-base, 1rem);
      min-height: 48px;
    }

    .grid-svg {
      padding: var(--spacing-sm, 0.5rem);
    }
  }

  /* Accessibility - Reduce Motion */
  @media (prefers-reduced-motion: reduce) {
    .page,
    .label,
    .grid-item,
    .next-button {
      animation: none;
      transition-duration: 0.01ms;
    }
  }
</style>
