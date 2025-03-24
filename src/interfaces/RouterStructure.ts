import type { ResponseHandler } from '../server/handlers/ResponseHandler';
import type { RequestHandler } from '../server/handlers/RequestHandler';

/**
 * Type representing the function to proceed to the next middleware in the chain.
 */
export type Next = () => void;

/**
 * Type for route callback functions.
 * Represents a function that handles an HTTP request.
 * It can have multiple signatures depending on the accepted arguments:
 * - A function that takes `request`, `response`, and `next`.
 * - A function that takes `request` and `response`.
 * - A function that takes only `request`.
 * - A function that takes no arguments.
 *
 * Example:
 * ```typescript
 * const exampleRoute: CallbackRoute = (req, res, next) => {
 *   res.send("Hello, world!");
 *   next();
 * };
 * ```
 */
export type CallbackRoute =
  | ((request: RequestHandler, response: ResponseHandler, next: Next) => void)
  | ((request: RequestHandler, response: ResponseHandler) => void)
  | ((request: RequestHandler) => void)
  | (() => void);

/**
 * Type for an array of route callback functions.
 * Represents a collection of `CallbackRoute` functions that will be executed sequentially
 * when a request matches a specific route.
 *
 * Example:
 * ```typescript
 * const middlewares: CallbacksRoute = [middleware1, middleware2, finalHandler];
 * ```
 */
export type CallbacksRoute = CallbackRoute[];

/**
 * Structure representing an HTTP route in a router.
 * Defines how incoming requests that match a specific route will be handled.
 */
export interface RouterStructure {
  /**
   * The route or path pattern used to match incoming requests.
   * It may include route parameters, such as "/api/chat/:id/:message".
   * Route parameters can be used to capture dynamic values in the URL.
   *
   * Example:
   * ```typescript
   * { path: "/api/users/:userId" }
   * ```
   */
  path: string;

  /**
   * An array of callback functions that will be executed when a request matches this route.
   * Each callback function receives up to three arguments:
   * - `request`: An instance of `RequestHandler` containing information about the incoming request.
   * - `response`: An instance of `ResponseHandler` used to send a response to the client.
   * - `next`: A function that, when called, passes control to the next callback function in the array.
   *   If `next` is not called, the middleware chain stops.
   *
   * Example:
   * ```typescript
   * { callbacks: [(req, res) => res.send("Hello World")] }
   * ```
   */
  callbacks: Array<CallbackRoute>;

  /**
   * The HTTP method this route will handle, such as "GET", "POST", "PUT", "DELETE", etc.
   * Defines the action expected from the route, such as fetching data, sending data,
   * updating, or deleting resources.
   *
   * Example:
   * ```typescript
   * { method: "GET" }
   * ```
   */
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'OPTIONS';

  params?: Record<string, string>;
}
