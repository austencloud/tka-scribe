<script lang="ts">
	// Define the type for each visibility option
	type VisibilityOption = {
	  label: string;
	  isActive: boolean;
	};
  
	// Initialize the visibility options
	let visibilityOptions: VisibilityOption[] = [
	  { label: 'Show Grid', isActive: true },
	  { label: 'Show Labels', isActive: false },
	  { label: 'Show Annotations', isActive: true }
	];
  
	// Function to toggle the isActive property of an option
	const toggleOption = (label: string): void => {
	  visibilityOptions = visibilityOptions.map((option) =>
		option.label === label ? { ...option, isActive: !option.isActive } : option
	  );
	};
</script>

<style>
	.container {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: flex-start;
		height: 100vh;
		padding-top: 20px; /* Add some padding to the top if needed */
	}
</style>

<div class="container">
	<h3>Visibility Settings</h3>
	{#each visibilityOptions as option (option.label)}
		<div style="margin-bottom: 10px;">
			<label>
				<input
					type="checkbox"
					bind:checked={option.isActive}
					on:change={() => toggleOption(option.label)}
				/>
				{option.label}
			</label>
		</div>
	{/each}
</div>
