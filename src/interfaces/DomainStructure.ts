/**
 * A route callback function that handles a single request.
 * Typically, it accepts the Request, Response, and a Next function to pass control.
 *
 * @callback CallbackRoute
 * @param {Request} request - The incoming request object.
 * @param {Response} response - The outgoing response object.
 * @param {Next} [next] - Optional function to pass control to the next middleware.
 */

/**
 * A list of route callback functions.
 *
 * @typedef {CallbackRoute[]} CallbacksRoute
 */

/**
 * Defines the structure of a route.
 *
 * This interface specifies how individual routes are configured.
 * It includes properties such as the HTTP method, route path, and the callbacks to be executed.
 *
 * @typedef {Object} RouterStructure
 * @property {string} method - The HTTP method (e.g., GET, POST).
 * @property {string} path - The route path.
 * @property {CallbacksRoute} callbacks - An array of callback functions for the route.
 */

// The above types are imported from './RouterStructure'
import {
  CallbackRoute,
  CallbacksRoute,
  RouterStructure,
} from './RouterStructure';

/**
 * Represents SSL configuration for a domain, allowing secure HTTPS connections.
 */
export interface SSL {
  /**
   * Private key for SSL encryption.
   * Can be a string or an array of strings for multiple keys.
   *
   * Example:
   * ```typescript
   * { key: "path/to/key.pem" }
   * ```
   */
  key: string | string[];

  /**
   * SSL certificate for the domain.
   * Can be a string or an array of strings for multiple certificates.
   *
   * Example:
   * ```typescript
   * { cert: "path/to/cert.pem" }
   * ```
   */
  cert: string | string[];
}

/**
 * Defines the configuration structure for a domain.
 */
export interface DomainStructure {
  /**
   * The primary hostname for the domain.
   * If undefined, it matches any host.
   *
   * Example:
   * ```typescript
   * { host: "example.com" }
   * ```
   */
  host?: string;

  /**
   * SSL configuration for enabling HTTPS.
   *
   * Example:
   * ```typescript
   * { ssl: { key: "path/to/key.pem", cert: "path/to/cert.pem" } }
   * ```
   */
  ssl?: SSL;

  /**
   * Specifies if HTTPS should be used.
   *
   * Example:
   * ```typescript
   * { https: true }
   * ```
   */
  https?: boolean;

  /**
   * Middleware functions executed before handling requests.
   *
   * Example:
   * ```typescript
   * { uses: [someMiddleware] }
   * ```
   */
  uses?: CallbacksRoute;

  /**
   * Base directory for serving static files.
   *
   * Example:
   * ```typescript
   * { staticUrl: join(process.cwd(), "/static") }
   * ```
   */
  staticUrl?: string;

  /**
   * Route definitions specific to this domain.
   *
   * Example:
   * ```typescript
   * { routes: [{ path: "/api", callbacks: [apiHandler] }] }
   * ```
   */
  routes?: RouterStructure[];

  /**
   * Nested subdomains with their own configurations.
   *
   * Example:
   * ```typescript
   * {
   *   domains: [
   *     { host: "example", routes: [{ path: "/sub", callbacks: [subHandler] }] }
   *   ]
   * }
   * ```
   */
  domains?: SubDomainStructure[];

  /**
   * Keep-alive timeout duration in milliseconds.
   *
   * Example:
   * ```typescript
   * { keepAliveTimeout: 5000 }
   * ```
   */
  keepAliveTimeout?: number;

  /**
   * Custom 404 error handler for undefined routes.
   *
   * Example:
   * ```typescript
   * { "404": customNotFoundHandler }
   * ```
   */
  '404'?: CallbackRoute;

  /**
   * Maximum cache size for the domain.
   *
   * Example:
   * ```typescript
   * { cacheSize: 100 }
   * ```
   */
  cacheSize?: number;

  /**
   * Defines the communication mode for the host.
   * - 'connected': Domain and subdomains can communicate.
   * - 'isolated': Each subdomain operates independently.
   * - 'public': Open communication for the host with any origin.
   *
   * Example:
   * ```typescript
   * { communication: 'connected' }
   * ```
   */
  communication?: 'connected' | 'isolated' | 'public';

  /**
   * Specifies which domains this domain can connect to.
   * - 'all': Connects to all domains and subdomains.
   * - Specific array of domain names.
   *
   * Example:
   * ```typescript
   * { connectTo: ['example.com', 'sub.example.com'] }
   * ```
   */
  connectTo?: 'all' | string[] | undefined;
}

/**
 * Defines the configuration for a subdomain.
 */
export interface SubDomainStructure {
  /**
   * The subdomain name. The full domain is generated automatically.
   *
   * Example: If "host" is "example" and the main domain is "localhost",
   * the resulting domain will be "example.localhost".
   *
   * Example:
   * ```typescript
   * { host: "example" }
   * ```
   */
  host: string;

  /**
   * Route configurations for this subdomain.
   *
   * Example:
   * ```typescript
   * { routes: [{ path: "/api", callbacks: [apiHandler] }] }
   * ```
   */
  routes?: RouterStructure[];

  /**
   * Middleware functions executed before handling requests.
   *
   * Example:
   * ```typescript
   * { uses: [someMiddleware] }
   * ```
   */
  uses?: CallbacksRoute;

  /**
   * Base directory for serving static files.
   *
   * Example:
   * ```typescript
   * { staticUrl: join(process.cwd(), "/static") }
   * ```
   */
  staticUrl?: string;

  /**
   * Custom 404 error handler for undefined routes.
   *
   * Example:
   * ```typescript
   * { "404": customNotFoundHandler }
   * ```
   */
  '404'?: CallbackRoute;

  /**
   * Defines the communication mode for the host.
   * - 'connected': Domain and subdomains can communicate.
   * - 'isolated': Each subdomain operates independently.
   * - 'public': Open communication for the host with any origin.
   *
   * Example:
   * ```typescript
   * { communication: 'connected' }
   * ```
   */
  communication?: 'connected' | 'isolated' | 'public';

  /**
   * Specifies which domains this domain can connect to.
   * - 'all': Connects to all domains and subdomains.
   * - Specific array of domain names.
   *
   * Example:
   * ```typescript
   * { connectTo: ['example.com', 'sub.example.com'] }
   * ```
   */
  connectTo?: 'all' | string[];
}
