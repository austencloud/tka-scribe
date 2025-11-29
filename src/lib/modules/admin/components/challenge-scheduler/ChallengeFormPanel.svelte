<script lang="ts">
import type { SequenceData } from "$lib/shared/foundation/domain/models/SequenceData";

	interface Props {
		selectedDate: string | null;
		showPanel: boolean;
		sequences: SequenceData[];
		onClose: () => void;
		onSchedule: (data: {
			sequenceId: string;
			title: string;
			description: string;
			difficulty: 'beginner' | 'intermediate' | 'advanced';
			xpReward: number;
		}) => void;
	}

	let { selectedDate, showPanel, sequences, onClose, onSchedule }: Props = $props();

	// Local form state
	let searchQuery = $state('');
	let selectedSequence = $state<SequenceData | null>(null);
	let customTitle = $state('');
	let customDescription = $state('');
	let customDifficulty = $state<'beginner' | 'intermediate' | 'advanced'>('intermediate');
	let customXP = $state(50);

	const filteredSequences = $derived.by(() => {
		if (!searchQuery) return sequences;
		const query = searchQuery.toLowerCase();
		return sequences.filter(
			(seq) => seq.name.toLowerCase().includes(query) || seq.word.toLowerCase().includes(query)
		);
	});

	function handleSequenceSelect(sequence: SequenceData) {
		selectedSequence = sequence;
		if (!customTitle) {
			customTitle = `Daily Challenge: ${sequence.name}`;
		}
		if (!customDescription) {
			customDescription = `Complete this sequence to earn XP!`;
		}
	}

	function handleSchedule() {
		if (!selectedSequence) return;
		onSchedule({
			sequenceId: selectedSequence.id,
			title: customTitle || `Daily Challenge: ${selectedSequence.name}`,
			description: customDescription || `Complete this sequence to earn XP!`,
			difficulty: customDifficulty,
			xpReward: customXP,
		});
	}

	function handleClose() {
		// Reset local state
		searchQuery = '';
		selectedSequence = null;
		customTitle = '';
		customDescription = '';
		customDifficulty = 'intermediate';
		customXP = 50;
		onClose();
	}

	const formattedDate = $derived(
		selectedDate
			? new Date(selectedDate).toLocaleDateString('en-US', {
					weekday: 'short',
					month: 'short',
					day: 'numeric',
				})
			: ''
	);
</script>

<div class="detail-panel" class:active={showPanel}>
	{#if showPanel && selectedDate}
		<div class="creation-form">
			<div class="form-header">
				<h3>
					<i class="fas fa-plus-circle"></i>
					Schedule Challenge
				</h3>
				<button class="close-btn" onclick={handleClose} aria-label="Close panel">
					<i class="fas fa-times"></i>
				</button>
			</div>

			<div class="date-display">
				<i class="fas fa-calendar"></i>
				{formattedDate}
			</div>

			<!-- Sequence Selection -->
			<div class="form-section">
				<span class="section-label">Select Sequence</span>
				<div class="search-box">
					<i class="fas fa-search"></i>
					<input type="text" placeholder="Search sequences..." bind:value={searchQuery} />
				</div>
				<div class="sequence-grid">
					{#each filteredSequences.slice(0, 8) as sequence (sequence.id)}
						<button
							class="sequence-card"
							class:selected={selectedSequence?.id === sequence.id}
							onclick={() => handleSequenceSelect(sequence)}
						>
							<div class="sequence-icon">
								<i class="fas fa-layer-group"></i>
							</div>
							<div class="sequence-info">
								<span class="sequence-name">{sequence.name}</span>
								<span class="sequence-beats">{sequence.beats?.length ?? 0} beats</span>
							</div>
							{#if selectedSequence?.id === sequence.id}
								<i class="fas fa-check-circle selected-check"></i>
							{/if}
						</button>
					{/each}
				</div>
				{#if filteredSequences.length > 8}
					<p class="more-sequences">+{filteredSequences.length - 8} more sequences</p>
				{/if}
			</div>

			{#if selectedSequence}
				<!-- Challenge Details Form -->
				<div class="form-section">
					<span class="section-label">Challenge Details</span>

					<div class="form-group">
						<label for="title">Title</label>
						<input
							id="title"
							type="text"
							bind:value={customTitle}
							placeholder="Daily Challenge: Sequence Name"
						/>
					</div>

					<div class="form-group">
						<label for="description">Description</label>
						<textarea
							id="description"
							bind:value={customDescription}
							placeholder="Complete this sequence to earn XP!"
							rows="2"
						></textarea>
					</div>

					<div class="form-row">
						<div class="form-group">
							<label for="difficulty">Difficulty</label>
							<select id="difficulty" bind:value={customDifficulty}>
								<option value="beginner">Beginner</option>
								<option value="intermediate">Intermediate</option>
								<option value="advanced">Advanced</option>
							</select>
						</div>
						<div class="form-group">
							<label for="xp">XP Reward</label>
							<input id="xp" type="number" bind:value={customXP} min="10" max="500" step="10" />
						</div>
					</div>
				</div>

				<!-- Actions -->
				<div class="form-actions">
					<button class="cancel-btn" onclick={handleClose}> Cancel </button>
					<button class="schedule-btn" onclick={handleSchedule}>
						<i class="fas fa-check"></i>
						Schedule Challenge
					</button>
				</div>
			{/if}
		</div>
	{:else}
		<div class="empty-detail">
			<div class="empty-icon">
				<i class="fas fa-mouse-pointer"></i>
			</div>
			<h3>Select a Date</h3>
			<p>Click on a date in the calendar to schedule a new challenge</p>
		</div>
	{/if}
</div>

<style>
	.detail-panel {
		background: rgba(0, 0, 0, 0.2);
		border: 1px solid rgba(255, 255, 255, 0.08);
		border-radius: 12px;
		overflow: hidden;
		display: flex;
		flex-direction: column;
	}

	.empty-detail {
		flex: 1;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 2rem;
		text-align: center;
		opacity: 0.5;
	}

	.empty-icon {
		width: 80px;
		height: 80px;
		background: rgba(255, 255, 255, 0.05);
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 2rem;
		margin-bottom: 1rem;
	}

	.empty-detail h3 {
		margin: 0 0 0.5rem 0;
		font-size: 1.2rem;
	}

	.empty-detail p {
		margin: 0;
		font-size: 0.9rem;
		max-width: 200px;
	}

	.creation-form {
		flex: 1;
		padding: 1.25rem;
		overflow-y: auto;
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.form-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.form-header h3 {
		margin: 0;
		font-size: 1.1rem;
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.close-btn {
		width: 32px;
		height: 32px;
		border: none;
		background: rgba(255, 255, 255, 0.1);
		color: #fff;
		border-radius: 6px;
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		transition: all 0.2s ease;
	}

	.close-btn:hover {
		background: rgba(255, 255, 255, 0.2);
	}

	.date-display {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		padding: 0.75rem 1rem;
		background: rgba(102, 126, 234, 0.15);
		border: 1px solid rgba(102, 126, 234, 0.3);
		border-radius: 8px;
		font-weight: 500;
	}

	.form-section {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	.section-label {
		font-size: 0.9rem;
		font-weight: 600;
		opacity: 0.8;
	}

	.search-box {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		background: rgba(255, 255, 255, 0.05);
		border: 1px solid rgba(255, 255, 255, 0.1);
		border-radius: 8px;
		padding: 0.6rem 0.85rem;
	}

	.search-box i {
		opacity: 0.5;
	}

	.search-box input {
		flex: 1;
		background: transparent;
		border: none;
		outline: none;
		color: #fff;
		font-size: 0.9rem;
	}

	.search-box input::placeholder {
		color: rgba(255, 255, 255, 0.4);
	}

	.sequence-grid {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 0.5rem;
		max-height: 200px;
		overflow-y: auto;
	}

	.sequence-card {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.6rem;
		background: rgba(255, 255, 255, 0.03);
		border: 1px solid rgba(255, 255, 255, 0.08);
		border-radius: 8px;
		cursor: pointer;
		text-align: left;
		color: #fff;
		transition: all 0.15s ease;
	}

	.sequence-card:hover {
		background: rgba(255, 255, 255, 0.08);
		border-color: rgba(255, 255, 255, 0.15);
	}

	.sequence-card.selected {
		background: rgba(102, 126, 234, 0.2);
		border-color: rgba(102, 126, 234, 0.5);
	}

	.sequence-icon {
		width: 32px;
		height: 32px;
		background: rgba(255, 255, 255, 0.1);
		border-radius: 6px;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 0.85rem;
		flex-shrink: 0;
	}

	.sequence-info {
		flex: 1;
		min-width: 0;
		display: flex;
		flex-direction: column;
	}

	.sequence-name {
		font-size: 0.85rem;
		font-weight: 500;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.sequence-beats {
		font-size: 0.7rem;
		opacity: 0.5;
	}

	.selected-check {
		color: #4ade80;
		flex-shrink: 0;
	}

	.more-sequences {
		margin: 0;
		font-size: 0.8rem;
		opacity: 0.5;
		text-align: center;
	}

	.form-group {
		display: flex;
		flex-direction: column;
		gap: 0.4rem;
	}

	.form-group label {
		font-size: 0.85rem;
		opacity: 0.7;
	}

	.form-group input,
	.form-group textarea,
	.form-group select {
		padding: 0.6rem 0.85rem;
		background: rgba(255, 255, 255, 0.05);
		border: 1px solid rgba(255, 255, 255, 0.1);
		border-radius: 6px;
		color: #fff;
		font-size: 0.9rem;
		transition: all 0.2s ease;
	}

	.form-group input:focus,
	.form-group textarea:focus,
	.form-group select:focus {
		outline: none;
		border-color: rgba(102, 126, 234, 0.5);
		background: rgba(255, 255, 255, 0.08);
	}

	.form-group textarea {
		resize: vertical;
		min-height: 60px;
		font-family: inherit;
	}

	.form-row {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 0.75rem;
	}

	.form-actions {
		display: flex;
		gap: 0.75rem;
		margin-top: auto;
		padding-top: 1rem;
	}

	.cancel-btn,
	.schedule-btn {
		flex: 1;
		padding: 0.75rem;
		border: none;
		border-radius: 8px;
		cursor: pointer;
		font-size: 0.95rem;
		transition: all 0.2s ease;
	}

	.cancel-btn {
		background: rgba(255, 255, 255, 0.1);
		color: #fff;
	}

	.cancel-btn:hover {
		background: rgba(255, 255, 255, 0.15);
	}

	.schedule-btn {
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		color: #fff;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
	}

	.schedule-btn:hover {
		transform: translateY(-2px);
		box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
	}

	.sequence-grid::-webkit-scrollbar,
	.creation-form::-webkit-scrollbar {
		width: 6px;
	}

	.sequence-grid::-webkit-scrollbar-track,
	.creation-form::-webkit-scrollbar-track {
		background: transparent;
	}

	.sequence-grid::-webkit-scrollbar-thumb,
	.creation-form::-webkit-scrollbar-thumb {
		background: rgba(255, 255, 255, 0.15);
		border-radius: 3px;
	}

	@media (max-width: 1024px) {
		.detail-panel {
			position: fixed;
			top: 0;
			right: 0;
			bottom: 0;
			width: 100%;
			max-width: 400px;
			transform: translateX(100%);
			transition: transform 0.3s ease;
			z-index: 100;
			border-radius: 0;
		}

		.detail-panel.active {
			transform: translateX(0);
		}
	}

	@media (max-width: 768px) {
		.sequence-grid {
			grid-template-columns: 1fr;
		}

		.form-row {
			grid-template-columns: 1fr;
		}
	}
</style>
