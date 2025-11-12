import React, { useEffect, useState } from 'react';
import { UsersIcon, FileTextIcon, CheckCircleIcon, UserCheckIcon, UserXIcon, TrendingUpIcon } from 'lucide-react';
import { getAdminStats, type AdminStats } from '../../config/api';

const StatsBar: React.FC = () => {
    const [stats, setStats] = useState<AdminStats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await getAdminStats();
                if (response.success) {
                    setStats(response.data);
                }
            } catch (error) {
                console.error('Erreur lors du chargement des statistiques:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
        // Rafraîchir toutes les 30 secondes
        const interval = setInterval(fetchStats, 30000);
        return () => clearInterval(interval);
    }, []);

    if (loading || !stats) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
                {[...Array(5)].map((_, i) => (
                    <div key={i} className="bg-white rounded-lg shadow p-4 animate-pulse">
                        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                        <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                    </div>
                ))}
            </div>
        );
    }

    const statCards = [
        {
            label: 'Total Utilisateurs',
            value: stats.totalUsers,
            icon: UsersIcon,
            color: 'bg-blue-500',
            bgColor: 'bg-blue-50',
            textColor: 'text-blue-700'
        },
        {
            label: 'Tests Commencés',
            value: stats.usersWithTests,
            icon: FileTextIcon,
            color: 'bg-yellow-500',
            bgColor: 'bg-yellow-50',
            textColor: 'text-yellow-700'
        },
        {
            label: 'Tests Finalisés',
            value: stats.completedTests,
            icon: CheckCircleIcon,
            color: 'bg-green-500',
            bgColor: 'bg-green-50',
            textColor: 'text-green-700'
        },
        {
            label: 'Présents',
            value: stats.presentUsers,
            icon: UserCheckIcon,
            color: 'bg-emerald-500',
            bgColor: 'bg-emerald-50',
            textColor: 'text-emerald-700'
        },
        {
            label: 'Absents',
            value: stats.absentUsers,
            icon: UserXIcon,
            color: 'bg-red-500',
            bgColor: 'bg-red-50',
            textColor: 'text-red-700'
        }
    ];

    return (
        <div className="mb-4 sm:mb-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3 sm:gap-4 mb-3 sm:mb-4">
                {statCards.map((stat, index) => {
                    const Icon = stat.icon;
                    return (
                        <div
                            key={index}
                            className={`${stat.bgColor} rounded-lg shadow-sm p-3 sm:p-4 border border-gray-200`}
                        >
                            <div className="flex items-center justify-between">
                                <div className="min-w-0 flex-1">
                                    <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">{stat.label}</p>
                                    <p className={`text-xl sm:text-2xl font-bold ${stat.textColor} mt-1`}>
                                        {stat.value}
                                    </p>
                                </div>
                                <div className={`${stat.color} p-2 sm:p-3 rounded-lg flex-shrink-0 ml-2`}>
                                    <Icon className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Barres de progression */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
                <div className="bg-white rounded-lg shadow-sm p-3 sm:p-4 border border-gray-200">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs sm:text-sm font-medium text-gray-700">Taux de Complétion</span>
                        <span className="text-xs sm:text-sm font-bold text-gray-900">{stats.testCompletionRate}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 sm:h-3">
                        <div
                            className="bg-green-500 h-2 sm:h-3 rounded-full transition-all duration-500"
                            style={{ width: `${stats.testCompletionRate}%` }}
                        />
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm p-3 sm:p-4 border border-gray-200">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs sm:text-sm font-medium text-gray-700">Taux de Présence</span>
                        <span className="text-xs sm:text-sm font-bold text-gray-900">{stats.presenceRate}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 sm:h-3">
                        <div
                            className="bg-emerald-500 h-2 sm:h-3 rounded-full transition-all duration-500"
                            style={{ width: `${stats.presenceRate}%` }}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StatsBar;

