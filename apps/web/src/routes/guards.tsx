import { Loader2 } from 'lucide-react';
import { Navigate, Outlet, useLocation } from 'react-router';
import { useAuth } from '@/lib/auth';

function FullPageSpinner() {
  return (
    <div className="flex min-h-dvh items-center justify-center" role="status" aria-label="Loading">
      <Loader2 className="size-6 animate-spin text-brand-600" />
    </div>
  );
}

/** Logged-in pages. Anyone else is sent to /login, remembering where they were going. */
export function ProtectedRoute() {
  const { status, sessionExpired } = useAuth();
  const location = useLocation();

  if (status === 'loading') return <FullPageSpinner />;
  if (status === 'unauthenticated') {
    const search = sessionExpired ? '?reason=expired' : '';
    return <Navigate to={`/login${search}`} replace state={{ from: location.pathname }} />;
  }
  return <Outlet />;
}

/** Login/register. Already-authenticated users skip straight to the app. */
export function PublicOnlyRoute() {
  const { status } = useAuth();
  if (status === 'loading') return <FullPageSpinner />;
  if (status === 'authenticated') return <Navigate to="/dashboard" replace />;
  return <Outlet />;
}
