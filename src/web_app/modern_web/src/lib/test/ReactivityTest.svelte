<script>
	// Test the EXACT pattern from optionPickerRunes - including async loading
	function createTestRunes() {
		let optionsData = $state([]);
		let uiState = $state({ isLoading: true });

		console.log('🔧 Test runes created, optionsData length:', optionsData.length);

		async function loadOptions() {
			console.log('🚀 Test loadOptions called');
			uiState.isLoading = true;

			// Simulate the exact async pattern from the real runes
			try {
				// Simulate async data loading
				const mockData = await new Promise((resolve) => {
					setTimeout(() => {
						resolve([
							{ id: 1, letter: 'A', end_position: 'test1' },
							{ id: 2, letter: 'B', end_position: 'test2' },
							{ id: 3, letter: 'C', end_position: 'test3' },
						]);
					}, 100);
				});

				console.log(`🔧 Test setting optionsData with ${mockData.length} options`);
				optionsData = mockData;
				console.log(`🔧 Test optionsData set, current length: ${optionsData.length}`);
				uiState.isLoading = false;
			} catch (error) {
				console.error('❌ Test loadOptions error:', error);
				uiState.isLoading = false;
			}
		}

		return {
			get allOptions() {
				console.log(
					'🔍 Test allOptions getter called, returning',
					optionsData.length,
					'options'
				);
				return optionsData;
			},
			get isLoading() {
				console.log('🔍 Test isLoading getter called, returning', uiState.isLoading);
				return uiState.isLoading;
			},
			loadOptions,
		};
	}

	// Create test runes instance - EXACT same pattern as OptionPicker
	const testRunes = createTestRunes();

	// Test component reactivity using $effect (EXACT same pattern as OptionPicker)
	let effectiveOptions = $state([]);
	let isLoading = $state(true);

	$effect(() => {
		console.log('🔍 Test component $effect called');
		// EXACT same pattern as OptionPicker - access through const object
		const allOptions = testRunes.allOptions || [];
		const loadingState = testRunes.isLoading;

		console.log('🔍 Test component updating:', {
			optionsLength: allOptions.length,
			isLoading: loadingState,
			timestamp: new Date().toLocaleTimeString(),
		});

		effectiveOptions = allOptions;
		isLoading = loadingState;
	});

	function triggerLoad() {
		console.log('🎯 Triggering loadOptions...');
		testRunes.loadOptions();
	}

	console.log('✅ Test component initialized');
</script>

<div class="test-container">
	<h2>Reactivity Test</h2>

	<button onclick={triggerLoad}>Load Options</button>

	<div class="results">
		<h3>Results:</h3>
		<p>Options Count: {effectiveOptions.length}</p>
		<p>Is Loading: {isLoading}</p>
		<p>Options Data: {JSON.stringify(effectiveOptions)}</p>
	</div>

	<div class="debug">
		<h3>Debug Info:</h3>
		<p>Direct runes access:</p>
		<p>testRunes.allOptions.length: {testRunes.allOptions.length}</p>
		<p>testRunes.isLoading: {testRunes.isLoading}</p>
	</div>
</div>

<style>
	.test-container {
		padding: 20px;
		border: 2px solid #333;
		margin: 20px;
		background: #1a1a1a;
		color: white;
	}

	.results,
	.debug {
		margin: 20px 0;
		padding: 10px;
		border: 1px solid #555;
		background: #2a2a2a;
	}

	button {
		padding: 10px 20px;
		background: #4a4a4a;
		color: white;
		border: 1px solid #666;
		cursor: pointer;
	}

	button:hover {
		background: #5a5a5a;
	}
</style>
