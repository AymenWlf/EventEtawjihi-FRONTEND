import axios from 'axios';

// Configuration de base d'Axios
// En mode dev, utiliser localhost:8000, sinon utiliser la variable d'environnement ou l'URL de production
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || (import.meta.env.DEV ? 'http://localhost:8000/apis' : 'https://e-tawjihi.ma/apis');

// Instance Axios configurée
export const apiClient = axios.create({
    baseURL: API_BASE_URL,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Intercepteur pour ajouter le token d'authentification
apiClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('orientation_token');
        console.log(token);
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Intercepteur pour gérer les erreurs de réponse
apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Token expiré ou invalide - AuthGuard gérera la redirection
            localStorage.removeItem('orientation_token');
            // Ne pas rediriger automatiquement, laisser AuthGuard gérer
        }
        return Promise.reject(error);
    }
);

// Types pour les réponses API
export interface ApiResponse<T> {
    success: boolean;
    data: T;
    message?: string;
    errors?: string[];
}

export interface PaginatedResponse<T> {
    success: boolean;
    data: T[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

// Gestion des erreurs API
export const handleApiError = (error: any): string => {
    if (error.response?.data?.message) {
        return error.response.data.message;
    }
    if (error.response?.data?.errors?.length > 0) {
        return error.response.data.errors.join(', ');
    }
    if (error.message) {
        return error.message;
    }
    return 'Une erreur inattendue s\'est produite';
};

// ============================================
// ADMIN API FUNCTIONS
// ============================================

import type { AdminUser, AdminStats, AdminUsersResponse, AdminStatsResponse, QrScanResponse } from '../types/admin';

/**
 * Récupère la liste des utilisateurs avec pagination et recherche
 */
export const getAdminUsers = async (page: number = 1, limit: number = 20, search: string = ''): Promise<AdminUsersResponse> => {
    const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
    });
    if (search) {
        params.append('search', search);
    }
    
    const response = await apiClient.get(`/admin/users?${params.toString()}`);
    return response.data;
};

/**
 * Récupère les détails d'un utilisateur
 */
export const getAdminUser = async (id: number): Promise<{ success: boolean; data: AdminUser }> => {
    const response = await apiClient.get(`/admin/users/${id}`);
    return response.data;
};

/**
 * Crée un nouvel utilisateur
 */
export const createAdminUser = async (data: {
    email: string;
    password: string;
    firstName?: string;
    lastName?: string;
    telephone?: string;
    age?: number;
}): Promise<{ success: boolean; data: AdminUser; message: string }> => {
    const response = await apiClient.post('/admin/users', data);
    return response.data;
};

/**
 * Met à jour un utilisateur
 */
export const updateAdminUser = async (id: number, data: Partial<AdminUser>): Promise<{ success: boolean; data: AdminUser; message: string }> => {
    const response = await apiClient.put(`/admin/users/${id}`, data);
    return response.data;
};

/**
 * Récupère l'état du test d'un utilisateur
 */
export const getAdminUserTestStatus = async (id: number): Promise<any> => {
    const response = await apiClient.get(`/admin/users/${id}/test-status`);
    return response.data;
};

/**
 * Récupère le rapport complet d'un utilisateur
 */
export const getAdminUserReport = async (id: number): Promise<any> => {
    const response = await apiClient.get(`/admin/users/${id}/report`);
    return response.data;
};

/**
 * Met à jour la présence d'un utilisateur
 */
export const updateAdminUserPresence = async (id: number, isPresent: boolean): Promise<{ success: boolean; message: string; data: { id: number; isPresent: boolean } }> => {
    const response = await apiClient.put(`/admin/users/${id}/presence`, { isPresent });
    return response.data;
};

/**
 * Récupère ou génère le QR code d'un utilisateur
 */
export const getAdminUserQrCode = async (id: number): Promise<{ success: boolean; data: { qrCode: string } }> => {
    const response = await apiClient.get(`/admin/users/${id}/qr-code`);
    return response.data;
};

/**
 * Scanne un QR code et retourne les informations de l'utilisateur
 */
export const scanQrCode = async (qrCode: string): Promise<QrScanResponse> => {
    const response = await apiClient.post(`/admin/qr-scan/${qrCode}`);
    return response.data;
};

/**
 * Récupère les statistiques globales
 */
export const getAdminStats = async (): Promise<AdminStatsResponse> => {
    const response = await apiClient.get('/admin/stats');
    return response.data;
};

// ============================================
// STAFF API FUNCTIONS
// ============================================

import type { StaffMember, StaffResponse } from '../types/admin';

/**
 * Récupère la liste des membres du staff avec pagination et recherche
 */
export const getAdminStaff = async (page: number = 1, limit: number = 20, search: string = ''): Promise<StaffResponse> => {
    const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
    });
    if (search) {
        params.append('search', search);
    }
    
    const response = await apiClient.get(`/admin/staff?${params.toString()}`);
    return response.data;
};

/**
 * Crée un nouveau membre du staff
 */
export const createAdminStaff = async (data: {
    email: string;
    password: string;
    firstName?: string;
    lastName?: string;
    telephone?: string;
}): Promise<{ success: boolean; data: StaffMember; message: string }> => {
    const response = await apiClient.post('/admin/staff', data);
    return response.data;
};

/**
 * Met à jour un membre du staff
 */
export const updateAdminStaff = async (id: number, data: Partial<StaffMember>): Promise<{ success: boolean; data: StaffMember; message: string }> => {
    const response = await apiClient.put(`/admin/staff/${id}`, data);
    return response.data;
};