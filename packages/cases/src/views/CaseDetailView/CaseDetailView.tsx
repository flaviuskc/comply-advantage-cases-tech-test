import { Link, useParams } from 'react-router-dom';
import { Badge, Box, Flex, Heading, Text } from 'theme-ui';
import { CasesApi } from 'shared';

import { getCaseStatusConfig } from '../CaseListView/utils/caseStatus';

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

  const caseQuery = CasesApi.useGetCaseByIdQuery(caseId);

  const isLoading = caseQuery.isLoading;
  const isError = caseQuery.isError;
  const caseItem = caseQuery.data?.case;
  const assignee = caseQuery.data?.assignee;
  const statusConfig = caseItem && getCaseStatusConfig(caseItem.status);

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
            {statusConfig && (
              <Badge variant={statusConfig.badgeVariant}>
                {statusConfig.label}
              </Badge>
            )}
          </Box>

          <Box sx={{ mt: 'spacing-lg' }}>
            <Box sx={fieldLabelStyles}>Assignee</Box>
            <Text>{assignee ? assignee.name : 'Unassigned'}</Text>
            {assignee && !assignee.active && (
              <Text sx={{ color: 'textMuted', fontSize: '12px', display: 'flex', alignItems: 'center' }}>
                Inactive user
              </Text>
            )}
          </Box>
        </Box>
      )}
    </Box>
  );
};
