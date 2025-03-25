/* eslint-disable import/no-named-as-default */
import server from '../src/core';
import { Request, Response } from '../src/types';

/**
 * Initializes and configures an HTTP server with subdomain support using Bohemian Server.
 *
 * This example demonstrates how to define a subdomain and handle requests accordingly.
 */

const app = server({ host: 'localhost' });

/**
 * Defines a subdomain-based route.
 *
 * Requests made to `http://example.localhost:3000/` will be handled by this route.
 *
 * @param {Request} request - The incoming HTTP request.
 * @param {Response} response - The HTTP response object.
 */
app
  .domain({ host: 'example' })
  .get('/', (request: Request, response: Response) => {
    response.send('Hello, World!');
  });

/**
 * Starts the server and listens for incoming connections on port 3000.
 *
 * Once started, the server is accessible at http://example.localhost:3000/.
 */
app.listen(3000, () => {
  console.log('The server is running on http://example.localhost:3000/');
});
