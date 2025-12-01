<!--
  PracticePanel.svelte - Practice Tab Container

  Manages practice mode selection and configuration.
  Wraps TrainModePanel with practice-specific settings.
-->
<script lang="ts">
  import { slide, fade } from "svelte/transition";
  import { getTrainPracticeState } from "../../state/train-practice-state.svelte";
  import { PracticeMode } from "../../domain/enums/TrainEnums";
  import PracticeModeToggle from "./PracticeModeToggle.svelte";
  import AdaptiveModeConfig from "./AdaptiveModeConfig.svelte";
  import StepModeConfig from "./StepModeConfig.svelte";
  import TimedModeConfig from "./TimedModeConfig.svelte";
  import TrainModePanel from "../TrainModePanel.svelte";
  import { SequenceBrowserPanel } from "$lib/shared/animation-engine/components";
  import type { SequenceData } from "$lib/shared/foundation/domain/models/SequenceData";
  import { activeChallengeState } from "../../state/active-challenge-state.svelte";
  import { formatChallengeRequirement } from "../../domain/models/TrainChallengeModels";

  const practiceState = getTrainPracticeState();

  let showConfig = $state(false);
  let showBrowser = $state(false);
  let selectedSequence = $state<SequenceData | null>(null);

  // Mode descriptions for the intro screen
  const modeInfo = $derived.by(() => {
    switch (practiceState.currentMode) {
      case PracticeMode.ADAPTIVE:
        return {
          icon: "fa-brain",
          title: "Adaptive Mode",
          description:
            "The system adapts to your skill level in real-time. Start slow, and as you master each move, the difficulty increases automatically.",
          features: [
            "Automatic difficulty adjustment",
            "Personalized pacing",
            "Progress tracking",
          ],
        };
      case PracticeMode.STEP_BY_STEP:
        return {
          icon: "fa-shoe-prints",
          title: "Step-by-Step Mode",
          description:
            "Learn at your own pace. Each beat is broken down into individual steps, allowing you to master one move before moving to the next.",
          features: [
            "Break down complex sequences",
            "Practice individual beats",
            "No time pressure",
          ],
        };
      case PracticeMode.TIMED:
        return {
          icon: "fa-stopwatch",
          title: "Timed Mode",
          description:
            "Challenge yourself against the clock. Complete sequences within the time limit to test your speed and accuracy.",
          features: [
            "Time-based challenges",
            "Track your best times",
            "Build muscle memory",
          ],
        };
      default:
        return {
          icon: "fa-dumbbell",
          title: "Practice Mode",
          description: "Select a mode and start training.",
          features: [],
        };
    }
  });

  // When active challenge changes, set mode appropriately
  $effect(() => {
    const challenge = activeChallengeState.activeChallenge;
    if (challenge?.requirement.metadata?.mode) {
      practiceState.setMode(challenge.requirement.metadata.mode);
    }
  });

  function toggleConfig() {
    showConfig = !showConfig;
  }

  function handleBrowseSequences() {
    showBrowser = true;
  }

  function handleCloseBrowser() {
    showBrowser = false;
  }

  function handleSequenceSelect(sequence: SequenceData) {
    selectedSequence = sequence;
    showBrowser = false;
  }

  function handleBackToSelection() {
    selectedSequence = null;
  }
</script>

<div class="practice-panel">
  <!-- Active Challenge Banner -->
  {#if activeChallengeState.activeChallenge}
    <div class="challenge-banner" transition:slide={{ duration: 300 }}>
      <div class="banner-content">
        <div class="banner-icon">
          <i class="fas fa-trophy"></i>
        </div>
        <div class="banner-text">
          <h4>{activeChallengeState.activeChallenge.title}</h4>
          <p>
            {formatChallengeRequirement(
              activeChallengeState.activeChallenge.requirement
            )}
          </p>
        </div>
        <div class="banner-xp">
          <span>{activeChallengeState.activeChallenge.xpReward} XP</span>
        </div>
      </div>
      <button
        class="banner-close"
        aria-label="Dismiss active challenge banner"
        onclick={() => activeChallengeState.clearActiveChallenge()}
      >
        <i class="fas fa-times"></i>
      </button>
    </div>
  {/if}

  <!-- Mode Toggle -->
  <div class="mode-section">
    <PracticeModeToggle
      activeMode={practiceState.currentMode}
      onModeChange={(mode) => practiceState.setMode(mode)}
    />

    <!-- Config Toggle Button -->
    <button class="config-toggle" onclick={toggleConfig}>
      <i class="fas {showConfig ? 'fa-chevron-up' : 'fa-cog'}"></i>
      <span>{showConfig ? "Hide" : "Settings"}</span>
    </button>
  </div>

  <!-- Mode Configuration (collapsible) -->
  {#if showConfig}
    <div class="mode-config" transition:slide={{ duration: 300 }}>
      {#if practiceState.currentMode === PracticeMode.ADAPTIVE}
        <AdaptiveModeConfig
          config={practiceState.adaptiveConfig}
          onUpdate={(config) => practiceState.updateAdaptiveConfig(config)}
        />
      {:else if practiceState.currentMode === PracticeMode.STEP_BY_STEP}
        <StepModeConfig
          config={practiceState.stepConfig}
          onUpdate={(config) => practiceState.updateStepConfig(config)}
        />
      {:else if practiceState.currentMode === PracticeMode.TIMED}
        <TimedModeConfig
          config={practiceState.timedConfig}
          onUpdate={(config) => practiceState.updateTimedConfig(config)}
        />
      {/if}
    </div>
  {/if}

  <!-- Training Interface -->
  <div class="training-area">
    {#if selectedSequence}
      <TrainModePanel
        sequence={selectedSequence}
        practiceMode={practiceState.currentMode}
        modeConfig={practiceState.getCurrentModeConfig()}
        challengeId={activeChallengeState.activeChallenge?.id}
        onBack={handleBackToSelection}
      />
    {:else}
      <!-- Mode Intro Screen -->
      <div class="mode-intro" in:fade={{ duration: 200 }}>
        <div class="intro-content">
          <!-- Mode Icon -->
          <div class="mode-icon-large">
            <i class="fas {modeInfo.icon}"></i>
          </div>

          <!-- Mode Title & Description -->
          <h2 class="mode-title">{modeInfo.title}</h2>
          <p class="mode-description">{modeInfo.description}</p>

          <!-- Features List -->
          {#if modeInfo.features.length > 0}
            <ul class="mode-features">
              {#each modeInfo.features as feature}
                <li>
                  <i class="fas fa-check"></i>
                  <span>{feature}</span>
                </li>
              {/each}
            </ul>
          {/if}

          <!-- Action Button -->
          <button class="browse-button" onclick={handleBrowseSequences}>
            <i class="fas fa-folder-open"></i>
            <span>Browse Sequences</span>
          </button>

          <p class="hint-text">Select a sequence to start practicing</p>
        </div>
      </div>

      <!-- Sequence Browser Drawer -->
      <SequenceBrowserPanel
        mode="primary"
        show={showBrowser}
        onSelect={handleSequenceSelect}
        onClose={handleCloseBrowser}
      />
    {/if}
  </div>
</div>

<style>
  .practice-panel {
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 100%;
    min-height: 0;
    overflow: hidden;
    background: transparent;
    container-type: size;
    container-name: practice-panel;
  }

  .mode-section {
    display: flex;
    align-items: center;
    gap: clamp(0.5rem, 2.2cqw, 1.1rem);
    padding: clamp(12px, 2.8cqh, 18px) clamp(12px, 3cqw, 18px);
    background: rgba(0, 0, 0, 0.2);
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  }

  .config-toggle {
    display: flex;
    align-items: center;
    gap: clamp(6px, 1.6cqw, 10px);
    padding: clamp(10px, 2.6cqh, 12px) clamp(12px, 3cqw, 16px);
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: clamp(10px, 2.6cqw, 14px);
    color: var(--foreground, #ffffff);
    font-size: clamp(0.85rem, 2.5cqi, 0.95rem);
    cursor: pointer;
    transition: all 0.2s;
  }

  .config-toggle:hover {
    background: rgba(255, 255, 255, 0.15);
    border-color: rgba(255, 255, 255, 0.3);
  }

  .mode-config {
    padding: clamp(12px, 3cqh, 18px) clamp(12px, 3cqw, 18px);
    background: rgba(0, 0, 0, 0.3);
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  }

  .training-area {
    flex: 1;
    min-height: 0;
    overflow: auto;
    display: flex;
    flex-direction: column;
  }

  /* Challenge Banner */
  .challenge-banner {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: clamp(10px, 2.5cqw, 14px);
    padding: clamp(10px, 2.5cqh, 14px) clamp(12px, 3cqw, 18px);
    background: linear-gradient(
      135deg,
      rgba(245, 158, 11, 0.15),
      rgba(245, 158, 11, 0.05)
    );
    border-bottom: 1px solid rgba(245, 158, 11, 0.3);
  }

  .banner-content {
    display: flex;
    align-items: center;
    gap: clamp(10px, 2.5cqw, 14px);
    flex: 1;
    min-width: 0;
  }

  .banner-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: clamp(32px, 6cqw, 40px);
    height: clamp(32px, 6cqw, 40px);
    background: rgba(245, 158, 11, 0.2);
    border-radius: clamp(8px, 2cqw, 10px);
    color: #f59e0b;
    font-size: 16px;
    flex-shrink: 0;
  }

  .banner-text {
    flex: 1;
    min-width: 0;
  }

  .banner-text h4 {
    margin: 0 0 2px 0;
    font-size: clamp(13px, 3cqi, 15px);
    font-weight: 600;
    color: rgba(255, 255, 255, 0.95);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .banner-text p {
    margin: 0;
    font-size: clamp(11px, 2.6cqi, 13px);
    color: rgba(255, 255, 255, 0.6);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .banner-xp {
    display: flex;
    align-items: center;
    padding: clamp(6px, 1.6cqh, 10px) clamp(10px, 3cqw, 14px);
    background: rgba(245, 158, 11, 0.2);
    border-radius: clamp(12px, 3cqw, 18px);
    flex-shrink: 0;
  }

  .banner-xp span {
    font-size: clamp(12px, 2.8cqi, 14px);
    font-weight: 600;
    color: #f59e0b;
  }

  .banner-close {
    display: flex;
    align-items: center;
    justify-content: center;
    width: clamp(30px, 6cqw, 36px);
    height: clamp(30px, 6cqw, 36px);
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: clamp(6px, 1.8cqw, 10px);
    color: rgba(255, 255, 255, 0.6);
    cursor: pointer;
    transition: all 0.2s;
    flex-shrink: 0;
  }

  .banner-close:hover {
    background: rgba(255, 255, 255, 0.1);
    color: rgba(255, 255, 255, 0.9);
  }

  /* Mode Intro Screen */
  .mode-intro {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
    overflow-y: auto;
  }

  .intro-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    max-width: min(400px, 90cqw);
    max-height: 100%;
    gap: clamp(12px, 3cqh, 20px);
  }

  .mode-icon-large {
    display: flex;
    align-items: center;
    justify-content: center;
    width: clamp(64px, 12cqh, 96px);
    height: clamp(64px, 12cqh, 96px);
    background: linear-gradient(
      135deg,
      rgba(59, 130, 246, 0.2),
      rgba(139, 92, 246, 0.2)
    );
    border: 2px solid rgba(59, 130, 246, 0.3);
    border-radius: clamp(16px, 3.5cqw, 24px);
    margin-bottom: clamp(6px, 1.5cqh, 12px);
  }

  .mode-icon-large i {
    font-size: clamp(1.6rem, 4cqi, 2.2rem);
    color: #60a5fa;
  }

  .mode-title {
    margin: 0;
    font-size: clamp(1.35rem, 4cqi, 1.75rem);
    font-weight: 700;
    color: rgba(255, 255, 255, 0.95);
  }

  .mode-description {
    margin: 0;
    font-size: clamp(0.9rem, 2.6cqi, 1rem);
    line-height: 1.6;
    color: rgba(255, 255, 255, 0.7);
  }

  .mode-features {
    display: flex;
    flex-direction: column;
    gap: clamp(10px, 2.5cqh, 14px);
    list-style: none;
    padding: 0;
    margin: clamp(8px, 2cqh, 12px) 0;
    width: 100%;
  }

  .mode-features li {
    display: flex;
    align-items: center;
    gap: clamp(10px, 2.5cqw, 14px);
    padding: clamp(10px, 2.8cqh, 14px) clamp(14px, 3.5cqw, 18px);
    background: rgba(255, 255, 255, 0.04);
    border-radius: clamp(8px, 2.2cqw, 12px);
    font-size: clamp(0.85rem, 2.6cqi, 0.95rem);
    color: rgba(255, 255, 255, 0.8);
  }

  .mode-features li i {
    color: #22c55e;
    font-size: clamp(0.7rem, 2cqi, 0.85rem);
  }

  .browse-button {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: clamp(10px, 2.5cqw, 14px);
    width: 100%;
    padding: clamp(14px, 3.8cqh, 18px) clamp(16px, 4cqw, 22px);
    margin-top: clamp(8px, 2cqh, 12px);
    background: linear-gradient(135deg, #3b82f6, #8b5cf6);
    border: none;
    border-radius: clamp(10px, 3cqw, 14px);
    color: white;
    font-size: clamp(0.95rem, 3cqi, 1.05rem);
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
  }

  .browse-button:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(59, 130, 246, 0.4);
  }

  .browse-button:active {
    transform: translateY(0);
  }

  .browse-button i {
    font-size: clamp(1rem, 3cqi, 1.2rem);
  }

  .hint-text {
    margin: 0;
    font-size: clamp(0.78rem, 2.4cqi, 0.85rem);
    color: rgba(255, 255, 255, 0.4);
  }

  @container practice-panel (max-width: 640px) {
    .mode-section {
      flex-direction: column;
      align-items: stretch;
    }

    .config-toggle {
      width: 100%;
      justify-content: center;
    }
  }

  @container practice-panel (max-height: 620px) {
    .mode-section {
      padding: clamp(10px, 2.5cqh, 14px) clamp(12px, 3cqw, 16px);
    }

    .mode-config {
      padding: clamp(10px, 2.5cqh, 14px) clamp(12px, 3cqw, 16px);
    }

    .mode-intro {
      padding: clamp(12px, 3cqh, 18px);
    }

    .intro-content {
      gap: clamp(10px, 2.6cqh, 16px);
    }
  }

  @container practice-panel (max-height: 520px) {
    .mode-description {
      display: -webkit-box;
      -webkit-line-clamp: 3;
      line-clamp: 3;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .mode-features {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      gap: clamp(8px, 2cqw, 12px);
    }

    .mode-features li {
      padding: clamp(8px, 2.2cqh, 12px) clamp(12px, 3cqw, 16px);
      font-size: clamp(0.82rem, 2.3cqi, 0.9rem);
    }

    .browse-button {
      padding: clamp(12px, 3cqh, 14px) clamp(14px, 3.2cqw, 18px);
      margin-top: clamp(6px, 1.6cqh, 10px);
    }
  }

  @container practice-panel (max-height: 480px) {
    .mode-icon-large {
      width: clamp(56px, 11cqh, 72px);
      height: clamp(56px, 11cqh, 72px);
    }

    .mode-title {
      font-size: clamp(1.2rem, 3.2cqi, 1.4rem);
    }

    .mode-description {
      font-size: clamp(0.85rem, 2.4cqi, 0.95rem);
    }

    .mode-features li {
      padding: clamp(8px, 2.2cqh, 12px) clamp(12px, 3cqw, 16px);
    }

    .browse-button {
      padding: clamp(12px, 3cqh, 14px) clamp(14px, 3cqw, 16px);
    }
  }

  @container practice-panel (max-height: 420px) {
    .mode-features {
      display: flex;
      flex-wrap: wrap;
    }

    .mode-features li {
      flex: 1 1 45%;
      min-width: 140px;
      padding: clamp(6px, 1.6cqh, 10px) clamp(10px, 3cqw, 14px);
    }

    .hint-text {
      display: none;
    }
  }

  @container practice-panel (max-height: 360px) {
    .mode-description {
      -webkit-line-clamp: 2;
      line-clamp: 2;
    }

    .mode-features {
      gap: clamp(6px, 1.5cqw, 10px);
    }

    .mode-features li {
      padding: clamp(6px, 1.5cqh, 8px) clamp(10px, 2.4cqw, 12px);
      font-size: clamp(0.8rem, 2.2cqi, 0.88rem);
    }
  }
</style>
