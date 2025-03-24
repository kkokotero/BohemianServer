import crypto from 'crypto';
import fs from 'fs';

/**
 * Interface for the token payload.
 * This defines the structure of the data that can be included in the token.
 * @property {unknown} [key: string] - Any key-value pair can be included in the payload.
 * @property {number} [exp] - Optional expiration time in epoch format (seconds).
 * @property {string} [refreshToken] - Optional refresh token for token rotation.
 */
interface TokenPayload {
  [key: string]: unknown;
  exp?: number; // Expiration time in epoch format (seconds)
  refreshToken?: string; // Refresh token for token rotation
}

/**
 * Interface for token generation options.
 * This defines optional configurations for generating a token.
 * @property {number} [expiresIn] - Optional expiration time in seconds.
 * @property {string} [algorithm] - Algorithm to use for signing (default: 'HS256').
 * @property {string} [privateKey] - Private key for asymmetric algorithms like RS256.
 * @property {string} [publicKey] - Public key for asymmetric algorithms like RS256.
 */
interface TokenOptions {
  expiresIn?: number; // Expiration time in seconds
  algorithm?: 'HS256' | 'RS256'; // Algorithm for signing
  privateKey?: string; // Private key for RS256
  publicKey?: string; // Public key for RS256
}

/**
 * TokenManager class is responsible for generating and validating tokens.
 * It supports HMAC-SHA256 and RS256 algorithms and provides token rotation with refresh tokens.
 */
class TokenManager {
  private secret!: string; // Secret key used for signing tokens (for HMAC)

  private privateKey?: string; // Private key for RS256

  private publicKey?: string; // Public key for RS256

  /**
   * Constructor for TokenManager.
   * @param secretOrKey - The secret key (for HMAC) or path to private/public key pair (for RS256).
   * @param options - Optional configuration for key paths (for RS256).
   */
  constructor(
    secretOrKey: string,
    options?: { privateKeyPath?: string; publicKeyPath?: string },
  ) {
    if (options?.privateKeyPath && options.publicKeyPath) {
      // Load keys for RS256
      this.privateKey = fs.readFileSync(options.privateKeyPath, 'utf8');
      this.publicKey = fs.readFileSync(options.publicKeyPath, 'utf8');
    } else {
      // Use secret for HMAC
      this.secret = secretOrKey;
    }
  }

  /**
   * Generates a signed token.
   * @param payload - The data to include in the token.
   * @param options - Optional configuration, such as expiration time and algorithm.
   * @returns The generated token in base64url format.
   *
   * @example
   * const tokenManager = new TokenManager('my-secret-key');
   * const token = tokenManager.generate({ userId: 123 }, { expiresIn: 3600 });
   * console.log(token); // Outputs a signed token
   */
  generate(payload: TokenPayload, options?: TokenOptions): string {
    const algorithm = options?.algorithm || 'HS256';
    const header = {
      alg: algorithm,
      typ: 'JWT',
    };

    // Add expiration time to the payload if specified
    if (options?.expiresIn) {
      // eslint-disable-next-line no-param-reassign
      payload.exp = Math.floor(Date.now() / 1000) + options.expiresIn;
    }

    // Encode header and payload to base64url format
    const base64Header = Buffer.from(JSON.stringify(header)).toString(
      'base64url',
    );
    const base64Payload = Buffer.from(JSON.stringify(payload)).toString(
      'base64url',
    );

    // Concatenate the header and payload to form the data to be signed
    const data = `${base64Header}.${base64Payload}`;

    // Generate the signature based on the algorithm
    let signature: string;
    if (algorithm === 'HS256') {
      signature = crypto
        .createHmac('sha256', this.secret)
        .update(data)
        .digest('base64url');
    } else if (algorithm === 'RS256' && this.privateKey) {
      signature = crypto
        .createSign('RSA-SHA256')
        .update(data)
        .sign(this.privateKey, 'base64url');
    } else {
      throw new Error('Invalid algorithm or missing private key');
    }

    // The final token consists of header.payload.signature
    return `${data}.${signature}`;
  }

  /**
   * Validates a token.
   * @param token - The token to validate.
   * @returns An object indicating whether the token is valid, the decoded payload, and any error encountered.
   *
   * @example
   * const tokenManager = new TokenManager('my-secret-key');
   * const validationResult = tokenManager.validate(token);
   * if (validationResult.valid) {
   *   console.log('Token is valid:', validationResult.payload);
   * } else {
   *   console.error('Token is invalid:', validationResult.error);
   * }
   */
  validate(token: string): {
    valid: boolean;
    payload?: TokenPayload;
    error?: string;
  } {
    try {
      // Split the token into its three parts: header, payload, and signature
      const parts = token.split('.');
      if (parts.length !== 3) {
        return { valid: false, error: 'Invalid token format' };
      }

      const [base64Header, base64Payload, signature] = parts;
      const data = `${base64Header}.${base64Payload}`;

      // Decode the header to determine the algorithm
      const headerStr = Buffer.from(base64Header!, 'base64url').toString();
      const header = JSON.parse(headerStr);

      // Verify the signature based on the algorithm
      let isValid: boolean;
      if (header.alg === 'HS256') {
        const expectedSignature = crypto
          .createHmac('sha256', this.secret)
          .update(data)
          .digest('base64url');
        isValid = signature === expectedSignature;
      } else if (header.alg === 'RS256' && this.publicKey) {
        isValid = crypto
          .createVerify('RSA-SHA256')
          .update(data)
          .verify(this.publicKey, signature!, 'base64url');
      } else {
        return {
          valid: false,
          error: 'Unsupported algorithm or missing public key',
        };
      }

      if (!isValid) {
        return { valid: false, error: 'Invalid signature' };
      }

      // Decode the payload
      const payloadStr = Buffer.from(base64Payload!, 'base64url').toString();
      const payload = JSON.parse(payloadStr);

      // Check if the token has expired
      if (payload.exp && typeof payload.exp === 'number') {
        if (Math.floor(Date.now() / 1000) > payload.exp) {
          return { valid: false, error: 'Token expired' };
        }
      }

      // Return the validation result and the decoded payload
      return { valid: true, payload };
    } catch (error) {
      // Handle any errors during validation
      return { valid: false, error: (error as Error).message };
    }
  }

  /**
   * Generates a refresh token.
   * @param payload - The data to include in the refresh token.
   * @param options - Optional configuration, such as expiration time.
   * @returns The generated refresh token.
   */
  generateRefreshToken(payload: TokenPayload, options?: TokenOptions): string {
    return this.generate(payload, {
      ...options,
      expiresIn: options?.expiresIn || 86400 * 7,
    }); // Default: 7 days
  }
}

// Export the TokenManager class and related interfaces
export { TokenManager, TokenPayload, TokenOptions };
