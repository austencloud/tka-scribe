<script>
	export let currentWord = 'Word';
	export let width = 100; // Default width value

	$: fontSize = `${Math.max(width / 40, 30)}px`; // Calculate font size based on width with a minimum value
</script>

<div class="current-word-label" style="font-size: {fontSize};">
	{currentWord}
</div>

<style>
	.current-word-label {
		text-align: center;
		font-weight: bold;
	}
</style>
