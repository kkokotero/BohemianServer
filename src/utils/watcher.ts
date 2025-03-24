/**
 * Watcher Class
 *
 * A utility class that watches for changes to a value and triggers callbacks
 * whenever the value is updated. This is useful for implementing reactive
 * programming patterns or state management.
 *
 * @template T - The type of the value being watched.
 */
export class Watcher<T> {
  private _value: T; // Internal storage for the value

  private listeners: Array<(newValue: T, oldValue: T) => void> = []; // List of change listeners

  private deepCompare: boolean; // Flag to enable deep comparison

  /**
   * Constructor for the Watcher class.
   * @param initialValue - The initial value to be watched.
   * @param onChange - Optional callback function that is triggered whenever the value changes.
   *                  It receives the new value and the old value as arguments.
   *
   * @example
   * const watcher = new Watcher<number>(10, (newValue, oldValue) => {
   *   console.log(`Value changed from ${oldValue} to ${newValue}`);
   * });
   *
   * @example
   * const watcher = new Watcher<object>({ name: 'John' }, (newValue, oldValue) => {
   *   console.log('Object changed:', { oldValue, newValue });
   * }); // Deep comparison is automatically enabled for objects
   */
  constructor(initialValue: T, onChange?: (newValue: T, oldValue: T) => void) {
    this._value = initialValue; // Initialize the value
    this.deepCompare = this.isComplexType(initialValue); // Enable deep comparison for complex types

    if (onChange) {
      this.listeners.push(onChange); // Add the initial callback
    }
  }

  /**
   * Getter for the current value.
   * @returns The current value being watched.
   *
   * @example
   * console.log(watcher.value); // Outputs the current value
   */
  get value(): T {
    return this._value;
  }

  /**
   * Setter for the current value.
   * If the new value is different from the current value, all registered callbacks
   * are triggered with the new and old values.
   * @param newValue - The new value to set.
   *
   * @example
   * watcher.value = 20; // Triggers the onChange callback if the value changes
   */
  set value(newValue: T) {
    if (this.hasChanged(newValue)) {
      const oldValue = this._value; // Store the old value
      this._value = newValue; // Update the value
      this.notifyListeners(newValue, oldValue); // Notify all listeners
    }
  }

  /**
   * Adds a new listener to be triggered when the value changes.
   * @param listener - The callback function to add.
   *
   * @example
   * watcher.addListener((newValue, oldValue) => {
   *   console.log('New listener:', newValue);
   * });
   */
  addListener(listener: (newValue: T, oldValue: T) => void): void {
    this.listeners.push(listener);
  }

  /**
   * Removes a listener from the list of callbacks.
   * @param listener - The callback function to remove.
   *
   * @example
   * const listener = (newValue, oldValue) => console.log('Listener removed');
   * watcher.addListener(listener);
   * watcher.removeListener(listener);
   */
  removeListener(listener: (newValue: T, oldValue: T) => void): void {
    this.listeners = this.listeners.filter((l) => l !== listener);
  }

  /**
   * Checks if the new value is different from the current value.
   * @param newValue - The new value to compare.
   * @returns True if the value has changed, false otherwise.
   */
  private hasChanged(newValue: T): boolean {
    if (this.deepCompare) {
      return !this.deepEqual(this._value, newValue); // Deep comparison for complex types
    }
    return this._value !== newValue; // Shallow comparison for primitives
  }

  /**
   * Performs a deep comparison between two values.
   * @param a - The first value to compare.
   * @param b - The second value to compare.
   * @returns True if the values are deeply equal, false otherwise.
   */
  private deepEqual(a: unknown, b: unknown): boolean {
    if (a === b) return true; // Same reference or same primitive value

    // Check if both are objects and not null
    if (
      typeof a !== 'object' ||
      a === null ||
      typeof b !== 'object' ||
      b === null
    ) {
      return false;
    }

    const keysA = Object.keys(a) as (keyof typeof a)[];
    const keysB = Object.keys(b) as (keyof typeof b)[];

    // Check if the number of keys is the same
    if (keysA.length !== keysB.length) return false;

    // Check if all keys and values are equal
    // eslint-disable-next-line no-restricted-syntax
    for (const key of keysA) {
      if (!keysB.includes(key) || !this.deepEqual(a[key], b[key])) {
        return false;
      }
    }

    return true;
  }

  /**
   * Determines if a value is a complex type (object or array).
   * @param value - The value to check.
   * @returns True if the value is a complex type, false otherwise.
   */
  // eslint-disable-next-line class-methods-use-this
  private isComplexType(value: unknown): boolean {
    return typeof value === 'object' && value !== null;
  }

  /**
   * Notifies all registered listeners about the value change.
   * @param newValue - The new value.
   * @param oldValue - The old value.
   */
  private notifyListeners(newValue: T, oldValue: T): void {
    this.listeners.forEach((listener) => {
      try {
        listener(newValue, oldValue); // Trigger the listener
      } catch (error) {
        console.error('Error in listener:', error); // Handle errors in listeners
      }
    });
  }
}
