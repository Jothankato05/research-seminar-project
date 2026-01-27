import { useEffect, useState } from 'react';
import axios from 'axios';
import { Input } from '../components/ui/Input';
import { Modal } from '../components/ui/Modal';
import { ChatBot } from '../components/ChatBot';
import {
    Search,
    BookOpen,
    ShieldCheck,
    ChevronRight,
    Calendar,
    Fingerprint,
    Hash
} from 'lucide-react';

interface Report {
    id: string;
    title: string;
    description: string;
    status: string;
    priority: string;
    type: string;
    createdAt: string;
}

export const IntelligenceDatabase = () => {
    const [reports, setReports] = useState<Report[]>([]);
    const [filteredReports, setFilteredReports] = useState<Report[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedReport, setSelectedReport] = useState<Report | null>(null);

    useEffect(() => {
        const fetchReports = async () => {
            try {
                // Fetch only RESOLVED reports
                const response = await axios.get('reports?status=RESOLVED&limit=100');
                setReports(response.data.data);
                setFilteredReports(response.data.data);
            } catch (error) {
                console.error('Failed to fetch reports', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchReports();
    }, []);

    useEffect(() => {
        const results = reports.filter(report =>
            report.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            report.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
            report.type.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setFilteredReports(results);
    }, [searchTerm, reports]);

    return (
        <div className="space-y-8 animate-in">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-4xl font-black text-secondary tracking-tight">
                        Intelligence <span className="text-gradient">Database</span>
                    </h1>
                    <p className="text-gray-500 mt-1 font-medium">Repository of resolved threats and mitigation strategies</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                <div className="lg:col-span-7 space-y-6">
                    <div className="relative group max-w-xl">
                        <Input
                            placeholder="Search threat bank..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-12 py-6 rounded-2xl glass-card border-gray-100 group-hover:border-primary/30 transition-all duration-500"
                        />
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-hover:text-primary transition-colors">
                            <Search className="w-6 h-6" />
                        </div>
                    </div>

                    {isLoading ? (
                        <div className="space-y-4">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="h-40 rounded-[2.5rem] bg-gray-100 animate-pulse"></div>
                            ))}
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {filteredReports.map((report, index) => (
                                <div
                                    key={report.id}
                                    onClick={() => setSelectedReport(report)}
                                    className="glass-card p-8 rounded-[2.5rem] hover-lift cursor-pointer group border-white/40"
                                    style={{ animationDelay: `${index * 50}ms` }}
                                >
                                    <div className="flex justify-between items-start mb-4">
                                        <h3 className="text-xl font-black text-secondary group-hover:text-primary transition-colors flex-1 pr-4">
                                            {report.title}
                                        </h3>
                                        <div className="flex gap-2">
                                            <span className="px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-100">
                                                RESOLVED
                                            </span>
                                        </div>
                                    </div>
                                    <p className="text-sm text-gray-500 font-medium line-clamp-2 mb-6 leading-relaxed">
                                        {report.description}
                                    </p>
                                    <div className="flex justify-between items-center text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                        <div className="flex items-center gap-4">
                                            <span className="flex items-center gap-1.5"><Hash className="w-3 h-3" /> {report.id.substring(0, 8)}</span>
                                            <span className="flex items-center gap-1.5"><Calendar className="w-3 h-3" /> {new Date(report.createdAt).toLocaleDateString()}</span>
                                        </div>
                                        <span className="group-hover:text-primary transition-colors flex items-center gap-1">
                                            Access File <ChevronRight className="w-3 h-3" />
                                        </span>
                                    </div>
                                </div>
                            ))}

                            {filteredReports.length === 0 && (
                                <div className="py-20 glass-card rounded-[2.5rem] text-center border-dashed border-2">
                                    <BookOpen className="w-12 h-12 text-gray-200 mx-auto mb-4" />
                                    <p className="text-gray-500 font-black uppercase tracking-widest text-[10px]">No records match your query</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <div className="lg:col-span-5 lg:sticky lg:top-28">
                    <ChatBot />
                </div>
            </div>

            {/* Intelligence Detail Modal */}
            <Modal
                isOpen={!!selectedReport}
                onClose={() => setSelectedReport(null)}
                title="Intelligence Clearance"
            >
                {selectedReport && (
                    <div className="space-y-8">
                        <div className="flex items-center justify-between">
                            <span className="px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-emerald-500/20 bg-emerald-50 text-emerald-600">
                                Verified Resolution
                            </span>
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest bg-gray-50 px-3 py-1 rounded-lg">
                                REF: {selectedReport.id.slice(0, 8)}
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
                                    <Fingerprint className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Classification</p>
                                    <p className="text-xs font-black text-secondary">{selectedReport.type}</p>
                                </div>
                            </div>
                            <div className="glass-card p-5 flex items-center gap-4 border-white/40">
                                <div className="w-10 h-10 rounded-xl bg-primary/5 flex items-center justify-center text-primary">
                                    <ShieldCheck className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Integrity Status</p>
                                    <p className="text-xs font-black text-secondary uppercase tracking-tight">System Validated</p>
                                </div>
                            </div>
                        </div>

                        <div className="p-6 bg-secondary/5 rounded-3xl border border-secondary/5">
                            <div className="flex items-center gap-2 mb-2">
                                <BookOpen className="w-4 h-4 text-primary" />
                                <h4 className="text-[10px] font-black text-secondary uppercase tracking-widest">Resolution Summary</h4>
                            </div>
                            <p className="text-xs text-gray-500 font-medium leading-relaxed">
                                This incident has been fully resolved and neutralized based on authorized security protocols. The intelligence gathered from this case is now used to fortify the Veritas defensive perimeter.
                            </p>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};
