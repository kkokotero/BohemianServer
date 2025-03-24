import * as http from 'http';
import * as https from 'https';
import { join } from 'path';
import type {
  DomainStructure,
  SSL,
  sudDomain,
} from '../../interfaces/DomainStructure';
import { DomainThree } from '../nodes/RouterNode';
import { RouterHandler } from './RouterHandler';
import { RequestHandler } from './RequestHandler';
// eslint-disable-next-line import/no-cycle
import { ResponseHandler } from './ResponseHandler';
import { LRUCache } from '../utils/LRUCache';
import type {
  CallbackRoute,
  CallbacksRoute,
  RouterStructure,
} from '../../interfaces/RouterStructure';

/**
 * DomainHandler is a class that manages domains, routes, and HTTP/HTTPS servers.
 * It provides methods to configure domains, routes, middleware, and static file serving.
 */
export class DomainHandler {
  private domains: DomainThree = new DomainThree(); // Trie structure to manage domains and subdomains

  private routeCache: LRUCache<string, RouterStructure>; // Cache for routes to improve performance

  /**
   * Constructor initializes the DomainHandler with optional domain configuration.
   * @param data - Configuration object for the domain (host, routes, SSL, etc.).
   */
  constructor(private data: DomainStructure = {}) {
    // Set default host to 'localhost' if not provided
    // eslint-disable-next-line no-param-reassign
    data.host = data.host || 'localhost';
    this.domain(data.host);

    // Initialize middleware array if not provided
    // eslint-disable-next-line no-param-reassign
    data.uses = data.uses || [];

    if (data.https) {
      this.https();
    } else {
      // Set HTTPS to false by default
      // eslint-disable-next-line no-param-reassign
      data.https = false;
    }

    // Add routes if provided
    if (data.routes) {
      this.data.routes?.forEach((route: RouterStructure) => {
        this.route(route);
      });
    }

    if (data.domains) {
      data.domains.forEach((domain: sudDomain) => {
        const router = this.domain(domain.host);
        domain.routes?.forEach((route: RouterStructure) => router.route(route));
      });
    }

    // Initialize LRU cache for routes
    this.routeCache = new LRUCache<string, RouterStructure>(
      data.cacheSize || 500,
    );
  }

  /**
   * Starts the server and listens on the specified port.
   * @param port - The port number or string to listen on.
   * @param callbacks - Optional callbacks to execute after the server starts.
   * @returns The HTTP/HTTPS server instance.
   */
  public listen(port: number | string, ...callbacks: (() => void)[]) {
    const server = this.start();
    server.listen(Number(port), '0.0.0.0', ...callbacks);
    return server;
  }

  get value() {
    return this.start();
  }

  /**
   * Adds middleware functions to the domain.
   * @param callbacks - Middleware functions to be executed for every request.
   */
  public use(...callbacks: CallbackRoute[]) {
    this.data.uses?.push(...callbacks);
  }

  /**
   * Sets a custom 404 Not Found handler.
   * @param Callback - The function to handle 404 responses.
   */
  public notFound(Callback: CallbackRoute) {
    this.data[404] = Callback;
  }

  /**
   * Starts the HTTP/HTTPS server based on the configuration.
   * @returns The HTTP/HTTPS server instance.
   */
  private start() {
    const server = async (
      req: http.IncomingMessage,
      res: http.ServerResponse,
    ) => {
      const request = new RequestHandler(req);
      const response = new ResponseHandler(res);

      let isFind = this.handleRequest(request, response);

      if (!isFind && this.data?.staticUrl) {
        const url = request.url === '/' ? 'index.html' : request.url;
        const filePath = join(this.data.staticUrl, url);

        try {
          response.file(filePath);
          isFind = true;
        } catch (error) {
          console.error(`Error serving static file: ${filePath}`, error);
          response.status(500).send('Internal Server Error');
        }
      }

      if (!isFind) {
        if (this.data[404]) {
          this.data[404](request, response, () => {});
        } else {
          response.status(404).send('Not Found');
        }
      }
    };

    return this.data?.https
      ? https.createServer(this.data.ssl!, server)
      : http.createServer(server);
  }

  /**
   * Configures a domain or subdomain.
   * @param host - The domain or subdomain to configure.
   * @returns A RouterHandler instance for the specified domain.
   */
  public domain(host: string): RouterHandler {
    if (!this.data.host) {
      throw new Error('Host is not configured.');
    }

    // eslint-disable-next-line no-param-reassign
    host = host.includes(this.data.host) ? host : `${host}.${this.data.host}`;
    let node = this.domains;
    const segments = host.split('.').reverse();

    // eslint-disable-next-line no-restricted-syntax
    for (const segment of segments) {
      if (!node.children.has(segment)) {
        node.children.set(segment, new DomainThree());
      }
      node = node.children.get(segment)!;
    }
    return new RouterHandler(node.routes);
  }

  /**
   * Retrieves the router for the current domain.
   * @returns A RouterHandler instance.
   */
  protected getRouter() {
    const node: DomainThree = this.findDomain(
      this.data.host as string,
    ) as DomainThree;
    return new RouterHandler(node.routes);
  }

  /**
   * Adds a route to the domain.
   * @param data - The route configuration.
   * @returns The DomainHandler instance for chaining.
   */
  public async route(data: RouterStructure): Promise<this> {
    this.getRouter().route(data);
    return this;
  }

  /**
   * Adds a GET route to the domain.
   * @param path - The route path.
   * @param callbacks - Middleware functions for the route.
   * @returns The DomainHandler instance for chaining.
   */
  public async get(path: string, ...callbacks: CallbacksRoute): Promise<this> {
    this.getRouter().get(path, ...callbacks);
    return this;
  }

  /**
   * Adds a POST route to the domain.
   * @param path - The route path.
   * @param callbacks - Middleware functions for the route.
   * @returns The DomainHandler instance for chaining.
   */
  public async post(path: string, ...callbacks: CallbacksRoute): Promise<this> {
    this.getRouter().post(path, ...callbacks);
    return this;
  }

  /**
   * Adds a PUT route to the domain.
   * @param path - The route path.
   * @param callbacks - Middleware functions for the route.
   * @returns The DomainHandler instance for chaining.
   */
  public async put(path: string, ...callbacks: CallbacksRoute): Promise<this> {
    this.getRouter().put(path, ...callbacks);
    return this;
  }

  /**
   * Adds a DELETE route to the domain.
   * @param path - The route path.
   * @param callbacks - Middleware functions for the route.
   * @returns The DomainHandler instance for chaining.
   */
  public async delete(
    path: string,
    ...callbacks: CallbacksRoute
  ): Promise<this> {
    this.getRouter().delete(path, ...callbacks);
    return this;
  }

  /**
   * Adds an OPTIONS route to the domain.
   * @param path - The route path.
   * @param callbacks - Middleware functions for the route.
   * @returns The DomainHandler instance for chaining.
   */
  public async options(
    path: string,
    ...callbacks: CallbacksRoute
  ): Promise<this> {
    this.getRouter().options(path, ...callbacks);
    return this;
  }

  /**
   * Adds a PATCH route to the domain.
   * @param path - The route path.
   * @param callbacks - Middleware functions for the route.
   * @returns The DomainHandler instance for chaining.
   */
  public async patch(
    path: string,
    ...callbacks: CallbacksRoute
  ): Promise<this> {
    this.getRouter().patch(path, ...callbacks);
    return this;
  }

  /**
   * Enables HTTPS for the domain.
   * @returns The DomainHandler instance for chaining.
   * @throws Error if SSL configuration is not set.
   */
  public https(): this {
    if (!this.data?.ssl) {
      throw new Error('SSL configuration must be set before enabling HTTPS.');
    }
    this.data.https = true;
    return this;
  }

  /**
   * Configures SSL for the domain.
   * @param ssl - The SSL configuration object.
   * @returns The DomainHandler instance for chaining.
   * @throws Error if 'key' or 'cert' is missing.
   */
  public ssl(ssl: SSL): this {
    if (!ssl.key || !ssl.cert) {
      throw new Error("SSL configuration must include 'key' and 'cert'.");
    }
    this.data.ssl = ssl;
    this.data.https = true;
    return this;
  }

  /**
   * Configures or retrieves the static file directory.
   * @param path - The path to the static directory.
   * @returns The static directory path.
   * @throws Error if the static directory is not set.
   */
  public static(path?: string): string {
    if (path) {
      this.data.staticUrl = path;
      return path;
    }
    if (this.data.staticUrl !== undefined) {
      return this.data.staticUrl;
    }
    throw new Error('Static directory not set.');
  }

  /**
   * Caches a route for faster lookup.
   * @param host - The host associated with the route.
   * @param path - The route path.
   * @param route - The route configuration.
   */
  private cacheRoute(
    host: string,
    path: string,
    method: string,
    route: RouterStructure,
  ) {
    this.routeCache.set(`${host}-${path}-${method}`, route);
  }

  /**
   * Retrieves a cached route.
   * @param host - The host associated with the route.
   * @param path - The route path.
   * @returns The cached route or undefined if not found.
   */
  private getCacheRoute(
    host: string,
    path: string,
    method: string,
  ): RouterStructure | undefined {
    return this.routeCache.get(`${host}-${path}-${method}`);
  }

  /**
   * Finds a route for the given path and host.
   * @param path - The route path.
   * @param host - The host associated with the route.
   * @returns The route configuration or undefined if not found.
   */
  protected find(
    path: string,
    host: string,
    method: string,
  ): RouterStructure | undefined {
    const cacheRoute = this.getCacheRoute(host, path, method);
    if (cacheRoute) return cacheRoute;

    let node = this.findDomain(host)?.routes;
    if (!node) return undefined;

    const urlArray = path.split('?');
    const querys = urlArray[1];
    const segments = urlArray[0]?.split('/').filter(Boolean);
    const params: Record<string, string> = {};

    if (querys) {
      querys!.split('&').forEach((query) => {
        const [key, value] = query.split('=');
        params[key!] = decodeURIComponent(value!);
      });
    }
    // eslint-disable-next-line no-restricted-syntax
    for (const segment of segments as string[]) {
      if (node.children.has(segment)) {
        node = node.children.get(segment)!;
      } else if (node.children.has('*')) {
        node = node.children.get('*')!;
        params[node.paramName!] = segment;
      } else {
        return undefined;
      }

      if (node.paramName) {
        params[node.paramName] = segment;
      }
    }

    if (node.methods) {
      const handler = node.methods[method];
      (handler as RouterStructure).params = params;
      this.cacheRoute(host, path, method, handler as RouterStructure);
      return handler;
    }

    return undefined;
  }

  /**
   * Finds the domain node in the trie.
   * @param host - The host to find.
   * @returns The domain node or undefined if not found.
   */
  protected findDomain(host: string) {
    let node = this.domains;
    // eslint-disable-next-line no-restricted-syntax
    for (const segment of host.split('.').reverse()) {
      if (node.children.has(segment)) {
        node = node.children.get(segment)!;
      } else if (node.children.has('*')) {
        node = node.children.get('*')!;
      } else {
        return undefined;
      }
    }
    return node;
  }

  /**
   * Handles an incoming request by finding and executing the appropriate route.
   * @param request - The request object.
   * @param response - The response object.
   * @returns True if the route is found, otherwise undefined.
   */
  private handleRequest(request: RequestHandler, response: ResponseHandler) {
    try {
      const { url, host } = request;
      const route = this.find(url, host, request.method);
      if (!route) return false;

      request.params = route.params as Record<string, string>;
      this.executeMiddlewares(
        route.callbacks as CallbacksRoute,
        request,
        response,
      );
      return true;
    } catch (error) {
      console.error('Error handling request:', error);
      response.status(500).send({
        error: 'Internal Server Error',
        message: (error as Error).message,
      });
      return false;
    }
  }

  /**
   * Executes middleware functions for a route.
   * @param callbacks - The middleware functions.
   * @param req - The request object.
   * @param res - The response object.
   */
  private async executeMiddlewares(
    callbacks: CallbacksRoute,
    req: RequestHandler,
    res: ResponseHandler,
  ): Promise<void> {
    let index = 0;
    if (this.data?.uses) {
      // eslint-disable-next-line no-param-reassign
      callbacks = [...this.data.uses, ...callbacks];
    }

    const next = async () => {
      if (index >= callbacks.length) return;
      // eslint-disable-next-line no-plusplus
      const middleware = callbacks[index++] as CallbackRoute;

      if (index === callbacks.length) {
        // Last middleware, no await
        middleware(req, res, next);
      } else {
        await middleware(req, res, next);
      }
    };

    await next();
  }
}
