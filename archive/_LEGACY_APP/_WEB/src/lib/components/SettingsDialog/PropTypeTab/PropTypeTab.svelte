<script lang="ts">
	import { PropType } from '$lib/types/Types';
	import PropButton from './PropButton.svelte';

	const props = [
		{ name: PropType.HAND, icon: 'images/props/hand.svg' },
		{ name: PropType.STAFF, icon: 'images/props/staff.svg' },
		{ name: PropType.CLUB, icon: 'images/props/club.svg' },
		{ name: PropType.FAN, icon: 'images/props/fan.svg' },
		{ name: PropType.TRIAD, icon: 'images/props/triad.svg' },
		{ name: PropType.MINIHOOP, icon: 'images/props/minihoop.svg' },
		{ name: PropType.BUUGENG, icon: 'images/props/buugeng.svg' }
	];
</script>

<div class="prop-type-tab">
	<h2 class="header">Prop Type</h2>
	<div class="grid">
		{#each props as { name, icon }}
			<PropButton {name} {icon} />
		{/each}
	</div>
</div>

<style>
	.prop-type-tab {
		display: flex;
		flex-direction: column;
		align-items: center;
		padding: 20px;
		height: 100%;
	}

	.header {
		font-size: 1.5rem;
		font-weight: bold;
		text-align: center;
		margin-bottom: 20px;
	}

	.grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
		gap: 2vh;
		width: 100%;
		height: 100%;
		margin-top: 5vh;
	}
</style>
