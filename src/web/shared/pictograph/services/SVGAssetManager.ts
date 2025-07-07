/**
 * 🎨 SVG ASSET MANAGER
 * 
 * Enterprise-grade SVG asset management with caching, color transformation, and optimization.
 * Based on modern desktop app asset management patterns.
 * 
 * Source: src/desktop/modern/src/presentation/components/pictograph/asset_utils.py
 */

import type { ISVGAssetManager, AssetType } from '../interfaces/IPictographRenderer.js';

// ============================================================================
// SVG ASSET MANAGER IMPLEMENTATION
// ============================================================================

export class SVGAssetManager implements ISVGAssetManager {
  private readonly assetCache = new Map<string, SVGElement>();
  private readonly loadingPromises = new Map<string, Promise<SVGElement>>();
  private readonly baseAssetPath: string;

  constructor(baseAssetPath: string = '/assets/pictograph') {
    this.baseAssetPath = baseAssetPath;
  }

  // ============================================================================
  // ASSET LOADING METHODS
  // ============================================================================

  async loadSVGAsset(path: string): Promise<SVGElement> {
    // Check cache first
    const cached = this.assetCache.get(path);
    if (cached) {
      return cached.cloneNode(true) as SVGElement;
    }

    // Check if already loading
    const existingPromise = this.loadingPromises.get(path);
    if (existingPromise) {
      const result = await existingPromise;
      return result.cloneNode(true) as SVGElement;
    }

    // Start loading
    const loadingPromise = this.loadSVGFromPath(path);
    this.loadingPromises.set(path, loadingPromise);

    try {
      const svgElement = await loadingPromise;
      this.cacheSVGAsset(path, svgElement);
      this.loadingPromises.delete(path);
      return svgElement.cloneNode(true) as SVGElement;
    } catch (error) {
      this.loadingPromises.delete(path);
      throw error;
    }
  }

  cacheSVGAsset(path: string, element: SVGElement): void {
    // Store a clean copy in cache
    const cleanCopy = element.cloneNode(true) as SVGElement;
    this.assetCache.set(path, cleanCopy);
  }

  applyColorTransformation(svgContent: string, color: string): string {
    // Apply color transformation to SVG content
    const colorMap = this.getColorMap(color);
    
    let transformedSvg = svgContent;
    
    // Replace fill colors
    for (const [original, replacement] of Object.entries(colorMap.fill)) {
      const fillRegex = new RegExp(`fill="${original}"`, 'gi');
      transformedSvg = transformedSvg.replace(fillRegex, `fill="${replacement}"`);
      
      const fillStyleRegex = new RegExp(`fill:\\s*${original}`, 'gi');
      transformedSvg = transformedSvg.replace(fillStyleRegex, `fill: ${replacement}`);
    }
    
    // Replace stroke colors
    for (const [original, replacement] of Object.entries(colorMap.stroke)) {
      const strokeRegex = new RegExp(`stroke="${original}"`, 'gi');
      transformedSvg = transformedSvg.replace(strokeRegex, `stroke="${replacement}"`);
      
      const strokeStyleRegex = new RegExp(`stroke:\\s*${original}`, 'gi');
      transformedSvg = transformedSvg.replace(strokeStyleRegex, `stroke: ${replacement}`);
    }

    return transformedSvg;
  }

  getAssetPath(type: AssetType, identifier: string): string {
    switch (type) {
      case AssetType.ARROW:
        return this.getArrowAssetPath(identifier);
      case AssetType.PROP:
        return this.getPropAssetPath(identifier);
      case AssetType.GRID:
        return this.getGridAssetPath(identifier);
      case AssetType.GLYPH:
        return this.getGlyphAssetPath(identifier);
      default:
        throw new Error(`Unknown asset type: ${type}`);
    }
  }

  // ============================================================================
  // PRIVATE ASSET LOADING METHODS
  // ============================================================================

  private async loadSVGFromPath(path: string): Promise<SVGElement> {
    try {
      const fullPath = path.startsWith('http') ? path : `${this.baseAssetPath}/${path}`;
      const response = await fetch(fullPath);
      
      if (!response.ok) {
        throw new Error(`Failed to load SVG: ${response.status} ${response.statusText}`);
      }
      
      const svgText = await response.text();
      return this.parseSVGText(svgText);
      
    } catch (error) {
      console.error(`Error loading SVG from ${path}:`, error);
      return this.createFallbackSVG(path);
    }
  }

  private parseSVGText(svgText: string): SVGElement {
    const parser = new DOMParser();
    const doc = parser.parseFromString(svgText, 'image/svg+xml');
    
    const svgElement = doc.querySelector('svg');
    if (!svgElement) {
      throw new Error('Invalid SVG content - no SVG element found');
    }
    
    // Ensure proper namespace
    if (!svgElement.namespaceURI) {
      svgElement.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    }
    
    return svgElement;
  }

  private createFallbackSVG(path: string): SVGElement {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 100 100');
    svg.setAttribute('width', '100');
    svg.setAttribute('height', '100');
    
    // Create a simple fallback shape
    const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    rect.setAttribute('x', '10');
    rect.setAttribute('y', '10');
    rect.setAttribute('width', '80');
    rect.setAttribute('height', '80');
    rect.setAttribute('fill', '#ddd');
    rect.setAttribute('stroke', '#999');
    
    const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    text.setAttribute('x', '50');
    text.setAttribute('y', '55');
    text.setAttribute('text-anchor', 'middle');
    text.setAttribute('font-size', '12');
    text.setAttribute('fill', '#666');
    text.textContent = '?';
    
    svg.appendChild(rect);
    svg.appendChild(text);
    
    console.warn(`Using fallback SVG for missing asset: ${path}`);
    return svg;
  }

  // ============================================================================
  // ASSET PATH GENERATION METHODS
  // ============================================================================

  private getArrowAssetPath(identifier: string): string {
    // Parse identifier to determine arrow type and path
    // Format: "motionType_turns" or "motionType_turns_color"
    const parts = identifier.split('_');
    const motionType = parts[0] || 'static';
    const turns = parts[1] || '0';
    
    switch (motionType.toLowerCase()) {
      case 'static':
        return `arrows/static/from_radial/static_${turns}.svg`;
      case 'pro':
        return `arrows/pro/from_radial/pro_${turns}.svg`;
      case 'anti':
        return `arrows/anti/from_radial/anti_${turns}.svg`;
      case 'dash':
        return `arrows/dash/from_radial/dash_${turns}.svg`;
      case 'float':
        return `arrows/float.svg`;
      default:
        return `arrows/static/from_radial/static_${turns}.svg`;
    }
  }

  private getPropAssetPath(identifier: string): string {
    // Map prop types to asset paths
    const propPaths: Record<string, string> = {
      'staff': 'props/staff.svg',
      'club': 'props/club.svg',
      'hand': 'props/hand.svg',
      'buugeng': 'props/buugeng.svg',
      'bigstaff': 'props/bigstaff.svg',
      'simplestaff': 'props/simplestaff.svg'
    };
    
    return propPaths[identifier.toLowerCase()] || 'props/staff.svg';
  }

  private getGridAssetPath(identifier: string): string {
    // Map grid modes to asset paths
    const gridPaths: Record<string, string> = {
      'diamond': 'grid/diamond_grid.svg',
      'box': 'grid/box_grid.svg'
    };
    
    return gridPaths[identifier.toLowerCase()] || 'grid/diamond_grid.svg';
  }

  private getGlyphAssetPath(identifier: string): string {
    // Parse glyph identifier and return appropriate path
    // Format: "type_letter" or "type_mode"
    const parts = identifier.split('_');
    const glyphType = parts[0] || 'tka';
    const glyphId = parts[1] || 'A';
    
    switch (glyphType.toLowerCase()) {
      case 'tka':
        return `glyphs/tka/${glyphId}.svg`;
      case 'vtg':
        return `glyphs/vtg/${glyphId}.svg`;
      case 'elemental':
        return `glyphs/elemental/${glyphId}.svg`;
      case 'position':
        return `glyphs/position/${glyphId}.svg`;
      default:
        return `glyphs/tka/${glyphId}.svg`;
    }
  }

  // ============================================================================
  // COLOR TRANSFORMATION METHODS
  // ============================================================================

  private getColorMap(color: string): { fill: Record<string, string>; stroke: Record<string, string> } {
    const colorMaps: Record<string, any> = {
      blue: {
        fill: {
          '#000000': '#0066cc',
          '#000': '#0066cc',
          'black': '#0066cc'
        },
        stroke: {
          '#000000': '#004499',
          '#000': '#004499',
          'black': '#004499'
        }
      },
      red: {
        fill: {
          '#000000': '#cc0000',
          '#000': '#cc0000',
          'black': '#cc0000'
        },
        stroke: {
          '#000000': '#990000',
          '#000': '#990000',
          'black': '#990000'
        }
      }
    };
    
    return colorMaps[color.toLowerCase()] || {
      fill: {},
      stroke: {}
    };
  }

  // ============================================================================
  // CACHE MANAGEMENT METHODS
  // ============================================================================

  clearCache(): void {
    this.assetCache.clear();
    this.loadingPromises.clear();
  }

  getCacheSize(): number {
    return this.assetCache.size;
  }

  getCachedPaths(): string[] {
    return Array.from(this.assetCache.keys());
  }

  preloadAssets(paths: string[]): Promise<void[]> {
    const loadPromises = paths.map(path => 
      this.loadSVGAsset(path).catch(error => {
        console.warn(`Failed to preload asset ${path}:`, error);
      })
    );
    
    return Promise.all(loadPromises);
  }
}
