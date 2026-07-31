import { useEffect, useState } from 'react';
import { Button, Flex, Text } from 'theme-ui';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export const Pagination = ({
  currentPage,
  totalPages,
  onPageChange,
}: PaginationProps) => {
  const [inputValue, setInputValue] = useState(String(currentPage));

  // keep the input in sync when the page changes from elsewhere (Prev/Next/
  // First/Last buttons), but not while the user is actively typing a value
  // we haven't committed yet
  useEffect(() => {
    setInputValue(String(currentPage));
  }, [currentPage]);

  if (totalPages <= 1) {
    return null;
  }

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
    <Flex
      sx={{
        justifyContent: 'center',
        alignItems: 'center',
        gap: 'spacing-sm',
        mt: 'spacing-md',
      }}
    >
      <Button
        type="button"
        variant="tertiary"
        aria-label="First page"
        disabled={isFirstPage}
        aria-disabled={isFirstPage}
        onClick={() => onPageChange(1)}
      >
        First
      </Button>
      <Button
        type="button"
        variant="tertiary"
        aria-label="Previous page"
        disabled={isFirstPage}
        aria-disabled={isFirstPage}
        onClick={() => onPageChange(currentPage - 1)}
      >
        Prev
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
        variant="tertiary"
        aria-label="Next page"
        disabled={isLastPage}
        aria-disabled={isLastPage}
        onClick={() => onPageChange(currentPage + 1)}
      >
        Next
      </Button>
      <Button
        type="button"
        variant="tertiary"
        aria-label="Last page"
        disabled={isLastPage}
        aria-disabled={isLastPage}
        onClick={() => onPageChange(totalPages)}
      >
        Last
      </Button>
    </Flex>
  );
};
