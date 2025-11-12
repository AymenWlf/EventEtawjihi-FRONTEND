import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { removeAuthToken } from '../utils/auth';
import { apiClient } from '../config/api';

const Logout: React.FC = () => {
    const navigate = useNavigate();

    useEffect(() => {
        const handleLogout = async () => {
            try {
                // Appeler l'endpoint de déconnexion du backend (optionnel)
                try {
                    await apiClient.post('/auth/logout');
                } catch (error) {
                    // Ignorer les erreurs de l'endpoint backend
                    console.log('Backend logout endpoint not available or error occurred');
                }

                // Supprimer le token du localStorage
                removeAuthToken();

                // Rediriger vers la page de login
                navigate('/', { replace: true });
            } catch (error) {
                console.error('Erreur lors de la déconnexion:', error);
                // Même en cas d'erreur, supprimer le token et rediriger
                removeAuthToken();
                navigate('/', { replace: true });
            }
        };

        handleLogout();
    }, [navigate]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="text-center">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
                <p className="text-gray-600">Déconnexion en cours...</p>
            </div>
        </div>
    );
};

export default Logout;

