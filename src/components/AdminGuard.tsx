import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAuthToken, getUserFromToken, hasRole } from '../utils/auth';
import { apiClient } from '../config/api';
import LoadingScreen from './LoadingScreen';
import type { User } from '../types/auth';

interface AdminGuardProps {
    children: React.ReactNode;
}

export default function AdminGuard({ children }: AdminGuardProps) {
    const [isLoading, setIsLoading] = useState(true);
    const [isAuthorized, setIsAuthorized] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const checkAdminAuth = async () => {
            const token = getAuthToken();

            if (!token) {
                navigate('/');
                setIsLoading(false);
                return;
            }

            // Vérifier le token avec le backend
            try {
                const response = await apiClient.get('/auth/me');
                
                if (response.data.success && response.data.data) {
                    const userData = response.data.data;
                    const roles = userData.roles || [];
                    
                    // Vérifier si l'utilisateur a le rôle admin
                    const isAdmin = roles.includes('ROLE_ADMIN') || 
                                   roles.some((role: string) => role.includes('ADMIN')) ||
                                   userData.role === 'admin';

                    if (isAdmin) {
                        setIsAuthorized(true);
                    } else {
                        // Rediriger vers la page principale si pas admin
                        navigate('/');
                    }
                } else {
                    navigate('/');
                }
            } catch (error: any) {
                console.error('Erreur de vérification admin:', error);
                navigate('/');
            } finally {
                setIsLoading(false);
            }
        };

        checkAdminAuth();
    }, [navigate]);

    if (isLoading) {
        return <LoadingScreen />;
    }

    if (!isAuthorized) {
        return null; // La redirection est gérée dans useEffect
    }

    return <>{children}</>;
}


