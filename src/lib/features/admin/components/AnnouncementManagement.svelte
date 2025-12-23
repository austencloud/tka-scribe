<!--
  AnnouncementManagement - Admin Interface for System Announcements

  Allows admins to create, edit, and manage system-wide announcements.
-->
<script lang="ts">
  import { onMount } from "svelte";
  import { resolve } from "$lib/shared/inversify/di";
  import { TYPES } from "$lib/shared/inversify/types";
  import type { IAnnouncementService } from "../services/contracts/IAnnouncementService";
  import type { Announcement } from "../domain/models/announcement-models";
  import AnnouncementForm from "./announcements/AnnouncementForm.svelte";
  import AnnouncementList from "./announcements/AnnouncementList.svelte";

  // Services
  let announcementService: IAnnouncementService | null = null;

  // State
  let announcements = $state<Announcement[]>([]);
  let selectedAnnouncement = $state<Announcement | null>(null);
  let isLoading = $state(true);
  let showForm = $state(false);

  onMount(async () => {
    try {
      announcementService = resolve<IAnnouncementService>(
        TYPES.IAnnouncementService
      );
      await loadAnnouncements();
    } catch (error) {
      console.error("Failed to initialize announcement service:", error);
    } finally {
      isLoading = false;
    }
  });

  async function loadAnnouncements() {
    if (!announcementService) return;
    try {
      isLoading = true;
      announcements = await announcementService.getAllAnnouncements();
    } catch (error) {
      console.error("Failed to load announcements:", error);
    } finally {
      isLoading = false;
    }
  }

  function handleCreateNew() {
    selectedAnnouncement = null;
    showForm = true;
  }

  function handleEdit(announcement: Announcement) {
    selectedAnnouncement = announcement;
    showForm = true;
  }

  async function handleDelete(announcementId: string) {
    if (!announcementService) return;
    if (!confirm("Are you sure you want to delete this announcement?")) return;

    try {
      await announcementService.deleteAnnouncement(announcementId);
      await loadAnnouncements();
    } catch (error) {
      console.error("Failed to delete announcement:", error);
    }
  }

  async function handleSave() {
    showForm = false;
    selectedAnnouncement = null;
    await loadAnnouncements();
  }

  function handleCancel() {
    showForm = false;
    selectedAnnouncement = null;
  }
</script>

<div class="announcement-management">
  {#if isLoading}
    <div class="loading-state">
      <i class="fas fa-spinner fa-spin"></i>
      <p>Loading announcements...</p>
    </div>
  {:else if showForm}
    <AnnouncementForm
      announcement={selectedAnnouncement}
      onSave={handleSave}
      onCancel={handleCancel}
    />
  {:else}
    <div class="management-header">
      <h2>System Announcements</h2>
      <button class="create-button" onclick={handleCreateNew}>
        <i class="fas fa-plus"></i>
        Create Announcement
      </button>
    </div>

    <AnnouncementList
      {announcements}
      onEdit={handleEdit}
      onDelete={handleDelete}
    />
  {/if}
</div>

<style>
  .announcement-management {
    display: flex;
    flex-direction: column;
    height: 100%;
    padding: 24px;
    overflow-y: auto;
  }

  /* ============================================================================
     LOADING STATE
     ============================================================================ */
  .loading-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 16px;
    padding: 48px;
    color: rgba(255, 255, 255, 0.5);
  }

  .loading-state i {
    font-size: 32px;
  }

  /* ============================================================================
     HEADER
     ============================================================================ */
  .management-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 24px;
  }

  .management-header h2 {
    font-size: 24px;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.95);
    margin: 0;
  }

  .create-button {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 12px 20px;
    background: linear-gradient(
      135deg,
      color-mix(in srgb, var(--theme-accent, #6366f1) 120%, white) 0%,
      var(--theme-accent, #6366f1) 100%
    );
    border: none;
    border-radius: 10px;
    color: white;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .create-button:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 16px
      color-mix(in srgb, var(--theme-accent, #6366f1) 40%, transparent);
  }

  .create-button:active {
    transform: translateY(0);
  }

  /* ============================================================================
     SCROLLBAR
     ============================================================================ */
  .announcement-management::-webkit-scrollbar {
    width: 8px;
  }

  .announcement-management::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.03);
    border-radius: 4px;
  }

  .announcement-management::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.15);
    border-radius: 4px;
  }

  .announcement-management::-webkit-scrollbar-thumb:hover {
    background: rgba(255, 255, 255, 0.25);
  }

  /* ============================================================================
     RESPONSIVE
     ============================================================================ */
  @media (max-width: 640px) {
    .announcement-management {
      padding: 16px;
    }

    .management-header {
      flex-direction: column;
      align-items: stretch;
      gap: 12px;
    }

    .management-header h2 {
      font-size: 20px;
    }
  }
</style>
