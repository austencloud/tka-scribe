<!--
  ConnectedAccounts Component

  Displays the list of OAuth providers connected to the user's account.
  Shows provider icons, names, and associated emails.
-->
<script lang="ts">
  import { authStore } from "$shared/auth";
</script>

<div class="connected-accounts">
  <h4 class="subsection-title">Connected Accounts</h4>
  {#if authStore.user?.providerData && authStore.user.providerData.length > 0}
    <div class="providers">
      {#each authStore.user.providerData as provider}
        <div class="provider">
          <i
            class="fab fa-{provider.providerId === 'google.com'
              ? 'google'
              : provider.providerId}"
          ></i>
          <span
            >{provider.providerId === "google.com"
              ? "Google"
              : provider.providerId}</span
          >
          <span class="provider-email">{provider.email}</span>
        </div>
      {/each}
    </div>
  {:else}
    <p class="hint">No connected accounts</p>
  {/if}
</div>

<style>
  .connected-accounts {
    margin-top: 0;
    padding-top: 0;
  }

  .subsection-title {
    font-size: 15px;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.9);
    margin: 0 0 12px 0;
  }

  .providers {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .provider {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 16px;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 8px;
  }

  .provider i {
    font-size: 20px;
    color: rgba(255, 255, 255, 0.7);
  }

  .provider-email {
    margin-left: auto;
    font-size: 13px;
    color: rgba(255, 255, 255, 0.6);
  }

  .hint {
    font-size: 13px;
    color: rgba(255, 255, 255, 0.5);
    margin: 6px 0 0 0;
  }
</style>
