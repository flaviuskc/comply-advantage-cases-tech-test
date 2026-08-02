import { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Box, Button, Flex, Image, MenuButton } from 'theme-ui';

import logo from '../../assets/comply_logo.svg';

const CloseIcon = () => (
  <svg
    width={16}
    height={16}
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

// Sidebar (>=1024px) vs header+drawer (<1024px) - kept in one constant so
// the two layouts can't drift apart.
export const DESKTOP_MEDIA_QUERY = '@media (min-width: 1024px)';

interface NavItemProps {
  to: string;
  end?: boolean;
  children: string;
  onNavigate?: () => void;
}

const NavItem = ({ to, end, children, onNavigate }: NavItemProps) => (
  <NavLink
    to={to}
    end={end}
    style={{ textDecoration: 'none' }}
    onClick={onNavigate}
  >
    {({ isActive }) => (
      <Flex
        sx={{
          alignItems: 'center',
          gap: 'spacing-sm',
          px: 'spacing-md',
          py: 'spacing-sm',
          borderRadius: 'radius-md',
          color: isActive ? 'white' : 'neutral700',
          bg: isActive ? 'neutral800' : 'transparent',
          fontWeight: isActive ? 'font-weight-semi-bold' : 'font-weight-normal',
        }}
      >
        {children}
      </Flex>
    )}
  </NavLink>
);

interface NavLinksProps {
  onNavigate?: () => void;
}

const NavLinks = ({ onNavigate }: NavLinksProps) => (
  <Flex sx={{ flexDirection: 'column', gap: 'spacing-2xs' }}>
    <NavItem to="/" end onNavigate={onNavigate}>
      Home
    </NavItem>
    <NavItem to="/cases" onNavigate={onNavigate}>
      Cases
    </NavItem>
  </Flex>
);

const DesktopSidebar = () => (
  <Flex
    as="nav"
    aria-label="Primary"
    sx={{
      display: 'none',
      [DESKTOP_MEDIA_QUERY]: {
        display: 'flex',
      },
      flexDirection: 'column',
      gap: 'spacing-2xl',
      width: '240px',
      flexShrink: 0,
      bg: 'neutral50',
      p: 'spacing-lg',
    }}
  >
    <Image src={logo} />
    <NavLinks />
  </Flex>
);

const MobileHeader = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // close on Escape and lock background scroll while the drawer is open,
  // matching standard modal behaviour
  useEffect(() => {
    if (!isMenuOpen) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [isMenuOpen]);

  return (
    <Box
      sx={{
        display: 'block',
        [DESKTOP_MEDIA_QUERY]: {
          display: 'none',
        },
      }}
    >
      <Flex
        sx={{
          alignItems: 'center',
          gap: 'spacing-md',
          bg: 'neutral50',
          p: 'spacing-md',
          borderBottomWidth: 'border-width-sm',
          borderBottomStyle: 'solid',
          borderBottomColor: 'borderLight',
        }}
      >
        <MenuButton
          aria-label="Open menu"
          aria-expanded={isMenuOpen}
          onClick={() => setIsMenuOpen((open) => !open)}
          sx={{
            padding: 'spacing-2xs',
            borderRadius: 'radius-sm',
            color: 'neutral900',
          }}
        />
        <Image src={logo} sx={{ height: '24px' }} />
      </Flex>

      {/* backdrop - always mounted so opacity/transform can transition on
          both open and close, rather than popping in/out instantly */}
      <Box
        onClick={() => setIsMenuOpen(false)}
        aria-hidden="true"
        sx={{
          position: 'fixed',
          inset: 0,
          bg: 'rgba(0, 0, 0, 0.5)',
          zIndex: 'overlay',
          opacity: isMenuOpen ? 1 : 0,
          visibility: isMenuOpen ? 'visible' : 'hidden',
          transition: 'opacity 200ms ease-in-out, visibility 200ms ease-in-out',
        }}
      />

      <Box
        as="nav"
        aria-label="Primary"
        aria-hidden={!isMenuOpen}
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          bottom: 0,
          width: '260px',
          maxWidth: '80vw',
          bg: 'neutral50',
          zIndex: 'drawer',
          p: 'spacing-lg',
          boxShadow: 'shadow-md',
          transform: isMenuOpen ? 'translateX(0)' : 'translateX(-100%)',
          transition: 'transform 200ms ease-in-out',
        }}
      >
        <Flex sx={{ justifyContent: 'flex-end', mb: 'spacing-xs' }}>
          <Button
            type="button"
            variant="icon"
            aria-label="Close menu"
            onClick={() => setIsMenuOpen(false)}
            sx={{
              height: 'auto',
              minWidth: 'auto',
              px: 'spacing-2xs',
              py: 'spacing-2xs',
            }}
          >
            <CloseIcon />
          </Button>
        </Flex>
        <NavLinks onNavigate={() => setIsMenuOpen(false)} />
      </Box>
    </Box>
  );
};

export const Nav = () => (
  <>
    <DesktopSidebar />
    <MobileHeader />
  </>
);
