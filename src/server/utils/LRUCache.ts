/**
 * A simple Least Recently Used (LRU) Cache implementation.
 * This cache removes the least recently used items when the maximum size is exceeded.
 *
 * @typeParam K - The type of the keys.
 * @typeParam V - The type of the values.
 */
export class LRUCache<K, V> {
  /** The maximum number of items the cache can store. */
  private maxSize: number;

  /** The internal Map used to store the cache entries. */
  private cache: Map<K, V>;

  /**
   * Creates a new LRU Cache.
   *
   * @param maxSize - The maximum number of items to store in the cache.
   *
   * @example
   * ```typescript
   * const cache = new LRUCache<string, number>(3);
   * cache.set('a', 1);
   * cache.set('b', 2);
   * cache.set('c', 3);
   * console.log(cache.get('a')); // 1 (moves 'a' to most recently used)
   * cache.set('d', 4); // 'b' is removed (least recently used)
   * ```
   */
  constructor(maxSize: number) {
    this.maxSize = maxSize;
    this.cache = new Map();
  }

  /**
   * Retrieves a value from the cache.
   * If the key exists, it is moved to the most recently used position.
   *
   * @param key - The key to retrieve.
   * @returns The cached value, or `undefined` if the key is not found.
   *
   * @example
   * ```typescript
   * cache.get('a'); // Retrieves 'a' and moves it to the most recently used position.
   * ```
   */
  get(key: K): V | undefined {
    if (!this.cache.has(key)) return undefined;

    // Move to the end to mark as recently used
    const value = this.cache.get(key)!;
    this.cache.delete(key);
    this.cache.set(key, value);
    return value;
  }

  /**
   * Stores a key-value pair in the cache.
   * If the cache exceeds `maxSize`, it removes the least recently used item.
   *
   * @param key - The key to store.
   * @param value - The value to associate with the key.
   *
   * @example
   * ```typescript
   * cache.set('e', 5); // Adds 'e' to the cache, possibly evicting the least recently used item.
   * ```
   */
  set(key: K, value: V): void {
    if (this.cache.size >= this.maxSize) {
      // Remove the first element (least recently used)
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey as K);
    }
    this.cache.set(key, value);
  }
}
