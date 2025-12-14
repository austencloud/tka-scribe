<script lang="ts">
  /**
   * VerificationCodeInput
   *
   * A 6-digit verification code input with auto-advance,
   * paste support, and accessible labeling.
   */

  interface Props {
    value: string;
    disabled?: boolean;
    error?: boolean;
    onchange?: (value: string) => void;
    onsubmit?: () => void;
  }

  let {
    value = "",
    disabled = false,
    error = false,
    onchange,
    onsubmit,
  }: Props = $props();

  let inputs: HTMLInputElement[] = [];

  function handleInput(index: number, event: Event) {
    const target = event.target as HTMLInputElement;
    const digit = target.value.replace(/\D/g, "").slice(-1);

    // Update the value
    const chars = value.split("");
    chars[index] = digit;
    const newValue = chars.join("").slice(0, 6);
    onchange?.(newValue);

    // Auto-advance to next input
    if (digit && index < 5) {
      inputs[index + 1]?.focus();
    }

    // Auto-submit when complete
    if (newValue.length === 6) {
      onsubmit?.();
    }
  }

  function handleKeyDown(index: number, event: KeyboardEvent) {
    const target = event.target as HTMLInputElement;

    // Handle backspace
    if (event.key === "Backspace") {
      if (!target.value && index > 0) {
        // Move to previous input
        inputs[index - 1]?.focus();
        const chars = value.split("");
        chars[index - 1] = "";
        onchange?.(chars.join(""));
      } else {
        const chars = value.split("");
        chars[index] = "";
        onchange?.(chars.join(""));
      }
      event.preventDefault();
    }

    // Handle arrow keys
    if (event.key === "ArrowLeft" && index > 0) {
      inputs[index - 1]?.focus();
      event.preventDefault();
    }
    if (event.key === "ArrowRight" && index < 5) {
      inputs[index + 1]?.focus();
      event.preventDefault();
    }

    // Handle Enter
    if (event.key === "Enter" && value.length === 6) {
      onsubmit?.();
    }
  }

  function handlePaste(event: ClipboardEvent) {
    event.preventDefault();
    const pastedText = event.clipboardData?.getData("text") || "";
    const digits = pastedText.replace(/\D/g, "").slice(0, 6);
    onchange?.(digits);

    // Focus last filled input or first empty
    const focusIndex = Math.min(digits.length, 5);
    inputs[focusIndex]?.focus();

    // Auto-submit if complete
    if (digits.length === 6) {
      onsubmit?.();
    }
  }

  function handleFocus(event: FocusEvent) {
    (event.target as HTMLInputElement).select();
  }
</script>

<div class="code-input-container" class:error class:disabled>
  <label class="visually-hidden" for="code-input-0"
    >Enter 6-digit verification code</label
  >
  <div
    class="code-inputs"
    role="group"
    aria-label="Enter 6-digit verification code"
  >
    {#each Array(6) as _, i}
      <input
        bind:this={inputs[i]}
        type="text"
        inputmode="numeric"
        pattern="[0-9]*"
        maxlength="1"
        autocomplete="one-time-code"
        aria-label={`Digit ${i + 1} of 6`}
        class="code-digit"
        class:filled={value[i]}
        class:error
        value={value[i] || ""}
        {disabled}
        oninput={(e) => handleInput(i, e)}
        onkeydown={(e) => handleKeyDown(i, e)}
        onpaste={handlePaste}
        onfocus={handleFocus}
      />
    {/each}
  </div>
</div>

<style>
  .code-input-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
  }

  .code-inputs {
    display: flex;
    gap: 8px;
  }

  .code-digit {
    width: 48px;
    height: 56px;
    text-align: center;
    font-size: 24px;
    font-weight: 600;
    font-family: "SF Mono", "Monaco", "Inconsolata", monospace;
    background: var(--theme-card-bg, rgba(255, 255, 255, 0.04));
    border: 2px solid var(--theme-stroke, rgba(255, 255, 255, 0.1));
    border-radius: 12px;
    color: var(--theme-text, #ffffff);
    transition: all 0.2s ease;
    caret-color: var(--theme-accent, #3b82f6);
  }

  .code-digit:focus {
    outline: none;
    border-color: var(--theme-accent, #3b82f6);
    box-shadow: 0 0 0 3px
      color-mix(in srgb, var(--theme-accent, #3b82f6) 25%, transparent);
  }

  .code-digit.filled {
    border-color: var(--theme-accent, #3b82f6);
    background: color-mix(
      in srgb,
      var(--theme-accent, #3b82f6) 10%,
      transparent
    );
  }

  .code-digit.error {
    border-color: var(--semantic-error, #ef4444);
    animation: shake 0.3s ease;
  }

  .code-digit:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .disabled {
    opacity: 0.6;
    pointer-events: none;
  }

  .visually-hidden {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
  }

  @keyframes shake {
    0%,
    100% {
      transform: translateX(0);
    }
    25% {
      transform: translateX(-4px);
    }
    75% {
      transform: translateX(4px);
    }
  }

  /* Responsive sizing */
  @media (max-width: 400px) {
    .code-digit {
      width: 40px;
      height: 48px;
      font-size: 20px;
    }

    .code-inputs {
      gap: 6px;
    }
  }
</style>
