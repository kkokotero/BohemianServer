/* eslint-disable no-continue */
import http from 'http';
import { parse, ParsedUrlQuery } from 'querystring';

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

  private _bodyPromise: Promise<
    | Record<string, string>
    | ParsedUrlQuery
    | {
        fields: Record<string, string>;
        files: Record<string, { filename: string; content: Buffer }>;
      }
    | string
  >;

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

  public isSecure(): boolean {
    const proto = this.headers['x-forwarded-proto'] as string;
    if (proto?.toLowerCase() === 'https') return true;
    return (
      this.headers.host?.split(':')[1] === RequestHandler.DEFAULT_PORT_HTTPS
    );
  }

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

  get body() {
    return this._bodyPromise;
  }

  private async getBodyContent(): Promise<
    | Record<string, string>
    | ParsedUrlQuery
    | {
        fields: Record<string, string>;
        files: Record<string, { filename: string; content: Buffer }>;
      }
    | string
  > {
    return new Promise((resolve, reject) => {
      const chunks: Buffer[] = [];

      // Registrar listeners primero
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

      // Activar el flujo después de registrar los listeners
      this.request.resume();
    });
  }

  private processBody(buffer: Buffer):
    | Record<string, string>
    | ParsedUrlQuery
    | {
        fields: Record<string, string>;
        files: Record<string, { filename: string; content: Buffer }>;
      }
    | string {
    const contentType = this.headers['content-type'] || '';

    try {
      // JSON
      if (contentType.includes('application/json')) {
        const jsonString = buffer.toString(RequestHandler.TEXT_ENCODING);

        return JSON.parse(jsonString.replace(/'/g, '"'));
      }

      // Form URL-encoded
      if (contentType.includes('application/x-www-form-urlencoded')) {
        return parse(buffer.toString(RequestHandler.TEXT_ENCODING));
      }

      // Multipart
      if (contentType.includes('multipart/form-data')) {
        const boundary = this.getBoundary(contentType);
        if (!boundary) throw new Error('Missing boundary in multipart form');
        return this.parseMultipart(buffer, boundary);
      }

      // Texto plano
      return buffer.toString(RequestHandler.TEXT_ENCODING);
    } catch (error) {
      throw new Error(`Failed to process body: ${(error as Error).message}`);
    }
  }

  // eslint-disable-next-line class-methods-use-this
  private getBoundary(contentType: string): string | undefined {
    const boundaryMatch = contentType.match(/boundary=("?)([^;]+)\1/i);
    return boundaryMatch?.[2];
  }

  private parseMultipart(
    buffer: Buffer,
    boundary: string,
  ): {
    fields: Record<string, string>;
    files: Record<string, { filename: string; content: Buffer }>;
  } {
    const result = {
      fields: {} as Record<string, string>,
      files: {} as Record<string, { filename: string; content: Buffer }>,
    };

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
          result.files[name] = { filename, content };
        } else {
          result.fields[name] = content
            .toString(RequestHandler.TEXT_ENCODING)
            .trim();
        }
      }
    }

    return result;
  }

  // eslint-disable-next-line class-methods-use-this
  private parsePartHeaders(headerSection: string): Record<string, string> {
    return Object.fromEntries(
      headerSection.split('\r\n').map((line) => {
        const [key, ...values] = line.split(':');
        return [key!.trim().toLowerCase(), values.join(':').trim()];
      }),
    );
  }
}
