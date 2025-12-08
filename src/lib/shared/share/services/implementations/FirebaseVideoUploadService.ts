/**
 * Firebase Video Upload Service
 *
 * Handles uploading user performance videos to Firebase Storage.
 * Videos are stored at: users/{userId}/recordings/{sequenceId}/{timestamp}.mp4
 */

import { injectable } from "inversify";
import type { IFirebaseVideoUploadService } from "../contracts/IFirebaseVideoUploadService";
import { getStorageInstance } from "$lib/shared/auth/firebase";
import { auth } from "$lib/shared/auth/firebase";

@injectable()
export class FirebaseVideoUploadService implements IFirebaseVideoUploadService {
  /**
   * Get current user ID
   */
  private getUserId(): string {
    const user = auth.currentUser;
    if (!user) {
      throw new Error("User must be authenticated to upload videos");
    }
    return user.uid;
  }

  /**
   * Upload a performance video for a sequence
   */
  async uploadPerformanceVideo(
    sequenceId: string,
    videoFile: File | Blob,
    onProgress?: (percent: number) => void
  ): Promise<string> {
    const {
      ref,
      uploadBytesResumable,
      getDownloadURL,
    } = await import("firebase/storage");
    const storage = await getStorageInstance();
    const userId = this.getUserId();

    // Generate storage path: users/{userId}/recordings/{sequenceId}/{timestamp}.mp4
    const timestamp = Date.now();
    const extension = videoFile instanceof File 
      ? videoFile.name.split(".").pop() || "mp4" 
      : "mp4";
    const storagePath = `users/${userId}/recordings/${sequenceId}/${timestamp}.${extension}`;

    console.log(`📤 Uploading video to: ${storagePath}`);

    // Create storage reference
    const storageRef = ref(storage, storagePath);

    // Upload with progress tracking
    const uploadTask = uploadBytesResumable(storageRef, videoFile, {
      contentType: videoFile.type || "video/mp4",
      customMetadata: {
        sequenceId,
        userId,
        uploadedAt: new Date().toISOString(),
      },
    });

    // Return promise that resolves when upload completes
    return new Promise((resolve, reject) => {
      uploadTask.on(
        "state_changed",
        (snapshot) => {
          // Calculate progress percentage
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          onProgress?.(Math.round(progress));
          console.log(`📤 Upload progress: ${progress.toFixed(1)}%`);
        },
        (error) => {
          console.error("❌ Upload failed:", error);
          reject(error);
        },
        async () => {
          // Upload completed successfully
          try {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            console.log("✅ Upload complete:", downloadURL);
            resolve(downloadURL);
          } catch (error) {
            reject(error);
          }
        }
      );
    });
  }

  /**
   * Upload animated sequence (WebP or GIF)
   */
  async uploadAnimatedSequence(
    sequenceId: string,
    animationBlob: Blob,
    format: "webp" | "gif"
  ): Promise<string> {
    const { ref, uploadBytes, getDownloadURL } = await import("firebase/storage");
    const storage = await getStorageInstance();
    const userId = this.getUserId();

    // Storage path: users/{userId}/animations/{sequenceId}/sequence.{format}
    const storagePath = `users/${userId}/animations/${sequenceId}/sequence.${format}`;

    console.log(`📤 Uploading animation to: ${storagePath}`);

    const storageRef = ref(storage, storagePath);
    await uploadBytes(storageRef, animationBlob, {
      contentType: format === "webp" ? "image/webp" : "image/gif",
      customMetadata: {
        sequenceId,
        userId,
        uploadedAt: new Date().toISOString(),
      },
    });

    const downloadURL = await getDownloadURL(storageRef);
    console.log("✅ Animation upload complete:", downloadURL);
    return downloadURL;
  }

  /**
   * Delete all assets for a sequence
   */
  async deleteSequenceAssets(sequenceId: string): Promise<void> {
    const { ref, listAll, deleteObject } = await import("firebase/storage");
    const storage = await getStorageInstance();
    const userId = this.getUserId();

    // Delete recordings
    const recordingsPath = `users/${userId}/recordings/${sequenceId}`;
    const recordingsRef = ref(storage, recordingsPath);

    try {
      const recordingsList = await listAll(recordingsRef);
      await Promise.all(recordingsList.items.map((item) => deleteObject(item)));
      console.log(`🗑️ Deleted ${recordingsList.items.length} recordings for sequence ${sequenceId}`);
    } catch (error) {
      console.warn("Failed to delete recordings:", error);
    }

    // Delete animations
    const animationsPath = `users/${userId}/animations/${sequenceId}`;
    const animationsRef = ref(storage, animationsPath);

    try {
      const animationsList = await listAll(animationsRef);
      await Promise.all(animationsList.items.map((item) => deleteObject(item)));
      console.log(`🗑️ Deleted ${animationsList.items.length} animations for sequence ${sequenceId}`);
    } catch (error) {
      console.warn("Failed to delete animations:", error);
    }
  }

  /**
   * Get public download URL for a storage path
   */
  async getPublicUrl(storagePath: string): Promise<string> {
    const { ref, getDownloadURL } = await import("firebase/storage");
    const storage = await getStorageInstance();
    const storageRef = ref(storage, storagePath);
    return getDownloadURL(storageRef);
  }
}
