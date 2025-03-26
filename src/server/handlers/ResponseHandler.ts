import { extname } from 'path';
import http from 'http';
import { pipeline } from 'stream/promises';
import { createReadStream, promises as fs } from 'fs';
import { promisify } from 'util';
import { gzip, deflate } from 'zlib';
import '../../globals';

/**
 * Configuration options for the ResponseHandler class.
 */
export interface ResponseHandlerConfig {
  allowedMethods?: string;
  allowedHeaders?: string;
}

/**
 * A utility class for handling HTTP responses in a structured and efficient way.
 * It provides methods for sending data, handling file responses, enabling CORS,
 * setting headers, managing cookies, and compressing responses.
 */
export class ResponseHandler {
  /** Common content types for response headers */
  private static readonly CONTENT_TYPES: Record<string, string> = {
    html: 'text/html; charset=utf-8',
    json: 'application/json; charset=utf-8',
    text: 'text/plain; charset=utf-8',
    octet: 'application/octet-stream',
  };

  /** Mapping of common file extensions to their MIME types */
  private static readonly FILES_TYPES: Record<string, string> = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'application/javascript',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
  };

  /** Security-related HTTP headers to prevent common web vulnerabilities */
  private static readonly SECURITY_HEADERS = {
    'X-Content-Type-Options': 'nosniff', // Prevent MIME-type sniffing
    'X-Frame-Options': 'SAMEORIGIN', // Prevent clickjacking attacks
    'X-XSS-Protection': '0', // Disable outdated XSS protection
    'Referrer-Policy': 'strict-origin-when-cross-origin', // Secure referrer policy
    'Strict-Transport-Security': 'max-age=63072000; includeSubDomains; preload', // Enforce HTTPS
    'Permissions-Policy':
      'geolocation=(), microphone=(), camera=(), usb=(), fullscreen=()', // Restrict browser features
    'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
    Connection: 'keep-alive',
    Pragma: 'no-cache',
    Expires: '0',
  };

  /** Default allowed HTTP methods */
  private static readonly DEFAULT_METHODS = 'GET,POST,PUT,DELETE,PATCH,OPTIONS';

  /** Default allowed HTTP headers */
  private static readonly DEFAULT_HEADERS =
    'Content-Type, Authorization, Host, Origin';

  /**
   * Creates an instance of ResponseHandler.
   * @param request - The HTTP request object.
   * @param response - The HTTP response object.
   * @param config - Optional configuration for allowed methods and headers.
   */
  constructor(
    private readonly request: http.IncomingMessage,
    private readonly response: http.ServerResponse,
    private readonly doamins: string[],
    private config: ResponseHandlerConfig = {},
  ) {
    this.config = {
      allowedMethods: ResponseHandler.DEFAULT_METHODS,
      allowedHeaders: ResponseHandler.DEFAULT_HEADERS,
      ...config,
    };

    // Initialize global compression utilities
    global.gzipAsync = global.gzipAsync || promisify(gzip);
    global.deflateAsync = global.deflateAsync || promisify(deflate);
  }

  public async write(data: unknown) {
    this.response.write(data);
  }

  /**
   * Sends a response with the provided data.
   * @param data - The content to be sent.
   * @param contentTypeOverride - Optional override for the response content type.
   * @returns The ResponseHandler instance.
   */
  public async send(
    data: unknown,
    contentTypeOverride?: string,
  ): Promise<this> {
    if (this.response.headersSent) {
      return this;
    }

    // Set security headers
    Object.entries(ResponseHandler.SECURITY_HEADERS).forEach(([key, value]) => {
      this.header(key, value);
    });

    // Determine the content type
    const contentType = contentTypeOverride || this.detectContentType(data);
    this.header('Content-Type', contentType);

    // Serialize data and send response
    const payload = this.serializeData(data, contentType);
    this.response.end(payload);
    return this;
  }

  public end() {
    Object.entries(ResponseHandler.SECURITY_HEADERS).forEach(([key, value]) => {
      this.header(key, value);
    });

    this.response.end();
    return this;
  }

  /**
   * Reads and sends a file response.
   * @param filePath - The path to the file.
   * @returns The ResponseHandler instance.
   */
  public async file(filePath: string): Promise<this | boolean> {
    try {
      const data = await fs.readFile(filePath);
      await this.send(data, ResponseHandler.type(filePath));
    } catch (err) {
      return false;
    }
    return this;
  }

  /**
   * Compresses and sends data using gzip or deflate.
   * @param data - The content to be compressed.
   * @param encoding - Compression algorithm: "gzip" or "deflate".
   * @returns The ResponseHandler instance.
   */
  public async compress(
    data: string | Buffer,
    encoding: 'gzip' | 'deflate',
  ): Promise<this> {
    try {
      const compressed =
        encoding === 'gzip'
          ? await global.gzipAsync(data)
          : await global.deflateAsync(data);
      this.header('Content-Encoding', encoding)
        .header('Vary', 'Accept-Encoding')
        .send(compressed);
    } catch (error) {
      this.handleError(error as Error);
    }
    return this;
  }

  /**
   * Initiates a file download response.
   * @param filePath - The path to the file.
   * @param fileName - The name of the file to be downloaded.
   * @returns The ResponseHandler instance.
   */
  public async download(filePath: string, fileName: string): Promise<this> {
    try {
      this.header('Content-Disposition', `attachment; filename="${fileName}"`);
      await pipeline(createReadStream(filePath), this.response);
    } catch (error) {
      this.handleError(error as Error);
    }
    return this;
  }

  /**
   * Redirects the client to a specified URL.
   * @param url - The target URL.
   * @param status - The HTTP status code for redirection (default: 302).
   * @returns The ResponseHandler instance.
   */
  public redirect(url: string, status: 301 | 302 | 307 = 302) {
    return this.status(status)
      .header('Location', url)
      .send(`Redirecting to ${url}`);
  }

  /**
   * Enables Cross-Origin Resource Sharing (CORS) y establece una política de seguridad de contenido (CSP)
   * de manera dinámica, usando el origen de la petición cuando es posible.
   * @returns The ResponseHandler instance.
   */
  public enableCors(extraDomains: string[] = []): this {
    const requestOrigin = this.request.headers.origin;

    if (!requestOrigin) {
      return this.header('Access-Control-Allow-Origin', 'http://localhost')
        .header('Access-Control-Allow-Methods', this.config.allowedMethods!)
        .header('Access-Control-Allow-Headers', this.config.allowedHeaders!)
        .header('Access-Control-Allow-Credentials', 'true');
    }

    try {
      const url = new URL(requestOrigin);
      const domainWithPort = `${url.hostname}${url.port ? `:${url.port}` : ''}`;
      const fullDomain = `${url.protocol}//${domainWithPort}`;

      // Combinar los dominios internos con los adicionales
      const allowedDomains = [...this.doamins, ...extraDomains];

      // Verifica si el dominio está en la lista permitida
      const isAllowed = allowedDomains.some((allowedDomain) => {
        // Si el dominio en la lista es un dominio simple (sin http, https)
        if (!allowedDomain.includes('://')) {
          return (
            domainWithPort === allowedDomain || url.hostname === allowedDomain
          );
        }
        // Si la lista tiene un dominio con protocolo, compara toda la URL
        return fullDomain === allowedDomain;
      });

      if (isAllowed) {
        return this.header('Access-Control-Allow-Origin', requestOrigin)
          .header('Access-Control-Allow-Methods', this.config.allowedMethods!)
          .header('Access-Control-Allow-Headers', this.config.allowedHeaders!)
          .header('Access-Control-Allow-Credentials', 'true');
      }
    } catch (error) {
      console.error('Error parsing request origin:', error);
    }

    // Si el dominio no está en la lista permitida, usar un valor por defecto
    return this.header('Access-Control-Allow-Origin', 'http://localhost')
      .header('Access-Control-Allow-Methods', this.config.allowedMethods!)
      .header('Access-Control-Allow-Headers', this.config.allowedHeaders!)
      .header('Access-Control-Allow-Credentials', 'true');
  }

  public enablePublicCors(): this {
    return this.header('Access-Control-Allow-Origin', '*')
      .header('Access-Control-Allow-Methods', this.config.allowedMethods!)
      .header('Access-Control-Allow-Headers', this.config.allowedHeaders!)
      .header('Access-Control-Allow-Credentials', 'false'); // No es necesario en una API totalmente pública
  }

  /**
   * Sets a response header.
   * @param name - The header name.
   * @param value - The header value.
   * @returns The ResponseHandler instance.
   */
  public header(name: string, value: string): this {
    if (!this.response.headersSent) {
      this.response.setHeader(name, value);
    }
    return this;
  }

  /**
   * Sets the HTTP status code and optional status message.
   * @param code - The HTTP status code.
   * @param message - Optional status message.
   * @returns The ResponseHandler instance.
   */
  public status(code: number, message?: string): this {
    if (!this.response.headersSent) {
      this.response.statusCode = code;
      if (message) this.response.statusMessage = message;
    }
    return this;
  }

  /**
   * Determines the MIME type for a file based on its extension.
   * @param filePath - The file path.
   * @returns The MIME type.
   */
  public static type(filePath: string): string {
    return (
      ResponseHandler.FILES_TYPES[extname(filePath)] ||
      'application/octet-stream'
    );
  }

  // eslint-disable-next-line class-methods-use-this
  private detectContentType(data: unknown): string {
    // eslint-disable-next-line no-nested-ternary
    return Buffer.isBuffer(data)
      ? (ResponseHandler.CONTENT_TYPES.octet as string)
      : typeof data === 'string'
        ? (ResponseHandler.CONTENT_TYPES.text as string)
        : (ResponseHandler.CONTENT_TYPES.json as string);
  }

  // eslint-disable-next-line class-methods-use-this
  private serializeData(data: unknown, contentType: string): string | Buffer {
    // eslint-disable-next-line no-nested-ternary
    return Buffer.isBuffer(data)
      ? data
      : contentType.includes('json')
        ? JSON.stringify(data)
        : String(data);
  }

  private handleError(error: Error, status: number = 500): void {
    this.status(status)
      .header('Content-Type', 'text/plain')
      .send(error.message);
  }
}
