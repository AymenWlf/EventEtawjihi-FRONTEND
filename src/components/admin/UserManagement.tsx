import React, { useState, useEffect } from 'react';
import { SearchIcon, EditIcon, EyeIcon, FileTextIcon, ChevronLeftIcon, ChevronRightIcon, QrCodeIcon, DownloadIcon, PlusIcon, MessageCircleIcon } from 'lucide-react';
import { getAdminUsers, updateAdminUserPresence, type AdminUser } from '../../config/api';
import { apiClient } from '../../config/api';
import EditUserModal from './EditUserModal';
import CreateUserModal from './CreateUserModal';
import UserReportModal from './UserReportModal';
import InvitationMessageModal from './InvitationMessageModal';
import { getRiasecColors, type RiasecType } from '../../utils/riasecColors';

const UserManagement: React.FC = () => {
    const [users, setUsers] = useState<AdminUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);
    const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
    const [creatingUser, setCreatingUser] = useState(false);
    const [viewingReport, setViewingReport] = useState<number | null>(null);
    const [invitationUser, setInvitationUser] = useState<AdminUser | null>(null);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const response = await getAdminUsers(page, 20, search);
            if (response.success) {
                setUsers(response.data);
                setTotalPages(response.pagination.totalPages);
                setTotal(response.pagination.total);
            }
        } catch (error) {
            console.error('Erreur lors du chargement des utilisateurs:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, [page, search]);

    const handleTogglePresence = async (user: AdminUser) => {
        try {
            await updateAdminUserPresence(user.id, !user.isPresent);
            fetchUsers();
        } catch (error) {
            console.error('Erreur lors de la mise à jour de la présence:', error);
        }
    };

    const handleDownloadQrCode = async (userId: number, userName: string) => {
        try {
            const response = await apiClient.get(`/admin/users/${userId}/qr-code-pdf`, {
                responseType: 'blob'
            });
            
            // Créer un lien de téléchargement
            const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `qr-code-${userName.replace(/\s+/g, '-').toLowerCase()}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Erreur lors du téléchargement du QR code:', error);
            alert('Erreur lors du téléchargement du QR code');
        }
    };

    const getStatusBadge = (user: AdminUser) => {
        const statusConfig = {
            'non_commencé': { label: 'Non commencé', color: 'bg-gray-100 text-gray-800' },
            'en_cours': { label: 'En cours', color: 'bg-yellow-100 text-yellow-800' },
            'finalisé': { label: 'Finalisé', color: 'bg-green-100 text-green-800' }
        };

        const config = statusConfig[user.testStatus];
        return (
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${config.color}`}>
                {config.label}
            </span>
        );
    };

    const getRowStyle = (user: AdminUser) => {
        if (user.testCompleted && user.allStepsCompleted && user.dominantProfile) {
            const colors = getRiasecColors(user.dominantProfile as RiasecType);
            return {
                backgroundColor: colors.lightColor,
                borderLeft: `4px solid ${colors.color}`
            };
        }
        return {};
    };

    const formatDate = (dateString: string | null) => {
        if (!dateString) return '-';
        const date = new Date(dateString);
        return date.toLocaleDateString('fr-FR', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div>
            <div className="mb-4 sm:mb-6 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-0">
                <div className="min-w-0 flex-1">
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1 sm:mb-2">Gestion des Utilisateurs</h2>
                    <p className="text-sm sm:text-base text-gray-600">Gérez les utilisateurs et consultez leurs tests d'orientation</p>
                </div>
                <button
                    onClick={() => setCreatingUser(true)}
                    className="flex items-center justify-center space-x-2 px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm sm:text-base whitespace-nowrap flex-shrink-0"
                >
                    <PlusIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                    <span>Ajouter un utilisateur</span>
                </button>
            </div>

            {/* Barre de recherche */}
            <div className="mb-4">
                <div className="relative">
                    <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <input
                        type="text"
                        placeholder="Rechercher par nom, email, téléphone..."
                        value={search}
                        onChange={(e) => {
                            setSearch(e.target.value);
                            setPage(1);
                        }}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                </div>
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
                    <>
                        <div className="overflow-x-auto -mx-3 sm:mx-0">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-3 sm:px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Code
                                        </th>
                                        <th className="px-3 sm:px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Utilisateur
                                        </th>
                                        <th className="px-3 sm:px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                                            Contact
                                        </th>
                                        <th className="px-3 sm:px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">
                                            Dates
                                        </th>
                                        <th className="px-3 sm:px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            État Test
                                        </th>
                                        <th className="px-3 sm:px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                                            Présence
                                        </th>
                                        <th className="px-3 sm:px-4 lg:px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {users.map((user) => {
                                        const rowStyle = getRowStyle(user);
                                        const dominantColors = user.dominantProfile 
                                            ? getRiasecColors(user.dominantProfile as RiasecType)
                                            : null;

                                        return (
                                            <tr key={user.id} style={rowStyle}>
                                                <td className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4 whitespace-nowrap">
                                                    <span className="font-mono text-xs sm:text-sm font-semibold text-blue-600">
                                                        {user.userCode || `ET-${String(user.id).padStart(4, '0')}`}
                                                    </span>
                                                </td>
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
                                                                {user.age ? `${user.age} ans` : 'Âge non renseigné'}
                                                            </div>
                                                            <div className="text-xs text-gray-500 md:hidden mt-1 truncate">
                                                                {user.email}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4 hidden md:table-cell">
                                                    <div className="text-xs sm:text-sm text-gray-900 truncate max-w-xs">{user.email}</div>
                                                    <div className="text-xs sm:text-sm text-gray-500">{user.telephone || '-'}</div>
                                                </td>
                                                <td className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4 text-xs sm:text-sm text-gray-500 hidden lg:table-cell">
                                                    <div className="truncate max-w-xs">Créé: {formatDate(user.createdAt)}</div>
                                                    <div className="truncate max-w-xs">Dernière: {formatDate(user.lastLoginAt)}</div>
                                                </td>
                                                <td className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4">
                                                    {getStatusBadge(user)}
                                                    {user.currentStep && (
                                                        <div className="text-xs text-gray-500 mt-1 truncate">
                                                            Étape: {user.currentStep}
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4 hidden sm:table-cell">
                                                    <button
                                                        onClick={() => handleTogglePresence(user)}
                                                        className={`px-2 sm:px-3 py-1 text-xs font-medium rounded-full whitespace-nowrap ${
                                                            user.isPresent
                                                                ? 'bg-green-100 text-green-800'
                                                                : 'bg-gray-100 text-gray-800'
                                                        }`}
                                                    >
                                                        {user.isPresent ? 'Présent' : 'Absent'}
                                                    </button>
                                                </td>
                                                <td className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4 text-right text-xs sm:text-sm font-medium">
                                                    <div className="flex items-center justify-end space-x-1 sm:space-x-2 flex-wrap gap-1 sm:gap-0">
                                                        <button
                                                            onClick={() => handleDownloadQrCode(user.id, `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email)}
                                                            className="text-purple-600 hover:text-purple-900 p-1 sm:p-0"
                                                            title="Télécharger QR Code PDF"
                                                        >
                                                            <DownloadIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                                                        </button>
                                                        <button
                                                            onClick={() => setViewingReport(user.id)}
                                                            className="text-blue-600 hover:text-blue-900 p-1 sm:p-0"
                                                            title="Voir l'état du test"
                                                        >
                                                            <EyeIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                                                        </button>
                                                        {user.testCompleted && user.allStepsCompleted && (
                                                            <button
                                                                onClick={() => setViewingReport(user.id)}
                                                                className="text-green-600 hover:text-green-900 p-1 sm:p-0"
                                                                title="Générer le rapport"
                                                            >
                                                                <FileTextIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                                                            </button>
                                                        )}
                                                        <button
                                                            onClick={() => setInvitationUser(user)}
                                                            className="text-green-600 hover:text-green-900 p-1 sm:p-0"
                                                            title="Générer le message d'invitation"
                                                        >
                                                            <MessageCircleIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                                                        </button>
                                                        <button
                                                            onClick={() => setEditingUser(user)}
                                                            className="text-yellow-600 hover:text-yellow-900 p-1 sm:p-0"
                                                            title="Modifier"
                                                        >
                                                            <EditIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        <div className="bg-white px-3 sm:px-4 lg:px-6 py-3 flex items-center justify-between border-t border-gray-200">
                            <div className="flex-1 flex justify-between sm:hidden">
                                <button
                                    onClick={() => setPage(p => Math.max(1, p - 1))}
                                    disabled={page === 1}
                                    className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                                >
                                    Précédent
                                </button>
                                <button
                                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                    disabled={page === totalPages}
                                    className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                                >
                                    Suivant
                                </button>
                            </div>
                            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                                <div>
                                    <p className="text-sm text-gray-700">
                                        Affichage de <span className="font-medium">{(page - 1) * 20 + 1}</span> à{' '}
                                        <span className="font-medium">{Math.min(page * 20, total)}</span> sur{' '}
                                        <span className="font-medium">{total}</span> résultats
                                    </p>
                                </div>
                                <div>
                                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                                        <button
                                            onClick={() => setPage(p => Math.max(1, p - 1))}
                                            disabled={page === 1}
                                            className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                                        >
                                            <ChevronLeftIcon className="h-5 w-5" />
                                        </button>
                                        {[...Array(totalPages)].map((_, i) => {
                                            const pageNum = i + 1;
                                            if (
                                                pageNum === 1 ||
                                                pageNum === totalPages ||
                                                (pageNum >= page - 1 && pageNum <= page + 1)
                                            ) {
                                                return (
                                                    <button
                                                        key={pageNum}
                                                        onClick={() => setPage(pageNum)}
                                                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                                                            page === pageNum
                                                                ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                                                                : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                                                        }`}
                                                    >
                                                        {pageNum}
                                                    </button>
                                                );
                                            } else if (pageNum === page - 2 || pageNum === page + 2) {
                                                return <span key={pageNum} className="px-4 py-2 text-gray-500">...</span>;
                                            }
                                            return null;
                                        })}
                                        <button
                                            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                            disabled={page === totalPages}
                                            className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                                        >
                                            <ChevronRightIcon className="h-5 w-5" />
                                        </button>
                                    </nav>
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </div>

            {/* Modals */}
            {creatingUser && (
                <CreateUserModal
                    onClose={() => setCreatingUser(false)}
                    onSave={() => {
                        setCreatingUser(false);
                        fetchUsers();
                    }}
                />
            )}

            {editingUser && (
                <EditUserModal
                    user={editingUser}
                    onClose={() => setEditingUser(null)}
                    onSave={() => {
                        setEditingUser(null);
                        fetchUsers();
                    }}
                />
            )}

            {viewingReport !== null && (
                <UserReportModal
                    userId={viewingReport}
                    onClose={() => setViewingReport(null)}
                />
            )}

            {invitationUser && (
                <InvitationMessageModal
                    user={invitationUser}
                    onClose={() => setInvitationUser(null)}
                />
            )}
        </div>
    );
};

export default UserManagement;

