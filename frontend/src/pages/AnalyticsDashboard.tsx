import { useEffect, useState } from 'react';
import axios from 'axios';
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
    AreaChart,
    Area
} from 'recharts';
import { Activity, Shield, AlertTriangle, CheckCircle, TrendingUp, Clock } from 'lucide-react';

export const AnalyticsDashboard = () => {
    const [stats, setStats] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await axios.get('analytics');
                setStats(response.data);
            } catch (error) {
                console.error('Failed to fetch analytics', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchStats();
    }, []);

    if (isLoading) return (
        <div className="flex items-center justify-center min-h-[400px]">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
    );

    if (!stats) return <div className="text-center py-20 font-bold text-gray-400">Intelligence Data Unavailable</div>;

    const COLORS = ['#10b981', '#f59e0b', '#ef4444', '#6366f1', '#8b5cf6'];

    const statusIcons: any = {
        'OPEN': <Activity className="w-5 h-5 text-blue-500" />,
        'INVESTIGATING': <AlertTriangle className="w-5 h-5 text-yellow-500" />,
        'RESOLVED': <CheckCircle className="w-5 h-5 text-emerald-500" />,
        'DISMISSED': <Clock className="w-5 h-5 text-gray-500" />
    };

    return (
        <div className="space-y-8 animate-in">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-4xl font-black text-secondary tracking-tight">
                        Analytics <span className="text-gradient">Intelligence</span>
                    </h1>
                    <p className="text-gray-500 mt-1 font-medium">Real-time threat monitoring and trend analysis</p>
                </div>
                <div className="flex items-center gap-2 bg-emerald-50 text-emerald-600 px-4 py-2 rounded-xl border border-emerald-100 font-bold text-xs uppercase tracking-widest">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    Live Data Stream Active
                </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                <div className="glass-card p-6 rounded-2xl border-l-4 border-l-primary">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Total Reports</span>
                        <Shield className="w-4 h-4 text-primary opacity-30" />
                    </div>
                    <p className="text-3xl font-black text-secondary">{stats.totalReports}</p>
                </div>
                {stats.reportsByStatus.map((item: any) => (
                    <div key={item.status} className="glass-card p-6 rounded-2xl border-l-4 border-l-gray-200">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{item.status}</span>
                            {statusIcons[item.status] || <Activity className="w-4 h-4 text-gray-300" />}
                        </div>
                        <p className="text-3xl font-black text-secondary">{item.count}</p>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Trend Chart */}
                <div className="lg:col-span-8 glass-card p-8 rounded-[2rem]">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h2 className="text-xl font-black text-secondary tracking-tight">Report Frequency Trend</h2>
                            <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">Last 30 Days Activity</p>
                        </div>
                        <TrendingUp className="w-6 h-6 text-primary opacity-20" />
                    </div>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={stats.trend}>
                                <defs>
                                    <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#054a29" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#054a29" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis
                                    dataKey="date"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }}
                                    dy={10}
                                    tickFormatter={(str) => {
                                        const date = new Date(str);
                                        return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
                                    }}
                                />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }} />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: 'rgba(255, 255, 255, 0.9)',
                                        borderRadius: '16px',
                                        border: 'none',
                                        boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
                                        fontSize: '12px',
                                        fontWeight: 'bold'
                                    }}
                                />
                                <Area type="monotone" dataKey="count" stroke="#054a29" strokeWidth={3} fillOpacity={1} fill="url(#colorCount)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Severity Breakdown */}
                <div className="lg:col-span-4 glass-card p-8 rounded-[2rem]">
                    <div className="mb-8">
                        <h2 className="text-xl font-black text-secondary tracking-tight">Criticality Breakdown</h2>
                        <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">Severity Distribution</p>
                    </div>
                    <div className="h-[250px] w-full flex items-center justify-center">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={stats.reportsByPriority}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="count"
                                    nameKey="priority"
                                >
                                    {stats.reportsByPriority.map((_: any, index: number) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: '#fff',
                                        borderRadius: '12px',
                                        border: '1px solid #f1f5f9'
                                    }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="mt-4 grid grid-cols-2 gap-2">
                        {stats.reportsByPriority.map((entry: any, index: number) => (
                            <div key={entry.priority} className="flex items-center gap-2">
                                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{entry.priority}</span>
                                <span className="text-[10px] font-black text-secondary ml-auto">{entry.count}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Threat Vectors */}
                <div className="lg:col-span-12 glass-card p-8 rounded-[2rem]">
                    <div className="mb-10">
                        <h2 className="text-xl font-black text-secondary tracking-tight">Principal Threat Vectors</h2>
                        <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">Incident Categorization</p>
                    </div>
                    <div className="h-[250px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={stats.reportsByType}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis
                                    dataKey="type"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }}
                                    dy={10}
                                />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }} />
                                <Tooltip
                                    cursor={{ fill: 'rgba(5, 74, 41, 0.05)' }}
                                    contentStyle={{ border: 'none', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
                                />
                                <Bar
                                    dataKey="count"
                                    fill="#054a29"
                                    radius={[8, 8, 0, 0]}
                                    barSize={40}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
};
