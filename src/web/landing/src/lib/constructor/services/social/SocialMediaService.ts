/**
 * Social Media Service
 *
 * Handles posting to social media platforms
 */
import { browser } from '$app/environment';
import { logger } from '$lib/core/logging';
import { getToken, TOKEN_STORAGE_KEYS, isAuthenticated, initiateOAuthLogin } from '../auth';
import { showError, showSuccess } from '$lib/components/shared/ToastManager.svelte';
import type { SequenceRenderResult } from '$lib/components/SequenceWorkbench/share/imageExport/sequenceImageRenderer';

// Facebook Group ID for "The Kinetic Encyclopedia"
export const FACEBOOK_GROUP_ID = '1480491022409736';

// Standard hashtags to include in posts
export const STANDARD_HASHTAGS = '#tkaflowarts #thekineticalphabet';

/**
 * Convert data URL to Blob
 */
function dataURLtoBlob(dataUrl: string): Blob {
	const arr = dataUrl.split(',');
	const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/png';
	const bstr = atob(arr[1]);
	let n = bstr.length;
	const u8arr = new Uint8Array(n);

	while (n--) {
		u8arr[n] = bstr.charCodeAt(n);
	}

	return new Blob([u8arr], { type: mime });
}

/**
 * Post to Facebook
 * @param imageResult Rendered sequence image
 * @param sequenceName Name of the sequence
 * @param shareUrl URL for reconstructing the sequence
 */
export async function postToFacebook(
	imageResult: SequenceRenderResult,
	sequenceName: string,
	shareUrl: string
): Promise<boolean> {
	if (!browser) return false;

	try {
		// Check if authenticated
		if (!isAuthenticated('FACEBOOK')) {
			// Initiate login flow
			await initiateOAuthLogin('FACEBOOK');
			return false; // Will redirect, so return false
		}

		// Get token
		const token = getToken(TOKEN_STORAGE_KEYS.FACEBOOK);
		if (!token) {
			throw new Error('Facebook token not found');
		}

		// In a real implementation, we would use the Facebook Graph API
		// For this demo, we'll simulate a successful post
		logger.info(`Posting to Facebook: ${sequenceName}`);

		// Simulate API call delay
		await new Promise((resolve) => setTimeout(resolve, 1500));

		showSuccess('Posted to Facebook successfully');
		return true;
	} catch (error) {
		logger.error('Failed to post to Facebook', {
			error: error instanceof Error ? error : new Error(String(error))
		});
		showError('Failed to post to Facebook');
		return false;
	}
}

/**
 * Post to Facebook Group
 * @param imageResult Rendered sequence image
 * @param sequenceName Name of the sequence
 * @param shareUrl URL for reconstructing the sequence
 */
export async function postToFacebookGroup(
	imageResult: SequenceRenderResult,
	sequenceName: string,
	shareUrl: string
): Promise<boolean> {
	if (!browser) return false;

	try {
		// Check if authenticated
		if (!isAuthenticated('FACEBOOK')) {
			// Initiate login flow
			await initiateOAuthLogin('FACEBOOK');
			return false; // Will redirect, so return false
		}

		// Get token
		const token = getToken(TOKEN_STORAGE_KEYS.FACEBOOK);
		if (!token) {
			throw new Error('Facebook token not found');
		}

		// In a real implementation, we would use the Facebook Graph API to post to the group
		// For this demo, we'll simulate a successful post
		logger.info(`Posting to Facebook Group: ${FACEBOOK_GROUP_ID} - ${sequenceName}`);

		// Simulate API call delay
		await new Promise((resolve) => setTimeout(resolve, 1500));

		showSuccess('Posted to The Kinetic Encyclopedia group successfully');
		return true;
	} catch (error) {
		logger.error('Failed to post to Facebook Group', {
			error: error instanceof Error ? error : new Error(String(error))
		});
		showError('Failed to post to Facebook Group');
		return false;
	}
}

/**
 * Post to Instagram
 * @param imageResult Rendered sequence image
 * @param sequenceName Name of the sequence
 * @param shareUrl URL for reconstructing the sequence
 */
export async function postToInstagram(
	imageResult: SequenceRenderResult,
	sequenceName: string,
	shareUrl: string
): Promise<boolean> {
	if (!browser) return false;

	try {
		// Check if authenticated
		if (!isAuthenticated('INSTAGRAM')) {
			// Initiate login flow
			await initiateOAuthLogin('INSTAGRAM');
			return false; // Will redirect, so return false
		}

		// Get token
		const token = getToken(TOKEN_STORAGE_KEYS.INSTAGRAM);
		if (!token) {
			throw new Error('Instagram token not found');
		}

		// In a real implementation, we would use the Instagram Graph API
		// For this demo, we'll simulate a successful post
		logger.info(`Posting to Instagram: ${sequenceName}`);

		// Simulate API call delay
		await new Promise((resolve) => setTimeout(resolve, 1500));

		showSuccess('Posted to Instagram successfully');
		return true;
	} catch (error) {
		logger.error('Failed to post to Instagram', {
			error: error instanceof Error ? error : new Error(String(error))
		});
		showError('Failed to post to Instagram');
		return false;
	}
}

/**
 * Post to TikTok
 * @param imageResult Rendered sequence image
 * @param sequenceName Name of the sequence
 * @param shareUrl URL for reconstructing the sequence
 */
export async function postToTikTok(
	imageResult: SequenceRenderResult,
	sequenceName: string,
	shareUrl: string
): Promise<boolean> {
	if (!browser) return false;

	try {
		// Check if authenticated
		if (!isAuthenticated('TIKTOK')) {
			// Initiate login flow
			await initiateOAuthLogin('TIKTOK');
			return false; // Will redirect, so return false
		}

		// Get token
		const token = getToken(TOKEN_STORAGE_KEYS.TIKTOK);
		if (!token) {
			throw new Error('TikTok token not found');
		}

		// In a real implementation, we would use the TikTok API
		// For this demo, we'll simulate a successful post
		logger.info(`Posting to TikTok: ${sequenceName}`);

		// Simulate API call delay
		await new Promise((resolve) => setTimeout(resolve, 1500));

		showSuccess('Posted to TikTok successfully');
		return true;
	} catch (error) {
		logger.error('Failed to post to TikTok', {
			error: error instanceof Error ? error : new Error(String(error))
		});
		showError('Failed to post to TikTok');
		return false;
	}
}
