import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { UsersIcon, UserCheckIcon, BarChart3Icon, LogOutIcon, MenuIcon, XIcon, ShieldIcon } from 'lucide-react';
import { removeAuthToken } from '../../utils/auth';
import { apiClient } from '../../config/api';

interface AdminLayoutProps {
    children: React.ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [isSuperAdmin, setIsSuperAdmin] = useState(false);

    useEffect(() => {
        const checkSuperAdmin = async () => {
            try {
                const response = await apiClient.get('/auth/me');
                console.log('🔍 AdminLayout - Response from /auth/me:', response.data);
                if (response.data.success && response.data.data) {
                    const isSuperAdminValue = response.data.data.isSuperAdmin;
                    console.log('🔍 AdminLayout - isSuperAdmin value:', isSuperAdminValue, 'Type:', typeof isSuperAdminValue);
                    // Accepter true, 1, ou "1" comme valeur valide
                    const isSuperAdminBool = isSuperAdminValue === true || 
                                           isSuperAdminValue === 1 || 
                                           isSuperAdminValue === '1' ||
                                           isSuperAdminValue === 'true';
                    console.log('🔍 AdminLayout - Setting isSuperAdmin to:', isSuperAdminBool);
                    setIsSuperAdmin(isSuperAdminBool);
                } else {
                    console.warn('🔍 AdminLayout - No data in response:', response.data);
                }
            } catch (error: any) {
                console.error('Erreur lors de la vérification du statut super admin:', error);
                console.error('Error response:', error.response?.data);
            }
        };
        checkSuperAdmin();
    }, []);

    const handleLogout = () => {
        removeAuthToken();
        navigate('/');
    };

    // Construire le menu avec le lien staff conditionnel
    const baseMenuItems = [
        { path: '/admin', icon: BarChart3Icon, label: 'Statistiques', labelAr: 'الإحصائيات' },
        { path: '/admin/users', icon: UsersIcon, label: 'Gestion Utilisateurs', labelAr: 'إدارة المستخدمين' },
        { path: '/admin/attendance', icon: UserCheckIcon, label: 'Vérification Présence', labelAr: 'التحقق من الحضور' },
    ];

    const staffMenuItem = { path: '/admin/staff', icon: ShieldIcon, label: 'Gestion Staff', labelAr: 'إدارة الموظفين' };
    
    const menuItems = isSuperAdmin 
        ? [...baseMenuItems, staffMenuItem]
        : baseMenuItems;

    // Debug
    console.log('🔍 AdminLayout - isSuperAdmin:', isSuperAdmin);
    console.log('🔍 AdminLayout - menuItems count:', menuItems.length);

    const isActive = (path: string) => {
        if (path === '/admin') {
            return location.pathname === '/admin';
        }
        return location.pathname.startsWith(path);
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white shadow-sm border-b border-gray-200">
                <div className="px-3 sm:px-4 lg:px-6 xl:px-8">
                    <div className="flex justify-between items-center h-14 sm:h-16">
                        <div className="flex items-center min-w-0 flex-1">
                            <button
                                onClick={() => setSidebarOpen(!sidebarOpen)}
                                className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 flex-shrink-0"
                                aria-label="Toggle menu"
                            >
                                {sidebarOpen ? <XIcon className="h-5 w-5 sm:h-6 sm:w-6" /> : <MenuIcon className="h-5 w-5 sm:h-6 sm:w-6" />}
                            </button>
                            <h1 className="ml-2 lg:ml-0 text-base sm:text-lg lg:text-xl font-bold text-gray-900 truncate">
                                Panneau d'Administration
                            </h1>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="flex items-center space-x-1 sm:space-x-2 px-2 sm:px-3 lg:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0"
                        >
                            <LogOutIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                            <span className="hidden sm:inline">Déconnexion</span>
                        </button>
                    </div>
                </div>
            </header>

            <div className="flex">
                {/* Sidebar */}
                <aside
                    className={`${
                        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
                    } fixed lg:static lg:translate-x-0 top-14 sm:top-16 lg:top-0 bottom-0 left-0 z-50 w-56 sm:w-64 bg-white border-r border-gray-200 transform transition-transform duration-200 ease-in-out lg:transition-none`}
                >
                    <nav className="mt-4 sm:mt-5 px-2 sm:px-3 space-y-1">
                        {menuItems.map((item) => {
                            const Icon = item.icon;
                            const active = isActive(item.path);
                            return (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    onClick={() => setSidebarOpen(false)}
                                    className={`${
                                        active
                                            ? 'bg-blue-50 text-blue-700 border-blue-500'
                                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                    } group flex items-center px-2 sm:px-3 py-2 text-xs sm:text-sm font-medium rounded-lg border-l-4 transition-colors`}
                                >
                                    <Icon
                                        className={`${
                                            active ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-500'
                                        } mr-2 sm:mr-3 h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0`}
                                    />
                                    <span className="truncate">{item.label}</span>
                                </Link>
                            );
                        })}
                    </nav>
                </aside>

                {/* Overlay pour mobile */}
                {sidebarOpen && (
                    <div
                        className="fixed top-14 sm:top-16 bottom-0 left-0 right-0 bg-gray-600 bg-opacity-75 z-40 lg:hidden"
                        onClick={() => setSidebarOpen(false)}
                    />
                )}

                {/* Main content */}
                <main className="flex-1 lg:ml-0 min-w-0">
                    <div className="py-3 sm:py-4 lg:py-6">
                        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 xl:px-8">
                            {children}
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;

