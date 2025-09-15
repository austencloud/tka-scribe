/**
 * Type declarations for page-flip library
 */

declare module 'page-flip' {
  export interface PageFlipConfig {
    width: number;
    height: number;
    showCover?: boolean;
    drawShadow?: boolean;
    flippingTime?: number;
    maxShadowOpacity?: number;
    mobileScrollSupport?: boolean;
    size?: 'stretch' | 'fixed';
    autoSize?: boolean;
    usePortrait?: boolean;
  }

  export interface FlipEvent {
    data: number;
  }

  export class PageFlip {
    constructor(container: HTMLElement, config: PageFlipConfig);
    
    loadFromImages(images: string[]): void;
    turnToPage(pageIndex: number): void;
    flipNext(corner?: 'top' | 'bottom'): void;
    flipPrev(corner?: 'top' | 'bottom'): void;
    getCurrentPageIndex(): number;
    getPageCount(): number;
    
    on(event: 'flip', callback: (e: FlipEvent) => void): void;
    destroy(): void;
  }
}