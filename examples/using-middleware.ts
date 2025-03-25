/* eslint-disable import/no-named-as-default */
import server from '../src/core';
import { Request, Response, Next } from '../src/types';

/**
 * Initializes and configures an HTTP server with middleware support using Bohemian Server.
 *
 * This example demonstrates how to create and apply middleware to handle requests.
 */

const app = server();

/**
 * Middleware function that logs the request URL.
 *
 * This function is executed before passing control to the route handler.
 *
 * @param {Request} request - The incoming HTTP request.
 * @param {Response} response - The HTTP response object.
 * @param {Next} next - Callback to pass control to the next function in the stack.
 */
function middleware(request: Request, response: Response, next: Next) {
  console.log(`Middleware activated for route: ${request.url}`);
  next();
}

/**
 * Defines a GET route for the root endpoint with middleware.
 *
 * Middleware is executed before the route handler.
 *
 * @param {Request} request - The incoming HTTP request.
 * @param {Response} response - The HTTP response object.
 */
app.get('/', middleware, (request: Request, response: Response) => {
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
