/* eslint-disable import/no-named-as-default */
import server from '../src/core';
import { Request, Response } from '../src/types';

/**
 * Initializes and configures a basic HTTP server using Bohemian Server.
 *
 * This example demonstrates how to create simple GET and POST endpoints.
 */

const app = server();

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
 * Defines a POST route for the root endpoint.
 *
 * Echoes back the received request body.
 *
 * @param {Request} request - The incoming HTTP request.
 * @param {Response} response - The HTTP response object.
 */
app.post('/', async (request: Request, response: Response) => {
  const body = await request.body;
  response.send(body.id);
});

/**
 * Starts the server and listens for incoming connections on port 3000.
 *
 * Once started, the server is accessible at http://localhost:3000.
 */
app.listen(3000, () => {
  console.log('The server is running on http://localhost:3000');
});
