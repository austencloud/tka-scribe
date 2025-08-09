<!-- LessonWorkspaceView.svelte - Lesson workspace placeholder -->
<script lang="ts">
	import type { LessonType, QuizMode, LayoutMode } from '$lib/types/learn';

	// Props
	interface Props {
		lessonType?: LessonType | null;
		quizMode?: QuizMode | null;
		layoutMode?: LayoutMode;
		onBackToSelector?: () => void;
	}

	let { 
		lessonType = null,
		quizMode = null,
		layoutMode,
		onBackToSelector
	}: Props = $props();

	// Handle back navigation
	function handleBackClick() {
		onBackToSelector?.();
	}

	// Get lesson display name
	function getLessonDisplayName(type: LessonType | null): string {
		if (!type) return 'Unknown Lesson';
		
		switch (type) {
			case 'pictograph_to_letter':
				return 'Lesson 1: Pictograph to Letter';
			case 'letter_to_pictograph':
				return 'Lesson 2: Letter to Pictograph';
			case 'valid_next_pictograph':
				return 'Lesson 3: Valid Next Pictograph';
			default:
				return 'Unknown Lesson';
		}
	}

	// Get quiz mode display name
	function getQuizModeDisplayName(mode: QuizMode | null): string {
		if (!mode) return 'Unknown Mode';
		
		switch (mode) {
			case 'fixed_question':
				return 'Fixed Questions';
			case 'countdown':
				return 'Countdown';
			default:
				return 'Unknown Mode';
		}
	}
</script>

<div class="lesson-workspace">
	<!-- Header with back button -->
	<div class="workspace-header glass-surface">
		<button class="back-button btn-glass" onclick={handleBackClick}>
			← Back to Lessons
		</button>
		<div class="lesson-info">
			<h2 class="lesson-title">{getLessonDisplayName(lessonType)}</h2>
			<p class="quiz-mode">Mode: {getQuizModeDisplayName(quizMode)}</p>
		</div>
	</div>

	<!-- Main content area -->
	<div class="workspace-content">
		<div class="placeholder-content glass-surface">
			<div class="placeholder-icon">🎓</div>
			<h3>Lesson Workspace</h3>
			<p>Interactive lesson content will be implemented here.</p>
			<div class="lesson-details">
				<p><strong>Lesson:</strong> {getLessonDisplayName(lessonType)}</p>
				<p><strong>Mode:</strong> {getQuizModeDisplayName(quizMode)}</p>
			</div>
			<div class="coming-soon">
				<p>🚧 Coming Soon:</p>
				<ul>
					<li>Question Display</li>
					<li>Answer Options</li>
					<li>Progress Tracking</li>
					<li>Timer (for countdown mode)</li>
					<li>Score Tracking</li>
				</ul>
			</div>
		</div>
	</div>
</div>

<style>
	.lesson-workspace {
		display: flex;
		flex-direction: column;
		height: 100%;
		width: 100%;
		gap: var(--spacing-lg);
		padding: var(--spacing-lg);
	}

	.workspace-header {
		display: flex;
		align-items: center;
		gap: var(--spacing-lg);
		padding: var(--spacing-md) var(--spacing-lg);
		border-radius: 12px;
	}

	.back-button {
		padding: var(--spacing-sm) var(--spacing-md);
		border-radius: 8px;
		font-size: var(--font-size-sm);
		font-weight: 500;
		transition: all var(--transition-normal);
		white-space: nowrap;
	}

	.back-button:hover {
		transform: translateX(-2px);
	}

	.lesson-info {
		flex: 1;
	}

	.lesson-title {
		color: var(--foreground);
		font-family: Georgia, serif;
		font-size: var(--font-size-xl);
		font-weight: bold;
		margin: 0 0 var(--spacing-xs) 0;
	}

	.quiz-mode {
		color: var(--muted-foreground);
		font-size: var(--font-size-sm);
		margin: 0;
	}

	.workspace-content {
		flex: 1;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.placeholder-content {
		text-align: center;
		padding: var(--spacing-2xl);
		border-radius: 16px;
		max-width: 600px;
		width: 100%;
	}

	.placeholder-icon {
		font-size: 4rem;
		margin-bottom: var(--spacing-lg);
	}

	.placeholder-content h3 {
		color: var(--foreground);
		font-size: var(--font-size-2xl);
		margin-bottom: var(--spacing-md);
	}

	.placeholder-content > p {
		color: var(--muted-foreground);
		font-size: var(--font-size-lg);
		margin-bottom: var(--spacing-xl);
	}

	.lesson-details {
		background: rgba(255, 255, 255, 0.05);
		border-radius: 8px;
		padding: var(--spacing-md);
		margin-bottom: var(--spacing-xl);
	}

	.lesson-details p {
		color: var(--foreground);
		margin: var(--spacing-xs) 0;
		font-size: var(--font-size-sm);
	}

	.coming-soon {
		text-align: left;
		background: rgba(255, 255, 255, 0.03);
		border-radius: 8px;
		padding: var(--spacing-md);
	}

	.coming-soon p {
		color: var(--muted-foreground);
		font-weight: 500;
		margin-bottom: var(--spacing-sm);
	}

	.coming-soon ul {
		color: var(--muted-foreground);
		font-size: var(--font-size-sm);
		margin: 0;
		padding-left: var(--spacing-lg);
	}

	.coming-soon li {
		margin-bottom: var(--spacing-xs);
	}

	/* Responsive adjustments */
	@media (max-width: 768px) {
		.lesson-workspace {
			padding: var(--spacing-md);
			gap: var(--spacing-md);
		}

		.workspace-header {
			flex-direction: column;
			align-items: flex-start;
			gap: var(--spacing-md);
		}

		.lesson-title {
			font-size: var(--font-size-lg);
		}

		.placeholder-content {
			padding: var(--spacing-xl);
		}

		.placeholder-icon {
			font-size: 3rem;
		}
	}

	@media (max-width: 480px) {
		.lesson-workspace {
			padding: var(--spacing-sm);
		}

		.placeholder-content {
			padding: var(--spacing-lg);
		}

		.placeholder-icon {
			font-size: 2.5rem;
		}
	}
</style>
