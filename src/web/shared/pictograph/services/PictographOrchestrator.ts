/**
 * 🎭 PICTOGRAPH ORCHESTRATOR SERVICE
 * 
 * Enterprise-grade pictograph orchestration service based on modern desktop architecture.
 * Coordinates all pictograph operations using focused services with clean separation of concerns.
 * 
 * Source: src/desktop/modern/src/application/services/core/pictograph_orchestrator.py
 */

import type { 
  IPictographRenderer,
  IGridRenderer,
  IArrowRenderer,
  IPropRenderer,
  IGlyphRenderer,
  ISVGAssetManager,
  IArrowPositioningOrchestrator,
  IPropPositioningService,
  RendererVisibilityOptions,
  GridMode,
  MotionData
} from '../interfaces/IPictographRenderer.js';

import type { PictographData, ArrowData, PropData, GridData } from '@tka/domain';

// ============================================================================
// PICTOGRAPH ORCHESTRATOR INTERFACE
// ============================================================================

export interface IPictographOrchestrator {
  /**
   * Create a new blank pictograph
   */
  createPictograph(gridMode?: GridMode): PictographData;
  
  /**
   * Create pictograph from beat data
   */
  createFromBeat(beatData: BeatData): PictographData;
  
  /**
   * Update pictograph arrows
   */
  updatePictographArrows(pictograph: PictographData, arrows: Record<string, ArrowData>): PictographData;
  
  /**
   * Search pictograph dataset
   */
  searchDataset(query: PictographSearchQuery): Promise<PictographData[]>;
  
  /**
   * Render complete pictograph to SVG
   */
  renderPictograph(data: PictographData): Promise<SVGElement>;
  
  /**
   * Set rendering visibility options
   */
  setVisibility(options: RendererVisibilityOptions): void;
}

// ============================================================================
// PICTOGRAPH ORCHESTRATOR IMPLEMENTATION
// ============================================================================

export class PictographOrchestrator implements IPictographOrchestrator {
  private readonly gridRenderer: IGridRenderer;
  private readonly arrowRenderer: IArrowRenderer;
  private readonly propRenderer: IPropRenderer;
  private readonly glyphRenderer: IGlyphRenderer;
  private readonly assetManager: ISVGAssetManager;
  private readonly arrowPositioning: IArrowPositioningOrchestrator;
  private readonly propPositioning: IPropPositioningService;
  
  private visibilityOptions: RendererVisibilityOptions = {
    grid: true,
    props: true,
    arrows: true,
    blueMotion: true,
    redMotion: true,
    elemental: true,
    vtg: true,
    tka: true,
    positions: true
  };

  constructor(
    gridRenderer: IGridRenderer,
    arrowRenderer: IArrowRenderer,
    propRenderer: IPropRenderer,
    glyphRenderer: IGlyphRenderer,
    assetManager: ISVGAssetManager,
    arrowPositioning: IArrowPositioningOrchestrator,
    propPositioning: IPropPositioningService
  ) {
    this.gridRenderer = gridRenderer;
    this.arrowRenderer = arrowRenderer;
    this.propRenderer = propRenderer;
    this.glyphRenderer = glyphRenderer;
    this.assetManager = assetManager;
    this.arrowPositioning = arrowPositioning;
    this.propPositioning = propPositioning;
  }

  // ============================================================================
  // PICTOGRAPH CREATION METHODS
  // ============================================================================

  createPictograph(gridMode: GridMode = GridMode.DIAMOND): PictographData {
    return {
      id: this.generateId(),
      gridData: {
        mode: gridMode,
        visible: true,
        size: gridMode === GridMode.DIAMOND ? 8 : 6
      },
      arrows: {},
      props: {},
      letter: null,
      startPosition: null,
      endPosition: null,
      isBlank: true,
      isMirrored: false,
      metadata: {
        createdAt: new Date().toISOString(),
        version: '1.0'
      }
    };
  }

  createFromBeat(beatData: BeatData): PictographData {
    const pictograph = this.createPictograph(beatData.gridMode || GridMode.DIAMOND);
    
    // Add arrows based on beat motions
    const arrows: Record<string, ArrowData> = {};
    
    if (beatData.blueMotion) {
      arrows.blue = this.createArrowData('blue', beatData.blueMotion);
    }
    
    if (beatData.redMotion) {
      arrows.red = this.createArrowData('red', beatData.redMotion);
    }

    // Add props if present
    const props: Record<string, PropData> = {};
    
    if (beatData.blueMotion && this.shouldRenderProp(beatData.blueMotion)) {
      props.blue = this.createPropData('blue', beatData.blueMotion);
    }
    
    if (beatData.redMotion && this.shouldRenderProp(beatData.redMotion)) {
      props.red = this.createPropData('red', beatData.redMotion);
    }

    return {
      ...pictograph,
      arrows,
      props,
      letter: beatData.letter,
      startPosition: beatData.startPosition,
      endPosition: beatData.endPosition,
      isBlank: Object.keys(arrows).length === 0,
      metadata: {
        ...pictograph.metadata,
        createdFromBeat: beatData.beatNumber,
        letter: beatData.letter
      }
    };
  }

  updatePictographArrows(
    pictograph: PictographData, 
    arrows: Record<string, ArrowData>
  ): PictographData {
    return {
      ...pictograph,
      arrows,
      isBlank: Object.keys(arrows).length === 0,
      metadata: {
        ...pictograph.metadata,
        lastUpdated: new Date().toISOString()
      }
    };
  }

  async searchDataset(query: PictographSearchQuery): Promise<PictographData[]> {
    // This would integrate with the dataset service
    // For now, return empty array - will be implemented with dataset integration
    return [];
  }

  // ============================================================================
  // RENDERING ORCHESTRATION
  // ============================================================================

  async renderPictograph(data: PictographData): Promise<SVGElement> {
    // Create main SVG container
    const svg = this.createSVGContainer();
    
    try {
      // Render grid (if visible)
      if (this.visibilityOptions.grid && data.gridData) {
        const gridElement = await this.gridRenderer.renderGrid(data.gridData);
        svg.appendChild(gridElement);
      }

      // Render props (if visible and present)
      if (this.visibilityOptions.props) {
        await this.renderProps(svg, data);
      }

      // Render arrows (if visible and present)
      if (this.visibilityOptions.arrows) {
        await this.renderArrows(svg, data);
      }

      // Render glyphs (if visible and data available)
      await this.renderGlyphs(svg, data);

      return svg;
      
    } catch (error) {
      console.error('Error rendering pictograph:', error);
      return this.createErrorSVG(error.message);
    }
  }

  setVisibility(options: RendererVisibilityOptions): void {
    this.visibilityOptions = { ...this.visibilityOptions, ...options };
  }

  // ============================================================================
  // PRIVATE RENDERING METHODS
  // ============================================================================

  private async renderProps(svg: SVGElement, data: PictographData): Promise<void> {
    for (const [color, propData] of Object.entries(data.props)) {
      if (this.shouldRenderColorComponent(color)) {
        const propElement = await this.propRenderer.renderProp(propData);
        svg.appendChild(propElement);
      }
    }
  }

  private async renderArrows(svg: SVGElement, data: PictographData): Promise<void> {
    for (const [color, arrowData] of Object.entries(data.arrows)) {
      if (this.shouldRenderColorComponent(color)) {
        const arrowElement = await this.arrowRenderer.renderArrow(arrowData);
        svg.appendChild(arrowElement);
      }
    }
  }

  private async renderGlyphs(svg: SVGElement, data: PictographData): Promise<void> {
    // Render TKA glyph (letter) if present and visible
    if (this.visibilityOptions.tka && data.letter) {
      const tkaGlyph = await this.glyphRenderer.renderTKAGlyph({
        letter: data.letter,
        letterType: this.determineLetterType(data.letter),
        hasDash: this.shouldShowDash(data),
        turnsData: this.extractTurnsData(data)
      });
      svg.appendChild(tkaGlyph);
    }

    // Render position glyph if positions are present and visible
    if (this.visibilityOptions.positions && data.startPosition && data.endPosition) {
      const positionGlyph = await this.glyphRenderer.renderPositionGlyph(
        data.startPosition,
        data.endPosition,
        data.letter || ''
      );
      svg.appendChild(positionGlyph);
    }
  }

  // ============================================================================
  // UTILITY METHODS
  // ============================================================================

  private createSVGContainer(): SVGElement {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 950 950');
    svg.setAttribute('width', '100%');
    svg.setAttribute('height', '100%');
    svg.style.background = 'white';
    return svg;
  }

  private createErrorSVG(message: string): SVGElement {
    const svg = this.createSVGContainer();
    const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    text.setAttribute('x', '475');
    text.setAttribute('y', '475');
    text.setAttribute('text-anchor', 'middle');
    text.setAttribute('fill', 'red');
    text.setAttribute('font-size', '24');
    text.textContent = `Error: ${message}`;
    svg.appendChild(text);
    return svg;
  }

  private createArrowData(color: string, motionData: MotionData): ArrowData {
    const position = this.arrowPositioning.calculateArrowPosition(color, motionData);
    
    return {
      id: this.generateId(),
      arrowType: color as any,
      motionData,
      color,
      turns: motionData.turns,
      isMirrored: this.arrowPositioning.shouldMirrorArrow(motionData),
      positionX: position.x,
      positionY: position.y,
      rotationAngle: position.rotation,
      isVisible: motionData.isVisible !== false,
      isSelected: false
    };
  }

  private createPropData(color: string, motionData: MotionData): PropData {
    const position = this.propPositioning.calculatePropPosition(motionData);
    
    return {
      id: this.generateId(),
      propType: this.determinePropType(motionData),
      motionData,
      color,
      positionX: position.x,
      positionY: position.y,
      rotationAngle: position.rotation,
      isVisible: motionData.isVisible !== false,
      isSelected: false
    };
  }

  private shouldRenderProp(motionData: MotionData): boolean {
    // Logic to determine if a prop should be rendered based on motion data
    // This would match the desktop app's prop rendering logic
    return motionData.motionType !== 'static' || motionData.turns > 0;
  }

  private shouldRenderColorComponent(color: string): boolean {
    if (color === 'blue') return this.visibilityOptions.blueMotion !== false;
    if (color === 'red') return this.visibilityOptions.redMotion !== false;
    return true;
  }

  private shouldShowDash(data: PictographData): boolean {
    // Logic to determine if dash should be shown
    return Object.values(data.arrows).some(arrow => 
      arrow.motionData?.motionType === 'dash'
    );
  }

  private extractTurnsData(data: PictographData): string {
    // Extract turns information for glyph rendering
    const turns = Object.values(data.arrows).map(arrow => arrow.turns);
    return turns.join(',');
  }

  private determineLetterType(letter: string): any {
    // Letter type classification logic
    // This would use the LetterTypeClassifier from the desktop app
    return 'Type1'; // Placeholder
  }

  private determinePropType(motionData: MotionData): any {
    // Determine prop type based on motion data
    return 'staff'; // Default to staff for now
  }

  private generateId(): string {
    return `pictograph-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}

// ============================================================================
// SUPPORTING INTERFACES
// ============================================================================

export interface BeatData {
  beatNumber: number;
  letter?: string;
  startPosition?: string;
  endPosition?: string;
  gridMode?: GridMode;
  blueMotion?: MotionData;
  redMotion?: MotionData;
}

export interface PictographSearchQuery {
  letter?: string;
  startPosition?: string;
  endPosition?: string;
  motionType?: string;
  gridMode?: GridMode;
}
