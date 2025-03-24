/**
 * ObjectCache Class
 *
 * A utility class to manage caching of objects with a defined storage limit.
 * Uses an LRU (Least Recently Used) strategy to evict old items when the cache limit is reached.
 *
 * @template T - The type of objects to be cached.
 */
export class CacheManager<T> {
  private cache: Map<string, T>; // Stores cached objects

  private maxSize: number; // Maximum number of items in the cache

  private accessOrder: string[]; // Tracks the order of access for LRU eviction

  /**
   * Creates a new ObjectCache instance.
   * @param maxSize - The maximum number of items the cache can hold. Default is 100.
   *
   * @example
   * const cache = new ObjectCache<number>(50); // Cache with a limit of 50 items
   */
  constructor(maxSize: number = 100) {
    this.cache = new Map();
    this.maxSize = maxSize;
    this.accessOrder = [];
  }

  /**
   * Adds or updates an item in the cache.
   * @param key - The key to associate with the item.
   * @param value - The value to cache.
   *
   * @example
   * cache.set('user:123', { name: 'John', age: 30 });
   */
  set(key: string, value: T): void {
    if (this.cache.size >= this.maxSize) {
      this.evictLRU(); // Evict the least recently used item if the cache is full
    }
    this.cache.set(key, value);
    this.updateAccessOrder(key); // Update the access order
  }

  /**
   * Retrieves an item from the cache.
   * @param key - The key of the item to retrieve.
   * @returns The cached item, or undefined if the key is not found.
   *
   * @example
   * const user = cache.get('user:123');
   */
  get(key: string): T | undefined {
    if (this.cache.has(key)) {
      this.updateAccessOrder(key); // Update the access order
      return this.cache.get(key);
    }
    return undefined;
  }

  /**
   * Deletes an item from the cache.
   * @param key - The key of the item to delete.
   * @returns True if the item was deleted, false if the key was not found.
   *
   * @example
   * cache.delete('user:123');
   */
  delete(key: string): boolean {
    if (this.cache.delete(key)) {
      this.accessOrder = this.accessOrder.filter((k) => k !== key); // Remove from access order
      return true;
    }
    return false;
  }

  /**
   * Clears the entire cache.
   *
   * @example
   * cache.clear();
   */
  clear(): void {
    this.cache.clear();
    this.accessOrder = [];
  }

  /**
   * Checks if the cache contains a specific key.
   * @param key - The key to check.
   * @returns True if the key exists in the cache, false otherwise.
   *
   * @example
   * if (cache.has('user:123')) { ... }
   */
  has(key: string): boolean {
    return this.cache.has(key);
  }

  /**
   * Gets the current size of the cache.
   * @returns The number of items in the cache.
   *
   * @example
   * const size = cache.size();
   */
  size(): number {
    return this.cache.size;
  }

  /**
   * Updates the access order for a key (moves it to the end of the list).
   * @param key - The key to update.
   */
  private updateAccessOrder(key: string): void {
    this.accessOrder = this.accessOrder.filter((k) => k !== key); // Remove the key if it exists
    this.accessOrder.push(key); // Add it to the end (most recently used)
  }

  /**
   * Evicts the least recently used item from the cache.
   */
  private evictLRU(): void {
    const lruKey = this.accessOrder.shift(); // Get the least recently used key
    if (lruKey) {
      this.cache.delete(lruKey); // Remove it from the cache
    }
  }
}
