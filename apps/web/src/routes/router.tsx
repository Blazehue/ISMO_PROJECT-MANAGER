import { MotionConfig } from 'motion/react';
import { createBrowserRouter, Outlet, ScrollRestoration } from 'react-router';
import { IntroOverlay, OutroOverlay } from '@/components/fx/Cinema';
import { ProtectedRoute, PublicOnlyRoute } from './guards';

/** Root: scroll to top on navigation, and honour the OS "reduce motion" setting everywhere. */
function Root() {
  return (
    <MotionConfig reducedMotion="user">
      <ScrollRestoration />
      <IntroOverlay />
      <OutroOverlay />
      <Outlet />
    </MotionConfig>
  );
}

// Each page is its own chunk, so the landing page doesn't download the whole app.
export const router = createBrowserRouter([
  {
    element: <Root />,
    children: [
      { path: '/', lazy: () => import('@/pages/LandingPage').then((m) => ({ Component: m.LandingPage })) },
      {
        element: <PublicOnlyRoute />,
        children: [
          { path: '/login', lazy: () => import('@/pages/LoginPage').then((m) => ({ Component: m.LoginPage })) },
          {
            path: '/register',
            lazy: () => import('@/pages/RegisterPage').then((m) => ({ Component: m.RegisterPage })),
          },
        ],
      },
      {
        element: <ProtectedRoute />,
        children: [
          {
            lazy: () => import('@/components/layout/AppLayout').then((m) => ({ Component: m.AppLayout })),
            children: [
              {
                path: '/dashboard',
                lazy: () => import('@/pages/DashboardPage').then((m) => ({ Component: m.DashboardPage })),
              },
              {
                path: '/projects',
                lazy: () => import('@/pages/ProjectsPage').then((m) => ({ Component: m.ProjectsPage })),
              },
              {
                path: '/projects/:id',
                lazy: () => import('@/pages/ProjectDetailPage').then((m) => ({ Component: m.ProjectDetailPage })),
              },
              { path: '/tasks', lazy: () => import('@/pages/TasksPage').then((m) => ({ Component: m.TasksPage })) },
              {
                path: '/account',
                lazy: () => import('@/pages/AccountPage').then((m) => ({ Component: m.AccountPage })),
              },
            ],
          },
        ],
      },
      { path: '*', lazy: () => import('@/pages/NotFoundPage').then((m) => ({ Component: m.NotFoundPage })) },
    ],
  },
]);
