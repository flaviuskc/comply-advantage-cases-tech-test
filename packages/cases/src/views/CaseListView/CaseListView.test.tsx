import { screen, fireEvent, within } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { vi } from 'vitest';

import { server } from '../../mockServer';
import { renderWithQueryClient } from '../../test-utils';
import { CaseListView } from './CaseListView';

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

const openFilters = () => {
  fireEvent.click(screen.getByRole('button', { name: /Filters/ }));
};

const getPageInput = () =>
  screen.getByRole('textbox', { name: 'Page number' }) as HTMLInputElement;

// the "Showing X–Y of Z cases" text is split across nested elements, so
// match on normalized full text content rather than an exact string
const getRangeSummaryText = () =>
  screen
    .getByText(
      (_, element) =>
        /^Showing .* of \d+ cases$/.test(
          element?.textContent?.replace(/\s+/g, ' ').trim() ?? '',
        ) &&
        // pick the innermost matching element, not an ancestor that also
        // contains this text as part of a larger textContent
        Array.from(element?.children ?? []).every(
          (child) => !/of \d+ cases$/.test(child.textContent ?? ''),
        ),
    )
    .textContent?.replace(/\s+/g, ' ')
    .trim() ?? '';

describe('CaseListView', () => {
  it('renders a Cases heading', async () => {
    renderWithQueryClient(<CaseListView />);

    screen.getByRole('heading', { level: 2, name: 'Cases' });

    // wait for the initial fetch to resolve so it doesn't leak into the next test
    await screen.findByText('Reilly - Hamill');
  });

  it('renders the first page of cases with resolved assignee names and status labels', async () => {
    renderWithQueryClient(<CaseListView />);

    const row = (await screen.findByText('Reilly - Hamill')).closest(
      'tr',
    ) as HTMLElement;

    expect(within(row).getByText('On Hold')).toBeInTheDocument();
    expect(within(row).getByText('Elijah Kirlin')).toBeInTheDocument();

    expect(getPageInput()).toHaveValue('1');
    expect(screen.getByText('of 20')).toBeInTheDocument();
  });

  it('marks inactive assignees with an "inactive" label', async () => {
    renderWithQueryClient(<CaseListView />);

    const row = (
      await screen.findByText('Abernathy, Kautzer and MacGyver')
    ).closest('tr') as HTMLElement;

    expect(within(row).getByText('Willard Glover')).toBeInTheDocument();
    expect(within(row).getByText(/inactive/i)).toBeInTheDocument();
  });

  it('paginates through the results', async () => {
    renderWithQueryClient(<CaseListView />);

    await screen.findByText('Reilly - Hamill');

    fireEvent.click(screen.getByRole('button', { name: 'Next page' }));

    await screen.findByText('Moen, Mraz and Adams');
    expect(getPageInput()).toHaveValue('2');
    expect(screen.queryByText('Reilly - Hamill')).not.toBeInTheDocument();
  });

  it('shows the current page range alongside the pagination controls', async () => {
    renderWithQueryClient(<CaseListView />);

    await screen.findByText('Reilly - Hamill');
    expect(screen.getByText('1–10')).toBeInTheDocument();
    expect(getRangeSummaryText()).toBe('Showing 1–10 of 200 cases');

    fireEvent.click(screen.getByRole('button', { name: 'Next page' }));

    await screen.findByText('Moen, Mraz and Adams');
    expect(screen.getByText('11–20')).toBeInTheDocument();
  });

  it('jumps to the first and last page', async () => {
    renderWithQueryClient(<CaseListView />);

    await screen.findByText('Reilly - Hamill');
    expect(screen.getByRole('button', { name: 'First page' })).toBeDisabled();

    fireEvent.click(screen.getByRole('button', { name: 'Last page' }));

    await screen.findByText('of 20');
    expect(getPageInput()).toHaveValue('20');
    expect(screen.getByRole('button', { name: 'Last page' })).toBeDisabled();

    fireEvent.click(screen.getByRole('button', { name: 'First page' }));

    expect(await screen.findByText('Reilly - Hamill')).toBeInTheDocument();
    expect(getPageInput()).toHaveValue('1');
  });

  it('navigates to a typed page number on Enter', async () => {
    renderWithQueryClient(<CaseListView />);

    await screen.findByText('Reilly - Hamill');

    fireEvent.change(getPageInput(), { target: { value: '5' } });
    fireEvent.keyDown(getPageInput(), { key: 'Enter' });

    expect(
      await screen.findByText('Hamill, McDermott and Mosciski'),
    ).toBeInTheDocument();
    expect(getPageInput()).toHaveValue('5');
  });

  it('clamps a typed page number greater than the total to the last page', async () => {
    renderWithQueryClient(<CaseListView />);

    await screen.findByText('Reilly - Hamill');

    fireEvent.change(getPageInput(), { target: { value: '999' } });
    fireEvent.blur(getPageInput());

    await screen.findByText('of 20');
    expect(getPageInput()).toHaveValue('20');
  });

  it('searches cases by name', async () => {
    renderWithQueryClient(<CaseListView />);

    await screen.findByText('Reilly - Hamill');
    expect(screen.getByText('Witting, Goyette and Bruen')).toBeInTheDocument();

    fireEvent.change(screen.getByRole('textbox', { name: 'Search cases' }), {
      target: { value: 'Reilly' },
    });

    expect(await screen.findByText('Reilly - Hamill')).toBeInTheDocument();
    expect(
      screen.queryByText('Witting, Goyette and Bruen'),
    ).not.toBeInTheDocument();

    fireEvent.change(screen.getByRole('textbox', { name: 'Search cases' }), {
      target: { value: '' },
    });

    expect(
      await screen.findByText('Witting, Goyette and Bruen'),
    ).toBeInTheDocument();
  });

  it('shows the count of cases currently matching the filters, not a fixed total', async () => {
    renderWithQueryClient(<CaseListView />);

    await screen.findByText('Reilly - Hamill');
    expect(getRangeSummaryText()).toBe('Showing 1–10 of 200 cases');

    openFilters();
    fireEvent.click(screen.getByRole('checkbox', { name: /Elijah Kirlin/ }));

    const summary = getRangeSummaryText();
    expect(summary).not.toContain('of 200 cases');
    const filteredCount = Number(summary.match(/of (\d+) cases$/)?.[1]);
    expect(filteredCount).toBeGreaterThan(0);
    expect(filteredCount).toBeLessThan(200);
  });

  it('filters the cases table by the selected assignee(s)', async () => {
    renderWithQueryClient(<CaseListView />);

    await screen.findByText('Reilly - Hamill');
    expect(screen.getByText('Witting, Goyette and Bruen')).toBeInTheDocument();

    openFilters();
    fireEvent.click(screen.getByRole('checkbox', { name: /Elijah Kirlin/ }));

    // "Reilly - Hamill" is assigned to Elijah Kirlin, "Witting, Goyette and Bruen" is not
    expect(screen.getByText('Reilly - Hamill')).toBeInTheDocument();
    expect(
      screen.queryByText('Witting, Goyette and Bruen'),
    ).not.toBeInTheDocument();
  });

  it('filters the cases table by the selected status(es)', async () => {
    renderWithQueryClient(<CaseListView />);

    await screen.findByText('Reilly - Hamill');
    expect(screen.getByText('Witting, Goyette and Bruen')).toBeInTheDocument();

    openFilters();
    fireEvent.click(screen.getByRole('checkbox', { name: 'On Hold' }));

    // "Reilly - Hamill" is On Hold, "Witting, Goyette and Bruen" is Resolved
    expect(screen.getByText('Reilly - Hamill')).toBeInTheDocument();
    expect(
      screen.queryByText('Witting, Goyette and Bruen'),
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /Filters \(1\)/ }),
    ).toBeInTheDocument();
  });

  it('clears the assignee filter via "Clear all"', async () => {
    renderWithQueryClient(<CaseListView />);

    await screen.findByText('Reilly - Hamill');

    openFilters();
    fireEvent.click(screen.getByRole('checkbox', { name: /Elijah Kirlin/ }));
    expect(
      screen.queryByText('Witting, Goyette and Bruen'),
    ).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Clear all' }));

    expect(
      await screen.findByText('Witting, Goyette and Bruen'),
    ).toBeInTheDocument();
  });

  it('shows the number of filters applied in the dropdown footer', async () => {
    renderWithQueryClient(<CaseListView />);

    await screen.findByText('Reilly - Hamill');
    openFilters();

    expect(screen.getByText('0 filters applied')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Clear all' })).toBeDisabled();

    fireEvent.click(screen.getByRole('checkbox', { name: /Elijah Kirlin/ }));
    expect(screen.getByText('1 filter applied')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Clear all' })).toBeEnabled();

    fireEvent.click(
      screen.getByRole('checkbox', { name: 'Needs reassignment' }),
    );
    expect(screen.getByText('2 filters applied')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /Filters \(2\)/ }),
    ).toBeInTheDocument();
  });

  it('filters to cases needing reassignment (inactive assignee + open status)', async () => {
    renderWithQueryClient(<CaseListView />);

    await screen.findByText('Reilly - Hamill');

    openFilters();
    fireEvent.click(
      screen.getByRole('checkbox', { name: 'Needs reassignment' }),
    );

    // "Conn and Sons" is CASE_NOT_STARTED with inactive assignee Willard Glover - qualifies
    expect(await screen.findByText('Conn and Sons')).toBeInTheDocument();
    // "Abernathy, Kautzer and MacGyver" has an inactive assignee too, but is resolved - doesn't qualify
    expect(
      screen.queryByText('Abernathy, Kautzer and MacGyver'),
    ).not.toBeInTheDocument();
    // "Reilly - Hamill" has an active assignee - doesn't qualify
    expect(screen.queryByText('Reilly - Hamill')).not.toBeInTheDocument();
  });

  it('shows a reassign button only for open cases with an inactive assignee', async () => {
    renderWithQueryClient(<CaseListView />);

    // "Conn and Sons": CASE_NOT_STARTED + inactive assignee -> qualifies
    const openInactiveRow = (await screen.findByText('Conn and Sons')).closest(
      'tr',
    ) as HTMLElement;
    // "Abernathy, Kautzer and MacGyver": resolved + inactive assignee -> doesn't qualify
    const resolvedInactiveRow = screen
      .getByText('Abernathy, Kautzer and MacGyver')
      .closest('tr') as HTMLElement;
    // "Reilly - Hamill": CASE_ON_HOLD but active assignee -> doesn't qualify
    const openActiveRow = screen
      .getByText('Reilly - Hamill')
      .closest('tr') as HTMLElement;

    expect(
      within(openInactiveRow).getByRole('button', { name: /Reassign case/ }),
    ).toBeInTheDocument();
    expect(
      within(resolvedInactiveRow).queryByRole('button', {
        name: /Reassign case/,
      }),
    ).not.toBeInTheDocument();
    expect(
      within(openActiveRow).queryByRole('button', { name: /Reassign case/ }),
    ).not.toBeInTheDocument();
  });

  it('reassigns a case to a different active assignee when clicked', async () => {
    renderWithQueryClient(<CaseListView />);

    const initialRow = (await screen.findByText('Conn and Sons')).closest(
      'tr',
    ) as HTMLElement;
    expect(within(initialRow).getByText('Willard Glover')).toBeInTheDocument();

    // scope the mock to just the click so it doesn't interfere with MSW's
    // own use of Math.random (e.g. internal request-id generation) during
    // the earlier fetch
    const randomSpy = vi.spyOn(Math, 'random').mockReturnValue(0);
    fireEvent.click(
      within(initialRow).getByRole('button', {
        name: 'Reassign case Conn and Sons',
      }),
    );
    randomSpy.mockRestore();

    // re-query rather than reusing `initialRow`: this row's own props change
    // as a result of the click (its highlight/button disappear), so we
    // shouldn't assume the same node identity survives the update
    const updatedRow = (await screen.findByText('Conn and Sons')).closest(
      'tr',
    ) as HTMLElement;
    expect(within(updatedRow).getByText('Miss Julie Veum')).toBeInTheDocument();
    expect(
      within(updatedRow).queryByText('Willard Glover'),
    ).not.toBeInTheDocument();
  });

  it('shows an error message if the cases request fails', async () => {
    server.use(http.get('/api/cases', () => HttpResponse.error()));

    renderWithQueryClient(<CaseListView />);

    expect(
      await screen.findByText(
        'Something went wrong loading cases. Please try again.',
      ),
    ).toBeInTheDocument();
  });
});
