import { keepPreviousData, useQuery } from '@tanstack/react-query';

import fetchTyped from '../../utils/fetchTyped';
import { GetCasesResponse } from './types';

export interface UseGetCasesQueryParams {
  pageNumber?: number;
  pageSize?: number;
  assigneeIds?: string[];
  statuses?: string[];
  search?: string;
  needsReassignmentOnly?: boolean;
}

export const useGetCasesQuery = ({
  pageNumber = 1,
  pageSize = 25,
  assigneeIds = [],
  statuses = [],
  search = '',
  needsReassignmentOnly = false,
}: UseGetCasesQueryParams = {}) => {
  return useQuery({
    queryKey: [
      'cases',
      pageNumber,
      pageSize,
      assigneeIds,
      statuses,
      search,
      needsReassignmentOnly,
    ],
    queryFn: () => {
      const params = new URLSearchParams();
      params.set('page_number', String(pageNumber));
      params.set('page_size', String(pageSize));
      assigneeIds.forEach((id) => params.append('assignee_id', id));
      statuses.forEach((status) => params.append('status', status));
      if (search) {
        params.set('search', search);
      }
      if (needsReassignmentOnly) {
        params.set('needs_reassignment', 'true');
      }
      return fetchTyped<GetCasesResponse>(`/api/cases?${params}`, {});
    },
    // keep the previous page/filter's results on screen while a new
    // request is in flight, instead of collapsing to a loading state
    placeholderData: keepPreviousData,
  });
};
