<script lang="ts">
	import type { Snippet } from 'svelte';

	/**
	 * Vertical Button Panel living inside the Workbench (right side)
	 * Pure runes props + callbacks. No stores.
	 */

	interface Props {
		disabled?: boolean;
		hasSelection?: boolean;
		onAddToDictionary?: () => void;
		onFullscreen?: () => void;
		onMirror?: () => void;
		onSwapColors?: () => void;
		onRotate?: () => void;
		onCopyJson?: () => void;
		onDeleteBeat?: () => void;
		onClearSequence?: () => void;
		// Optional additional render content
		renderExtra?: Snippet;
	}

	let {
		disabled = false,
		hasSelection = false,
		onAddToDictionary,
		onFullscreen,
		onMirror,
		onSwapColors,
		onRotate,
		onCopyJson,
		onDeleteBeat,
		onClearSequence,
		renderExtra,
	}: Props = $props();

	function handle(fn?: () => void) {
		if (disabled) return;
		fn?.();
	}
</script>

<div class="button-panel" aria-label="Workbench Controls">
	<button
		type="button"
		class="panel-btn"
		title="Add to Dictionary"
		onclick={() => handle(onAddToDictionary)}
	>
		📚
	</button>
	<button type="button" class="panel-btn" title="Fullscreen" onclick={() => handle(onFullscreen)}>
		⛶
	</button>
	<button type="button" class="panel-btn" title="Mirror Sequence" onclick={() => handle(onMirror)}>
		⇄
	</button>
	<button type="button" class="panel-btn" title="Swap Colors" onclick={() => handle(onSwapColors)}>
		🔁
	</button>
	<button type="button" class="panel-btn" title="Rotate Sequence" onclick={() => handle(onRotate)}>
		⟲
	</button>
	<button type="button" class="panel-btn" title="Copy JSON" onclick={() => handle(onCopyJson)}>
		{`{ }`}
	</button>
	<button
		type="button"
		class="panel-btn"
		title="Delete Beat"
		disabled={!hasSelection || disabled}
		onclick={() => handle(onDeleteBeat)}
	>
		🗑️
	</button>
	<button
		type="button"
		class="panel-btn"
		title="Clear Sequence"
		onclick={() => handle(onClearSequence)}
	>
		🧹
	</button>

	{#if renderExtra}
		{@render renderExtra()}
	{/if}
</div>

<style>
	.button-panel {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 10px;
		padding: 8px;
		border-left: 1px solid rgba(0, 0, 0, 0.08);
		min-width: 60px;
	}

	.panel-btn {
		width: 48px;
		height: 48px;
		border-radius: 10px;
		border: 1px solid rgba(0, 0, 0, 0.15);
		background: #fff;
		cursor: pointer;
		font-size: 18px;
		display: flex;
		align-items: center;
		justify-content: center;
		transition:
			background 120ms ease,
			transform 120ms ease;
	}

	.panel-btn:hover:not(:disabled) {
		background: #f7f7f7;
	}
	.panel-btn:active:not(:disabled) {
		transform: translateY(1px);
	}
	.panel-btn:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}
</style>
