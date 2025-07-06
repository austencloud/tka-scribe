/**
 * OAuth Service for Social Media Platforms
 *
 * Handles authentication flows for Facebook, Instagram, and TikTok
 */
import { browser } from '$app/environment';
import { logger } from '$lib/core/logging';
import {
	getToken,
	saveToken,
	removeToken,
	TOKEN_STORAGE_KEYS,
	type TokenData
} from './SecureTokenStorage';
import { showError, showSuccess } from '$lib/components/shared/ToastManager.svelte';

// OAuth configuration
interface OAuthConfig {
	clientId: string;
	redirectUri: string;
	scope: string;
	authUrl: string;
	tokenUrl?: string;
}

// Platform configurations
const OAUTH_CONFIG: Record<string, OAuthConfig> = browser
	? {
			FACEBOOK: {
				clientId: import.meta.env.VITE_FACEBOOK_APP_ID || '',
				redirectUri: `${window.location.origin}/auth/callback/facebook`,
				scope: 'public_profile,publish_to_groups',
				authUrl: 'https://www.facebook.com/v16.0/dialog/oauth'
			},
			INSTAGRAM: {
				clientId: import.meta.env.VITE_INSTAGRAM_APP_ID || '',
				redirectUri: `${window.location.origin}/auth/callback/instagram`,
				scope: 'user_profile,user_media',
				authUrl: 'https://api.instagram.com/oauth/authorize'
			},
			TIKTOK: {
				clientId: import.meta.env.VITE_TIKTOK_APP_ID || '',
				redirectUri: `${window.location.origin}/auth/callback/tiktok`,
				scope: 'user.info.basic,video.publish',
				authUrl: 'https://www.tiktok.com/auth/authorize/'
			}
		}
	: {
			// Server-side fallbacks with placeholder values
			FACEBOOK: {
				clientId: '',
				redirectUri: '/auth/callback/facebook',
				scope: 'public_profile,publish_to_groups',
				authUrl: 'https://www.facebook.com/v16.0/dialog/oauth'
			},
			INSTAGRAM: {
				clientId: '',
				redirectUri: '/auth/callback/instagram',
				scope: 'user_profile,user_media',
				authUrl: 'https://api.instagram.com/oauth/authorize'
			},
			TIKTOK: {
				clientId: '',
				redirectUri: '/auth/callback/tiktok',
				scope: 'user.info.basic,video.publish',
				authUrl: 'https://www.tiktok.com/auth/authorize/'
			}
		};

// PKCE Code Verifier storage key
const CODE_VERIFIER_KEY = 'oauth_code_verifier';

/**
 * Generate a random string for PKCE code verifier
 */
function generateCodeVerifier(): string {
	if (!browser) {
		// Return a placeholder for SSR
		return 'server-side-placeholder-verifier';
	}

	const array = new Uint8Array(32);
	crypto.getRandomValues(array);
	return Array.from(array, (byte) => String.fromCharCode(byte)).join('');
}

/**
 * Generate code challenge from verifier (for PKCE)
 */
async function generateCodeChallenge(verifier: string): Promise<string> {
	if (!browser) {
		// Return a placeholder for SSR
		return 'server-side-placeholder-challenge';
	}

	const encoder = new TextEncoder();
	const data = encoder.encode(verifier);
	const digest = await crypto.subtle.digest('SHA-256', data);

	return btoa(String.fromCharCode(...new Uint8Array(digest)))
		.replace(/\+/g, '-')
		.replace(/\//g, '_')
		.replace(/=+$/, '');
}

/**
 * Initiate OAuth login flow
 * @param platform Platform identifier (FACEBOOK, INSTAGRAM, TIKTOK)
 */
export async function initiateOAuthLogin(platform: string): Promise<void> {
	if (!browser) return;

	try {
		const config = OAUTH_CONFIG[platform];
		if (!config) {
			throw new Error(`Unknown platform: ${platform}`);
		}

		if (!config.clientId) {
			showError(`${platform} App ID not configured. Please check your environment variables.`);
			return;
		}

		// Generate and store PKCE code verifier
		const codeVerifier = generateCodeVerifier();
		if (browser) {
			localStorage.setItem(CODE_VERIFIER_KEY, codeVerifier);
		}

		// Generate code challenge
		const codeChallenge = await generateCodeChallenge(codeVerifier);

		// Build authorization URL
		const authUrl = new URL(config.authUrl);
		authUrl.searchParams.append('client_id', config.clientId);
		authUrl.searchParams.append('redirect_uri', config.redirectUri);
		authUrl.searchParams.append('scope', config.scope);
		authUrl.searchParams.append('response_type', 'code');
		authUrl.searchParams.append('code_challenge', codeChallenge);
		authUrl.searchParams.append('code_challenge_method', 'S256');
		authUrl.searchParams.append('state', platform); // Use platform as state

		// Redirect to authorization URL
		if (browser) {
			window.location.href = authUrl.toString();
		} else {
			// For SSR, log that we would redirect (this code won't actually execute)
			logger.info(`[SSR] Would redirect to: ${authUrl.toString()}`);
		}
	} catch (error) {
		logger.error('Failed to initiate OAuth login', {
			error: error instanceof Error ? error : new Error(String(error))
		});
		showError(`Failed to connect to ${platform}`);
	}
}

/**
 * Handle OAuth callback
 * @param platform Platform identifier
 * @param code Authorization code from callback
 */
export async function handleOAuthCallback(platform: string, code: string): Promise<boolean> {
	if (!browser) return false;

	try {
		const config = OAUTH_CONFIG[platform];
		if (!config) {
			throw new Error(`Unknown platform: ${platform}`);
		}

		// Get code verifier (only in browser context)
		let codeVerifier = null;
		if (browser) {
			codeVerifier = localStorage.getItem(CODE_VERIFIER_KEY);
			if (!codeVerifier) {
				throw new Error('Code verifier not found');
			}

			// Clear code verifier
			localStorage.removeItem(CODE_VERIFIER_KEY);
		} else {
			// This is a fallback for SSR, though this code should never execute
			// since we return early if !browser at the start of the function
			codeVerifier = 'server-side-placeholder-verifier';
		}

		// Exchange code for token (this would typically be done server-side)
		// For demo purposes, we'll simulate a successful token response
		// In a real implementation, we would use the 'code' parameter to exchange for a token
		logger.info(`Processing authorization code: ${code.substring(0, 5)}...`);

		const tokenData: TokenData = {
			accessToken: `mock_${platform}_token_${Date.now()}`,
			refreshToken: `mock_refresh_${Date.now()}`,
			expiresAt: Date.now() + 3600000, // 1 hour from now
			tokenType: 'bearer',
			scope: config.scope,
			userId: `user_${Date.now()}`
		};

		// Save token
		const storageKey = TOKEN_STORAGE_KEYS[platform as keyof typeof TOKEN_STORAGE_KEYS];
		if (!storageKey) {
			throw new Error(`No storage key for platform: ${platform}`);
		}

		saveToken(storageKey, tokenData);
		showSuccess(`Connected to ${platform} successfully`);
		return true;
	} catch (error) {
		logger.error('Failed to handle OAuth callback', {
			error: error instanceof Error ? error : new Error(String(error))
		});
		showError(`Failed to complete ${platform} authentication`);
		return false;
	}
}

/**
 * Check if user is authenticated with a platform
 * @param platform Platform identifier
 */
export function isAuthenticated(platform: string): boolean {
	const storageKey = TOKEN_STORAGE_KEYS[platform as keyof typeof TOKEN_STORAGE_KEYS];
	if (!storageKey) return false;

	const token = getToken(storageKey);
	return !!token && !!token.accessToken;
}

/**
 * Logout from a platform
 * @param platform Platform identifier
 */
export function logout(platform: string): void {
	const storageKey = TOKEN_STORAGE_KEYS[platform as keyof typeof TOKEN_STORAGE_KEYS];
	if (!storageKey) return;

	removeToken(storageKey);
}
