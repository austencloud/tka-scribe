/**
 * Pictograph Rendering Service - Core rendering engine
 * 
 * This service handles the actual SVG rendering of pictographs.
 * Eventually this will integrate with the shared rendering infrastructure.
 */

import type { BeatData } from '@tka/schemas';
import type { IPictographRenderingService, PictographData } from '../interfaces';

export class PictographRenderingService implements IPictographRenderingService {
	private readonly SVG_SIZE = 300;
	private readonly CENTER_X = 150;
	private readonly CENTER_Y = 150;

	/**
	 * Render a pictograph from pictograph data
	 */
	async renderPictograph(data: PictographData): Promise<SVGElement> {
		try {
			const svg = this.createBaseSVG();
			
			// TODO: Integrate with shared rendering infrastructure
			// For now, render basic placeholder
			this.renderGrid(svg);
			this.renderPlaceholderContent(svg, data);
			
			return svg;
		} catch (error) {
			console.error('Error rendering pictograph:', error);
			return this.createErrorSVG();
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
	 * Render grid (placeholder implementation)
	 */
	private renderGrid(svg: SVGElement): void {
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
	 * Render placeholder content
	 */
	private renderPlaceholderContent(svg: SVGElement, data: PictographData): void {
		// Blue arrow placeholder
		if (data.motions.blue) {
			const blueArrow = this.createArrowPlaceholder('blue', -30);
			svg.appendChild(blueArrow);
		}

		// Red arrow placeholder  
		if (data.motions.red) {
			const redArrow = this.createArrowPlaceholder('red', 30);
			svg.appendChild(redArrow);
		}

		// Add beat number or ID
		const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
		text.setAttribute('x', this.CENTER_X.toString());
		text.setAttribute('y', (this.CENTER_Y + 130).toString());
		text.setAttribute('text-anchor', 'middle');
		text.setAttribute('font-family', 'monospace');
		text.setAttribute('font-size', '12');
		text.setAttribute('fill', '#6b7280');
		text.textContent = data.id.slice(-8);
		svg.appendChild(text);
	}

	/**
	 * Create arrow placeholder
	 */
	private createArrowPlaceholder(color: 'blue' | 'red', xOffset: number): SVGElement {
		const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
		
		// Arrow line
		const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
		line.setAttribute('x1', (this.CENTER_X + xOffset).toString());
		line.setAttribute('y1', (this.CENTER_Y - 20).toString());
		line.setAttribute('x2', (this.CENTER_X + xOffset).toString());
		line.setAttribute('y2', (this.CENTER_Y + 20).toString());
		line.setAttribute('stroke', color);
		line.setAttribute('stroke-width', '3');
		line.setAttribute('marker-end', `url(#arrowhead-${color})`);
		
		// Arrow marker
		const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
		const marker = document.createElementNS('http://www.w3.org/2000/svg', 'marker');
		marker.setAttribute('id', `arrowhead-${color}`);
		marker.setAttribute('markerWidth', '10');
		marker.setAttribute('markerHeight', '7');
		marker.setAttribute('refX', '9');
		marker.setAttribute('refY', '3.5');
		marker.setAttribute('orient', 'auto');
		
		const polygon = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
		polygon.setAttribute('points', '0 0, 10 3.5, 0 7');
		polygon.setAttribute('fill', color);
		
		marker.appendChild(polygon);
		defs.appendChild(marker);
		group.appendChild(defs);
		group.appendChild(line);
		
		return group;
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
			}
		};
	}

	/**
	 * Create error SVG
	 */
	private createErrorSVG(): SVGElement {
		const svg = this.createBaseSVG();
		
		const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
		text.setAttribute('x', this.CENTER_X.toString());
		text.setAttribute('y', this.CENTER_Y.toString());
		text.setAttribute('text-anchor', 'middle');
		text.setAttribute('fill', '#dc2626');
		text.textContent = 'Render Error';
		
		svg.appendChild(text);
		return svg;
	}
}
