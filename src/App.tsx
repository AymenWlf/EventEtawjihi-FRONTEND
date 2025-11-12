import { useCallback } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import type { User } from './types/auth';
import ErrorBoundary from './components/ErrorBoundary';
import AuthGuard from './components/AuthGuard.tsx';
import AdminGuard from './components/AdminGuard';
import AppQuick from './AppQuick';
import AdminLayout from './components/admin/AdminLayout';
import StatsBar from './components/admin/StatsBar';
import UserManagement from './components/admin/UserManagement';
import AbsenceChecker from './components/admin/AbsenceChecker';
import StaffManagement from './components/admin/StaffManagement';
import Logout from './components/Logout';
import RoleBasedRedirect from './components/RoleBasedRedirect';

function App() {
  // Mémoriser la fonction onAuthSuccess pour éviter les re-renders
  const handleAuthSuccess = useCallback((user: User) => {
    // Fonction vide pour le moment, peut être utilisée plus tard
    console.log('User authenticated:', user);
  }, []);

  return (
    <ErrorBoundary>
        <Router>
          <Routes>
          {/* Routes Admin */}
          <Route
            path="/admin/*"
            element={
              <AdminGuard>
                <AdminLayout>
                  <Routes>
                    <Route
                      path="/"
                      element={
                        <div>
                          <StatsBar />
                          <div className="bg-white rounded-lg shadow p-6">
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">Tableau de bord</h2>
                            <p className="text-gray-600">
                              Bienvenue dans le panneau d'administration. Utilisez le menu pour naviguer.
                            </p>
                          </div>
                        </div>
                      }
                    />
                    <Route path="/users" element={<UserManagement />} />
                    <Route path="/attendance" element={<AbsenceChecker />} />
                    <Route path="/staff" element={<StaffManagement />} />
                    <Route path="*" element={<Navigate to="/admin" replace />} />
                  </Routes>
                </AdminLayout>
              </AdminGuard>
            }
          />

          {/* Route de déconnexion (accessible sans AuthGuard pour permettre la déconnexion) */}
          <Route
            path="/logout"
            element={<Logout />}
          />

          {/* Routes principales */}
          <Route
            path="/*"
            element={
              <AuthGuard onAuthSuccess={handleAuthSuccess}>
                <RoleBasedRedirect>
                  <AppQuick />
                </RoleBasedRedirect>
              </AuthGuard>
            }
          />
          </Routes>
        </Router>
    </ErrorBoundary>
  );
}

export default App;
