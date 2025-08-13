<script lang="ts">
	interface Props {
		blueVisible: boolean;
		redVisible: boolean;
		onBlueVisibilityChange: (visible: boolean) => void;
		onRedVisibilityChange: (visible: boolean) => void;
	}

	let { 
		blueVisible, 
		redVisible, 
		onBlueVisibilityChange, 
		onRedVisibilityChange 
	}: Props = $props();
</script>

<div class="visibility-control">
	<div class="visibility-row">
		<label class="visibility-label">
			<input 
				type="checkbox" 
				checked={blueVisible}
				onchange={(e) => onBlueVisibilityChange(e.currentTarget.checked)}
			>
			<span class="prop-icon blue">🔵</span>
			Blue Prop
		</label>
		<label class="visibility-label">
			<input 
				type="checkbox" 
				checked={redVisible}
				onchange={(e) => onRedVisibilityChange(e.currentTarget.checked)}
			>
			<span class="prop-icon red">🔴</span>
			Red Prop
		</label>
	</div>
</div>

<style>
	.visibility-control {
		width: 100%;
	}

	.visibility-row {
		display: flex;
		gap: 20px;
		flex-wrap: wrap;
	}

	.visibility-label {
		display: flex;
		align-items: center;
		gap: 8px;
		color: #c7d2fe;
		font-size: 0.9rem;
		cursor: pointer;
		user-select: none;
	}

	.visibility-label input[type="checkbox"] {
		width: 16px;
		height: 16px;
		accent-color: #6366f1;
		cursor: pointer;
	}

	.prop-icon {
		font-size: 1rem;
	}

	.prop-icon.blue {
		color: #60a5fa;
	}

	.prop-icon.red {
		color: #f87171;
	}

	.visibility-label:hover {
		color: #e0e7ff;
	}
</style>
