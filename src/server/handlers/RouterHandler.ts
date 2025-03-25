/* eslint-disable no-restricted-syntax */
/* eslint-disable class-methods-use-this */
import {
  CallbacksRoute,
  RouterStructure,
} from '../../interfaces/RouterStructure';
import { RouteNode } from '../nodes/RouterNode';

/**
 * RouterHandler class
 *
 * This class manages routing operations in a structured way.
 * It provides methods to define routes for different HTTP methods
 * and dynamically add them to a tree-based structure.
 */
export class RouterHandler {
  /**
   * Constructs a new RouterHandler instance.
   * @param routes - The root node of the route tree structure.
   */
  constructor(private routes: RouteNode) {}

  /**
   * Adds a route to the router.
   * @param route - The route configuration to add.
   * @returns The RouterHandler instance for chaining.
   */
  public route(route: RouterStructure) {
    this.add(route);
    return this;
  }

  /**
   * Defines a GET route.
   * @param path - The route path.
   * @param callbacks - Middleware functions for the route.
   * @returns The RouterHandler instance for chaining.
   */
  public async get(path: string, ...callbacks: CallbacksRoute): Promise<this> {
    this.create('GET', path, ...callbacks);
    return this;
  }

  /**
   * Defines a POST route.
   * @param path - The route path.
   * @param callbacks - Middleware functions for the route.
   * @returns The RouterHandler instance for chaining.
   */
  public async post(path: string, ...callbacks: CallbacksRoute): Promise<this> {
    this.create('POST', path, ...callbacks);
    return this;
  }

  /**
   * Defines a PUT route.
   * @param path - The route path.
   * @param callbacks - Middleware functions for the route.
   * @returns The RouterHandler instance for chaining.
   */
  public async put(path: string, ...callbacks: CallbacksRoute): Promise<this> {
    this.create('PUT', path, ...callbacks);
    return this;
  }

  /**
   * Defines a DELETE route.
   * @param path - The route path.
   * @param callbacks - Middleware functions for the route.
   * @returns The RouterHandler instance for chaining.
   */
  public async delete(
    path: string,
    ...callbacks: CallbacksRoute
  ): Promise<this> {
    this.create('DELETE', path, ...callbacks);
    return this;
  }

  /**
   * Defines a PATCH route.
   * @param path - The route path.
   * @param callbacks - Middleware functions for the route.
   * @returns The RouterHandler instance for chaining.
   */
  public async patch(
    path: string,
    ...callbacks: CallbacksRoute
  ): Promise<this> {
    this.create('PATCH', path, ...callbacks);
    return this;
  }

  /**
   * Defines an OPTIONS route.
   * @param path - The route path.
   * @param callbacks - Middleware functions for the route.
   * @returns The RouterHandler instance for chaining.
   */
  public async options(
    path: string,
    ...callbacks: CallbacksRoute
  ): Promise<this> {
    this.create('OPTIONS', path, ...callbacks);
    return this;
  }

  /**
   * Adds a route to the tree structure.
   * @param route - The route configuration to add.
   */
  private add(route: RouterStructure) {
    let node: RouteNode = this.routes;
    const segments = route.path.split('/').filter(Boolean);

    for (const segment of segments) {
      const isParam = segment.startsWith(':');
      const key = isParam ? '*' : segment;

      if (!node.children.has(key)) {
        node.children.set(key, new RouteNode());
      }

      node = node.children.get(key)!;
      if (isParam) {
        node.paramName = segment.slice(1); // Save the parameter name
      }
    }

    node.methods![route.method] = route;
  }

  /**
   * Creates a route with the specified method and path.
   * @param method - The HTTP method for the route.
   * @param path - The route path.
   * @param callbacks - Middleware functions for the route.
   */
  private create(
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'OPTIONS',
    path: string,
    ...callbacks: CallbacksRoute
  ) {
    const normalizedPath = this.normalizePath(path);
    const routeData: RouterStructure = {
      method,
      path: normalizedPath,
      callbacks,
    };
    this.add(routeData);
  }

  /**
   * Normalizes the route path.
   * Ensures the path starts with a '/' and removes any trailing slashes.
   * @param path - The route path to normalize.
   * @returns The normalized path.
   */
  private normalizePath(path: string): string {
    const cleanedPath = path.replace(/\/+/g, '/').replace(/\/$/, '');
    return cleanedPath.startsWith('/') ? cleanedPath : `/${cleanedPath}`;
  }
}

// Example usage:
// const router = new RouterHandler(new RouteNode());
// router.get('/example', (req, res) => res.send('Hello, world!'));
// router.post('/submit', (req, res) => res.send('Data received'));
