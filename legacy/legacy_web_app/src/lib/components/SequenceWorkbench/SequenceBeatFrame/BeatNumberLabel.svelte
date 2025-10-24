<script lang="ts">
	export let beatNumber: number = 1;
	export let duration: number = 1; // Support for multi-beat durations

	$: beatText = duration > 1 ? `${beatNumber}-${beatNumber + duration - 1}` : `${beatNumber}`;
</script>

<div class="beat-number-label">
	{beatText}
</div>

<style>
	.beat-number-label {
		font-size: 1.2rem;
		font-weight: bold;
		text-align: center;
		background-color: rgba(255, 255, 255, 0.7);
		padding: 5px;
		border-radius: 5px;
	}
</style>
