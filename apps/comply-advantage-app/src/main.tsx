import React, { Suspense } from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';

import AppThemeProvider from '../src/theme/AppThemeProvider';
import App from './components/App/App.tsx';
import Home from './components/Home/Home.tsx';
import './styles-reset.css';

import setupMocks from './mockApi/setupMocks';

const CaseListView = React.lazy(() =>
  import('cases').then((module) => ({ default: module.CaseListView })),
);
const CaseDetailView = React.lazy(() =>
  import('cases').then((module) => ({ default: module.CaseDetailView })),
);
const queryClient = new QueryClient();

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      {
        index: true,
        element: <Home />,
      },
      {
        path: 'cases',
        element: (
          <Suspense fallback={<div>...</div>}>
            <CaseListView />
          </Suspense>
        ),
      },
      {
        path: 'cases/:caseId',
        element: (
          <Suspense fallback={<div>...</div>}>
            <CaseDetailView />
          </Suspense>
        ),
      },
    ],
  },
]);

const container = document.getElementById('root') as HTMLElement & {
  _reactRoot?: ReactDOM.Root;
};
const root = container._reactRoot ?? ReactDOM.createRoot(container);
container._reactRoot = root;

async function main() {
  await setupMocks();

  root.render(
    <React.StrictMode>
      <AppThemeProvider>
        <QueryClientProvider client={queryClient}>
          <RouterProvider router={router} />
        </QueryClientProvider>
      </AppThemeProvider>
    </React.StrictMode>,
  );
}

main();
