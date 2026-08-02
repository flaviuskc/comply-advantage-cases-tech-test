import { Link } from 'react-router-dom';
import { Box, Flex, Heading, Text } from 'theme-ui';

const Home = () => (
  <Flex
    sx={{
      minHeight: '100%',
      alignItems: 'center',
      justifyContent: 'center',
      py: 'spacing-3xl',
    }}
  >
    <Box
      sx={{
        variant: 'cards.secondary',
        maxWidth: '480px',
        textAlign: 'center',
        p: 'spacing-2xl',
        boxShadow: 'shadow-sm',
      }}
    >
      <Box
        sx={{
          mx: 'auto',
          mb: 'spacing-lg',
          width: 'size-6xs',
          height: 'size-6xs',
          borderRadius: 'radius-full',
          bg: 'brand100',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '32px',
        }}
      >
        👋
      </Box>

      <Heading sx={{ fontSize: '24px', fontWeight: 'font-weight-bold' }}>
        ComplyAdvantage Technical Assignment
      </Heading>

      <Text sx={{ display: 'block', color: 'textSubtle', mt: 'spacing-sm' }}>
        This is the ComplyAdvantage technical assignment. Head over to the Cases
        feature to review, filter and manage cases.
      </Text>

      <Link
        to="/cases"
        sx={{
          variant: 'links.primary',
          mt: 'spacing-xl',
        }}
      >
        Go to Cases
      </Link>
    </Box>
  </Flex>
);

export default Home;
