<script lang="ts">
	import '../app.css';
</script>

<svelte:head>
	<title>TKA - The Kinetic Alphabet</title>
</svelte:head>

<main>
	<slot />
</main>

<style>
	main {
		padding: 1rem;
		max-width: 1200px;
		margin: 0 auto;
	}
</style>
