import { TokenManager } from '../src/utils/Token';

/**
 * Demonstrates the usage of TokenManager for generating and validating tokens.
 *
 * This example shows how to:
 * - Generate a token with a payload and expiration time.
 * - Validate the generated token.
 * - Generate a refresh token.
 * - Validate the refresh token.
 */

// Create an instance of TokenManager with a secret key.
const tokenManager = new TokenManager('my-secret-key');

/**
 * Generate a token with user-related payload.
 *
 * @param {Object} payload - The payload data (e.g., userId and role).
 * @param {Object} options - Options such as expiration time.
 * @returns {string} The generated token.
 */
const token = tokenManager.generate(
  { userId: 123, role: 'admin' },
  { expiresIn: 3600 },
);
console.log('Generated Token:', token);

/**
 * Validate the generated token.
 *
 * Checks whether the token is valid and extracts its payload.
 */
const validationResult = tokenManager.validate(token);
if (validationResult.valid) {
  console.log('Token is valid:', validationResult.payload);
} else {
  console.error('Token is invalid:', validationResult.error);
}

/**
 * Generate a refresh token.
 *
 * @param {Object} payload - The payload data (e.g., userId).
 * @returns {string} The generated refresh token.
 */
const refreshToken = tokenManager.generateRefreshToken({ userId: 123 });
console.log('Generated Refresh Token:', refreshToken);

/**
 * Validate the refresh token.
 *
 * Checks whether the refresh token is valid and extracts its payload.
 */
const refreshValidation = tokenManager.validate(refreshToken);
if (refreshValidation.valid) {
  console.log('Refresh Token is valid:', refreshValidation.payload);
} else {
  console.error('Refresh Token is invalid:', refreshValidation.error);
}
