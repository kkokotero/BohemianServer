import { DomainStructure } from './interfaces/DomainStructure';
import type { Server } from './types';

import { DomainHandler } from './server/handlers/DomainHandler';

export { DomainHandler as ServerCore } from './server/handlers/DomainHandler';

// Re-export the Router class for external use
export { Router } from './server/utils/Router';

/**
 * Creates and returns a new server instance configured with the provided domain structure.
 * This is a factory function that abstracts the creation of a ServerCore instance.
 *
 * @param data - Optional configuration object for the domain (e.g., host, routes, SSL, etc.).
 * @returns A Server instance (ServerCore) configured with the provided data.
 *
 * @example
 * const app = server({
 *   host: 'example.com',
 *   routes: [
 *     { path: '/', method: 'GET', handler: (req, res) => res.send('Hello, World!') },
 *   ],
 * });
 *
 * app.listen(3000, () => {
 *   console.log('Server is running on port 3000');
 * });
 */
export function server(data?: DomainStructure): Server {
  return new DomainHandler(data);
}

// Export the server function as the default export
export default server;
