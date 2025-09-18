<!-- ShareOptionsPanel.svelte - Share options configuration -->
<script lang="ts">
  import type { ShareOptions } from "../domain";
  import { SHARE_PRESETS } from "../domain";

  let {
    options,
    selectedPreset = 'social',
    onOptionsChange,
    onPresetSelect,
  }: {
    options?: ShareOptions;
    selectedPreset?: string;
    onOptionsChange?: (newOptions: Partial<ShareOptions>) => void;
    onPresetSelect?: (presetName: string) => void;
  } = $props();

  // Handle preset selection
  function handlePresetChange(event: Event) {
    const target = event.target as HTMLSelectElement;
    const presetName = target.value;
    onPresetSelect?.(presetName);
  }

  // Handle individual option changes
  function handleOptionChange(key: keyof ShareOptions, value: any) {
    if (!options) return;
    onOptionsChange?.({ [key]: value });
  }

  // Type-safe event handlers
  function handleSelectChange(key: keyof ShareOptions, transform?: (value: string) => any) {
    return (event: Event) => {
      const target = event.target as HTMLSelectElement;
      const value = transform ? transform(target.value) : target.value;
      handleOptionChange(key, value);
    };
  }

  function handleInputChange(key: keyof ShareOptions) {
    return (event: Event) => {
      const target = event.target as HTMLInputElement;
      handleOptionChange(key, target.value);
    };
  }

  function handleCheckboxChange(key: keyof ShareOptions) {
    return (event: Event) => {
      const target = event.target as HTMLInputElement;
      handleOptionChange(key, target.checked);
    };
  }

  // Format options
  const formatOptions = [
    { value: 'PNG', label: 'PNG (Best Quality)' },
    { value: 'JPEG', label: 'JPEG (Smaller Size)' },
    { value: 'WebP', label: 'WebP (Modern)' }
  ];

  // Quality presets
  const qualityOptions = [
    { value: 0.6, label: 'Low (60%)' },
    { value: 0.8, label: 'Medium (80%)' },
    { value: 0.9, label: 'High (90%)' },
    { value: 1.0, label: 'Maximum (100%)' }
  ];

  // Beat size presets
  const beatSizeOptions = [
    { value: 80, label: 'Small (80px)' },
    { value: 100, label: 'Medium (100px)' },
    { value: 120, label: 'Large (120px)' },
    { value: 144, label: 'Extra Large (144px)' }
  ];
</script>

<div class="share-options">
  <div class="options-header">
    <h3>Options</h3>
    <p class="options-description">Customize your image settings</p>
  </div>

  <!-- Preset Selection -->
  <div class="option-group">
    <label class="option-label">
      Preset
      <select 
        class="option-select"
        value={selectedPreset}
        onchange={handlePresetChange}
      >
        <option value="social">Social Media</option>
        <option value="print">Print Quality</option>
        <option value="web">Web Sharing</option>
        <option value="custom">Custom</option>
      </select>
    </label>
    
    {#if selectedPreset !== 'custom' && SHARE_PRESETS[selectedPreset]}
      <p class="preset-description">
        {SHARE_PRESETS[selectedPreset].description}
      </p>
    {/if}
  </div>

  {#if options}
    <!-- Format Options -->
    <div class="option-group">
      <label class="option-label">
        Format
        <select
          class="option-select"
          value={options.format}
          onchange={handleSelectChange('format')}
        >
          {#each formatOptions as format}
            <option value={format.value}>{format.label}</option>
          {/each}
        </select>
      </label>
    </div>

    <!-- Quality (for JPEG/WebP) -->
    {#if options.format === 'JPEG' || options.format === 'WebP'}
      <div class="option-group">
        <label class="option-label">
          Quality
          <select
            class="option-select"
            value={options.quality}
            onchange={handleSelectChange('quality', (v) => parseFloat(v))}
          >
            {#each qualityOptions as quality}
              <option value={quality.value}>{quality.label}</option>
            {/each}
          </select>
        </label>
      </div>
    {/if}

    <!-- Size Options -->
    <div class="option-group">
      <label class="option-label">
        Beat Size
        <select
          class="option-select"
          value={options.beatSize}
          onchange={handleSelectChange('beatSize', (v) => parseInt(v))}
        >
          {#each beatSizeOptions as size}
            <option value={size.value}>{size.label}</option>
          {/each}
        </select>
      </label>
    </div>

    <!-- Content Options -->
    <div class="option-group">
      <h4 class="group-title">Content</h4>
      
      <label class="option-checkbox">
        <input
          type="checkbox"
          checked={options.addWord}
          onchange={handleCheckboxChange('addWord')}
        />
        Include word/title
      </label>
      
      <label class="option-checkbox">
        <input
          type="checkbox"
          checked={options.addBeatNumbers}
          onchange={handleCheckboxChange('addBeatNumbers')}
        />
        Show beat numbers
      </label>

      <label class="option-checkbox">
        <input
          type="checkbox"
          checked={options.addUserInfo}
          onchange={handleCheckboxChange('addUserInfo')}
        />
        Include user info
      </label>

      <label class="option-checkbox">
        <input
          type="checkbox"
          checked={options.addDifficultyLevel}
          onchange={handleCheckboxChange('addDifficultyLevel')}
        />
        Show difficulty level
      </label>

      <label class="option-checkbox">
        <input
          type="checkbox"
          checked={options.includeStartPosition}
          onchange={handleCheckboxChange('includeStartPosition')}
        />
        Include start position
      </label>
    </div>

    <!-- User Info (if enabled) -->
    {#if options.addUserInfo}
      <div class="option-group">
        <h4 class="group-title">User Information</h4>
        
        <label class="option-label">
          Name
          <input
            type="text"
            class="option-input"
            value={options.userName}
            oninput={handleInputChange('userName')}
            placeholder="Your name"
          />
        </label>

        <label class="option-label">
          Notes
          <input
            type="text"
            class="option-input"
            value={options.notes}
            oninput={handleInputChange('notes')}
            placeholder="Optional notes"
          />
        </label>
      </div>
    {/if}
  {/if}
</div>

<style>
  .share-options {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    padding: 1rem;
    border: 1px solid var(--border-color);
    border-radius: 8px;
    background: var(--bg-primary);
    max-height: 500px;
    overflow-y: auto;
  }

  .options-header h3 {
    margin: 0 0 0.25rem 0;
    font-size: 1.1rem;
    font-weight: 600;
    color: var(--text-primary);
  }

  .options-description {
    margin: 0;
    font-size: 0.85rem;
    color: var(--text-secondary);
  }

  .option-group {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .group-title {
    margin: 0 0 0.25rem 0;
    font-size: 0.95rem;
    font-weight: 500;
    color: var(--text-primary);
    border-bottom: 1px solid var(--border-color);
    padding-bottom: 0.25rem;
  }

  .option-label {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    font-size: 0.9rem;
    font-weight: 500;
    color: var(--text-primary);
  }

  .option-select,
  .option-input {
    padding: 0.5rem;
    border: 1px solid var(--border-color);
    border-radius: 4px;
    background: var(--bg-secondary);
    color: var(--text-primary);
    font-size: 0.9rem;
  }

  .option-select:focus,
  .option-input:focus {
    outline: none;
    border-color: var(--accent-color);
  }

  .option-checkbox {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.9rem;
    color: var(--text-primary);
    cursor: pointer;
  }

  .option-checkbox input[type="checkbox"] {
    margin: 0;
  }

  .preset-description {
    margin: 0;
    font-size: 0.8rem;
    color: var(--text-secondary);
    font-style: italic;
  }
</style>
