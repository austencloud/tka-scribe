// src/lib/components/MainWidget/state/appStateMachine.ts
import { createMachine, assign, fromCallback } from 'xstate';
import type { BackgroundType } from './appState';
import { initializeApplication } from '$lib/utils/appInitializer';
import type { AnyActorLogic, EventObject } from 'xstate';

// --- Context Definition ---
export interface AppMachineContext {
	currentTab: number;
	previousTab: number;
	background: BackgroundType;
	isFullScreen: boolean;
	isSettingsOpen: boolean;
	initializationError: string | null;
	loadingProgress: number;
	loadingMessage: string;
	contentVisible: boolean; // Will be kept true once ready
	backgroundIsReady: boolean;
}

// --- Event Definitions ---
export type AppMachineEvents =
	| { type: 'BACKGROUND_READY' }
	| { type: 'INITIALIZATION_SUCCESS' }
	| { type: 'INITIALIZATION_FAILURE'; error: string }
	| { type: 'UPDATE_PROGRESS'; progress: number; message: string }
	| { type: 'RETRY_INITIALIZATION' }
	| { type: 'CHANGE_TAB'; tab: number }
	| { type: 'TOGGLE_FULLSCREEN' }
	| { type: 'OPEN_SETTINGS' }
	| { type: 'CLOSE_SETTINGS' }
	| { type: 'UPDATE_BACKGROUND'; background: string };

// --- Actor Logic Definition ---
type InitializationActorInput = undefined | { someData?: string };

export const initializeApplicationActorLogic = fromCallback<
	AppMachineEvents,
	InitializationActorInput
>(({ sendBack, receive }) => {
	const progressCallback = (progress: number, message: string) => {
		sendBack({ type: 'UPDATE_PROGRESS', progress, message });
	};
	initializeApplication(progressCallback)
		.then((success) => {
			sendBack(
				success
					? { type: 'INITIALIZATION_SUCCESS' }
					: { type: 'INITIALIZATION_FAILURE', error: 'Initialization returned false.' }
			);
		})
		.catch((error) => {
			const errorMessage = error instanceof Error ? error.message : 'Unknown initialization error';
			sendBack({ type: 'INITIALIZATION_FAILURE', error: errorMessage });
		});
	return () => {};
});

// --- State Machine Definition ---
export const appStateMachine = createMachine(
	{
		id: 'appMachine',
		// Define machine types
		types: {} as {
			context: AppMachineContext;
			events: AppMachineEvents;
			actors: {
				src: 'initializeApplication';
				logic: typeof initializeApplicationActorLogic;
			};
		},
		// Initial context
		context: {
			currentTab: 0,
			previousTab: 0,
			background: 'snowfall',
			isFullScreen: false,
			isSettingsOpen: false,
			initializationError: null,
			loadingProgress: 0,
			loadingMessage: 'Initializing...',
			contentVisible: false, // Start hidden
			backgroundIsReady: false
		},
		initial: 'initializingBackground',
		// Define states
		states: {
			initializingBackground: {
				entry: assign({
					backgroundIsReady: false,
					initializationError: null,
					loadingProgress: 0,
					loadingMessage: 'Loading background...',
					contentVisible: false
				}),
				on: {
					BACKGROUND_READY: {
						target: 'initializingApp',
						actions: assign({ backgroundIsReady: true })
					}
				}
			},
			initializingApp: {
				entry: assign({
					initializationError: null,
					loadingProgress: 0,
					loadingMessage: 'Initializing application...',
					contentVisible: false
				}),
				invoke: { id: 'initApp', src: 'initializeApplication' },
				on: {
					UPDATE_PROGRESS: {
						actions: assign({
							loadingProgress: ({ event }) => event.progress,
							loadingMessage: ({ event }) => event.message
						})
					},
					INITIALIZATION_SUCCESS: {
						target: 'ready',
						actions: assign({
							loadingProgress: 100,
							loadingMessage: 'Ready!',
							initializationError: null
						})
					},
					INITIALIZATION_FAILURE: {
						target: 'initializationFailed',
						actions: assign({ initializationError: ({ event }) => event.error, loadingProgress: 0 })
					}
				}
			},
			initializationFailed: {
				on: {
					RETRY_INITIALIZATION: {
						target: 'initializingApp',
						guard: ({ context }) => context.backgroundIsReady
					}
				}
			},
			ready: {
				// Set contentVisible true on entry and keep it true
				entry: assign({
					contentVisible: true,
					loadingProgress: 0,
					loadingMessage: ''
				}),
				on: {
					CHANGE_TAB: {
						target: 'ready', // Stay in ready state
						actions: 'startTabTransition', // Run action to update context
						guard: ({ context, event }) => context.currentTab !== event.tab
					},
					// Other events handled in the ready state
					TOGGLE_FULLSCREEN: {
						actions: assign({ isFullScreen: ({ context }) => !context.isFullScreen })
					},
					OPEN_SETTINGS: { actions: assign({ isSettingsOpen: true }) },
					CLOSE_SETTINGS: { actions: assign({ isSettingsOpen: false }) },
					UPDATE_BACKGROUND: {
						actions: assign({
							background: ({ event, context: currentContext }) => {
								const validBackgrounds: BackgroundType[] = ['snowfall'];
								return validBackgrounds.includes(event.background as BackgroundType)
									? (event.background as BackgroundType)
									: currentContext.background;
							}
						})
					}
				}
			}
		}
	},
	// Implementation options
	{
		actions: {
			startTabTransition: assign(({ context, event }) => {
				if (event.type === 'CHANGE_TAB') {
					return {
						previousTab: context.currentTab,
						currentTab: event.tab
					};
				}
				return {};
			})
		},
		actors: {
			initializeApplication: initializeApplicationActorLogic
		},
		guards: {},
		delays: {}
	}
);
