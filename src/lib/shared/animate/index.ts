/**
 * Shared Animation Infrastructure
 *
 * Core animation functionality shared across the app.
 * Used by: Share panel, Animate module, Quick Play, Sequence Viewer
 *
 * Architecture:
 * - state/: Animation settings (persisted) and playback state (per-instance)
 * - components/: Reusable UI components (canvas, controls, settings)
 * - services/: Core rendering services (contracts for now, implementations in module)
 * - domain/: Types and models for animation
 */

// State management (settings, playback)
export * from './state';

// Components (AnimatorCanvas, TrailSettingsChips)
export * from './components';

// Domain types (PropState, PropStates, animation models)
// Note: state and domain both have some overlapping concerns,
// but domain is the canonical source for PropState/PropStates
export * from './domain';

// Service contracts (implementations still in animate module for now)
export * from './services';
