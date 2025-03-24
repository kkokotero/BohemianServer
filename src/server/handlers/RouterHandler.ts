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
  constructor(private routes: RouteNode) {}

  public route(route: RouterStructure) {
    this.add(route);
    return this;
  }

  public async get(path: string, ...callbacks: CallbacksRoute): Promise<this> {
    this.create('GET', path, ...callbacks);
    return this;
  }

  public async post(path: string, ...callbacks: CallbacksRoute): Promise<this> {
    this.create('POST', path, ...callbacks);
    return this;
  }

  public async put(path: string, ...callbacks: CallbacksRoute): Promise<this> {
    this.create('PUT', path, ...callbacks);
    return this;
  }

  public async delete(
    path: string,
    ...callbacks: CallbacksRoute
  ): Promise<this> {
    this.create('DELETE', path, ...callbacks);
    return this;
  }

  public async patch(
    path: string,
    ...callbacks: CallbacksRoute
  ): Promise<this> {
    this.create('PATCH', path, ...callbacks);
    return this;
  }

  public async options(
    path: string,
    ...callbacks: CallbacksRoute
  ): Promise<this> {
    this.create('OPTIONS', path, ...callbacks);
    return this;
  }

  private add(route: RouterStructure) {
    let node: RouteNode = this.routes;
    const segments = route.path.split('/').filter(Boolean);

    // eslint-disable-next-line no-restricted-syntax
    for (const segment of segments) {
      const isParam = segment.startsWith(':');
      const key = isParam ? '*' : segment;

      if (!node.children.has(key)) {
        node.children.set(key, new RouteNode());
      }

      node = node.children.get(key)!;
      if (isParam) {
        node.paramName = segment.slice(1); // Guardar el nombre del parámetro
      }
    }

    node.handler = route;
  }

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

  // eslint-disable-next-line class-methods-use-this
  private normalizePath(path: string): string {
    const cleanedPath = path.replace(/\/+/g, '/').replace(/\/$/, '');
    return cleanedPath.startsWith('/') ? cleanedPath : `/${cleanedPath}`;
  }
}
