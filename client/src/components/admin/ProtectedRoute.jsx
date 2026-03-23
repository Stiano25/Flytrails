import { Navigate } from 'react-router-dom';
import { useAuth } from '../../lib/AuthContext.jsx';
import LoadingSpinner from '../LoadingSpinner.jsx';

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/admin/login" replace />;
  }

  return children;
}
