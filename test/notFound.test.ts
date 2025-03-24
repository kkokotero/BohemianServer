import http from 'http';
// eslint-disable-next-line import/no-named-as-default
import server from '../src/core';
import { Request, Response } from '../src/types';

describe('Bohemian Server - Not Found Test (notFound.test.ts)', () => {
  let instance: http.Server;
  let baseUrl: string;

  beforeAll(async () => {
    const app = server();

    // Define only a single route.
    app.get('/', (req: Request, res: Response) => {
      res.status(200).send('Home');
    });

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

  it('should respond with 404 for an undefined route', async () => {
    const response = await fetch(`${baseUrl}/nonexistent`);
    expect(response.status).toBe(404);
  });
});
