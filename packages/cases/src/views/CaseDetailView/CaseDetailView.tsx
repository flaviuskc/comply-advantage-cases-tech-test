import { Link, useParams } from 'react-router-dom';
import { Badge, Box, Flex, Heading, Text } from 'theme-ui';
import { CasesApi, UsersApi } from 'shared';

import { getCaseStatusConfig } from '../CaseListView/utils/caseStatus';

// The mock API has no single-case endpoint (see packages/shared/src/mockApi/handlers.ts),
// so we fetch the same full page CaseListView does and find the case client-side.
const FETCH_ALL_PAGE_SIZE = 500;

const fieldLabelStyles = {
  variant: 'text.bold',
  fontSize: '12px',
  color: 'textSubtle',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.04em',
  mb: 'spacing-xs',
};

export const CaseDetailView = () => {
  const { caseId } = useParams<{ caseId: string }>();

  const casesQuery = CasesApi.useGetCasesQuery({
    pageSize: FETCH_ALL_PAGE_SIZE,
  });
  const usersQuery = UsersApi.useGetUsersQuery();

  const isLoading = casesQuery.isLoading || usersQuery.isLoading;
  const isError = casesQuery.isError || usersQuery.isError;

  const caseItem = casesQuery.data?.cases.find(
    (candidate) => candidate.identifier === caseId,
  );
  const assignee = usersQuery.data?.find(
    (user) => user.identifier === caseItem?.assignee_id,
  );

  return (
    <Box>
      <Link
        to="/cases"
        sx={{
          variant: 'buttons.outline',
          display: 'inline-block',
          px: 'spacing-md',
          py: 'spacing-xs',
          textDecoration: 'none',
        }}
      >
        Back to cases
      </Link>

      {(isLoading || isError || !caseItem) && (
        <Flex sx={{ flexDirection: 'column', mt: 'spacing-md' }}>
          {isLoading && <Text>Loading case...</Text>}
          {isError && (
            <Text sx={{ color: 'textNegative' }}>
              Something went wrong loading this case. Please try again.
            </Text>
          )}
          {!isLoading && !isError && !caseItem && <Text>Case not found.</Text>}
        </Flex>
      )}

      {caseItem && (
        <Box
          sx={{
            mt: 'spacing-md',
            bg: 'white',
            borderWidth: 'border-width-sm',
            borderStyle: 'solid',
            borderColor: 'borderLight',
            borderRadius: 'radius-md',
            p: 'spacing-lg',
          }}
        >
          <Heading sx={{ fontSize: '24px', fontWeight: 'font-weight-bold' }}>
            {caseItem.name}
          </Heading>

          <Box sx={{ mt: 'spacing-lg' }}>
            <Box sx={fieldLabelStyles}>Status</Box>
            <Badge variant={getCaseStatusConfig(caseItem.status).badgeVariant}>
              {getCaseStatusConfig(caseItem.status).label}
            </Badge>
          </Box>

          <Box sx={{ mt: 'spacing-lg' }}>
            <Box sx={fieldLabelStyles}>Assignee</Box>
            <Text>{assignee ? assignee.name : 'Unassigned'}</Text>
          </Box>
        </Box>
      )}
    </Box>
  );
};
