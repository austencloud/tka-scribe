/**
 * MessagingService
 *
 * Handles sending, fetching, and real-time subscription to messages.
 */

import { injectable } from "inversify";
import {
	collection,
	query,
	orderBy,
	limit,
	getDocs,
	doc,
	addDoc,
	updateDoc,
	onSnapshot,
	Timestamp,
	serverTimestamp,
	startAfter,
	getDoc,
	writeBatch
} from "firebase/firestore";
import { firestore } from "$lib/shared/auth/firebase";
import { authState } from "$lib/shared/auth/state/authState.svelte";
import { userPreviewState } from "$lib/shared/debug/state/user-preview-state.svelte";
// Note: Message notifications removed - messages and notifications share same inbox panel
import type {
	Message,
	CreateMessageInput,
	MessageFetchOptions,
	MessagePreview
} from "../../domain/models/message-models";
import type { IMessagingService } from "../contracts/IMessagingService";

const CONVERSATIONS_COLLECTION = "conversations";
const MESSAGES_SUBCOLLECTION = "messages";

@injectable()
export class MessagingService implements IMessagingService {
	private messageSubscriptions = new Map<string, () => void>();

	/**
	 * Get the current user ID or throw if not authenticated.
	 * Supports both preview mode (View As) and legacy impersonation.
	 */
	private getCurrentUserId(): string {
		// Check preview mode first (View As feature)
		if (userPreviewState.isActive && userPreviewState.data.profile) {
			return userPreviewState.data.profile.uid;
		}
		// Fall back to authState
		const userId = authState.user?.uid;
		if (!userId) {
			throw new Error("User must be authenticated to send messages");
		}
		return userId;
	}

	/**
	 * Get effective user info (supports preview mode and legacy impersonation).
	 * Returns preview user info when in View As mode, otherwise actual user.
	 */
	private getEffectiveUserInfo(): { uid: string; displayName: string; photoURL: string | null } {
		// Check preview mode first (View As feature)
		if (userPreviewState.isActive && userPreviewState.data.profile) {
			const profile = userPreviewState.data.profile;
			return {
				uid: profile.uid,
				displayName: profile.displayName || "Unknown User",
				photoURL: profile.photoURL || null
			};
		}
		// Fall back to actual auth user
		const user = authState.user;
		if (!user) {
			throw new Error("User must be authenticated");
		}
		return {
			uid: user.uid,
			displayName: user.displayName || "Unknown User",
			photoURL: user.photoURL
		};
	}

	/**
	 * Send a new message in a conversation
	 */
	async sendMessage(input: CreateMessageInput): Promise<Message> {
		const effectiveUser = this.getEffectiveUserInfo();

		const { conversationId, content, attachments } = input;

		// Validate conversation exists and user is a participant
		const conversationRef = doc(firestore, CONVERSATIONS_COLLECTION, conversationId);
		const conversationSnap = await getDoc(conversationRef);

		if (!conversationSnap.exists()) {
			throw new Error("Conversation not found");
		}

		const conversationData = conversationSnap.data();
		const participants = conversationData["participants"] as string[];

		if (!participants.includes(effectiveUser.uid)) {
			throw new Error("User is not a participant in this conversation");
		}

		// Create the message
		const messagesRef = collection(
			firestore,
			CONVERSATIONS_COLLECTION,
			conversationId,
			MESSAGES_SUBCOLLECTION
		);

		const messageData = {
			senderId: effectiveUser.uid,
			senderName: effectiveUser.displayName,
			senderAvatar: effectiveUser.photoURL,
			content,
			createdAt: serverTimestamp(),
			readBy: [effectiveUser.uid], // Sender has read their own message
			attachments: attachments || null,
			isDeleted: false
		};

		const docRef = await addDoc(messagesRef, messageData);

		// Update conversation with last message and increment unread count for other participant
		const otherUserId = participants.find((p) => p !== effectiveUser.uid);
		const lastMessage: MessagePreview = {
			content: content.substring(0, 100),
			senderId: effectiveUser.uid,
			senderName: effectiveUser.displayName,
			createdAt: new Date(),
			hasAttachment: !!(attachments && attachments.length > 0)
		};

		const batch = writeBatch(firestore);

		batch.update(conversationRef, {
			lastMessage,
			updatedAt: serverTimestamp(),
			...(otherUserId && {
				[`unreadCount.${otherUserId}`]:
					((conversationData["unreadCount"] as Record<string, number>)?.[otherUserId] || 0) + 1
			})
		});

		await batch.commit();

		// Note: No in-app notification created - messages tab shows unread badge instead

		return {
			id: docRef.id,
			conversationId,
			senderId: effectiveUser.uid,
			senderName: effectiveUser.displayName,
			senderAvatar: effectiveUser.photoURL || undefined,
			content,
			createdAt: new Date(),
			readBy: [effectiveUser.uid],
			attachments
		};
	}

	/**
	 * Send a message with just content (convenience method)
	 */
	async sendTextMessage(conversationId: string, content: string): Promise<Message> {
		return this.sendMessage({ conversationId, content });
	}

	/**
	 * Get messages for a conversation with pagination
	 */
	async getMessages(
		conversationId: string,
		options?: MessageFetchOptions
	): Promise<Message[]> {
		const maxCount = options?.limit ?? 50;

		const messagesRef = collection(
			firestore,
			CONVERSATIONS_COLLECTION,
			conversationId,
			MESSAGES_SUBCOLLECTION
		);

		let q = query(messagesRef, orderBy("createdAt", "desc"), limit(maxCount));

		// Handle cursor-based pagination
		if (options?.beforeId) {
			const beforeDoc = await getDoc(
				doc(firestore, CONVERSATIONS_COLLECTION, conversationId, MESSAGES_SUBCOLLECTION, options.beforeId)
			);
			if (beforeDoc.exists()) {
				q = query(
					messagesRef,
					orderBy("createdAt", "desc"),
					startAfter(beforeDoc),
					limit(maxCount)
				);
			}
		}

		const snapshot = await getDocs(q);

		return snapshot.docs
			.map((docSnap) => this.mapDocToMessage(docSnap.id, conversationId, docSnap.data()))
			.reverse(); // Return in chronological order
	}

	/**
	 * Subscribe to real-time message updates for a conversation
	 */
	subscribeToMessages(
		conversationId: string,
		callback: (messages: Message[]) => void
	): () => void {
		// Clean up previous subscription for this conversation
		const existingUnsubscribe = this.messageSubscriptions.get(conversationId);
		if (existingUnsubscribe) {
			existingUnsubscribe();
		}

		const messagesRef = collection(
			firestore,
			CONVERSATIONS_COLLECTION,
			conversationId,
			MESSAGES_SUBCOLLECTION
		);

		const q = query(messagesRef, orderBy("createdAt", "desc"), limit(100));

		const unsubscribe = onSnapshot(q, (snapshot) => {
			const messages = snapshot.docs
				.map((docSnap) => this.mapDocToMessage(docSnap.id, conversationId, docSnap.data()))
				.reverse(); // Chronological order
			callback(messages);
		}, (error) => {
			console.error("[MessagingService] Error subscribing to messages:", error);
		});

		this.messageSubscriptions.set(conversationId, unsubscribe);
		return unsubscribe;
	}

	/**
	 * Mark all messages in a conversation as read for the current user
	 */
	async markAsRead(conversationId: string): Promise<void> {
		const currentUserId = this.getCurrentUserId();

		// Reset unread count for current user in conversation
		const conversationRef = doc(firestore, CONVERSATIONS_COLLECTION, conversationId);
		await updateDoc(conversationRef, {
			[`unreadCount.${currentUserId}`]: 0
		});

		// Mark all unread messages as read
		const messagesRef = collection(
			firestore,
			CONVERSATIONS_COLLECTION,
			conversationId,
			MESSAGES_SUBCOLLECTION
		);

		const snapshot = await getDocs(messagesRef);
		const batch = writeBatch(firestore);

		snapshot.docs.forEach((docSnap) => {
			const data = docSnap.data();
			const readBy = (data["readBy"] as string[]) || [];
			if (!readBy.includes(currentUserId)) {
				batch.update(docSnap.ref, {
					readBy: [...readBy, currentUserId]
				});
			}
		});

		await batch.commit();
	}

	/**
	 * Mark a specific message as read
	 */
	async markMessageAsRead(conversationId: string, messageId: string): Promise<void> {
		const currentUserId = this.getCurrentUserId();

		const messageRef = doc(
			firestore,
			CONVERSATIONS_COLLECTION,
			conversationId,
			MESSAGES_SUBCOLLECTION,
			messageId
		);

		const snapshot = await getDoc(messageRef);
		if (!snapshot.exists()) {
			return;
		}

		const data = snapshot.data();
		const readBy = (data["readBy"] as string[]) || [];

		if (!readBy.includes(currentUserId)) {
			await updateDoc(messageRef, {
				readBy: [...readBy, currentUserId]
			});
		}
	}

	/**
	 * Soft delete a message (sender only)
	 */
	async deleteMessage(conversationId: string, messageId: string): Promise<void> {
		const currentUserId = this.getCurrentUserId();

		const messageRef = doc(
			firestore,
			CONVERSATIONS_COLLECTION,
			conversationId,
			MESSAGES_SUBCOLLECTION,
			messageId
		);

		const snapshot = await getDoc(messageRef);
		if (!snapshot.exists()) {
			throw new Error("Message not found");
		}

		const data = snapshot.data();
		if (data["senderId"] !== currentUserId) {
			throw new Error("Only the sender can delete a message");
		}

		await updateDoc(messageRef, {
			isDeleted: true,
			content: "[Message deleted]"
		});
	}

	/**
	 * Edit a message (sender only)
	 */
	async editMessage(
		conversationId: string,
		messageId: string,
		newContent: string
	): Promise<Message> {
		const currentUserId = this.getCurrentUserId();

		const messageRef = doc(
			firestore,
			CONVERSATIONS_COLLECTION,
			conversationId,
			MESSAGES_SUBCOLLECTION,
			messageId
		);

		const snapshot = await getDoc(messageRef);
		if (!snapshot.exists()) {
			throw new Error("Message not found");
		}

		const data = snapshot.data();
		if (data["senderId"] !== currentUserId) {
			throw new Error("Only the sender can edit a message");
		}

		await updateDoc(messageRef, {
			content: newContent,
			editedAt: serverTimestamp()
		});

		return this.mapDocToMessage(messageId, conversationId, {
			...data,
			content: newContent,
			editedAt: Timestamp.now()
		});
	}

	/**
	 * Map Firestore document to Message
	 */
	private mapDocToMessage(
		id: string,
		conversationId: string,
		data: Record<string, unknown>
	): Message {
		return {
			id,
			conversationId,
			senderId: data["senderId"] as string,
			senderName: data["senderName"] as string,
			senderAvatar: data["senderAvatar"] as string | undefined,
			content: data["content"] as string,
			createdAt: (data["createdAt"] as Timestamp)?.toDate() || new Date(),
			editedAt: (data["editedAt"] as Timestamp)?.toDate(),
			readBy: (data["readBy"] as string[]) || [],
			attachments: data["attachments"] as Message["attachments"],
			isDeleted: data["isDeleted"] as boolean | undefined
		};
	}

	/**
	 * Clean up all subscriptions
	 */
	cleanup(): void {
		this.messageSubscriptions.forEach((unsubscribe) => unsubscribe());
		this.messageSubscriptions.clear();
	}
}

// Export singleton instance
export const messagingService = new MessagingService();
