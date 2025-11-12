export interface AdminUser {
    id: number;
    firstName: string | null;
    lastName: string | null;
    email: string;
    telephone: string | null;
    age: number | null;
    createdAt: string | null;
    lastLoginAt: string | null;
    isPresent: boolean;
    qrCode: string | null;
    testStatus: 'non_commencé' | 'en_cours' | 'finalisé';
    currentStep: string | null;
    testCompleted: boolean;
    completedSteps: string[];
    allStepsCompleted: boolean;
    dominantProfile: string | null;
    isStaff?: boolean;
    isSuperAdmin?: boolean;
}

export interface StaffMember {
    id: number;
    firstName: string | null;
    lastName: string | null;
    email: string;
    telephone: string | null;
    createdAt: string | null;
    lastLoginAt: string | null;
    isStaff: boolean;
    isSuperAdmin: boolean;
    roles: string[];
}

export interface StaffResponse {
    success: boolean;
    data: StaffMember[];
    pagination: AdminPagination;
}

export interface AdminStats {
    totalUsers: number;
    usersWithTests: number;
    completedTests: number;
    presentUsers: number;
    absentUsers: number;
    testCompletionRate: number;
    presenceRate: number;
}

export interface AdminPagination {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}

export interface AdminUsersResponse {
    success: boolean;
    data: AdminUser[];
    pagination: AdminPagination;
}

export interface AdminStatsResponse {
    success: boolean;
    data: AdminStats;
}

export interface QrScanResponse {
    success: boolean;
    data: {
        user: {
            id: number;
            firstName: string | null;
            lastName: string | null;
            email: string;
        };
        test: {
            hasTest: boolean;
            isCompleted: boolean;
            hasReport: boolean;
            dominantProfile: string | null;
        };
        presence: {
            isPresent: boolean;
            updatedAt: string;
        };
    };
}

