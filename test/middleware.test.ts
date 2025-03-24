import http from 'http';
// eslint-disable-next-line import/no-named-as-default
import server from '../src/core';
import { Request, Response, Next } from '../src/types';

describe('Bohemian Server - Middleware Test (middleware.test.ts)', () => {
  let instance: http.Server;
  let baseUrl: string;

  beforeAll(async () => {
    const app = server();

    // Middleware that adds a custom header
    const customMiddleware = (req: Request, res: Response, next: Next) => {
      res.header('X-Custom-Header', 'TestHeader');
      next();
    };

    // Define a GET route using the middleware
    app.get('/middleware', customMiddleware, (req: Request, res: Response) => {
      res.status(200).send('Middleware Test');
    });

    instance = app.value;

    // Start the server on a dynamic port
    await new Promise<void>((resolve) => {
      instance.listen(0, () => {
        const address = instance.address();
        if (typeof address === 'object' && address?.port) {
          baseUrl = `http://localhost:${address.port}`;
        }
        resolve();
      });
    });
  });

  afterAll(() => {
    instance.close();
  });

  it('should have the custom header set by middleware on GET /middleware', async () => {
    const response = await fetch(`${baseUrl}/middleware`);
    const text = await response.text();

    expect(response.status).toBe(200);
    expect(response.headers.get('X-Custom-Header')).toBe('TestHeader');
    expect(text).toBe('Middleware Test');
  });
});
