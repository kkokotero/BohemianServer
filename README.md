# Bohemian Server

Bohemian Server was born as a university challenge to create an "old-fashioned" server without relying on external frameworks. The idea was to delve into building web servers with **Node.js** and understand each of its components from scratch. Inspired by Node.js's native server, I decided to implement advanced features that not only replicate but also extend traditional functionality.

The experience involved extensive research on route management, security, monitoring system integration, and developing utilities to streamline the process. As a result, Bohemian Server offers the following functionalities:

- **Management of domains and subdomains.**
- **Routing system based on Trie structures:**  
  It uses Trie structures to achieve fast and efficient searches, optimizing performance in projects with numerous endpoints.
- **Additional utilities:**  
  These include a basic logger, token system, reactive data observer, CORS support, input validators, and a cache manager based on the **RLU** (*Recent, Least-used*) method, ideal for the efficient management of cached resources.

This documentation details every component of the API, from basic configuration to advanced utilities, allowing developers to understand and adapt the server to various needs.

---

## Installation

To install **Bohemian Server**, you can use either **npm** or **yarn**. Follow the steps below:

### Using npm

To install Bohemian Server via npm, run the following command in your project directory:

```bash
npm install bohemian-server
```

### Using yarn

Alternatively, if you're using yarn, run this command:

```bash
yarn add bohemian-server
```

Once installed, you can start using Bohemian Server in your Node.js application by importing it as follows:

```typescript
import server from 'bohemian-server/core';
```

---

Este bloque de código se puede agregar al inicio del README para facilitar la instalación a los usuarios.

## Basic Server

The following example shows how to set up a basic server that defines a GET route for the root endpoint (`"/"`) and responds with a simple message:

```typescript
import server from 'bohemian-server/core';
import { Request, Response } from 'bohemian-server/types';

const app = server();

// GET route for the root endpoint
app.get('/', (request: Request, response: Response) => {
  response.send('Hello, World!');
});

// POST route that responds with the request body
app.post('/', async (request: Request, response: Response) => {
  response.send(await request.body);
});

// Start the server on port 3000
app.listen(3000, () => {
  console.log('The server is running on http://localhost:3000');
});
```

---

## Using Middleware in Requests

Bohemian Server allows you to incorporate two types of middleware:

- **Custom middleware:** Your own functions for specific tasks (e.g., logging, validation).
- **Pre-existing utilities:** Built-in middleware, such as handling CORS.

In the following example, a middleware that logs each incoming request to the console is added:

```typescript
import server from 'bohemian-server/core';
import { Request, Response, Next } from 'bohemian-server/types';

const app = server();

function middleware(request: Request, response: Response, next: Next) {
  console.log(`Middleware activated for route: ${request.url}`);
  next();
}

// GET route with custom middleware
app.get('/', middleware, (request: Request, response: Response) => {
  response.send('Hello, World!');
});

// Start the server on port 3000
app.listen(3000, () => {
  console.log('The server is running on http://localhost:3000');
});
```

---

## Integration of Middleware (CORS)

Handling requests from different origins is essential in web applications. Bohemian Server integrates middleware for **CORS** that is applied globally:

```typescript
import { cors } from 'bohemian-server/utils';
import server from 'bohemian-server/core';
import { Request, Response } from 'bohemian-server/types';

const app = server();

// Apply CORS middleware to all routes
app.use(cors);

app.get('/', (request: Request, response: Response) => {
  response.send('Hello, World!');
});

// Start the server on port 3000
app.listen(3000, () => {
  console.log('The server is running on http://localhost:3000');
});
```

---

## SSL Configuration for Secure Connections

In scenarios requiring secure connections, Bohemian Server allows you to configure SSL directly:

```typescript
import server from 'bohemian-server/core';
import { SSL, Request, Response } from 'bohemian-server/types';
import { join } from 'path';

const app = server();

// Configure SSL options with the path to your private key and certificate
const sslOptions: SSL = {
  key: join(process.cwd(), 'path-to-your-private-key.pem'),
  cert: join(process.cwd(), 'path-to-your-certificate.pem'),
};

// Apply the SSL configuration to the server
app.ssl(sslOptions);

app.get('/', (request: Request, response: Response) => {
  response.send('Hello, World!');
});

// Start the server on port 3000 using HTTPS
app.listen(3000, () => {
  console.log('The server is running on https://localhost:3000');
});
```

---

## Route and Domain Management

Bohemian Server allows you to manage routes and domains in a modular way. This makes it easier to handle requests directed to different domains or subdomains.

> **Note:** To use custom domains, make sure to configure them on your operating system.

### Custom Domain Configuration

To access custom domains (e.g., `example.localhost`), modify your system's `hosts` file:

**Windows:**

1. Open *Notepad* as **Administrator**.
2. Edit the file `C:\Windows\System32\drivers\etc\hosts`.
3. Add the following line:

   ```bash
   127.0.0.1 example.localhost
   ```

4. Save and close.

**Linux / Mac:**

1. Open a terminal and run:

   ```bash
   sudo nano /etc/hosts
   ```

2. Add the following line:

   ```bash
   127.0.0.1 example.localhost
   ```

3. Save and close (Ctrl + X, Y, Enter).

**Clear DNS Cache (if necessary):**

- **Windows:** `ipconfig /flushdns`
- **Mac/Linux:** `sudo dscacheutil -flushcache`

### Example: Handling a Subdomain

```typescript
import server from 'bohemian-server/core';
import { Request, Response } from 'bohemian-server/types';

const app = server({ host: 'localhost' });

// Define a subdomain (e.g., 'example')
// The resulting URL will be: http://example.localhost:3000/
app.domain({ host: 'example' }).get('/', (request: Request, response: Response) => {
    response.send('Hello, World!');
});

app.listen(3000, () => {
  console.log('The server is running on http://example.localhost:3000/');
});
```

After configuring your system, you can access `http://example.localhost:3000/` just as you would `localhost`.

---

## Advanced Server Configuration

Bohemian Server adopts a centralized and declarative approach to configuration. This allows you to define the entire server setup—middleware, routes, domains, and security options—in a single object.

```typescript
import { Request, Response } from 'bohemian-server/types';
import server from 'bohemian-server/core';
import { cors } from 'bohemian-server/utils';

// Create the server with a complete configuration
const app = server({
  uses: [cors],
  routes: [
    {
      method: 'GET',
      path: '/',
      callbacks: [
        (request: Request, response: Response) => {
          response.send('Hello, World in Index!');
        },
      ],
    },
  ],
  domains: [
    {
      host: 'example',
      uses: [cors],
      routes: [
        {
          method: 'GET',
          path: '/',
          callbacks: [
            (request: Request, response: Response) => {
              response.send('Hello, World in example!');
            },
          ],
        },
      ],
    },
  ],
});

app.listen(3000, () => {
  console.log('Listening on port 3000');
});
```

---

## Cache Manager with RLU Method

The cache manager in Bohemian Server uses the **RLU** (*Recent, Least-used*) method, optimizing cache management by retaining the most recent data and removing the least used. This ensures optimal performance and efficient resource usage.

---

## License and Contributions

Bohemian Server is an open-source project distributed under the [MIT License](https://opensource.org/licenses/MIT). This license allows any developer to use, modify, and distribute the library, as long as the license notice is maintained.

Contributions, suggestions, and feedback are very welcome. You can collaborate by submitting *pull requests*, opening issues, or sharing your ideas with the community.

---

Bohemian Server emerged as a personal challenge to thoroughly understand how web servers work in Node.js. With a modular, elegant, and efficient approach, this library simplifies the creation and configuration of servers, adapting to projects of any scale. All help and feedback are welcome to continuously improve this evolving project!
