/**
 * Playback State
 *
 * Manages animation playback timing using requestAnimationFrame.
 * Pure playback logic with no knowledge of what's being animated.
 */

/**
 * Create playback state for animation timing
 */
export function createPlaybackState() {
  let isPlaying = $state(false);
  let progress = $state(0);
  let speed = $state(1); // Units per second
  let loop = $state(true);

  let animationFrameId: number | null = null;
  let lastTimestamp: number = 0;

  /**
   * Animation loop - updates progress based on elapsed time
   */
  function animate(timestamp: number) {
    if (!isPlaying) return;

    if (lastTimestamp === 0) {
      lastTimestamp = timestamp;
    }

    const deltaMs = timestamp - lastTimestamp;
    lastTimestamp = timestamp;

    // Update progress (speed = units per second)
    const deltaProgress = (deltaMs / 1000) * speed;
    let newProgress = progress + deltaProgress;

    if (newProgress >= 1) {
      if (loop) {
        newProgress = newProgress % 1;
      } else {
        newProgress = 1;
        isPlaying = false;
      }
    }

    progress = newProgress;
    animationFrameId = requestAnimationFrame(animate);
  }

  function play() {
    if (isPlaying) return;
    isPlaying = true;
    lastTimestamp = 0;
    animationFrameId = requestAnimationFrame(animate);
  }

  function pause() {
    isPlaying = false;
    if (animationFrameId !== null) {
      cancelAnimationFrame(animationFrameId);
      animationFrameId = null;
    }
  }

  function togglePlay() {
    if (isPlaying) {
      pause();
    } else {
      play();
    }
  }

  function reset() {
    pause();
    progress = 0;
  }

  function setProgress(value: number) {
    progress = Math.max(0, Math.min(1, value));
  }

  function destroy() {
    pause();
  }

  return {
    get isPlaying() { return isPlaying; },
    get progress() { return progress; },
    get speed() { return speed; },
    set speed(value: number) { speed = value; },
    get loop() { return loop; },
    set loop(value: boolean) { loop = value; },

    play,
    pause,
    togglePlay,
    reset,
    setProgress,
    destroy,
  };
}

export type PlaybackState = ReturnType<typeof createPlaybackState>;
