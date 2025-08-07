/**
 * Pictograph Rendering Service - Complete Rendering Engine
 * 
 * This service handles the actual SVG rendering of pictographs.
 * Integrates with the sophisticated ArrowPositioningService for accurate positioning.
 */

import type { BeatData } from '@tka/schemas';
import type {
	IPictographRenderingService,
	PictographData,
	IArrowPositioningService,
	IPropRenderingService,
	ArrowPosition,
	GridData
} from '../interfaces';

export class PictographRenderingService implements IPictographRenderingService {
	private readonly SVG_SIZE = 300;
	private readonly CENTER_X = 150;
	private readonly CENTER_Y = 150;

	constructor(
		private arrowPositioning: IArrowPositioningService,
		private propRendering: IPropRenderingService
	) {
		console.log('🎨 PictographRenderingService initialized with sophisticated positioning and prop rendering');
	}

	/**
	 * Render a pictograph from pictograph data
	 */
	async renderPictograph(data: PictographData): Promise<SVGElement> {
		try {
			console.log('🎨 Rendering pictograph with sophisticated positioning:', data.id);
			const svg = this.createBaseSVG();
			
			// 1. Render grid first
			this.renderGrid(svg, data.gridData?.mode || 'diamond');
			
			// 2. Calculate arrow positions using sophisticated positioning service
			const gridData = this.createDefaultGridData();
			console.log('📊 Using grid data:', gridData);
			
			const arrowPositions = await this.arrowPositioning.calculateAllArrowPositions(
				data,
				gridData
			);
			console.log(`🏹 Calculated ${arrowPositions.size} arrow positions:`, Object.fromEntries(arrowPositions));
			
			// 3. Render arrows with sophisticated calculated positions
			for (const [color, position] of arrowPositions.entries()) {
				console.log(`🎯 Rendering ${color} arrow at sophisticated position:`, position);
				this.renderArrowAtPosition(svg, color as 'blue' | 'red', position);
			}

			// 4. Render props
			await this.renderProps(svg, data);

			// 5. Add metadata
			this.renderIdLabel(svg, data);
			this.renderDebugInfo(svg, data, arrowPositions);
			
			console.log('✅ Pictograph rendering complete with sophisticated positioning');
			return svg;
		} catch (error) {
			console.error('❌ Error rendering pictograph:', error);
			return this.createErrorSVG(error.message);
		}
	}

	/**
	 * Render a beat as a pictograph
	 */
	async renderBeat(beat: BeatData): Promise<SVGElement> {
		// Convert beat data to pictograph data
		const pictographData = this.beatToPictographData(beat);
		return this.renderPictograph(pictographData);
	}

	/**
	 * Create base SVG element
	 */
	private createBaseSVG(): SVGElement {
		const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
		svg.setAttribute('width', this.SVG_SIZE.toString());
		svg.setAttribute('height', this.SVG_SIZE.toString());
		svg.setAttribute('viewBox', `0 0 ${this.SVG_SIZE} ${this.SVG_SIZE}`);
		svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
		
		// Add background
		const background = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
		background.setAttribute('width', '100%');
		background.setAttribute('height', '100%');
		background.setAttribute('fill', '#ffffff');
		svg.appendChild(background);
		
		return svg;
	}

	/**
	 * Create default grid data for positioning calculations
	 */
	private createDefaultGridData(): GridData {
		// Create comprehensive grid coordinates that match desktop system
		const center = { x: this.CENTER_X, y: this.CENTER_Y };
		const size = 80;
		
		return {
			mode: 'diamond',
			allLayer2PointsNormal: {
				// Layer 2 points (shift positions) for diamond grid
				'n_diamond_layer2_point': { coordinates: { x: center.x, y: center.y - size } },
				'ne_diamond_layer2_point': { coordinates: { x: center.x + size * 0.707, y: center.y - size * 0.707 } },
				'e_diamond_layer2_point': { coordinates: { x: center.x + size, y: center.y } },
				'se_diamond_layer2_point': { coordinates: { x: center.x + size * 0.707, y: center.y + size * 0.707 } },
				's_diamond_layer2_point': { coordinates: { x: center.x, y: center.y + size } },
				'sw_diamond_layer2_point': { coordinates: { x: center.x - size * 0.707, y: center.y + size * 0.707 } },
				'w_diamond_layer2_point': { coordinates: { x: center.x - size, y: center.y } },
				'nw_diamond_layer2_point': { coordinates: { x: center.x - size * 0.707, y: center.y - size * 0.707 } },
				'center_diamond_layer2_point': { coordinates: { x: center.x, y: center.y } },
			},
			allHandPointsNormal: {
				// Hand points (static/dash positions) for diamond grid
				'n_diamond_hand_point': { coordinates: { x: center.x, y: center.y - size * 0.6 } },
				'ne_diamond_hand_point': { coordinates: { x: center.x + size * 0.424, y: center.y - size * 0.424 } },
				'e_diamond_hand_point': { coordinates: { x: center.x + size * 0.6, y: center.y } },
				'se_diamond_hand_point': { coordinates: { x: center.x + size * 0.424, y: center.y + size * 0.424 } },
				's_diamond_hand_point': { coordinates: { x: center.x, y: center.y + size * 0.6 } },
				'sw_diamond_hand_point': { coordinates: { x: center.x - size * 0.424, y: center.y + size * 0.424 } },
				'w_diamond_hand_point': { coordinates: { x: center.x - size * 0.6, y: center.y } },
				'nw_diamond_hand_point': { coordinates: { x: center.x - size * 0.424, y: center.y - size * 0.424 } },
				'center_diamond_hand_point': { coordinates: { x: center.x, y: center.y } },
			}
		};
	}
	
	/**
	 * Render arrow at sophisticated calculated position
	 */
	private renderArrowAtPosition(
		svg: SVGElement,
		color: 'blue' | 'red',
		position: ArrowPosition
	): void {
		console.log(`🎨 Rendering ${color} arrow with sophisticated positioning:`, position);
		
		// Create arrow group with metadata
		const arrowGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
		arrowGroup.setAttribute('class', `arrow-${color} sophisticated-positioning`);
		arrowGroup.setAttribute('data-color', color);
		arrowGroup.setAttribute('data-position', `${position.x},${position.y}`);
		arrowGroup.setAttribute('data-rotation', position.rotation.toString());
		
		// Apply sophisticated position and rotation transform
		const transform = `translate(${position.x}, ${position.y}) rotate(${position.rotation})`;
		arrowGroup.setAttribute('transform', transform);
		
		// Create enhanced arrow path
		const arrowPath = this.createEnhancedArrowPath(color);
		arrowGroup.appendChild(arrowPath);
		
		// Add position indicator for debugging
		const positionIndicator = this.createPositionIndicator(color);
		arrowGroup.appendChild(positionIndicator);
		
		svg.appendChild(arrowGroup);
		console.log(`✅ ${color} arrow rendered with sophisticated positioning`);
	}
	
	/**
	 * Create enhanced arrow SVG path with sophisticated styling
	 */
	private createEnhancedArrowPath(color: 'blue' | 'red'): SVGElement {
		const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
		
		// More sophisticated arrow shape
		path.setAttribute('d', 'M 0,-25 L 15,0 L 0,25 L -8,15 L -8,-15 Z');
		path.setAttribute('fill', color);
		path.setAttribute('stroke', '#000000');
		path.setAttribute('stroke-width', '2');
		path.setAttribute('opacity', '0.9');
		
		// Add sophisticated styling
		path.setAttribute('filter', 'drop-shadow(1px 1px 2px rgba(0,0,0,0.3))');
		path.setAttribute('class', 'sophisticated-arrow');
		
		return path;
	}
	
	/**
	 * Create position indicator for debugging
	 */
	private createPositionIndicator(color: 'blue' | 'red'): SVGElement {
		const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
		circle.setAttribute('cx', '0');
		circle.setAttribute('cy', '0');
		circle.setAttribute('r', '3');
		circle.setAttribute('fill', color === 'blue' ? '#0066ff' : '#ff0066');
		circle.setAttribute('opacity', '0.7');
		circle.setAttribute('class', 'position-indicator');
		return circle;
	}
	
	/**
	 * Render ID label with enhanced metadata
	 */
	private renderIdLabel(svg: SVGElement, data: PictographData): void {
		const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
		text.setAttribute('x', this.CENTER_X.toString());
		text.setAttribute('y', (this.CENTER_Y + 130).toString());
		text.setAttribute('text-anchor', 'middle');
		text.setAttribute('font-family', 'monospace');
		text.setAttribute('font-size', '11');
		text.setAttribute('fill', '#4b5563');
		text.textContent = `${data.id.slice(-8)} • Sophisticated Positioning`;
		svg.appendChild(text);
	}
	
	/**
	 * Render debug information about positioning
	 */
	private renderDebugInfo(svg: SVGElement, data: PictographData, positions: Map<string, ArrowPosition>): void {
		let yOffset = 15;
		
		for (const [color, position] of positions.entries()) {
			const debugText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
			debugText.setAttribute('x', '10');
			debugText.setAttribute('y', yOffset.toString());
			debugText.setAttribute('font-family', 'monospace');
			debugText.setAttribute('font-size', '10');
			debugText.setAttribute('fill', '#6b7280');
			debugText.textContent = `${color}: [${position.x.toFixed(1)}, ${position.y.toFixed(1)}] ∠${position.rotation.toFixed(0)}°`;
			svg.appendChild(debugText);
			yOffset += 12;
		}
		
		// Add letter info if present
		if (data.letter) {
			const letterText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
			letterText.setAttribute('x', '10');
			letterText.setAttribute('y', yOffset.toString());
			letterText.setAttribute('font-family', 'monospace');
			letterText.setAttribute('font-size', '10');
			letterText.setAttribute('fill', '#059669');
			letterText.setAttribute('font-weight', 'bold');
			letterText.textContent = `Letter: ${data.letter}`;
			svg.appendChild(letterText);
		}
	}
	
	/**
	 * Render props for both colors
	 */
	private async renderProps(svg: SVGElement, data: PictographData): Promise<void> {
		try {
			const gridMode = data.gridData?.mode || 'diamond';

			// Render blue prop if motion exists
			if (data.motions.blue) {
				console.log('🎭 Rendering blue prop');
				const blueProp = await this.propRendering.renderProp(
					'staff', // Default prop type for now
					'blue',
					data.motions.blue,
					gridMode
				);
				svg.appendChild(blueProp);
			}

			// Render red prop if motion exists
			if (data.motions.red) {
				console.log('🎭 Rendering red prop');
				const redProp = await this.propRendering.renderProp(
					'staff', // Default prop type for now
					'red',
					data.motions.red,
					gridMode
				);
				svg.appendChild(redProp);
			}

			console.log('✅ Props rendered successfully');
		} catch (error) {
			console.error('❌ Error rendering props:', error);
			// Continue without props rather than failing completely
		}
	}

	/**
	 * Render grid (enhanced implementation)
	 */
	private renderGrid(svg: SVGElement, gridMode: 'diamond' | 'box' = 'diamond'): void {
		// Create diamond grid outline
		const diamond = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
		const size = 100;
		const points = [
			`${this.CENTER_X},${this.CENTER_Y - size}`, // top
			`${this.CENTER_X + size},${this.CENTER_Y}`, // right
			`${this.CENTER_X},${this.CENTER_Y + size}`, // bottom
			`${this.CENTER_X - size},${this.CENTER_Y}`, // left
		].join(' ');
		
		diamond.setAttribute('points', points);
		diamond.setAttribute('fill', 'none');
		diamond.setAttribute('stroke', '#e5e7eb');
		diamond.setAttribute('stroke-width', '2');
		
		svg.appendChild(diamond);
	}



	/**
	 * Convert beat data to pictograph data
	 */
	private beatToPictographData(beat: BeatData): PictographData {
		return {
			id: `beat-${beat.beatNumber}`,
			gridData: { mode: 'diamond' },
			arrows: { blue: {}, red: {} },
			props: { blue: {}, red: {} },
			motions: {
				blue: beat.blueMotion,
				red: beat.redMotion
			},
			letter: beat.letter
		};
	}

	/**
	 * Create error SVG with detailed error information
	 */
	private createErrorSVG(errorMessage?: string): SVGElement {
		const svg = this.createBaseSVG();
		
		const errorText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
		errorText.setAttribute('x', this.CENTER_X.toString());
		errorText.setAttribute('y', this.CENTER_Y.toString());
		errorText.setAttribute('text-anchor', 'middle');
		errorText.setAttribute('fill', '#dc2626');
		errorText.setAttribute('font-weight', 'bold');
		errorText.textContent = 'Rendering Error';
		
		if (errorMessage) {
			const detailText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
			detailText.setAttribute('x', this.CENTER_X.toString());
			detailText.setAttribute('y', (this.CENTER_Y + 20).toString());
			detailText.setAttribute('text-anchor', 'middle');
			detailText.setAttribute('fill', '#dc2626');
			detailText.setAttribute('font-size', '12');
			detailText.textContent = errorMessage.substring(0, 50) + (errorMessage.length > 50 ? '...' : '');
			svg.appendChild(detailText);
		}
		
		svg.appendChild(errorText);
		return svg;
	}
}
