import React, { useState } from 'react';
import { XIcon } from 'lucide-react';
import { createAdminUser } from '../../config/api';

interface CreateUserModalProps {
    onClose: () => void;
    onSave: () => void;
}

const CreateUserModal: React.FC<CreateUserModalProps> = ({ onClose, onSave }) => {
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        telephone: '',
        whatsappNumber: '',
        age: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        // Validation
        if (!formData.email || !formData.password) {
            setError('Email et mot de passe sont obligatoires');
            setLoading(false);
            return;
        }

        try {
            await createAdminUser({
                email: formData.email,
                password: formData.password,
                firstName: formData.firstName || undefined,
                lastName: formData.lastName || undefined,
                telephone: formData.telephone || undefined,
                whatsappNumber: formData.whatsappNumber || undefined,
                age: formData.age ? parseInt(formData.age.toString()) : undefined
            });
            onSave();
        } catch (err: any) {
            setError(err.response?.data?.message || err.message || 'Erreur lors de la création de l\'utilisateur');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
            <div className="relative mx-auto p-4 sm:p-5 border w-full max-w-md sm:w-96 shadow-lg rounded-md bg-white">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-gray-900">Ajouter un utilisateur</h3>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-500"
                    >
                        <XIcon className="h-6 w-6" />
                    </button>
                </div>

                {error && (
                    <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Email <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Mot de passe <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="password"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                                minLength={6}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Prénom
                            </label>
                            <input
                                type="text"
                                value={formData.firstName}
                                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Nom
                            </label>
                            <input
                                type="text"
                                value={formData.lastName}
                                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Téléphone
                            </label>
                            <input
                                type="tel"
                                value={formData.telephone}
                                onChange={(e) => setFormData({ ...formData, telephone: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                WhatsApp
                            </label>
                            <input
                                type="tel"
                                value={formData.whatsappNumber}
                                onChange={(e) => setFormData({ ...formData, whatsappNumber: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="06XXXXXXXX"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Âge
                            </label>
                            <input
                                type="number"
                                min="1"
                                max="120"
                                value={formData.age}
                                onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    </div>

                    <div className="mt-6 flex justify-end space-x-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                        >
                            Annuler
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                        >
                            {loading ? 'Création...' : 'Créer'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateUserModal;

