/**
 * Secure Token Storage Service
 *
 * Provides secure storage for OAuth tokens with encryption
 * and automatic token refresh capabilities.
 */
import { browser } from '$app/environment';
import { logger } from '$lib/core/logging';

// Storage keys for different platforms
export const TOKEN_STORAGE_KEYS = {
	FACEBOOK: 'auth_token_facebook',
	INSTAGRAM: 'auth_token_instagram',
	TIKTOK: 'auth_token_tiktok',
	FACEBOOK_GROUP: 'auth_token_facebook_group'
};

// Token data interface
export interface TokenData {
	accessToken: string;
	refreshToken?: string;
	expiresAt?: number; // Timestamp when token expires
	tokenType?: string;
	scope?: string;
	userId?: string;
	platformUserId?: string;
}

/**
 * Simple encryption for token storage
 * Note: This is not highly secure but provides basic obfuscation
 * @param data Data to encrypt
 * @param key Encryption key (default uses a combination of domain and user agent)
 */
function encrypt(data: string, key?: string): string {
	if (!browser) return data;

	// Create a simple key if none provided
	const encKey = key || `${window.location.hostname}-${navigator.userAgent.substring(0, 10)}`;

	// Simple XOR encryption
	let result = '';
	for (let i = 0; i < data.length; i++) {
		const charCode = data.charCodeAt(i) ^ encKey.charCodeAt(i % encKey.length);
		result += String.fromCharCode(charCode);
	}

	// Convert to base64 for storage
	return btoa(result);
}

/**
 * Decrypt stored token data
 * @param encryptedData Encrypted data
 * @param key Encryption key (must match the one used for encryption)
 */
function decrypt(encryptedData: string, key?: string): string {
	if (!browser) return encryptedData;

	try {
		// Create the same key used for encryption
		const encKey = key || `${window.location.hostname}-${navigator.userAgent.substring(0, 10)}`;

		// Decode from base64
		const data = atob(encryptedData);

		// XOR decryption
		let result = '';
		for (let i = 0; i < data.length; i++) {
			const charCode = data.charCodeAt(i) ^ encKey.charCodeAt(i % encKey.length);
			result += String.fromCharCode(charCode);
		}

		return result;
	} catch (error) {
		logger.error('Failed to decrypt token data', {
			error: error instanceof Error ? error : new Error(String(error))
		});
		return '';
	}
}

/**
 * Save a token to secure storage
 * @param platform Platform identifier (use TOKEN_STORAGE_KEYS constants)
 * @param tokenData Token data to store
 */
export function saveToken(platform: string, tokenData: TokenData): boolean {
	if (!browser) return false;

	try {
		const serialized = JSON.stringify(tokenData);
		const encrypted = encrypt(serialized);
		localStorage.setItem(platform, encrypted);
		return true;
	} catch (error) {
		logger.error('Failed to save token', {
			error: error instanceof Error ? error : new Error(String(error))
		});
		return false;
	}
}

/**
 * Get a token from secure storage
 * @param platform Platform identifier (use TOKEN_STORAGE_KEYS constants)
 */
export function getToken(platform: string): TokenData | null {
	if (!browser) return null;

	try {
		const encrypted = localStorage.getItem(platform);
		if (!encrypted) return null;

		const decrypted = decrypt(encrypted);
		return JSON.parse(decrypted) as TokenData;
	} catch (error) {
		logger.error('Failed to get token', {
			error: error instanceof Error ? error : new Error(String(error))
		});
		return null;
	}
}

/**
 * Check if a token exists and is valid (not expired)
 * @param platform Platform identifier
 */
export function hasValidToken(platform: string): boolean {
	const token = getToken(platform);
	if (!token) return false;

	// Check if token has expiration and is still valid
	if (token.expiresAt) {
		const now = Date.now();
		return token.expiresAt > now;
	}

	// If no expiration, just check if we have an access token
	return !!token.accessToken;
}

/**
 * Remove a token from storage
 * @param platform Platform identifier
 */
export function removeToken(platform: string): void {
	if (!browser) return;
	localStorage.removeItem(platform);
}

/**
 * Clear all stored tokens
 */
export function clearAllTokens(): void {
	if (!browser) return;

	Object.values(TOKEN_STORAGE_KEYS).forEach((key) => {
		localStorage.removeItem(key);
	});
}
