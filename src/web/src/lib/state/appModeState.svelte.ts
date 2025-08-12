/**
 * App Mode State Management - Unified Landing + App Experience
 * 
 * Manages the transition between:
 * - Landing Mode: Marketing pages (Home, About, Contact, etc.)  
 * - App Mode: Professional application interface (Construct, Browse, etc.)
 * 
 * Uses Svelte 5 runes for reactive state management
 */

export type AppMode = 'landing' | 'app';
export type TransitionDirection = 'enter' | 'exit';

// Core app mode state
let currentMode = $state<AppMode>('landing');
let isTransitioning = $state<boolean>(false);
let transitionDirection = $state<TransitionDirection>('enter');

// Landing page background state (integrated with landing system)
let landingBackground = $state<'deepOcean' | 'snowfall' | 'nightSky'>('nightSky');

// Transition animation settings
const TRANSITION_DURATION = 600; // ms for fold animation
const TRANSITION_EASING = 'cubic-bezier(0.4, 0.0, 0.2, 1)'; // Material Design easing

/**
 * State Getters - Use these in components with $derived
 */
export function getAppMode(): AppMode {
    return currentMode;
}

export function getIsTransitioning(): boolean {
    return isTransitioning;
}

export function getTransitionDirection(): TransitionDirection {
    return transitionDirection;
}

export function getLandingBackground(): 'deepOcean' | 'snowfall' | 'nightSky' {
    return landingBackground;
}

export function isLandingMode(): boolean {
    return currentMode === 'landing';
}

export function isAppMode(): boolean {
    return currentMode === 'app';
}

/**
 * Mode Transitions with Animations
 */
export async function enterAppMode(): Promise<void> {
    if (currentMode === 'app' || isTransitioning) return;
    
    console.log('🚀 Entering app mode...');
    isTransitioning = true;
    transitionDirection = 'enter';
    
    // Trigger fold animation
    await new Promise(resolve => setTimeout(resolve, TRANSITION_DURATION));
    
    currentMode = 'app';
    isTransitioning = false;
    
    console.log('✅ App mode active');
}

export async function returnToLanding(): Promise<void> {
    if (currentMode === 'landing' || isTransitioning) return;
    
    console.log('🏠 Returning to landing...');
    isTransitioning = true;
    transitionDirection = 'exit';
    
    // Trigger fold-back animation
    await new Promise(resolve => setTimeout(resolve, TRANSITION_DURATION));
    
    currentMode = 'landing';
    isTransitioning = false;
    
    console.log('✅ Landing mode active');
}

/**
 * Landing Background Management
 */
export function setLandingBackground(background: 'deepOcean' | 'snowfall' | 'nightSky'): void {
    landingBackground = background;
    console.log(`🌌 Landing background set to: ${background}`);
}

/**
 * Transition Configuration
 */
export function getTransitionConfig() {
    return {
        duration: TRANSITION_DURATION,
        easing: TRANSITION_EASING,
    };
}

/**
 * Development Helpers
 */
export function debugModeState(): void {
    console.log('🔧 App Mode State Debug:', {
        currentMode,
        isTransitioning,
        transitionDirection,
        landingBackground
    });
}

// Development mode toggle (for testing)
export function toggleMode(): void {
    if (currentMode === 'landing') {
        enterAppMode();
    } else {
        returnToLanding();
    }
}
