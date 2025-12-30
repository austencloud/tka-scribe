/**
 * Cloud Thumbnail Cache Contract
 *
 * Manages thumbnail storage in Firebase Storage for crowd-sourced rendering.
 * When a user encounters a prop type for the first time, they render it locally
 * and upload to Firebase Storage so future users get instant loading.
 *
 * Storage structure: /thumbnails/{propType}/{sequenceName}_{mode}.webp
 * Example: /thumbnails/club/Butterfly_dark.webp
 */

import type { PropType } from "$lib/shared/pictograph/prop/domain/enums/PropType";

export interface CloudThumbnailKey {
  sequenceName: string;
  propType: PropType;
  lightMode: boolean;
}

export interface CloudThumbnailResult {
  url: string;
  blob: Blob;
  fromCache: boolean;
}

export interface ICloudThumbnailCache {
  /**
   * Get thumbnail URL from Firebase Storage
   * Returns null if thumbnail doesn't exist in cloud
   */
  getUrl(key: CloudThumbnailKey): Promise<string | null>;

  /**
   * Download thumbnail blob from Firebase Storage
   * Returns null if thumbnail doesn't exist
   */
  download(key: CloudThumbnailKey): Promise<Blob | null>;

  /**
   * Check if thumbnail exists in Firebase Storage
   */
  exists(key: CloudThumbnailKey): Promise<boolean>;

  /**
   * Upload rendered thumbnail to Firebase Storage
   * Returns the public URL of the uploaded image
   * Handles race conditions gracefully (first upload wins)
   */
  upload(key: CloudThumbnailKey, blob: Blob): Promise<string>;

  /**
   * Get the storage path for a thumbnail
   */
  getStoragePath(key: CloudThumbnailKey): string;
}
