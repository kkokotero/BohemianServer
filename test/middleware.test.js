// eslint-disable-next-line import/no-named-as-default
import server from '../src/core';
describe('Bohemian Server - Middleware Test (middleware.test.ts)', () => {
    let instance;
    let baseUrl;
    beforeAll(async () => {
        const app = server();
        // Middleware that adds a custom header
        const customMiddleware = (req, res, next) => {
            res.header('X-Custom-Header', 'TestHeader');
            next();
        };
        // Define a GET route using the middleware
        app.get('/middleware', customMiddleware, (req, res) => {
            res.status(200).send('Middleware Test');
        });
        instance = app.value;
        // Start the server on a dynamic port
        await new Promise((resolve) => {
            instance.listen(0, () => {
                const address = instance.address();
                if (typeof address === 'object' && address?.port) {
                    baseUrl = `http://localhost:${address.port}`;
                }
                resolve();
            });
        });
    });
    afterAll(() => {
        instance.close();
    });
    it('should have the custom header set by middleware on GET /middleware', async () => {
        const response = await fetch(`${baseUrl}/middleware`);
        const text = await response.text();
        expect(response.status).toBe(200);
        expect(response.headers.get('X-Custom-Header')).toBe('TestHeader');
        expect(text).toBe('Middleware Test');
    });
});
