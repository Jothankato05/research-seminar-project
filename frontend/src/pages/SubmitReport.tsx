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
        <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow">
            <h1 className="text-2xl font-bold mb-6">Submit Cyber Threat Report</h1>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                    <Input
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Brief title of the incident"
                        required
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                    <select
                        className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
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

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Priority (Self-assessed)</label>
                    <select
                        className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                        value={priority}
                        onChange={(e) => setPriority(e.target.value)}
                    >
                        <option value="LOW">Low</option>
                        <option value="MEDIUM">Medium</option>
                        <option value="HIGH">High</option>
                        <option value="CRITICAL">Critical</option>
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <textarea
                        className="flex min-h-[100px] w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Detailed description of what happened..."
                        required
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Evidence (Optional)</label>
                    <Input
                        type="file"
                        onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)}
                        accept=".jpg,.jpeg,.png,.pdf,.doc,.docx"
                    />
                    <p className="text-xs text-gray-500 mt-1">Max 10MB. Images or documents.</p>
                </div>

                <div className="flex items-center space-x-2">
                    <input
                        type="checkbox"
                        id="anonymous"
                        className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                        checked={isAnonymous}
                        onChange={(e) => setIsAnonymous(e.target.checked)}
                    />
                    <label htmlFor="anonymous" className="text-sm font-medium text-gray-700">Submit Anonymously</label>
                </div>

                {error && (
                    <div className="text-sm text-red-600">
                        {error}
                    </div>
                )}

                <div className="flex justify-end">
                    <Button type="submit" isLoading={isLoading}>
                        Submit Report
                    </Button>
                </div>
            </form>
        </div>
    );
};
