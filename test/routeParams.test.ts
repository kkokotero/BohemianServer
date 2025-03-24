// routeParams.test.ts
import http from 'http';
// eslint-disable-next-line import/no-named-as-default
import server from '../src/core';
import { Request, Response } from '../src/types';

describe('Bohemian Server - Route Parameters Test (routeParams.test.ts)', () => {
  let instance: http.Server;
  let baseUrl: string;

  beforeAll(async () => {
    const app = server();

    // Define a route with a URL parameter (e.g., /user/:id).
    app.get('/user/:id', (req: Request, res: Response) => {
      // Assume the server attaches route parameters to req.params.
      const userId = req.params.id;
      res.status(200).send({ userId });
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

  it('should return the user id from the route parameter', async () => {
    const userId = '12345';
    const response = await fetch(`${baseUrl}/user/${userId}`);
    expect(response.status).toBe(200);
    const json = await response.json();
    expect(json.userId).toBe(userId);
  });
});
