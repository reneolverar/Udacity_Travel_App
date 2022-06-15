// Import the js file to test
import { sentimentAnalysisCheck } from "../src/client/js/sentimentAnalysis"

// To be able to use fetch in referenced JS file functions
import 'cross-fetch/polyfill';

// Supertest provides a high-level abstraction for testing HTTP, while still allowing you to drop down to the lower-level API provided by superagent.
const request = require('supertest');

// Get apiKeys for all tests
let apiKey
const app = require('../src/server/index');
beforeAll(async () => {
    const res = await request(app).get('/apiKey');
    apiKey = res.text
});

// FormData is not available in Jest, therefore you need to mock it
function FormDataMock() {
    this.append = jest.fn(); }
global.FormData = FormDataMock

// The describe() function takes two arguments - a string description, and a test suite as a callback function.
// A test suite may contain one or more related tests
describe("Testing the sentiment analysis functionality", () => {
    test("Testing if sentimentAnalysisCheck() function is defined", () => {
        // Define the input for the function, if any, in the form of variables/array
        // Define the expected output, if any, in the form of variables/array
        // The expect() function, in combination with a Jest matcher, is used to check if the function produces the expected output
        // The general syntax is `expect(myFunction(arg1, arg2, ...)).toEqual(expectedValue);`, where `toEqual()` is a matcher
        expect(sentimentAnalysisCheck).toBeDefined();
    })
    // This test is only partially working. The dev and production environments work fine but the reply from the API during the test is that the key is missing.
    // I am certain that the key is being fetched from the server and sent to the function correctly.
    test("Testing if sentimentAnalysisCheck() successfully reaches the API", async () => {
        // const url = "https://blog.hubspot.com/marketing/how-to-start-a-blog"
        const url = "Hello world"
        const res = await sentimentAnalysisCheck(url, "Text", apiKey);
        expect(res.status.code).toBe("200")
    })
});