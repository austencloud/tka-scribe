// Real-Time Service - WebSocket and Server-Sent Events for live updates
// Provides real-time collaboration, live metrics, and instant notifications

interface RealTimeConfig {
	onConnected: () => void;
	onDisconnected: () => void;
	onError: (error: Error) => void;
	onEvent: (event: RealTimeEvent) => void;
}

interface RealTimeEvent {
	type: string;
	data: any;
	timestamp: Date;
	source?: string;
}

interface ConnectionOptions {
	reconnectAttempts: number;
	reconnectDelay: number;
	heartbeatInterval: number;
	timeout: number;
}

class RealTimeService {
	private ws: WebSocket | null = null;
	private eventSource: EventSource | null = null;
	private config: RealTimeConfig | null = null;
	private isConnected = false;
	private reconnectAttempts = 0;
	private maxReconnectAttempts = 5;
	private reconnectDelay = 1000;
	private heartbeatInterval: number | null = null;
	private connectionTimeout: number | null = null;

	async connect(config: RealTimeConfig, options: Partial<ConnectionOptions> = {}): Promise<void> {
		this.config = config;
		this.maxReconnectAttempts = options.reconnectAttempts ?? 5;
		this.reconnectDelay = options.reconnectDelay ?? 1000;

		try {
			await this.establishConnection();
		} catch (error) {
			console.error('Real-time connection failed:', error);
			this.config?.onError(error as Error);
			throw error;
		}
	}

	private async establishConnection(): Promise<void> {
		const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
		const wsUrl = `${protocol}//${window.location.host}/ws/launcher`;

		try {
			// Try WebSocket first
			await this.connectWebSocket(wsUrl);
		} catch (error) {
			console.warn('WebSocket failed, falling back to Server-Sent Events:', error);
			try {
				await this.connectEventSource();
			} catch (sseError) {
				console.error('Both WebSocket and SSE failed:', sseError);
				throw sseError;
			}
		}
	}

	private async connectWebSocket(url: string): Promise<void> {
		return new Promise((resolve, reject) => {
			try {
				this.ws = new WebSocket(url);

				this.ws.onopen = () => {
					console.log('🔗 WebSocket connected');
					this.isConnected = true;
					this.reconnectAttempts = 0;
					this.startHeartbeat();
					this.config?.onConnected();
					resolve();
				};

				this.ws.onmessage = (event) => {
					try {
						const data = JSON.parse(event.data);
						this.handleMessage(data);
					} catch (error) {
						console.error('Failed to parse WebSocket message:', error);
					}
				};

				this.ws.onclose = (event) => {
					console.log('🔌 WebSocket disconnected:', event.code, event.reason);
					this.handleDisconnection();
				};

				this.ws.onerror = (error) => {
					console.error('WebSocket error:', error);
					reject(new Error('WebSocket connection failed'));
				};

				// Connection timeout
				this.connectionTimeout = window.setTimeout(() => {
					if (this.ws?.readyState !== WebSocket.OPEN) {
						this.ws?.close();
						reject(new Error('WebSocket connection timeout'));
					}
				}, 10000);
			} catch (error) {
				reject(error);
			}
		});
	}

	private async connectEventSource(): Promise<void> {
		return new Promise((resolve, reject) => {
			try {
				this.eventSource = new EventSource('/api/events/launcher');

				this.eventSource.onopen = () => {
					console.log('📡 Server-Sent Events connected');
					this.isConnected = true;
					this.reconnectAttempts = 0;
					this.config?.onConnected();
					resolve();
				};

				this.eventSource.onmessage = (event) => {
					try {
						const data = JSON.parse(event.data);
						this.handleMessage(data);
					} catch (error) {
						console.error('Failed to parse SSE message:', error);
					}
				};

				this.eventSource.onerror = (error) => {
					console.error('Server-Sent Events error:', error);
					this.handleDisconnection();
					reject(new Error('Server-Sent Events connection failed'));
				};

				// Custom event types
				this.eventSource.addEventListener('version-update', (event) => {
					this.handleMessage(JSON.parse(event.data));
				});

				this.eventSource.addEventListener('performance-update', (event) => {
					this.handleMessage(JSON.parse(event.data));
				});

				this.eventSource.addEventListener('collaborator-event', (event) => {
					this.handleMessage(JSON.parse(event.data));
				});
			} catch (error) {
				reject(error);
			}
		});
	}

	private handleMessage(data: any): void {
		const event: RealTimeEvent = {
			type: data.type || 'message',
			data: data.data || data,
			timestamp: new Date(data.timestamp || Date.now()),
			source: data.source || 'server'
		};

		this.config?.onEvent(event);
	}

	private handleDisconnection(): void {
		this.isConnected = false;
		this.stopHeartbeat();

		if (this.connectionTimeout) {
			clearTimeout(this.connectionTimeout);
			this.connectionTimeout = null;
		}

		this.config?.onDisconnected();

		// Attempt reconnection
		if (this.reconnectAttempts < this.maxReconnectAttempts) {
			this.scheduleReconnection();
		} else {
			console.error('Max reconnection attempts reached');
			this.config?.onError(new Error('Unable to reconnect after maximum attempts'));
		}
	}

	private scheduleReconnection(): void {
		this.reconnectAttempts++;
		const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1); // Exponential backoff

		console.log(
			`🔄 Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`
		);

		setTimeout(() => {
			if (!this.isConnected) {
				this.establishConnection().catch((error) => {
					console.error('Reconnection failed:', error);
				});
			}
		}, delay);
	}

	private startHeartbeat(): void {
		this.heartbeatInterval = window.setInterval(() => {
			if (this.ws?.readyState === WebSocket.OPEN) {
				this.ws.send(JSON.stringify({ type: 'ping', timestamp: Date.now() }));
			}
		}, 30000); // Every 30 seconds
	}

	private stopHeartbeat(): void {
		if (this.heartbeatInterval) {
			clearInterval(this.heartbeatInterval);
			this.heartbeatInterval = null;
		}
	}

	broadcast(type: string, data: any): void {
		if (!this.isConnected) {
			console.warn('Cannot broadcast: not connected');
			return;
		}

		const message = {
			type,
			data,
			timestamp: Date.now(),
			source: 'launcher'
		};

		if (this.ws?.readyState === WebSocket.OPEN) {
			this.ws.send(JSON.stringify(message));
		} else {
			// For SSE, we would need to make a POST request
			this.sendViaHTTP(message);
		}
	}

	private async sendViaHTTP(message: any): Promise<void> {
		try {
			await fetch('/api/events/broadcast', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(message)
			});
		} catch (error) {
			console.error('Failed to send message via HTTP:', error);
		}
	}

	// Subscribe to specific event types
	subscribe(eventType: string, callback: (data: any) => void): () => void {
		const handler = (event: RealTimeEvent) => {
			if (event.type === eventType) {
				callback(event.data);
			}
		};

		if (this.config) {
			const originalOnEvent = this.config.onEvent;
			this.config.onEvent = (event) => {
				originalOnEvent(event);
				handler(event);
			};
		}

		// Return unsubscribe function
		return () => {
			if (this.config) {
				this.config.onEvent = this.config.onEvent;
			}
		};
	}

	// Send direct messages to specific users (if supported by backend)
	sendDirectMessage(userId: string, type: string, data: any): void {
		this.broadcast('direct-message', {
			targetUserId: userId,
			messageType: type,
			messageData: data
		});
	}

	// Room/channel management for team collaboration
	joinRoom(roomId: string): void {
		this.broadcast('join-room', { roomId });
	}

	leaveRoom(roomId: string): void {
		this.broadcast('leave-room', { roomId });
	}

	// Presence system
	updatePresence(status: 'active' | 'away' | 'busy', metadata?: any): void {
		this.broadcast('presence-update', {
			status,
			metadata,
			lastSeen: Date.now()
		});
	}

	// File sharing for configuration sync
	shareFile(fileName: string, content: string, recipients?: string[]): void {
		this.broadcast('file-share', {
			fileName,
			content,
			recipients,
			sharedAt: Date.now()
		});
	}

	// Performance metrics streaming
	streamMetrics(versionId: string, metrics: any): void {
		this.broadcast('performance-update', {
			versionId,
			metrics,
			timestamp: Date.now()
		});
	}

	// Version status updates
	broadcastVersionStatus(versionId: string, status: string, metadata?: any): void {
		this.broadcast('version-status-change', {
			versionId,
			status,
			metadata,
			timestamp: Date.now()
		});
	}

	// Collaborative cursor/selection sharing
	shareSelection(versionId: string, selection: any): void {
		this.broadcast('selection-update', {
			versionId,
			selection,
			timestamp: Date.now()
		});
	}

	// Chat/comments system
	sendComment(context: string, message: string, mentions?: string[]): void {
		this.broadcast('comment', {
			context,
			message,
			mentions,
			timestamp: Date.now()
		});
	}

	// System notifications
	sendSystemNotification(level: 'info' | 'warning' | 'error', message: string, data?: any): void {
		this.broadcast('system-notification', {
			level,
			message,
			data,
			timestamp: Date.now()
		});
	}

	// Connection status
	getConnectionStatus(): {
		isConnected: boolean;
		connectionType: 'websocket' | 'sse' | 'none';
		reconnectAttempts: number;
		lastConnected?: Date;
	} {
		let connectionType: 'websocket' | 'sse' | 'none' = 'none';

		if (this.ws?.readyState === WebSocket.OPEN) {
			connectionType = 'websocket';
		} else if (this.eventSource?.readyState === EventSource.OPEN) {
			connectionType = 'sse';
		}

		return {
			isConnected: this.isConnected,
			connectionType,
			reconnectAttempts: this.reconnectAttempts
		};
	}

	// Cleanup
	disconnect(): void {
		this.isConnected = false;
		this.stopHeartbeat();

		if (this.connectionTimeout) {
			clearTimeout(this.connectionTimeout);
			this.connectionTimeout = null;
		}

		if (this.ws) {
			this.ws.close(1000, 'Client disconnecting');
			this.ws = null;
		}

		if (this.eventSource) {
			this.eventSource.close();
			this.eventSource = null;
		}

		this.config = null;
		console.log('🔌 Real-time service disconnected');
	}

	// Advanced features for development environments
	debugConnection(): void {
		console.group('🔍 Real-Time Connection Debug');
		console.log('Connected:', this.isConnected);
		console.log('WebSocket:', this.ws?.readyState);
		console.log('EventSource:', this.eventSource?.readyState);
		console.log('Reconnect attempts:', this.reconnectAttempts);
		console.log('Max attempts:', this.maxReconnectAttempts);
		console.groupEnd();
	}

	// Bandwidth monitoring
	private messageCount = 0;
	private bytesTransferred = 0;

	getConnectionStats(): {
		messageCount: number;
		bytesTransferred: number;
		averageMessageSize: number;
		messagesPerMinute: number;
	} {
		return {
			messageCount: this.messageCount,
			bytesTransferred: this.bytesTransferred,
			averageMessageSize: this.messageCount > 0 ? this.bytesTransferred / this.messageCount : 0,
			messagesPerMinute: 0 // Would need time tracking for accurate calculation
		};
	}

	// Quality of Service monitoring
	private latencyMeasurements: number[] = [];

	measureLatency(): void {
		const startTime = Date.now();
		this.broadcast('ping', { timestamp: startTime });

		// The response should be handled by the message handler
		// and latency calculated when 'pong' is received
	}

	private handlePong(timestamp: number): void {
		const latency = Date.now() - timestamp;
		this.latencyMeasurements.push(latency);

		// Keep only last 10 measurements
		if (this.latencyMeasurements.length > 10) {
			this.latencyMeasurements.shift();
		}
	}

	getAverageLatency(): number {
		if (this.latencyMeasurements.length === 0) return 0;
		return (
			this.latencyMeasurements.reduce((sum, latency) => sum + latency, 0) /
			this.latencyMeasurements.length
		);
	}
}

export const realTimeService = new RealTimeService();
