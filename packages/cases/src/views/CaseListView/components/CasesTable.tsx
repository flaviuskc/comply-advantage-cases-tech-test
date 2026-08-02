import { useNavigate } from 'react-router-dom';
import { Badge, Box, Button } from 'theme-ui';
import { CasesApi, UsersApi } from 'shared';

import { getCaseStatusConfig, isReassignableStatus } from '../utils/caseStatus';
import { Pagination } from './Pagination';

interface CasesTableProps {
  cases: CasesApi.Case[];
  usersById: Map<string, UsersApi.User>;
  onReassign: (caseId: string, currentAssigneeId: string) => void;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  totalCount: number;
  rangeStart: number;
  rangeEnd: number;
}

const cellStyles = {
  textAlign: 'left' as const,
  px: 'spacing-md',
  py: 'spacing-sm',
  borderBottomWidth: 'border-width-sm',
  borderBottomStyle: 'solid' as const,
  borderBottomColor: 'borderLight',
};

export const CasesTable = ({
  cases,
  usersById,
  onReassign,
  currentPage,
  totalPages,
  onPageChange,
  totalCount,
  rangeStart,
  rangeEnd,
}: CasesTableProps) => {
  const navigate = useNavigate();

  if (cases.length === 0) {
    return (
      <Box sx={{ py: 'spacing-xl', textAlign: 'center', color: 'textMuted' }}>
        No cases match the selected filters.
      </Box>
    );
  }

  return (
    <Box sx={{ borderRadius: 'radius-md', overflow: 'hidden' }}>
      <Box
        as="table"
        sx={{
          width: '100%',
          borderCollapse: 'collapse',
          bg: 'white',
        }}
      >
        <Box as="thead">
          <Box as="tr">
            <Box
              as="th"
              sx={{ ...cellStyles, variant: 'text.bold', bg: 'bgPanel' }}
            >
              Name
            </Box>
            <Box
              as="th"
              sx={{ ...cellStyles, variant: 'text.bold', bg: 'bgPanel' }}
            >
              Status
            </Box>
            <Box
              as="th"
              sx={{ ...cellStyles, variant: 'text.bold', bg: 'bgPanel' }}
            >
              Assignee
            </Box>
          </Box>
        </Box>
        <Box as="tbody">
          {cases.map((caseItem) => {
            const assignee = usersById.get(caseItem.assignee_id);
            const statusConfig = getCaseStatusConfig(caseItem.status);
            const isAssigneeInactive = !!assignee && !assignee.active;
            const canReassign =
              isAssigneeInactive && isReassignableStatus(caseItem.status);

            const goToDetail = () => navigate(`/cases/${caseItem.identifier}`);

            return (
              <Box
                as="tr"
                key={caseItem.identifier}
                tabIndex={0}
                role="link"
                aria-label={`View case ${caseItem.name}`}
                onClick={goToDetail}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    goToDetail();
                  }
                }}
                sx={{
                  cursor: 'pointer',
                  bg: canReassign ? 'brand100' : undefined,
                  '&:hover': {
                    bg: canReassign ? 'brand100' : 'bgPanel',
                  },
                  '&:hover [data-reassign-button], &:focus-within [data-reassign-button]':
                    {
                      opacity: 1,
                    },
                }}
              >
                <Box as="td" sx={cellStyles}>
                  {caseItem.name}
                </Box>
                <Box as="td" sx={cellStyles}>
                  <Badge variant={statusConfig.badgeVariant}>
                    {statusConfig.label}
                  </Badge>
                </Box>
                <Box as="td" sx={cellStyles}>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <Box>
                      <Box
                        as="span"
                        sx={{
                          color: isAssigneeInactive ? 'textMuted' : 'textBase',
                        }}
                      >
                        {assignee ? assignee.name : 'Unassigned'}
                      </Box>
                      {isAssigneeInactive && (
                        <Box
                          sx={{
                            fontSize: '12px',
                            color: 'textMuted',
                          }}
                        >
                          Inactive user
                        </Box>
                      )}
                    </Box>
                    {canReassign && (
                      <Button
                        type="button"
                        variant="outline"
                        data-reassign-button
                        aria-label={`Reassign case ${caseItem.name}`}
                        onClick={(event) => {
                          event.stopPropagation();
                          onReassign(caseItem.identifier, caseItem.assignee_id);
                        }}
                        sx={{
                          flexShrink: 0,
                          height: 'auto',
                          lineHeight: 'body',
                          fontSize: '12px',
                          py: 'spacing-2xs',
                          px: 'spacing-sm',
                          opacity: 0,
                          transition: 'opacity 150ms ease-in-out',
                          '&:focus-visible': {
                            opacity: 1,
                          },
                        }}
                      >
                        Reassign
                      </Button>
                    )}
                  </Box>
                </Box>
              </Box>
            );
          })}
        </Box>
      </Box>
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={onPageChange}
        totalCount={totalCount}
        rangeStart={rangeStart}
        rangeEnd={rangeEnd}
      />
    </Box>
  );
};
