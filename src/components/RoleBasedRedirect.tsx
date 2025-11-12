import { useEffect, useState, ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { apiClient } from '../config/api';
import LoadingScreen from './LoadingScreen';

interface RoleBasedRedirectProps {
    children: ReactNode;
}

const RoleBasedRedirect: React.FC<RoleBasedRedirectProps> = ({ children }) => {
    const [isLoading, setIsLoading] = useState(true);
    const [shouldRedirectToAdmin, setShouldRedirectToAdmin] = useState(false);
    const location = useLocation();

    useEffect(() => {
        const checkUserRole = async () => {
            try {
                const response = await apiClient.get('/auth/me');
                
                if (response.data.success && response.data.data) {
                    const userData = response.data.data;
                    const roles = userData.roles || [];
                    const isStaff = userData.isStaff === true || 
                                   userData.isStaff === 1 || 
                                   userData.isStaff === '1' || 
                                   userData.isStaff === 'true';
                    
                    // Vérifier si l'utilisateur est admin ou staff
                    const isAdmin = roles.includes('ROLE_ADMIN') || 
                                   roles.some((role: string) => role.includes('ADMIN')) ||
                                   userData.role === 'admin' ||
                                   isStaff;

                    if (isAdmin) {
                        setShouldRedirectToAdmin(true);
                    }
                }
            } catch (error) {
                console.error('Erreur lors de la vérification du rôle:', error);
                // En cas d'erreur, ne pas rediriger (l'utilisateur verra le test)
            } finally {
                setIsLoading(false);
            }
        };

        checkUserRole();
    }, []);

    if (isLoading) {
        return <LoadingScreen />;
    }

    // Si l'utilisateur est admin/staff et qu'il est sur la route racine ou une route non-admin, rediriger vers /admin
    if (shouldRedirectToAdmin && !location.pathname.startsWith('/admin') && location.pathname !== '/logout') {
        return <Navigate to="/admin" replace />;
    }

    // Sinon, afficher le contenu normal (test d'orientation)
    return <>{children}</>;
};

export default RoleBasedRedirect;

