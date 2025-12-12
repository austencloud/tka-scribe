<!-- NoChangelogState - Empty state when no changelog exists -->
<script lang="ts">
</script>

<section class="no-changelog-section">
  <div class="no-changelog-content">
    <i class="fas fa-clipboard-list"></i>
    <h3>No Changelog Available</h3>
    <p>Detailed changes for this version weren't recorded.</p>
  </div>
</section>

<style>
  .no-changelog-section {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .no-changelog-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    padding: 32px;
  }

  .no-changelog-content i {
    font-size: 50px;
    color: var(--theme-stroke, rgba(255, 255, 255, 0.15));
    margin-bottom: 16px;
  }

  .no-changelog-content h3 {
    margin: 0 0 8px 0;
    font-size: 16px;
    font-weight: 600;
    color: var(--theme-text, rgba(255, 255, 255, 0.7));
  }

  .no-changelog-content p {
    margin: 0;
    font-size: 14px;
    color: var(--theme-text-dim, rgba(255, 255, 255, 0.5));
  }
</style>
