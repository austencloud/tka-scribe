<script lang="ts">
	/**
	 * Sequence Viewer Page
	 *
	 * Standalone route for viewing and editing sequences from deep links.
	 * URL format: /sequence/{encodedSequence}
	 */

	import { page } from "$app/stores";
	import { goto } from "$app/navigation";
	import { SequenceViewer } from "$lib/shared/sequence-viewer";
	import { container } from "$lib/shared/inversify/container";
	import { TYPES } from "$lib/shared/inversify/types";
	import type { ISequenceEncoderService } from "$lib/shared/navigation/services/contracts/ISequenceEncoderService";
	import type { SequenceData } from "$shared";

	// Get encoded sequence from URL param
	const encodedId = $derived($page.params["id"]);

	// Decode sequence from URL
	const decodedSequence = $derived.by(() => {
		if (!encodedId) return null;

		try {
			const encoderService = container.get<ISequenceEncoderService>(
				TYPES.ISequenceEncoderService
			);
			return encoderService.decodeWithCompression(decodeURIComponent(encodedId));
		} catch (err) {
			console.error("Failed to decode sequence:", err);
			return null;
		}
	});

	// Handle navigation back to home
	function handleClose() {
		goto("/");
	}

	// Handle opening in Create module
	function handleOpenInCreate(sequence: SequenceData) {
		// Store sequence for Create module to consume
		try {
			localStorage.setItem("tka-pending-edit-sequence", JSON.stringify(sequence));
			goto("/?module=create&tab=edit");
		} catch (err) {
			console.error("Failed to store sequence for editing:", err);
			goto("/");
		}
	}
</script>

<svelte:head>
	<title>
		{decodedSequence?.word || decodedSequence?.name || "Sequence"} - TKA Studio
	</title>
	<meta
		name="description"
		content={decodedSequence?.word
			? `View and edit the sequence "${decodedSequence.word}" in TKA Studio`
			: "View and edit sequences in TKA Studio"}
	/>
</svelte:head>

<div class="sequence-page">
	{#if decodedSequence}
		<SequenceViewer
			initialSequence={decodedSequence}
			onClose={handleClose}
			onOpenInCreate={handleOpenInCreate}
		/>
	{:else}
		<div class="error-container">
			<div class="error-card">
				<svg
					xmlns="http://www.w3.org/2000/svg"
					width="48"
					height="48"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
					class="error-icon"
				>
					<circle cx="12" cy="12" r="10"></circle>
					<line x1="12" y1="8" x2="12" y2="12"></line>
					<line x1="12" y1="16" x2="12.01" y2="16"></line>
				</svg>
				<h1>Sequence Not Found</h1>
				<p>The sequence link appears to be invalid or corrupted.</p>
				<button class="home-button" onclick={handleClose}>
					Go to Home
				</button>
			</div>
		</div>
	{/if}
</div>

<style>
	.sequence-page {
		min-height: 100vh;
		background: var(--color-background, #0f0f0f);
	}

	.error-container {
		min-height: 100vh;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 1rem;
	}

	.error-card {
		text-align: center;
		padding: 2rem;
		background: var(--color-surface, #1a1a1a);
		border-radius: 1rem;
		max-width: 400px;
	}

	.error-icon {
		color: var(--color-error, #ef4444);
		margin-bottom: 1rem;
	}

	.error-card h1 {
		font-size: 1.5rem;
		font-weight: 600;
		color: var(--color-text, #fff);
		margin: 0 0 0.5rem 0;
	}

	.error-card p {
		color: var(--color-text-muted, #888);
		margin: 0 0 1.5rem 0;
	}

	.home-button {
		padding: 0.75rem 1.5rem;
		background: var(--color-primary, #3b82f6);
		color: white;
		border: none;
		border-radius: 0.5rem;
		font-weight: 600;
		cursor: pointer;
		transition: background 0.2s ease;
	}

	.home-button:hover {
		background: var(--color-primary-hover, #2563eb);
	}
</style>
