import { useMemo, useState } from 'react';
import { Alert, Box, Button, Flex, Heading, Text } from 'theme-ui';
import { CasesApi, UsersApi } from 'shared';

import { CaseFilters } from './components/CaseFilters';
import { CasesTable } from './components/CasesTable';
import { isReassignableStatus } from './utils/caseStatus';

const PAGE_SIZE = 10;

/*
 * The /api/cases mock endpoint has no assignee filter param (see
 * packages/shared/src/mockApi/handlers.ts) and the mock dataset is small
 * (200 records), so we fetch it all in one request and do filtering +
 * pagination client-side to keep results consistent across pages.
 */
const FETCH_ALL_PAGE_SIZE = 500;

// stable references so `?? EMPTY_*` doesn't create a new array identity on
// every render while a query has no data yet, which would otherwise defeat
// the useMemo calls below
const EMPTY_USERS: UsersApi.User[] = [];
const EMPTY_CASES: CasesApi.Case[] = [];

const pickRandomActiveAssignee = (
  users: UsersApi.User[],
  excludeUserId: string,
): UsersApi.User | undefined => {
  const candidates = users.filter(
    (user) => user.active && user.identifier !== excludeUserId,
  );
  if (candidates.length === 0) {
    return undefined;
  }
  return candidates[Math.floor(Math.random() * candidates.length)];
};

// Shared by the "needs reassignment" filter and the banner's count, so the
// two can never disagree about which cases qualify.
const needsReassignment = (
  caseItem: CasesApi.Case,
  usersById: Map<string, UsersApi.User>,
): boolean => {
  const assignee = usersById.get(caseItem.assignee_id);
  return (
    isReassignableStatus(caseItem.status) && !!assignee && !assignee.active
  );
};

export const CaseListView = () => {
  const [selectedAssigneeIds, setSelectedAssigneeIds] = useState<string[]>([]);
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [needsReassignmentOnly, setNeedsReassignmentOnly] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isBannerDismissed, setIsBannerDismissed] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  // Purely client-side simulation of reassignment - there's no write API for
  // this, so we keep case-id -> new-assignee-id overrides in local state and
  // layer them on top of whatever the query returns.
  const [reassignments, setReassignments] = useState<Record<string, string>>(
    {},
  );

  const casesQuery = CasesApi.useGetCasesQuery({
    pageSize: FETCH_ALL_PAGE_SIZE,
  });
  const usersQuery = UsersApi.useGetUsersQuery();

  const users = usersQuery.data ?? EMPTY_USERS;
  const allCases = casesQuery.data?.cases ?? EMPTY_CASES;

  const usersById = useMemo(
    () => new Map(users.map((user) => [user.identifier, user])),
    [users],
  );

  const casesWithOverrides = useMemo(
    () =>
      allCases.map((caseItem) => {
        const overrideAssigneeId = reassignments[caseItem.identifier];
        return overrideAssigneeId
          ? { ...caseItem, assignee_id: overrideAssigneeId }
          : caseItem;
      }),
    [allCases, reassignments],
  );

  const needsReassignmentCount = useMemo(
    () =>
      casesWithOverrides.filter((caseItem) =>
        needsReassignment(caseItem, usersById),
      ).length,
    [casesWithOverrides, usersById],
  );

  const filteredCases = useMemo(() => {
    const selectedAssigneeSet = new Set(selectedAssigneeIds);
    const selectedStatusSet = new Set(selectedStatuses);
    const query = searchQuery.trim().toLowerCase();
    return casesWithOverrides.filter((caseItem) => {
      if (
        selectedAssigneeSet.size > 0 &&
        !selectedAssigneeSet.has(caseItem.assignee_id)
      ) {
        return false;
      }
      if (
        selectedStatusSet.size > 0 &&
        !selectedStatusSet.has(caseItem.status)
      ) {
        return false;
      }
      if (needsReassignmentOnly && !needsReassignment(caseItem, usersById)) {
        return false;
      }
      if (query && !caseItem.name.toLowerCase().includes(query)) {
        return false;
      }
      return true;
    });
  }, [
    casesWithOverrides,
    selectedAssigneeIds,
    selectedStatuses,
    needsReassignmentOnly,
    searchQuery,
    usersById,
  ]);

  const totalCount = filteredCases.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));
  const safePage = Math.min(currentPage, totalPages);
  const pagedCases = filteredCases.slice(
    (safePage - 1) * PAGE_SIZE,
    safePage * PAGE_SIZE,
  );
  const rangeStart = totalCount === 0 ? 0 : (safePage - 1) * PAGE_SIZE + 1;
  const rangeEnd = Math.min(safePage * PAGE_SIZE, totalCount);

  const handleAssigneeFilterChange = (assigneeIds: string[]) => {
    setSelectedAssigneeIds(assigneeIds);
    setCurrentPage(1);
  };

  const handleStatusFilterChange = (statuses: string[]) => {
    setSelectedStatuses(statuses);
    setCurrentPage(1);
  };

  const handleNeedsReassignmentOnlyChange = (value: boolean) => {
    setNeedsReassignmentOnly(value);
    setCurrentPage(1);
  };

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setCurrentPage(1);
  };

  const handleReassign = (caseId: string, currentAssigneeId: string) => {
    const newAssignee = pickRandomActiveAssignee(users, currentAssigneeId);
    if (!newAssignee) {
      return;
    }
    setReassignments((prev) => ({ ...prev, [caseId]: newAssignee.identifier }));
  };

  const isLoading = casesQuery.isLoading || usersQuery.isLoading;
  const isError = casesQuery.isError || usersQuery.isError;
  const showReassignmentBanner =
    needsReassignmentCount > 0 && !isBannerDismissed;

  return (
    <Box>
      <Heading sx={{ fontSize: '32px', fontWeight: 'font-weight-bold' }}>
        Cases
      </Heading>

      <Flex
        sx={{
          alignItems: 'center',
          gap: 'spacing-md',
          mt: 'spacing-md',
          mb: 'spacing-md',
        }}
      >
        <input
          type="text"
          placeholder="Search cases"
          aria-label="Search cases"
          value={searchQuery}
          onChange={(event) => handleSearchChange(event.target.value)}
          sx={{
            width: '260px',
            fontSize: 'font-size-md',
            fontFamily: 'body',
            color: 'neutral900',
            bg: 'white',
            borderWidth: 'border-width-sm',
            borderStyle: 'solid',
            borderColor: 'inputBorder',
            borderRadius: 'radius-full',
            py: 'spacing-xs',
            px: 'spacing-md',
            '&::placeholder': {
              color: 'inputTextPlaceholder',
            },
          }}
        />
        <CaseFilters
          users={users}
          selectedAssigneeIds={selectedAssigneeIds}
          onAssigneeChange={handleAssigneeFilterChange}
          selectedStatuses={selectedStatuses}
          onStatusChange={handleStatusFilterChange}
          needsReassignmentOnly={needsReassignmentOnly}
          onNeedsReassignmentOnlyChange={handleNeedsReassignmentOnlyChange}
        />
      </Flex>

      {showReassignmentBanner && (
        <Alert variant="banner" sx={{ mb: 'spacing-md' }}>
          <Text>
            <Text as="span" sx={{ fontWeight: 'font-weight-semi-bold' }}>
              {needsReassignmentCount} cases
            </Text>{' '}
            are assigned to inactive users.
          </Text>
          <Flex sx={{ alignItems: 'center', gap: 'spacing-md' }}>
            <Button
              type="button"
              variant="primary"
              onClick={() => handleNeedsReassignmentOnlyChange(true)}
              sx={{
                flexShrink: 0,
                height: 'auto',
                lineHeight: 'body',
                fontSize: '14px',
                py: 'spacing-xs',
                px: 'spacing-md',
              }}
            >
              Show these cases
            </Button>
            <Button
              type="button"
              onClick={() => setIsBannerDismissed(true)}
              sx={{
                variant: 'text.default',
                color: 'textSubtle',
                textDecoration: 'underline',
                bg: 'transparent',
                border: 'none',
                borderRadius: 0,
                fontWeight: 'font-weight-normal',
                cursor: 'pointer',
                p: 0,
                height: 'auto',
                minWidth: 'auto',
                '&:hover, &:focus-visible': {
                  bg: 'transparent',
                },
              }}
            >
              Dismiss
            </Button>
          </Flex>
        </Alert>
      )}

      {isLoading && <Text>Loading cases...</Text>}
      {isError && (
        <Text sx={{ color: 'textNegative' }}>
          Something went wrong loading cases. Please try again.
        </Text>
      )}

      {!isLoading && !isError && (
        <CasesTable
          cases={pagedCases}
          usersById={usersById}
          onReassign={handleReassign}
          currentPage={safePage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          totalCount={totalCount}
          rangeStart={rangeStart}
          rangeEnd={rangeEnd}
        />
      )}
    </Box>
  );
};
