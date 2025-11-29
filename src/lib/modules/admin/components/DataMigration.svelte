<!--
  DataMigration.svelte - Admin tool for migrating data

  Provides utilities for:
  - Seeding static gallery sequences to Firestore Library
-->
<script lang="ts">
import { TYPES } from "$lib/shared/inversify/types";
  import { tryResolve } from "$lib/shared/inversify";
  import type { ILibraryService } from "../../library/services/contracts";
import type { SequenceData } from "$lib/shared/foundation/domain/models/SequenceData";
  import { authStore } from "$lib/shared/auth/stores/authStore.svelte.ts";

  // State
  let isMigrating = $state(false);
  let migrationResult = $state<{
    success: boolean;
    message: string;
    migrated: number;
    skipped: number;
    errors: string[];
  } | null>(null);

  /**
   * Load sequences from static sequence-index.json (the Gallery source)
   */
  async function loadStaticGallerySequences(): Promise<SequenceData[]> {
    try {
      const response = await fetch("/sequence-index.json");
      if (!response.ok) {
        throw new Error(`Failed to fetch: ${response.status}`);
      }
      const data = await response.json();
      const sequences = data.sequences || [];

      // Map raw sequences to SequenceData format
      return sequences.map((raw: any) => ({
        id: raw.word || raw.id || crypto.randomUUID(),
        name: raw.name || raw.word || "Unnamed",
        word: raw.word || raw.name || "",
        beats: [], // Will be loaded lazily
        thumbnails: raw.thumbnails || [],
        isFavorite: false,
        isCircular: raw.isCircular || false,
        tags: raw.tags || [],
        metadata: raw.metadata || {},
        author: raw.author || "TKA Dictionary",
        gridMode: raw.gridMode || "box",
        difficultyLevel: raw.difficultyLevel || "beginner",
        sequenceLength: raw.sequenceLength || 0,
        level: raw.level || 1,
        dateAdded: raw.dateAdded ? new Date(raw.dateAdded) : new Date(),
        propType: raw.propType || "Staff",
        startingPositionGroup: raw.startingPosition || "alpha",
      }));
    } catch (error) {
      console.error("Failed to load static gallery sequences:", error);
      return [];
    }
  }

  /**
   * Seed all static gallery sequences to Firestore Library
   */
  async function seedGalleryToLibrary() {
    if (!authStore.effectiveUserId) {
      migrationResult = {
        success: false,
        message: "You must be logged in to seed sequences",
        migrated: 0,
        skipped: 0,
        errors: ["Not authenticated"],
      };
      return;
    }

    const libraryService = tryResolve<ILibraryService>(TYPES.ILibraryService);
    if (!libraryService) {
      migrationResult = {
        success: false,
        message: "Library service not available. Try refreshing the page.",
        migrated: 0,
        skipped: 0,
        errors: ["ILibraryService not resolved"],
      };
      return;
    }

    isMigrating = true;
    migrationResult = null;

    const sequences = await loadStaticGallerySequences();
    console.log(`Found ${sequences.length} sequences in static gallery`);

    if (sequences.length === 0) {
      migrationResult = {
        success: false,
        message: "No sequences found in static gallery",
        migrated: 0,
        skipped: 0,
        errors: ["sequence-index.json is empty or missing"],
      };
      isMigrating = false;
      return;
    }

    let migrated = 0;
    let skipped = 0;
    const errors: string[] = [];

    for (const sequence of sequences) {
      try {
        // Save to Firestore via LibraryService
        await libraryService.saveSequence(sequence);
        migrated++;
        console.log(`Seeded: ${sequence.name || sequence.word || sequence.id}`);
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error);

        // Check if it's a duplicate (already exists)
        if (errorMsg.includes("ALREADY_EXISTS")) {
          skipped++;
          console.log(`Skipped (exists): ${sequence.name || sequence.word || sequence.id}`);
        } else {
          errors.push(`${sequence.name || sequence.id}: ${errorMsg}`);
          console.error(`Failed to seed ${sequence.id}:`, error);
        }
      }
    }

    migrationResult = {
      success: errors.length === 0,
      message: errors.length === 0
        ? `Successfully seeded ${migrated} sequences to your Library!`
        : `Seeding completed with ${errors.length} errors`,
      migrated,
      skipped,
      errors,
    };

    isMigrating = false;
  }

  /**
   * Preview what would be seeded
   */
  async function previewSeeding() {
    const sequences = await loadStaticGallerySequences();
    console.log("=== Seeding Preview ===");
    console.log(`Total sequences: ${sequences.length}`);
    sequences.forEach((seq, i) => {
      console.log(`${i + 1}. ${seq.name || seq.word || "Unnamed"} (${seq.id})`);
    });
    console.log("=======================");

    migrationResult = {
      success: true,
      message: `Found ${sequences.length} sequences in static gallery. Check console for details.`,
      migrated: 0,
      skipped: 0,
      errors: [],
    };
  }
</script>

<div class="data-migration">
  <div class="section-header">
    <h2><i class="fas fa-database"></i> Data Migration</h2>
    <p class="description">Seed gallery sequences to your Firestore Library</p>
  </div>

  <div class="migration-card">
    <h3>Seed Static Gallery to Library</h3>
    <p>
      This will copy all sequences from the static gallery (sequence-index.json)
      to your Firestore Library, attributing them to your account.
    </p>

    <div class="user-info">
      <i class="fas fa-user"></i>
      <span>
        {#if authStore.effectiveUserId}
          Logged in as: <strong>{authStore.user?.displayName || authStore.effectiveUserId}</strong>
        {:else}
          <span class="warning">Not logged in</span>
        {/if}
      </span>
    </div>

    <div class="button-row">
      <button
        class="preview-btn"
        onclick={previewSeeding}
        disabled={isMigrating}
      >
        <i class="fas fa-eye"></i>
        Preview
      </button>

      <button
        class="migrate-btn"
        onclick={seedGalleryToLibrary}
        disabled={isMigrating || !authStore.effectiveUserId}
      >
        {#if isMigrating}
          <i class="fas fa-spinner fa-spin"></i>
          Seeding...
        {:else}
          <i class="fas fa-cloud-upload-alt"></i>
          Seed to Library
        {/if}
      </button>
    </div>

    {#if migrationResult}
      <div class="result" class:success={migrationResult.success} class:error={!migrationResult.success}>
        <div class="result-header">
          <i class="fas {migrationResult.success ? 'fa-check-circle' : 'fa-exclamation-triangle'}"></i>
          <span>{migrationResult.message}</span>
        </div>

        {#if migrationResult.migrated > 0 || migrationResult.skipped > 0}
          <div class="result-stats">
            <span class="stat">
              <i class="fas fa-check"></i> {migrationResult.migrated} migrated
            </span>
            <span class="stat">
              <i class="fas fa-forward"></i> {migrationResult.skipped} skipped
            </span>
          </div>
        {/if}

        {#if migrationResult.errors.length > 0}
          <div class="errors">
            <strong>Errors:</strong>
            <ul>
              {#each migrationResult.errors as error}
                <li>{error}</li>
              {/each}
            </ul>
          </div>
        {/if}
      </div>
    {/if}
  </div>
</div>

<style>
  .data-migration {
    padding: 1.5rem;
    max-width: 800px;
  }

  .section-header {
    margin-bottom: 1.5rem;
  }

  .section-header h2 {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin: 0 0 0.5rem 0;
    font-size: 1.5rem;
    color: #fff;
  }

  .section-header h2 i {
    color: #10b981;
  }

  .description {
    margin: 0;
    color: rgba(255, 255, 255, 0.6);
    font-size: 0.9rem;
  }

  .migration-card {
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 12px;
    padding: 1.5rem;
  }

  .migration-card h3 {
    margin: 0 0 0.75rem 0;
    font-size: 1.1rem;
    color: #fff;
  }

  .migration-card > p {
    margin: 0 0 1rem 0;
    color: rgba(255, 255, 255, 0.7);
    font-size: 0.9rem;
    line-height: 1.5;
  }

  .user-info {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.75rem 1rem;
    background: rgba(255, 255, 255, 0.05);
    border-radius: 8px;
    margin-bottom: 1rem;
    font-size: 0.9rem;
    color: rgba(255, 255, 255, 0.8);
  }

  .user-info i {
    color: #10b981;
  }

  .user-info .warning {
    color: #f59e0b;
  }

  .button-row {
    display: flex;
    gap: 0.75rem;
    margin-bottom: 1rem;
  }

  .preview-btn,
  .migrate-btn {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.75rem 1.25rem;
    border: none;
    border-radius: 8px;
    font-size: 0.9rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .preview-btn {
    background: rgba(255, 255, 255, 0.1);
    color: #fff;
  }

  .preview-btn:hover:not(:disabled) {
    background: rgba(255, 255, 255, 0.15);
  }

  .migrate-btn {
    background: linear-gradient(135deg, #10b981 0%, #059669 100%);
    color: #fff;
  }

  .migrate-btn:hover:not(:disabled) {
    background: linear-gradient(135deg, #34d399 0%, #10b981 100%);
    transform: translateY(-1px);
  }

  .preview-btn:disabled,
  .migrate-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }

  .result {
    padding: 1rem;
    border-radius: 8px;
    margin-top: 1rem;
  }

  .result.success {
    background: rgba(16, 185, 129, 0.1);
    border: 1px solid rgba(16, 185, 129, 0.3);
  }

  .result.error {
    background: rgba(239, 68, 68, 0.1);
    border: 1px solid rgba(239, 68, 68, 0.3);
  }

  .result-header {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-weight: 500;
  }

  .result.success .result-header i {
    color: #10b981;
  }

  .result.error .result-header i {
    color: #ef4444;
  }

  .result-stats {
    display: flex;
    gap: 1rem;
    margin-top: 0.75rem;
    font-size: 0.85rem;
    color: rgba(255, 255, 255, 0.7);
  }

  .stat {
    display: flex;
    align-items: center;
    gap: 0.25rem;
  }

  .errors {
    margin-top: 0.75rem;
    font-size: 0.85rem;
  }

  .errors ul {
    margin: 0.5rem 0 0 1rem;
    padding: 0;
    color: rgba(255, 255, 255, 0.7);
  }

  .errors li {
    margin-bottom: 0.25rem;
  }
</style>
