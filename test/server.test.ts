import http from 'http';
// eslint-disable-next-line import/no-named-as-default
import server from '../src/core';
import { Request, Response } from '../src/types';

describe('Bohemian Server - Basic Server Test (server.test.ts)', () => {
  let instance: http.Server;
  let baseUrl: string;

  beforeAll(async () => {
    const app = server();

    // Define a GET route for the root endpoint that sends "Hello, World!"
    app.get('/', (req: Request, res: Response) => {
      res.status(200).send('Hello, World!');
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

  it('should respond with "Hello, World!" on GET /', async () => {
    const response = await fetch(`${baseUrl}/`);
    const text = await response.text();

    expect(response.status).toBe(200);
    expect(text).toBe('Hello, World!');
  });
});
