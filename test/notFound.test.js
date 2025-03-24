// eslint-disable-next-line import/no-named-as-default
import server from '../src/core';
describe('Bohemian Server - Not Found Test (notFound.test.ts)', () => {
    let instance;
    let baseUrl;
    beforeAll(async () => {
        const app = server();
        // Define only a single route.
        app.get('/', (req, res) => {
            res.status(200).send('Home');
        });
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
    it('should respond with 404 for an undefined route', async () => {
        const response = await fetch(`${baseUrl}/nonexistent`);
        expect(response.status).toBe(404);
    });
});
