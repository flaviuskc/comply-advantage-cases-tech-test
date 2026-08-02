import { cases } from './cases';
import { users } from './users';
import { vi } from 'vitest';
import { casesHandler } from './handlers';
import { HttpResponse } from 'msw';

vi.mock('msw');
vi.mock('./cases', () => ({
  cases: new Array(50).fill(undefined).map((_, index) => ({
    identifier: `case-${index + 1}`,
    // even indexes -> active assignee, odd indexes -> inactive assignee
    assignee_id: index % 2 === 0 ? 'user-active' : 'user-inactive',
    // every 5th case is resolved (not reassignable), the rest are in progress
    status:
      index % 5 === 0 ? 'CASE_RESOLVED_NO_RISK_DETECTED' : 'CASE_IN_PROGRESS',
    name: `Case ${index + 1}`,
  })),
}));
vi.mock('./users', () => ({
  users: [
    { identifier: 'user-active', name: 'Active User', active: true },
    { identifier: 'user-inactive', name: 'Inactive User', active: false },
  ],
}));

describe('cases handler', () => {
  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('when there are 50 cases', () => {
    describe('when page is 1 and size is 20', () => {
      it('returns cases 1-20 and the total count across all pages', () => {
        const url = new URL(
          '/api/cases?page_number=1&page_size=20',
          'http://api.org/',
        );
        const request = new Request(url);

        casesHandler({ request });

        expect(HttpResponse.json).toHaveBeenCalledTimes(1);
        expect(HttpResponse.json).toHaveBeenCalledWith({
          cases: cases.slice(0, 20),
          first: '/api/cases?page_number=1',
          next: '/api/cases?page_number=2',
          prev: '',
          self: '/api/cases?page_number=1',
          total_count: 50,
        });
      });
    });

    describe('when page is 2 and size is 20', () => {
      it('returns cases 21-40', () => {
        const url = new URL(
          '/api/cases?page_number=2&page_size=20',
          'http://api.org/',
        );
        const request = new Request(url);

        casesHandler({ request });

        expect(HttpResponse.json).toHaveBeenCalledTimes(1);
        expect(HttpResponse.json).toHaveBeenCalledWith({
          cases: cases.slice(20, 40),
          first: '/api/cases?page_number=1',
          next: '/api/cases?page_number=3',
          prev: '/api/cases?page_number=1',
          self: '/api/cases?page_number=2',
          total_count: 50,
        });
      });
    });

    describe('when page is 3 and size is 20', () => {
      it('returns cases 41-50', () => {
        const url = new URL(
          '/api/cases?page_number=3&page_size=20',
          'http://api.org/',
        );
        const request = new Request(url);

        casesHandler({ request });

        expect(HttpResponse.json).toHaveBeenCalledTimes(1);
        expect(HttpResponse.json).toHaveBeenCalledWith({
          cases: cases.slice(40, 50),
          first: '/api/cases?page_number=1',
          next: '',
          prev: '/api/cases?page_number=2',
          self: '/api/cases?page_number=3',
          total_count: 50,
        });
      });
    });

    describe('when page is 5 and size is 10', () => {
      it('returns cases 41-50', () => {
        const url = new URL(
          '/api/cases?page_number=5&page_size=10',
          'http://api.org/',
        );
        const request = new Request(url);

        casesHandler({ request });

        expect(HttpResponse.json).toHaveBeenCalledTimes(1);
        expect(HttpResponse.json).toHaveBeenCalledWith({
          cases: cases.slice(40, 50),
          first: '/api/cases?page_number=1',
          next: '',
          prev: '/api/cases?page_number=4',
          self: '/api/cases?page_number=5',
          total_count: 50,
        });
      });
    });

    describe('when page is 1 and size is 50', () => {
      it('returns cases 1-50', () => {
        const url = new URL(
          '/api/cases?page_number=1&page_size=50',
          'http://api.org/',
        );
        const request = new Request(url);

        casesHandler({ request });

        expect(HttpResponse.json).toHaveBeenCalledTimes(1);
        expect(HttpResponse.json).toHaveBeenCalledWith({
          cases: cases.slice(0, 50),
          first: '/api/cases?page_number=1',
          next: '',
          prev: '',
          self: '/api/cases?page_number=1',
          total_count: 50,
        });
      });
    });

    describe('when page is 1 and size is 51', () => {
      it('returns cases 1-50', () => {
        const url = new URL(
          '/api/cases?page_number=1&page_size=51',
          'http://api.org/',
        );
        const request = new Request(url);

        casesHandler({ request });

        expect(HttpResponse.json).toHaveBeenCalledTimes(1);
        expect(HttpResponse.json).toHaveBeenCalledWith({
          cases: cases.slice(0, 50),
          first: '/api/cases?page_number=1',
          next: '',
          prev: '',
          self: '/api/cases?page_number=1',
          total_count: 50,
        });
      });
    });

    describe('when page number is beyond end of data', () => {
      it('returns no cases but still reports the true total count', () => {
        const url = new URL(
          '/api/cases?page_number=100&page_size=20',
          'http://api.org/',
        );
        const request = new Request(url);

        casesHandler({ request });

        expect(HttpResponse.json).toHaveBeenCalledTimes(1);
        expect(HttpResponse.json).toHaveBeenCalledWith({
          cases: [],
          first: '/api/cases?page_number=1',
          next: '',
          prev: '/api/cases?page_number=99',
          self: '/api/cases?page_number=100',
          total_count: 50,
        });
      });
    });

    describe('when params not provided', () => {
      it('defaults to page 1, size 25', () => {
        const url = new URL('/cases', 'http://api.org/');
        const request = new Request(url);

        casesHandler({ request });

        expect(HttpResponse.json).toHaveBeenCalledTimes(1);
        expect(HttpResponse.json).toHaveBeenCalledWith({
          cases: cases.slice(0, 25),
          first: '/api/cases?page_number=1',
          next: '/api/cases?page_number=2',
          prev: '',
          self: '/api/cases?page_number=1',
          total_count: 50,
        });
      });
    });
  });

  describe('filtering', () => {
    describe('by assignee_id', () => {
      it('returns only cases assigned to the given user(s)', () => {
        const url = new URL(
          '/api/cases?page_number=1&page_size=50&assignee_id=user-active',
          'http://api.org/',
        );
        const request = new Request(url);

        casesHandler({ request });

        const result = vi.mocked(HttpResponse.json).mock.calls[0][0] as {
          cases: (typeof cases)[number][];
          total_count: number;
        };

        expect(result.cases.every((c) => c.assignee_id === 'user-active')).toBe(
          true,
        );
        expect(result.total_count).toBe(25);
      });
    });

    describe('by status', () => {
      it('returns only cases with the given status(es)', () => {
        const url = new URL(
          '/api/cases?page_number=1&page_size=50&status=CASE_RESOLVED_NO_RISK_DETECTED',
          'http://api.org/',
        );
        const request = new Request(url);

        casesHandler({ request });

        const result = vi.mocked(HttpResponse.json).mock.calls[0][0] as {
          cases: (typeof cases)[number][];
          total_count: number;
        };

        expect(
          result.cases.every(
            (c) => c.status === 'CASE_RESOLVED_NO_RISK_DETECTED',
          ),
        ).toBe(true);
        expect(result.total_count).toBe(10);
      });
    });

    describe('by search', () => {
      it('matches case names case-insensitively', () => {
        const url = new URL(
          '/api/cases?page_number=1&page_size=50&search=case+1',
          'http://api.org/',
        );
        const request = new Request(url);

        casesHandler({ request });

        const result = vi.mocked(HttpResponse.json).mock.calls[0][0] as {
          cases: (typeof cases)[number][];
          total_count: number;
        };

        // "Case 1", "Case 10"-"Case 19" all contain "case 1"
        expect(result.total_count).toBe(11);
      });
    });

    describe('by needs_reassignment', () => {
      it('returns only reassignable cases with an inactive assignee', () => {
        const url = new URL(
          '/api/cases?page_number=1&page_size=50&needs_reassignment=true',
          'http://api.org/',
        );
        const request = new Request(url);

        casesHandler({ request });

        const result = vi.mocked(HttpResponse.json).mock.calls[0][0] as {
          cases: (typeof cases)[number][];
          total_count: number;
        };

        const inactiveUserIds = new Set(
          users.filter((user) => !user.active).map((user) => user.identifier),
        );
        expect(
          result.cases.every(
            (c) =>
              inactiveUserIds.has(c.assignee_id) &&
              c.status !== 'CASE_RESOLVED_NO_RISK_DETECTED',
          ),
        ).toBe(true);
        // odd indexes (0-based) are inactive-assigned; of those, every 5th
        // (0-based index 5, 15, 25, 35, 45) is resolved and excluded
        expect(result.total_count).toBe(20);
      });
    });

    describe('combining multiple filters', () => {
      it('applies assignee, status and search together', () => {
        const url = new URL(
          '/api/cases?page_number=1&page_size=50&assignee_id=user-active&status=CASE_IN_PROGRESS&search=case',
          'http://api.org/',
        );
        const request = new Request(url);

        casesHandler({ request });

        const result = vi.mocked(HttpResponse.json).mock.calls[0][0] as {
          cases: (typeof cases)[number][];
          total_count: number;
        };

        expect(
          result.cases.every(
            (c) =>
              c.assignee_id === 'user-active' &&
              c.status === 'CASE_IN_PROGRESS',
          ),
        ).toBe(true);
      });
    });
  });
});
