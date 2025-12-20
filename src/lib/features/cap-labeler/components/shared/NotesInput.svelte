<script lang="ts">
  interface Props {
    value: string;
    onInput: (value: string) => void;
    placeholder?: string;
  }

  let { value = $bindable(""), onInput, placeholder = "Any observations about this sequence..." }: Props = $props();

  function handleInput(e: Event) {
    const target = e.target as HTMLInputElement;
    value = target.value;
    onInput(target.value);
  }
</script>

<div class="notes-section">
  <label>
    Notes (optional):
    <input
      type="text"
      {value}
      oninput={handleInput}
      {placeholder}
    />
  </label>
</div>

<style>
  .notes-section {
    margin-top: var(--space-xl, 20px);
  }

  .notes-section label {
    display: flex;
    flex-direction: column;
    gap: var(--space-sm, 8px);
    font-size: var(--text-lg, 14px);
  }

  .notes-section input {
    padding: 10px var(--space-md, 12px);
    background: var(--surface-inset, rgba(0, 0, 0, 0.3));
    border: 1px solid var(--border-subtle, rgba(255, 255, 255, 0.1));
    border-radius: var(--radius-sm, 6px);
    color: var(--text-primary, #fff);
    font-size: var(--text-lg, 14px);
  }
</style>
