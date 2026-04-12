// ID generation utilities

/**
 * Generates a random alphanumeric ID
 * @param length - The length of the ID (default: 9)
 * @returns A random alphanumeric string
 */
export function generateId(length: number = 9): string {
  return Math.random().toString(36).substring(2, 2 + length);
}

/**
 * Generates a unique ID with timestamp prefix
 * @param randomLength - The length of the random part (default: 5)
 * @returns A unique string ID
 */
export function generateUniqueId(randomLength: number = 5): string {
  return `${Date.now().toString()}-${Math.random().toString(36).substring(2, 2 + randomLength)}`;
}
