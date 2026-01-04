<script lang="ts">
	import { getContext, onMount } from 'svelte';
	import type { MandalaElement, TransformedElement, Point } from '../../domain/models/mandala-element';
	import type { MandalaConfig } from '../../domain/models/mandala-config';
	import type { IMandalaTransformer } from '../../services/contracts/IMandalaTransformer';
	import { CANVAS_SIZE, CANVAS_CENTER } from '../../domain/constants/symmetry-constants';
	import { mandalaState } from '../../state/mandala-state.svelte';
	import GridDotOverlay from './GridDotOverlay.svelte';
	import MandalaElementView from './MandalaElementView.svelte';

	interface Props {
		transformer?: IMandalaTransformer;
		onElementSelect?: (id: string | null) => void;
		onElementMove?: (id: string, position: Point) => void;
		onCanvasClick?: (position: Point) => void;
	}

	let {
		transformer,
		onElementSelect,
		onElementMove,
		onCanvasClick
	}: Props = $props();

	let canvasContainer: HTMLDivElement;
	let isDragging = false;
	let dragElementId: string | null = null;
	let dragOffset: Point = { x: 0, y: 0 };

	// State bindings
	const elements = $derived(mandalaState.elements);
	const config = $derived(mandalaState.config);
	const selectedElementId = $derived(mandalaState.selectedElementId);
	const hoveredElementId = $derived(mandalaState.hoveredElementId);

	// Compute transformed elements (symmetry copies)
	const transformedElements = $derived.by(() => {
		if (!transformer || elements.length === 0) return [];

		const allTransformed: TransformedElement[] = [];
		for (const element of elements) {
			const transformed = transformer.generateKaleidoscopePattern(element, config);
			// Skip the original (foldIndex 0, not mirrored) - we render source elements separately
			const copies = transformed.filter(t => t.foldIndex > 0 || t.isMirrored);
			allTransformed.push(...copies);
		}
		return allTransformed;
	});

	// Convert screen coordinates to SVG coordinates
	function screenToSvg(clientX: number, clientY: number): Point {
		if (!canvasContainer) return { x: 0, y: 0 };

		const rect = canvasContainer.getBoundingClientRect();
		const scaleX = CANVAS_SIZE / rect.width;
		const scaleY = CANVAS_SIZE / rect.height;

		return {
			x: (clientX - rect.left) * scaleX,
			y: (clientY - rect.top) * scaleY
		};
	}

	function handleCanvasClick(event: MouseEvent) {
		if (isDragging) return;

		// Check if we clicked on empty space
		const target = event.target as Element;
		if (target.closest('.mandala-element')) return;

		const position = screenToSvg(event.clientX, event.clientY);
		onCanvasClick?.(position);

		// Deselect if clicking empty space
		onElementSelect?.(null);
		mandalaState.setSelectedElementId(null);
	}

	function handleElementSelect(id: string) {
		onElementSelect?.(id);
		mandalaState.setSelectedElementId(id);
	}

	function handleElementHover(id: string | null) {
		mandalaState.setHoveredElementId(id);
	}

	function handleDragStart(id: string, event: PointerEvent) {
		const element = elements.find(e => e.id === id);
		if (!element) return;

		isDragging = true;
		dragElementId = id;
		mandalaState.setDragMode('move');

		const svgPos = screenToSvg(event.clientX, event.clientY);
		dragOffset = {
			x: svgPos.x - element.position.x,
			y: svgPos.y - element.position.y
		};

		// Capture pointer for smooth dragging
		(event.target as Element).setPointerCapture(event.pointerId);
	}

	function handlePointerMove(event: PointerEvent) {
		if (!isDragging || !dragElementId) return;

		const position = screenToSvg(event.clientX, event.clientY);
		const newPosition = {
			x: position.x - dragOffset.x,
			y: position.y - dragOffset.y
		};

		onElementMove?.(dragElementId, newPosition);
		mandalaState.updateElement(dragElementId, { position: newPosition });
	}

	function handlePointerUp(event: PointerEvent) {
		if (isDragging) {
			// Commit to history when drag ends
			mandalaState.pushHistory();
		}

		isDragging = false;
		dragElementId = null;
		mandalaState.setDragMode('none');

		(event.target as Element).releasePointerCapture?.(event.pointerId);
	}
</script>

<div
	class="mandala-canvas-container"
	bind:this={canvasContainer}
	onpointermove={handlePointerMove}
	onpointerup={handlePointerUp}
	onpointercancel={handlePointerUp}
	role="application"
	aria-label="Mandala canvas"
>
	<svg
		class="mandala-canvas"
		viewBox="0 0 {CANVAS_SIZE} {CANVAS_SIZE}"
		onclick={handleCanvasClick}
	>
		<!-- Background -->
		<rect
			x="0"
			y="0"
			width={CANVAS_SIZE}
			height={CANVAS_SIZE}
			fill="var(--theme-panel-bg, #0a0a14)"
		/>

		<!-- Symmetry guide lines (subtle) -->
		<g class="symmetry-guides" opacity="0.1">
			{#each Array(config.foldCount) as _, i}
				{@const angle = (360 / config.foldCount) * i}
				<line
					x1={CANVAS_CENTER.x}
					y1={CANVAS_CENTER.y}
					x2={CANVAS_CENTER.x + Math.cos((angle - 90) * Math.PI / 180) * (CANVAS_SIZE / 2)}
					y2={CANVAS_CENTER.y + Math.sin((angle - 90) * Math.PI / 180) * (CANVAS_SIZE / 2)}
					stroke="var(--theme-text, white)"
					stroke-width="1"
				/>
			{/each}
		</g>

		<!-- Grid dots overlay -->
		{#if config.showGridDots}
			<GridDotOverlay
				showIntercardinal={true}
				dotColor="var(--theme-text, white)"
				dotOpacity={0.2}
			/>
		{/if}

		<!-- Transformed elements (symmetry copies - rendered as ghosts) -->
		{#each transformedElements as transformed (transformed.sourceId + '-' + transformed.foldIndex + '-' + transformed.isMirrored)}
			<MandalaElementView
				element={{
					id: `${transformed.sourceId}-copy-${transformed.foldIndex}-${transformed.isMirrored}`,
					type: 'arrow',
					position: transformed.position,
					rotation: transformed.rotation,
					scale: transformed.scale,
					color: elements.find(e => e.id === transformed.sourceId)?.color ?? '#ffffff',
					svgContent: transformed.svgContent,
					zIndex: 0
				}}
				isGhost={true}
			/>
		{/each}

		<!-- Source elements (user-placed, interactive) -->
		{#each elements as element (element.id)}
			<MandalaElementView
				{element}
				isSelected={selectedElementId === element.id}
				isHovered={hoveredElementId === element.id}
				onSelect={handleElementSelect}
				onHover={handleElementHover}
				onDragStart={handleDragStart}
			/>
		{/each}
	</svg>

	<!-- Canvas info overlay -->
	<div class="canvas-info">
		<span class="info-label">{config.foldCount}-fold</span>
		{#if config.enableMirror}
			<span class="info-label">Mirror: {config.mirrorAxis}</span>
		{/if}
		<span class="info-label">{elements.length} element{elements.length !== 1 ? 's' : ''}</span>
	</div>
</div>

<style>
	.mandala-canvas-container {
		position: relative;
		width: 100%;
		aspect-ratio: 1;
		background: var(--theme-panel-bg, #0a0a14);
		border-radius: var(--settings-radius-md, 8px);
		overflow: hidden;
		touch-action: none;
	}

	.mandala-canvas {
		display: block;
		width: 100%;
		height: 100%;
	}

	.symmetry-guides {
		pointer-events: none;
	}

	.canvas-info {
		position: absolute;
		bottom: 8px;
		left: 8px;
		display: flex;
		gap: 8px;
		pointer-events: none;
	}

	.info-label {
		font-size: var(--font-size-compact, 12px);
		color: var(--theme-text-muted, rgba(255, 255, 255, 0.5));
		background: rgba(0, 0, 0, 0.4);
		padding: 2px 6px;
		border-radius: 4px;
	}
</style>
