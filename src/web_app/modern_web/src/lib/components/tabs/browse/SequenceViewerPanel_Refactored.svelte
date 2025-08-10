<!-- SequenceViewerPanel.svelte - REFACTORED VERSION using pure Svelte 5 runes -->
<script lang="ts">
	import SequenceViewer from './sequence-viewer/SequenceViewer.svelte';

	interface Props {
		sequence?: any;
		onBackToBrowser?: () => void;
		onSequenceAction?: (action: string, sequence: any) => void;
	}

	let { sequence = null, onBackToBrowser, onSequenceAction }: Props = $props();

	// Simple pass-through to the refactored SequenceViewer
	function handleBackToBrowser() {
		onBackToBrowser?.();
	}

	function handleSequenceAction(action: string, seq: any) {
		onSequenceAction?.(action, seq);
	}
</script>

<SequenceViewer
	{sequence}
	onBackToBrowser={handleBackToBrowser}
	onSequenceAction={handleSequenceAction}
/>
