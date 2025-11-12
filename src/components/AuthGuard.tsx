import React, { useEffect, useState, useCallback } from 'react';
import { getAuthToken, isTokenValid, getUserFromToken, setAuthToken, removeAuthToken } from '../utils/auth';
import { apiClient, handleApiError } from '../config/api';
import LoadingScreen from './LoadingScreen';
import Login from './Login';
import type { User } from '../types/auth';

// 🔧 FLAG : Activer l'authentification JWT avec le backend
const ENABLE_JWT_AUTH = true;

interface AuthGuardProps {
    children: React.ReactNode;
    onAuthSuccess: (user: User) => void;
}

export default function AuthGuard({ children, onAuthSuccess }: AuthGuardProps) {
    const [isLoading, setIsLoading] = useState(true);
    const [isAuthorized, setIsAuthorized] = useState(false);
    const [loginError, setLoginError] = useState<string | null>(null);
    const [isLoggingIn, setIsLoggingIn] = useState(false);
    const [language, setLanguage] = useState<'fr' | 'ar'>('fr');

    // Mémoriser la fonction onAuthSuccess pour éviter les re-renders infinis
    const handleAuthSuccess = useCallback((user: User) => {
        onAuthSuccess(user);
    }, [onAuthSuccess]);

    // Fonction de login avec le backend
    const handleLogin = useCallback(async (email: string, password: string) => {
        setIsLoggingIn(true);
        setLoginError(null);

        try {
            // Appel API au backend
            // Envoyer à la fois email et telephone pour compatibilité avec l'API existante
            const response = await apiClient.post('/auth/login', {
                email: email.trim(),
                telephone: email.trim(), // Pour compatibilité avec l'API qui attend "telephone"
                password: password
            });

            if (response.data.success && response.data.data) {
                const { token, user: userData } = response.data.data;

                // Sauvegarder le token
                setAuthToken(token);

                // Créer l'objet User
                const user: User = {
                    id: userData.id || email.split('@')[0],
                    email: userData.email || email,
                    role: userData.roles?.includes('ROLE_ADMIN') ? 'admin' : 'user',
                    name: userData.name || email.split('@')[0] || 'Utilisateur',
                    roles: userData.roles || ['ROLE_USER', 'ROLE_AUTHENTICATED']
                };

                // Authentification réussie
                setIsAuthorized(true);
                handleAuthSuccess(user);
            } else {
                throw new Error(response.data.message || 'Erreur de connexion');
            }
        } catch (error: any) {
            const errorMessage = handleApiError(error);
            setLoginError(errorMessage);
            throw error;
        } finally {
            setIsLoggingIn(false);
        }
    }, [handleAuthSuccess]);

    useEffect(() => {
        const checkAuth = async () => {
            if (!ENABLE_JWT_AUTH) {
                // Mode bypass (pour tests)
                const token = getAuthToken();
                if (token) {
                    try {
                        const user = getUserFromToken(token);
                        if (user) {
                            setIsAuthorized(true);
                            handleAuthSuccess(user);
                            setIsLoading(false);
                            return;
                        }
                    } catch (error) {
                        // Token invalide
                    }
                }
                setIsAuthorized(false);
                setIsLoading(false);
                return;
            }

            // Vérifier les paramètres de l'URL pour récupérer le token
            const urlParams = new URLSearchParams(window.location.search);
            const tokenFromUrl = urlParams.get('token');

            // Récupérer le token depuis l'URL ou le localStorage
            const token = tokenFromUrl || getAuthToken();

            if (!token) {
                setIsAuthorized(false);
                setIsLoading(false);
                return;
            }

            // Si le token vient de l'URL, on le sauvegarde dans localStorage
            if (tokenFromUrl) {
                setAuthToken(tokenFromUrl);
                // Nettoyer l'URL sans recharger la page
                const newUrl = window.location.pathname;
                window.history.replaceState({}, document.title, newUrl);
            }

            // Vérifier le token avec le backend
            try {
                const response = await apiClient.get('/auth/me');
                
                if (response.data.success && response.data.data) {
                    const userData = response.data.data;
                    const user: User = {
                        id: userData.id || 'unknown',
                        email: userData.email || '',
                        role: userData.roles?.includes('ROLE_ADMIN') ? 'admin' : 'user',
                        name: userData.name || userData.email?.split('@')[0] || 'Utilisateur',
                        roles: userData.roles || ['ROLE_USER', 'ROLE_AUTHENTICATED']
                    };

            setIsAuthorized(true);
                    handleAuthSuccess(user);
                } else {
                    // Token invalide
                    removeAuthToken();
                    setIsAuthorized(false);
                }
            } catch (error: any) {
                // Token invalide ou expiré
                console.error('Erreur de vérification du token:', error);
                removeAuthToken();
                setIsAuthorized(false);
            } finally {
            setIsLoading(false);
            }
        };

        checkAuth();
    }, [handleAuthSuccess]);

    if (isLoading) {
        return <LoadingScreen />;
    }

    if (!isAuthorized) {
        return (
            <Login
                onLogin={handleLogin}
                language={language}
                isLoading={isLoggingIn}
                error={loginError}
            />
        );
    }

    return <>{children}</>;
}
