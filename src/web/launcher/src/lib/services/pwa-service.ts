// PWA Service - Advanced Progressive Web App capabilities
// Handles installation, updates, offline functionality, and native integrations

interface PWAInstallPrompt {
	prompt: () => Promise<void>;
	userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

interface PWACapabilities {
	canInstall: boolean;
	isInstalled: boolean;
	hasUpdate: boolean;
	supportsNotifications: boolean;
	supportsBackgroundSync: boolean;
	supportsFileHandling: boolean;
	isOfflineCapable: boolean;
}

class PWAService {
	private installPromptEvent: PWAInstallPrompt | null = null;
	private registration: ServiceWorkerRegistration | null = null;
	private updateAvailableCallbacks: Array<() => void> = [];
	private installedCallbacks: Array<() => void> = [];
	private installPromptCallbacks: Array<(prompt: PWAInstallPrompt) => void> = [];

	async initialize(): Promise<void> {
		if (!this.isSupported()) {
			console.warn('PWA features not supported in this browser');
			return;
		}

		try {
			// Register service worker
			await this.registerServiceWorker();

			// Set up installation detection
			this.setupInstallPromptDetection();

			// Set up update detection
			this.setupUpdateDetection();

			// Set up notification permission
			await this.requestNotificationPermission();

			console.log('✅ PWA Service initialized');
		} catch (error) {
			console.error('❌ PWA Service initialization failed:', error);
			throw error;
		}
	}

	private async registerServiceWorker(): Promise<void> {
		if (!('serviceWorker' in navigator)) {
			throw new Error('Service Worker not supported');
		}

		try {
			this.registration = await navigator.serviceWorker.register('/sw.js', {
				scope: '/',
				updateViaCache: 'none'
			});

			console.log('🔧 Service Worker registered:', this.registration.scope);

			// Listen for service worker messages
			navigator.serviceWorker.addEventListener(
				'message',
				this.handleServiceWorkerMessage.bind(this)
			);

			// Check for updates every 30 minutes when app is active
			setInterval(
				() => {
					if (document.visibilityState === 'visible') {
						this.checkForUpdates();
					}
				},
				30 * 60 * 1000
			);
		} catch (error) {
			console.error('Service Worker registration failed:', error);
			throw error;
		}
	}

	private setupInstallPromptDetection(): void {
		// Modern beforeinstallprompt event
		window.addEventListener('beforeinstallprompt', (event) => {
			event.preventDefault();
			this.installPromptEvent = event as unknown as PWAInstallPrompt;

			this.installPromptCallbacks.forEach((callback) => {
				callback(this.installPromptEvent!);
			});
		});

		// App installed detection
		window.addEventListener('appinstalled', () => {
			this.installPromptEvent = null;
			this.installedCallbacks.forEach((callback) => callback());
		});
	}

	private setupUpdateDetection(): void {
		if (!this.registration) return;

		this.registration.addEventListener('updatefound', () => {
			const newWorker = this.registration!.installing;
			if (!newWorker) return;

			newWorker.addEventListener('statechange', () => {
				if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
					// New content available
					this.updateAvailableCallbacks.forEach((callback) => callback());
				}
			});
		});
	}

	private handleServiceWorkerMessage(event: MessageEvent): void {
		const { type, data } = event.data;

		switch (type) {
			case 'SW_ACTIVATED':
				console.log(`🔄 Service Worker activated: ${data.version}`);
				break;
			case 'ACTION_SYNCED':
				console.log('📤 Offline action synced:', data.action);
				break;
			case 'SETTINGS_SYNCED':
				console.log('⚙️ Settings synced');
				break;
			case 'METRICS_SYNCED':
				console.log(`📊 ${data.count} metrics synced`);
				break;
			case 'CACHE_CLEARED':
				console.log(`🗑️ Cache cleared: ${data.cacheName}`);
				break;
		}
	}

	async install(prompt: PWAInstallPrompt): Promise<void> {
		if (!prompt) {
			throw new Error('No install prompt available');
		}

		try {
			await prompt.prompt();
			const choice = await prompt.userChoice;

			if (choice.outcome === 'accepted') {
				console.log('✅ PWA installation accepted');
			} else {
				console.log('❌ PWA installation dismissed');
			}
		} catch (error) {
			console.error('PWA installation failed:', error);
			throw error;
		}
	}

	async update(): Promise<void> {
		if (!this.registration) {
			throw new Error('No service worker registration available');
		}

		try {
			await this.registration.update();

			// Tell the service worker to skip waiting
			if (this.registration.waiting) {
				this.registration.waiting.postMessage({ type: 'SKIP_WAITING' });
			}

			// Reload the page to use the new service worker
			window.location.reload();
		} catch (error) {
			console.error('PWA update failed:', error);
			throw error;
		}
	}

	async checkForUpdates(): Promise<void> {
		if (!this.registration) return;

		try {
			await this.registration.update();
		} catch (error) {
			console.warn('Update check failed:', error);
		}
	}

	isSupported(): boolean {
		return (
			'serviceWorker' in navigator &&
			'PushManager' in window &&
			'Notification' in window &&
			'localStorage' in window &&
			'fetch' in window
		);
	}

	isInstalled(): boolean {
		// Check if running in standalone mode (installed)
		return (
			window.matchMedia('(display-mode: standalone)').matches ||
			(window.navigator as any).standalone === true ||
			document.referrer.includes('android-app://')
		);
	}

	isOfflineCapable(): boolean {
		return this.registration !== null && 'sync' in window.ServiceWorkerRegistration.prototype;
	}

	getCapabilities(): PWACapabilities {
		return {
			canInstall: this.installPromptEvent !== null,
			isInstalled: this.isInstalled(),
			hasUpdate: this.registration?.waiting !== null,
			supportsNotifications: 'Notification' in window,
			supportsBackgroundSync:
				'serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype,
			supportsFileHandling: 'launchQueue' in window,
			isOfflineCapable: this.isOfflineCapable()
		};
	}

	// Notification methods
	async requestNotificationPermission(): Promise<NotificationPermission> {
		if (!('Notification' in window)) {
			console.warn('Notifications not supported');
			return 'denied';
		}

		let permission = Notification.permission;

		if (permission === 'default') {
			permission = await Notification.requestPermission();
		}

		return permission;
	}

	async sendNotification(title: string, options: NotificationOptions = {}): Promise<void> {
		const permission = await this.requestNotificationPermission();

		if (permission !== 'granted') {
			throw new Error('Notification permission not granted');
		}

		if (this.registration) {
			// Use service worker for better notification handling
			await this.registration.showNotification(title, {
				icon: '/pwa/icon-192x192.png',
				badge: '/pwa/badge-72x72.png',
				...options
			});
		} else {
			// Fallback to regular notification
			new Notification(title, {
				icon: '/pwa/icon-192x192.png',
				...options
			});
		}
	}

	// File handling for configuration imports
	setupFileHandling(): void {
		if ('launchQueue' in window) {
			(window as any).launchQueue.setConsumer((launchParams: any) => {
				if (launchParams.files && launchParams.files.length) {
					this.handleFiles(launchParams.files);
				}
			});
		}
	}

	private async handleFiles(files: FileSystemFileHandle[]): Promise<void> {
		for (const fileHandle of files) {
			try {
				const file = await fileHandle.getFile();
				const content = await file.text();

				// Dispatch custom event for file handling
				window.dispatchEvent(
					new CustomEvent('pwa-file-received', {
						detail: {
							name: file.name,
							content: content,
							type: file.type
						}
					})
				);
			} catch (error) {
				console.error('Failed to handle file:', error);
			}
		}
	}

	// Share Target API
	async shareData(data: ShareData): Promise<void> {
		if (navigator.share) {
			try {
				await navigator.share(data);
			} catch (error) {
				console.error('Sharing failed:', error);
				throw error;
			}
		} else {
			// Fallback to clipboard
			if (data.url) {
				await navigator.clipboard.writeText(data.url);
			}
		}
	}

	// Background sync for offline actions
	async scheduleBackgroundSync(tag: string, data?: any): Promise<void> {
		if (!this.registration || !('sync' in this.registration)) {
			console.warn('Background sync not supported');
			return;
		}

		try {
			// Store data for sync if provided
			if (data) {
				navigator.serviceWorker.controller?.postMessage({
					type: 'STORE_OFFLINE_ACTION',
					data: data
				});
			}

			// Register background sync
			await this.registration.sync.register(tag);
		} catch (error) {
			console.error('Background sync scheduling failed:', error);
		}
	}

	// Cache management
	async getCacheStatus(): Promise<any> {
		return new Promise((resolve) => {
			if (!navigator.serviceWorker.controller) {
				resolve(null);
				return;
			}

			const messageChannel = new MessageChannel();
			messageChannel.port1.onmessage = (event) => {
				resolve(event.data);
			};

			navigator.serviceWorker.controller.postMessage({ type: 'GET_CACHE_STATUS' }, [
				messageChannel.port2
			]);
		});
	}

	async clearCache(cacheName?: string): Promise<boolean> {
		return new Promise((resolve) => {
			if (!navigator.serviceWorker.controller) {
				resolve(false);
				return;
			}

			const messageChannel = new MessageChannel();
			messageChannel.port1.onmessage = (event) => {
				resolve(event.data.success);
			};

			navigator.serviceWorker.controller.postMessage(
				{
					type: 'CLEAR_CACHE',
					data: { cacheName }
				},
				[messageChannel.port2]
			);
		});
	}

	// Event listeners
	onInstallPrompt(callback: (prompt: PWAInstallPrompt) => void): void {
		this.installPromptCallbacks.push(callback);
	}

	onInstalled(callback: () => void): void {
		this.installedCallbacks.push(callback);
	}

	onUpdateAvailable(callback: () => void): void {
		this.updateAvailableCallbacks.push(callback);
	}

	// Utility methods
	async getStorageEstimate(): Promise<StorageEstimate | null> {
		if ('storage' in navigator && 'estimate' in navigator.storage) {
			return await navigator.storage.estimate();
		}
		return null;
	}

	async requestPersistentStorage(): Promise<boolean> {
		if ('storage' in navigator && 'persist' in navigator.storage) {
			return await navigator.storage.persist();
		}
		return false;
	}

	// Network status
	isOnline(): boolean {
		return navigator.onLine;
	}

	onNetworkChange(callback: (isOnline: boolean) => void): void {
		const handler = () => callback(navigator.onLine);
		window.addEventListener('online', handler);
		window.addEventListener('offline', handler);
	}

	// Display mode detection
	getDisplayMode(): string {
		if (window.matchMedia('(display-mode: standalone)').matches) return 'standalone';
		if (window.matchMedia('(display-mode: minimal-ui)').matches) return 'minimal-ui';
		if (window.matchMedia('(display-mode: fullscreen)').matches) return 'fullscreen';
		return 'browser';
	}

	onDisplayModeChange(callback: (mode: string) => void): void {
		const modes = ['standalone', 'minimal-ui', 'fullscreen', 'browser'];

		modes.forEach((mode) => {
			const mediaQuery = window.matchMedia(`(display-mode: ${mode})`);
			mediaQuery.addEventListener('change', (e) => {
				if (e.matches) {
					callback(mode);
				}
			});
		});
	}
}

export const pwaService = new PWAService();
