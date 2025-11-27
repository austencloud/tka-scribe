<script lang="ts">
	/**
	 * DebugStatePanel
	 *
	 * Admin-only debug panel for inspecting and managing application state.
	 * Useful for debugging stuck UI states, viewing sequence data, and
	 * forcing state resets when the normal UI is inaccessible.
	 *
	 * Access: Admin-only, triggered by Ctrl+Shift+D
	 */

	import { authStore } from '$shared/auth';
	import { resolve, isContainerReady } from '$shared/inversify';
	import { TYPES } from '$shared/inversify/types';
	import type { ISequencePersistenceService } from '$create/shared/services/contracts';
	import { onMount } from 'svelte';

	interface DebugStatePanelProps {
		isOpen: boolean;
		onClose: () => void;
	}

	let { isOpen, onClose }: DebugStatePanelProps = $props();

	// State inspection data
	let persistenceState = $state<any>(null);
	let localStorageKeys = $state<string[]>([]);
	let indexedDBInfo = $state<string>('Checking...');
	let isClearing = $state(false);
	let clearMessage = $state<string | null>(null);

	// Services
	let persistenceService: ISequencePersistenceService | null = $state(null);

	onMount(() => {
		if (isContainerReady()) {
			try {
				persistenceService = resolve(TYPES.ISequencePersistenceService);
			} catch (e) {
				console.warn('Could not resolve persistence service:', e);
			}
		}
	});

	// Refresh state when panel opens
	$effect(() => {
		if (isOpen) {
			refreshState();
		}
	});

	async function refreshState() {
		clearMessage = null;

		// Get persistence state
		if (persistenceService) {
			try {
				persistenceState = await persistenceService.loadCurrentState();
			} catch (e) {
				persistenceState = { error: String(e) };
			}
		}

		// Get relevant localStorage keys
		localStorageKeys = [];
		for (let i = 0; i < localStorage.length; i++) {
			const key = localStorage.key(i);
			if (
				key &&
				(key.includes('sequence') ||
					key.includes('construct') ||
					key.includes('tka') ||
					key.includes('create'))
			) {
				localStorageKeys.push(key);
			}
		}

		// Check IndexedDB
		try {
			if (window.indexedDB.databases) {
				const dbs = await window.indexedDB.databases();
				const tkaDbs = dbs.filter(
					(db) =>
						db.name &&
						(db.name.includes('tka') || db.name.includes('kinetic') || db.name.includes('dexie'))
				);
				indexedDBInfo = tkaDbs.length > 0 ? tkaDbs.map((db) => db.name).join(', ') : 'None found';
			} else {
				indexedDBInfo = 'API not available';
			}
		} catch (e) {
			indexedDBInfo = 'Error checking: ' + String(e);
		}
	}

	async function clearPersistence() {
		isClearing = true;
		clearMessage = null;

		try {
			// Clear persistence service state
			if (persistenceService) {
				await persistenceService.clearCurrentState();
			}

			// Clear relevant localStorage keys
			for (const key of localStorageKeys) {
				localStorage.removeItem(key);
			}

			clearMessage = 'State cleared successfully. Refresh the page to see changes.';
			await refreshState();
		} catch (e) {
			clearMessage = 'Error clearing state: ' + String(e);
		} finally {
			isClearing = false;
		}
	}

	async function clearIndexedDB() {
		isClearing = true;
		clearMessage = null;

		try {
			if (window.indexedDB.databases) {
				const dbs = await window.indexedDB.databases();
				for (const db of dbs) {
					if (
						db.name &&
						(db.name.includes('tka') || db.name.includes('kinetic') || db.name.includes('dexie'))
					) {
						window.indexedDB.deleteDatabase(db.name);
					}
				}
			}
			clearMessage = 'IndexedDB cleared. Refresh the page to see changes.';
			await refreshState();
		} catch (e) {
			clearMessage = 'Error clearing IndexedDB: ' + String(e);
		} finally {
			isClearing = false;
		}
	}

	function forceReload() {
		window.location.reload();
	}

	function handleBackdropClick(e: MouseEvent) {
		if (e.target === e.currentTarget) {
			onClose();
		}
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape') {
			onClose();
		}
	}

	function formatJson(obj: any): string {
		try {
			return JSON.stringify(obj, null, 2);
		} catch {
			return String(obj);
		}
	}
</script>

<svelte:window onkeydown={handleKeydown} />

{#if isOpen && authStore.isAdmin}
	<!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
	<div class="debug-overlay" onclick={handleBackdropClick}>
		<div class="debug-panel" role="dialog" aria-labelledby="debug-title">
			<header class="debug-header">
				<h2 id="debug-title">
					<i class="fas fa-bug"></i>
					Debug State Panel
				</h2>
				<button class="close-btn" onclick={onClose} aria-label="Close debug panel">
					<i class="fas fa-times"></i>
				</button>
			</header>

			<div class="debug-content">
				<!-- Quick Actions -->
				<section class="debug-section">
					<h3><i class="fas fa-bolt"></i> Quick Actions</h3>
					<div class="action-buttons">
						<button class="action-btn refresh" onclick={refreshState} disabled={isClearing}>
							<i class="fas fa-sync-alt"></i>
							Refresh State
						</button>
						<button class="action-btn danger" onclick={clearPersistence} disabled={isClearing}>
							<i class="fas fa-eraser"></i>
							Clear Persistence
						</button>
						<button class="action-btn danger" onclick={clearIndexedDB} disabled={isClearing}>
							<i class="fas fa-database"></i>
							Clear IndexedDB
						</button>
						<button class="action-btn warning" onclick={forceReload}>
							<i class="fas fa-redo"></i>
							Force Reload
						</button>
					</div>
					{#if clearMessage}
						<div class="message" class:success={clearMessage.includes('success')}>
							{clearMessage}
						</div>
					{/if}
				</section>

				<!-- Persistence State -->
				<section class="debug-section">
					<h3><i class="fas fa-save"></i> Persistence State</h3>
					<pre class="code-block">{formatJson(persistenceState)}</pre>
				</section>

				<!-- LocalStorage Keys -->
				<section class="debug-section">
					<h3><i class="fas fa-key"></i> LocalStorage Keys ({localStorageKeys.length})</h3>
					{#if localStorageKeys.length > 0}
						<ul class="key-list">
							{#each localStorageKeys as key}
								<li>
									<code>{key}</code>
									<button
										class="mini-btn"
										aria-label="Delete {key}"
										onclick={() => {
											localStorage.removeItem(key);
											refreshState();
										}}
									>
										<i class="fas fa-trash"></i>
									</button>
								</li>
							{/each}
						</ul>
					{:else}
						<p class="muted">No sequence-related keys found</p>
					{/if}
				</section>

				<!-- IndexedDB Info -->
				<section class="debug-section">
					<h3><i class="fas fa-database"></i> IndexedDB</h3>
					<p class="info-text">{indexedDBInfo}</p>
				</section>

				<!-- Tips -->
				<section class="debug-section tips">
					<h3><i class="fas fa-lightbulb"></i> Troubleshooting Tips</h3>
					<ul>
						<li>
							<strong>Stuck on "No options":</strong> Clear Persistence, then Force Reload
						</li>
						<li>
							<strong>Sequence won't clear:</strong> Clear both Persistence and IndexedDB
						</li>
						<li>
							<strong>Complete reset:</strong> Clear IndexedDB + Force Reload
						</li>
					</ul>
				</section>
			</div>

			<footer class="debug-footer">
				<span class="footer-info">
					<i class="fas fa-shield-alt"></i>
					Admin-only panel | Ctrl+Shift+D to toggle
				</span>
			</footer>
		</div>
	</div>
{/if}

<style>
	.debug-overlay {
		position: fixed;
		inset: 0;
		background: rgba(0, 0, 0, 0.8);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 10000;
		padding: 24px;
		backdrop-filter: blur(4px);
	}

	.debug-panel {
		background: linear-gradient(145deg, #1a1a2e 0%, #0f0f1a 100%);
		border-radius: 16px;
		max-width: 700px;
		width: 100%;
		max-height: 85vh;
		display: flex;
		flex-direction: column;
		border: 1px solid rgba(255, 255, 255, 0.1);
		box-shadow:
			0 25px 50px -12px rgba(0, 0, 0, 0.5),
			0 0 0 1px rgba(255, 255, 255, 0.05);
	}

	.debug-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 20px 24px;
		border-bottom: 1px solid rgba(255, 255, 255, 0.1);
		background: rgba(239, 68, 68, 0.1);
	}

	.debug-header h2 {
		margin: 0;
		font-size: 18px;
		font-weight: 600;
		color: #ef4444;
		display: flex;
		align-items: center;
		gap: 10px;
	}

	.close-btn {
		background: rgba(255, 255, 255, 0.1);
		border: none;
		color: rgba(255, 255, 255, 0.7);
		width: 36px;
		height: 36px;
		border-radius: 8px;
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		transition: all 0.2s;
	}

	.close-btn:hover {
		background: rgba(255, 255, 255, 0.15);
		color: white;
	}

	.debug-content {
		flex: 1;
		overflow-y: auto;
		padding: 20px 24px;
	}

	.debug-section {
		margin-bottom: 24px;
	}

	.debug-section:last-child {
		margin-bottom: 0;
	}

	.debug-section h3 {
		margin: 0 0 12px 0;
		font-size: 14px;
		font-weight: 600;
		color: rgba(255, 255, 255, 0.9);
		display: flex;
		align-items: center;
		gap: 8px;
	}

	.debug-section h3 i {
		color: #3b82f6;
		font-size: 12px;
	}

	.action-buttons {
		display: flex;
		flex-wrap: wrap;
		gap: 10px;
	}

	.action-btn {
		padding: 10px 16px;
		border-radius: 8px;
		font-size: 13px;
		font-weight: 500;
		cursor: pointer;
		border: none;
		display: flex;
		align-items: center;
		gap: 8px;
		transition: all 0.2s;
	}

	.action-btn.refresh {
		background: rgba(59, 130, 246, 0.2);
		color: #3b82f6;
	}

	.action-btn.refresh:hover:not(:disabled) {
		background: rgba(59, 130, 246, 0.3);
	}

	.action-btn.danger {
		background: rgba(239, 68, 68, 0.2);
		color: #ef4444;
	}

	.action-btn.danger:hover:not(:disabled) {
		background: rgba(239, 68, 68, 0.3);
	}

	.action-btn.warning {
		background: rgba(245, 158, 11, 0.2);
		color: #f59e0b;
	}

	.action-btn.warning:hover:not(:disabled) {
		background: rgba(245, 158, 11, 0.3);
	}

	.action-btn:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.message {
		margin-top: 12px;
		padding: 10px 14px;
		border-radius: 8px;
		font-size: 13px;
		background: rgba(239, 68, 68, 0.15);
		color: #fca5a5;
		border: 1px solid rgba(239, 68, 68, 0.2);
	}

	.message.success {
		background: rgba(16, 185, 129, 0.15);
		color: #6ee7b7;
		border-color: rgba(16, 185, 129, 0.2);
	}

	.code-block {
		background: rgba(0, 0, 0, 0.3);
		border: 1px solid rgba(255, 255, 255, 0.1);
		border-radius: 8px;
		padding: 14px;
		font-size: 12px;
		font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
		color: rgba(255, 255, 255, 0.8);
		overflow-x: auto;
		max-height: 200px;
		overflow-y: auto;
		white-space: pre-wrap;
		word-break: break-all;
	}

	.key-list {
		list-style: none;
		padding: 0;
		margin: 0;
	}

	.key-list li {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 8px 12px;
		background: rgba(0, 0, 0, 0.2);
		border-radius: 6px;
		margin-bottom: 6px;
	}

	.key-list code {
		font-size: 12px;
		color: #fbbf24;
		font-family: 'Monaco', 'Menlo', monospace;
	}

	.mini-btn {
		background: rgba(239, 68, 68, 0.2);
		border: none;
		color: #ef4444;
		width: 28px;
		height: 28px;
		border-radius: 6px;
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 11px;
		transition: all 0.2s;
	}

	.mini-btn:hover {
		background: rgba(239, 68, 68, 0.3);
	}

	.muted {
		color: rgba(255, 255, 255, 0.5);
		font-size: 13px;
		margin: 0;
	}

	.info-text {
		color: rgba(255, 255, 255, 0.7);
		font-size: 13px;
		margin: 0;
		padding: 10px 14px;
		background: rgba(0, 0, 0, 0.2);
		border-radius: 8px;
	}

	.tips {
		background: rgba(59, 130, 246, 0.1);
		padding: 16px;
		border-radius: 12px;
		border: 1px solid rgba(59, 130, 246, 0.2);
	}

	.tips h3 i {
		color: #fbbf24;
	}

	.tips ul {
		margin: 0;
		padding-left: 20px;
	}

	.tips li {
		color: rgba(255, 255, 255, 0.7);
		font-size: 13px;
		margin-bottom: 8px;
		line-height: 1.5;
	}

	.tips li:last-child {
		margin-bottom: 0;
	}

	.tips li strong {
		color: rgba(255, 255, 255, 0.9);
	}

	.debug-footer {
		padding: 14px 24px;
		border-top: 1px solid rgba(255, 255, 255, 0.1);
		background: rgba(0, 0, 0, 0.2);
	}

	.footer-info {
		font-size: 12px;
		color: rgba(255, 255, 255, 0.5);
		display: flex;
		align-items: center;
		gap: 8px;
	}

	.footer-info i {
		color: #10b981;
	}

	/* Scrollbar styling */
	.debug-content::-webkit-scrollbar,
	.code-block::-webkit-scrollbar {
		width: 8px;
		height: 8px;
	}

	.debug-content::-webkit-scrollbar-track,
	.code-block::-webkit-scrollbar-track {
		background: rgba(0, 0, 0, 0.2);
		border-radius: 4px;
	}

	.debug-content::-webkit-scrollbar-thumb,
	.code-block::-webkit-scrollbar-thumb {
		background: rgba(255, 255, 255, 0.2);
		border-radius: 4px;
	}

	.debug-content::-webkit-scrollbar-thumb:hover,
	.code-block::-webkit-scrollbar-thumb:hover {
		background: rgba(255, 255, 255, 0.3);
	}
</style>
