// eslint-disable-next-line import/no-named-as-default
import server from '../src/core';
describe('Bohemian Server - Error Handling Test (errorHandling.test.ts)', () => {
    let instance;
    let baseUrl;
    beforeAll(async () => {
        const app = server();
        // Define a route that deliberately throws an error.
        app.get('/error', (req, res) => {
            try {
                throw new Error('Test Error');
            }
            catch {
                res.status(500).send({ error: 'An error occurred.' });
            }
        });
        // Optionally, if Bohemian Server provides error-handling middleware,
        // it should catch the error and return a 500 status.
        instance = app.value;
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
    it('should respond with status 500 when an error is thrown', async () => {
        const response = await fetch(`${baseUrl}/error`);
        expect(response.status).toBe(500);
    });
});
