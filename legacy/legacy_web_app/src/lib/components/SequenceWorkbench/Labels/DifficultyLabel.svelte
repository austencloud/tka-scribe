<script>
	export let difficultyLevel = 1;
	export let width = 100; // Default width

	$: difficultyText = `Level ${difficultyLevel}`;
	$: fontSize = Math.max(width / 80, 16) + 'px'; // Calculate font size based on width with a minimum of 16px (1rem)
</script>

<div class="difficulty-label" style="font-size: {fontSize};">
	{difficultyText}
</div>

<style>
	.difficulty-label {
		text-align: center;
		font-style: italic;
	}
</style>
