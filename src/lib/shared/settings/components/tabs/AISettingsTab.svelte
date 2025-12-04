<!--
  AISettingsTab.svelte - AI Analysis Settings (Admin Only)

  Configures AI-powered feedback analysis settings:
  - Provider selection (Ollama, Claude, OpenAI)
  - Provider-specific configuration
  - API key management
  - Connection testing
-->
<script lang="ts">
  import { onMount } from "svelte";
  import UnifiedHeader from "../UnifiedHeader.svelte";
  import { getAISettingsService } from "$lib/features/feedback/services/implementations/AISettingsService";
  import type { AIAnalysisSettings, AIProviderType } from "$lib/features/feedback/domain/models/ai-settings-models";
  import {
    CLAUDE_MODELS,
    OPENAI_MODELS,
    DEFAULT_AI_SETTINGS,
  } from "$lib/features/feedback/domain/models/ai-settings-models";
  import type { ProviderConnectionTest } from "$lib/features/feedback/services/contracts/IAIProviderService";

  interface Props {
    onSettingUpdate?: (event: { key: string; value: unknown }) => void;
  }

  let { onSettingUpdate }: Props = $props();

  // State
  let settings: AIAnalysisSettings = $state({ ...DEFAULT_AI_SETTINGS });
  let loading = $state(true);
  let saving = $state(false);
  let testingConnection = $state(false);
  let connectionResult = $state<ProviderConnectionTest | null>(null);

  // API key inputs
  let claudeApiKey = $state("");
  let openaiApiKey = $state("");
  let showClaudeKey = $state(false);
  let showOpenAIKey = $state(false);

  // Ollama models (dynamically fetched)
  let ollamaModels = $state<{ id: string; name: string; size: string; parameterSize?: string }[]>([]);
  let ollamaModelsLoading = $state(false);
  let ollamaModelsError = $state<string | null>(null);

  // Services
  const settingsService = getAISettingsService();

  onMount(async () => {
    try {
      settings = await settingsService.getSettings();

      // Check if API keys exist (don't load actual keys for security)
      const hasClaudeKey = await settingsService.hasApiKey("claude");
      const hasOpenAIKey = await settingsService.hasApiKey("openai");
      claudeApiKey = hasClaudeKey ? "••••••••••••••••••••" : "";
      openaiApiKey = hasOpenAIKey ? "••••••••••••••••••••" : "";

      // Fetch Ollama models if Ollama is the default provider
      if (settings.enabled && settings.defaultProvider === "ollama") {
        fetchOllamaModels();
      }
    } catch (error) {
      console.error("Failed to load AI settings:", error);
    } finally {
      loading = false;
    }
  });

  async function saveSettings() {
    saving = true;
    try {
      await settingsService.saveSettings(settings);
      onSettingUpdate?.({ key: "aiSettings", value: settings });
    } catch (error) {
      console.error("Failed to save AI settings:", error);
    } finally {
      saving = false;
    }
  }

  async function handleProviderChange(provider: AIProviderType) {
    settings.defaultProvider = provider;
    connectionResult = null;
    await saveSettings();

    // Fetch Ollama models when switching to Ollama
    if (provider === "ollama") {
      fetchOllamaModels();
    }
  }

  async function handleEnabledChange(enabled: boolean) {
    settings.enabled = enabled;
    await saveSettings();
  }

  async function handleClaudeCodePromptsChange(enabled: boolean) {
    settings.generateClaudeCodePrompts = enabled;
    await saveSettings();
  }

  async function handleMaxRoundsChange(event: Event) {
    const target = event.target as HTMLSelectElement;
    settings.maxClarificationRounds = parseInt(target.value, 10);
    await saveSettings();
  }

  async function handleOllamaBaseUrlChange(event: Event) {
    const target = event.target as HTMLInputElement;
    settings.ollama.baseUrl = target.value;
    await saveSettings();
  }

  async function handleOllamaModelChange(event: Event) {
    const target = event.target as HTMLSelectElement;
    settings.ollama.modelId = target.value;
    await saveSettings();
  }

  async function handleClaudeModelChange(event: Event) {
    const target = event.target as HTMLSelectElement;
    settings.claude.modelId = target.value;
    await saveSettings();
  }

  async function handleOpenAIModelChange(event: Event) {
    const target = event.target as HTMLSelectElement;
    settings.openai.modelId = target.value;
    await saveSettings();
  }

  async function saveClaudeApiKey() {
    if (!claudeApiKey || claudeApiKey.startsWith("••")) return;
    saving = true;
    try {
      await settingsService.saveApiKey("claude", claudeApiKey);
      claudeApiKey = "••••••••••••••••••••";
      showClaudeKey = false;
    } catch (error) {
      console.error("Failed to save Claude API key:", error);
    } finally {
      saving = false;
    }
  }

  async function saveOpenAIApiKey() {
    if (!openaiApiKey || openaiApiKey.startsWith("••")) return;
    saving = true;
    try {
      await settingsService.saveApiKey("openai", openaiApiKey);
      openaiApiKey = "••••••••••••••••••••";
      showOpenAIKey = false;
    } catch (error) {
      console.error("Failed to save OpenAI API key:", error);
    } finally {
      saving = false;
    }
  }

  async function deleteClaudeApiKey() {
    if (!confirm("Delete Claude API key?")) return;
    saving = true;
    try {
      await settingsService.deleteApiKey("claude");
      claudeApiKey = "";
    } catch (error) {
      console.error("Failed to delete Claude API key:", error);
    } finally {
      saving = false;
    }
  }

  async function deleteOpenAIApiKey() {
    if (!confirm("Delete OpenAI API key?")) return;
    saving = true;
    try {
      await settingsService.deleteApiKey("openai");
      openaiApiKey = "";
    } catch (error) {
      console.error("Failed to delete OpenAI API key:", error);
    } finally {
      saving = false;
    }
  }

  async function testConnection() {
    testingConnection = true;
    connectionResult = null;
    try {
      connectionResult = await settingsService.testProvider(settings.defaultProvider);
    } catch (error) {
      connectionResult = {
        success: false,
        message: error instanceof Error ? error.message : "Test failed",
      };
    } finally {
      testingConnection = false;
    }
  }

  function clearApiKeyInput(provider: "claude" | "openai") {
    if (provider === "claude") {
      claudeApiKey = "";
    } else {
      openaiApiKey = "";
    }
  }

  async function fetchOllamaModels() {
    ollamaModelsLoading = true;
    ollamaModelsError = null;
    try {
      const models = await settingsService.getInstalledOllamaModels();
      ollamaModels = models;

      // If current model isn't in the list, select the first one
      const firstModel = models[0];
      if (firstModel && !models.some(m => m.id === settings.ollama.modelId)) {
        settings.ollama.modelId = firstModel.id;
        await saveSettings();
      }
    } catch (error) {
      console.error("Failed to fetch Ollama models:", error);
      ollamaModelsError = error instanceof Error ? error.message : "Failed to fetch models";
      ollamaModels = [];
    } finally {
      ollamaModelsLoading = false;
    }
  }
</script>

<div class="ai-settings-tab">
  {#if loading}
    <div class="loading-state">
      <i class="fas fa-spinner fa-spin"></i>
      <span>Loading AI settings...</span>
    </div>
  {:else}
    <!-- Enable Toggle -->
    <div class="setting-card">
      <UnifiedHeader
        title="AI Analysis"
        icon="fas fa-robot"
        description="Enable AI-powered feedback interpretation and clarification"
      />
      <div class="toggle-row">
        <span class="toggle-label" id="enable-ai-label">Enable AI Analysis</span>
        <button
          class="toggle-button"
          class:active={settings.enabled}
          onclick={() => handleEnabledChange(!settings.enabled)}
          aria-pressed={settings.enabled}
          aria-labelledby="enable-ai-label"
          disabled={saving}
        >
          <span class="toggle-track">
            <span class="toggle-thumb"></span>
          </span>
        </button>
      </div>
    </div>

    {#if settings.enabled}
      <!-- Provider Selection -->
      <div class="setting-card">
        <UnifiedHeader
          title="AI Provider"
          icon="fas fa-server"
          description="Select your preferred AI provider for analysis"
        />
        <div class="provider-grid">
          <button
            class="provider-option"
            class:selected={settings.defaultProvider === "ollama"}
            onclick={() => handleProviderChange("ollama")}
            disabled={saving}
          >
            <i class="fas fa-cube"></i>
            <span class="provider-name">Ollama</span>
            <span class="provider-desc">Local AI</span>
          </button>
          <button
            class="provider-option"
            class:selected={settings.defaultProvider === "claude"}
            onclick={() => handleProviderChange("claude")}
            disabled={saving}
          >
            <i class="fas fa-comment-alt"></i>
            <span class="provider-name">Claude</span>
            <span class="provider-desc">Anthropic API</span>
          </button>
          <button
            class="provider-option"
            class:selected={settings.defaultProvider === "openai"}
            onclick={() => handleProviderChange("openai")}
            disabled={saving}
          >
            <i class="fas fa-brain"></i>
            <span class="provider-name">OpenAI</span>
            <span class="provider-desc">GPT API</span>
          </button>
        </div>
      </div>

      <!-- Provider-specific Config -->
      {#if settings.defaultProvider === "ollama"}
        <div class="setting-card">
          <UnifiedHeader
            title="Ollama Configuration"
            icon="fas fa-cog"
            description="Configure your local Ollama instance"
          />
          <div class="config-form">
            <div class="form-group">
              <label for="ollama-url">Base URL</label>
              <input
                type="url"
                id="ollama-url"
                value={settings.ollama.baseUrl}
                oninput={handleOllamaBaseUrlChange}
                placeholder="http://localhost:11434"
                disabled={saving}
              />
            </div>
            <div class="form-group">
              <label for="ollama-model">Model</label>
              <div class="model-select-row">
                {#if ollamaModelsLoading}
                  <div class="model-loading">
                    <i class="fas fa-spinner fa-spin"></i>
                    <span>Detecting models...</span>
                  </div>
                {:else if ollamaModelsError}
                  <div class="model-error">
                    <i class="fas fa-exclamation-triangle"></i>
                    <span>{ollamaModelsError}</span>
                  </div>
                {:else if ollamaModels.length === 0}
                  <div class="model-empty">
                    <i class="fas fa-info-circle"></i>
                    <span>No models installed. Run <code>ollama pull llama3.2</code> to install a model.</span>
                  </div>
                {:else}
                  <select
                    id="ollama-model"
                    value={settings.ollama.modelId}
                    onchange={handleOllamaModelChange}
                    disabled={saving}
                  >
                    {#each ollamaModels as model}
                      <option value={model.id}>
                        {model.name} ({model.size}{model.parameterSize ? ` • ${model.parameterSize}` : ''})
                      </option>
                    {/each}
                  </select>
                {/if}
                <button
                  class="refresh-models-button"
                  onclick={fetchOllamaModels}
                  disabled={ollamaModelsLoading || saving}
                  title="Refresh model list"
                  aria-label="Refresh model list"
                >
                  <i class="fas {ollamaModelsLoading ? 'fa-spinner fa-spin' : 'fa-sync-alt'}"></i>
                </button>
              </div>
            </div>
          </div>
        </div>
      {:else if settings.defaultProvider === "claude"}
        <div class="setting-card">
          <UnifiedHeader
            title="Claude Configuration"
            icon="fas fa-key"
            description="Configure your Anthropic Claude API access"
          />
          <div class="config-form">
            <div class="form-group">
              <label for="claude-model">Model</label>
              <select
                id="claude-model"
                value={settings.claude.modelId}
                onchange={handleClaudeModelChange}
                disabled={saving}
              >
                {#each CLAUDE_MODELS as model}
                  <option value={model.id}>{model.name}</option>
                {/each}
              </select>
            </div>
            <div class="form-group">
              <label for="claude-key">API Key</label>
              <div class="api-key-input">
                <input
                  type={showClaudeKey ? "text" : "password"}
                  id="claude-key"
                  bind:value={claudeApiKey}
                  onfocus={() => { if (claudeApiKey.startsWith("••")) clearApiKeyInput("claude"); }}
                  placeholder="sk-ant-..."
                  disabled={saving}
                />
                <button
                  class="key-toggle"
                  onclick={() => (showClaudeKey = !showClaudeKey)}
                  type="button"
                  aria-label={showClaudeKey ? "Hide API key" : "Show API key"}
                >
                  <i class="fas {showClaudeKey ? 'fa-eye-slash' : 'fa-eye'}"></i>
                </button>
              </div>
              <div class="key-actions">
                <button
                  class="save-key-button"
                  onclick={saveClaudeApiKey}
                  disabled={saving || !claudeApiKey || claudeApiKey.startsWith("••")}
                >
                  <i class="fas fa-save"></i>
                  Save Key
                </button>
                {#if claudeApiKey && claudeApiKey.startsWith("••")}
                  <button
                    class="delete-key-button"
                    onclick={deleteClaudeApiKey}
                    disabled={saving}
                  >
                    <i class="fas fa-trash"></i>
                    Delete
                  </button>
                {/if}
              </div>
            </div>
          </div>
        </div>
      {:else if settings.defaultProvider === "openai"}
        <div class="setting-card">
          <UnifiedHeader
            title="OpenAI Configuration"
            icon="fas fa-key"
            description="Configure your OpenAI API access"
          />
          <div class="config-form">
            <div class="form-group">
              <label for="openai-model">Model</label>
              <select
                id="openai-model"
                value={settings.openai.modelId}
                onchange={handleOpenAIModelChange}
                disabled={saving}
              >
                {#each OPENAI_MODELS as model}
                  <option value={model.id}>{model.name}</option>
                {/each}
              </select>
            </div>
            <div class="form-group">
              <label for="openai-key">API Key</label>
              <div class="api-key-input">
                <input
                  type={showOpenAIKey ? "text" : "password"}
                  id="openai-key"
                  bind:value={openaiApiKey}
                  onfocus={() => { if (openaiApiKey.startsWith("••")) clearApiKeyInput("openai"); }}
                  placeholder="sk-..."
                  disabled={saving}
                />
                <button
                  class="key-toggle"
                  onclick={() => (showOpenAIKey = !showOpenAIKey)}
                  type="button"
                  aria-label={showOpenAIKey ? "Hide API key" : "Show API key"}
                >
                  <i class="fas {showOpenAIKey ? 'fa-eye-slash' : 'fa-eye'}"></i>
                </button>
              </div>
              <div class="key-actions">
                <button
                  class="save-key-button"
                  onclick={saveOpenAIApiKey}
                  disabled={saving || !openaiApiKey || openaiApiKey.startsWith("••")}
                >
                  <i class="fas fa-save"></i>
                  Save Key
                </button>
                {#if openaiApiKey && openaiApiKey.startsWith("••")}
                  <button
                    class="delete-key-button"
                    onclick={deleteOpenAIApiKey}
                    disabled={saving}
                  >
                    <i class="fas fa-trash"></i>
                    Delete
                  </button>
                {/if}
              </div>
            </div>
          </div>
        </div>
      {/if}

      <!-- Connection Test -->
      <div class="setting-card">
        <UnifiedHeader
          title="Connection Test"
          icon="fas fa-plug"
          description="Test connection to your configured AI provider"
        />
        <div class="test-section">
          <button
            class="test-button"
            onclick={testConnection}
            disabled={testingConnection || saving}
          >
            {#if testingConnection}
              <i class="fas fa-spinner fa-spin"></i>
              Testing...
            {:else}
              <i class="fas fa-bolt"></i>
              Test Connection
            {/if}
          </button>
          {#if connectionResult}
            <div class="test-result" class:success={connectionResult.success} class:error={!connectionResult.success}>
              <i class="fas {connectionResult.success ? 'fa-check-circle' : 'fa-times-circle'}"></i>
              <span>{connectionResult.message}</span>
              {#if connectionResult.latencyMs}
                <span class="latency">({connectionResult.latencyMs}ms)</span>
              {/if}
            </div>
          {/if}
        </div>
      </div>

      <!-- Behavior Settings -->
      <div class="setting-card">
        <UnifiedHeader
          title="Analysis Behavior"
          icon="fas fa-sliders-h"
          description="Configure how AI analysis works"
        />
        <div class="config-form">
          <div class="form-group">
            <label for="max-rounds">Max Clarification Rounds</label>
            <select
              id="max-rounds"
              value={settings.maxClarificationRounds}
              onchange={handleMaxRoundsChange}
              disabled={saving}
            >
              <option value="1">1 round</option>
              <option value="2">2 rounds</option>
              <option value="3">3 rounds</option>
              <option value="5">5 rounds</option>
            </select>
            <span class="form-hint">Maximum Q&A rounds before finalizing analysis</span>
          </div>
          <div class="toggle-row">
            <span class="toggle-label" id="claude-prompts-label">Generate Claude Code Prompts</span>
            <button
              class="toggle-button"
              class:active={settings.generateClaudeCodePrompts}
              onclick={() => handleClaudeCodePromptsChange(!settings.generateClaudeCodePrompts)}
              aria-pressed={settings.generateClaudeCodePrompts}
              aria-labelledby="claude-prompts-label"
              disabled={saving}
            >
              <span class="toggle-track">
                <span class="toggle-thumb"></span>
              </span>
            </button>
          </div>
          <span class="form-hint">Create prompts for deeper Claude Code investigation</span>
        </div>
      </div>
    {/if}
  {/if}
</div>

<style>
  .ai-settings-tab {
    display: flex;
    flex-direction: column;
    gap: 24px;
    padding: 16px 0;
  }

  .loading-state {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12px;
    padding: 48px;
    color: rgba(255, 255, 255, 0.6);
  }

  .loading-state i {
    font-size: 20px;
  }

  /* Setting Card */
  .setting-card {
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 12px;
    padding: 20px;
  }

  .setting-card:hover {
    background: rgba(255, 255, 255, 0.05);
    border-color: rgba(255, 255, 255, 0.15);
  }

  /* Toggle Row */
  .toggle-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
  }

  .toggle-label {
    font-size: 14px;
    color: rgba(255, 255, 255, 0.85);
  }

  .toggle-button {
    background: transparent;
    border: none;
    padding: 0;
    cursor: pointer;
  }

  .toggle-button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .toggle-track {
    display: block;
    width: 48px;
    height: 28px;
    background: rgba(255, 255, 255, 0.15);
    border-radius: 14px;
    position: relative;
    transition: background 0.2s ease;
  }

  .toggle-button.active .toggle-track {
    background: rgba(99, 102, 241, 0.8);
  }

  .toggle-thumb {
    position: absolute;
    top: 2px;
    left: 2px;
    width: 24px;
    height: 24px;
    background: white;
    border-radius: 50%;
    transition: transform 0.2s ease;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  }

  .toggle-button.active .toggle-thumb {
    transform: translateX(20px);
  }

  /* Provider Grid */
  .provider-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 12px;
  }

  @media (max-width: 480px) {
    .provider-grid {
      grid-template-columns: 1fr;
    }
  }

  .provider-option {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    padding: 16px;
    background: rgba(255, 255, 255, 0.05);
    border: 2px solid rgba(255, 255, 255, 0.1);
    border-radius: 12px;
    cursor: pointer;
    transition: all 0.2s ease;
    color: rgba(255, 255, 255, 0.7);
  }

  .provider-option:hover:not(:disabled) {
    background: rgba(255, 255, 255, 0.08);
    border-color: rgba(255, 255, 255, 0.2);
  }

  .provider-option.selected {
    background: rgba(99, 102, 241, 0.15);
    border-color: rgba(99, 102, 241, 0.5);
    color: rgba(255, 255, 255, 0.95);
  }

  .provider-option:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .provider-option i {
    font-size: 24px;
  }

  .provider-option.selected i {
    color: rgba(99, 102, 241, 0.9);
  }

  .provider-name {
    font-size: 14px;
    font-weight: 600;
  }

  .provider-desc {
    font-size: 11px;
    opacity: 0.7;
  }

  /* Config Form */
  .config-form {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .form-group {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .form-group label {
    font-size: 13px;
    font-weight: 500;
    color: rgba(255, 255, 255, 0.7);
  }

  .form-group input,
  .form-group select {
    padding: 10px 12px;
    background: rgba(0, 0, 0, 0.2);
    border: 1px solid rgba(255, 255, 255, 0.15);
    border-radius: 8px;
    color: white;
    font-size: 14px;
    outline: none;
    transition: border-color 0.2s ease;
  }

  .form-group input:focus,
  .form-group select:focus {
    border-color: rgba(99, 102, 241, 0.5);
  }

  .form-group input:disabled,
  .form-group select:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .form-group select {
    cursor: pointer;
  }

  .form-group select option {
    background: #1a1a2e;
    color: white;
  }

  .form-hint {
    font-size: 12px;
    color: rgba(255, 255, 255, 0.5);
    margin-top: 4px;
  }

  /* Model Select Row */
  .model-select-row {
    display: flex;
    gap: 8px;
    align-items: center;
  }

  .model-select-row select {
    flex: 1;
  }

  .model-loading,
  .model-error,
  .model-empty {
    flex: 1;
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 12px;
    border-radius: 8px;
    font-size: 13px;
  }

  .model-loading {
    background: rgba(99, 102, 241, 0.1);
    border: 1px solid rgba(99, 102, 241, 0.2);
    color: rgba(99, 102, 241, 0.9);
  }

  .model-error {
    background: rgba(239, 68, 68, 0.1);
    border: 1px solid rgba(239, 68, 68, 0.2);
    color: #ef4444;
  }

  .model-empty {
    background: rgba(245, 158, 11, 0.1);
    border: 1px solid rgba(245, 158, 11, 0.2);
    color: rgba(245, 158, 11, 0.9);
  }

  .model-empty code {
    background: rgba(0, 0, 0, 0.3);
    padding: 2px 6px;
    border-radius: 4px;
    font-family: monospace;
    font-size: 12px;
  }

  .refresh-models-button {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    padding: 0;
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.15);
    border-radius: 8px;
    color: rgba(255, 255, 255, 0.7);
    cursor: pointer;
    transition: all 0.2s ease;
    flex-shrink: 0;
  }

  .refresh-models-button:hover:not(:disabled) {
    background: rgba(255, 255, 255, 0.15);
    color: white;
  }

  .refresh-models-button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  /* API Key Input */
  .api-key-input {
    display: flex;
    gap: 8px;
  }

  .api-key-input input {
    flex: 1;
    font-family: monospace;
  }

  .key-toggle {
    padding: 10px 12px;
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.15);
    border-radius: 8px;
    color: rgba(255, 255, 255, 0.7);
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .key-toggle:hover {
    background: rgba(255, 255, 255, 0.15);
    color: white;
  }

  .key-actions {
    display: flex;
    gap: 8px;
    margin-top: 8px;
  }

  .save-key-button,
  .delete-key-button {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 8px 14px;
    border-radius: 8px;
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .save-key-button {
    background: rgba(99, 102, 241, 0.2);
    border: 1px solid rgba(99, 102, 241, 0.4);
    color: rgba(99, 102, 241, 0.9);
  }

  .save-key-button:hover:not(:disabled) {
    background: rgba(99, 102, 241, 0.3);
    border-color: rgba(99, 102, 241, 0.6);
  }

  .save-key-button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .delete-key-button {
    background: rgba(239, 68, 68, 0.15);
    border: 1px solid rgba(239, 68, 68, 0.3);
    color: #ef4444;
  }

  .delete-key-button:hover:not(:disabled) {
    background: rgba(239, 68, 68, 0.25);
  }

  .delete-key-button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  /* Test Section */
  .test-section {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .test-button {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 12px 20px;
    background: rgba(99, 102, 241, 0.15);
    border: 1px solid rgba(99, 102, 241, 0.3);
    border-radius: 10px;
    color: rgba(99, 102, 241, 0.9);
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .test-button:hover:not(:disabled) {
    background: rgba(99, 102, 241, 0.25);
    border-color: rgba(99, 102, 241, 0.5);
  }

  .test-button:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .test-result {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 12px 16px;
    border-radius: 8px;
    font-size: 14px;
  }

  .test-result.success {
    background: rgba(34, 197, 94, 0.15);
    border: 1px solid rgba(34, 197, 94, 0.3);
    color: #22c55e;
  }

  .test-result.error {
    background: rgba(239, 68, 68, 0.15);
    border: 1px solid rgba(239, 68, 68, 0.3);
    color: #ef4444;
  }

  .test-result .latency {
    opacity: 0.7;
    font-size: 12px;
  }

  /* Accessibility */
  @media (prefers-reduced-motion: reduce) {
    .toggle-track,
    .toggle-thumb,
    .provider-option,
    .test-button,
    .save-key-button,
    .delete-key-button,
    .key-toggle {
      transition: none;
    }
  }

  @media (prefers-contrast: high) {
    .setting-card,
    .provider-option,
    .form-group input,
    .form-group select {
      border-width: 2px;
    }
  }
</style>
