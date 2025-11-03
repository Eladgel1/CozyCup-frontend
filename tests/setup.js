import '@testing-library/jest-dom';
import 'whatwg-fetch';
import { server, resetTestDb } from './msw/server';

// Start MSW
beforeAll(() => {
  server.listen({
    // Let unknown requests pass through to avoid brittle tests.
// You can change to 'error' to catch any unexpected network calls.
    onUnhandledRequest: 'bypass',
  });
});

// Reset handlers and in-memory DB after each test
afterEach(() => {
  server.resetHandlers();
  resetTestDb();
});

// Clean up once the test run ends
afterAll(() => {
  server.close();
});
