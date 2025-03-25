import {
  CallbackRoute,
  CallbacksRoute,
  RouterStructure,
} from './RouterStructure';

/**
 * Represents SSL configuration for a domain.
 */
export interface SSL {
  /**
   * Private key for SSL encryption.
   * Can be a string or an array of strings.
   *
   * Example:
   * ```typescript
   * { key: "path/to/key.pem" }
   * ```
   */
  key: string | string[];

  /**
   * SSL certificate for the domain.
   * Can be a string or an array of strings.
   *
   * Example:
   * ```typescript
   * { cert: "path/to/cert.pem" }
   * ```
   */
  cert: string | string[];
}

/**
 * Represents the structure of a domain configuration.
 */
export interface DomainStructure {
  /**
   * The hostname for the domain.
   * If not specified, it will match any host.
   *
   * Example:
   * ```typescript
   * { host: "example.com" }
   * ```
   */
  host?: string;

  /**
   * SSL configuration for secure HTTPS connections.
   *
   * Example:
   * ```typescript
   * {
   *   ssl: { key: "path/to/key.pem", cert: "path/to/cert.pem" }
   * }
   * ```
   */
  ssl?: SSL;

  /**
   * Indicates whether HTTPS should be used.
   *
   * Example:
   * ```typescript
   * { https: true }
   * ```
   */
  https?: boolean;

  /**
   * Callbacks that will be executed before processing requests.
   *
   * Example:
   * ```typescript
   * { uses: [someMiddleware] }
   * ```
   */
  uses?: CallbacksRoute;

  /**
   * The base URL for serving static files.
   *
   * Example:
   * ```typescript
   * { staticUrl: join(process.cwd(), "/static") }
   * ```
   */
  staticUrl?: string;

  /**
   * List of route configurations for this domain.
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
   * Specifies the keep-alive timeout in milliseconds.
   *
   * Example:
   * ```typescript
   * { keepAliveTimeout: 5000 }
   * ```
   */
  keepAliveTimeout?: number;

  /**
   * Defines a custom 404 error handler for unmatched routes.
   *
   * Example:
   * ```typescript
   * { "404": customNotFoundHandler }
   * ```
   */
  '404'?: CallbackRoute;

  /**
   * Specifies the maximum size of the cache for this domain.
   *
   * Example:
   * ```typescript
   * { cacheSize: 100 }
   * ```
   */
  cacheSize?: number;
}

/**
 * Represents the configuration of a subdomain.
 */
export interface SubDomainStructure {
  /**
   * The hostname for the subdomain.
   * If not specified, it will match any host.
   * Only the subdomain name is needed, as the system will automatically generate the full domain.
   * For example, if you set "example" and the main domain is "localhost", the final domain will be "example.localhost".
   *
   * Example:
   * ```typescript
   * { host: "example" }
   * ```
   */
  host: string;

  /**
   * List of route configurations for this subdomain.
   *
   * Example:
   * ```typescript
   * { routes: [{ path: "/api", callbacks: [apiHandler] }] }
   * ```
   */
  routes?: RouterStructure[];

  /**
   * Callbacks that will be executed before processing requests.
   *
   * Example:
   * ```typescript
   * { uses: [someMiddleware] }
   * ```
   */
  uses?: CallbacksRoute;

  /**
   * The base URL for serving static files.
   *
   * Example:
   * ```typescript
   * { staticUrl: join(process.cwd(), "/static") }
   * ```
   */
  staticUrl?: string;

  /**
   * Defines a custom 404 error handler for unmatched routes.
   *
   * Example:
   * ```typescript
   * { "404": customNotFoundHandler }
   * ```
   */
  '404'?: CallbackRoute;
}
