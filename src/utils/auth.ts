import Cookies from 'js-cookie';
import type { User, JWTPayload } from '../types/auth';

const TOKEN_KEY = 'orientation_token';

export const decodeJWT = (token: string): JWTPayload | null => {
    try {
        // Simple JWT decode (in production, use a proper JWT library)
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(
            atob(base64)
                .split('')
                .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                .join('')
        );
        return JSON.parse(jsonPayload);
    } catch (error) {
        console.error('Error decoding JWT:', error);
        return null;
    }
};

// ✅ NOUVELLE FONCTION : Normaliser les rôles en tableau
const normalizeRoles = (roles: any): string[] => {
    if (!roles) return [];

    console.log('🔍 Normalizing roles:', roles, 'Type:', typeof roles);

    if (Array.isArray(roles)) {
        return roles.filter(role => typeof role === 'string');
    }

    if (typeof roles === 'string') {
        if (roles.includes(',')) {
            return roles.split(',').map(role => role.trim());
        } else if (roles.includes(' ')) {
            return roles.split(' ').filter(role => role.trim().length > 0);
        } else {
            return [roles];
        }
    }

    if (typeof roles === 'object' && roles !== null) {
        // Format Symfony : { "0": "ROLE_USER", "1": "ROLE_AUTHENTICATED" }
        const values = Object.values(roles);
        const keys = Object.keys(roles);

        // Si les valeurs sont des strings, les utiliser
        if (values.length > 0 && typeof values[0] === 'string') {
            return values.filter(val => typeof val === 'string') as string[];
        }

        // Si les clés ressemblent à des rôles, les utiliser
        if (keys.some(key => key.startsWith('ROLE_'))) {
            return keys.filter(key => key.startsWith('ROLE_'));
        }

        // Cas spécial : structure imbriquée
        if (roles.roles && Array.isArray(roles.roles)) {
            return roles.roles.filter(role => typeof role === 'string');
        }
    }

    console.warn('⚠️ Format de rôles non reconnu:', roles);
    return [];
};

export const isTokenValid = (token: string): boolean => {
    try {
        const payload = decodeJWT(token);
        if (!payload) {
            console.log('❌ Payload null');
            return false;
        }

        // Vérifier si le token est expiré
        const currentTime = Math.floor(Date.now() / 1000);
        if (payload.exp < currentTime) {
            console.log('❌ Token expiré');
            return false;
        }

        console.log('Payload roles:', payload.roles);
        console.log('Type of roles:', typeof payload.roles);

        // ✅ CORRECTION : Utiliser la fonction de normalisation
        const rolesArray = normalizeRoles(payload.roles);
        console.log('✅ Rôles normalisés:', rolesArray);

        // Vérifier si l'utilisateur a un rôle valide
        const hasValidRole = rolesArray.some(role =>
            role === 'ROLE_AUTHENTICATED' ||
            role === 'ROLE_USER' ||
            role === 'AUTHENTICATED' ||
            role === 'USER' ||
            role.includes('ROLE_')
        );

        console.log('Has valid role?', hasValidRole);

        if (!hasValidRole) {
            console.log('❌ Aucun rôle valide trouvé:', rolesArray);
            return false;
        }

        return true;
    } catch (error) {
        console.error('❌ Erreur dans isTokenValid:', error);
        return false;
    }
};

export const getUserFromToken = (token: string): User | null => {
    try {
        const payload = decodeJWT(token);
        if (!payload) {
            console.log('❌ Payload null dans getUserFromToken');
            return null;
        }

        console.log('🔍 getUserFromToken - Payload:', payload);

        // ✅ CORRECTION : Utiliser la fonction de normalisation
        const rolesArray = normalizeRoles(payload.roles);
        console.log('✅ Rôles normalisés dans getUserFromToken:', rolesArray);

        // Déterminer le rôle principal de l'utilisateur
        let userRole = 'user';

        if (rolesArray.some(role => role.includes('ADMIN'))) {
            userRole = 'admin';
        } else if (rolesArray.some(role => role.includes('MODERATOR'))) {
            userRole = 'moderator';
        } else if (rolesArray.some(role => role.includes('ROLE_'))) {
            userRole = 'user';
        }

        const user: User = {
            id: payload.username || payload.sub || payload.userId || payload.email || 'unknown',
            email: payload.email || payload.username || '',
            role: userRole,
            name: payload.name || payload.username || payload.email || 'Utilisateur',
            roles: rolesArray // ✅ Utiliser le tableau normalisé
        };

        console.log('✅ Utilisateur extrait:', user);
        return user;

    } catch (error) {
        console.error('❌ Erreur dans getUserFromToken:', error);
        return null;
    }
};

export const setAuthToken = (token: string): void => {
    try {
        // Utiliser localStorage au lieu de Cookies pour correspondre à api.ts
        localStorage.setItem(TOKEN_KEY, token);
        console.log('✅ Token sauvegardé');
    } catch (error) {
        console.error('❌ Erreur lors de la sauvegarde du token:', error);
    }
};

export const getAuthToken = (): string | null => {
    try {
        // Utiliser localStorage au lieu de Cookies pour correspondre à api.ts
        return localStorage.getItem(TOKEN_KEY) || null;
    } catch (error) {
        console.error('❌ Erreur lors de la récupération du token:', error);
        return null;
    }
};

export const removeAuthToken = (): void => {
    try {
        localStorage.removeItem(TOKEN_KEY);
        console.log('✅ Token supprimé');
    } catch (error) {
        console.error('❌ Erreur lors de la suppression du token:', error);
    }
};

export const logout = (): void => {
    try {
        removeAuthToken();
        window.location.href = '/unauthorized';
    } catch (error) {
        console.error('❌ Erreur lors de la déconnexion:', error);
    }
};

// ✅ NOUVELLE FONCTION : Vérifier un rôle spécifique
export const hasRole = (token: string, targetRole: string): boolean => {
    try {
        const payload = decodeJWT(token);
        if (!payload || !payload.roles) return false;

        const rolesArray = normalizeRoles(payload.roles);

        return rolesArray.some(role =>
            role.toLowerCase().includes(targetRole.toLowerCase()) ||
            role === targetRole
        );
    } catch (error) {
        console.error('❌ Erreur dans hasRole:', error);
        return false;
    }
};

// ✅ FONCTION DE DEBUG
export const debugToken = (token: string): void => {
    if (import.meta.env.MODE !== 'development') return;

    try {
        const payload = decodeJWT(token);
        console.group('🔍 Debug Token JWT');
        console.log('Payload complet:', payload);
        console.log('Rôles bruts:', payload?.roles);
        console.log('Type des rôles:', typeof payload?.roles);
        console.log('Est-ce un tableau?', Array.isArray(payload?.roles));

        if (payload?.roles) {
            const normalized = normalizeRoles(payload.roles);
            console.log('Rôles normalisés:', normalized);
        }

        console.log('Token valide?', isTokenValid(token));
        console.log('Utilisateur extrait:', getUserFromToken(token));
        console.groupEnd();
    } catch (error) {
        console.error('❌ Erreur dans debugToken:', error);
    }
};