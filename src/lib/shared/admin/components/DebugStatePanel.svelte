<script lang="ts">
	/**
	 * DebugStatePanel
	 *
	 * Admin-only debug panel for inspecting and managing application state.
	 * Now with 2026-level aesthetics because why not.
	 *
	 * Access: Admin-only, triggered by Ctrl+Shift+D
	 */

	import { authStore } from '$shared/auth';
	import { resolve, isContainerReady } from '$shared/inversify';
	import { TYPES } from '$shared/inversify/types';
	import type { ISequencePersistenceService } from '$create/shared/services/contracts';
	import { onMount } from 'svelte';
	import { fly, blur } from 'svelte/transition';
	import { backOut } from 'svelte/easing';

	interface DebugStatePanelProps {
		isOpen: boolean;
		onClose: () => void;
	}

	let { isOpen, onClose }: DebugStatePanelProps = $props();

	// State inspection data
	let persistenceState = $state<any>(null);
	let localStorageKeys = $state<string[]>([]);
	let indexedDBInfo = $state<string>('Scanning...');
	let isClearing = $state(false);
	let clearMessage = $state<string | null>(null);
	let activeSection = $state<string | null>(null);
	let mousePosition = $state({ x: 0, y: 0 });

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

	// Track mouse for spotlight effect
	function handleMouseMove(e: MouseEvent) {
		const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
		mousePosition = {
			x: e.clientX - rect.left,
			y: e.clientY - rect.top,
		};
	}

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
				indexedDBInfo = tkaDbs.length > 0 ? tkaDbs.map((db) => db.name).join(', ') : 'No databases found';
			} else {
				indexedDBInfo = 'API not available';
			}
		} catch (e) {
			indexedDBInfo = 'Error: ' + String(e);
		}
	}

	async function clearPersistence() {
		isClearing = true;
		clearMessage = null;

		try {
			if (persistenceService) {
				await persistenceService.clearCurrentState();
			}

			for (const key of localStorageKeys) {
				localStorage.removeItem(key);
			}

			clearMessage = 'State cleared successfully. Refresh to apply.';
			await refreshState();
		} catch (e) {
			clearMessage = 'Error: ' + String(e);
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
			clearMessage = 'IndexedDB cleared. Refresh to apply.';
			await refreshState();
		} catch (e) {
			clearMessage = 'Error: ' + String(e);
		} finally {
			isClearing = false;
		}
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

	function toggleSection(section: string) {
		activeSection = activeSection === section ? null : section;
	}
</script>

<svelte:window onkeydown={handleKeydown} />

{#if isOpen && authStore.isAdmin}
	<!-- svelte-ignore a11y_click_events_have_key_events -->
	<div
		class="debug-overlay"
		role="presentation"
		onclick={handleBackdropClick}
		transition:blur={{ duration: 300, amount: 10 }}
	>
		<div
			class="debug-panel"
			role="dialog"
			aria-labelledby="debug-title"
			tabindex="-1"
			onmousemove={handleMouseMove}
			transition:fly={{ y: 50, duration: 500, easing: backOut }}
			style="--mouse-x: {mousePosition.x}px; --mouse-y: {mousePosition.y}px;"
		>
			<!-- Animated background effects -->
			<div class="panel-bg">
				<div class="gradient-orb orb-1"></div>
				<div class="gradient-orb orb-2"></div>
				<div class="gradient-orb orb-3"></div>
				<div class="grid-lines"></div>
				<div class="spotlight"></div>
			</div>

			<!-- Glass panel content -->
			<div class="panel-content">
				<header class="debug-header">
					<div class="header-left">
						<div class="icon-container">
							<div class="icon-glow"></div>
							<i class="fas fa-bug"></i>
						</div>
						<div class="title-group">
							<h2 id="debug-title">Debug Console</h2>
							<span class="subtitle">System State Inspector</span>
						</div>
					</div>
					<button class="close-btn" onclick={onClose} aria-label="Close debug panel">
						<i class="fas fa-times"></i>
					</button>
				</header>

				<div class="debug-content">
					<!-- Quick Actions -->
					<section class="debug-section">
						<h3 class="section-header">
							<span class="section-icon"><i class="fas fa-bolt"></i></span>
							<span>Quick Actions</span>
							<span class="section-line"></span>
						</h3>
						<div class="action-grid">
							<button
								class="action-card"
								onclick={refreshState}
								disabled={isClearing}
								data-variant="info"
							>
								<div class="card-glow"></div>
								<div class="card-content">
									<div class="card-icon">
										<i class="fas fa-sync-alt" class:spinning={isClearing}></i>
									</div>
									<span class="card-label">Refresh</span>
									<span class="card-desc">Reload state</span>
								</div>
							</button>

							<button
								class="action-card"
								onclick={clearPersistence}
								disabled={isClearing}
								data-variant="warning"
							>
								<div class="card-glow"></div>
								<div class="card-content">
									<div class="card-icon">
										<i class="fas fa-eraser"></i>
									</div>
									<span class="card-label">Clear Cache</span>
									<span class="card-desc">Reset persistence</span>
								</div>
							</button>

							<button
								class="action-card"
								onclick={clearIndexedDB}
								disabled={isClearing}
								data-variant="danger"
							>
								<div class="card-glow"></div>
								<div class="card-content">
									<div class="card-icon">
										<i class="fas fa-database"></i>
									</div>
									<span class="card-label">Wipe DB</span>
									<span class="card-desc">Clear IndexedDB</span>
								</div>
							</button>
						</div>

						{#if clearMessage}
							<div
								class="message-toast"
								class:success={clearMessage.includes('success')}
								transition:fly={{ y: -10, duration: 300 }}
							>
								<i class="fas" class:fa-check-circle={clearMessage.includes('success')} class:fa-exclamation-circle={!clearMessage.includes('success')}></i>
								<span>{clearMessage}</span>
							</div>
						{/if}
					</section>

					<!-- Collapsible Sections -->
					<div class="accordion">
						<!-- Persistence State -->
						<div class="accordion-item" class:expanded={activeSection === 'persistence'}>
							<button class="accordion-header" onclick={() => toggleSection('persistence')}>
								<div class="accordion-icon">
									<i class="fas fa-save"></i>
								</div>
								<span class="accordion-title">Persistence State</span>
								<div class="accordion-badge">
									{persistenceState ? 'Active' : 'Empty'}
								</div>
								<i class="fas fa-chevron-down accordion-chevron"></i>
							</button>
							{#if activeSection === 'persistence'}
								<div class="accordion-content" transition:fly={{ y: -10, duration: 200 }}>
									<pre class="code-block"><code>{formatJson(persistenceState)}</code></pre>
								</div>
							{/if}
						</div>

						<!-- LocalStorage -->
						<div class="accordion-item" class:expanded={activeSection === 'localStorage'}>
							<button class="accordion-header" onclick={() => toggleSection('localStorage')}>
								<div class="accordion-icon">
									<i class="fas fa-key"></i>
								</div>
								<span class="accordion-title">LocalStorage</span>
								<div class="accordion-badge">{localStorageKeys.length} keys</div>
								<i class="fas fa-chevron-down accordion-chevron"></i>
							</button>
							{#if activeSection === 'localStorage'}
								<div class="accordion-content" transition:fly={{ y: -10, duration: 200 }}>
									{#if localStorageKeys.length > 0}
										<ul class="key-list">
											{#each localStorageKeys as key, i}
												<li
													class="key-item"
													transition:fly={{ x: -20, duration: 200, delay: i * 30 }}
												>
													<code>{key}</code>
													<button
														class="delete-btn"
														aria-label="Delete {key}"
														onclick={() => {
															localStorage.removeItem(key);
															refreshState();
														}}
													>
														<i class="fas fa-trash-alt"></i>
													</button>
												</li>
											{/each}
										</ul>
									{:else}
										<p class="empty-state">
											<i class="fas fa-inbox"></i>
											<span>No sequence-related keys found</span>
										</p>
									{/if}
								</div>
							{/if}
						</div>

						<!-- IndexedDB -->
						<div class="accordion-item" class:expanded={activeSection === 'indexedDB'}>
							<button class="accordion-header" onclick={() => toggleSection('indexedDB')}>
								<div class="accordion-icon">
									<i class="fas fa-database"></i>
								</div>
								<span class="accordion-title">IndexedDB</span>
								<div class="accordion-badge">
									{indexedDBInfo.includes('No') ? '0 DBs' : 'Active'}
								</div>
								<i class="fas fa-chevron-down accordion-chevron"></i>
							</button>
							{#if activeSection === 'indexedDB'}
								<div class="accordion-content" transition:fly={{ y: -10, duration: 200 }}>
									<div class="db-info">
										<i class="fas fa-server"></i>
										<span>{indexedDBInfo}</span>
									</div>
								</div>
							{/if}
						</div>
					</div>

					<!-- Pro Tips -->
					<section class="tips-section">
						<div class="tips-header">
							<i class="fas fa-lightbulb"></i>
							<span>Troubleshooting</span>
						</div>
						<div class="tips-grid">
							<div class="tip-card">
								<div class="tip-icon stuck"><i class="fas fa-ban"></i></div>
								<div class="tip-content">
									<strong>Stuck on "No options"</strong>
									<span>Clear Cache → <kbd>Ctrl+Shift+R</kbd></span>
								</div>
							</div>
							<div class="tip-card">
								<div class="tip-icon clear"><i class="fas fa-broom"></i></div>
								<div class="tip-content">
									<strong>Won't clear</strong>
									<span>Wipe DB → <kbd>Ctrl+Shift+R</kbd></span>
								</div>
							</div>
							<div class="tip-card">
								<div class="tip-icon reset"><i class="fas fa-bomb"></i></div>
								<div class="tip-content">
									<strong>Nuclear option</strong>
									<span>Both buttons → <kbd>Ctrl+Shift+R</kbd></span>
								</div>
							</div>
						</div>
					</section>
				</div>

				<footer class="debug-footer">
					<div class="footer-left">
						<div class="status-dot"></div>
						<span>Admin Mode</span>
					</div>
					<div class="footer-right">
						<kbd>Ctrl</kbd><span>+</span><kbd>`</kbd>
					</div>
				</footer>
			</div>
		</div>
	</div>
{/if}

<style>
	/* ============================================================================
	   OVERLAY
	   ============================================================================ */
	.debug-overlay {
		position: fixed;
		inset: 0;
		background: radial-gradient(ellipse at center, rgba(0, 0, 0, 0.7) 0%, rgba(0, 0, 0, 0.9) 100%);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 10000;
		padding: 24px;
		backdrop-filter: blur(12px) saturate(180%);
	}

	/* ============================================================================
	   PANEL CONTAINER
	   ============================================================================ */
	.debug-panel {
		position: relative;
		max-width: 720px;
		width: 100%;
		max-height: 85vh;
		border-radius: 24px;
		overflow: hidden;
	}

	/* ============================================================================
	   ANIMATED BACKGROUND
	   ============================================================================ */
	.panel-bg {
		position: absolute;
		inset: 0;
		background: linear-gradient(
			135deg,
			rgba(15, 15, 35, 0.95) 0%,
			rgba(25, 25, 55, 0.95) 50%,
			rgba(15, 15, 35, 0.95) 100%
		);
		overflow: hidden;
	}

	.gradient-orb {
		position: absolute;
		border-radius: 50%;
		filter: blur(60px);
		opacity: 0.5;
		animation: float 20s ease-in-out infinite;
	}

	.orb-1 {
		width: 300px;
		height: 300px;
		background: linear-gradient(135deg, #ff006620 0%, #ff00ff30 100%);
		top: -100px;
		right: -50px;
		animation-delay: 0s;
	}

	.orb-2 {
		width: 250px;
		height: 250px;
		background: linear-gradient(135deg, #00ffff20 0%, #0066ff30 100%);
		bottom: -50px;
		left: -50px;
		animation-delay: -7s;
	}

	.orb-3 {
		width: 200px;
		height: 200px;
		background: linear-gradient(135deg, #ffff0015 0%, #ff660025 100%);
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		animation-delay: -14s;
	}

	@keyframes float {
		0%, 100% { transform: translate(0, 0) scale(1); }
		25% { transform: translate(30px, -30px) scale(1.1); }
		50% { transform: translate(-20px, 20px) scale(0.95); }
		75% { transform: translate(20px, 30px) scale(1.05); }
	}

	.grid-lines {
		position: absolute;
		inset: 0;
		background-image:
			linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px),
			linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px);
		background-size: 40px 40px;
		mask-image: radial-gradient(ellipse at center, black 30%, transparent 70%);
	}

	.spotlight {
		position: absolute;
		width: 400px;
		height: 400px;
		background: radial-gradient(circle, rgba(102, 126, 234, 0.15) 0%, transparent 70%);
		pointer-events: none;
		transform: translate(-50%, -50%);
		left: var(--mouse-x, 50%);
		top: var(--mouse-y, 50%);
		transition: left 0.3s ease-out, top 0.3s ease-out;
	}

	/* ============================================================================
	   GLASS CONTENT LAYER
	   ============================================================================ */
	.panel-content {
		position: relative;
		display: flex;
		flex-direction: column;
		max-height: 85vh;
		border: 1px solid rgba(255, 255, 255, 0.1);
		border-radius: 24px;
		background: rgba(255, 255, 255, 0.03);
		box-shadow:
			0 0 0 1px rgba(255, 255, 255, 0.05) inset,
			0 25px 50px -12px rgba(0, 0, 0, 0.5),
			0 0 100px rgba(102, 126, 234, 0.1);
	}

	/* ============================================================================
	   HEADER
	   ============================================================================ */
	.debug-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 20px 24px;
		border-bottom: 1px solid rgba(255, 255, 255, 0.08);
		background: linear-gradient(180deg, rgba(255, 255, 255, 0.05) 0%, transparent 100%);
	}

	.header-left {
		display: flex;
		align-items: center;
		gap: 16px;
	}

	.icon-container {
		position: relative;
		width: 48px;
		height: 48px;
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: 14px;
		background: linear-gradient(135deg, rgba(239, 68, 68, 0.2) 0%, rgba(239, 68, 68, 0.1) 100%);
		border: 1px solid rgba(239, 68, 68, 0.3);
	}

	.icon-container i {
		font-size: 20px;
		color: #ef4444;
		position: relative;
		z-index: 1;
	}

	.icon-glow {
		position: absolute;
		inset: -4px;
		background: radial-gradient(circle, rgba(239, 68, 68, 0.4) 0%, transparent 70%);
		border-radius: 18px;
		animation: pulse-glow 2s ease-in-out infinite;
	}

	@keyframes pulse-glow {
		0%, 100% { opacity: 0.5; transform: scale(1); }
		50% { opacity: 1; transform: scale(1.1); }
	}

	.title-group {
		display: flex;
		flex-direction: column;
		gap: 2px;
	}

	.debug-header h2 {
		margin: 0;
		font-size: 20px;
		font-weight: 700;
		color: white;
		letter-spacing: -0.02em;
	}

	.subtitle {
		font-size: 12px;
		color: rgba(255, 255, 255, 0.5);
		text-transform: uppercase;
		letter-spacing: 0.1em;
	}

	.close-btn {
		width: 40px;
		height: 40px;
		border-radius: 12px;
		border: 1px solid rgba(255, 255, 255, 0.1);
		background: rgba(255, 255, 255, 0.05);
		color: rgba(255, 255, 255, 0.6);
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		transition: all 0.2s ease;
	}

	.close-btn:hover {
		background: rgba(255, 255, 255, 0.1);
		border-color: rgba(255, 255, 255, 0.2);
		color: white;
		transform: rotate(90deg);
	}

	/* ============================================================================
	   CONTENT AREA
	   ============================================================================ */
	.debug-content {
		flex: 1;
		overflow-y: auto;
		padding: 24px;
	}

	.debug-section {
		margin-bottom: 28px;
	}

	.section-header {
		display: flex;
		align-items: center;
		gap: 12px;
		margin-bottom: 16px;
		font-size: 13px;
		font-weight: 600;
		color: rgba(255, 255, 255, 0.9);
		text-transform: uppercase;
		letter-spacing: 0.08em;
	}

	.section-icon {
		width: 28px;
		height: 28px;
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: 8px;
		background: linear-gradient(135deg, rgba(59, 130, 246, 0.2) 0%, rgba(139, 92, 246, 0.2) 100%);
		color: #818cf8;
		font-size: 12px;
	}

	.section-line {
		flex: 1;
		height: 1px;
		background: linear-gradient(90deg, rgba(255, 255, 255, 0.1) 0%, transparent 100%);
	}

	/* ============================================================================
	   ACTION CARDS GRID
	   ============================================================================ */
	.action-grid {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 12px;
	}

	.action-card {
		position: relative;
		padding: 16px 12px;
		border-radius: 16px;
		border: 1px solid rgba(255, 255, 255, 0.08);
		background: rgba(255, 255, 255, 0.03);
		cursor: pointer;
		overflow: hidden;
		transition: all 0.3s ease;
	}

	.action-card:hover:not(:disabled) {
		transform: translateY(-4px);
		border-color: rgba(255, 255, 255, 0.15);
	}

	.action-card:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.card-glow {
		position: absolute;
		inset: 0;
		opacity: 0;
		transition: opacity 0.3s ease;
	}

	.action-card:hover .card-glow {
		opacity: 1;
	}

	.action-card[data-variant='info'] .card-glow {
		background: radial-gradient(circle at center, rgba(59, 130, 246, 0.2) 0%, transparent 70%);
	}
	.action-card[data-variant='info'] .card-icon { color: #3b82f6; }

	.action-card[data-variant='warning'] .card-glow {
		background: radial-gradient(circle at center, rgba(245, 158, 11, 0.2) 0%, transparent 70%);
	}
	.action-card[data-variant='warning'] .card-icon { color: #f59e0b; }

	.action-card[data-variant='danger'] .card-glow {
		background: radial-gradient(circle at center, rgba(239, 68, 68, 0.2) 0%, transparent 70%);
	}
	.action-card[data-variant='danger'] .card-icon { color: #ef4444; }

	.action-card[data-variant='accent'] .card-glow {
		background: radial-gradient(circle at center, rgba(139, 92, 246, 0.2) 0%, transparent 70%);
	}
	.action-card[data-variant='accent'] .card-icon { color: #8b5cf6; }

	.card-content {
		position: relative;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 8px;
		text-align: center;
	}

	.card-icon {
		font-size: 20px;
		transition: transform 0.3s ease;
	}

	.action-card:hover .card-icon {
		transform: scale(1.2);
	}

	.card-icon .spinning {
		animation: spin 1s linear infinite;
	}

	@keyframes spin {
		from { transform: rotate(0deg); }
		to { transform: rotate(360deg); }
	}

	.card-label {
		font-size: 13px;
		font-weight: 600;
		color: white;
	}

	.card-desc {
		font-size: 11px;
		color: rgba(255, 255, 255, 0.5);
	}

	/* ============================================================================
	   MESSAGE TOAST
	   ============================================================================ */
	.message-toast {
		display: flex;
		align-items: center;
		gap: 10px;
		margin-top: 16px;
		padding: 12px 16px;
		border-radius: 12px;
		font-size: 13px;
		background: rgba(239, 68, 68, 0.15);
		border: 1px solid rgba(239, 68, 68, 0.2);
		color: #fca5a5;
	}

	.message-toast.success {
		background: rgba(16, 185, 129, 0.15);
		border-color: rgba(16, 185, 129, 0.2);
		color: #6ee7b7;
	}

	/* ============================================================================
	   ACCORDION
	   ============================================================================ */
	.accordion {
		display: flex;
		flex-direction: column;
		gap: 8px;
		margin-bottom: 24px;
	}

	.accordion-item {
		border-radius: 14px;
		border: 1px solid rgba(255, 255, 255, 0.08);
		background: rgba(255, 255, 255, 0.02);
		overflow: hidden;
		transition: all 0.3s ease;
	}

	.accordion-item.expanded {
		border-color: rgba(102, 126, 234, 0.3);
		background: rgba(102, 126, 234, 0.05);
	}

	.accordion-header {
		width: 100%;
		display: flex;
		align-items: center;
		gap: 12px;
		padding: 14px 16px;
		border: none;
		background: transparent;
		color: white;
		cursor: pointer;
		transition: all 0.2s ease;
	}

	.accordion-header:hover {
		background: rgba(255, 255, 255, 0.03);
	}

	.accordion-icon {
		width: 32px;
		height: 32px;
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: 10px;
		background: rgba(255, 255, 255, 0.05);
		color: rgba(255, 255, 255, 0.7);
		font-size: 13px;
	}

	.accordion-title {
		flex: 1;
		text-align: left;
		font-size: 14px;
		font-weight: 500;
	}

	.accordion-badge {
		padding: 4px 10px;
		border-radius: 20px;
		font-size: 11px;
		font-weight: 600;
		background: rgba(255, 255, 255, 0.08);
		color: rgba(255, 255, 255, 0.6);
	}

	.accordion-chevron {
		font-size: 12px;
		color: rgba(255, 255, 255, 0.4);
		transition: transform 0.3s ease;
	}

	.accordion-item.expanded .accordion-chevron {
		transform: rotate(180deg);
	}

	.accordion-content {
		padding: 0 16px 16px;
	}

	/* ============================================================================
	   CODE BLOCK
	   ============================================================================ */
	.code-block {
		margin: 0;
		padding: 16px;
		border-radius: 12px;
		background: rgba(0, 0, 0, 0.4);
		border: 1px solid rgba(255, 255, 255, 0.05);
		font-size: 12px;
		font-family: 'JetBrains Mono', 'Fira Code', monospace;
		color: #a5f3fc;
		overflow-x: auto;
		max-height: 200px;
		overflow-y: auto;
	}

	.code-block code {
		white-space: pre-wrap;
		word-break: break-all;
	}

	/* ============================================================================
	   KEY LIST
	   ============================================================================ */
	.key-list {
		list-style: none;
		padding: 0;
		margin: 0;
		display: flex;
		flex-direction: column;
		gap: 6px;
	}

	.key-item {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 10px 14px;
		border-radius: 10px;
		background: rgba(0, 0, 0, 0.3);
		border: 1px solid rgba(255, 255, 255, 0.05);
	}

	.key-item code {
		font-size: 12px;
		font-family: 'JetBrains Mono', monospace;
		color: #fbbf24;
	}

	.delete-btn {
		width: 28px;
		height: 28px;
		border-radius: 8px;
		border: none;
		background: rgba(239, 68, 68, 0.1);
		color: #f87171;
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 11px;
		transition: all 0.2s ease;
	}

	.delete-btn:hover {
		background: rgba(239, 68, 68, 0.2);
		color: #ef4444;
		transform: scale(1.1);
	}

	.empty-state {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 8px;
		padding: 24px;
		color: rgba(255, 255, 255, 0.4);
		font-size: 13px;
	}

	.empty-state i {
		font-size: 24px;
	}

	.db-info {
		display: flex;
		align-items: center;
		gap: 10px;
		padding: 14px;
		border-radius: 10px;
		background: rgba(0, 0, 0, 0.3);
		color: rgba(255, 255, 255, 0.7);
		font-size: 13px;
	}

	.db-info i {
		color: #8b5cf6;
	}

	/* ============================================================================
	   TIPS SECTION
	   ============================================================================ */
	.tips-section {
		padding: 20px;
		border-radius: 16px;
		background: linear-gradient(135deg, rgba(59, 130, 246, 0.08) 0%, rgba(139, 92, 246, 0.08) 100%);
		border: 1px solid rgba(102, 126, 234, 0.2);
	}

	.tips-header {
		display: flex;
		align-items: center;
		gap: 10px;
		margin-bottom: 16px;
		font-size: 14px;
		font-weight: 600;
		color: white;
	}

	.tips-header i {
		color: #fbbf24;
	}

	.tips-grid {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 12px;
	}

	.tip-card {
		display: flex;
		align-items: center;
		gap: 12px;
		padding: 12px;
		border-radius: 12px;
		background: rgba(0, 0, 0, 0.2);
		border: 1px solid rgba(255, 255, 255, 0.05);
	}

	.tip-icon {
		width: 36px;
		height: 36px;
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: 10px;
		font-size: 14px;
	}

	.tip-icon.stuck {
		background: rgba(239, 68, 68, 0.15);
		color: #f87171;
	}

	.tip-icon.clear {
		background: rgba(245, 158, 11, 0.15);
		color: #fbbf24;
	}

	.tip-icon.reset {
		background: rgba(139, 92, 246, 0.15);
		color: #a78bfa;
	}

	.tip-content {
		display: flex;
		flex-direction: column;
		gap: 2px;
	}

	.tip-content strong {
		font-size: 12px;
		font-weight: 600;
		color: rgba(255, 255, 255, 0.9);
	}

	.tip-content span {
		font-size: 11px;
		color: rgba(255, 255, 255, 0.5);
	}

	.tip-content kbd {
		padding: 2px 5px;
		border-radius: 4px;
		background: rgba(255, 255, 255, 0.1);
		border: 1px solid rgba(255, 255, 255, 0.15);
		font-family: inherit;
		font-size: 9px;
		color: rgba(255, 255, 255, 0.7);
	}

	/* ============================================================================
	   FOOTER
	   ============================================================================ */
	.debug-footer {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 14px 24px;
		border-top: 1px solid rgba(255, 255, 255, 0.08);
		background: rgba(0, 0, 0, 0.2);
	}

	.footer-left {
		display: flex;
		align-items: center;
		gap: 8px;
		font-size: 12px;
		color: rgba(255, 255, 255, 0.5);
	}

	.status-dot {
		width: 8px;
		height: 8px;
		border-radius: 50%;
		background: #10b981;
		box-shadow: 0 0 12px rgba(16, 185, 129, 0.6);
		animation: status-pulse 2s ease-in-out infinite;
	}

	@keyframes status-pulse {
		0%, 100% { opacity: 1; }
		50% { opacity: 0.5; }
	}

	.footer-right {
		display: flex;
		align-items: center;
		gap: 4px;
		font-size: 11px;
		color: rgba(255, 255, 255, 0.4);
	}

	kbd {
		padding: 3px 7px;
		border-radius: 6px;
		background: rgba(255, 255, 255, 0.08);
		border: 1px solid rgba(255, 255, 255, 0.1);
		font-family: inherit;
		font-size: 10px;
		color: rgba(255, 255, 255, 0.7);
	}

	/* ============================================================================
	   SCROLLBAR
	   ============================================================================ */
	.debug-content::-webkit-scrollbar,
	.code-block::-webkit-scrollbar {
		width: 6px;
		height: 6px;
	}

	.debug-content::-webkit-scrollbar-track,
	.code-block::-webkit-scrollbar-track {
		background: transparent;
	}

	.debug-content::-webkit-scrollbar-thumb,
	.code-block::-webkit-scrollbar-thumb {
		background: rgba(255, 255, 255, 0.15);
		border-radius: 3px;
	}

	.debug-content::-webkit-scrollbar-thumb:hover,
	.code-block::-webkit-scrollbar-thumb:hover {
		background: rgba(255, 255, 255, 0.25);
	}

	/* ============================================================================
	   RESPONSIVE
	   ============================================================================ */
	@media (max-width: 640px) {
		.action-grid {
			grid-template-columns: repeat(2, 1fr);
		}

		.tips-grid {
			grid-template-columns: 1fr;
		}

		.debug-header {
			padding: 16px;
		}

		.debug-content {
			padding: 16px;
		}
	}
</style>
