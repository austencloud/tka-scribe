<script lang="ts">
	import { createEventDispatcher } from 'svelte';

	export let name: string;
	export let icon: string;

	const dispatch = createEventDispatcher();

	const handleClick = () => {
		dispatch('propSelected', name);
	};
</script>

<button class="prop-button" title={name} on:click={handleClick}>
	<img src={icon} alt={name} class="icon" />
	<span class="label">{name}</span>
</button>

<style>
	.prop-button {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		background-color: #f0f0f0;
		border: 1px solid #ccc;
		border-radius: 5px;
		padding: 10px;
		cursor: pointer;
		transition:
			background-color 0.2s ease,
			transform 0.2s ease;
		height: 50%; /* Fill available grid cell */
	}

	.prop-button:hover {
		background-color: #e0e0e0;
		transform: scale(1.05);
	}

	.prop-button:active {
		background-color: #d0d0d0;
		transform: scale(0.95);
	}

	.icon {
		width: 60%;
		height: auto; /* Maintain aspect ratio */
		margin-bottom: 10px;
	}

	.label {
		font-size: 1rem;
		font-weight: bold;
		text-align: center;
	}
</style>
