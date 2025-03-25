/* eslint-disable import/no-named-as-default */
import { cors } from '../src/utils';
import server from '../src/core';
import { Request, Response } from '../src/types';

/**
 * Initializes and configures an HTTP server with CORS support using Bohemian Server.
 *
 * This example demonstrates how to enable Cross-Origin Resource Sharing (CORS)
 * to allow requests from different origins.
 */

const app = server();

/**
 * Apply the CORS middleware to allow cross-origin requests.
 *
 * This is useful when your API needs to be accessed by web applications hosted on different domains.
 */
app.use(cors);

/**
 * Defines a GET route for the root endpoint.
 *
 * Returns a simple "Hello, World!" message when accessed.
 *
 * @param {Request} request - The incoming HTTP request.
 * @param {Response} response - The HTTP response object.
 */
app.get('/', (request: Request, response: Response) => {
  response.send('Hello, World!');
});

/**
 * Starts the server and listens for incoming connections on port 3000.
 *
 * Once started, the server is accessible at http://localhost:3000.
 */
app.listen(3000, () => {
  console.log('The server is running on http://localhost:3000');
});
