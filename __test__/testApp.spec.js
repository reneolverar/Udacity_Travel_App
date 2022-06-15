// Supertest provides a high-level abstraction for testing HTTP, while still allowing you to drop down to the lower-level API provided by superagent.
const request = require('supertest');
const app = require('../src/server/index');

// The describe() function takes two arguments - a string description, and a test suite as a callback function.
// A test suite may contain one or more related tests
describe("Testing the server GET requests", () => {
    // The test() function has two arguments - a string description, and an actual test as a callback function.
    test("Testing the root path '/'", async () => {
        const res = await request(app).get('/');
        expect(res.statusCode).toBe(200);
    })
    test("Testing the '/apiKey' path", async () => {
        const res = await request(app).get('/apiKey');
        expect(res.statusCode).toBe(200);
    })
});
