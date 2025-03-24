import http from 'http';
import { cors } from '../src/utils';
// eslint-disable-next-line import/no-named-as-default
import server from '../src/core';
import { Request, Response } from '../src/types';

describe('Bohemian Server - CORS Middleware Test (cors.test.ts)', () => {
  let instance: http.Server;
  let baseUrl: string;

  beforeAll(async () => {
    const app = server();

    // Apply the CORS middleware globally
    app.use(cors);

    app.get('/cors', (req: Request, res: Response) => {
      res.status(200).send('CORS Test');
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

  it('should include CORS headers on GET /cors', async () => {
    const response = await fetch(`${baseUrl}/cors`);

    expect(response.status).toBe(200);
    // Assuming the CORS middleware sets Access-Control-Allow-Origin to "*"
    expect(response.headers.get('Access-Control-Allow-Origin')).toBe('*');
  });
});
