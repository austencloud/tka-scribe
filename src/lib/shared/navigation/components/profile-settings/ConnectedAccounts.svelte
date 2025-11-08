<!--
  ConnectedAccounts Component

  Displays the list of OAuth providers connected to the user's account.
  Shows provider icons, names, and associated emails.
-->
<script lang="ts">
  import { authStore } from "$shared/auth";
</script>

<div class="connected-accounts">
  <!-- Firebase Auth Providers (Google, Facebook) -->
  {#if authStore.user?.providerData && authStore.user.providerData.length > 0}
    <div class="section">
      <h4 class="section-title">Authentication Providers</h4>
      <div class="providers">
        {#each authStore.user.providerData as provider}
          <div class="provider">
            <i
              class="fab fa-{provider.providerId === 'google.com'
                ? 'google'
                : 'facebook'}"
            ></i>
            <span class="provider-name"
              >{provider.providerId === "google.com"
                ? "Google"
                : "Facebook"}</span
            >
            <span class="provider-email">{provider.email}</span>
          </div>
        {/each}
      </div>
    </div>
  {/if}

  {#if !authStore.user?.providerData?.length}
    <p class="hint">No connected accounts</p>
  {/if}
</div>

<style>
  .connected-accounts {
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: 2rem;
  }

  .section {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .section-title {
    margin: 0;
    font-size: 0.95rem;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.7);
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .providers {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .provider {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 14px 16px;
    background: rgba(255, 255, 255, 0.04);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 10px;
    transition: all 0.2s ease;
    min-width: 0;
  }

  .provider:hover {
    background: rgba(255, 255, 255, 0.06);
    border-color: rgba(255, 255, 255, 0.12);
  }

  .provider i {
    font-size: 20px;
    color: rgba(99, 102, 241, 0.8);
    flex-shrink: 0;
  }

  .provider-name {
    font-weight: 500;
    color: rgba(255, 255, 255, 0.9);
    flex-shrink: 0;
  }

  .provider-email {
    margin-left: auto;
    font-size: 13px;
    color: rgba(255, 255, 255, 0.6);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    min-width: 0;
    flex-shrink: 1;
  }

  .hint {
    font-size: 14px;
    color: rgba(255, 255, 255, 0.5);
    text-align: center;
    margin: 0;
    padding: 16px;
  }

  /* Accessibility - Reduced Motion */
  @media (prefers-reduced-motion: reduce) {
    .provider {
      transition: none;
    }
  }
</style>
