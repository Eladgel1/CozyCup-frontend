import { setupServer } from 'msw/node';
import { handlers, resetDb, testDb } from './handlers';

// Create the server with default handlers
export const server = setupServer(...handlers);

// Expose helpers to tests if they need to seed/inspect the in-memory db
export function resetTestDb() {
  resetDb();
}

export { testDb };
