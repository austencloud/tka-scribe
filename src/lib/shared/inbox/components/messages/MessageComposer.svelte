<script lang="ts">
  /**
   * MessageComposer
   *
   * Input field and send button with optimistic UI and error handling
   */

  import { onMount } from "svelte";
  import { messagingService } from "../../../messaging/services/implementations/Messenger";
  import { toast } from "../../../toast/state/toast-state.svelte";
  import { resolve } from "$lib/shared/inversify/di";
  import { TYPES } from "$lib/shared/inversify/types";
  import type { IHapticFeedback } from "$lib/shared/application/services/contracts/IHapticFeedback";

  interface Props {
    conversationId: string;
  }

  let { conversationId }: Props = $props();

  let messageText = $state("");
  let isSending = $state(false);
  let inputElement: HTMLTextAreaElement | undefined = $state();
  let sendSuccess = $state(false);

  // Haptic feedback service
  let hapticService: IHapticFeedback | undefined;

  onMount(() => {
    hapticService = resolve<IHapticFeedback>(
      TYPES.IHapticFeedback
    );
  });

  // Auto-resize textarea
  function handleInput(event: Event) {
    const textarea = event.target as HTMLTextAreaElement;
    textarea.style.height = "auto";
    textarea.style.height = Math.min(textarea.scrollHeight, 120) + "px";
  }

  // Handle keyboard shortcuts
  function handleKeydown(event: KeyboardEvent) {
    // Send on Enter (without Shift)
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      sendMessage();
    }
  }

  async function sendMessage() {
    const text = messageText.trim();
    if (!text || isSending) return;

    hapticService?.trigger("selection");

    // Optimistic UI: clear input immediately
    const previousText = messageText;
    messageText = "";
    if (inputElement) {
      inputElement.style.height = "auto";
    }

    isSending = true;
    try {
      await messagingService.sendTextMessage(conversationId, text);

      // Show brief success indicator with haptic feedback
      hapticService?.trigger("success");
      sendSuccess = true;
      setTimeout(() => {
        sendSuccess = false;
      }, 1500);
    } catch (error) {
      console.error("Failed to send message:", error);

      // Restore text on error
      messageText = previousText;

      // Show error toast
      toast.error("Failed to send message. Please try again.");
    } finally {
      isSending = false;
    }
  }

  // Derive button state
  const canSend = $derived(messageText.trim().length > 0 && !isSending);
</script>

<div class="message-composer">
  <textarea
    bind:this={inputElement}
    bind:value={messageText}
    oninput={handleInput}
    onkeydown={handleKeydown}
    placeholder="Type a message..."
    rows="1"
    disabled={isSending}
    aria-label="Message input"
  ></textarea>
  <button
    class="send-button"
    class:success={sendSuccess}
    onclick={sendMessage}
    disabled={!canSend}
    aria-label={isSending
      ? "Sending..."
      : sendSuccess
        ? "Sent"
        : "Send message"}
  >
    {#if isSending}
      <i class="fas fa-spinner fa-spin"></i>
    {:else if sendSuccess}
      <i class="fas fa-check"></i>
    {:else}
      <i class="fas fa-paper-plane"></i>
    {/if}
  </button>
</div>

<style>
  .message-composer {
    display: flex;
    align-items: flex-end;
    gap: 8px;
    padding: 12px 16px;
    background: var(--theme-panel-bg, rgba(0, 0, 0, 0.2));
    border-top: 1px solid var(--theme-stroke, rgba(255, 255, 255, 0.1));
  }

  textarea {
    flex: 1;
    min-height: var(--min-touch-target);
    max-height: 120px;
    padding: 14px 16px;
    background: var(--theme-card-bg, rgba(255, 255, 255, 0.06));
    border: 1px solid var(--theme-stroke, rgba(255, 255, 255, 0.1));
    border-radius: 24px;
    color: var(--theme-text, #ffffff);
    font-family: inherit;
    font-size: 14px;
    line-height: 1.4;
    resize: none;
    outline: none;
    transition:
      border-color 0.2s ease,
      box-shadow 0.2s ease;
  }

  textarea::placeholder {
    color: var(--theme-text-dim, rgba(255, 255, 255, 0.4));
  }

  textarea:focus {
    border-color: var(--theme-accent, #3b82f6);
    box-shadow: 0 0 0 3px
      color-mix(in srgb, var(--theme-accent) 20%, transparent);
  }

  textarea:disabled {
    opacity: 0.6;
  }

  .send-button {
    display: flex;
    align-items: center;
    justify-content: center;
    width: var(--min-touch-target);
    height: var(--min-touch-target);
    padding: 0;
    background: var(--theme-accent, #3b82f6);
    border: none;
    border-radius: 50%;
    color: white;
    cursor: pointer;
    transition:
      background 0.2s ease,
      transform 0.15s ease,
      box-shadow 0.2s ease;
  }

  .send-button:hover:not(:disabled) {
    background: color-mix(in srgb, var(--theme-accent, #3b82f6) 85%, white);
    transform: scale(1.05);
    box-shadow: 0 4px 12px
      color-mix(in srgb, var(--theme-accent) 40%, transparent);
  }

  .send-button:active:not(:disabled) {
    transform: scale(0.95);
  }

  .send-button:focus-visible {
    outline: none;
    box-shadow:
      0 0 0 3px color-mix(in srgb, var(--theme-accent) 40%, transparent),
      0 4px 12px rgba(0, 0, 0, 0.2);
  }

  .send-button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .send-button.success {
    background: var(--semantic-success, #22c55e);
    animation: successPop 0.3s ease;
  }

  @keyframes successPop {
    0% {
      transform: scale(1);
    }
    50% {
      transform: scale(1.15);
    }
    100% {
      transform: scale(1);
    }
  }

  .send-button i {
    font-size: 16px;
    transition: transform 0.2s ease;
  }

  .send-button:hover:not(:disabled) i {
    transform: translateX(1px);
  }

  .send-button.success i {
    animation: checkPop 0.3s ease;
  }

  @keyframes checkPop {
    0% {
      transform: scale(0);
    }
    50% {
      transform: scale(1.2);
    }
    100% {
      transform: scale(1);
    }
  }

  /* Reduced motion */
  @media (prefers-reduced-motion: reduce) {
    textarea,
    .send-button,
    .send-button i {
      transition: none !important;
      animation: none !important;
    }
  }
</style>
