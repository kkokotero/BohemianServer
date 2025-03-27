/* eslint-disable max-classes-per-file */
import type {
  CallbackRoute,
  CallbacksRoute,
  RouterStructure,
} from '../../interfaces/RouterStructure';

/**
 * Represents a node in a routing tree structure.
 * Each node can have multiple child nodes, forming a hierarchical routing system.
 */
export class RouteNode {
  /**
   * A map of child route nodes, where the key is the route segment and the value is the corresponding `RouteNode`.
   * This structure allows for nested routes, enabling complex routing configurations.
   *
   * Example:
   * ```typescript
   * const node = new RouteNode();
   * node.children.set('users', new RouteNode());
   * ```
   */
  children: Map<string, RouteNode> = new Map();

  /**
   * The route handlers associated with this node.
   * These represent the logic that will be executed when the route is matched.
   * Each key corresponds to an HTTP method (e.g., 'GET', 'POST').
   *
   * Example:
   * ```typescript
   * node.methods = {
   *   GET: { path: '/users', method: 'GET', callbacks: [handlerFunction] },
   *   POST: { path: '/users', method: 'POST', callbacks: [postHandlerFunction] }
   * };
   * ```
   */
  methods?: { [key: string]: RouterStructure } = {};

  /**
   * Stores the name of the parameter if this node represents a dynamic segment (e.g., `:id`).
   * This is used to capture dynamic values from the URL path.
   *
   * Example:
   * ```typescript
   * node.paramName = 'id'; // Matches `/users/:id`
   * ```
   */
  paramName?: string;
}

/**
 * Represents a domain-based hierarchical routing system.
 * This structure allows managing routes under different domains.
 */
export class DomainThree {
  /**
   * A map of child domain trees, where the key is the domain segment and the value is the corresponding `DomainThree`.
   * This structure allows for nested domains, enabling complex domain routing configurations.
   *
   * Example:
   * ```typescript
   * const domain = new DomainThree();
   * domain.children.set('example.com', new DomainThree());
   * ```
   */
  children: Map<string, DomainThree> = new Map();

  /**
   * The root of the routing tree for this domain.
   * It stores the main routes associated with the domain.
   *
   * Example:
   * ```typescript
   * domain.routes.methods = {
   *   GET: { path: '/', method: 'GET', callbacks: [homepageHandler] }
   * };
   * ```
   */
  routes: RouteNode = new RouteNode();

  /**
   * Middleware functions to be executed for every request to this domain.
   * These functions can modify the request or response objects or perform other tasks.
   *
   * Example:
   * ```typescript
   * domain.uses = [middlewareFunction1, middlewareFunction2];
   * ```
   */
  uses: CallbacksRoute = [];

  /**
   * The directory path for serving static files.
   * When set, the domain will serve static files from this directory.
   *
   * Example:
   * ```typescript
   * domain.staticUrl = '/path/to/static/files';
   * ```
   */
  staticUrl?: string;

  /**
   * A custom handler for 404 Not Found responses.
   * This function will be called when no matching route is found.
   *
   * Example:
   * ```typescript
   * domain['404'] = (req, res) => res.send('Custom 404 Page');
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
  connectTo?: 'all' | string[] | undefined;
}
