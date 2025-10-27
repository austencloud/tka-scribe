import { writable, derived } from 'svelte/store';
import type { PanelState, LayoutOrientation } from '../types';

// Initial panel state
const initialState: PanelState = {
	isVisible: true,
	isAnimatingOut: false,
	isPulsing: true,
	layout: 'horizontal'
};

// Create the panel state store
const createPanelStore = () => {
	const { subscribe, update, set } = writable<PanelState>(initialState);

	return {
		subscribe,

		// Toggle panel visibility with animation
		toggle: () => {
			update((state) => {
				if (state.isVisible) {
					// Start animation out
					return { ...state, isAnimatingOut: true, isPulsing: false };
				} else {
					// Show immediately when opening
					return { ...state, isVisible: true, isAnimatingOut: false, isPulsing: false };
				}
			});
		},

		// Called after animation completes
		completeAnimation: () => {
			update((state) => {
				if (state.isAnimatingOut) {
					return { ...state, isVisible: false, isAnimatingOut: false };
				}
				return state;
			});
		},

		// Update layout orientation
		setLayout: (layout: LayoutOrientation) => {
			update((state) => ({ ...state, layout }));
		},

		// Stop pulsing animation
		stopPulsing: () => {
			update((state) => ({ ...state, isPulsing: false }));
		},

		// Reset store to initial state
		reset: () => set(initialState)
	};
};

// Export the panel store
export const panelStore = createPanelStore();

// Derived store to calculate button size based on container dimensions
export const buttonSizeStore = derived<
	[typeof panelStore],
	(width: number, height: number, isPortrait: boolean) => number
>([panelStore], ([$panelState]) => {
	return (width: number, height: number, isPortrait: boolean) => {
		const isMobile = width <= 768;

		if (isMobile) {
			return Math.max(30, Math.min(60, width / 10));
		} else if (isPortrait) {
			return Math.max(30, Math.min(60, width / 10));
		} else {
			return Math.max(30, Math.min(60, height / 14));
		}
	};
});
