/* eslint-disable import/no-named-as-default */
import { Request, Response } from '../src/types';
import server from '../src/core';
import { cors } from '../src/utils';

/**
 * Create the server by passing a complete configuration object.
 * This configuration includes middleware, routes, and domain-specific settings.
 */
const app = server({
  uses: [cors], // Middleware to be used only in this domain, cannot be use for other domain or subdomain.
  routes: [
    {
      method: 'GET',
      path: '/',
      callbacks: [
        (request: Request, response: Response) => {
          response.send('Hello, World in Index!');
        },
      ],
    },
  ],
  domains: [
    {
      host: 'example', // Domain-specific configuration for 'example'
      uses: [cors], // Middleware specific to this domain
      routes: [
        {
          method: 'GET',
          path: '/',
          callbacks: [
            (request: Request, response: Response) => {
              response.send('Hello, World in examples!');
            },
          ],
        },
      ],
    },
  ],
});

/**
 * Start the server and listen on the specified port.
 * Logs a message to the console once the server is running.
 */
app.listen(3000, () => {
  console.log('Listening on port 3000');
});
