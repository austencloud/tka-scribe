/**
 * Animation timing constants
 * Centralized timing values for consistent animation behavior
 */

/**
 * Delay before loading animation to allow Drawer slide animation to complete
 */
export const ANIMATION_LOAD_DELAY_MS = 320;

/**
 * Delay before auto-starting animation after load
 */
export const ANIMATION_AUTO_START_DELAY_MS = 100;

/**
 * Delay before rendering frame during GIF export
 */
export const GIF_FRAME_RENDER_DELAY_MS = 50;

/**
 * Delay before initial frame capture during GIF export
 */
export const GIF_INITIAL_CAPTURE_DELAY_MS = 100;

/**
 * Delay before closing export dialog after successful export
 */
export const GIF_EXPORT_SUCCESS_DELAY_MS = 1500;

/**
 * Default frames per second for animation export
 * Note: GIF format has a practical max of ~50 FPS (20ms minimum frame delay)
 * 50 FPS provides smooth animation while staying within GIF limits
 */
export const GIF_EXPORT_FPS = 50;

/**
 * Number of frames to capture per animation beat
 * 50 frames per beat at 50 FPS = 1 second per beat at 1x speed
 */
export const GIF_FRAMES_PER_BEAT = 50;

/**
 * GIF export quality (1 = best, 20 = worst)
 * Lower values = better color accuracy but slower encoding
 * 1 gives best quality for smooth gradients and edges
 */
export const GIF_EXPORT_QUALITY = 1;
