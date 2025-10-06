import React, { ReactNode } from 'react';
import { useIAM } from '../IAMContext';

interface ProtectedRouteProps {
  children: ReactNode;
  fallback?: ReactNode;
  requiredPermission?: string;
  requiredRole?: string;
  redirectTo?: string;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  fallback = <div>Loading...</div>,
  requiredPermission,
  requiredRole,
  redirectTo = '/login',
}) => {
  const { isAuthenticated, isLoading, hasPermission, hasRole } = useIAM();
  const [hasAccess, setHasAccess] = React.useState<boolean | null>(null);

  React.useEffect(() => {
    const checkAccess = async () => {
      if (!isAuthenticated) {
        setHasAccess(false);
        return;
      }

      if (requiredPermission) {
        const permitted = await hasPermission(requiredPermission);
        setHasAccess(permitted);
        return;
      }

      if (requiredRole) {
        const hasRequiredRole = await hasRole(requiredRole);
        setHasAccess(hasRequiredRole);
        return;
      }

      setHasAccess(true);
    };

    checkAccess();
  }, [isAuthenticated, requiredPermission, requiredRole, hasPermission, hasRole]);

  if (isLoading || hasAccess === null) {
    return <>{fallback}</>;
  }

  if (!hasAccess) {
    if (typeof window !== 'undefined' && redirectTo) {
      window.location.href = redirectTo;
    }
    return <div>Unauthorized</div>;
  }

  return <>{children}</>;
};
