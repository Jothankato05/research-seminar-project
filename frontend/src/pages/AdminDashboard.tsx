import { useEffect, useState } from 'react';
import axios from 'axios';
import { Button } from '../components/ui/Button';

interface User {
    id: string;
    email: string;
    role: string;
    isLocked: boolean;
    failedLoginAttempts: number;
    createdAt: string;
}

interface AuditLog {
    id: string;
    action: string;
    details: string;
    createdAt: string;
    user: {
        email: string;
        role: string;
    } | null;
}

export const AdminDashboard = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
    const [activeTab, setActiveTab] = useState<'users' | 'audit'>('users');
    const [isLoading, setIsLoading] = useState(true);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const [usersRes, logsRes] = await Promise.all([
                axios.get('/admin/users'),
                axios.get('/admin/audit-logs'),
            ]);
            setUsers(usersRes.data);
            setAuditLogs(logsRes.data);
        } catch (error) {
            console.error('Failed to fetch admin data', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const toggleLock = async (userId: string) => {
        try {
            await axios.patch(`/admin/users/${userId}/lock`);
            // Optimistic update or refetch
            setUsers(users.map(u => u.id === userId ? { ...u, isLocked: !u.isLocked } : u));
        } catch (error) {
            console.error('Failed to toggle lock', error);
            alert('Failed to toggle lock');
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold">Admin Dashboard</h1>
                <div className="flex space-x-2">
                    <button
                        onClick={() => setActiveTab('users')}
                        className={`px-4 py-2 rounded-md text-sm font-medium ${activeTab === 'users'
                            ? 'bg-primary text-white'
                            : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                            }`}
                    >
                        User Management
                    </button>
                    <button
                        onClick={() => setActiveTab('audit')}
                        className={`px-4 py-2 rounded-md text-sm font-medium ${activeTab === 'audit'
                            ? 'bg-primary text-white'
                            : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                            }`}
                    >
                        Audit Logs
                    </button>
                </div>
            </div>

            {isLoading ? (
                <div>Loading...</div>
            ) : (
                <div className="bg-white shadow overflow-hidden sm:rounded-md">
                    {activeTab === 'users' ? (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joined</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {users.map((user) => (
                                        <tr key={user.id}>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{user.email}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.role}</td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {user.isLocked ? (
                                                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                                                        Locked
                                                    </span>
                                                ) : (
                                                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                                        Active
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {new Date(user.createdAt).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <Button
                                                    size="sm"
                                                    variant={user.isLocked ? 'primary' : 'outline'}
                                                    onClick={() => toggleLock(user.id)}
                                                >
                                                    {user.isLocked ? 'Unlock' : 'Lock'}
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Timestamp</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Details</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {auditLogs.map((log) => (
                                        <tr key={log.id}>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {new Date(log.createdAt).toLocaleString()}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {log.user ? log.user.email : 'System'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{log.action}</td>
                                            <td className="px-6 py-4 text-sm text-gray-500 max-w-md truncate">{log.details}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};
