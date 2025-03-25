/* eslint-disable import/no-named-as-default */
import { join } from 'path';
import server from '../src/core';
import { SSL, Request, Response } from '../src/types';

/**
 * Initializes and configures a secure HTTPS server using Bohemian Server.
 *
 * This example demonstrates how to set up SSL/TLS encryption for secure communication.
 * The server listens on port 3000 and serves a simple "Hello, World!" message.
 */

const app = server();

/**
 * SSL Configuration
 *
 * Specifies the file paths for the private key and certificate required for HTTPS.
 * Ensure you replace 'path-to-your-private-key.pem' and 'path-to-your-certificate.pem'
 * with the actual paths to your SSL key and certificate files.
 */
const sslOptions: SSL = {
  key: join(process.cwd(), 'path-to-your-private-key.pem'),
  cert: join(process.cwd(), 'path-to-your-certificate.pem'),
};

// Apply the SSL configuration to the server.
app.ssl(sslOptions);

/**
 * Defines a simple GET endpoint at the root URL.
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
 * Once started, the server is accessible via HTTPS at https://localhost:3000.
 */
app.listen(3000, () => {
  console.log('The server is running on https://localhost:3000');
});
