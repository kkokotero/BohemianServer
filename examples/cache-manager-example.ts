/* eslint-disable import/no-named-as-default */
import { CacheManager } from '../src/utils/cacheManager';
import server from '../src/core';
import { Request, Response } from '../src/types';

const app = server();
const port = 4000;
const cache = new CacheManager(5); // Cache with a limit of 5 elements

/**
 * Endpoint to add a user to the cache.
 * Accepts a JSON body containing user details and stores them in the cache.
 */
app.post('/users', async (req: Request, res: Response) => {
  const body = await req.body;

  // If the body is a string, attempt to parse it into an object
  const { id, name, age } = typeof body === 'string' ? JSON.parse(body) : body;
  if (!id || !name || !age) {
    res.status(400).send({ error: 'Missing user data' });
    return;
  }

  // Store user data in the cache with a key format of `user:{id}`
  cache.set(`user:${id}`, { name, age });
  res.send({ message: 'User stored in cache' });
});

/**
 * Endpoint to retrieve a user from the cache.
 * Fetches user data based on the provided user ID.
 */
app.get('/users/:id', (req: Request, res: Response) => {
  const user = cache.get(`user:${req.params.id}`);
  if (!user) {
    res.status(404).send({ error: 'User not found in cache' });
    return;
  }
  res.send(user);
});

/**
 * Endpoint to delete a user from the cache.
 * Removes user data based on the provided user ID.
 */
app.delete('/users/:id', (req: Request, res: Response) => {
  const deleted = cache.delete(`user:${req.params.id}`);
  if (!deleted) {
    res.status(404).send({ error: 'User not found in cache' });
    return;
  }
  res.send({ message: 'User deleted from cache' });
});

/**
 * Endpoint to get the current size of the cache.
 * Returns the number of elements currently stored in the cache.
 */
app.get('/cache-size', (req: Request, res: Response) => {
  res.send({ size: cache.size() });
});

/**
 * Starts the server and listens on the specified port.
 */
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
