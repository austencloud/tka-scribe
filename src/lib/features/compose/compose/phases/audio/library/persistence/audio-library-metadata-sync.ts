/**
 * Audio Library Metadata Sync
 *
 * Syncs audio library metadata with Firestore.
 * Allows users to see their library on any device.
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
} from "firebase/firestore";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import type { AudioTrack, AudioTrackLocal, AudioSource } from "../domain/models/AudioTrack";
import { toLocalTrack } from "../domain/models/AudioTrack";
import { listCachedTrackIds } from "./audio-library-persistence";

/**
 * Get reference to user's audio library collection
 */
function getUserAudioCollection() {
  const auth = getAuth();
  const user = auth.currentUser;
  if (!user) {
    throw new Error("User must be authenticated to access audio library");
  }

  const db = getFirestore();
  return collection(db, "users", user.uid, "audioLibrary");
}

/**
 * Save track metadata to Firestore
 */
export async function saveTrackMetadata(
  trackId: string,
  metadata: {
    title: string;
    artist: string;
    thumbnailUrl?: string;
    duration: number;
    source: AudioSource;
    fileSize?: number;
    bpm?: number;
    originalFilename?: string;
    cloudUrl?: string;
  }
): Promise<void> {
  const collectionRef = getUserAudioCollection();
  const docRef = doc(collectionRef, trackId);

  const trackData: Omit<AudioTrack, "addedAt"> & { addedAt: ReturnType<typeof serverTimestamp> } = {
    trackId,
    title: metadata.title,
    artist: metadata.artist,
    thumbnailUrl: metadata.thumbnailUrl,
    duration: metadata.duration,
    source: metadata.source,
    addedAt: serverTimestamp() as any,
    downloadCount: 1,
    fileSize: metadata.fileSize,
    bpm: metadata.bpm,
    originalFilename: metadata.originalFilename,
    cloudUrl: metadata.cloudUrl,
  };

  await setDoc(docRef, trackData);
  console.log("📝 Track metadata saved to Firestore:", metadata.title);
}

/**
 * Update track metadata (for adding cloudUrl later)
 */
export async function updateTrackMetadata(
  trackId: string,
  updates: Partial<AudioTrack>
): Promise<void> {
  const collectionRef = getUserAudioCollection();
  const docRef = doc(collectionRef, trackId);

  await updateDoc(docRef, updates as any);
  console.log("📝 Track metadata updated:", trackId);
}

/**
 * Load all tracks from Firestore, merged with local availability
 */
export async function loadLibraryFromFirestore(): Promise<AudioTrackLocal[]> {
  const collectionRef = getUserAudioCollection();
  const q = query(collectionRef, orderBy("addedAt", "desc"));

  const snapshot = await getDocs(q);
  const cachedIds = await listCachedTrackIds();
  const cachedIdSet = new Set(cachedIds);

  const tracks: AudioTrackLocal[] = [];

  for (const docSnap of snapshot.docs) {
    const data = docSnap.data() as AudioTrack;
    const isLocallyAvailable = cachedIdSet.has(data.trackId);
    tracks.push(toLocalTrack(data, isLocallyAvailable));
  }

  console.log(`📚 Loaded ${tracks.length} tracks from audio library`);
  return tracks;
}

/**
 * Delete track metadata from Firestore
 */
export async function deleteTrackMetadata(trackId: string): Promise<void> {
  const collectionRef = getUserAudioCollection();
  const docRef = doc(collectionRef, trackId);

  await deleteDoc(docRef);
  console.log("🗑️ Track metadata deleted from Firestore:", trackId);
}

/**
 * Update last played timestamp
 */
export async function updateLastPlayed(trackId: string): Promise<void> {
  const collectionRef = getUserAudioCollection();
  const docRef = doc(collectionRef, trackId);

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
