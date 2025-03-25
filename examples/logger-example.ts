/* eslint-disable import/no-named-as-default */
import { Logger } from '../src/utils/logger';
import server from '../src/core';
import { Request, Response } from '../src/types';

/**
 * Initializes and configures an HTTP server with request logging using Bohemian Server.
 *
 * This example demonstrates how to integrate a custom Logger utility to log requests
 * and server events, providing better debugging and monitoring capabilities.
 */

const app = server();
const port = 3000;

/**
 * Logger Configuration
 *
 * Creates a Logger instance with a custom format for log messages.
 * The format includes the log level, timestamp, and message.
 */
const logger = new Logger({
  format: (level, message) =>
    `[${level}] ${new Date().toISOString()} - ${message}`,
});

/**
 * Middleware to log each incoming request.
 *
 * Logs the HTTP method and URL of every request received by the server.
 */
app.use((req: Request, res: Response, next) => {
  logger.info(`Request received: ${req.method} ${req.url}`);
  next();
});

/**
 * Defines a root endpoint.
 *
 * Logs successful access and returns a welcome message.
 *
 * @param {Request} req - The incoming HTTP request.
 * @param {Response} res - The HTTP response object.
 */
app.get('/', (req: Request, res: Response) => {
  logger.success('Root endpoint accessed');
  res.send('Welcome to the API');
});

/**
 * Defines an error simulation endpoint.
 *
 * Logs an intentional error and returns a 500 status response.
 *
 * @param {Request} req - The incoming HTTP request.
 * @param {Response} res - The HTTP response object.
 */
app.get('/error', (req: Request, res: Response) => {
  logger.error('Intentional error triggered');
  res.status(500).send({ error: 'Internal Server Error' });
});

/**
 * Starts the server and listens for incoming connections on the specified port.
 *
 * Once started, the server is accessible at http://localhost:3000.
 */
app.listen(port, () => {
  logger.success(`Server running at http://localhost:${port}`);
});
