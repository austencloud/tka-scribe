/**
 * YouTube Metadata Sync
 *
 * Syncs YouTube audio library metadata with Firestore.
 * Allows users to see their library on any device and re-download audio as needed.
 */

import {
  collection,
  doc,
  getDocs,
  setDoc,
  deleteDoc,
  updateDoc,
  serverTimestamp,
  query,
  orderBy,
  Timestamp,
} from "firebase/firestore";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import type {
  YouTubeAudioTrack,
  YouTubeAudioTrackLocal,
  AudioQuality,
} from "../domain/models/YouTubeAudioTrack";
import { toLocalTrack } from "../domain/models/YouTubeAudioTrack";
import { hasYouTubeAudio, listCachedVideoIds } from "./youtube-audio-persistence";

/**
 * Get reference to user's YouTube audio collection
 */
function getUserAudioCollection() {
  const auth = getAuth();
  const user = auth.currentUser;
  if (!user) {
    throw new Error("User must be authenticated to access YouTube audio library");
  }

  const db = getFirestore();
  return collection(db, "users", user.uid, "youtubeAudio");
}

/**
 * Save track metadata to Firestore
 */
export async function saveTrackMetadata(
  videoId: string,
  metadata: {
    title: string;
    channelName: string;
    thumbnailUrl: string;
    duration: number;
    quality: AudioQuality;
    fileSize?: number;
  }
): Promise<void> {
  const collectionRef = getUserAudioCollection();
  const docRef = doc(collectionRef, videoId);

  const trackData: Omit<YouTubeAudioTrack, "addedAt"> & { addedAt: ReturnType<typeof serverTimestamp> } = {
    videoId,
    title: metadata.title,
    channelName: metadata.channelName,
    thumbnailUrl: metadata.thumbnailUrl,
    duration: metadata.duration,
    quality: metadata.quality,
    addedAt: serverTimestamp() as any,
    downloadCount: 1,
    fileSize: metadata.fileSize,
  };

  await setDoc(docRef, trackData);
  console.log("📝 YouTube track metadata saved to Firestore:", metadata.title);
}

/**
 * Load all tracks from Firestore, merged with local availability
 */
export async function loadLibraryFromFirestore(): Promise<YouTubeAudioTrackLocal[]> {
  const collectionRef = getUserAudioCollection();
  const q = query(collectionRef, orderBy("addedAt", "desc"));

  const snapshot = await getDocs(q);
  const cachedIds = await listCachedVideoIds();
  const cachedIdSet = new Set(cachedIds);

  const tracks: YouTubeAudioTrackLocal[] = [];

  for (const docSnap of snapshot.docs) {
    const data = docSnap.data() as YouTubeAudioTrack;
    const isLocallyAvailable = cachedIdSet.has(data.videoId);
    tracks.push(toLocalTrack(data, isLocallyAvailable));
  }

  console.log(`📚 Loaded ${tracks.length} tracks from YouTube library`);
  return tracks;
}

/**
 * Delete track metadata from Firestore
 */
export async function deleteTrackMetadata(videoId: string): Promise<void> {
  const collectionRef = getUserAudioCollection();
  const docRef = doc(collectionRef, videoId);

  await deleteDoc(docRef);
  console.log("🗑️ YouTube track metadata deleted from Firestore:", videoId);
}

/**
 * Increment download count for a track
 */
export async function incrementDownloadCount(videoId: string): Promise<void> {
  const collectionRef = getUserAudioCollection();
  const docRef = doc(collectionRef, videoId);

  // Use Firestore increment if available, otherwise fetch and update
  await updateDoc(docRef, {
    downloadCount: (await import("firebase/firestore")).increment(1),
  });
}

/**
 * Update last played timestamp
 */
export async function updateLastPlayed(videoId: string): Promise<void> {
  const collectionRef = getUserAudioCollection();
  const docRef = doc(collectionRef, videoId);

  await updateDoc(docRef, {
    lastPlayedAt: serverTimestamp(),
  });
}

/**
 * Check if user has any saved tracks
 */
export async function hasAnyTracks(): Promise<boolean> {
  const collectionRef = getUserAudioCollection();
  const snapshot = await getDocs(collectionRef);
  return !snapshot.empty;
}

/**
 * Get track count
 */
export async function getTrackCount(): Promise<number> {
  const collectionRef = getUserAudioCollection();
  const snapshot = await getDocs(collectionRef);
  return snapshot.size;
}
