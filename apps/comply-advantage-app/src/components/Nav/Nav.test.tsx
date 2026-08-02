import { render, screen, fireEvent } from '@testing-library/react';
import { Nav } from './Nav';

import { RouterProvider, createMemoryRouter } from 'react-router-dom';

const routes = [
  {
    path: '*',
    element: <Nav />,
  },
];

const router = createMemoryRouter(routes, {
  initialEntries: ['/'],
  initialIndex: 1,
});

describe('Nav', () => {
  it('provides link to Home', () => {
    render(<RouterProvider router={router} />);

    // hidden: true - both the desktop sidebar (CSS-hidden below 1024px,
    // which jsdom never evaluates as matching) and the mobile drawer
    // (aria-hidden while closed) render a "Home" link, so there are two
    // otherwise-inaccessible matches here - either is fine for this check
    expect(
      screen.getAllByRole('link', { name: 'Home', hidden: true })[0],
    ).toHaveAttribute('href', '/');
  });

  it('provides link to Cases', () => {
    render(<RouterProvider router={router} />);

    expect(
      screen.getAllByRole('link', { name: 'Cases', hidden: true })[0],
    ).toHaveAttribute('href', '/cases');
  });

  it('toggles the mobile menu open and closed', () => {
    render(<RouterProvider router={router} />);

    // the mobile drawer's links aren't mounted until the menu is opened, so
    // no *accessible* "Cases" link should exist yet (the desktop sidebar's
    // copy is CSS-hidden and excluded by default)
    expect(
      screen.queryByRole('link', { name: 'Cases' }),
    ).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Open menu' }));

    expect(screen.getByRole('link', { name: 'Cases' })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Open menu' }));

    expect(
      screen.queryByRole('link', { name: 'Cases' }),
    ).not.toBeInTheDocument();
  });
});
