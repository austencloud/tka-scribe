<!-- Learn Tab - Educational content with pixel-perfect desktop replica -->
<script lang="ts">
	import { LearnView, QuizMode, LessonType, type LessonResults } from '$lib/types/learn';
	import LessonSelectorView from '$lib/components/learn/LessonSelectorView.svelte';
	import LessonWorkspaceView from '$lib/components/learn/LessonWorkspaceView.svelte';
	import LessonResultsView from '$lib/components/learn/LessonResultsView.svelte';

	// State management using runes
	let currentView = $state<LearnView>(LearnView.LESSON_SELECTOR);
	let selectedMode = $state<QuizMode>(QuizMode.FIXED_QUESTION);
	let currentLessonType = $state<LessonType | null>(null);
	let currentResults = $state<LessonResults | null>(null);
	let isLoading = $state<boolean>(false);

	// Available lessons (all enabled for now)
	let availableLessons = $state<LessonType[]>(Object.values(LessonType));

	// Navigation handlers
	function handleLessonRequested(event: { lessonType: LessonType; quizMode: QuizMode }) {
		currentLessonType = event.lessonType;
		selectedMode = event.quizMode;
		currentView = LearnView.LESSON_WORKSPACE;

		// TODO: Start actual lesson session
		console.log('Starting lesson:', event.lessonType, 'in mode:', event.quizMode);
	}

	function handleModeChanged(mode: QuizMode) {
		selectedMode = mode;
	}

	function handleBackToSelector() {
		currentView = LearnView.LESSON_SELECTOR;
		currentLessonType = null;
		currentResults = null;
	}

	function handleRetryLesson() {
		if (currentLessonType) {
			currentView = LearnView.LESSON_WORKSPACE;
			currentResults = null;
			// TODO: Restart lesson session
			console.log('Retrying lesson:', currentLessonType);
		}
	}

	// TODO: This will be used when lesson completion is implemented
	// function handleLessonComplete(results: LessonResults) {
	// 	currentResults = results;
	// 	currentView = LearnView.LESSON_RESULTS;
	// }
</script>

<div class="learn-tab">
	<!-- Main content area with stacked views -->
	<div class="learn-content">
		{#if currentView === LearnView.LESSON_SELECTOR}
			<LessonSelectorView
				bind:selectedMode
				{availableLessons}
				{isLoading}
				onLessonRequested={handleLessonRequested}
				onModeChanged={handleModeChanged}
			/>
		{:else if currentView === LearnView.LESSON_WORKSPACE}
			<LessonWorkspaceView
				lessonType={currentLessonType}
				quizMode={selectedMode}
				onBackToSelector={handleBackToSelector}
			/>
		{:else if currentView === LearnView.LESSON_RESULTS}
			<LessonResultsView
				results={currentResults}
				onBackToSelector={handleBackToSelector}
				onRetryLesson={handleRetryLesson}
			/>
		{/if}
	</div>
</div>

<style>
	.learn-tab {
		display: flex;
		flex-direction: column;
		width: 100%;
		height: 100%;
		position: relative;
		overflow: hidden;
		/* Match desktop background styling */
		background: transparent;
	}

	.learn-content {
		flex: 1;
		display: flex;
		flex-direction: column;
		width: 100%;
		height: 100%;
		position: relative;
	}

	/* Ensure proper stacking and transitions */
	.learn-content > :global(*) {
		width: 100%;
		height: 100%;
	}

	/* Responsive adjustments */
	@media (max-width: 768px) {
		.learn-tab {
			/* Responsive styles will be added as needed */
			position: relative;
		}
	}
</style>
