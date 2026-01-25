import { useEffect, useState } from 'react';
import axios from 'axios';
import { Input } from '../components/ui/Input';

interface Report {
    id: string;
    title: string;
    description: string;
    status: string;
    priority: string;
    type: string;
    createdAt: string;
}

import { ChatBot } from '../components/ChatBot';

export const IntelligenceDatabase = () => {
    const [reports, setReports] = useState<Report[]>([]);
    const [filteredReports, setFilteredReports] = useState<Report[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

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
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold">Intelligence Database</h1>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                    <div className="max-w-md">
                        <Input
                            placeholder="Search resolved incidents..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    {isLoading ? (
                        <div>Loading...</div>
                    ) : (
                        <div className="bg-white shadow overflow-hidden sm:rounded-md">
                            <ul role="list" className="divide-y divide-gray-200">
                                {filteredReports.map((report) => (
                                    <li key={report.id} className="px-4 py-4 sm:px-6 hover:bg-gray-50">
                                        <div className="flex items-center justify-between">
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between">
                                                    <p className="text-sm font-medium text-primary truncate">{report.title}</p>
                                                    <div className="ml-2 flex-shrink-0 flex">
                                                        <p className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                                            RESOLVED
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="mt-2">
                                                    <p className="text-sm text-gray-500 line-clamp-2">{report.description}</p>
                                                </div>
                                                <div className="mt-2 sm:flex sm:justify-between">
                                                    <div className="sm:flex">
                                                        <p className="flex items-center text-sm text-gray-500 mr-4">
                                                            {report.type}
                                                        </p>
                                                    </div>
                                                    <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                                                        <p>
                                                            {new Date(report.createdAt).toLocaleDateString()}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </li>
                                ))}
                                {filteredReports.length === 0 && (
                                    <li className="px-4 py-8 text-center text-gray-500">
                                        No resolved incidents found matching your search.
                                    </li>
                                )}
                            </ul>
                        </div>
                    )}
                </div>

                <div className="lg:col-span-1">
                    <ChatBot />
                </div>
            </div>
        </div>
    );
};
