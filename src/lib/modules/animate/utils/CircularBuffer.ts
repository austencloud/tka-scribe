/**
 * Circular Buffer Implementation
 *
 * High-performance ring buffer for managing trail points.
 * Provides O(1) push and automatic old point removal.
 *
 * Performance improvement over array.shift():
 * - array.shift() is O(n) - reallocates entire array
 * - CircularBuffer is O(1) - just updates head/tail pointers
 */

export class CircularBuffer<T> {
  private buffer: (T | undefined)[];
  private head: number = 0; // Write position
  private tail: number = 0; // Read position
  private size: number = 0; // Current number of elements
  private readonly capacity: number;

  constructor(capacity: number) {
    this.capacity = capacity;
    this.buffer = new Array(capacity);
  }

  /**
   * Add an item to the buffer
   * If buffer is full, oldest item is automatically removed
   */
  push(item: T): void {
    this.buffer[this.head] = item;
    this.head = (this.head + 1) % this.capacity;

    if (this.size < this.capacity) {
      this.size++;
    } else {
      // Buffer is full - tail moves forward (oldest element overwritten)
      this.tail = (this.tail + 1) % this.capacity;
    }
  }

  /**
   * Get the current number of elements
   */
  get length(): number {
    return this.size;
  }

  /**
   * Get element at index (0 = oldest, length-1 = newest)
   */
  get(index: number): T | undefined {
    if (index < 0 || index >= this.size) {
      return undefined;
    }
    const actualIndex = (this.tail + index) % this.capacity;
    return this.buffer[actualIndex];
  }

  /**
   * Clear all elements
   */
  clear(): void {
    this.head = 0;
    this.tail = 0;
    this.size = 0;
    // Don't reallocate array - just reset pointers
  }

  /**
   * Iterate over all elements (oldest to newest)
   */
  *[Symbol.iterator](): Iterator<T> {
    for (let i = 0; i < this.size; i++) {
      const index = (this.tail + i) % this.capacity;
      const item = this.buffer[index];
      if (item !== undefined) {
        yield item;
      }
    }
  }

  /**
   * Filter elements and keep only those that pass the predicate
   * Maintains insertion order
   */
  filterInPlace(predicate: (item: T) => boolean): void {
    const kept: T[] = [];

    for (const item of this) {
      if (predicate(item)) {
        kept.push(item);
      }
    }

    // Reset buffer and re-add filtered items
    this.clear();
    for (const item of kept) {
      this.push(item);
    }
  }

  /**
   * Convert to array (for compatibility with existing code)
   */
  toArray(): T[] {
    return Array.from(this);
  }

  /**
   * Get the last n elements (most recent)
   */
  getLast(n: number): T[] {
    const result: T[] = [];
    const count = Math.min(n, this.size);
    const startIndex = this.size - count;

    for (let i = startIndex; i < this.size; i++) {
      const index = (this.tail + i) % this.capacity;
      const item = this.buffer[index];
      if (item !== undefined) {
        result.push(item);
      }
    }

    return result;
  }
}
