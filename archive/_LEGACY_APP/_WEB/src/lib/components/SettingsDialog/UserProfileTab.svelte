<script lang="ts">
	let username: string = 'User123';

	const updateUsername = (event: Event): void => {
		// Ensure event.target is an HTMLInputElement to access `.value`
		const target = event.target as HTMLInputElement;
		username = target.value;
	};
</script>

<div class="container">
	<div class="content">
		<h3>User Profile</h3>
		<label>
			Username:
			<input
				type="text"
				bind:value={username}
				on:input={updateUsername}
				style="margin-left: 10px; padding: 5px; border-radius: 5px;"
			/>
		</label>
	</div>
</div>

<style>
	.container {
		display: flex;
		justify-content: center;
		align-items: flex-start;
		height: 100vh;
	}

	.content {
		margin-top: 20px;
		display: flex;
		flex-direction: column;
		align-items: center;
	}
</style>
