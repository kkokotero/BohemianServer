/* eslint-disable prefer-destructuring */
/* eslint-disable no-restricted-syntax */
/* eslint-disable class-methods-use-this */
/* eslint-disable no-param-reassign */
/* eslint-disable no-plusplus */
import * as http from 'http';
import * as https from 'https';
import { join } from 'path';
import * as dns from 'dns';
import type {
  DomainStructure,
  SSL,
  SubDomainStructure,
} from '../../interfaces/DomainStructure';
import { DomainThree } from '../nodes/RouterNode';
import { RouterHandler } from './RouterHandler';
import { RequestHandler } from './RequestHandler';
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

  private routeCache: LRUCache<
    string,
    {
      route: RouterStructure;
      uses: CallbacksRoute | undefined;
      staticUrl: string | undefined;
      '404': CallbackRoute | undefined;
      find: boolean;
    }
  >; // Cache for routes to improve performance

  /**
   * Constructor initializes the DomainHandler with optional domain configuration.
   * @param data - Configuration object for the domain (host, routes, SSL, etc.).
   */
  constructor(private data: DomainStructure = {}) {
    // Initialize middleware array if not provided
    data.uses = data.uses || [];

    if (data.https) {
      this.https();
    } else {
      // Set HTTPS to false by default
      data.https = false;
    }

    // Set default host to 'localhost' if not provided
    data.host = data.host || 'localhost';
    if (this.checkDomain(data.host)) {
      let node = this.domains;
      const segments = data.host.split('.').reverse();

      for (const segment of segments) {
        if (!node.children.has(segment)) {
          node.children.set(segment, new DomainThree());
        }
        node = node.children.get(segment)!;
      }
      node.uses = data.uses;
      node.staticUrl = data.staticUrl;
      node['404'] = data['404'];
    }

    // Add routes if provided
    if (data.routes) {
      this.data.routes?.forEach((route: RouterStructure) => {
        this.route(route);
      });
    }

    if (data.domains) {
      data.domains.forEach((domain: SubDomainStructure) => {
        const router = this.domain(domain);
        domain.routes?.forEach((route: RouterStructure) => router.route(route));
      });
    }

    // Initialize LRU cache for routes
    this.routeCache = new LRUCache<
      string,
      {
        route: RouterStructure;
        uses: CallbacksRoute | undefined;
        staticUrl: string | undefined;
        '404': CallbackRoute | undefined;
        find: boolean;
      }
    >(data.cacheSize || 500);
  }

  /**
   * Checks if the domain is valid by performing a DNS lookup.
   * @param host - The domain or subdomain to check.
   * @returns True if the domain is valid, otherwise throws an error.
   */
  private checkDomain(host: string): boolean {
    dns.lookup(host, (err) => {
      if (err) {
        throw new Error(`Domain lookup failed, ${host}`);
      }
    });
    return true;
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

  /**
   * Returns the server instance.
   * @returns The HTTP/HTTPS server instance.
   */
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

      let isFind = false;

      const data = this.handleRequest(request, response);
      if (data) {
        isFind = data?.find;
        if (!isFind) {
          if (data.staticUrl || this.data.staticUrl) {
            const staticDir = data.staticUrl || this.data.staticUrl;
            const url = request.url === '/' ? 'index.html' : request.url;
            const filePath = join(staticDir as string, url);

            try {
              response.file(filePath);
              isFind = true;
            } catch (error) {
              console.error(`Error serving static file: ${filePath}`, error);
              response.status(500).send('Internal Server Error');
            }
          }
        }
      }

      if (!isFind) {
        if (data?.[404]) {
          data[404](request, response, () => {});
        } else if (this.data[404]) {
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
  public domain(domian: SubDomainStructure): RouterHandler {
    if (!this.data.host) {
      throw new Error('Host is not configured.');
    }
    let { host } = domian;
    host = host.includes(this.data.host) ? host : `${host}.${this.data.host}`;
    if (this.checkDomain(host)) {
      let node = this.domains;
      const segments = host.split('.').reverse();

      for (const segment of segments) {
        if (!node.children.has(segment)) {
          node.children.set(segment, new DomainThree());
        }
        node = node.children.get(segment)!;
      }
      node[404] = domian[404];
      node.uses = domian.uses || [];
      node.staticUrl = domian.staticUrl;
      return new RouterHandler(node.routes);
    }
    throw new Error('Cannot create a domain');
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
   * @param method - The HTTP method.
   * @param route - The route configuration.
   */
  private cacheRoute(
    host: string,
    path: string,
    method: string,
    route: {
      route: RouterStructure;
      uses: CallbacksRoute | undefined;
      staticUrl: string | undefined;
      '404': CallbackRoute | undefined;
      find: boolean;
    },
  ) {
    if (!route.find) route.find = true;
    this.routeCache.set(`${host}-${path}-${method}`, route);
  }

  /**
   * Retrieves a cached route.
   * @param host - The host associated with the route.
   * @param path - The route path.
   * @param method - The HTTP method.
   * @returns The cached route or undefined if not found.
   */
  private getCacheRoute(
    host: string,
    path: string,
    method: string,
  ):
    | {
        route: RouterStructure;
        uses: CallbacksRoute | undefined;
        staticUrl: string | undefined;
        '404': CallbackRoute | undefined;
        find: boolean;
      }
    | undefined {
    return this.routeCache.get(`${host}-${path}-${method}`);
  }

  /**
   * Finds a route for the given path and host.
   * @param path - The route path.
   * @param host - The host associated with the route.
   * @param method - The HTTP method.
   * @returns The route configuration or undefined if not found.
   */
  protected find(
    path: string,
    host: string,
    method: string,
  ):
    | {
        route: RouterStructure;
        uses: CallbacksRoute | undefined;
        staticUrl: string | undefined;
        '404': CallbackRoute | undefined;
        find: boolean;
      }
    | undefined {
    const cacheRoute = this.getCacheRoute(host, path, method);
    if (cacheRoute) return cacheRoute;

    const domain = this.findDomain(host);
    let node = domain?.routes;
    if (!node) return undefined;

    let isFind = false;

    const urlArray = path.split('?');
    const querys = urlArray[1];
    const segments = urlArray[0]?.split('/').filter(Boolean);
    const params: Record<string, string> = {};

    if (querys) {
      querys.split('&').forEach((query) => {
        const [key, value] = query.split('=');
        params[key!] = decodeURIComponent(value!);
      });
    }

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

    if (segments && segments.length === 0 && node.methods) {
      isFind = true;
    }

    if (node.methods) {
      const handler = node.methods[method];
      if (!handler) {
        return undefined;
      }
      handler.params = params;
      const data = {
        route: handler,
        uses: domain?.uses,
        staticUrl: domain?.staticUrl,
        '404': domain?.[404],
        find: isFind,
      };
      this.cacheRoute(host, path, method, data);
      return data;
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
  private handleRequest(
    request: RequestHandler,
    response: ResponseHandler,
  ):
    | {
        route: RouterStructure;
        uses: CallbacksRoute | undefined;
        staticUrl: string | undefined;
        '404': CallbackRoute | undefined;
        find: boolean;
      }
    | undefined {
    const { url, host } = request;
    const domain = this.find(url, host, request.method);
    const route = domain?.route;
    if (!route && domain?.find) return domain;
    try {
      if (domain?.find) {
        request.params = route?.params as Record<string, string>;
        this.executeMiddlewares(
          route?.callbacks as CallbacksRoute,
          domain.uses || [],
          request,
          response,
        );
      }
    } catch (error) {
      console.error('Error handling request:', error);
      response.status(500).send({
        error: 'Internal Server Error',
        message: (error as Error).message,
      });
    }
    return domain;
  }

  /**
   * Executes middleware functions for a route.
   * @param callbacks - The middleware functions.
   * @param req - The request object.
   * @param res - The response object.
   */
  private async executeMiddlewares(
    callbacks: CallbacksRoute,
    uses: CallbacksRoute,
    req: RequestHandler,
    res: ResponseHandler,
  ): Promise<void> {
    let index = 0;
    if (uses) {
      callbacks = [...uses, ...callbacks];
    }

    const next = async () => {
      if (index >= callbacks.length) return;
      const middleware = callbacks[index++] as CallbackRoute;

      if (index === callbacks.length) {
        middleware(req, res, next);
      } else {
        await middleware(req, res, next);
      }
    };

    await next();
  }
}

// Example usage:
// const handler = new DomainHandler({ host: 'example.com', routes: [...] });
// handler.listen(3000, () => console.log('Server running on port 3000'));
// handler.use(middlewareFunction);
// handler.get('/path', (req, res) => res.send('Hello World'));
