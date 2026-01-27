import { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { Modal } from '../components/ui/Modal';
import {
    AlertCircle,
    Clock,
    CheckCircle2,
    XCircle,
    ChevronRight,
    Calendar,
    Hash,
    ShieldInfo
} from 'lucide-react';

interface Report {
    id: string;
    title: string;
    description: string;
    status: string;
    createdAt: string;
    type: string;
}

export const MyReports = () => {
    const [reports, setReports] = useState<Report[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filter, setFilter] = useState('ALL');
    const [selectedReport, setSelectedReport] = useState<Report | null>(null);

    useEffect(() => {
        const fetchReports = async () => {
            setIsLoading(true);
            try {
                // Fetch only reports submitted by the current user
                const response = await axios.get('reports/my?limit=100');
                setReports(response.data.data);
            } catch (error) {
                console.error('Failed to fetch reports', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchReports();
    }, []);

    const filteredReports = filter === 'ALL'
        ? reports
        : reports.filter(r => r.status === filter);

    const statusConfig: any = {
        'ALL': { icon: <ShieldInfo className="w-4 h-4" />, color: 'text-secondary', bg: 'bg-gray-100' },
        'OPEN': { icon: <AlertCircle className="w-4 h-4" />, color: 'text-blue-500', bg: 'bg-blue-50' },
        'INVESTIGATING': { icon: <Clock className="w-4 h-4" />, color: 'text-yellow-500', bg: 'bg-yellow-50' },
        'RESOLVED': { icon: <CheckCircle2 className="w-4 h-4" />, color: 'text-emerald-500', bg: 'bg-emerald-50' },
        'DISMISSED': { icon: <XCircle className="w-4 h-4" />, color: 'text-gray-400', bg: 'bg-gray-50' }
    };

    return (
        <div className="space-y-8 animate-in">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-4xl font-black text-secondary tracking-tight">
                        My <span className="text-gradient">Reports</span>
                    </h1>
                    <p className="text-gray-500 mt-1 font-medium italic">Track and manage your security submissions</p>
                </div>
                <Link
                    to="/submit-report"
                    className="group relative inline-flex items-center justify-center px-8 py-3.5 font-bold text-white transition-all duration-300 bg-primary rounded-2xl hover:bg-primary-light hover:scale-105 active:scale-95 shadow-xl shadow-primary/20"
                >
                    <span className="relative flex items-center gap-2">
                        New Incident Report
                        <ChevronRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                    </span>
                </Link>
            </div>

            {/* Filter Tabs */}
            <div className="flex bg-white/50 backdrop-blur-sm p-1.5 rounded-2xl border border-gray-100 w-fit overflow-x-auto">
                {['ALL', 'OPEN', 'INVESTIGATING', 'RESOLVED', 'DISMISSED'].map((status) => (
                    <button
                        key={status}
                        onClick={() => setFilter(status)}
                        className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 whitespace-nowrap ${filter === status
                            ? 'bg-primary text-white shadow-lg shadow-primary/20'
                            : 'text-gray-400 hover:text-secondary hover:bg-white'
                            }`}
                    >
                        {statusConfig[status].icon}
                        {status}
                    </button>
                ))}
            </div>

            {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="h-56 rounded-[2rem] bg-gray-100 animate-pulse"></div>
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredReports.map((report, index) => (
                        <div
                            key={report.id}
                            onClick={() => setSelectedReport(report)}
                            className="glass-card p-8 rounded-[2rem] flex flex-col justify-between group cursor-pointer border-white/40"
                            style={{ animationDelay: `${index * 50}ms` }}
                        >
                            <div>
                                <div className="flex justify-between items-start mb-6">
                                    <span className={`px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-lg border shadow-sm ${statusConfig[report.status].bg} ${statusConfig[report.status].color} border-white/40`}>
                                        {report.status}
                                    </span>
                                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest bg-gray-50 px-2 py-0.5 rounded-md">
                                        {report.type}
                                    </span>
                                </div>
                                <h3 className="text-xl font-black text-secondary mb-3 line-clamp-2 group-hover:text-primary transition-colors leading-tight pr-4">
                                    {report.title}
                                </h3>
                                <p className="text-sm text-gray-500 font-medium line-clamp-2 leading-relaxed opacity-70 group-hover:opacity-100 transition-opacity">
                                    {report.description}
                                </p>
                            </div>

                            <div className="mt-8 pt-6 border-t border-gray-100/50 flex justify-between items-center">
                                <div className="flex flex-col">
                                    <span className="text-[10px] text-gray-400 uppercase font-black tracking-widest flex items-center gap-1.5"><Calendar className="w-3 h-3" /> Submitted</span>
                                    <span className="text-xs font-black text-secondary mt-1">
                                        {new Date(report.createdAt).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}
                                    </span>
                                </div>
                                <div className="w-10 h-10 rounded-xl bg-primary/5 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                                    <ChevronRight className="w-5 h-5" />
                                </div>
                            </div>
                        </div>
                    ))}

                    {filteredReports.length === 0 && (
                        <div className="col-span-full py-24 glass-card rounded-[3rem] flex flex-col items-center justify-center text-center border-dashed border-2">
                            <div className="w-20 h-20 bg-gray-50 rounded-2xl flex items-center justify-center mb-6 text-gray-200">
                                <ShieldInfo className="w-10 h-10" />
                            </div>
                            <h3 className="text-xl font-black text-secondary">No Reports Found</h3>
                            <p className="text-gray-500 max-w-xs mt-2 font-medium italic">
                                {filter === 'ALL'
                                    ? "You haven't submitted any security incident reports yet."
                                    : `No reports found with status ${filter}.`}
                            </p>
                        </div>
                    )}
                </div>
            )}

            {/* Personalized Report Detail Modal */}
            <Modal
                isOpen={!!selectedReport}
                onClose={() => setSelectedReport(null)}
                title="Incident Tracking"
            >
                {selectedReport && (
                    <div className="space-y-8">
                        <div className="flex items-center justify-between">
                            <div className={`flex items-center gap-2 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${statusConfig[selectedReport.status].bg} ${statusConfig[selectedReport.status].color} border border-white/20 shadow-sm`}>
                                {statusConfig[selectedReport.status].icon}
                                {selectedReport.status}
                            </div>
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest bg-gray-50 px-3 py-1 rounded-lg flex items-center gap-1.5">
                                <Hash className="w-3 h-3" /> {selectedReport.id.slice(0, 8)}
                            </span>
                        </div>

                        <div>
                            <h3 className="text-3xl font-black text-secondary tracking-tight mb-4 leading-tight">
                                {selectedReport.title}
                            </h3>
                            <div className="p-8 bg-gray-50/50 rounded-3xl border border-gray-100 text-gray-600 leading-relaxed text-sm font-medium">
                                {selectedReport.description}
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="glass-card p-5 flex items-center gap-4 border-white/40">
                                <div className="w-10 h-10 rounded-xl bg-primary/5 flex items-center justify-center text-primary">
                                    <Calendar className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Date Reported</p>
                                    <p className="text-xs font-black text-secondary">{new Date(selectedReport.createdAt).toLocaleDateString()}</p>
                                </div>
                            </div>
                            <div className="glass-card p-5 flex items-center gap-4 border-white/40">
                                <div className="w-10 h-10 rounded-xl bg-primary/5 flex items-center justify-center text-primary">
                                    <ShieldInfo className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Threat Model</p>
                                    <p className="text-xs font-black text-secondary">{selectedReport.type}</p>
                                </div>
                            </div>
                        </div>

                        <div className="p-6 bg-secondary/5 rounded-3xl border border-secondary/5">
                            <div className="flex items-center gap-2 mb-2">
                                <Clock className="w-4 h-4 text-primary" />
                                <h4 className="text-[10px] font-black text-secondary uppercase tracking-widest">Live Feedback</h4>
                            </div>
                            <p className="text-xs text-gray-500 font-medium leading-relaxed italic">
                                {selectedReport.status === 'OPEN' && "Your report has been received and is waiting for an analyst to begin investigation."}
                                {selectedReport.status === 'INVESTIGATING' && "A security analyst is currently reviewing this incident. We will update the status once resolved."}
                                {selectedReport.status === 'RESOLVED' && "This incident has been addressed and resolved. Thank you for helping keep the campus safe."}
                                {selectedReport.status === 'DISMISSED' && "This report was reviewed and dismissed. This can happen if it was a duplicate or not a security threat."}
                            </p>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};
