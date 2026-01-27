import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Layout } from './components/Layout';
import { SubmitReport } from './pages/SubmitReport';
import { MyReports } from './pages/MyReports';
import { AnalystDashboard } from './pages/AnalystDashboard';
import { IntelligenceDatabase } from './pages/IntelligenceDatabase';
import { AnalyticsDashboard } from './pages/AnalyticsDashboard';
import { AdminDashboard } from './pages/AdminDashboard';
import { NotificationToast } from './components/NotificationToast';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  return <>{children}</>;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <NotificationToast />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route path="/" element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }>
            <Route index element={<MyReports />} />
            <Route path="my-reports" element={<MyReports />} />
            <Route path="submit-report" element={<SubmitReport />} />
            <Route path="analyst" element={<AnalystDashboard />} />
            <Route path="intelligence" element={<IntelligenceDatabase />} />
            <Route path="analytics" element={<AnalyticsDashboard />} />
            <Route path="admin" element={<AdminDashboard />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
