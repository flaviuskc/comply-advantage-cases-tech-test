import { http, HttpResponse, StrictRequest, DefaultBodyType } from 'msw';
import example from './example.json';
import { users } from './users';
import { cases } from './cases';

import { GetCasesResponse } from '../api/cases/types';
import { GetUsersResponse } from '../api/users/types';
import { isReassignableCaseStatus } from '../utils/caseStatus';

export const casesHandler = ({
  request,
}: {
  request: StrictRequest<DefaultBodyType>;
}) => {
  const url = new URL(request.url);

  const page_size = url.searchParams.get('page_size');
  const page_number = url.searchParams.get('page_number');
  const assigneeIds = url.searchParams.getAll('assignee_id');
  const statuses = url.searchParams.getAll('status');
  const search = url.searchParams.get('search')?.trim().toLowerCase() ?? '';
  const needsReassignmentOnly =
    url.searchParams.get('needs_reassignment') === 'true';

  const page = parseInt(page_number as string, 10) || 1;
  const size = parseInt(page_size as string, 10) || 25;

  const usersById = new Map(users.map((user) => [user.identifier, user]));

  const filteredCases = cases.filter((caseItem) => {
    if (assigneeIds.length > 0 && !assigneeIds.includes(caseItem.assignee_id)) {
      return false;
    }
    if (statuses.length > 0 && !statuses.includes(caseItem.status)) {
      return false;
    }
    if (search && !caseItem.name.toLowerCase().includes(search)) {
      return false;
    }
    if (needsReassignmentOnly) {
      const assignee = usersById.get(caseItem.assignee_id);
      if (
        !isReassignableCaseStatus(caseItem.status) ||
        !assignee ||
        assignee.active
      ) {
        return false;
      }
    }
    return true;
  });

  const start = (page - 1) * size;
  const end = start + size;
  const casesArray = filteredCases.slice(start, end);
  const hasNext = end < filteredCases.length;

  return HttpResponse.json({
    cases: casesArray,
    total_count: filteredCases.length,
    first: '/api/cases?page_number=1',
    next: hasNext ? `/api/cases?page_number=${page + 1}` : '',
    prev: page > 1 ? `/api/cases?page_number=${page - 1}` : '',
    self: `/api/cases?page_number=${page}`,
  } as GetCasesResponse);
};

export const apiHandlers = [
  http.get('/api/example', () => {
    return HttpResponse.json(example);
  }),

  http.get('/api/users', () => {
    return HttpResponse.json(users as GetUsersResponse);
  }),

  http.get('/api/cases', casesHandler),
];
