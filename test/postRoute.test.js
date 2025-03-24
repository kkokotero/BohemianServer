// eslint-disable-next-line import/no-named-as-default
import server from '../src/core';
describe('Bohemian Server - POST Route Test (postRoute.test.ts)', () => {
    let instance;
    let baseUrl;
    beforeAll(async () => {
        const app = server();
        // Define a POST route that echoes back the JSON payload.
        app.post('/echo', async (req, res) => {
            try {
                res.status(200).send({ received: await req.body });
            }
            catch (err) {
                res.status(400).send({ error: 'Invalid JSON' });
            }
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
    it('should echo the JSON data sent via POST', async () => {
        const payload = { key: 'value' };
        const response = await fetch(`${baseUrl}/echo`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });
        expect(response.status).toBe(200);
        const json = await response.json();
        expect(json.received).toEqual(payload);
    });
});
