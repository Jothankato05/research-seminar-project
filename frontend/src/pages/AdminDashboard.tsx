import { useEffect, useState } from 'react';
import axios from 'axios';
import { Button } from '../components/ui/Button';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
} from 'recharts';
import {
    History,
    Search,
    Activity,
    ShieldCheck,
    Lock,
    Unlock,
    Users
} from 'lucide-react';

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
    const [searchTerm, setSearchTerm] = useState('');

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const [usersRes, logsRes] = await Promise.all([
                axios.get('admin/users'),
                axios.get('admin/audit-logs'),
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
            await axios.patch(`admin/users/${userId}/lock`);
            setUsers(users.map(u => u.id === userId ? { ...u, isLocked: !u.isLocked } : u));
        } catch (error) {
            console.error('Failed to toggle lock', error);
        }
    };

    const filteredUsers = users.filter(u => u.email.toLowerCase().includes(searchTerm.toLowerCase()));
    const filteredLogs = auditLogs.filter(l =>
        l.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
        l.user?.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const roleData = [
        { name: 'Admin', value: users.filter(u => u.role === 'ADMIN').length },
        { name: 'Staff', value: users.filter(u => u.role === 'STAFF').length },
        { name: 'Student', value: users.filter(u => u.role === 'STUDENT').length },
        { name: 'Analyst', value: users.filter(u => u.role === 'ANALYST').length },
    ].filter(d => d.value > 0);

    const COLORS = ['#10b981', '#f59e0b', '#ef4444', '#6366f1'];

    const actionCounts: Record<string, number> = {};
    auditLogs.forEach(log => {
        actionCounts[log.action] = (actionCounts[log.action] || 0) + 1;
    });
    const activityData = Object.keys(actionCounts).map(key => ({
        name: key,
        count: actionCounts[key],
    })).sort((a, b) => b.count - a.count).slice(0, 5);

    return (
        <div className="space-y-8 animate-in">
            {/* Header */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                <div>
                    <h1 className="text-4xl font-black text-secondary tracking-tight">
                        System <span className="text-gradient">Administration</span>
                    </h1>
                    <p className="text-gray-500 mt-1 font-medium">Global governance and audit monitoring</p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder={`Search ${activeTab}...`}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 pr-4 py-2 bg-white border border-gray-100 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all w-64 shadow-sm"
                        />
                    </div>
                </div>
            </div>

            {/* Quick Stats & Charts */}
            {!isLoading && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    <div className="lg:col-span-4 glass-card p-8 rounded-[2rem]">
                        <h3 className="text-sm font-black text-secondary uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                            <Users className="w-4 h-4 text-primary" /> User Distribution
                        </h3>
                        <div className="h-56">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={roleData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {roleData.map((_, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="mt-4 flex flex-wrap gap-4 justify-center">
                            {roleData.map((d, i) => (
                                <div key={d.name} className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }}></div>
                                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{d.name}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="lg:col-span-8 glass-card p-8 rounded-[2rem]">
                        <h3 className="text-sm font-black text-secondary uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                            <Activity className="w-4 h-4 text-primary" /> Key System Activities
                        </h3>
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={activityData} layout="vertical">
                                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                                    <XAxis type="number" hide />
                                    <YAxis dataKey="name" type="category" width={120} tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                                    <Tooltip cursor={{ fill: 'rgba(5, 74, 41, 0.05)' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }} />
                                    <Bar dataKey="count" fill="#054a29" radius={[0, 8, 8, 0]} barSize={20} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            )}

            {/* Navigation Tabs */}
            <div className="flex bg-white/50 backdrop-blur-sm p-1.5 rounded-2xl border border-gray-100 w-fit">
                <button
                    onClick={() => setActiveTab('users')}
                    className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-300 ${activeTab === 'users'
                            ? 'bg-primary text-white shadow-lg shadow-primary/20'
                            : 'text-gray-400 hover:text-secondary hover:bg-white'
                        }`}
                >
                    <ShieldCheck className="w-4 h-4" />
                    User Management
                </button>
                <button
                    onClick={() => setActiveTab('audit')}
                    className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-300 ${activeTab === 'audit'
                            ? 'bg-primary text-white shadow-lg shadow-primary/20'
                            : 'text-gray-400 hover:text-secondary hover:bg-white'
                        }`}
                >
                    <History className="w-4 h-4" />
                    Audit Logs
                </button>
            </div>

            {/* Data View */}
            {isLoading ? (
                <div className="flex items-center justify-center py-20">
                    <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                </div>
            ) : (
                <div className="glass-card rounded-[2.5rem] overflow-hidden border-white/40">
                    {activeTab === 'users' ? (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-gray-50/50">
                                    <tr>
                                        <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Identity</th>
                                        <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Role</th>
                                        <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Security Status</th>
                                        <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100/50">
                                    {filteredUsers.map((user) => (
                                        <tr key={user.id} className="hover:bg-gray-50/30 transition-colors group">
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-xl bg-primary/5 flex items-center justify-center text-primary font-black text-xs">
                                                        {user.email.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-black text-secondary">{user.email}</p>
                                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">Registered {new Date(user.createdAt).toLocaleDateString()}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <span className="px-3 py-1 bg-gray-100 rounded-lg text-[10px] font-black text-gray-500 uppercase tracking-widest">
                                                    {user.role}
                                                </span>
                                            </td>
                                            <td className="px-8 py-6">
                                                {user.isLocked ? (
                                                    <span className="flex items-center gap-2 text-red-500 text-[10px] font-black uppercase tracking-widest">
                                                        <Lock className="w-3 h-3" /> Breach Protocol / Locked
                                                    </span>
                                                ) : (
                                                    <span className="flex items-center gap-2 text-emerald-500 text-[10px] font-black uppercase tracking-widest">
                                                        <Unlock className="w-3 h-3" /> Secure / Active
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-8 py-6 text-right">
                                                <Button
                                                    className={`rounded-xl px-4 py-2 font-black text-[10px] uppercase tracking-widest transition-all ${user.isLocked
                                                            ? 'bg-emerald-500 hover:bg-emerald-600 shadow-emerald-200'
                                                            : 'bg-red-500 hover:bg-red-600 shadow-red-200'
                                                        } text-white shadow-lg`}
                                                    onClick={() => toggleLock(user.id)}
                                                >
                                                    {user.isLocked ? 'Unlock Access' : 'Suspend Access'}
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-gray-50/50">
                                    <tr>
                                        <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Event Timestamp</th>
                                        <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Agent</th>
                                        <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Operation</th>
                                        <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Data Details</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100/50">
                                    {filteredLogs.map((log) => (
                                        <tr key={log.id} className="hover:bg-gray-50/30 transition-colors">
                                            <td className="px-8 py-6 text-xs font-bold text-gray-400">
                                                {new Date(log.createdAt).toLocaleString()}
                                            </td>
                                            <td className="px-8 py-6">
                                                <span className="text-sm font-black text-secondary">
                                                    {log.user ? log.user.email : 'System Terminal'}
                                                </span>
                                            </td>
                                            <td className="px-8 py-6">
                                                <span className="px-3 py-1 bg-primary/5 text-primary border border-primary/10 rounded-lg text-[10px] font-black uppercase tracking-widest">
                                                    {log.action}
                                                </span>
                                            </td>
                                            <td className="px-8 py-6 text-xs text-gray-500 font-medium">
                                                {log.details}
                                            </td>
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
