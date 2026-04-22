/**
 * Keyboard interaction utilities for form navigation and accessibility testing.
 * Provides validation and helper methods for keyboard-based interactions.
 */

/**
 * Valid keyboard keys for form navigation and interaction.
 * Based on common web accessibility patterns and form controls.
 */
export const VALID_KEYBOARD_KEYS = new Set([
  'Tab', 'Enter', 'Escape', 'Backspace', 'Delete',
  'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight',
  'Space', 'Home', 'End', 'PageUp', 'PageDown',
  'Control', 'Shift', 'Alt', 'Meta'
]);

/**
 * Validates if a keyboard key name is supported for testing.
 * Throws an error with helpful message if the key is not valid.
 *
 * @param keyName The keyboard key name to validate
 * @throws Error if the key name is not in the valid keys set
 */
export function validateKeyboardKey(keyName: string): void {
  if (!VALID_KEYBOARD_KEYS.has(keyName)) {
    throw new Error(
      `[KeyboardHelper] Invalid key name "${keyName}". ` +
      `Valid keys: ${Array.from(VALID_KEYBOARD_KEYS).join(', ')}`
    );
  }
}

/**
 * Gets all valid keyboard key names as an array.
 * Useful for documentation or dynamic key selection.
 *
 * @returns Array of valid keyboard key names
 */
export function getValidKeyboardKeys(): string[] {
  return Array.from(VALID_KEYBOARD_KEYS);
}

/**
 * Checks if a keyboard key name is valid without throwing an error.
 *
 * @param keyName The keyboard key name to check
 * @returns true if the key is valid, false otherwise
 */
export function isValidKeyboardKey(keyName: string): boolean {
  return VALID_KEYBOARD_KEYS.has(keyName);
}
