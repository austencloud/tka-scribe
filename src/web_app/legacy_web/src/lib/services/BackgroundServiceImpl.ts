/**
 * Background Service Implementation
 * 
 * Manages background settings and preferences for the legacy web app.
 */

export class BackgroundServiceImpl {
  private currentBackground: string = 'snowfall';
  private enabled: boolean = true;

  constructor() {
    // Load preferences only in browser
    if (typeof localStorage !== 'undefined') {
      this.loadPreferences();
    }
  }

  public getCurrentBackground(): string {
    return this.currentBackground;
  }

  public setBackground(type: string): void {
    this.currentBackground = type;
    this.savePreferences();
    this.emitBackgroundChange(type);
  }

  public isEnabled(): boolean {
    return this.enabled;
  }

  public enable(): void {
    this.enabled = true;
    this.savePreferences();
  }

  public disable(): void {
    this.enabled = false;
    this.savePreferences();
  }

  private loadPreferences(): void {
    if (typeof localStorage === 'undefined') return;

    try {
      const saved = localStorage.getItem('tka-background-preferences');
      if (saved) {
        const preferences = JSON.parse(saved);
        this.currentBackground = preferences.background || 'snowfall';
        this.enabled = preferences.enabled !== false;
      }
    } catch (error) {
      console.warn('Failed to load background preferences:', error);
    }
  }

  private savePreferences(): void {
    if (typeof localStorage === 'undefined') return;

    try {
      const preferences = {
        background: this.currentBackground,
        enabled: this.enabled
      };
      localStorage.setItem('tka-background-preferences', JSON.stringify(preferences));
    } catch (error) {
      console.warn('Failed to save background preferences:', error);
    }
  }

  private emitBackgroundChange(type: string): void {
    if (typeof document === 'undefined') return;

    const event = new CustomEvent('background-changed', {
      detail: { type },
      bubbles: true
    });
    document.dispatchEvent(event);
  }
}

// Export singleton instance
const backgroundService = new BackgroundServiceImpl();
export default backgroundService;
