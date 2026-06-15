import { Toaster } from "@/components/ui/toaster";
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClientInstance } from '@/lib/query-client';
import { BrowserRouter as Router, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import { ProfileProvider } from '@/lib/useProfile';
import { ThemeProvider } from '@/lib/ThemeContext';
import { LanguageProvider } from '@/lib/LanguageContext';
import ElysiumMark from '@/components/elysium/ElysiumMark';

import Onboarding from '@/pages/Onboarding';
import Dashboard from '@/pages/Dashboard';
import SocialPage from '@/pages/SocialPage';
import StudyGroupsPage from '@/pages/StudyGroupsPage';
import ToolsPage from '@/pages/ToolsPage';
import ProfilePage from '@/pages/ProfilePage';
import MePage from '@/pages/MePage';
import AdminPage from '@/pages/AdminPage';
import DiscoverPage from '@/pages/DiscoverPage';
import CalendarPage from '@/pages/CalendarPage';
import AskPage from '@/pages/AskPage';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import ForgotPassword from '@/pages/ForgotPassword';
import ResetPassword from '@/pages/ResetPassword';

const AuthenticatedApp = () => {
  const { pathname } = useLocation();
  const { isAuthenticated, isLoadingAuth, isLoadingPublicSettings, authError } = useAuth();
  const authPaths = ['/login', '/register', '/forgot-password', '/reset-password'];
  const isAuthPath = authPaths.includes(pathname);

  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <ElysiumMark size={48} className="animate-pulse" />
          <p className="text-sm text-muted-foreground">Loading Elysium...</p>
        </div>
      </div>
    );
  }

  if (authError) {
    if (authError.type === 'user_not_registered') return <UserNotRegisteredError />;
  }

  if (isAuthPath) {
    if (isAuthenticated) return <Navigate to="/" replace />;
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  return (
    <Routes>
      <Route path="/onboarding" element={<Onboarding />} />
      <Route element={<ProfileWrapper />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/social" element={<SocialPage />} />
        <Route path="/groups" element={<StudyGroupsPage />} />
        <Route path="/teachers" element={<Navigate to="/discover?tab=tutors" replace />} />
        <Route path="/tools" element={<ToolsPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/me" element={<MePage />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/discover" element={<DiscoverPage />} />
        <Route path="/calendar" element={<CalendarPage />} />
        <Route path="/ask" element={<AskPage />} />
      </Route>
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};

import { Outlet } from 'react-router-dom';
function ProfileWrapper() {
  return (
    <ProfileProvider>
      <Outlet />
    </ProfileProvider>
  );
}

function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <LanguageProvider>
          <QueryClientProvider client={queryClientInstance}>
            <Router>
              <AuthenticatedApp />
            </Router>
            <Toaster />
          </QueryClientProvider>
        </LanguageProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;
