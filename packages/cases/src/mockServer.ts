import { setupServer } from 'msw/node';
import { apiHandlers } from 'shared';

export const server = setupServer(...apiHandlers);
