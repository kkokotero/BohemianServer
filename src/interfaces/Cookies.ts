/**
 * Interface representing options for setting cookies.
 * These options help configure how cookies behave in the browser or server.
 */
export interface CookieOptions {
  /**
   * Specifies the maximum age of the cookie in seconds.
   * After this duration, the cookie will be automatically deleted.
   *
   * Example: A cookie that lasts for 1 hour (3600 seconds)
   * ```typescript
   * { maxAge: 3600 }
   * ```
   */
  maxAge?: number;

  /**
   * Defines the domain where the cookie is available.
   * If not set, the cookie is only available to the current domain.
   *
   * Example: Restrict cookie to "example.com" and all its subdomains
   * ```typescript
   * { domain: "example.com" }
   * ```
   */
  domain?: string;

  /**
   * Specifies the URL path for which the cookie is valid.
   * If not set, the default is the path of the page that set the cookie.
   *
   * Example: Restrict cookie to a specific path
   * ```typescript
   * { path: "/admin" }
   * ```
   */
  path?: string;

  /**
   * Indicates whether the cookie should only be transmitted over HTTPS.
   * This helps enhance security by preventing cookies from being sent over unencrypted connections.
   *
   * Example: Secure cookie (only over HTTPS)
   * ```typescript
   * { secure: true }
   * ```
   */
  secure?: boolean;

  /**
   * When set to `true`, the cookie is inaccessible to JavaScript running in the browser (via `document.cookie`).
   * This prevents client-side scripts from accessing sensitive data stored in cookies.
   *
   * Example: HTTP-only cookie (not accessible via JavaScript)
   * ```typescript
   * { httpOnly: true }
   * ```
   */
  httpOnly?: boolean;

  /**
   * Controls how cookies are sent with cross-site requests to prevent CSRF attacks.
   * - `Lax`: Cookies are sent with top-level navigation and GET requests.
   * - `Strict`: Cookies are only sent in a first-party context.
   * - `None`: Cookies are sent with all requests (must also have `secure: true`).
   *
   * Example: Setting SameSite policy to "Lax"
   * ```typescript
   * { sameSite: "Lax" }
   * ```
   */
  sameSite?: 'Lax' | 'Strict' | 'None';
}

/**
 * Example usage of the CookieOptions interface to create a secure session cookie.
 *
 * const sessionCookie: CookieOptions = {
 * maxAge: 86400, // 1 day in seconds
 * domain: "example.com",
 * path: "/",
 * secure: true,
 * httpOnly: true,
 * sameSite: "Strict",
 * };
 */
