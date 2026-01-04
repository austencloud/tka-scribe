/**
 * Avatar Sync State
 *
 * Manages synchronization between two avatar instances with beat offset.
 * When sync is enabled, the follower avatar mirrors the master's playback
 * with a configurable beat offset (positive = ahead, negative = behind).
 */

import type { AvatarInstanceState } from "./avatar-instance-state.svelte";

export interface AvatarSyncConfig {
  isSyncEnabled: boolean;
  masterAvatarId: "avatar1" | "avatar2";
  beatOffset: number; // -8 to +8
}

const MIN_OFFSET = -8;
const MAX_OFFSET = 8;

/**
 * Create sync state for dual avatar coordination
 *
 * Uses $effect.root() to allow creation outside component initialization
 * (e.g., inside onMount after async service loading).
 */
export function createAvatarSyncState(
  avatar1: AvatarInstanceState,
  avatar2: AvatarInstanceState
) {
  let isSyncEnabled = $state(false);
  let masterAvatarId = $state<"avatar1" | "avatar2">("avatar1");
  let beatOffset = $state(0);

  // Track previous master beat to detect changes
  let prevMasterBeat = -1;

  // Cleanup function for effect root
  let cleanupEffects: (() => void) | null = null;

  /**
   * Get current master avatar
   */
  function getMaster() {
    return masterAvatarId === "avatar1" ? avatar1 : avatar2;
  }

  /**
   * Get current follower avatar
   */
  function getFollower() {
    return masterAvatarId === "avatar1" ? avatar2 : avatar1;
  }

  /**
   * Calculate follower beat with offset and wrapping
   */
  function calculateFollowerBeat(
    masterBeat: number,
    totalBeats: number
  ): number {
    if (totalBeats === 0) return 0;
    // Add offset and wrap using modulo (handles negatives correctly)
    const result =
      (((masterBeat + beatOffset) % totalBeats) + totalBeats) % totalBeats;
    return result;
  }

  /**
   * Sync follower to master's current beat with offset
   */
  function syncFollowerBeat() {
    if (!isSyncEnabled) return;
    const master = getMaster();
    const follower = getFollower();
    if (!master.hasSequence || !follower.hasSequence) return;

    const followerBeat = calculateFollowerBeat(
      master.currentBeatIndex,
      follower.totalBeats
    );
    follower.goToBeat(followerBeat);
  }

  /**
   * Sync follower playback state to master
   */
  function syncFollowerPlayback() {
    if (!isSyncEnabled) return;
    const master = getMaster();
    const follower = getFollower();

    if (master.isPlaying && !follower.isPlaying) {
      follower.play();
    } else if (!master.isPlaying && follower.isPlaying) {
      follower.pause();
    }
  }

  // Create effects in a root scope (allows creation outside component init)
  cleanupEffects = $effect.root(() => {
    // Watch master's beat changes and sync follower
    $effect(() => {
      if (!isSyncEnabled) return;

      const master = getMaster();
      const currentMasterBeat = master.currentBeatIndex;

      // Only sync when beat actually changes
      if (currentMasterBeat !== prevMasterBeat) {
        prevMasterBeat = currentMasterBeat;
        syncFollowerBeat();
      }
    });

    // Watch master's playing state and sync follower
    $effect(() => {
      if (!isSyncEnabled) return;

      const master = getMaster();
      // Access isPlaying to establish dependency
      const _playing = master.isPlaying;
      syncFollowerPlayback();
    });

    // When sync is enabled, immediately sync state
    $effect(() => {
      if (isSyncEnabled) {
        const master = getMaster();
        prevMasterBeat = master.currentBeatIndex;
        syncFollowerBeat();
        syncFollowerPlayback();
      }
    });
  });

  /**
   * Toggle sync on/off
   */
  function toggleSync() {
    isSyncEnabled = !isSyncEnabled;
    if (isSyncEnabled) {
      // Sync immediately when enabled
      const master = getMaster();
      prevMasterBeat = master.currentBeatIndex;
      syncFollowerBeat();
      syncFollowerPlayback();
    }
  }

  /**
   * Set beat offset (-8 to +8)
   */
  function setOffset(offset: number) {
    beatOffset = Math.max(MIN_OFFSET, Math.min(MAX_OFFSET, offset));
    if (isSyncEnabled) {
      syncFollowerBeat();
    }
  }

  /**
   * Increment offset by 1
   */
  function incrementOffset() {
    setOffset(beatOffset + 1);
  }

  /**
   * Decrement offset by 1
   */
  function decrementOffset() {
    setOffset(beatOffset - 1);
  }

  /**
   * Swap which avatar is master
   */
  function swapMaster() {
    masterAvatarId = masterAvatarId === "avatar1" ? "avatar2" : "avatar1";
    prevMasterBeat = -1; // Reset to trigger sync
    if (isSyncEnabled) {
      syncFollowerBeat();
      syncFollowerPlayback();
    }
  }

  /**
   * Get offset description for UI
   */
  function getOffsetDescription(): string {
    const followerName = masterAvatarId === "avatar1" ? "Avatar 2" : "Avatar 1";
    if (beatOffset === 0) {
      return `${followerName} is in sync`;
    } else if (beatOffset > 0) {
      return `${followerName} is ${beatOffset} beat${beatOffset !== 1 ? "s" : ""} ahead`;
    } else {
      const absOffset = Math.abs(beatOffset);
      return `${followerName} is ${absOffset} beat${absOffset !== 1 ? "s" : ""} behind`;
    }
  }

  /**
   * Cleanup effects when no longer needed
   */
  function destroy() {
    if (cleanupEffects) {
      cleanupEffects();
      cleanupEffects = null;
    }
  }

  return {
    // Config getters
    get isSyncEnabled() {
      return isSyncEnabled;
    },
    get masterAvatarId() {
      return masterAvatarId;
    },
    get beatOffset() {
      return beatOffset;
    },

    // Derived state
    get master() {
      return getMaster();
    },
    get follower() {
      return getFollower();
    },
    get offsetDescription() {
      return getOffsetDescription();
    },

    // Constants
    minOffset: MIN_OFFSET,
    maxOffset: MAX_OFFSET,

    // Actions
    toggleSync,
    setOffset,
    incrementOffset,
    decrementOffset,
    swapMaster,
    destroy,
  };
}

export type AvatarSyncState = ReturnType<typeof createAvatarSyncState>;
