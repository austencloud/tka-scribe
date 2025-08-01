<script lang="ts">
	import '../app.css';
	import { onMount, setContext } from 'svelte';
	import type { ServiceContainer } from '@tka/shared/di/core/ServiceContainer';
	
	// Application bootstrap
	let container: ServiceContainer | null = $state(null);
	let isInitialized = $state(false);
	let initializationError = $state<string | null>(null);
	
	onMount(async () => {
		try {
			// Import bootstrap function
			const { createWebApplication } = await import('$services/bootstrap');
			
			// Create DI container
			container = await createWebApplication();
			
			// Provide container to children
			setContext('di-container', container);
			
			// Mark as initialized
			isInitialized = true;
		} catch (error) {
			initializationError = error instanceof Error ? error.message : 'Unknown error';
			console.error('Failed to initialize application:', error);
		}
	});
</script>

<svelte:head>
	<title>TKA - The Kinetic Constructor</title>
</svelte:head>

{#if initializationError}
	<div class="error-screen">
		<h1>Initialization Failed</h1>
		<p>{initializationError}</p>
		<button onclick={() => window.location.reload()}>Retry</button>
	</div>
{:else if !isInitialized}
	<div class="loading-screen">
		<div class="spinner"></div>
		<p>Initializing TKA...</p>
	</div>
{:else if container}
	<!-- Container is provided via context, slot renders with access -->
	<slot />
{/if}

<style>
	.error-screen {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		min-height: 100vh;
		padding: 2rem;
		text-align: center;
	}
	
	.loading-screen {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		min-height: 100vh;
		padding: 2rem;
		text-align: center;
	}
	
	.spinner {
		width: 40px;
		height: 40px;
		border: 4px solid #f3f3f3;
		border-top: 4px solid #3498db;
		border-radius: 50%;
		animation: spin 1s linear infinite;
		margin-bottom: 1rem;
	}
	
	@keyframes spin {
		0% { transform: rotate(0deg); }
		100% { transform: rotate(360deg); }
	}
</style>
