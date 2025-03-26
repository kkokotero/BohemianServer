/* eslint-disable import/no-named-as-default */
import { join } from 'path';
import server from '../src/core';
import { Request, Response, Next } from '../src/types';
import { cors } from '../src/utils';

/**
 * Initializes and configures an HTTP server with subdomain support using Bohemian Server.
 *
 * This example demonstrates how to define a subdomain and handle requests accordingly.
 */

function middleware(req: Request, res: Response, next: Next) {
  console.log(`Request received: ${req.host}${req.url}`);
  next();
}

const app = server({
  host: 'localhost',
  uses: [cors],
  '404': (req: Request, res: Response) => res.send(':('),
  staticUrl: join(import.meta.dirname, 'assets', 'd1'),
  routes: [
    {
      method: 'GET',
      path: '/get',
      callbacks: [
        (req: Request, res: Response) => {
          res.send(`Hello, World in ${req.host} domain!`);
        },
      ],
    },
  ],
  domains: [
    {
      host: 'api',
      uses: [cors, middleware],
      staticUrl: join(import.meta.dirname, 'assets', 'd2'),
      routes: [
        {
          method: 'GET',
          path: '/get',
          callbacks: [
            (req: Request, res: Response) => {
              res.send(`Hello, World in ${req.host} subdomain!`);
            },
          ],
        },
      ],
    },
  ],
});

/**
 * Starts the server and listens for incoming connections on port 3000.
 *
 * Once started, the server is accessible at http://localhost:3000/.
 */
app.listen(3000, () => {
  console.log('The server is running on http://localhost:3000/');
});
