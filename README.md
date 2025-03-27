# Bohemian Server

Bohemian Server is a Node.js library created as a university challenge to build an "old-fashioned" server without relying on external frameworks. This tool allows you to:

- **Manage domains and subdomains.**
- **Define routes quickly and efficiently** using Trie structures.
- **Use custom middleware and built-in utilities,** including CORS, input validators, a logging system, tokenization, and a cache manager using the RLU (Recent, Least-used) method.
- **Easily configure secure (SSL) connections.**

This README provides a straightforward introduction to the installation, configuration, and usage examples so you can integrate and adapt Bohemian Server into your projects.

---

## Installation

Install Bohemian Server using **npm** or **yarn**:

### Using npm

```bash
npm install bohemian-server
```

### Using yarn

```bash
yarn add bohemian-server
```

Then, in your Node.js application, import the library:

```typescript
import server from "bohemian-server/core";
```

---

## GitHub Repository

- GitHub Repository: [Bohemian Server on GitHub](https://github.com/kkokotero/BohemianServer)
- NPM Package: [Bohemian Server on NPM](https://www.npmjs.com/package/bohemian-server)

---

## Basic Example

Create a simple server that responds to GET and POST requests:

```typescript
import server from "bohemian-server/core";
import { Request, Response } from "bohemian-server/types";

const app = server();

// GET route at the root
app.get("/", (request: Request, response: Response) => {
    response.send("Hello, World!");
});

// POST route that returns the received body
app.post("/", async (request: Request, response: Response) => {
    response.send(await request.body);
});

// Start the server on port 3000
app.listen(3000, () => {
    console.log("Server running at http://localhost:3000");
});
```

---

## Using Middleware

Integrate middleware for tasks such as logging or validation, or use the built-in utilities (e.g., CORS).

### Custom Middleware

```typescript
import server from "bohemian-server/core";
import { Request, Response, Next } from "bohemian-server/types";

const app = server();

const logMiddleware = (req: Request, res: Response, next: Next) => {
    console.log(`Accessing: ${req.url}`);
    next();
};

app.get("/", logMiddleware, (req: Request, res: Response) => {
    res.send("Hello, World!");
});

app.listen(3000, () => {
    console.log("Server running at http://localhost:3000");
});
```

### Global Middleware (CORS)

```typescript
import { cors } from "bohemian-server/utils";
import server from "bohemian-server/core";
import { Request, Response } from "bohemian-server/types";

const app = server();

// Apply CORS to all routes
app.use(cors);

app.get("/", (req: Request, res: Response) => {
    res.send("Hello, World!");
});

app.listen(3000, () => {
    console.log("Server running at http://localhost:3000");
});
```

Below is an improved English version of the example that demonstrates how to configure routes with different CORS settings for public access, domain-only access, and domain plus subdomains:

---

#### To Allow the Domain to Receive Requests from Anywhere

```typescript
import server from "bohemian-server/core";
import { Request, Response } from "bohemian-server/types";

const app = server();

/**
 * Public route: Accessible from any origin.
 * This route explicitly enables public CORS to allow cross-origin requests.
 */
app.get("/public", (req: Request, res: Response) => {
    res.enablePublicCors();
    res.send("Hello, World from a public route!");
});

/**
 * Private route: Accessible only from the configured domain.
 * No CORS modification is applied here, restricting access to the domain.
 */
app.get("/private", (req: Request, res: Response) => {
    res.send("Hello, World from a private route!");
});

/**
 * Domain/Subdomain route: Accessible from the domain and its subdomains.
 * This route enables CORS for the domain and its subdomains.
 */
app.get("/", (req: Request, res: Response) => {
    res.enableCors();
    res.send("Hello, World from a domain/subdomain route!");
});

app.listen(3000, () => {
    console.log("Server running at http://localhost:3000");
});
```

> This clear separation helps you manage access levels based on your application's needs.

---

## SSL Configuration

Configure SSL for secure connections with your certificates:

```typescript
import server from "bohemian-server/core";
import { SSL, Request, Response } from "bohemian-server/types";
import { join } from "path";

const app = server();

const sslOptions: SSL = {
    key: join(process.cwd(), "path-to-your-private-key.pem"),
    cert: join(process.cwd(), "path-to-your-certificate.pem"),
};

app.ssl(sslOptions);

app.get("/", (req: Request, res: Response) => {
    res.send("Hello, World!");
});

app.listen(3000, () => {
    console.log("Server running at https://localhost:3000");
});
```

---

## Domain and Subdomain Management

Bohemian Server allows you to handle domains and subdomains in a modular way. Configure your hosts file to redirect to custom domains.

### Custom Domain Setup

1. **Windows:**  
   Edit `C:\Windows\System32\drivers\etc\hosts` (as Administrator) and add:

    ```bash
    127.0.0.1 example.localhost
    ```

2. **Linux/Mac:**  
   Open a terminal and run:

    ```bash
    sudo nano /etc/hosts
    ```

    Then add:

    ```bash
    127.0.0.1 example.localhost
    ```

3. **Clear DNS Cache (if needed):**
    - Windows: `ipconfig /flushdns`
    - Mac/Linux: `sudo dscacheutil -flushcache`

### Example: Subdomain

```typescript
import server from "bohemian-server/core";
import { Request, Response } from "bohemian-server/types";

const app = server({ host: "localhost" });

app.domain({ host: "example" }).get("/", (req: Request, res: Response) => {
    res.send("Hello, World from a subdomain!");
});

app.listen(3000, () => {
    console.log("Server running at http://example.localhost:3000/");
});
```

---

## Advanced Configuration

Define the entire server configuration (middleware, routes, domains, and security) in a centralized manner:

```typescript
import { Request, Response } from "bohemian-server/types";
import server from "bohemian-server/core";
import { cors } from "bohemian-server/utils";

const app = server({
    uses: [cors],
    routes: [
        {
            method: "GET",
            path: "/",
            callbacks: [
                (req: Request, res: Response) => {
                    res.send("Hello from the main route!");
                },
            ],
        },
    ],
    domains: [
        {
            host: "example",
            uses: [cors],
            routes: [
                {
                    method: "GET",
                    path: "/",
                    callbacks: [
                        (req: Request, res: Response) => {
                            res.send("Hello from example!");
                        },
                    ],
                },
            ],
        },
    ],
});

app.listen(3000, () => {
    console.log("Server listening on port 3000");
});
```

---

## Built-in Utilities

Bohemian Server includes several tools to enhance your development:

### Cache Manager (RLU)

Efficiently manage cache by keeping recent data and removing the least used items.

```typescript
import { CacheManager } from "bohemian-server/utils";
import server from "bohemian-server/core";
import { Request, Response } from "bohemian-server/types";

const app = server();
const cache = new CacheManager(5);

app.post("/users", async (req: Request, res: Response) => {
    const body = await req.body;
    const { id, name, age } =
        typeof body === "string" ? JSON.parse(body) : body;
    if (!id || !name || !age) {
        res.status(400).send({ error: "Incomplete data" });
        return;
    }
    cache.set(`user:${id}`, { name, age });
    res.send({ message: "User stored" });
});

app.get("/users/:id", (req: Request, res: Response) => {
    const user = cache.get(`user:${req.params.id}`);
    if (!user) {
        res.status(404).send({ error: "User not found" });
        return;
    }
    res.send(user);
});

app.listen(4000, () => {
    console.log("Server running at http://localhost:4000");
});
```

### Logger

Log events and requests to aid debugging:

```typescript
import { Logger } from "bohemian-server/utils";
import server from "bohemian-server/core";
import { Request, Response } from "bohemian-server/types";

const app = server();
const logger = new Logger({
    format: (level, message) =>
        `[${level}] ${new Date().toISOString()} - ${message}`,
});

app.use((req: Request, res: Response, next) => {
    logger.info(`Request: ${req.method} ${req.url}`);
    next();
});

app.get("/", (req: Request, res: Response) => {
    logger.success("Accessed root");
    res.send("Welcome to the API");
});

app.listen(3000, () => {
    logger.success("Server running at http://localhost:3000");
});
```

### TokenManager

Easily generate and validate tokens:

```typescript
import { TokenManager } from "bohemian-server/utils";

const tokenManager = new TokenManager("my-secret-key");

const token = tokenManager.generate(
    { userId: 123, role: "admin" },
    { expiresIn: 3600 }
);
console.log("Generated token:", token);

const validationResult = tokenManager.validate(token);
if (validationResult.valid) {
    console.log("Valid token:", validationResult.payload);
} else {
    console.error("Invalid token:", validationResult.error);
}
```

### Validator

Validate emails, numbers, lengths, and more:

```typescript
import { verify } from "bohemian-server/utils";

const validEmail = verify("test@example.com").isEmail().result;
console.log("Valid email:", validEmail);

const validNumber = verify(12345).isNumeric().result;
console.log("Valid number:", validNumber);
```

### Watcher

Observe and react to value changes:

```typescript
import { Watcher } from "bohemian-server/utils";

const numberWatcher = new Watcher<number>(10, (newVal, oldVal) => {
    console.log(`Change: ${oldVal} → ${newVal}`);
});

numberWatcher.value = 20;
```

---

## License and Contributions

Bohemian Server is distributed under the [MIT License](https://opensource.org/licenses/MIT). Contributions, suggestions, and feedback are welcome. Collaborate through pull requests, report issues, or share your ideas with the community.

---

Bohemian Server was born as a personal challenge to deeply understand how web servers work in Node.js. With a modular and efficient design, this library simplifies the creation, configuration, and scalability of servers for projects of any size. Explore, adapt, and improve Bohemian Server to suit your needs!
