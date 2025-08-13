<script lang="ts">
	import type { PropState } from "$lib/animator";

	interface Props {
		propName: string;
		propColor: string;
		propState?: PropState;
	}

	let { propName, propColor, propState }: Props = $props();

	function formatAngle(angle?: number): string {
		if (angle === undefined || angle === null) return "0.00";
		return angle.toFixed(2);
	}
</script>

<div class="prop-state-display">
	<h4 style="color: {propColor}">{propName} Prop State</h4>
	<div class="state-grid">
		<div class="debug-item">
			<span class="label">Center Angle:</span>
			<span class="value">{formatAngle(propState?.centerPathAngle)} rad</span>
		</div>
		<div class="debug-item">
			<span class="label">Staff Angle:</span>
			<span class="value">{formatAngle(propState?.staffRotationAngle)} rad</span>
		</div>
		<div class="debug-item">
			<span class="label">X Position:</span>
			<span class="value">{propState?.x?.toFixed(1) || '0.0'} px</span>
		</div>
		<div class="debug-item">
			<span class="label">Y Position:</span>
			<span class="value">{propState?.y?.toFixed(1) || '0.0'} px</span>
		</div>
	</div>
</div>

<style>
	.prop-state-display {
		background: rgba(0, 0, 0, 0.2);
		border: 1px solid rgba(255, 255, 255, 0.1);
		border-radius: 6px;
		padding: 15px;
	}

	h4 {
		margin: 0 0 12px 0;
		font-size: 0.9rem;
		font-weight: 600;
	}

	.state-grid {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 8px;
	}

	.debug-item {
		display: flex;
		justify-content: space-between;
		align-items: center;
		font-size: 0.8rem;
	}

	.label {
		color: #c7d2fe;
		font-weight: 500;
	}

	.value {
		color: #fbbf24;
		font-family: 'Courier New', monospace;
		font-weight: 600;
	}
</style>
