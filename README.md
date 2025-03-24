# Bohemian Server

During a university project, I was challenged to create an "old-fashioned" server without relying on external frameworks. The goal was to dive deep into building web servers using **Node.js** and to understand each of its components from scratch. Inspired by Node.js's native server, I decided to implement advanced features that not only replicated but also extended traditional functionality.

The process involved extensive research in areas such as route management, security, monitoring systems integration, and the creation of utilities to streamline development. As a result, Bohemian Server emerged with functionalities including:

- Management of domains and subdomains.
- A routing system based on Trie structures (TRI-based routing system) for fast and efficient searches.
- Complementary utilities such as a basic logger, a token system, a reactive data watcher, CORS, input validators, and a cache manager.

This learning journey allowed me to refine server control, enhance route management, and create a modular environment adaptable to various needs. The following documentation is designed to offer a detailed, narrative guide for each API component—from basic configuration to advanced utilities.

---

## Creating a Basic Server

The following example shows how to set up a basic server that defines a GET route for the root endpoint (`"/"`) and responds with a simple message:

```typescript
import server from 'bohemian-server/core';
import { Request, Response } from 'bohemian-server/types';

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
```

---

## Using Middleware in Requests

To demonstrate how to incorporate middleware, the following example adds a function that logs each incoming request to the console:

```typescript
import server from 'bohemian-server/core';
import { Request, Response, Next } from 'bohemian-server/types';

const app = server();

function middleware(request: Request, response: Response, next: Next) {
  console.log(`Middleware activated for route: ${request.url}`);
  next();
}

// Define a GET route for the root endpoint using the middleware.
app.get('/', middleware, (request: Request, response: Response) => {
  response.send('Hello, World!');
});

// Start the server on port 3000.
app.listen(3000, () => {
  console.log('The server is running on http://localhost:3000');
});
```

---

## Middleware Integration (CORS)

Handling requests from different origins is essential in web development. Bohemian Server seamlessly integrates a **CORS** middleware that applies to all defined routes:

```typescript
import { cors } from 'bohemian-server/utils';
import server from 'bohemian-server/core';
import { Request, Response } from 'bohemian-server/types';

const app = server();

// Apply the CORS middleware to allow cross-origin requests.
app.use(cors);

app.get('/', (request: Request, response: Response) => {
  response.send('Hello, World!');
});

// Start the server on port 3000.
app.listen(3000, () => {
  console.log('The server is running on http://localhost:3000');
});
```

---

## SSL Configuration for Secure Servers

In scenarios requiring secure connections, Bohemian Server allows you to directly configure SSL:

```typescript
import { SSL } from 'bohemian-server/types';
import server from 'bohemian-server/core';
import { Request, Response } from 'bohemian-server/types';
import { join } from 'path';

const app = server();

// Configure SSL options with the path to your private key and certificate.
const sslOptions: SSL = {
  key: join(process.cwd(), 'path-to-your-private-key.pem'),
  cert: join(process.cwd(), 'path-to-your-certificate.pem'),
};

// Apply the SSL configuration to the server.
app.ssl(sslOptions);

app.get('/', (request: Request, response: Response) => {
  response.send('Hello, World!');
});

// Start the server on port 3000 using HTTPS.
app.listen(3000, () => {
  console.log('The server is running on https://localhost:3000');
});
```

---

## Route and Domain Management

Bohemian Server allows for modular management of routes and domains. In the following example, a specific subdomain is defined so that requests to `http://example.localhost:3000/` are handled separately:

```typescript
import server from 'bohemian-server/core';
import { Request, Response } from 'bohemian-server/types';

const app = server({ host: 'localhost' });

// Define a subdomain (for example, 'example').
// This allows the URL to be: http://example.localhost:3000/
app.domain('example').get('/', (request: Request, response: Response) => {
  response.send('Hello, World!');
});

app.listen(3000, () => {
  console.log('The server is running on http://example.localhost:3000/');
});
```

---

## Advanced Server Configuration

Bohemian Server is designed so that all configuration is performed in a centralized and declarative manner. This approach allows you to define the complete server configuration—middleware usage, routes, domains, and security options—in a single object:

```typescript
import { Request, Response } from 'bohemian-server/types';
import server from 'bohemian-server/core';
import { cors } from 'bohemian-server/utils';

// Create the server by passing a complete configuration object.
const app = server({
  https: true,
  ssl: {
    key: '/path/to/your/private-key.pem',
    cert: '/path/to/your/certificate.pem',
  },
  uses: [cors],
  routes: [
    {
      method: 'GET',
      path: '/',
      callbacks: [
        (request: Request, response: Response) => {
          response.send('Hello, World!');
        },
      ],
    },
  ],
  domains: [
    {
      host: 'example',
      routes: [
        {
          method: 'GET',
          path: '/',
          callbacks: [
            (request: Request, response: Response) => {
              response.send('Hello, World!');
            },
          ],
        },
      ],
    },
  ],
});
```

---

## License and Contributions

Bohemian Server is an open-source project distributed under the [MIT License](https://opensource.org/licenses/MIT). This license allows any developer to use, modify, and distribute the library freely, provided that the license notice is included in any copies or distributions of the software.

Contributions, suggestions, and any type of feedback that help improve Bohemian Server’s quality and functionality are greatly appreciated. You can contribute by submitting pull requests, opening issues, or sharing your ideas with the community.

---

Bohemian Server was born as a personal challenge to gain a deep understanding of how web servers operate in Node.js. With a modular, elegant, and efficient approach, this library not only simplifies the creation and configuration of servers but also adapts to the needs of projects of various scales. The documentation presented here aims to inspire other developers to explore, experiment, and contribute to this ever-evolving project.

> Any help and feedback are welcome to continue improving Bohemian Server!
