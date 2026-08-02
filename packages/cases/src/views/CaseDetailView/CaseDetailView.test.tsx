import { screen } from '@testing-library/react';
import { http, HttpResponse } from 'msw';

import { server } from '../../mockServer';
import { renderWithRoute } from '../../test-utils';
import { CaseDetailView } from './CaseDetailView';

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

// "Reilly - Hamill" from the mock dataset - on hold, assigned to Elijah Kirlin
const CASE_ID = 'eb038a4c-1b7a-4a88-80ee-8a086b0fdd3d';

describe('CaseDetailView', () => {
  it('shows the case name, status and assignee', async () => {
    renderWithRoute(<CaseDetailView />, {
      path: '/cases/:caseId',
      initialEntry: `/cases/${CASE_ID}`,
    });

    expect(await screen.findByText('Reilly - Hamill')).toBeInTheDocument();
    expect(screen.getByText('On Hold')).toBeInTheDocument();
    expect(screen.getByText('Elijah Kirlin')).toBeInTheDocument();
  });

  it('shows a not found message for an unknown case id', async () => {
    renderWithRoute(<CaseDetailView />, {
      path: '/cases/:caseId',
      initialEntry: '/cases/does-not-exist',
    });

    expect(await screen.findByText('Case not found.')).toBeInTheDocument();
  });

  it('shows an error message if the request fails', async () => {
    server.use(http.get('/api/cases/:id', () => HttpResponse.error()));

    renderWithRoute(<CaseDetailView />, {
      path: '/cases/:caseId',
      initialEntry: `/cases/${CASE_ID}`,
    });

    expect(
      await screen.findByText(
        'Something went wrong loading this case. Please try again.',
      ),
    ).toBeInTheDocument();
  });
});
