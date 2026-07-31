import { Box, Flex } from 'theme-ui';
import { Outlet } from 'react-router-dom';
import { DESKTOP_MEDIA_QUERY, Nav } from '../Nav/Nav';

function App() {
  return (
    <Flex
      sx={{
        minHeight: '100vh',
        flexDirection: 'column',
        [DESKTOP_MEDIA_QUERY]: {
          flexDirection: 'row',
        },
      }}
    >
      <Nav />
      <Box sx={{ flex: 1, p: 'spacing-lg', minWidth: 0 }}>
        <Outlet />
      </Box>
    </Flex>
  );
}

export default App;
