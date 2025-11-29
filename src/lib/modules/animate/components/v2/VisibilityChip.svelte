<!--
  VisibilityChip.svelte

  Compact toggle chip for blue/red motion visibility.
  Shows colored eye icon that toggles on/off state.
-->
<script lang="ts">
	type Color = 'blue' | 'red';

	let {
		color,
		visible = $bindable(true),
		onToggle
	}: {
		color: Color;
		visible: boolean;
		onToggle?: (visible: boolean) => void;
	} = $props();

	// Color configurations
	const colorConfig = {
		blue: {
			activeColor: '#2E3192',
			activeBg: 'rgba(46, 49, 146, 0.25)',
			activeBorder: 'rgba(46, 49, 146, 0.5)',
			label: 'Blue'
		},
		red: {
			activeColor: '#ED1C24',
			activeBg: 'rgba(237, 28, 36, 0.25)',
			activeBorder: 'rgba(237, 28, 36, 0.5)',
			label: 'Red'
		}
	};

	const config = $derived(colorConfig[color]);

	function handleClick() {
		visible = !visible;
		onToggle?.(visible);
	}
</script>

<button
	class="visibility-chip"
	class:active={visible}
	onclick={handleClick}
	aria-label="{config.label} motion {visible ? 'visible' : 'hidden'}"
	aria-pressed={visible}
	style:--active-color={config.activeColor}
	style:--active-bg={config.activeBg}
	style:--active-border={config.activeBorder}
>
	<i class="fas {visible ? 'fa-eye' : 'fa-eye-slash'}"></i>
	<span class="label">{config.label}</span>
</button>

<style>
	.visibility-chip {
		display: flex;
		align-items: center;
		gap: 6px;
		padding: 8px 12px;
		background: rgba(255, 255, 255, 0.05);
		border: 1.5px solid rgba(255, 255, 255, 0.12);
		border-radius: 20px;
		color: rgba(255, 255, 255, 0.5);
		font-size: 0.8rem;
		font-weight: 500;
		cursor: pointer;
		transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
		-webkit-tap-highlight-color: transparent;
		min-height: 36px;
	}

	.visibility-chip:hover {
		background: rgba(255, 255, 255, 0.08);
		border-color: rgba(255, 255, 255, 0.18);
	}

	.visibility-chip:active {
		transform: scale(0.96);
	}

	.visibility-chip.active {
		background: var(--active-bg);
		border-color: var(--active-border);
		color: var(--active-color);
	}

	.visibility-chip.active i {
		color: var(--active-color);
	}

	.visibility-chip i {
		font-size: 0.85rem;
		transition: color 0.2s ease;
	}

	.label {
		letter-spacing: 0.02em;
	}

	/* Responsive - hide label on very small screens */
	@media (max-width: 360px) {
		.label {
			display: none;
		}

		.visibility-chip {
			padding: 8px 10px;
		}
	}
</style>
