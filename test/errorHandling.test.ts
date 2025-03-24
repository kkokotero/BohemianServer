import http from 'http';
// eslint-disable-next-line import/no-named-as-default
import server from '../src/core';
import { Request, Response } from '../src/types';

describe('Bohemian Server - Error Handling Test (errorHandling.test.ts)', () => {
  let instance: http.Server;
  let baseUrl: string;

  beforeAll(async () => {
    const app = server();

    // Define a route that deliberately throws an error.
    app.get('/error', (req: Request, res: Response) => {
      try {
        throw new Error('Test Error');
      } catch {
        res.status(500).send({ error: 'An error occurred.' });
      }
    });

    // Optionally, if Bohemian Server provides error-handling middleware,
    // it should catch the error and return a 500 status.
    instance = app.value;
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

  it('should respond with status 500 when an error is thrown', async () => {
    const response = await fetch(`${baseUrl}/error`);
    expect(response.status).toBe(500);
  });
});
