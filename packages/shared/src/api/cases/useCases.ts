import { useQuery } from '@tanstack/react-query';

import fetchTyped from '../../utils/fetchTyped';
import { GetCasesResponse } from './types';

export interface UseGetCasesQueryParams {
  pageNumber?: number;
  pageSize?: number;
}

export const useGetCasesQuery = ({
  pageNumber = 1,
  pageSize = 25,
}: UseGetCasesQueryParams = {}) => {
  return useQuery({
    queryKey: ['cases', pageNumber, pageSize],
    queryFn: () =>
      fetchTyped<GetCasesResponse>(
        `/api/cases?page_number=${pageNumber}&page_size=${pageSize}`,
        {},
      ),
  });
};
