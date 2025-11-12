import React, { useState, useEffect } from 'react';
import { UserCheckIcon, UserXIcon, QrCodeIcon } from 'lucide-react';
import { getAdminUsers, updateAdminUserPresence, type AdminUser } from '../../config/api';
import QrCodeScanner from './QrCodeScanner';
import { getRiasecColors, type RiasecType } from '../../utils/riasecColors';

const AbsenceChecker: React.FC = () => {
    const [users, setUsers] = useState<AdminUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [showScanner, setShowScanner] = useState(false);
    const [scannedUser, setScannedUser] = useState<AdminUser | null>(null);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const response = await getAdminUsers(1, 1000, ''); // Récupérer tous les utilisateurs
            if (response.success) {
                setUsers(response.data);
            }
        } catch (error) {
            console.error('Erreur lors du chargement des utilisateurs:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleTogglePresence = async (user: AdminUser) => {
        try {
            await updateAdminUserPresence(user.id, !user.isPresent);
            fetchUsers();
        } catch (error) {
            console.error('Erreur lors de la mise à jour de la présence:', error);
        }
    };

    const handleQrScan = async (qrCode: string) => {
        try {
            // Le scanner gère déjà la mise à jour via l'API
            // On rafraîchit juste la liste
            fetchUsers();
        } catch (error) {
            console.error('Erreur lors du scan:', error);
        }
    };

    const presentCount = users.filter(u => u.isPresent).length;
    const absentCount = users.length - presentCount;

    return (
        <div>
            <div className="mb-4 sm:mb-6">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1 sm:mb-2">Vérification de Présence</h2>
                <p className="text-sm sm:text-base text-gray-600">Gérez la présence des participants à l'événement</p>
            </div>

            {/* Statistiques rapides */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-4 sm:mb-6">
                <div className="bg-white rounded-lg shadow p-4 border border-gray-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Total</p>
                            <p className="text-2xl font-bold text-gray-900">{users.length}</p>
                        </div>
                        <UserCheckIcon className="h-8 w-8 text-gray-400" />
                    </div>
                </div>
                <div className="bg-green-50 rounded-lg shadow p-4 border border-green-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-green-700">Présents</p>
                            <p className="text-2xl font-bold text-green-900">{presentCount}</p>
                        </div>
                        <UserCheckIcon className="h-8 w-8 text-green-500" />
                    </div>
                </div>
                <div className="bg-red-50 rounded-lg shadow p-4 border border-red-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-red-700">Absents</p>
                            <p className="text-2xl font-bold text-red-900">{absentCount}</p>
                        </div>
                        <UserXIcon className="h-8 w-8 text-red-500" />
                    </div>
                </div>
            </div>

            {/* Bouton Scanner QR Code */}
            <div className="mb-4">
                <button
                    onClick={() => setShowScanner(true)}
                    className="flex items-center justify-center space-x-2 px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm sm:text-base w-full sm:w-auto"
                >
                    <QrCodeIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                    <span>Scanner QR Code</span>
                </button>
            </div>

            {/* Table */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
                {loading ? (
                    <div className="p-8 text-center">
                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        <p className="mt-2 text-gray-600">Chargement...</p>
                    </div>
                ) : users.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">
                        Aucun utilisateur trouvé
                    </div>
                ) : (
                    <div className="overflow-x-auto -mx-3 sm:mx-0">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-3 sm:px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Utilisateur
                                    </th>
                                    <th className="px-3 sm:px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                                        Email
                                    </th>
                                    <th className="px-3 sm:px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        État Test
                                    </th>
                                    <th className="px-3 sm:px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">
                                        Profil RIASEC
                                    </th>
                                    <th className="px-3 sm:px-4 lg:px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Présence
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {users.map((user) => {
                                    const dominantColors = user.dominantProfile 
                                        ? getRiasecColors(user.dominantProfile as RiasecType)
                                        : null;

                                    return (
                                        <tr key={user.id} className={user.isPresent ? 'bg-green-50' : ''}>
                                            <td className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4">
                                                <div className="flex items-center">
                                                    {dominantColors && user.testCompleted && user.allStepsCompleted && (
                                                        <div
                                                            className="w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-white text-xs sm:text-sm font-bold mr-2 sm:mr-3 flex-shrink-0"
                                                            style={{ backgroundColor: dominantColors.color }}
                                                        >
                                                            {dominantColors.letter}
                                                        </div>
                                                    )}
                                                    <div className="min-w-0">
                                                        <div className="text-xs sm:text-sm font-medium text-gray-900 truncate">
                                                            {user.firstName || ''} {user.lastName || ''}
                                                        </div>
                                                        <div className="text-xs text-gray-500">
                                                            {user.telephone || '-'}
                                                        </div>
                                                        <div className="text-xs text-gray-500 md:hidden mt-1 truncate">
                                                            {user.email}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4 hidden md:table-cell">
                                                <div className="text-xs sm:text-sm text-gray-900 truncate max-w-xs">{user.email}</div>
                                            </td>
                                            <td className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4">
                                                <span className={`px-2 py-1 text-xs font-medium rounded-full whitespace-nowrap ${
                                                    user.testCompleted && user.allStepsCompleted
                                                        ? 'bg-green-100 text-green-800' 
                                                        : user.testStatus === 'en_cours'
                                                        ? 'bg-yellow-100 text-yellow-800'
                                                        : 'bg-gray-100 text-gray-800'
                                                }`}>
                                                    {user.testCompleted && user.allStepsCompleted ? 'Finalisé' : user.testStatus === 'en_cours' ? `En cours (${user.completedSteps?.length || 0}/7)` : 'Non commencé'}
                                                </span>
                                            </td>
                                            <td className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4 hidden lg:table-cell">
                                                {dominantColors && user.testCompleted && user.allStepsCompleted ? (
                                                    <div className="flex items-center space-x-2">
                                                        <div
                                                            className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                                                            style={{ backgroundColor: dominantColors.color }}
                                                        >
                                                            {dominantColors.letter}
                                                        </div>
                                                        <span className="text-xs sm:text-sm text-gray-700 truncate">{dominantColors.name.fr}</span>
                                                    </div>
                                                ) : (
                                                    <span className="text-xs sm:text-sm text-gray-400">-</span>
                                                )}
                                            </td>
                                            <td className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4 text-center">
                                                <button
                                                    onClick={() => handleTogglePresence(user)}
                                                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                                                        user.isPresent ? 'bg-green-500' : 'bg-gray-300'
                                                    }`}
                                                >
                                                    <span
                                                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                                            user.isPresent ? 'translate-x-6' : 'translate-x-1'
                                                        }`}
                                                    />
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Scanner QR Code Modal */}
            {showScanner && (
                <QrCodeScanner
                    onClose={() => {
                        setShowScanner(false);
                        setScannedUser(null);
                    }}
                    onScan={handleQrScan}
                    onUserScanned={(user) => {
                        setScannedUser(user);
                        fetchUsers();
                    }}
                />
            )}
        </div>
    );
};

export default AbsenceChecker;

