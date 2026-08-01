import { useRef, useState } from 'react';
import { Badge, Box, Button, Checkbox, Flex, Label, Text } from 'theme-ui';
import { UsersApi, useOnClickOutside } from 'shared';

import { ALL_CASE_STATUSES } from '../utils/caseStatus';

interface CaseFiltersProps {
  users: UsersApi.User[];
  selectedAssigneeIds: string[];
  onAssigneeChange: (assigneeIds: string[]) => void;
  selectedStatuses: string[];
  onStatusChange: (statuses: string[]) => void;
  needsReassignmentOnly: boolean;
  onNeedsReassignmentOnlyChange: (value: boolean) => void;
}

const legendStyles = {
  variant: 'text.bold',
  fontSize: '12px',
  color: 'textSubtle',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.04em',
  p: 0,
  mb: 'spacing-xs',
};

// used by any section that sits below another one, to visually separate it
const sectionHeadingWithDividerStyles = {
  ...legendStyles,
  width: '100%',
  pb: 'spacing-xs',
  mb: 'spacing-xs',
  borderBottomWidth: 'border-width-sm',
  borderBottomStyle: 'solid' as const,
  borderBottomColor: 'borderLight',
};

const optionLabelStyles = {
  display: 'flex',
  alignItems: 'center',
  gap: 'spacing-xs',
  py: 'spacing-3xs',
  cursor: 'pointer',
};

const toggleId = (ids: string[], id: string): string[] =>
  ids.includes(id)
    ? ids.filter((existingId) => existingId !== id)
    : [...ids, id];

export const CaseFilters = ({
  users,
  selectedAssigneeIds,
  onAssigneeChange,
  selectedStatuses,
  onStatusChange,
  needsReassignmentOnly,
  onNeedsReassignmentOnlyChange,
}: CaseFiltersProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useOnClickOutside(containerRef, () => setIsOpen(false));

  const handleClearAll = () => {
    onAssigneeChange([]);
    onStatusChange([]);
    onNeedsReassignmentOnlyChange(false);
  };

  const activeFilterCount =
    selectedAssigneeIds.length +
    selectedStatuses.length +
    (needsReassignmentOnly ? 1 : 0);

  return (
    <Box ref={containerRef} sx={{ position: 'relative' }}>
      <Button
        type="button"
        variant="tertiary"
        aria-haspopup="true"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((open) => !open)}
        sx={{
          borderWidth: 'border-width-sm',
          borderStyle: 'solid',
          borderColor: 'inputBorder',
        }}
      >
        Filters{activeFilterCount > 0 ? ` (${activeFilterCount})` : ''}
      </Button>

      {isOpen && (
        <Box
          aria-label="Filters"
          sx={{
            position: 'absolute',
            right: 0,
            top: 'calc(100% + 4px)',
            display: 'flex',
            flexDirection: 'column',
            bg: 'white',
            borderWidth: 'border-width-sm',
            borderStyle: 'solid',
            borderColor: 'borderPanel',
            borderRadius: 'radius-md',
            boxShadow: 'shadow-sm',
            zIndex: 'inputModal',
            minWidth: '260px',
            maxHeight: '400px',
            overflow: 'visible',
          }}
        >
          <Box sx={{ flex: '1 1 auto', minHeight: 0, overflowY: 'auto' }}>
            <Box
              role="group"
              aria-labelledby="case-filters-quick-heading"
              sx={{ p: 'spacing-sm' }}
            >
              <Box id="case-filters-quick-heading" sx={legendStyles}>
                Quick filters
              </Box>
              <Label sx={optionLabelStyles}>
                <Checkbox
                  checked={needsReassignmentOnly}
                  onChange={(event) =>
                    onNeedsReassignmentOnlyChange(event.target.checked)
                  }
                />
                Needs reassignment
              </Label>
            </Box>

            <Box
              role="group"
              aria-labelledby="case-filters-assignee-heading"
              sx={{ p: 'spacing-sm', pt: 0 }}
            >
              <Box
                id="case-filters-assignee-heading"
                sx={sectionHeadingWithDividerStyles}
              >
                Assignee
              </Box>
              {users.map((user) => (
                <Label key={user.identifier} sx={optionLabelStyles}>
                  <Checkbox
                    checked={selectedAssigneeIds.includes(user.identifier)}
                    onChange={() =>
                      onAssigneeChange(
                        toggleId(selectedAssigneeIds, user.identifier),
                      )
                    }
                  />
                  {user.name}
                  {!user.active && (
                    <Badge variant="neutral" sx={{ fontSize: '12px' }}>
                      Inactive
                    </Badge>
                  )}
                </Label>
              ))}
            </Box>

            <Box
              role="group"
              aria-labelledby="case-filters-status-heading"
              sx={{ p: 'spacing-sm', pt: 0 }}
            >
              <Box
                id="case-filters-status-heading"
                sx={sectionHeadingWithDividerStyles}
              >
                Status
              </Box>
              {ALL_CASE_STATUSES.map((option) => (
                <Label key={option.status} sx={optionLabelStyles}>
                  <Checkbox
                    checked={selectedStatuses.includes(option.status)}
                    onChange={() =>
                      onStatusChange(toggleId(selectedStatuses, option.status))
                    }
                  />
                  {option.label}
                </Label>
              ))}
            </Box>
          </Box>

          <Flex
            sx={{
              flexShrink: 0,
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: 'spacing-sm',
              bg: 'bgPanel',
              borderTopWidth: 'border-width-sm',
              borderTopStyle: 'solid',
              borderTopColor: 'borderLight',
              px: 'spacing-sm',
              py: 'spacing-sm',
            }}
          >
            <Text sx={{ color: 'textMuted', fontSize: '12px' }}>
              {activeFilterCount} filter{activeFilterCount === 1 ? '' : 's'}{' '}
              applied
            </Text>
            <Button
              type="button"
              variant="outline"
              disabled={activeFilterCount === 0}
              onClick={handleClearAll}
              sx={{
                height: 'auto',
                minWidth: 'auto',
                fontSize: '12px',
                py: 'spacing-2xs',
                px: 'spacing-sm',
              }}
            >
              Clear all
            </Button>
          </Flex>
        </Box>
      )}
    </Box>
  );
};
