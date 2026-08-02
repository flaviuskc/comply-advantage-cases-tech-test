import { useEffect, useMemo, useState } from 'react';
import { Alert, Box, Button, Flex, Heading, Text } from 'theme-ui';
import { CasesApi, UsersApi, useDebouncedValue } from 'shared';

import { CaseFilters } from './components/CaseFilters';
import { CasesTable } from './components/CasesTable';

const PAGE_SIZE = 10;
const SEARCH_DEBOUNCE_MS = 300;

// stable reference so `?? EMPTY_USERS` doesn't create a new array identity
// on every render while the query has no data yet
const EMPTY_USERS: UsersApi.User[] = [];

export const CaseListView = () => {
  const [selectedAssigneeIds, setSelectedAssigneeIds] = useState<string[]>([]);
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [needsReassignmentOnly, setNeedsReassignmentOnly] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isBannerDismissed, setIsBannerDismissed] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const debouncedSearchQuery = useDebouncedValue(
    searchQuery,
    SEARCH_DEBOUNCE_MS,
  );

  // reset back to page 1 once a debounced search actually takes effect,
  // rather than on every keystroke (which would also fire a page=1 request
  // using the not-yet-debounced search term)
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchQuery]);

  const casesQuery = CasesApi.useGetCasesQuery({
    pageNumber: currentPage,
    pageSize: PAGE_SIZE,
    assigneeIds: selectedAssigneeIds,
    statuses: selectedStatuses,
    search: debouncedSearchQuery,
    needsReassignmentOnly,
  });
  // The reassignment banner's count is independent of the current filters/
  // page, so it's a separate lightweight request (page_size=1 - we only
  // need `total_count`) rather than derived from the main query's data.
  const needsReassignmentCountQuery = CasesApi.useGetCasesQuery({
    pageSize: 1,
    needsReassignmentOnly: true,
  });
  const usersQuery = UsersApi.useGetUsersQuery();

  const users = usersQuery.data ?? EMPTY_USERS;

  const usersById = useMemo(
    () => new Map(users.map((user) => [user.identifier, user])),
    [users],
  );

  const cases = casesQuery.data?.cases ?? [];
  const totalCount = casesQuery.data?.total_count ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));
  const rangeStart = totalCount === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1;
  const rangeEnd = Math.min(currentPage * PAGE_SIZE, totalCount);
  const needsReassignmentCount =
    needsReassignmentCountQuery.data?.total_count ?? 0;

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

  const handleReassign = (caseId: string, currentAssigneeId: string) => {
    // There's no write endpoint for this in the mock API - reassignment is
    // out of scope for this exercise, so this is intentionally a no-op
    // beyond logging the action that would be sent to a real backend.
    console.log(
      'Reassign case',
      caseId,
      'away from assignee',
      currentAssigneeId,
    );
  };

  const CloseIcon = () => (
    <svg
      width={12}
      height={12}
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable={false}
    >
      <path d="M3 3l10 10M13 3 3 13" />
    </svg>
  );

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
          onChange={(event) => setSearchQuery(event.target.value)}
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
              <CloseIcon />
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
          cases={cases}
          usersById={usersById}
          onReassign={handleReassign}
          currentPage={currentPage}
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
