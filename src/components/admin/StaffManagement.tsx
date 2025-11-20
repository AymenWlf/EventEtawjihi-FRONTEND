import React, { useState, useEffect } from 'react';
import { SearchIcon, EditIcon, PlusIcon, ChevronLeftIcon, ChevronRightIcon, ShieldIcon, UserCheckIcon } from 'lucide-react';
import { getAdminStaff, createAdminStaff, updateAdminStaff, type StaffMember } from '../../config/api';
import EditStaffModal from './EditStaffModal';

const StaffManagement: React.FC = () => {
    const [staff, setStaff] = useState<StaffMember[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);
    const [editingStaff, setEditingStaff] = useState<StaffMember | null>(null);
    const [showCreateModal, setShowCreateModal] = useState(false);

    const fetchStaff = async () => {
        setLoading(true);
        try {
            const response = await getAdminStaff(page, 20, search);
            if (response.success) {
                setStaff(response.data);
                setTotalPages(response.pagination.totalPages);
                setTotal(response.pagination.total);
            }
        } catch (error: any) {
            console.error('Erreur lors du chargement du staff:', error);
            if (error.response?.status === 403) {
                alert('Accès refusé. Seuls les super administrateurs peuvent gérer le staff.');
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStaff();
    }, [page, search]);

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

    const handleCreate = async (data: {
        email: string;
        password: string;
        firstName?: string;
        lastName?: string;
        telephone?: string;
    }) => {
        try {
            await createAdminStaff(data);
            setShowCreateModal(false);
            fetchStaff();
        } catch (error: any) {
            console.error('Erreur lors de la création:', error);
            alert(error.response?.data?.message || 'Erreur lors de la création du membre du staff');
        }
    };

    const handleUpdate = async (id: number, data: Partial<StaffMember>) => {
        try {
            await updateAdminStaff(id, data);
            setEditingStaff(null);
            fetchStaff();
        } catch (error: any) {
            console.error('Erreur lors de la mise à jour:', error);
            alert(error.response?.data?.message || 'Erreur lors de la mise à jour du membre du staff');
        }
    };

    return (
        <div>
            <div className="mb-4 sm:mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
                <div className="min-w-0 flex-1">
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Gestion du Staff</h2>
                    <p className="mt-1 text-xs sm:text-sm text-gray-600">
                        Gérez les membres du staff avec accès administrateur
                    </p>
                </div>
                <button
                    onClick={() => setShowCreateModal(true)}
                    className="flex items-center justify-center space-x-2 px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm sm:text-base whitespace-nowrap flex-shrink-0"
                >
                    <PlusIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                    <span>Ajouter un membre</span>
                </button>
            </div>

            {/* Barre de recherche */}
            <div className="mb-4">
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <SearchIcon className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                        type="text"
                        placeholder="Rechercher par nom, email ou téléphone..."
                        value={search}
                        onChange={(e) => {
                            setSearch(e.target.value);
                            setPage(1);
                        }}
                        className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                </div>
            </div>

            {/* Tableau */}
            {loading ? (
                <div className="text-center py-12">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <p className="mt-2 text-gray-600">Chargement...</p>
                </div>
            ) : staff.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-lg shadow">
                    <UserCheckIcon className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">Aucun membre du staff</h3>
                    <p className="mt-1 text-sm text-gray-500">
                        Commencez par ajouter un nouveau membre du staff.
                    </p>
                </div>
            ) : (
                <div className="bg-white shadow overflow-hidden sm:rounded-md">
                    <div className="overflow-x-auto -mx-3 sm:mx-0">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-3 sm:px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Membre
                                    </th>
                                    <th className="px-3 sm:px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                                        Contact
                                    </th>
                                    <th className="px-3 sm:px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">
                                        Dates
                                    </th>
                                    <th className="px-3 sm:px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Statut
                                    </th>
                                    <th className="px-3 sm:px-4 lg:px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {staff.map((member) => (
                                    <tr key={member.id}>
                                        <td className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4">
                                            <div className="flex items-center">
                                                <div className="flex-shrink-0 h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-blue-100 flex items-center justify-center">
                                                    <ShieldIcon className="h-4 w-4 sm:h-6 sm:w-6 text-blue-600" />
                                                </div>
                                                <div className="ml-2 sm:ml-4 min-w-0 flex-1">
                                                    <div className="text-xs sm:text-sm font-medium text-gray-900 truncate">
                                                        {member.firstName || ''} {member.lastName || ''}
                                                    </div>
                                                    <div className="text-xs sm:text-sm text-gray-500">
                                                        {member.isSuperAdmin ? 'Super Admin' : 'Admin'}
                                                    </div>
                                                    <div className="text-xs text-gray-500 md:hidden mt-1 truncate">
                                                        {member.email}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4 hidden md:table-cell">
                                            <div className="text-xs sm:text-sm text-gray-900 truncate max-w-xs">{member.email}</div>
                                            <div className="text-xs sm:text-sm text-gray-500">{member.telephone || '-'}</div>
                                        </td>
                                        <td className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4 text-xs sm:text-sm text-gray-500 hidden lg:table-cell">
                                            <div className="truncate max-w-xs">Créé: {formatDate(member.createdAt)}</div>
                                            <div className="truncate max-w-xs">Dernière: {formatDate(member.lastLoginAt)}</div>
                                        </td>
                                        <td className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4">
                                            <span className={`px-2 py-1 text-xs font-medium rounded-full whitespace-nowrap ${
                                                member.isSuperAdmin
                                                    ? 'bg-purple-100 text-purple-800'
                                                    : 'bg-blue-100 text-blue-800'
                                            }`}>
                                                {member.isSuperAdmin ? 'Super Admin' : 'Staff'}
                                            </span>
                                        </td>
                                        <td className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4 text-right text-xs sm:text-sm font-medium">
                                            <button
                                                onClick={() => setEditingStaff(member)}
                                                className="text-yellow-600 hover:text-yellow-900 p-1 sm:p-0"
                                                title="Modifier"
                                            >
                                                <EditIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="bg-white px-3 sm:px-4 lg:px-6 py-3 flex items-center justify-between border-t border-gray-200 mt-4">
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
                                {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
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
                                ))}
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
            )}

            {/* Modals */}
            {showCreateModal && (
                <CreateStaffModal
                    onClose={() => setShowCreateModal(false)}
                    onSave={handleCreate}
                />
            )}

            {editingStaff && (
                <EditStaffModal
                    staff={editingStaff}
                    onClose={() => setEditingStaff(null)}
                    onSave={(data) => handleUpdate(editingStaff.id, data)}
                />
            )}
        </div>
    );
};

// Modal de création
interface CreateStaffModalProps {
    onClose: () => void;
    onSave: (data: {
        email: string;
        password: string;
        firstName?: string;
        lastName?: string;
        telephone?: string;
    }) => void;
}

const CreateStaffModal: React.FC<CreateStaffModalProps> = ({ onClose, onSave }) => {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        firstName: '',
        lastName: '',
        telephone: ''
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.email || !formData.password) {
            alert('Email et mot de passe sont requis');
            return;
        }
        onSave(formData);
    };

    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
            <div className="relative mx-auto p-5 border w-full max-w-md shadow-lg rounded-md bg-white">
                <div className="mt-3">
                    <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">Ajouter un membre du staff</h3>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Email *</label>
                            <input
                                type="email"
                                required
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Mot de passe *</label>
                            <input
                                type="password"
                                required
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Prénom</label>
                            <input
                                type="text"
                                value={formData.firstName}
                                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Nom</label>
                            <input
                                type="text"
                                value={formData.lastName}
                                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Téléphone</label>
                            <input
                                type="tel"
                                value={formData.telephone}
                                onChange={(e) => setFormData({ ...formData, telephone: e.target.value })}
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>
                        <div className="flex justify-end space-x-3 pt-4">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                            >
                                Annuler
                            </button>
                            <button
                                type="submit"
                                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                            >
                                Créer
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default StaffManagement;

