/**
 * YouTube Audio Persistence
 *
 * Uses IndexedDB to cache extracted YouTube audio files locally.
 * Allows instant playback without re-downloading from the cloud.
 */

const DB_NAME = "tka-youtube-audio";
const DB_VERSION = 1;
const STORE_NAME = "youtube-tracks";

/**
 * Persisted YouTube audio data structure
 */
interface PersistedYouTubeAudio {
  /** YouTube video ID (primary key) */
  videoId: string;

  /** Audio file data */
  file: ArrayBuffer;

  /** MIME type (typically audio/mpeg) */
  mimeType: string;

  /** Track title for display */
  title: string;

  /** Duration in seconds */
  duration: number;

  /** Thumbnail URL */
  thumbnailUrl: string;

  /** File size in bytes */
  fileSize: number;

  /** When this was cached */
  savedAt: number;
}

/**
 * Open the IndexedDB database
 */
function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: "videoId" });
        store.createIndex("savedAt", "savedAt", { unique: false });
      }
    };
  });
}

/**
 * Save YouTube audio to IndexedDB
 */
export async function saveYouTubeAudio(
  videoId: string,
  audioBlob: Blob,
  metadata: {
    title: string;
    duration: number;
    thumbnailUrl: string;
  }
): Promise<void> {
  try {
    const db = await openDatabase();
    const arrayBuffer = await audioBlob.arrayBuffer();

    const data: PersistedYouTubeAudio = {
      videoId,
      file: arrayBuffer,
      mimeType: audioBlob.type || "audio/mpeg",
      title: metadata.title,
      duration: metadata.duration,
      thumbnailUrl: metadata.thumbnailUrl,
      fileSize: arrayBuffer.byteLength,
      savedAt: Date.now(),
    };

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, "readwrite");
      const store = transaction.objectStore(STORE_NAME);
      const request = store.put(data);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        console.log("🎵 YouTube audio cached:", metadata.title);
        resolve();
      };
    });
  } catch (err) {
    console.warn("Failed to cache YouTube audio:", err);
    throw err;
  }
}

/**
 * Load YouTube audio from IndexedDB
 */
export async function loadYouTubeAudio(
  videoId: string
): Promise<{ blob: Blob; metadata: { title: string; duration: number; thumbnailUrl: string } } | null> {
  try {
    const db = await openDatabase();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, "readonly");
      const store = transaction.objectStore(STORE_NAME);
      const request = store.get(videoId);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const data = request.result as PersistedYouTubeAudio | undefined;
        if (!data) {
          resolve(null);
          return;
        }

        const blob = new Blob([data.file], { type: data.mimeType });
        console.log("🎵 YouTube audio loaded from cache:", data.title);
        resolve({
          blob,
          metadata: {
            title: data.title,
            duration: data.duration,
            thumbnailUrl: data.thumbnailUrl,
          },
        });
      };
    });
  } catch (err) {
    console.warn("Failed to load cached YouTube audio:", err);
    return null;
  }
}

/**
 * Check if YouTube audio is cached locally
 */
export async function hasYouTubeAudio(videoId: string): Promise<boolean> {
  try {
    const db = await openDatabase();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, "readonly");
      const store = transaction.objectStore(STORE_NAME);
      const request = store.getKey(videoId);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        resolve(request.result !== undefined);
      };
    });
  } catch (err) {
    console.warn("Failed to check YouTube audio cache:", err);
    return false;
  }
}

/**
 * Delete YouTube audio from IndexedDB
 */
export async function deleteYouTubeAudio(videoId: string): Promise<void> {
  try {
    const db = await openDatabase();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, "readwrite");
      const store = transaction.objectStore(STORE_NAME);
      const request = store.delete(videoId);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        console.log("🎵 YouTube audio deleted from cache:", videoId);
        resolve();
      };
    });
  } catch (err) {
    console.warn("Failed to delete YouTube audio from cache:", err);
    throw err;
  }
}

/**
 * List all cached YouTube audio video IDs
 */
export async function listCachedVideoIds(): Promise<string[]> {
  try {
    const db = await openDatabase();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, "readonly");
      const store = transaction.objectStore(STORE_NAME);
      const request = store.getAllKeys();

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        resolve(request.result as string[]);
      };
    });
  } catch (err) {
    console.warn("Failed to list cached YouTube audio:", err);
    return [];
  }
}

/**
 * Get total storage used by cached YouTube audio
 */
export async function getYouTubeAudioStorageSize(): Promise<number> {
  try {
    const db = await openDatabase();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, "readonly");
      const store = transaction.objectStore(STORE_NAME);
      const request = store.getAll();

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const items = request.result as PersistedYouTubeAudio[];
        const totalSize = items.reduce((sum, item) => sum + item.fileSize, 0);
        resolve(totalSize);
      };
    });
  } catch (err) {
    console.warn("Failed to calculate YouTube audio storage:", err);
    return 0;
  }
}

/**
 * Clear all cached YouTube audio
 */
export async function clearAllYouTubeAudio(): Promise<number> {
  try {
    const sizeBeforeClear = await getYouTubeAudioStorageSize();
    const db = await openDatabase();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, "readwrite");
      const store = transaction.objectStore(STORE_NAME);
      const request = store.clear();

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        console.log("🎵 All YouTube audio cache cleared");
        resolve(sizeBeforeClear);
      };
    });
  } catch (err) {
    console.warn("Failed to clear YouTube audio cache:", err);
    return 0;
  }
}
