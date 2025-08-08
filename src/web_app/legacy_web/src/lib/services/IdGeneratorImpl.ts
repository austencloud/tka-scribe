/**
 * ID Generator Implementation
 * 
 * Generates unique IDs for the legacy web app.
 */

export class IdGeneratorImpl {
  private counter: number = 0;

  constructor() {
    // Initialize counter with timestamp to avoid collisions
    this.counter = Date.now() % 10000;
  }

  public generateId(): string {
    return this.generateUuid();
  }

  public generateUuid(): string {
    // Use crypto.randomUUID if available (modern browsers)
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      return crypto.randomUUID();
    }

    // Fallback UUID v4 implementation
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  public generateShortId(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  public generateNumericId(): number {
    return ++this.counter;
  }

  public generatePrefixedId(prefix: string): string {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substr(2, 5);
    return `${prefix}-${timestamp}-${random}`;
  }

  public generateBeatId(): string {
    return this.generatePrefixedId('beat');
  }

  public generateSequenceId(): string {
    return this.generatePrefixedId('seq');
  }

  public generatePictographId(): string {
    return this.generatePrefixedId('pic');
  }

  public isValidUuid(id: string): boolean {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(id);
  }

  public resetCounter(): void {
    this.counter = 0;
  }

  public getCurrentCounter(): number {
    return this.counter;
  }
}

// Export singleton instance
const idGenerator = new IdGeneratorImpl();
export default idGenerator;
