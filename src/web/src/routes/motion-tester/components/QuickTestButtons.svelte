<script lang="ts">
	import type { MotionTesterState } from '../state/motion-tester-state.svelte';

	interface Props {
		state: MotionTesterState;
	}

	let { state }: Props = $props();

	const quickTests = [
		{
			label: "N→E Pro (Shift)",
			action: () => {
				state.setBlueStartLocation('n');
				state.setBlueEndLocation('e');
				state.updateBlueMotionParam('motionType', 'pro');
				state.updateBlueMotionParam('turns', 0);
			}
		},
		{
			label: "N→E Anti 1T (Shift)",
			action: () => {
				state.setBlueStartLocation('n');
				state.setBlueEndLocation('e');
				state.updateBlueMotionParam('motionType', 'anti');
				state.updateBlueMotionParam('turns', 1);
			}
		},
		{
			label: "N→S Dash (Opposite)",
			action: () => {
				state.setBlueStartLocation('n');
				state.setBlueEndLocation('s');
				state.updateBlueMotionParam('motionType', 'dash');
				state.updateBlueMotionParam('turns', 0);
			}
		},
		{
			label: "N→N Static 1T",
			action: () => {
				state.setBlueStartLocation('n');
				state.setBlueEndLocation('n');
				state.updateBlueMotionParam('motionType', 'static');
				state.updateBlueMotionParam('turns', 1);
			}
		},
		{
			label: "W→N Float",
			action: () => {
				state.setBlueStartLocation('w');
				state.setBlueEndLocation('n');
				state.updateBlueMotionParam('motionType', 'float');
				state.updateBlueMotionParam('turns', 0);
			}
		}
	];
</script>

<div class="quick-test-buttons">
	<h4>⚡ Quick Tests</h4>
	<div class="quick-test-grid">
		{#each quickTests as test}
			<button 
				class="quick-test-btn"
				onclick={test.action}
			>
				{test.label}
			</button>
		{/each}
	</div>
</div>

<style>
	.quick-test-buttons {
		background: rgba(0, 0, 0, 0.2);
		border: 1px solid rgba(255, 255, 255, 0.1);
		border-radius: 6px;
		padding: 15px;
	}

	h4 {
		margin: 0 0 12px 0;
		color: #c7d2fe;
		font-size: 0.9rem;
		font-weight: 600;
	}

	.quick-test-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
		gap: 8px;
	}

	.quick-test-btn {
		background: linear-gradient(135deg, rgba(99, 102, 241, 0.3), rgba(139, 92, 246, 0.3));
		border: 1px solid rgba(99, 102, 241, 0.5);
		color: white;
		padding: 8px 12px;
		border-radius: 4px;
		cursor: pointer;
		font-size: 0.75rem;
		font-weight: 500;
		transition: all 0.3s ease;
		text-align: center;
	}

	.quick-test-btn:hover {
		background: linear-gradient(135deg, rgba(99, 102, 241, 0.5), rgba(139, 92, 246, 0.5));
		border-color: rgba(99, 102, 241, 0.7);
		transform: translateY(-1px);
	}

	.quick-test-btn:active {
		transform: translateY(0);
	}
</style>
