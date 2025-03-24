import { RequestHandler } from '../server/handlers/RequestHandler';
import { ResponseHandler } from '../server/handlers/ResponseHandler';

/**
 * CORS Middleware Function
 *
 * This middleware enables Cross-Origin Resource Sharing (CORS) for incoming requests.
 * It sets the appropriate headers to allow cross-origin requests and handles pre-flight
 * OPTIONS requests by responding immediately with a 204 status code.
 *
 * @param req - The request object, an instance of `RequestHandler`.
 * @param res - The response object, an instance of `ResponseHandler`.
 * @param next - A callback function to pass control to the next middleware or route handler.
 *
 * @example
 * // Usage in a server setup
 * const server = bohemian();
 * server.use(cors); // Add CORS middleware to all routes
 *
 * server.get('/example', (req, res, next) => {
 *   res.send('This route supports CORS!');
 * });
 *
 * server.listen(3000, () => {
 *   console.log('Server is running on port 3000');
 * });
 */
// eslint-disable-next-line consistent-return
export function cors(
  req: RequestHandler,
  res: ResponseHandler,
  next: () => void,
) {
  // Enable CORS by setting the appropriate headers
  res.enableCors();

  // Handle pre-flight OPTIONS requests
  if (req.method === 'OPTIONS') {
    // Respond with a 204 No Content status for pre-flight requests
    return res.status(204).send('');
  }

  // Pass control to the next middleware or route handler
  next();
}
