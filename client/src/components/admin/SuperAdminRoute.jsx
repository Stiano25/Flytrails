import { Navigate } from 'react-router-dom';
import { useAuth } from '../../lib/AuthContext.jsx';
import LoadingSpinner from '../LoadingSpinner.jsx';

export default function SuperAdminRoute({ children }) {
  const { staff, staffLoading } = useAuth();

  if (staffLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (staff?.role !== 'superadmin') {
    return <Navigate to="/admin" replace />;
  }

  return children;
}
