/**
 * Recording Persistence Service
 *
 * Manages storage and retrieval of recording metadata in Firestore.
 * Collection path: users/{userId}/recordings/{recordingId}
 */

import { injectable } from "inversify";
import { getFirestoreInstance, auth } from "$lib/shared/auth/firebase";
import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  deleteDoc,
  query,
  where,
  orderBy,
  limit as firestoreLimit,
  serverTimestamp,
} from "firebase/firestore";
import type { RecordingMetadata } from "../../domain/RecordingMetadata";

export interface IRecordingPersistenceService {
  /**
   * Save recording metadata to Firestore
   */
  saveRecording(recording: RecordingMetadata): Promise<void>;

  /**
   * Get a recording by ID
   */
  getRecording(recordingId: string): Promise<RecordingMetadata | null>;

  /**
   * Get all recordings for a sequence
   */
  getRecordingsForSequence(sequenceId: string): Promise<RecordingMetadata[]>;

  /**
   * Get all recordings for current user
   */
  getAllRecordings(limitCount?: number): Promise<RecordingMetadata[]>;

  /**
   * Delete a recording
   */
  deleteRecording(recordingId: string): Promise<void>;

  /**
   * Delete all recordings for a sequence
   */
  deleteRecordingsForSequence(sequenceId: string): Promise<void>;
}

@injectable()
export class RecordingPersistenceService
  implements IRecordingPersistenceService
{
  private getUserId(): string {
    const user = auth.currentUser;
    if (!user) {
      throw new Error("User must be authenticated to access recordings");
    }
    return user.uid;
  }

  private getRecordingsCollectionPath(userId: string): string {
    return `users/${userId}/recordings`;
  }

  /**
   * Convert Firestore document to RecordingMetadata
   */
  private docToRecording(
    docData: Record<string, unknown>,
    recordingId: string
  ): RecordingMetadata {
    const recordedAtField = docData.recordedAt as
      | { toDate?: () => Date }
      | undefined;

    return {
      id: recordingId,
      userId: docData.userId as string,
      sequenceId: docData.sequenceId as string,
      videoUrl: docData.videoUrl as string,
      storagePath: docData.storagePath as string,
      duration: docData.duration as number,
      fileSize: docData.fileSize as number,
      mimeType: docData.mimeType as string,
      recordedAt: recordedAtField?.toDate?.() ?? new Date(),
      deviceType: docData.deviceType as
        | "mobile"
        | "tablet"
        | "desktop"
        | undefined,
      thumbnailUrl: docData.thumbnailUrl as string | undefined,
      notes: docData.notes as string | undefined,
      metadata: (docData.metadata as Record<string, unknown>) ?? {},
    };
  }

  async saveRecording(recording: RecordingMetadata): Promise<void> {
    const firestore = await getFirestoreInstance();
    const userId = this.getUserId();
    const collectionPath = this.getRecordingsCollectionPath(userId);
    const docRef = doc(firestore, collectionPath, recording.id);

    // Build document data, omitting undefined fields
    const docData: Record<string, unknown> = {
      userId: recording.userId,
      sequenceId: recording.sequenceId,
      videoUrl: recording.videoUrl,
      storagePath: recording.storagePath,
      duration: recording.duration,
      fileSize: recording.fileSize,
      mimeType: recording.mimeType,
      recordedAt: serverTimestamp(),
      metadata: recording.metadata,
    };

    // Only include optional fields if they're defined
    if (recording.deviceType !== undefined) {
      docData.deviceType = recording.deviceType;
    }
    if (recording.thumbnailUrl !== undefined) {
      docData.thumbnailUrl = recording.thumbnailUrl;
    }
    if (recording.notes !== undefined) {
      docData.notes = recording.notes;
    }

    await setDoc(docRef, docData);

    console.log(`✅ Saved recording metadata: ${recording.id}`);
  }

  async getRecording(recordingId: string): Promise<RecordingMetadata | null> {
    const firestore = await getFirestoreInstance();
    const userId = this.getUserId();
    const collectionPath = this.getRecordingsCollectionPath(userId);
    const docRef = doc(firestore, collectionPath, recordingId);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return null;
    }

    return this.docToRecording(docSnap.data(), recordingId);
  }

  async getRecordingsForSequence(
    sequenceId: string
  ): Promise<RecordingMetadata[]> {
    const firestore = await getFirestoreInstance();
    const userId = this.getUserId();
    const collectionPath = this.getRecordingsCollectionPath(userId);
    const collectionRef = collection(firestore, collectionPath);

    const q = query(
      collectionRef,
      where("sequenceId", "==", sequenceId),
      orderBy("recordedAt", "desc")
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => this.docToRecording(doc.data(), doc.id));
  }

  async getAllRecordings(limitCount = 50): Promise<RecordingMetadata[]> {
    const firestore = await getFirestoreInstance();
    const userId = this.getUserId();
    const collectionPath = this.getRecordingsCollectionPath(userId);
    const collectionRef = collection(firestore, collectionPath);

    const q = query(
      collectionRef,
      orderBy("recordedAt", "desc"),
      firestoreLimit(limitCount)
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => this.docToRecording(doc.data(), doc.id));
  }

  async deleteRecording(recordingId: string): Promise<void> {
    const firestore = await getFirestoreInstance();
    const userId = this.getUserId();
    const collectionPath = this.getRecordingsCollectionPath(userId);
    const docRef = doc(firestore, collectionPath, recordingId);

    await deleteDoc(docRef);
    console.log(`🗑️ Deleted recording metadata: ${recordingId}`);
  }

  async deleteRecordingsForSequence(sequenceId: string): Promise<void> {
    const recordings = await this.getRecordingsForSequence(sequenceId);
    await Promise.all(recordings.map((r) => this.deleteRecording(r.id)));
    console.log(
      `🗑️ Deleted ${recordings.length} recordings for sequence ${sequenceId}`
    );
  }
}
