import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import ForgotPassword from './pages/ForgotPassword';
import Dashboard from './pages/Dashboard';
import Clients from './pages/Clients';
import ClientDetail from './pages/ClientDetail';
import Documents from './pages/Documents';
import Tasks from './pages/Tasks';
import Compliance from './pages/Compliance';
import Workpapers from './pages/Workpapers';
import Settings from './pages/Settings';
import UserManagement from './pages/UserManagement';
import ClientPortal from './pages/ClientPortal';
import Layout from './components/Layout';
import { Skeleton } from './components/ui/Skeleton';

const ProtectedRoute: React.FC<{ children: React.ReactNode; allowedRoles?: string[] }> = ({ 
  children, 
  allowedRoles = [] 
}) => {
  const { user, session } = useAuth();
  
  if (!session) {
    return <Navigate to="/login" replace />;
  }
  
  if (user && allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    // If user has a role but it's not allowed, redirect to their default page
    return <Navigate to={user.role === 'client' ? '/client-portal' : '/dashboard'} replace />;
  }
  
  return <>{children}</>;
};

const AppRoutes: React.FC = () => {
  const { user, session, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-full max-w-md space-y-4">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      </div>
    );
  }
  
  // If there's no session, show public routes
  if (!session) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  // If there is a session, direct based on role
  if (user?.role === 'client') {
    return (
      <Layout>
        <Routes>
          <Route path="/client-portal" element={<ProtectedRoute><ClientPortal /></ProtectedRoute>} />
          <Route path="*" element={<Navigate to="/client-portal" replace />} />
        </Routes>
      </Layout>
    );
  }
  
  // Staff/Admin/Manager routes
  return (
    <Layout>
      <Routes>
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/clients" element={<ProtectedRoute allowedRoles={['admin', 'manager', 'staff']}><Clients /></ProtectedRoute>} />
        <Route path="/clients/:id" element={<ProtectedRoute allowedRoles={['admin', 'manager', 'staff']}><ClientDetail /></ProtectedRoute>} />
        <Route path="/documents" element={<ProtectedRoute><Documents /></ProtectedRoute>} />
        <Route path="/tasks" element={<ProtectedRoute><Tasks /></ProtectedRoute>} />
        <Route path="/compliance" element={<ProtectedRoute><Compliance /></ProtectedRoute>} />
        <Route path="/workpapers" element={<ProtectedRoute allowedRoles={['admin', 'manager', 'staff']}><Workpapers /></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
        <Route path="/users" element={<ProtectedRoute allowedRoles={['admin']}><UserManagement /></ProtectedRoute>} />
        <Route path="/login" element={<Navigate to="/dashboard" replace />} />
        <Route path="/signup" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Layout>
  );
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="min-h-screen bg-background">
          <AppRoutes />
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
