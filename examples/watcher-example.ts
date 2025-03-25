import { Watcher } from '../src/utils';

/**
 * Demonstrates the usage of the `Watcher` class to observe changes in values.
 *
 * This example showcases:
 * - Watching a number value and logging changes.
 * - Watching an object and reacting to modifications.
 * - Adding and removing listeners dynamically.
 */

/**
 * Create a Watcher instance for a numeric value.
 *
 * The callback logs when the number changes.
 */
const numberWatcher = new Watcher<number>(10, (newValue, oldValue) => {
  console.log(`the number change of ${oldValue} to ${newValue}`);
});

// Modify the value to trigger the watcher callback
numberWatcher.value = 20;

/**
 * Create a Watcher instance for an object.
 *
 * The callback logs when the object changes.
 */
const objectWatcher = new Watcher<{ name: string }>(
  { name: 'Alice' },
  (newValue, oldValue) => {
    console.log('The object change:', { oldValue, newValue });
  },
);

// Modify the object to trigger the watcher callback
objectWatcher.value = { name: 'Bob' };

/**
 * Add an additional listener to the object watcher.
 *
 * This listener logs the change in JSON format.
 */
objectWatcher.addListener((newValue, oldValue) => {
  console.log(
    `Change detected: ${JSON.stringify(oldValue)} -> ${JSON.stringify(newValue)}`,
  );
});

// Modify the object again to trigger both listeners
objectWatcher.value = { name: 'Charlie' };

/**
 * Define a listener that will be removed later.
 *
 * This listener logs a message when triggered.
 */
const listenerToRemove = (
  _newValue: { name: string },
  _oldValue: { name: string },
) => {
  console.log('This listener will be delete.');
};

// Add and then remove the listener
objectWatcher.addListener(listenerToRemove);
objectWatcher.removeListener(listenerToRemove);

// Modify the object again; removed listener should not trigger
objectWatcher.value = { name: 'David' };
