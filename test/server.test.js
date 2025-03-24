// eslint-disable-next-line import/no-named-as-default
import server from '../src/core';
describe('Bohemian Server - Basic Server Test (server.test.ts)', () => {
    let instance;
    let baseUrl;
    beforeAll(async () => {
        const app = server();
        // Define a GET route for the root endpoint that sends "Hello, World!"
        app.get('/', (req, res) => {
            res.status(200).send('Hello, World!');
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
    it('should respond with "Hello, World!" on GET /', async () => {
        const response = await fetch(`${baseUrl}/`);
        const text = await response.text();
        expect(response.status).toBe(200);
        expect(text).toBe('Hello, World!');
    });
});
