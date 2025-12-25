<!--
  LetterPickerSheet.svelte - Modal for selecting starting letter filter
-->
<script lang="ts">
	interface Props {
		currentLetter: string | null;
		onSelect: (letter: string | null) => void;
		onClose: () => void;
	}

	let { currentLetter, onSelect, onClose }: Props = $props();

	const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape') {
			onClose();
		} else if (e.key === 'Enter' || e.key === ' ') {
			e.preventDefault();
			onClose();
		}
	}
</script>

<div
	class="letter-sheet-overlay"
	onclick={onClose}
	onkeydown={handleKeydown}
	role="button"
	tabindex="0"
>
	<div class="letter-sheet" onclick={(e) => e.stopPropagation()} onkeydown={(e) => e.stopPropagation()} role="dialog" tabindex="-1">
		<div class="sheet-header">
			<span>Starting Letter</span>
			<button class="close-btn" onclick={onClose} aria-label="Close letter picker">
				<i class="fas fa-times"></i>
			</button>
		</div>
		<div class="letter-grid">
			<button
				class="letter-btn"
				class:active={currentLetter === null}
				onclick={() => onSelect(null)}
			>
				All
			</button>
			{#each LETTERS as letter}
				<button
					class="letter-btn"
					class:active={currentLetter === letter}
					onclick={() => onSelect(letter)}
				>
					{letter}
				</button>
			{/each}
		</div>
	</div>
</div>

<style>
	.letter-sheet-overlay {
		position: fixed;
		inset: 0;
		background: rgba(0, 0, 0, 0.75);
		backdrop-filter: blur(8px);
		-webkit-backdrop-filter: blur(8px);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 1000;
		animation: fadeIn 0.25s ease;
	}

	@keyframes fadeIn {
		from { opacity: 0; }
		to { opacity: 1; }
	}

	.letter-sheet {
		background: var(--theme-card-bg, rgba(0, 0, 0, 0.45));
		border: 1px solid var(--theme-stroke, rgba(255, 255, 255, 0.08));
		border-radius: 20px;
		padding: 24px;
		max-width: 450px;
		width: 92%;
		max-height: 80vh;
		overflow-y: auto;
		animation: slideUp 0.3s ease;
		box-shadow: var(--theme-shadow, 0 14px 36px rgba(0, 0, 0, 0.4));
		backdrop-filter: blur(20px);
		-webkit-backdrop-filter: blur(20px);
	}

	@keyframes slideUp {
		from { transform: translateY(30px); opacity: 0; }
		to { transform: translateY(0); opacity: 1; }
	}

	.sheet-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-bottom: 20px;
	}

	.sheet-header span {
		font-size: 16px;
		font-weight: 600;
		color: var(--theme-text, white);
		letter-spacing: 0.3px;
	}

	.close-btn {
		width: 32px;
		height: 32px;
		border-radius: 50%;
		border: 1px solid var(--theme-stroke, rgba(255, 255, 255, 0.08));
		background: var(--theme-card-hover-bg, rgba(0, 0, 0, 0.55));
		color: var(--theme-text-dim, rgba(255, 255, 255, 0.65));
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 13px;
		transition: all 0.2s ease;
	}

	.close-btn:hover {
		background: var(--theme-accent, #4a9eff);
		border-color: var(--theme-accent, #4a9eff);
		color: white;
		transform: rotate(90deg);
		box-shadow: 0 0 12px color-mix(in srgb, var(--theme-accent, #4a9eff) 30%, transparent);
	}

	.letter-grid {
		display: grid;
		grid-template-columns: repeat(7, 1fr);
		gap: 10px;
	}

	.letter-btn {
		aspect-ratio: 1;
		border-radius: 12px;
		border: 1px solid var(--theme-stroke, rgba(255, 255, 255, 0.08));
		background: var(--theme-panel-elevated-bg, rgba(0, 0, 0, 0.5));
		color: var(--theme-text-dim, rgba(255, 255, 255, 0.7));
		font-size: var(--font-size-min, 14px);
		font-weight: 600;
		cursor: pointer;
		transition: all 0.2s ease;
	}

	.letter-btn:hover {
		background: var(--theme-card-hover-bg, rgba(0, 0, 0, 0.55));
		border-color: var(--theme-stroke-strong, rgba(255, 255, 255, 0.14));
		color: var(--theme-text, white);
		transform: translateY(-2px) scale(1.05);
	}

	.letter-btn.active {
		background: color-mix(in srgb, var(--theme-accent, #4a9eff) 25%, transparent);
		border-color: var(--theme-accent, #4a9eff);
		color: var(--theme-accent, #4a9eff);
		box-shadow: 0 0 12px color-mix(in srgb, var(--theme-accent, #4a9eff) 30%, transparent);
	}
</style>
