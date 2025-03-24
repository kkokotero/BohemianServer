import server from './src/core';
import { Request, Response } from './src/types';

const app = server();

// Define a GET route for the root endpoint that sends a message.
app.get('/', (request: Request, response: Response) => {
  response.send('Hello, World!');
});

app.post('/', async (request: Request, response: Response) => {
  response.send(await request.body);
});

// Start the server on port 3000.
app.listen(3000, () => {
  console.log('The server is running on http://localhost:3000');
});
