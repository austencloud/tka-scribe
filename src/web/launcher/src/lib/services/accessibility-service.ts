// Accessibility Service - WCAG 2.1 AA compliance and advanced a11y features

interface AccessibilitySettings {
	reduceMotion: boolean;
	highContrast: boolean;
	screenReaderAnnouncements: boolean;
	keyboardNavigationHelp: boolean;
	fontSize: 'small' | 'medium' | 'large' | 'xl';
}

interface FocusState {
	currentElement: HTMLElement | null;
	focusHistory: HTMLElement[];
	trapEnabled: boolean;
	trapContainer: HTMLElement | null;
}

interface ScreenReaderAnnouncement {
	message: string;
	priority: 'polite' | 'assertive';
	timestamp: Date;
}

class AccessibilityService {
	private announcer: HTMLElement | null = null;
	private focusState: FocusState = {
		currentElement: null,
		focusHistory: [],
		trapEnabled: false,
		trapContainer: null
	};
	private announcements: ScreenReaderAnnouncement[] = [];
	private keyboardListeners: Map<string, (event: KeyboardEvent) => void> = new Map();
	private mediaQueries: Map<string, MediaQueryList> = new Map();

	async initialize(): Promise<void> {
		this.createScreenReaderAnnouncer();
		this.setupMediaQueryListeners();
		this.setupKeyboardNavigation();
		this.setupFocusManagement();
		this.detectSystemPreferences();

		console.log('✅ Accessibility Service initialized');
	}

	private createScreenReaderAnnouncer(): void {
		this.announcer = document.createElement('div');
		this.announcer.setAttribute('aria-live', 'polite');
		this.announcer.setAttribute('aria-atomic', 'true');
		this.announcer.setAttribute('class', 'sr-only');
		this.announcer.style.cssText = `
      position: absolute !important;
      width: 1px !important;
      height: 1px !important;
      padding: 0 !important;
      margin: -1px !important;
      overflow: hidden !important;
      clip: rect(0, 0, 0, 0) !important;
      white-space: nowrap !important;
      border: 0 !important;
    `;
		document.body.appendChild(this.announcer);
	}

	private setupMediaQueryListeners(): void {
		const queries = {
			'prefers-reduced-motion': '(prefers-reduced-motion: reduce)',
			'prefers-contrast': '(prefers-contrast: high)',
			'prefers-color-scheme': '(prefers-color-scheme: dark)',
			'forced-colors': '(forced-colors: active)'
		};

		Object.entries(queries).forEach(([name, query]) => {
			const mq = window.matchMedia(query);
			this.mediaQueries.set(name, mq);

			mq.addEventListener('change', () => {
				this.handleSystemPreferenceChange(name, mq.matches);
			});
		});
	}

	private setupKeyboardNavigation(): void {
		document.addEventListener('keydown', (event) => {
			this.handleGlobalKeydown(event);
		});

		document.addEventListener('focusin', (event) => {
			this.handleFocusChange(event.target as HTMLElement);
		});

		document.addEventListener('focusout', () => {
			this.updateFocusHistory();
		});
	}

	private setupFocusManagement(): void {
		// Roving tabindex for complex widgets
		document.addEventListener('keydown', (event) => {
			if (event.key === 'Tab') {
				this.handleTabNavigation(event);
			}
		});

		// Skip links for main content
		this.createSkipLinks();
	}

	private createSkipLinks(): void {
		const skipContainer = document.createElement('div');
		skipContainer.className = 'skip-links';
		skipContainer.innerHTML = `
      <a href="#main-content" class="skip-link">Skip to main content</a>
      <a href="#navigation" class="skip-link">Skip to navigation</a>
      <a href="#version-grid" class="skip-link">Skip to version grid</a>
    `;

		const style = document.createElement('style');
		style.textContent = `
      .skip-links {
        position: absolute;
        top: -100px;
        left: 0;
        z-index: 10000;
      }
      .skip-link {
        position: absolute;
        background: var(--electric-blue);
        color: white;
        padding: 8px 16px;
        text-decoration: none;
        border-radius: 4px;
        font-weight: 600;
        transform: translateY(-100%);
        transition: transform 0.2s ease-out;
      }
      .skip-link:focus {
        transform: translateY(100px);
      }
    `;

		document.head.appendChild(style);
		document.body.insertBefore(skipContainer, document.body.firstChild);
	}

	private handleGlobalKeydown(event: KeyboardEvent): void {
		// Alt + 1-9: Quick navigation to version cards
		if (event.altKey && event.key >= '1' && event.key <= '9') {
			event.preventDefault();
			const index = parseInt(event.key) - 1;
			this.focusVersionCard(index);
			return;
		}

		// Escape: Clear all selections and close modals
		if (event.key === 'Escape') {
			this.handleEscapeKey(event);
			return;
		}

		// F1: Show keyboard shortcuts help
		if (event.key === 'F1') {
			event.preventDefault();
			this.showKeyboardHelp();
			return;
		}

		// Ctrl/Cmd + /: Toggle search
		if ((event.ctrlKey || event.metaKey) && event.key === '/') {
			event.preventDefault();
			this.focusSearch();
			return;
		}
	}

	private handleTabNavigation(event: KeyboardEvent): void {
		if (this.focusState.trapEnabled && this.focusState.trapContainer) {
			this.handleFocusTrap(event);
		}
	}

	private handleFocusTrap(event: KeyboardEvent): void {
		if (!this.focusState.trapContainer) return;

		const focusableElements = this.getFocusableElements(this.focusState.trapContainer);
		const firstElement = focusableElements[0];
		const lastElement = focusableElements[focusableElements.length - 1];

		if (event.shiftKey) {
			if (document.activeElement === firstElement) {
				event.preventDefault();
				lastElement?.focus();
			}
		} else {
			if (document.activeElement === lastElement) {
				event.preventDefault();
				firstElement?.focus();
			}
		}
	}

	private getFocusableElements(container: HTMLElement): HTMLElement[] {
		const selector = `
      button:not([disabled]),
      [href]:not([disabled]),
      input:not([disabled]),
      select:not([disabled]),
      textarea:not([disabled]),
      [tabindex]:not([tabindex="-1"]):not([disabled]),
      details:not([disabled]),
      summary:not(:disabled)
    `;
		return Array.from(container.querySelectorAll(selector));
	}

	private handleFocusChange(element: HTMLElement): void {
		this.focusState.currentElement = element;

		// Announce focused element to screen readers
		if (element.hasAttribute('aria-label')) {
			this.announce(`Focused: ${element.getAttribute('aria-label')}`, 'polite');
		} else if (element.textContent?.trim()) {
			this.announce(`Focused: ${element.textContent.trim()}`, 'polite');
		}
	}

	private updateFocusHistory(): void {
		if (this.focusState.currentElement) {
			this.focusState.focusHistory.push(this.focusState.currentElement);

			// Keep only last 10 elements
			if (this.focusState.focusHistory.length > 10) {
				this.focusState.focusHistory.shift();
			}
		}
	}

	private handleEscapeKey(event: KeyboardEvent): void {
		// Close modals, clear selections, etc.
		const modals = document.querySelectorAll('[role="dialog"], .modal');
		if (modals.length > 0) {
			const lastModal = modals[modals.length - 1] as HTMLElement;
			this.closeModal(lastModal);
			return;
		}

		// Clear focus trap
		if (this.focusState.trapEnabled) {
			this.disableFocusTrap();
			return;
		}

		// Announce escape action
		this.announce('Selection cleared', 'polite');
	}

	private focusVersionCard(index: number): void {
		const versionCards = document.querySelectorAll('[role="article"]');
		const targetCard = versionCards[index] as HTMLElement;

		if (targetCard) {
			targetCard.focus();
			this.announce(`Focused on version ${index + 1}`, 'polite');
		} else {
			this.announce(`Version ${index + 1} not found`, 'polite');
		}
	}

	private focusSearch(): void {
		const searchInput = document.querySelector(
			'input[type="search"], [role="searchbox"]'
		) as HTMLElement;
		if (searchInput) {
			searchInput.focus();
			this.announce('Search focused', 'polite');
		}
	}

	private showKeyboardHelp(): void {
		const helpModal = this.createKeyboardHelpModal();
		document.body.appendChild(helpModal);
		this.enableFocusTrap(helpModal);
		helpModal.focus();
	}

	private createKeyboardHelpModal(): HTMLElement {
		const modal = document.createElement('div');
		modal.setAttribute('role', 'dialog');
		modal.setAttribute('aria-labelledby', 'keyboard-help-title');
		modal.setAttribute('aria-modal', 'true');
		modal.className = 'keyboard-help-modal';
		modal.tabIndex = -1;

		modal.innerHTML = `
      <div class="modal-backdrop">
        <div class="modal-content">
          <header class="modal-header">
            <h2 id="keyboard-help-title">Keyboard Shortcuts</h2>
            <button class="modal-close" aria-label="Close help">×</button>
          </header>
          <div class="modal-body">
            <div class="shortcut-grid">
              <div class="shortcut-group">
                <h3>Navigation</h3>
                <dl>
                  <dt><kbd>Alt + 1-9</kbd></dt>
                  <dd>Focus version card</dd>
                  <dt><kbd>Ctrl + /</kbd></dt>
                  <dd>Focus search</dd>
                  <dt><kbd>Tab</kbd></dt>
                  <dd>Next focusable element</dd>
                  <dt><kbd>Shift + Tab</kbd></dt>
                  <dd>Previous focusable element</dd>
                </dl>
              </div>
              <div class="shortcut-group">
                <h3>Actions</h3>
                <dl>
                  <dt><kbd>Enter</kbd></dt>
                  <dd>Activate/Launch</dd>
                  <dt><kbd>Space</kbd></dt>
                  <dd>Select/Toggle</dd>
                  <dt><kbd>R</kbd></dt>
                  <dd>Restart (when focused)</dd>
                  <dt><kbd>S</kbd></dt>
                  <dd>Stop (when focused)</dd>
                </dl>
              </div>
              <div class="shortcut-group">
                <h3>General</h3>
                <dl>
                  <dt><kbd>Escape</kbd></dt>
                  <dd>Close/Cancel</dd>
                  <dt><kbd>F1</kbd></dt>
                  <dd>Show this help</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

		// Add styles
		const style = document.createElement('style');
		style.textContent = `
      .keyboard-help-modal {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        z-index: 10000;
      }
      .modal-backdrop {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.8);
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 2rem;
      }
      .modal-content {
        background: var(--bg-primary, #0f172a);
        border: 1px solid var(--border-primary, rgba(255, 255, 255, 0.1));
        border-radius: 1rem;
        max-width: 600px;
        width: 100%;
        max-height: 80vh;
        overflow: auto;
      }
      .modal-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 1.5rem;
        border-bottom: 1px solid var(--border-primary, rgba(255, 255, 255, 0.1));
      }
      .modal-close {
        background: none;
        border: none;
        color: var(--text-primary, white);
        font-size: 1.5rem;
        cursor: pointer;
        padding: 0.5rem;
        border-radius: 0.5rem;
      }
      .modal-body {
        padding: 1.5rem;
      }
      .shortcut-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 2rem;
      }
      .shortcut-group h3 {
        color: var(--electric-blue, #00d4ff);
        margin-bottom: 1rem;
      }
      .shortcut-group dl {
        margin: 0;
      }
      .shortcut-group dt {
        font-weight: 600;
        margin-bottom: 0.25rem;
      }
      .shortcut-group dd {
        margin: 0 0 0.75rem 0;
        color: var(--text-secondary, #94a3b8);
      }
      kbd {
        background: var(--bg-secondary, #1e293b);
        border: 1px solid var(--border-primary, rgba(255, 255, 255, 0.2));
        border-radius: 0.25rem;
        padding: 0.125rem 0.375rem;
        font-family: monospace;
        font-size: 0.875rem;
      }
    `;
		document.head.appendChild(style);

		// Add event listeners
		const closeBtn = modal.querySelector('.modal-close') as HTMLElement;
		closeBtn.addEventListener('click', () => this.closeModal(modal));

		modal.addEventListener('keydown', (event) => {
			if (event.key === 'Escape') {
				this.closeModal(modal);
			}
		});

		return modal;
	}

	private closeModal(modal: HTMLElement): void {
		this.disableFocusTrap();
		modal.remove();
		this.announce('Help closed', 'polite');
	}

	private detectSystemPreferences(): void {
		this.mediaQueries.forEach((mq, name) => {
			this.handleSystemPreferenceChange(name, mq.matches);
		});
	}

	private handleSystemPreferenceChange(preference: string, matches: boolean): void {
		switch (preference) {
			case 'prefers-reduced-motion':
				document.documentElement.style.setProperty(
					'--animation-duration',
					matches ? '0ms' : '300ms'
				);
				this.announce(matches ? 'Reduced motion enabled' : 'Animations enabled', 'polite');
				break;
			case 'prefers-contrast':
				document.documentElement.classList.toggle('high-contrast', matches);
				this.announce(matches ? 'High contrast enabled' : 'Normal contrast', 'polite');
				break;
			case 'forced-colors':
				document.documentElement.classList.toggle('forced-colors', matches);
				break;
		}
	}

	// Public API methods
	announce(message: string, priority: 'polite' | 'assertive' = 'polite'): void {
		if (!this.announcer) return;

		const announcement: ScreenReaderAnnouncement = {
			message,
			priority,
			timestamp: new Date()
		};

		this.announcements.unshift(announcement);
		if (this.announcements.length > 5) {
			this.announcements.pop();
		}

		this.announcer.setAttribute('aria-live', priority);
		this.announcer.textContent = message;

		// Clear after a delay to prevent re-reading
		setTimeout(() => {
			if (this.announcer) {
				this.announcer.textContent = '';
			}
		}, 1000);
	}

	enableFocusTrap(container: HTMLElement): void {
		this.focusState.trapEnabled = true;
		this.focusState.trapContainer = container;

		// Focus first focusable element
		const focusableElements = this.getFocusableElements(container);
		if (focusableElements.length > 0) {
			focusableElements[0].focus();
		}
	}

	disableFocusTrap(): void {
		this.focusState.trapEnabled = false;
		this.focusState.trapContainer = null;
	}

	addLandmark(element: HTMLElement, role: string, label?: string): void {
		element.setAttribute('role', role);
		if (label) {
			element.setAttribute('aria-label', label);
		}
	}

	makeRegionLive(element: HTMLElement, priority: 'polite' | 'assertive' = 'polite'): void {
		element.setAttribute('aria-live', priority);
		element.setAttribute('aria-atomic', 'true');
	}

	addHeading(element: HTMLElement, level: number, text?: string): void {
		const headingId = `heading-${Math.random().toString(36).substr(2, 9)}`;
		element.setAttribute('role', 'heading');
		element.setAttribute('aria-level', level.toString());
		element.id = headingId;

		if (text) {
			element.textContent = text;
		}
	}

	linkElements(controlElement: HTMLElement, targetElement: HTMLElement): void {
		const targetId = targetElement.id || `target-${Math.random().toString(36).substr(2, 9)}`;
		if (!targetElement.id) {
			targetElement.id = targetId;
		}
		controlElement.setAttribute('aria-controls', targetId);
	}

	setExpandable(element: HTMLElement, expanded: boolean): void {
		element.setAttribute('aria-expanded', expanded.toString());
	}

	setPressed(element: HTMLElement, pressed: boolean): void {
		element.setAttribute('aria-pressed', pressed.toString());
	}

	setChecked(element: HTMLElement, checked: boolean | 'mixed'): void {
		element.setAttribute('aria-checked', checked.toString());
	}

	setSelected(element: HTMLElement, selected: boolean): void {
		element.setAttribute('aria-selected', selected.toString());
	}

	setDisabled(element: HTMLElement, disabled: boolean): void {
		if (disabled) {
			element.setAttribute('aria-disabled', 'true');
			element.removeAttribute('tabindex');
		} else {
			element.removeAttribute('aria-disabled');
			if (!element.hasAttribute('tabindex')) {
				element.setAttribute('tabindex', '0');
			}
		}
	}

	setInvalid(element: HTMLElement, invalid: boolean, message?: string): void {
		element.setAttribute('aria-invalid', invalid.toString());

		if (invalid && message) {
			const errorId = `error-${element.id || Math.random().toString(36).substr(2, 9)}`;
			let errorElement = document.getElementById(errorId);

			if (!errorElement) {
				errorElement = document.createElement('div');
				errorElement.id = errorId;
				errorElement.className = 'error-message sr-only';
				element.parentNode?.insertBefore(errorElement, element.nextSibling);
			}

			errorElement.textContent = message;
			element.setAttribute('aria-describedby', errorId);
		} else {
			element.removeAttribute('aria-describedby');
			const errorId = `error-${element.id}`;
			const errorElement = document.getElementById(errorId);
			errorElement?.remove();
		}
	}

	async loadUserPreferences(): Promise<AccessibilitySettings | null> {
		try {
			const stored = localStorage.getItem('accessibility-preferences');
			if (stored) {
				return JSON.parse(stored);
			}
		} catch (error) {
			console.warn('Failed to load accessibility preferences:', error);
		}
		return null;
	}

	async saveUserPreferences(settings: AccessibilitySettings): Promise<void> {
		try {
			localStorage.setItem('accessibility-preferences', JSON.stringify(settings));
		} catch (error) {
			console.warn('Failed to save accessibility preferences:', error);
		}
	}

	getScreenReaderAnnouncements(): ScreenReaderAnnouncement[] {
		return [...this.announcements];
	}

	getFocusHistory(): HTMLElement[] {
		return [...this.focusState.focusHistory];
	}

	restorePreviousFocus(): void {
		const lastFocused = this.focusState.focusHistory.pop();
		if (lastFocused && document.contains(lastFocused)) {
			lastFocused.focus();
		}
	}

	checkColorContrast(
		foreground: string,
		background: string
	): {
		ratio: number;
		passes: { aa: boolean; aaa: boolean };
	} {
		// Simplified contrast ratio calculation
		const getLuminance = (color: string) => {
			// This would need a proper color parsing implementation
			// For now, return a mock value
			return 0.5;
		};

		const fg = getLuminance(foreground);
		const bg = getLuminance(background);
		const ratio = (Math.max(fg, bg) + 0.05) / (Math.min(fg, bg) + 0.05);

		return {
			ratio,
			passes: {
				aa: ratio >= 4.5,
				aaa: ratio >= 7
			}
		};
	}
}

export const accessibilityService = new AccessibilityService();
