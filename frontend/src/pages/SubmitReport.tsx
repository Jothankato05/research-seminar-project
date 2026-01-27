import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import axios from 'axios';

export const SubmitReport = () => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [type, setType] = useState('PHISHING');
    const [priority, setPriority] = useState('LOW');
    const [isAnonymous, setIsAnonymous] = useState(false);
    const [file, setFile] = useState<File | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            // 1. Create Report
            const reportResponse = await axios.post('reports', {
                title,
                description,
                type,
                priority,
                isAnonymous,
            });

            const reportId = reportResponse.data.id;

            // 2. Upload Evidence (if any)
            if (file) {
                const formData = new FormData();
                formData.append('file', file);
                await axios.post(`reports/${reportId}/evidence`, formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                });
            }

            navigate('/');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to submit report');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto space-y-8 animate-in">
            <div className="text-center">
                <h1 className="text-4xl font-black text-secondary tracking-tight">
                    Submit <span className="text-gradient">Threat Report</span>
                </h1>
                <p className="text-gray-500 mt-2 font-medium">Your reports help keep the Veritas community safe.</p>
            </div>

            <div className="glass-panel p-8 sm:p-12 rounded-[2rem] border-white/40 shadow-2xl">
                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="md:col-span-2">
                        <label className="block text-xs font-bold text-primary uppercase tracking-[0.2em] mb-2 ml-1 opacity-70">Incident Title</label>
                        <Input
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="e.g., Suspicious phishing email from 'IT Support'"
                            required
                            className="py-6 px-4 rounded-xl border-gray-100 hover:border-primary/20 transition-all text-base font-medium"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="block text-xs font-bold text-primary uppercase tracking-[0.2em] mb-2 ml-1 opacity-70">Threat Category</label>
                        <select
                            className="flex h-12 w-full rounded-xl border border-gray-100 bg-white px-4 py-2 text-sm font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus:border-primary transition-all appearance-none cursor-pointer"
                            value={type}
                            onChange={(e) => setType(e.target.value)}
                        >
                            <option value="PHISHING">Phishing</option>
                            <option value="MALWARE">Malware</option>
                            <option value="HARASSMENT">Harassment</option>
                            <option value="DATA_LEAK">Data Leak</option>
                            <option value="OTHER">Other</option>
                        </select>
                    </div>

                    <div className="space-y-2">
                        <label className="block text-xs font-bold text-primary uppercase tracking-[0.2em] mb-2 ml-1 opacity-70">Urgency Level</label>
                        <select
                            className="flex h-12 w-full rounded-xl border border-gray-100 bg-white px-4 py-2 text-sm font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus:border-primary transition-all appearance-none cursor-pointer"
                            value={priority}
                            onChange={(e) => setPriority(e.target.value)}
                        >
                            <option value="LOW">Low - Routine Concern</option>
                            <option value="MEDIUM">Medium - Urgent Review</option>
                            <option value="HIGH">High - Immediate Threat</option>
                            <option value="CRITICAL">Critical - Active Breach</option>
                        </select>
                    </div>

                    <div className="md:col-span-2">
                        <label className="block text-xs font-bold text-primary uppercase tracking-[0.2em] mb-2 ml-1 opacity-70">Detailed Description</label>
                        <textarea
                            className="flex min-h-[160px] w-full rounded-2xl border border-gray-100 bg-white px-4 py-4 text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus:border-primary transition-all leading-relaxed"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Please provide as much context as possible (links, sender addresses, timestamps)..."
                            required
                        />
                    </div>

                    <div className="md:col-span-2">
                        <label className="block text-xs font-bold text-primary uppercase tracking-[0.2em] mb-3 ml-1 opacity-70">Digital Evidence (Optional)</label>
                        <div className="flex items-center justify-center w-full px-6 py-8 border-2 border-dashed border-gray-200 rounded-2xl hover:border-primary/30 transition-colors bg-gray-50/50">
                            <label className="flex flex-col items-center cursor-pointer group">
                                <svg className="w-10 h-10 text-gray-300 group-hover:text-primary transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                                </svg>
                                <span className="mt-2 text-sm font-bold text-gray-500 group-hover:text-primary">
                                    {file ? file.name : "Click to upload screenshot or log file"}
                                </span>
                                <input
                                    type="file"
                                    className="hidden"
                                    onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)}
                                    accept=".jpg,.jpeg,.png,.pdf,.doc,.docx"
                                />
                            </label>
                        </div>
                    </div>

                    <div className="md:col-span-2 flex items-center justify-between bg-primary/5 p-4 rounded-xl border border-primary/10">
                        <div className="flex items-center gap-3">
                            <input
                                type="checkbox"
                                id="anonymous"
                                className="h-5 w-5 rounded border-gray-300 text-primary focus:ring-primary transition-all cursor-pointer"
                                checked={isAnonymous}
                                onChange={(e) => setIsAnonymous(e.target.checked)}
                            />
                            <div>
                                <label htmlFor="anonymous" className="text-sm font-bold text-secondary cursor-pointer">Submit anonymously</label>
                                <p className="text-[10px] text-gray-400 font-medium">Your identity will be hidden from security analysts.</p>
                            </div>
                        </div>
                    </div>

                    {error && (
                        <div className="md:col-span-2 p-4 bg-red-50 border border-red-100 rounded-xl flex items-center gap-3 text-red-600 animate-in">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span className="text-sm font-bold">{error}</span>
                        </div>
                    )}

                    <div className="md:col-span-2 pt-4">
                        <Button
                            type="submit"
                            isLoading={isLoading}
                            className="w-full py-4 text-base font-black uppercase tracking-widest rounded-xl shadow-xl shadow-primary/20"
                        >
                            Deploy Intelligence Report
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};
