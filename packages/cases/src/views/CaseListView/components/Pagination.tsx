import { useEffect, useState } from 'react';
import { Box, Button, Flex, Text } from 'theme-ui';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  totalCount: number;
  rangeStart: number;
  rangeEnd: number;
}

const iconProps = {
  width: 16,
  height: 16,
  viewBox: '0 0 16 16',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.5,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  'aria-hidden': true,
  focusable: false,
};

const ChevronLeftIcon = () => (
  <svg {...iconProps}>
    <path d="M10 3 5 8l5 5" />
  </svg>
);

const ChevronsLeftIcon = () => (
  <svg {...iconProps}>
    <path d="M11 3 6 8l5 5" />
    <path d="M7 3 2 8l5 5" />
  </svg>
);

const ChevronRightIcon = () => (
  <svg {...iconProps}>
    <path d="M6 3l5 5-5 5" />
  </svg>
);

const ChevronsRightIcon = () => (
  <svg {...iconProps}>
    <path d="M5 3l5 5-5 5" />
    <path d="M9 3l5 5-5 5" />
  </svg>
);

// the shared `icon` button variant inherits button-height/px-lg from
// getCommonButtonStyles (sized for text buttons) - overridden locally
// rather than in the shared variant, since other consumers of `icon` may
// rely on that sizing
const iconButtonStyles = {
  height: 'auto',
  minWidth: 'auto',
  px: 'spacing-2xs',
  py: 'spacing-2xs',
};

export const Pagination = ({
  currentPage,
  totalPages,
  onPageChange,
  totalCount,
  rangeStart,
  rangeEnd,
}: PaginationProps) => {
  const [inputValue, setInputValue] = useState(String(currentPage));

  // keep the input in sync when the page changes from elsewhere (Prev/Next/
  // First/Last buttons), but not while the user is actively typing a value
  // we haven't committed yet
  useEffect(() => {
    setInputValue(String(currentPage));
  }, [currentPage]);

  const isFirstPage = currentPage === 1;
  const isLastPage = currentPage === totalPages;

  const commitPageInput = () => {
    const parsed = parseInt(inputValue, 10);
    const clamped = Number.isNaN(parsed)
      ? currentPage
      : Math.min(Math.max(parsed, 1), totalPages);

    setInputValue(String(clamped));
    if (clamped !== currentPage) {
      onPageChange(clamped);
    }
  };

  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: '1fr auto 1fr',
        alignItems: 'center',
        gap: 'spacing-sm',
        bg: 'bgPanel',
        px: 'spacing-md',
        py: 'spacing-sm',
      }}
    >
      <Text sx={{ color: 'textMuted' }}>
        Showing{' '}
        <Text
          as="span"
          sx={{ fontWeight: 'font-weight-semi-bold', color: 'textBase' }}
        >
          {rangeStart}&ndash;{rangeEnd}
        </Text>{' '}
        of {totalCount} cases
      </Text>

      <Flex sx={{ alignItems: 'center', gap: 'spacing-2xs' }}>
        <Button
          type="button"
          variant="icon"
          aria-label="First page"
          disabled={isFirstPage}
          aria-disabled={isFirstPage}
          onClick={() => onPageChange(1)}
          sx={iconButtonStyles}
        >
          <ChevronsLeftIcon />
        </Button>
        <Button
          type="button"
          variant="icon"
          aria-label="Previous page"
          disabled={isFirstPage}
          aria-disabled={isFirstPage}
          onClick={() => onPageChange(currentPage - 1)}
          sx={iconButtonStyles}
        >
          <ChevronLeftIcon />
        </Button>
        <Flex sx={{ alignItems: 'center', gap: 'spacing-2xs' }}>
          <Text>Page</Text>
          <input
            type="text"
            inputMode="numeric"
            aria-label="Page number"
            value={inputValue}
            onChange={(event) => setInputValue(event.target.value)}
            onBlur={commitPageInput}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.preventDefault();
                commitPageInput();
              }
            }}
            sx={{
              width: '40px',
              textAlign: 'center',
              fontSize: 'font-size-md',
              fontFamily: 'body',
              color: 'neutral900',
              bg: 'white',
              borderWidth: 'border-width-sm',
              borderStyle: 'solid',
              borderColor: 'inputBorder',
              borderRadius: 'radius-sm',
              py: 'spacing-3xs',
              px: 'spacing-2xs',
            }}
          />
          <Text>of {totalPages}</Text>
        </Flex>
        <Button
          type="button"
          variant="icon"
          aria-label="Next page"
          disabled={isLastPage}
          aria-disabled={isLastPage}
          onClick={() => onPageChange(currentPage + 1)}
          sx={iconButtonStyles}
        >
          <ChevronRightIcon />
        </Button>
        <Button
          type="button"
          variant="icon"
          aria-label="Last page"
          disabled={isLastPage}
          aria-disabled={isLastPage}
          onClick={() => onPageChange(totalPages)}
          sx={iconButtonStyles}
        >
          <ChevronsRightIcon />
        </Button>
      </Flex>

      {/* empty spacer so the button group centers in the bar regardless of
          how wide the "Showing X-Y of Z cases" text on the left is */}
      <Box />
    </Box>
  );
};
