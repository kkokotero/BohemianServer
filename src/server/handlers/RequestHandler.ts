/* eslint-disable class-methods-use-this */
/* eslint-disable no-continue */
import http from 'http';
import { parse } from 'querystring';

/**
 * A class to handle HTTP requests, providing methods to access request details
 * and parse the request body.
 */
export class RequestHandler {
  public method: string;

  public url: string;

  public headers: http.IncomingHttpHeaders;

  public status: number;

  public statusMessage: string;

  public location: string;

  public host: string;

  public params: { [key: string]: string } = {};

  private static readonly DEFAULT_PORT_HTTPS = '443';

  private static readonly TEXT_ENCODING = 'utf8';

  private static readonly LATIN1_ENCODING = 'latin1';

  private _bodyPromise: Promise<Record<string, string | ArrayBuffer>>;

  /**
   * Constructs a new RequestHandler instance.
   * @param request - The incoming HTTP request object.
   */
  constructor(private request: http.IncomingMessage) {
    this.method = request.method || 'GET';
    this.url = request.url || '/';
    this.headers = request.headers;
    this.status = request.statusCode || 200;
    this.statusMessage = request.statusMessage || '';
    this.location = request.headers.location || '';
    this.host = request.headers.host?.split(':')[0] ?? 'localhost';

    this._bodyPromise = this.getBodyContent();
  }

  /**
   * Checks if the request is secure (HTTPS).
   * @returns True if the request is secure, otherwise false.
   */
  public isSecure(): boolean {
    const proto = this.headers['x-forwarded-proto'] as string;
    if (proto?.toLowerCase() === 'https') return true;
    return (
      this.headers.host?.split(':')[1] === RequestHandler.DEFAULT_PORT_HTTPS
    );
  }

  /**
   * Parses cookies from the request headers.
   * @returns An object containing the cookies.
   */
  public cookies(): Record<string, string> {
    return (
      this.headers.cookie?.split(';').reduce(
        (acc, cookie) => {
          const [key, value] = cookie.trim().split('=');
          if (key && value) acc[key] = decodeURIComponent(value);
          return acc;
        },
        {} as Record<string, string>,
      ) || {}
    );
  }

  /**
   * Returns a promise that resolves to the parsed request body.
   * @returns A promise that resolves to the parsed body content.
   */
  get body(): Promise<Record<string, string | ArrayBuffer>> {
    return this._bodyPromise as Promise<Record<string, string | ArrayBuffer>>;
  }

  /**
   * Reads and processes the request body content.
   * @returns A promise that resolves to the parsed body content.
   */
  private async getBodyContent(): Promise<
    Record<string, string | ArrayBuffer>
  > {
    return new Promise((resolve, reject) => {
      const chunks: Buffer[] = [];

      // Register listeners first
      this.request.on('data', (chunk) => {
        chunks.push(chunk);
      });

      this.request.on('end', () => {
        try {
          if (chunks.length === 0) {
            resolve({});
            return;
          }

          const buffer = Buffer.concat(chunks);
          const result = this.processBody(buffer);
          resolve(result);
        } catch (err) {
          reject(new Error(`Error processing body: ${(err as Error).message}`));
        }
      });

      this.request.on('error', (err) => {
        reject(err);
      });

      // Activate the flow after registering the listeners
      this.request.resume();
    });
  }

  /**
   * Processes the request body based on the content type.
   * @param buffer - The buffer containing the request body.
   * @returns The parsed body content.
   */
  private processBody(buffer: Buffer): Record<string, string | ArrayBuffer> {
    const contentType = this.headers['content-type'] || '';

    try {
      // JSON
      if (contentType.includes('application/json')) {
        const jsonString = buffer.toString(RequestHandler.TEXT_ENCODING);
        return JSON.parse(jsonString.replace(/'/g, '"'));
      }

      // Form URL-encoded
      if (contentType.includes('application/x-www-form-urlencoded')) {
        const parsedData = parse(buffer.toString(RequestHandler.TEXT_ENCODING));
        const dictionary: Record<string, string> = Object.fromEntries(
          Object.entries(parsedData).map(([key, value]) => [
            key,
            String(value),
          ]),
        );
        return dictionary;
      }

      // Multipart
      if (contentType.includes('multipart/form-data')) {
        const boundary = this.getBoundary(contentType);
        if (!boundary) throw new Error('Missing boundary in multipart form');
        return this.parseMultipart(buffer, boundary);
      }

      // Plain text
      return { data: buffer.toString(RequestHandler.TEXT_ENCODING) };
    } catch (error) {
      throw new Error(`Failed to process body: ${(error as Error).message}`);
    }
  }

  /**
   * Extracts the boundary string from the content type header.
   * @param contentType - The content type header value.
   * @returns The boundary string or undefined if not found.
   */
  private getBoundary(contentType: string): string | undefined {
    const boundaryMatch = contentType.match(/boundary=("?)([^;]+)\1/i);
    return boundaryMatch?.[2];
  }

  /**
   * Parses a multipart form-data request body.
   * @param buffer - The buffer containing the request body.
   * @param boundary - The boundary string used to separate parts.
   * @returns An object containing the parsed fields and files.
   */
  private parseMultipart(
    buffer: Buffer,
    boundary: string,
  ): Record<string, string | ArrayBuffer> {
    const result: Record<string, string | ArrayBuffer> = {};

    const bodyStr = buffer.toString(RequestHandler.LATIN1_ENCODING);
    const parts = bodyStr.split(`--${boundary}`);

    // eslint-disable-next-line no-restricted-syntax
    for (const part of parts) {
      if (!part.trim() || part.includes('--')) continue;

      const [headerSection, ...bodySections] = part.split('\r\n\r\n');
      if (!headerSection) continue;

      const headers = this.parsePartHeaders(headerSection);
      const disposition = headers['content-disposition'];
      if (!disposition) continue;

      const name = disposition.match(/name="([^"]+)"/)?.[1];
      const filename = disposition.match(/filename="([^"]+)"/)?.[1];
      const content = Buffer.from(
        bodySections.join('\r\n\r\n'),
        RequestHandler.LATIN1_ENCODING,
      );

      if (name) {
        if (filename) {
          result[name] = content.buffer;
        } else {
          result[name] = content.toString(RequestHandler.TEXT_ENCODING).trim();
        }
      }
    }

    return result;
  }

  /**
   * Parses the headers of a multipart form-data part.
   * @param headerSection - The header section of a part.
   * @returns An object containing the parsed headers.
   */
  private parsePartHeaders(headerSection: string): Record<string, string> {
    return Object.fromEntries(
      headerSection.split('\r\n').map((line) => {
        const [key, ...values] = line.split(':');
        return [key!.trim().toLowerCase(), values.join(':').trim()];
      }),
    );
  }
}

// Example usage:
// const handler = new RequestHandler(req);
// handler.isSecure(); // Check if the request is secure
// handler.cookies(); // Get cookies from the request
// handler.body.then(body => console.log(body)); // Get and process the request body
