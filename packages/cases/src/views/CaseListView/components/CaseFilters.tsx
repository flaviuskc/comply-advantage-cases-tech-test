import { useRef, useState } from 'react';
import { Box, Button, Checkbox, Label, Text } from 'theme-ui';
import { UsersApi, useOnClickOutside } from 'shared';

interface CaseFiltersProps {
  users: UsersApi.User[];
  selectedAssigneeIds: string[];
  onAssigneeChange: (assigneeIds: string[]) => void;
  needsReassignmentOnly: boolean;
  onNeedsReassignmentOnlyChange: (value: boolean) => void;
}

const fieldsetStyles = {
  border: 'none',
  p: 0,
  m: 0,
  '& + &': {
    mt: 'spacing-sm',
    pt: 'spacing-sm',
    borderTopWidth: 'border-width-sm',
    borderTopStyle: 'solid',
    borderTopColor: 'borderLight',
  },
};

const legendStyles = {
  variant: 'text.bold',
  fontSize: '12px',
  color: 'textSubtle',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.04em',
  p: 0,
  mb: 'spacing-xs',
};

const optionLabelStyles = {
  display: 'flex',
  alignItems: 'center',
  gap: 'spacing-xs',
  py: 'spacing-3xs',
  cursor: 'pointer',
};

export const CaseFilters = ({
  users,
  selectedAssigneeIds,
  onAssigneeChange,
  needsReassignmentOnly,
  onNeedsReassignmentOnlyChange,
}: CaseFiltersProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useOnClickOutside(containerRef, () => setIsOpen(false));

  const toggleAssignee = (assigneeId: string) => {
    const isSelected = selectedAssigneeIds.includes(assigneeId);
    onAssigneeChange(
      isSelected
        ? selectedAssigneeIds.filter((id) => id !== assigneeId)
        : [...selectedAssigneeIds, assigneeId],
    );
  };

  const activeFilterCount =
    selectedAssigneeIds.length + (needsReassignmentOnly ? 1 : 0);

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
            bg: 'white',
            borderWidth: 'border-width-sm',
            borderStyle: 'solid',
            borderColor: 'borderPanel',
            borderRadius: 'radius-md',
            boxShadow: 'shadow-sm',
            zIndex: 'inputModal',
            minWidth: '260px',
            maxHeight: '360px',
            overflowY: 'auto',
            p: 'spacing-sm',
          }}
        >
          <Box as="fieldset" sx={fieldsetStyles}>
            <Box as="legend" sx={legendStyles}>
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

          <Box as="fieldset" sx={fieldsetStyles}>
            <Box as="legend" sx={legendStyles}>
              Assignee
            </Box>
            {users.map((user) => (
              <Label key={user.identifier} sx={optionLabelStyles}>
                <Checkbox
                  checked={selectedAssigneeIds.includes(user.identifier)}
                  onChange={() => toggleAssignee(user.identifier)}
                />
                {user.name}
                {!user.active && (
                  <Text sx={{ color: 'textMuted', fontSize: '12px' }}>
                    (Inactive)
                  </Text>
                )}
              </Label>
            ))}
          </Box>
        </Box>
      )}
    </Box>
  );
};
